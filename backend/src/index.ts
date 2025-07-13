import express, { Request, Response, NextFunction } from 'express';
import pool from './config/database';
import fs from 'fs';
import path from 'path';
import authRoutes from './api/auth/auth.routes';
import productRoutes from './api/products/products.routes';
import stockRoutes from './api/stock/stock.routes';
import locationRoutes from './api/locations/locations.routes';
import dashboardRoutes from './api/dashboard/dashboard.routes';
import alertsRoutes from './api/alerts/alerts.routes';
import integrationsRoutes from './api/integrations/integrations.routes';
import { startSyncJobs } from './jobs/sync';

import { authenticateToken, authorizeRoles } from './middlewares/auth.middleware';

import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;
app.set('trust proxy', true);

app.use((req, res, next) => {
  if (req.originalUrl === '/api/integrations/shopify/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.raw({ type: 'application/json', limit: '5mb' }));
app.use((req: Request, res: Response, next: NextFunction): void => {
  console.log(`Debugging Route: ${req.method} ${req.url}`);
  next();
});
app.use(cors()); // Habilitar CORS
app.use((req: Request, res: Response, next: NextFunction): void => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// Función para inicializar la base de datos
const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    const initSql = fs.readFileSync(path.join(__dirname, 'db/init.sql'), 'utf8');
    await client.query(initSql);
    client.release();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database', err);
    process.exit(1); // Salir si no se puede inicializar la DB
  }
};

// Rutas
app.get('/api/', authenticateToken, authorizeRoles(['admin_store']), (req, res) => {
  res.send(`Hello from the backend! User: ${req.user?.email} (Role: ${req.user?.role})`);
});

app.use('/api/auth', authRoutes);
app.use('/api/products', authenticateToken, authorizeRoles(['admin_store']), productRoutes);
app.use('/api/stock', authenticateToken, authorizeRoles(['admin_store']), stockRoutes);
app.use('/api/locations', authenticateToken, authorizeRoles(['admin_store']), locationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/integrations', integrationsRoutes);

app.get('/db-test', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    res.json(result.rows);
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error connecting to the database');
  }
});

const startServer = async () => {
  await initializeDatabase();
  startSyncJobs();
  app.listen(Number(port), '0.0.0.0', () => {
    // console.log(`Backend listening at http://0.0.0.0:${port}`);
  });
};

startServer();