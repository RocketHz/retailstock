import { Request, Response, NextFunction, RequestHandler } from 'express';
import pool from '../../config/database';

// POST /api/products - Add a new product
export const addProduct: RequestHandler = async (req, res, next) => {
  const { name, sku, description, price, initial_quantity, location_id, min_stock_threshold } = req.body;
  const userId = req.user?.id;

  // Log para mostrar los datos recibidos al inicio de la función
  // console.log('addProduct: Datos recibidos para el producto:', { name, sku, description, price, initial_quantity, location_id, min_stock_threshold });

  if (!name || !sku || !price || initial_quantity === undefined || !location_id) {
    // Log para campos requeridos faltantes
    console.error('addProduct: ERROR - Faltan campos requeridos o initial_quantity es undefined:', { name, sku, price, initial_quantity, location_id });
    res.status(400).json({ message: 'Missing required fields' });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    // Log al iniciar la transacción
    // console.log('addProduct: Transacción de base de datos iniciada.');

    // Insert product
    const productResult = await client.query(
      'INSERT INTO products (user_id, name, sku, description, price, min_stock_threshold) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [userId, name, sku, description, price, min_stock_threshold]
    );
    const productId = productResult.rows[0].id;
    // Log después de insertar el producto
    // console.log('addProduct: Producto insertado exitosamente con ID:', productId);

    // Create stock level
    await client.query(
      'INSERT INTO stock_levels (product_id, location_id, quantity) VALUES ($1, $2, $3)',
      [productId, location_id, initial_quantity]
    );
    // Log después de crear el nivel de stock
    // console.log('addProduct: Nivel de stock creado para el producto ID:', productId, 'en ubicación:', location_id, 'con cantidad:', initial_quantity);

    // Create initial stock movement
    await client.query(
      'INSERT INTO stock_movements (product_id, location_id, user_id, type, quantity, notes) VALUES ($1, $2, $3, $4, $5, $6)',
      [productId, location_id, userId, 'in', initial_quantity, 'Initial stock']
    );
    // Log después de crear el movimiento de stock
    // console.log('addProduct: Movimiento de stock inicial registrado para el producto ID:', productId);

    await client.query('COMMIT');
    // Log al finalizar la transacción
    // console.log('addProduct: Transacción de base de datos completada exitosamente.');

    res.status(201).json({ message: 'Product added successfully', productId });

  } catch (error: any) {
    await client.query('ROLLBACK');
    // Log en caso de error y rollback
    console.error('addProduct: ERROR - Transacción de base de datos revertida debido a:', error);
    if (error.code === '23505') { // Unique violation for SKU
      res.status(409).json({ message: 'SKU already exists' });
    } else {
      console.error('Error adding product:', error);
      next(error);
    }
  } finally {
    client.release();
    // Log al liberar el cliente de la base de datos
    // console.log('addProduct: Cliente de base de datos liberado.');
  }
};

// GET /api/products - Get all products
export const getProducts: RequestHandler = async (req, res, next) => {
  const userId = req.user?.id;
  const { name, sku, sort_by, sort_order } = req.query;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const client = await pool.connect();
  try {
    let query = `
      SELECT
        p.id, p.name, p.sku, p.description, p.price, p.min_stock_threshold, p.created_at AS "createdAt", p.updated_at AS "updatedAt",
        COALESCE(SUM(sl.quantity), 0) AS "totalStock",
        json_agg(
          json_build_object(
            'locationId', sl.location_id,
            'locationName', l.name,
            'quantity', sl.quantity
          )
        ) FILTER (WHERE sl.product_id IS NOT NULL) AS "stockLevels"
      FROM products p
      LEFT JOIN stock_levels sl ON p.id = sl.product_id
      LEFT JOIN locations l ON sl.location_id = l.id
      WHERE p.user_id = $1
    `;
    const queryParams = [userId];
    let paramIndex = 2;

    if (name) {
      query += ` AND p.name ILIKE $${paramIndex++}`;
      queryParams.push(`%${name}%`);
    }
    if (sku) {
      query += ` AND p.sku ILIKE $${paramIndex++}`;
      queryParams.push(`%${sku}%`);
    }

    query += ` GROUP BY p.id, p.name, p.sku, p.description, p.price, p.min_stock_threshold, p.created_at, p.updated_at`;

    const validSortColumns = ['name', 'sku', 'price', 'totalStock', 'createdAt', 'updatedAt'];
    const orderBy = sort_by && validSortColumns.includes(sort_by as string) ? sort_by : 'createdAt';
    const order = sort_order === 'desc' ? 'DESC' : 'ASC';

    query += ` ORDER BY "${orderBy}" ${order}`;

    const result = await client.query(query, queryParams);
    res.status(200).json(result.rows);

  } catch (error) {
    console.error('Error fetching products:', error);
    next(error);
  } finally {
    client.release();
  }
};

