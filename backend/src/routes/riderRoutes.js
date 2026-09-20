/**
 * Rider Routes
 */

import { Router } from 'express';
import {
  getRiders,
  createRider,
  updateRider,
  deleteRider,
  assignRiderToOrder,
  settleRiderBalance,
} from '../controllers/riderController.js';

const router = Router();

router.get('/', getRiders);
router.post('/', createRider);
router.patch('/:id', updateRider);
router.delete('/:id', deleteRider);
router.patch('/orders/:id/assign', assignRiderToOrder);
router.post('/:id/settle', settleRiderBalance);

export default router;
