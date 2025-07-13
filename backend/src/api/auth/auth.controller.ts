import { Request, Response } from 'express';
import pool from '../../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import logger from '../../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // ¡Cambia esto en producción!

// Función de validación de complejidad de contraseña
const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe contener al menos una letra mayúscula.';
  }
  if (!/[a-z]/.test(password)) {
    return 'La contraseña debe contener al menos una letra minúscula.';
  }
  if (!/[0-9]/.test(password)) {
    return 'La contraseña debe contener al menos un número.';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'La contraseña debe contener al menos un carácter especial.';
  }
  return null; // La contraseña es válida
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, confirmPassword } = req.body;

  // 1. Validación de Entrada
  if (!email || !password || !confirmPassword) {
    logger.warn(`Intento de registro fallido: Datos incompletos para ${email}`);
    res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    return;
  }

  if (password !== confirmPassword) {
    logger.warn(`Intento de registro fallido: Contraseñas no coinciden para ${email}`);
    res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    return;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    logger.warn(`Intento de registro fallido: Contraseña débil para ${email} - ${passwordError}`);
    res.status(400).json({ error: passwordError });
    return;
  }

  try {
    const client = await pool.connect();

    // 2. Verificación de Unicidad
    const userExists = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      client.release();
      logger.warn(`Intento de registro fallido: Correo ya registrado - ${email}`);
      res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
      return;
    }

    // 3. Hashing de Contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Generación de Token de Verificación
    const verificationToken = uuidv4();
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // 5. Almacenamiento de Usuario
    const newUser = await client.query(
      'INSERT INTO users (email, password_hash, verification_token, verification_token_expires_at) VALUES ($1, $2, $3, $4) RETURNING id, email, role, status',
      [email, passwordHash, verificationToken, verificationTokenExpiresAt]
    );

    client.release();

    // 6. Envío de Correo de Verificación (Simulado por ahora)
    logger.info(`Usuario registrado exitosamente: ${email}. Token de verificación: ${verificationToken}`);
    console.log(`Enviar email de verificación a ${email} con el token: ${verificationToken}`);

    res.status(201).json({ message: 'Registro exitoso. Por favor, verifica tu correo electrónico.' });
    return;

  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error en el registro de ${email}: ${error.message}`, error);
    } else {
      logger.error(`Error desconocido en el registro de ${email}: ${error}`, error);
    }
    res.status(500).json({ error: 'Error interno del servidor.' });
    return;
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const ip = req.ip;

  // 1. Validación de Entrada
  if (!email || !password) {
    logger.warn(`Intento de login fallido (datos incompletos) para ${email} desde IP: ${ip}`);
    res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
    return;
  }

  try {
    const client = await pool.connect();

    // 2. Búsqueda de Usuario
    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      client.release();
      logger.warn(`Intento de login fallido (usuario no encontrado) para ${email} desde IP: ${ip}`);
      res.status(401).json({ error: 'Credenciales inválidas.' });
      return;
    }

    // 3. Verificación de Contraseña
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      client.release();
      logger.warn(`Intento de login fallido (contraseña incorrecta) para ${email} desde IP: ${ip}`);
      res.status(401).json({ error: 'Credenciales inválidas.' });
      return;
    }

    // 4. Verificación de Estado de Cuenta
    if (user.status !== 'active') {
      client.release();
      logger.warn(`Intento de login fallido (cuenta no activa) para ${email} desde IP: ${ip}`);
      res.status(401).json({ error: 'Cuenta no verificada. Por favor, revisa tu correo.' });
      return;
    }

    // 5. Generación de JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expira en 1 hora
    );

    client.release();

    logger.info(`Login exitoso para el usuario: ${email} desde IP: ${ip}`);
    res.status(200).json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
    return;

  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error en el login de ${email} desde IP: ${ip}: ${error.message}`, error);
    } else {
      logger.error(`Error desconocido en el login de ${email} desde IP: ${ip}: ${error}`, error);
    }
    res.status(500).json({ error: 'Error interno del servidor.' });
    return;
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  if (!token) {
    logger.warn('Intento de verificación de email fallido: Token no proporcionado.');
    res.status(400).json({ error: 'Token de verificación no proporcionado.' });
    return;
  }

  try {
    const client = await pool.connect();

    const userResult = await client.query(
      'SELECT * FROM users WHERE verification_token = $1',
      [token]
    );
    const user = userResult.rows[0];

    if (!user) {
      client.release();
      logger.warn(`Intento de verificación de email fallido: Token inválido - ${token}`);
      res.status(400).json({ error: 'Token de verificación inválido.' });
      return;
    }

    if (user.verification_token_expires_at < new Date()) {
      client.release();
      logger.warn(`Intento de verificación de email fallido: Token expirado para ${user.email}`);
      res.status(400).json({ error: 'Token de verificación expirado.' });
      return;
    }

    await client.query(
      'UPDATE users SET status = $1, verification_token = NULL, verification_token_expires_at = NULL WHERE id = $2',
      ['active', user.id]
    );

    client.release();

    logger.info(`Cuenta verificada exitosamente para el usuario: ${user.email}`);
    res.status(200).json({ message: 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.' });
    return;

  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error en la verificación de email para el token ${token}: ${error.message}`, error);
    } else {
      logger.error(`Error desconocido en la verificación de email para el token ${token}: ${error}`, error);
    }
    res.status(500).json({ error: 'Error interno del servidor.' });
    return;
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    logger.warn('Intento de solicitud de restablecimiento de contraseña fallido: Email no proporcionado.');
    res.status(400).json({ error: 'El email es obligatorio.' });
    return;
  }

  try {
    const client = await pool.connect();

    const userResult = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (user) {
      const resetToken = uuidv4();
      const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await client.query(
        'UPDATE users SET reset_password_token = $1, reset_password_expires_at = $2 WHERE id = $3',
        [resetToken, resetTokenExpiresAt, user.id]
      );

      // TODO: Enviar email con el enlace de restablecimiento
      logger.info(`Solicitud de restablecimiento de contraseña para ${email}. Token: ${resetToken}`);
      console.log(`Enviar email de restablecimiento a ${email} con el token: ${resetToken}`);
    } else {
      logger.warn(`Solicitud de restablecimiento de contraseña para email no registrado: ${email}`);
    }

    client.release();

    // Mensaje genérico por seguridad
    res.status(200).json({ message: 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.' });
    return;

  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error en la solicitud de restablecimiento de contraseña para ${email}: ${error.message}`, error);
    } else {
      logger.error(`Error desconocido en la solicitud de restablecimiento de contraseña para ${email}: ${error}`, error);
    }
    res.status(500).json({ error: 'Error interno del servidor.' });
    return;
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword, confirmNewPassword } = req.body;

  if (!token || !newPassword || !confirmNewPassword) {
    logger.warn('Intento de restablecimiento de contraseña fallido: Datos incompletos.');
    res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    return;
  }

  if (newPassword !== confirmNewPassword) {
    logger.warn('Intento de restablecimiento de contraseña fallido: Las contraseñas no coinciden.');
    res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    return;
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    logger.warn(`Intento de restablecimiento de contraseña fallido: Contraseña débil - ${passwordError}`);
    res.status(400).json({ error: passwordError });
    return;
  }

  try {
    const client = await pool.connect();

    const userResult = await client.query(
      'SELECT * FROM users WHERE reset_password_token = $1',
      [token]
    );
    const user = userResult.rows[0];

    if (!user || user.reset_password_expires_at < new Date()) {
      client.release();
      logger.warn(`Intento de restablecimiento de contraseña fallido: Token inválido o expirado para el token ${token}`);
      res.status(400).json({ error: 'Token inválido o expirado.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await client.query(
      'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires_at = NULL WHERE id = $2',
      [passwordHash, user.id]
    );

    client.release();

    logger.info(`Contraseña restablecida exitosamente para el usuario: ${user.email}`);
    res.status(200).json({ message: 'Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión.' });
    return;

  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error en el restablecimiento de contraseña para el token ${token}: ${error.message}`, error);
    } else {
      logger.error(`Error desconocido en el restablecimiento de contraseña para el token ${token}: ${error}`, error);
    }
    res.status(500).json({ error: 'Error interno del servidor.' });
    return;
  }
};
