/**
 * Integration API Routes
 *
 * All routes under /api/integrations are authenticated via n8nAuthMiddleware.
 * The middleware resolves the restaurant_id from the API key.
 */

import { Router } from 'express';
import { n8nAuthMiddleware } from '../middleware/n8nAuthMiddleware.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  createIntegrationOrder,
  getIntegrationOrderStatus,
  getOrCreateIntegrationKey,
} from '../controllers/integrationController.js';

const router = Router();

// n8n → Express → Supabase → Restaurant Order (Bearer API Key auth)
router.post('/orders', n8nAuthMiddleware, createIntegrationOrder);
router.get('/orders/:id/status', n8nAuthMiddleware, getIntegrationOrderStatus);

// Retrieve or generate n8n API Key for logged-in restaurant (User JWT auth)
router.get('/credentials', requireAuth, getOrCreateIntegrationKey);

export default router;
