import { Request, Response, NextFunction, RequestHandler } from 'express';
import pool from '../../config/database';

export const getDashboardSummary: RequestHandler = async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const client = await pool.connect();

  try {
    // Total SKUs activos
    const totalSkusResult = await client.query(
      'SELECT COUNT(id) FROM products WHERE user_id = $1',
      [userId]
    );
    const totalSkus = parseInt(totalSkusResult.rows[0].count, 10);

    // Productos en bajo stock (quantity <= min_stock_threshold)
    const lowStockResult = await client.query(
      `SELECT COUNT(p.id)
       FROM products p
       JOIN stock_levels sl ON p.id = sl.product_id
       WHERE p.user_id = $1 AND sl.quantity <= p.min_stock_threshold AND p.min_stock_threshold IS NOT NULL`,
      [userId]
    );
    const lowStockProducts = parseInt(lowStockResult.rows[0].count, 10);

    // Productos desabastecidos (quantity = 0)
    const outOfStockResult = await client.query(
      `SELECT COUNT(p.id)
       FROM products p
       JOIN stock_levels sl ON p.id = sl.product_id
       WHERE p.user_id = $1 AND sl.quantity = 0`,
      [userId]
    );
    const outOfStockProducts = parseInt(outOfStockResult.rows[0].count, 10);

    // Datos agregados sobre movimientos de stock (más vendidos)
    const topSellingProductsResult = await client.query(
      `SELECT
         p.id, p.name, SUM(sm.quantity) AS total_quantity_out
       FROM stock_movements sm
       JOIN products p ON sm.product_id = p.id
       WHERE sm.user_id = $1 AND sm.type = 'out'
       GROUP BY p.id, p.name
       ORDER BY total_quantity_out DESC
       LIMIT 5`,
      [userId]
    );
    const topSellingProducts = topSellingProductsResult.rows;

    // Datos agregados sobre movimientos de stock (menos vendidos)
    const leastSellingProductsResult = await client.query(
      `SELECT
         p.id, p.name, SUM(sm.quantity) AS total_quantity_out
       FROM stock_movements sm
       JOIN products p ON sm.product_id = p.id
       WHERE sm.user_id = $1 AND sm.type = 'out'
       GROUP BY p.id, p.name
       ORDER BY total_quantity_out ASC
       LIMIT 5`,
      [userId]
    );
    const leastSellingProducts = leastSellingProductsResult.rows;

    res.status(200).json({
      totalSkus,
      lowStockProducts,
      outOfStockProducts,
      topSellingProducts,
      leastSellingProducts,
    });

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    next(error);
  } finally {
    client.release();
  }
};
