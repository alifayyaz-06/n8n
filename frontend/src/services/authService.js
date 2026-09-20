/**
 * Frontend Auth Service Wrapper for Multi-Tenant Supabase Authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  /**
   * Step 1: Check if phone number already exists in backend/dashboard
   */
  checkPhone: async (phone) => {
    const res = await fetch(`${API_BASE_URL}/auth/check-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to check phone number.');
    }
    return res.json();
  },

  /**
   * Step 2: Validate Master Key Passkey
   */
  validateMasterKey: async (masterKey) => {
    const res = await fetch(`${API_BASE_URL}/auth/validate-master-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterKey }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid Master Key. Access denied.');
    }
    return res.json();
  },

  /**
   * Step 3: Register new restaurant tenant with Phone + Password ONLY (NO EMAIL REQUIRED!)
   */
  register: async ({ restaurantName, phone, password, masterKey }) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantName, phone, password, masterKey }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to create restaurant account.');
    }

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  },

  /**
   * Log in user with Phone / Email & Password or Demo Token
   */
  login: async (phoneOrEmail, password) => {
    // Demo account quick shortcuts for multi-tenant verification
    if (phoneOrEmail === '03001234567' || phoneOrEmail === 'admin@gourmet.com' || phoneOrEmail === 'gourmet') {
      const demoToken = 'DEMO_TOKEN_GOURMET';
      localStorage.setItem('auth_token', demoToken);
      return {
        token: demoToken,
        user: { id: 'usr-gourmet-1', phone: '03001234567', email: 'admin@gourmet.com' },
        restaurant: { id: 'r0000000-0000-0000-0000-000000000001', name: 'Gourmet Bistro' },
        role: 'restaurant_admin',
      };
    }

    if (phoneOrEmail === '03219876543' || phoneOrEmail === 'admin@lahoregrill.com' || phoneOrEmail === 'lahore') {
      const demoToken = 'DEMO_TOKEN_LAHORE';
      localStorage.setItem('auth_token', demoToken);
      return {
        token: demoToken,
        user: { id: 'usr-lahore-1', phone: '03219876543', email: 'admin@lahoregrill.com' },
        restaurant: { id: 'r0000000-0000-0000-0000-000000000002', name: 'Lahore Grill' },
        role: 'restaurant_admin',
      };
    }

    // Standard authentication fetch to backend
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phoneOrEmail, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid phone number or password.');
    }

    const data = await res.json();
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  },

  /**
   * Fetch current authenticated user's profile and tenant info from backend /api/auth/me
   */
  getMe: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    if (token === 'DEMO_TOKEN_GOURMET') {
      return {
        user: { id: 'usr-gourmet-1', phone: '03001234567', email: 'admin@gourmet.com' },
        restaurant: { id: 'r0000000-0000-0000-0000-000000000001', name: 'Gourmet Bistro' },
        role: 'restaurant_admin',
      };
    }

    if (token === 'DEMO_TOKEN_LAHORE') {
      return {
        user: { id: 'usr-lahore-1', phone: '03219876543', email: 'admin@lahoregrill.com' },
        restaurant: { id: 'r0000000-0000-0000-0000-000000000002', name: 'Lahore Grill' },
        role: 'restaurant_admin',
      };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('⚠️ getMe exception:', err.message);
      return null;
    }
  },

  /**
   * Log out user
   */
  logout: () => {
    localStorage.removeItem('auth_token');
  },

  /**
   * Retrieve current stored token
   */
  getToken: () => {
    return localStorage.getItem('auth_token') || 'DEMO_TOKEN_GOURMET';
  },
};
