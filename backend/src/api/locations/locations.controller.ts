import { Request, Response, NextFunction, RequestHandler } from 'express';
import pool from '../../config/database';

export const getLocations: RequestHandler = async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const client = await pool.connect();

  try {
    const result = await client.query(
      'SELECT id, name, created_at, updated_at FROM locations WHERE user_id = $1 ORDER BY name ASC',
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error: any) {
    console.error('Error in getLocations:', error);
    next(error);
  } finally {
    client.release();
  }
};

export const addLocation: RequestHandler = async (req, res, next) => {
  const { name } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  if (!name) {
    res.status(400).json({ message: 'Location name is required' });
    return;
  }

  const client = await pool.connect();

  try {
    const result = await client.query(
      'INSERT INTO locations (user_id, name) VALUES ($1, $2) RETURNING id, name, created_at, updated_at',
      [userId, name]
    );
    res.status(201).json({ message: 'Location added successfully', location: result.rows[0] });
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ message: 'Location name already exists for this user' });
      return;
    }
    console.error('Error in addLocation:', error);
    next(error);
  } finally {
    client.release();
  }
};