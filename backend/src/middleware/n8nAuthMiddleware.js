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

    console.log(`📡 [n8n Webhook] Incoming request received. Validating API Key: '${apiKey.slice(0, 10)}...'`);

    // 4. Query integration_credentials safely (try hash lookup first to prevent column errors)
    let credential = null;
    let dbError = null;

    const { data: hashCred, error: hashErr } = await supabase
      .from('integration_credentials')
      .select('id, restaurant_id, name, is_active')
      .eq('api_key_hash', apiKeyHash)
      .maybeSingle();

    if (hashCred) {
      credential = hashCred;
    } else {
      if (hashErr) dbError = hashErr;
      // Fallback: try querying by raw api_key if column exists
      try {
        const { data: rawCred } = await supabase
          .from('integration_credentials')
          .select('id, restaurant_id, name, is_active')
          .eq('api_key', apiKey)
          .maybeSingle();
        if (rawCred) credential = rawCred;
      } catch (e) {
        // Ignore column missing error on raw key fallback
      }
    }

    if (dbError && !credential) {
      console.error('❌ n8nAuthMiddleware DB error:', dbError.message);
    }

    // Key not found → invalid
    if (!credential) {
      console.warn(`⚠️ [n8n Webhook] Rejected invalid API key: '${apiKey}'`);
      return res.status(401).json({
        success: false,
        message: 'Invalid integration API key.',
      });
    }

    // 5. Check is_active
    if (!credential.is_active) {
      console.warn(`⚠️ [n8n Webhook] Rejected inactive credential: '${credential.name}'`);
      return res.status(401).json({
        success: false,
        message: 'Integration credential is inactive. Contact administrator.',
      });
    }

    console.log(`✅ [n8n Webhook] Authenticated successfully for restaurant ID: ${credential.restaurant_id} (${credential.name})`);

    // 6. Attach the authenticated restaurant context
    req.integration = {
      credentialId: credential.id,
      credentialName: credential.name,
      restaurantId: credential.restaurant_id,
    };
    req.restaurantId = credential.restaurant_id;

    next();
  } catch (err) {
    console.error('❌ n8nAuthMiddleware exception:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during integration authentication.',
    });
  }
};
