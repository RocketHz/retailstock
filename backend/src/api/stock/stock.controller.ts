import { Request, Response, NextFunction, RequestHandler } from 'express';
import pool from '../../config/database';

// POST /api/stock-movements - Register stock movement
export const addStockMovement: RequestHandler = async (req, res, next) => {
  const { productId, locationId, type, quantity, notes } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (!productId || !locationId || !type || quantity === undefined || typeof quantity !== 'number' || quantity <= 0) {
    res.status(400).json({ message: 'Missing required fields or invalid quantity' });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verify product and location belong to the user
    const productCheck = await client.query(
      'SELECT id FROM products WHERE id = $1 AND user_id = $2',
      [productId, userId]
    );
    if (productCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ message: 'Product not found or not authorized' });
      return;
    }

    const locationCheck = await client.query(
      'SELECT id FROM locations WHERE id = $1 AND user_id = $2',
      [locationId, userId]
    );
    if (locationCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ message: 'Location not found or not authorized' });
      return;
    }

    // Update stock level based on movement type
    let newQuantity;
    const currentStockResult = await client.query(
      'SELECT quantity FROM stock_levels WHERE product_id = $1 AND location_id = $2',
      [productId, locationId]
    );
    const currentQuantity = currentStockResult.rows[0]?.quantity || 0;

    if (type === 'in') {
      newQuantity = currentQuantity + quantity;
    } else if (type === 'out') {
      newQuantity = currentQuantity - quantity;
      if (newQuantity < 0) {
        await client.query('ROLLBACK');
        res.status(400).json({ message: 'Insufficient stock for this movement' });
        return;
      }
    } else {
      await client.query('ROLLBACK');
      res.status(400).json({ message: 'Invalid movement type. Must be \'in\' or \'out\'.' });
      return;
    }

    await client.query(
      'INSERT INTO stock_levels (product_id, location_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (product_id, location_id) DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP;',
      [productId, locationId, newQuantity]
    );

    // Record stock movement
    const movementResult = await client.query(
      'INSERT INTO stock_movements (product_id, location_id, user_id, type, quantity, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
      [productId, locationId, userId, type, quantity, notes]
    );

    await client.query('COMMIT');

    res.status(201).json({ message: 'Stock movement registered successfully', movement: movementResult.rows[0] });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error in addStockMovement:', error);
    next(error);
  } finally {
    client.release();
  }
};

// PUT /api/stock-levels/:product_id/:location_id - Adjust stock level
export const adjustStockLevel: RequestHandler = async (req, res, next) => {
  const { product_id, location_id, quantity } = req.body;
  const userId = req.user?.id;

  console.log('Adjust Stock Request Body:', req.body);
  console.log('User ID:', userId);

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
    res.status(400).json({ message: 'Quantity must be a non-negative number' });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('AdjustStockLevel: Transaction started.');

    // Verify product and location belong to the user
    const productCheck = await client.query(
      'SELECT id FROM products WHERE id = $1 AND user_id = $2',
      [product_id, userId]
    );
    console.log('AdjustStockLevel: Product check result:', productCheck.rows);
    if (productCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      console.log('AdjustStockLevel: Product not found or not authorized, rolling back.');
      res.status(404).json({ message: 'Product not found or not authorized' });
      return;
    }

    const locationCheck = await client.query(
      'SELECT id FROM locations WHERE id = $1 AND user_id = $2',
      [location_id, userId]
    );
    console.log('AdjustStockLevel: Location check result:', locationCheck.rows);
    if (locationCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      console.log('AdjustStockLevel: Location not found or not authorized, rolling back.');
      res.status(404).json({ message: 'Location not found or not authorized' });
      return;
    }

    // Get current quantity for movement tracking
    const currentStockResult = await client.query(
      'SELECT quantity FROM stock_levels WHERE product_id = $1 AND location_id = $2',
      [product_id, location_id]
    );
    const currentQuantity = currentStockResult.rows[0]?.quantity || 0;
    console.log('AdjustStockLevel: Current stock result:', currentStockResult.rows);
    console.log('AdjustStockLevel: Current quantity:', currentQuantity);
    const quantityChange = quantity - currentQuantity;
    console.log('AdjustStockLevel: Quantity change:', quantityChange);

    // Update stock level
    const stockLevelResult = await client.query(
      'INSERT INTO stock_levels (product_id, location_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (product_id, location_id) DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = CURRENT_TIMESTAMP RETURNING *;',
      [product_id, location_id, quantity]
    );
    console.log('AdjustStockLevel: Stock level update result:', stockLevelResult.rows);

    // Record stock movement if quantity changed
    if (quantityChange !== 0) {
      const movementType = quantityChange > 0 ? 'manual_in' : 'manual_out';
      await client.query(
        'INSERT INTO stock_movements (product_id, location_id, user_id, type, quantity, notes) VALUES ($1, $2, $3, $4, $5, $6)',
        [product_id, location_id, userId, movementType, Math.abs(quantityChange), 'Manual adjustment']
      );
      console.log('AdjustStockLevel: Stock movement recorded.');
    }

    await client.query('COMMIT');
    console.log('AdjustStockLevel: Transaction committed.');

    res.status(200).json({ message: 'Stock level adjusted successfully', stockLevel: stockLevelResult.rows[0] });

  } catch (error: any) {
    await client.query('ROLLBACK');
    // console.error('Error in adjustStockLevel:', error);
    next(error);
  } finally {
    client.release();
  }
};