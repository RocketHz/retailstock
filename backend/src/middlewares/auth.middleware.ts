import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log('Authenticating token for:', req.method, req.url);
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('No token provided.');
    res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
    return Promise.resolve(); // Explicitly return a resolved Promise
  }

  return new Promise((resolve) => {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.log('Invalid or expired token.', err.message);
        res.status(403).json({ error: 'Token inválido o expirado.' });
        resolve(); // Resolve the Promise after sending response
        return;
      }
      req.user = user as UserPayload;
      console.log('Token authenticated for user:', req.user.email);
      next();
      resolve(); // Resolve the Promise after calling next()
    });
  });
};

export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('Authorizing roles for:', req.method, req.url, 'User:', req.user?.email, 'Required roles:', roles);
    if (!req.user) {
      console.log('User not authenticated for role authorization.');
      res.status(401).json({ error: 'No autenticado.' });
      return Promise.resolve();
    }

    if (!roles.includes(req.user.role)) {
      console.log('User role not authorized.', req.user.role);
      res.status(403).json({ error: 'Acceso denegado. No tienes los permisos necesarios.' });
      return Promise.resolve();
    }
    // console.log('User authorized.');
    next();
    return Promise.resolve();
  };
};