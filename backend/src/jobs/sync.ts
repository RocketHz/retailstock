import cron from 'node-cron';
import pool from '../config/database';
import logger from '../config/logger';
import axios from 'axios';
import { decrypt } from '../api/integrations/integrations.utils';

const syncWooCommerceOrders = async () => {
  logger.info('Iniciando trabajo de sincronización de órdenes de WooCommerce...');
  const client = await pool.connect();

  try {
    const integrationsRes = await client.query(
      "SELECT * FROM integrations WHERE type = 'woocommerce' AND status = 'connected'"
    );

    for (const integration of integrationsRes.rows) {
      const { id, user_id, store_url, api_key_public, api_key_secret, last_sync_at } = integration;
      const decryptedSecret = decrypt(api_key_secret);

      try {
        const params: any = { per_page: 100 };
        if (last_sync_at) {
          params.after = new Date(last_sync_at).toISOString();
        }

        const response = await axios.get(`${store_url}/wp-json/wc/v3/orders`,
          {
            auth: {
              username: api_key_public,
              password: decryptedSecret,
            },
            params,
          }
        );

        const orders = response.data;
        if (orders.length === 0) {
          logger.info(`No hay nuevas órdenes para sincronizar en la tienda ${store_url}`);
          continue;
        }

        logger.info(`Se encontraron ${orders.length} nuevas órdenes para la tienda ${store_url}`);

        for (const order of orders) {
          for (const item of order.line_items) {
            const { sku, quantity } = item;
            if (!sku) {
              logger.warn(`Item sin SKU en la orden ${order.id} de WooCommerce.`, { item });
              continue;
            }

            const productRes = await client.query('SELECT id FROM products WHERE sku = $1 AND user_id = $2', [sku, user_id]);
            const productId = productRes.rows[0]?.id;

            if (!productId) {
              logger.error(`SKU no encontrado en la base de datos local: ${sku} para el usuario ${user_id}`);
              await client.query(
                'UPDATE integrations SET error_message = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [`SKU no encontrado: ${sku}`, id]
              );
              continue;
            }

            const stockLevelRes = await client.query('SELECT id, location_id, quantity FROM stock_levels WHERE product_id = $1 ORDER BY updated_at ASC LIMIT 1', [productId]);
            const stockLevel = stockLevelRes.rows[0];

            if (!stockLevel) {
              logger.error(`No se encontró nivel de stock para el producto con SKU ${sku} (ID: ${productId})`);
              continue;
            }

            const newQuantity = stockLevel.quantity - quantity;

            await client.query('UPDATE stock_levels SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newQuantity, stockLevel.id]);
            await client.query(
              'INSERT INTO stock_movements (product_id, location_id, user_id, type, quantity, notes) VALUES ($1, $2, $3, $4, $5, $6)',
              [productId, stockLevel.location_id, user_id, 'ecommerce_out', -quantity, `Venta de WooCommerce - Orden #${order.number}`]
            );

            logger.info(`Stock actualizado para SKU ${sku}: ${stockLevel.quantity} -> ${newQuantity}`);
          }
        }

        await client.query('UPDATE integrations SET last_sync_at = CURRENT_TIMESTAMP, error_message = NULL WHERE id = $1', [id]);

      } catch (error) {
        const errorMessage = `Error sincronizando la tienda ${store_url}: ${error}`;
        logger.error(errorMessage);
        await client.query('UPDATE integrations SET status = $1, error_message = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3', ['error', errorMessage, id]);
      }
    }
  } finally {
    client.release();
    logger.info('Trabajo de sincronización de WooCommerce finalizado.');
  }
};

// Ejecutar cada 15 minutos
cron.schedule('*/15 * * * *', syncWooCommerceOrders);

export const startSyncJobs = () => {
  logger.info('Iniciando los trabajos de sincronización programados...');
  syncWooCommerceOrders(); // Ejecutar una vez al iniciar
};
