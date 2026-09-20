/**
 * Auth Router - Public Endpoints for Login, Phone Verification, Master Key, and Registration
 */

import { Router } from 'express';
import {
  checkPhone,
  validateMasterKey,
  registerRestaurant,
  login,
} from '../controllers/authController.js';

const router = Router();

router.post('/check-phone', checkPhone);
router.post('/validate-master-key', validateMasterKey);
router.post('/register', registerRestaurant);
router.post('/login', login);

export default router;
