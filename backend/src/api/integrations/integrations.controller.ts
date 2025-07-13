import { Request, Response } from 'express';
import pool from '../../config/database';
import logger from '../../config/logger';
import axios from 'axios';
import { encrypt, decrypt } from './integrations.utils';
import crypto from 'crypto';

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY || 'your_shopify_api_key';
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET || 'your_shopify_api_secret';
const APP_URL = process.env.APP_URL || 'http://localhost:3001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const subscribeToShopifyWebhooks = async (storeUrl: string, accessToken: string) => {
  const webhookUrl = `${APP_URL}/api/integrations/shopify/webhook`;
  const webhookTopic = 'orders/create';

  try {
    const response = await axios.post(
      `https://${storeUrl}/admin/api/2023-10/webhooks.json`,
      {
        webhook: {
          topic: webhookTopic,
          address: webhookUrl,
          format: 'json',
        },
      },
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );
    logger.info(`Suscripción a webhook ${webhookTopic} exitosa para la tienda ${storeUrl}`);
  } catch (error) {
    logger.error(`Error al suscribirse al webhook ${webhookTopic} para la tienda ${storeUrl}: ${error}`);
    // Opcional: manejar el error, por ejemplo, marcando la integración con una advertencia.
  }
};

export const connectShopify = async (req: Request, res: Response) => {
  const { store_url } = req.body;
  const userId = req.user?.id;

  if (!store_url) {
    res.status(400).json({ error: 'La URL de la tienda es obligatoria.' });
    return;
  }
  if (!userId) {
    res.status(401).json({ error: 'Usuario no autenticado.' });
  }

  try {
    const client = await pool.connect();
    // Pre-create the integration to indicate a pending connection
    await client.query(
      `INSERT INTO integrations (user_id, type, store_url, status)
       VALUES ($1, 'shopify', $2, 'pending')
       ON CONFLICT (user_id, type) DO UPDATE 
       SET store_url = $2, status = 'pending', updated_at = CURRENT_TIMESTAMP;`,
      [userId, store_url]
    );
    client.release();

    const scopes = 'read_products,read_inventory,read_orders';
    const redirectUri = `${APP_URL}/api/integrations/shopify/callback`;
    const state = userId; // Use user ID as state for verification
    const authUrl = `https://${store_url}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;

    res.status(200).json({ authUrl });
    return;
  } catch (error) {
    logger.error(`Error al iniciar la conexión con Shopify para el usuario ${userId}: ${error}`);
    res.status(500).json({ error: 'Error interno del servidor.' });
    return;
  }
};

export const shopifyCallback = async (req: Request, res: Response) => {
  const { code, shop, state } = req.query;
  const userId = state as string;

  if (!code || !shop || !userId) {
    logger.error('Callback de Shopify inválido: faltan parámetros.', { query: req.query });
    res.redirect(`${FRONTEND_URL}/dashboard/integrations?error=invalid_callback`);
    return;
  }

  const accessTokenUrl = `https://${shop}/admin/oauth/access_token`;
  const payload = {
    client_id: SHOPIFY_API_KEY,
    client_secret: SHOPIFY_API_SECRET,
    code,
  };

  const client = await pool.connect();
  try {
    const response = await axios.post(accessTokenUrl, payload);
    const accessToken = response.data.access_token;

    if (!accessToken) {
      throw new Error('No se recibió el access token de Shopify.');
    }

    const encryptedAccessToken = encrypt(accessToken);

    await client.query(
      'UPDATE integrations SET access_token = $1, status = $2, updated_at = CURRENT_TIMESTAMP, error_message = NULL WHERE user_id = $3 AND type = $4',
      [encryptedAccessToken, 'connected', userId, 'shopify']
    );

    logger.info(`Integración con Shopify conectada exitosamente para el usuario ${userId}`);
    await subscribeToShopifyWebhooks(shop as string, accessToken);

    res.redirect(`${FRONTEND_URL}/dashboard/integrations?success=shopify_connected`);
    return;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido durante el callback de Shopify';
    logger.error(`Error en el callback de Shopify para el usuario ${userId}: ${errorMessage}`, { error });

    await client.query(
      'UPDATE integrations SET status = $1, error_message = $2, updated_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND type = $4',
      ['error', errorMessage, userId, 'shopify']
    );

    res.redirect(`${FRONTEND_URL}/dashboard/integrations?error=shopify_connection_failed`);
    return;
  } finally {
    client.release();
  }
};

export const shopifyWebhook = async (req: Request, res: Response) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const shopDomain = req.get('X-Shopify-Shop-Domain');
  const data = req.body;

  if (!hmac || !shopDomain) {
    logger.warn('Webhook de Shopify recibido sin hmac o shopDomain.');
    return res.status(400).send('Webhook inválido.');
  }

  try {
    const generatedHash = crypto
      .createHmac('sha256', SHOPIFY_API_SECRET)
      .update(data, 'utf8')
      .digest('base64');

    if (generatedHash !== hmac) {
      logger.warn(`Firma de webhook de Shopify inválida para la tienda ${shopDomain}.`);
      return res.status(401).send('Firma de webhook inválida.');
    }

    // Firma validada, procesar el pedido
    const order = JSON.parse(data.toString());
    logger.info(`Webhook de orden recibido de ${shopDomain}`, { orderId: order.id });

    const client = await pool.connect();
    try {
      const integrationRes = await client.query('SELECT user_id FROM integrations WHERE store_url = $1 AND type = \'shopify\'', [shopDomain]);
      const userId = integrationRes.rows[0]?.user_id;

      if (!userId) {
        throw new Error(`No se encontró una integración activa para la tienda ${shopDomain}`);
      }

      for (const item of order.line_items) {
        const { sku, quantity } = item;
        if (!sku) {
          logger.warn(`Item sin SKU en la orden ${order.id} de la tienda ${shopDomain}.`, { item });
          continue; // Omitir items sin SKU
        }

        // Encontrar el producto y la ubicación
        const productRes = await client.query('SELECT id FROM products WHERE sku = $1 AND user_id = $2', [sku, userId]);
        const productId = productRes.rows[0]?.id;

        if (!productId) {
          logger.error(`SKU no encontrado en la base de datos local: ${sku} para el usuario ${userId}`);
          await client.query(
            'UPDATE integrations SET error_message = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND type = \'shopify\'',
            [`SKU no encontrado: ${sku}`, userId]
          );
          continue;
        }

        // Asumimos la primera ubicación encontrada para este producto.
        // Una mejora sería tener una ubicación por defecto para e-commerce.
        const stockLevelRes = await client.query('SELECT id, location_id, quantity FROM stock_levels WHERE product_id = $1 ORDER BY updated_at ASC LIMIT 1', [productId]);
        const stockLevel = stockLevelRes.rows[0];

        if (!stockLevel) {
          logger.error(`No se encontró nivel de stock para el producto con SKU ${sku} (ID: ${productId})`);
          continue;
        }

        const newQuantity = stockLevel.quantity - quantity;

        // Actualizar nivel de stock y registrar movimiento
        await client.query('UPDATE stock_levels SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newQuantity, stockLevel.id]);
        await client.query(
          'INSERT INTO stock_movements (product_id, location_id, user_id, type, quantity, notes) VALUES ($1, $2, $3, $4, $5, $6)',
          [productId, stockLevel.location_id, userId, 'ecommerce_out', -quantity, `Venta de Shopify - Orden #${order.order_number}`]
        );

        logger.info(`Stock actualizado para SKU ${sku}: ${stockLevel.quantity} -> ${newQuantity}`);
      }

      await client.query('UPDATE integrations SET last_sync_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND type = \'shopify\'', [userId]);

    } finally {
      client.release();
    }

    res.status(200).send('Webhook procesado.');
    return;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido procesando el webhook de Shopify';
    logger.error(`Error al procesar webhook de Shopify para ${shopDomain}: ${errorMessage}`, { error });
    res.status(500).send('Error interno del servidor.');
    return;
  }
};

export const connectWooCommerce = async (req: Request, res: Response) => {
  const { store_url, api_key_public, api_key_secret } = req.body;
  const userId = req.user?.id;

  if (!store_url || !api_key_public || !api_key_secret) {
    res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }
  if (!userId) {
    res.status(401).json({ error: 'Usuario no autenticado.' });
  }

  const client = await pool.connect();
  try {
    // Validar credenciales con una llamada de prueba
    await axios.get(`${store_url}/wp-json/wc/v3/system_status`, {
      auth: {
        username: api_key_public,
        password: api_key_secret,
      },
    });

    const encryptedSecret = encrypt(api_key_secret);

    await client.query(
      `INSERT INTO integrations (user_id, type, store_url, api_key_public, api_key_secret, status, error_message)
       VALUES ($1, 'woocommerce', $2, $3, $4, 'connected', NULL)
       ON CONFLICT (user_id, type) DO UPDATE 
       SET store_url = $2, api_key_public = $3, api_key_secret = $4, status = 'connected', error_message = NULL, updated_at = CURRENT_TIMESTAMP;`,
      [userId, store_url, api_key_public, encryptedSecret]
    );

    logger.info(`Integración con WooCommerce conectada exitosamente para el usuario ${userId}`);
    res.status(200).json({ message: 'Integración con WooCommerce conectada exitosamente.' });
    return;

  } catch (error) {
    const errorMessage = 'Credenciales de WooCommerce inválidas o la tienda no está accesible.';
    logger.error(`Error al conectar con WooCommerce para el usuario ${userId}: ${error}`);
    
    // Guardar el estado de error en la base de datos
    await client.query(
      `INSERT INTO integrations (user_id, type, store_url, status, error_message)
       VALUES ($1, 'woocommerce', $2, 'error', $3)
       ON CONFLICT (user_id, type) DO UPDATE 
       SET status = 'error', error_message = $3, updated_at = CURRENT_TIMESTAMP;`,
      [userId, store_url, errorMessage]
    );

    res.status(401).json({ error: errorMessage });
    return;
  } finally {
    client.release();
  }
};

export const getIntegrationsStatus = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: 'Usuario no autenticado.' });
  }

  try {
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, type, store_url, status, last_sync_at, error_message FROM integrations WHERE user_id = $1',
      [userId]
    );
    client.release();

    res.status(200).json(result.rows);
  } catch (error) {
    logger.error(`Error al obtener el estado de las integraciones para el usuario ${userId}: ${error}`);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
