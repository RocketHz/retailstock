import { Request, Response, NextFunction, RequestHandler } from 'express';
import pool from '../../config/database';

export const getLowStockAlerts: RequestHandler = async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT
         p.id, p.name, p.sku, p.min_stock_threshold,
         COALESCE(sl.quantity, 0) as current_stock,
         l.name as location_name
       FROM products p
       JOIN stock_levels sl ON p.id = sl.product_id
       JOIN locations l ON sl.location_id = l.id
       WHERE p.user_id = $1 AND sl.quantity <= p.min_stock_threshold AND p.min_stock_threshold IS NOT NULL
       ORDER BY p.name, l.name`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    next(error);
  } finally {
    client.release();
  }
};

export const getOutOfStockAlerts: RequestHandler = async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT
         p.id, p.name, p.sku,
         COALESCE(sl.quantity, 0) as current_stock,
         l.name as location_name
       FROM products p
       JOIN stock_levels sl ON p.id = sl.product_id
       JOIN locations l ON sl.location_id = l.id
       WHERE p.user_id = $1 AND sl.quantity = 0
       ORDER BY p.name, l.name`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching out of stock alerts:', error);
    next(error);
  } finally {
    client.release();
  }
};
