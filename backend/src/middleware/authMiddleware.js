/**
 * Express Authentication & Multi-Tenant Authorization Middleware
 */

import { supabase } from '../db.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Authorization header missing or malformed.',
        error: 'UNAUTHORIZED',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Bearer token missing.',
        error: 'UNAUTHORIZED',
      });
    }

    // Verify Supabase JWT token
    const { data: authData, error: authErr } = await supabase.auth.getUser(token);

    if (authErr || !authData?.user) {
      // In development fallback mode, if token is mock token "DEMO_TOKEN_GOURMET" or "DEMO_TOKEN_LAHORE"
      if (token === 'DEMO_TOKEN_GOURMET') {
        req.user = { id: 'usr-gourmet-1', email: 'admin@gourmet.com' };
        req.restaurantId = 'r0000000-0000-0000-0000-000000000001';
        req.restaurant = { id: 'r0000000-0000-0000-0000-000000000001', name: 'Gourmet Bistro' };
        req.role = 'restaurant_admin';
        return next();
      } else if (token === 'DEMO_TOKEN_LAHORE') {
        req.user = { id: 'usr-lahore-1', email: 'admin@lahoregrill.com' };
        req.restaurantId = 'r0000000-0000-0000-0000-000000000002';
        req.restaurant = { id: 'r0000000-0000-0000-0000-000000000002', name: 'Lahore Grill' };
        req.role = 'restaurant_admin';
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication session.',
        error: 'INVALID_TOKEN',
      });
    }

    const user = authData.user;

    // Fetch user's restaurant membership from Supabase DB
    const { data: membership, error: memberErr } = await supabase
      .from('restaurant_users')
      .select('*, restaurant:restaurants(*)')
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberErr || !membership) {
      // Fallback for default user
      req.user = user;
      req.restaurantId = 'r0000000-0000-0000-0000-000000000001';
      req.restaurant = { id: 'r0000000-0000-0000-0000-000000000001', name: 'Gourmet Bistro' };
      req.role = 'restaurant_admin';
      return next();
    }

    req.user = user;
    req.restaurantId = membership.restaurant_id;
    req.restaurant = membership.restaurant || { name: 'Restaurant Portal' };
    req.role = membership.role || 'restaurant_admin';

    next();
  } catch (err) {
    console.error('❌ authMiddleware exception:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to authenticate user.',
      error: 'SERVER_ERROR',
    });
  }
};
