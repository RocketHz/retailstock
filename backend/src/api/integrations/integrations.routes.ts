import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { connectShopify, shopifyCallback, shopifyWebhook, connectWooCommerce, getIntegrationsStatus } from './integrations.controller';

const router = Router();

// Middleware para manejar errores asíncronos
// Esto permite capturar errores en funciones asíncronas y pasarlos al manejador de errores de Express
// Se utiliza para evitar tener que usar try/catch en cada ruta asíncrona.
// Es una práctica común en Express para manejar errores de manera más limpia.
// La función `asyncHandler` toma una función asíncrona y devuelve una nueva función
// que envuelve la llamada original en una promesa. Si la promesa es rechazada,
// el error se pasa al siguiente middleware de manejo de errores de Express.
// Esto es útil para evitar repetir el manejo de errores en cada ruta asíncrona.
// Permite que las funciones asíncronas se manejen de manera más limpia y evita
// tener que envolver cada ruta en un bloque try/catch.
// Esto es especialmente útil en aplicaciones Express donde se manejan muchas rutas asíncronas.
// Así, si una función asíncrona falla, el error se captura y se pasa
// al siguiente middleware de manejo de errores, evitando que la aplicación se bloquee
function asyncHandler(fn: Function) {
  return function (req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Rutas para Shopify
router.post('/shopify/connect', authenticateToken, connectShopify);
router.get('/shopify/callback', shopifyCallback);
router.post("/shopify/webhook", asyncHandler(shopifyCallback));

// Rutas para WooCommerce
router.post('/woocommerce/connect', authenticateToken, connectWooCommerce);

// Ruta para obtener el estado de las integraciones
router.get('/status', authenticateToken, getIntegrationsStatus);

export default router;
