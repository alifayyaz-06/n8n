/**
 * Integration API Routes
 *
 * All routes under /api/integrations are authenticated via n8nAuthMiddleware.
 * The middleware resolves the restaurant_id from the API key.
 */

import { Router } from 'express';
import { n8nAuthMiddleware } from '../middleware/n8nAuthMiddleware.js';
import { createIntegrationOrder } from '../controllers/integrationController.js';

const router = Router();

// n8n → Express → Supabase → Restaurant Order
router.post('/orders', n8nAuthMiddleware, createIntegrationOrder);

export default router;
