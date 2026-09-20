/**
 * n8n Integration Authentication Middleware
 *
 * Authenticates external integration requests (e.g. from n8n) using
 * a hashed API key stored in the integration_credentials table.
 *
 * Flow:
 *   Authorization: Bearer <api_key>
 *       ↓
 *   SHA-256 hash the key
 *       ↓
 *   Look up api_key_hash in integration_credentials
 *       ↓
 *   Verify is_active = true
 *       ↓
 *   Attach req.integration.restaurantId
 */

import crypto from 'crypto';
import { supabase } from '../db.js';

export const n8nAuthMiddleware = async (req, res, next) => {
  try {
    // 1. Read Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Integration API key is required',
      });
    }

    // 2. Extract the API key
    const apiKey = authHeader.split(' ')[1];
    if (!apiKey || apiKey.trim() === '') {
      return res.status(401).json({
        success: false,
        message: 'Integration API key is required',
      });
    }

    // 3. Hash the API key (SHA-256)
    const apiKeyHash = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');

    // 4. Find the matching active integration credential (match by raw api_key OR api_key_hash)
    const { data: credential, error } = await supabase
      .from('integration_credentials')
      .select('id, restaurant_id, name, is_active')
      .or(`api_key.eq.${apiKey},api_key_hash.eq.${apiKeyHash}`)
      .maybeSingle();

    if (error) {
      console.error('❌ n8nAuthMiddleware DB error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authentication.',
      });
    }

    // Key not found → invalid
    if (!credential) {
      return res.status(401).json({
        success: false,
        message: 'Invalid integration API key.',
      });
    }

    // 5. Check is_active
    if (!credential.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Integration credential is inactive. Contact administrator.',
      });
    }

    // 6. Attach the authenticated restaurant context
    req.integration = {
      credentialId: credential.id,
      credentialName: credential.name,
      restaurantId: credential.restaurant_id,
    };

    next();
  } catch (err) {
    console.error('❌ n8nAuthMiddleware exception:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during integration authentication.',
    });
  }
};