// GET /api/products/:id - Get product by ID
export const getProductById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const client = await pool.connect();
  try {
    const query = `
      SELECT
        p.id, p.name, p.sku, p.description, p.price, p.min_stock_threshold, p.created_at AS "createdAt", p.updated_at AS "updatedAt",
        COALESCE(SUM(sl.quantity), 0) AS "totalStock",
        json_agg(
          json_build_object(
            'locationId', sl.location_id,
            'locationName', l.name,
            'quantity', sl.quantity
          )
        ) FILTER (WHERE sl.product_id IS NOT NULL) AS "stockLevels"
      FROM products p
      LEFT JOIN stock_levels sl ON p.id = sl.product_id
      LEFT JOIN locations l ON sl.location_id = l.id
      WHERE p.id = $1 AND p.user_id = $2
      GROUP BY p.id, p.name, p.sku, p.description, p.price, p.min_stock_threshold, p.created_at, p.updated_at;
    `;
    const result = await client.query(query, [id, userId]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Product not found or not authorized' });
      return;
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching product by ID:', error);
    next(error);
  } finally {
    client.release();
  }
};

// PUT /api/products/:id - Update product
export const updateProduct: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const { name, sku, description, price, min_stock_threshold, max_stock_threshold } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const client = await pool.connect();

  try {
    const queryParts: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) { queryParts.push(`name = $${paramIndex++}`); queryParams.push(name); }
    if (sku !== undefined) { queryParts.push(`sku = $${paramIndex++}`); queryParams.push(sku); }
    if (description !== undefined) { queryParts.push(`description = $${paramIndex++}`); queryParams.push(description); }
    if (price !== undefined) { queryParts.push(`price = $${paramIndex++}`); queryParams.push(price); }
    if (min_stock_threshold !== undefined) { queryParts.push(`min_stock_threshold = $${paramIndex++}`); queryParams.push(min_stock_threshold); }
    if (max_stock_threshold !== undefined) { queryParts.push(`max_stock_threshold = $${paramIndex++}`); queryParams.push(max_stock_threshold); }

    queryParts.push(`updated_at = CURRENT_TIMESTAMP`);

    // Corrected the placeholder syntax for id and user_id
    let query = `UPDATE products SET ${queryParts.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex++} RETURNING *;`;

    queryParams.push(String(id), String(userId));

    console.log('Update Product Query:', query);
    console.log('Update Product Params:', queryParams);
    console.log('Type of id:', typeof id, 'Value of id:', id);
    console.log('Type of userId:', typeof userId, 'Value of userId:', userId);

    const result = await client.query(query, queryParams);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Product not found or not authorized' });
      return;
    }

    res.status(200).json({ message: 'Product updated successfully', product: result.rows[0] });

  } catch (error: any) {
    if (error.code === '23505') { // Unique violation for SKU
      res.status(409).json({ message: 'SKU already exists' });
    } else {
      console.error('Error updating product:', error);
      next(error);
    }
  } finally {
    client.release();
  }
};

// DELETE /api/products/:id - Delete product
export const deleteProduct: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Delete stock movements first
    await client.query('DELETE FROM stock_movements WHERE product_id = $1 AND user_id = $2', [id, userId]);

    // Delete stock levels
    await client.query('DELETE FROM stock_levels WHERE product_id = $1', [id]);

    // Delete product
    const result = await client.query('DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ message: 'Product not found or not authorized' });
      return;
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Product deleted successfully' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting product:', error);
    next(error);
  } finally {
    client.release();
  }
};
