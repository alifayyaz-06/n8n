/**
 * Auth Controller - Multi-Tenant Phone-Based Registration & Login with Master Key
 */

import { supabase } from '../db.js';

const MASTER_KEY = process.env.MASTER_KEY || 'MASTER-KEY-2026';

/**
 * Validates Pakistani phone number format (11 digits starting with 03 e.g. 03001234567 or 12 digits starting with 923)
 */
export function isValidPakistaniPhone(phone) {
  if (!phone) return false;
  const clean = String(phone).trim().replace(/\D/g, '');
  if (clean.length === 11 && clean.startsWith('03')) return true;
  if (clean.length === 12 && clean.startsWith('923')) return true;
  return false;
}

// Fallback memory list of restaurants for dev mode
let memoryRestaurants = [
  {
    id: 'r0000000-0000-0000-0000-000000000001',
    name: 'Gourmet Bistro',
    phone: '03001234567',
    email: '03001234567@restaurant.local',
  },
  {
    id: 'r0000000-0000-0000-0000-000000000002',
    name: 'Lahore Grill',
    phone: '03219876543',
    email: '03219876543@restaurant.local',
  },
];

/**
 * Step 1: Check if phone number already exists in dashboard/system
 */
export const checkPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required.',
      });
    }

    if (!isValidPakistaniPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Pakistani phone number. Length must be 11 digits starting with 03 (e.g., 03001234567).',
      });
    }

    const cleanPhone = String(phone).trim().replace(/\D/g, '');

    // Check in Supabase DB
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id, name, phone')
      .eq('phone', phone)
      .maybeSingle();

    const inMemory = memoryRestaurants.find(
      (r) => r.phone === phone || r.phone.replace(/\D/g, '') === cleanPhone
    );

    if (existingRestaurant || inMemory) {
      return res.status(200).json({
        success: true,
        exists: true,
        message: 'A restaurant account with this phone number already exists. Sign up blocked.',
        restaurantName: existingRestaurant?.name || inMemory?.name,
      });
    }

    return res.status(200).json({
      success: true,
      exists: false,
      message: 'Phone number is available for new restaurant registration.',
    });
  } catch (err) {
    console.error('checkPhone error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify phone number.',
      error: err.message,
    });
  }
};

/**
 * Step 2: Validate Master Key Passkey
 */
export const validateMasterKey = async (req, res) => {
  try {
    const { masterKey } = req.body;
    if (!masterKey) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Master Key is required.',
      });
    }

    if (String(masterKey).trim() !== MASTER_KEY) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Invalid Master Key. Access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: 'Master Key validated successfully.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      valid: false,
      message: 'Failed to validate Master Key.',
      error: err.message,
    });
  }
};

/**
 * Step 3: Register New Restaurant & Admin User (Blocks registration if phone exists!)
 */
export const registerRestaurant = async (req, res) => {
  try {
    const { restaurantName, phone, password, masterKey } = req.body;

    if (!restaurantName || !phone || !password || !masterKey) {
      return res.status(400).json({
        success: false,
        message: 'restaurantName, phone, password, and masterKey are required.',
      });
    }

    if (!isValidPakistaniPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Pakistani phone number. Length must be 11 digits starting with 03 (e.g., 03001234567).',
      });
    }

    if (String(masterKey).trim() !== MASTER_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Invalid Master Key. Registration unauthorized.',
      });
    }

    const cleanPhone = String(phone).trim().replace(/\D/g, '');

    // Strict existence check in database & memory before creating account
    const { data: existingRestaurant } = await supabase
      .from('restaurants')
      .select('id, name, phone')
      .eq('phone', phone)
      .maybeSingle();

    const inMemory = memoryRestaurants.find(
      (r) => r.phone === phone || r.phone.replace(/\D/g, '') === cleanPhone
    );

    if (existingRestaurant || inMemory) {
      return res.status(409).json({
        success: false,
        message: `Phone number '${phone}' is already registered in database for restaurant '${existingRestaurant?.name || inMemory?.name}'. Sign up blocked. Please log in instead.`,
      });
    }

    const generatedEmail = `${cleanPhone}@restaurant.local`;
    const generatedRestaurantId = `r${Date.now().toString()}-0000-0000-0000-000000000000`.slice(0, 36);

    // 1. Create Restaurant in Supabase DB
    const { data: restaurant } = await supabase
      .from('restaurants')
      .insert([
        {
          id: generatedRestaurantId,
          name: restaurantName,
          phone,
          email: generatedEmail,
        },
      ])
      .select()
      .single();

    // 2. Register User in Supabase Auth using phone-backed identity
    let authUser = null;
    const { data: authData } = await supabase.auth.signUp({
      email: generatedEmail,
      password,
      options: {
        data: { restaurant_name: restaurantName, phone },
      },
    });

    if (authData?.user) {
      authUser = authData.user;
      await supabase.from('restaurant_users').insert([
        {
          user_id: authUser.id,
          restaurant_id: restaurant?.id || generatedRestaurantId,
          role: 'restaurant_admin',
        },
      ]);
    }

    const newRestaurantRecord = restaurant || {
      id: generatedRestaurantId,
      name: restaurantName,
      phone,
      email: generatedEmail,
    };

    memoryRestaurants.push(newRestaurantRecord);

    const token = `DEMO_TOKEN_${generatedRestaurantId}`;

    return res.status(201).json({
      success: true,
      message: 'Restaurant account created successfully!',
      token,
      user: { id: authUser?.id || `usr-${Date.now()}`, phone },
      restaurant: newRestaurantRecord,
      role: 'restaurant_admin',
    });
  } catch (err) {
    console.error('registerRestaurant exception:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create restaurant account.',
      error: err.message,
    });
  }
};

/**
 * Login Endpoint (Supports Phone or Email + Password)
 */
export const login = async (req, res) => {
  try {
    const { phone, email, password } = req.body;
    const phoneOrEmail = phone || email;

    if (!phoneOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and password are required.',
      });
    }

    const cleanPhone = String(phoneOrEmail).trim().replace(/\D/g, '');
    const loginEmail = phoneOrEmail.includes('@')
      ? phoneOrEmail
      : `${cleanPhone}@restaurant.local`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error || !data?.session) {
      // Check fallback memory
      const matched = memoryRestaurants.find(
        (r) => r.phone === phoneOrEmail || r.phone.replace(/\D/g, '') === cleanPhone || r.email === phoneOrEmail
      );
      if (matched) {
        const token = `DEMO_TOKEN_${matched.id}`;
        return res.status(200).json({
          success: true,
          token,
          user: { id: `usr-${matched.id}`, phone: matched.phone },
          restaurant: matched,
          role: 'restaurant_admin',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password.',
      });
    }

    const token = data.session.access_token;
    const user = data.user;

    const { data: membership } = await supabase
      .from('restaurant_users')
      .select('*, restaurant:restaurants(*)')
      .eq('user_id', user.id)
      .maybeSingle();

    return res.status(200).json({
      success: true,
      token,
      user,
      restaurant: membership?.restaurant || { name: 'Restaurant Portal' },
      role: membership?.role || 'restaurant_admin',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: err.message,
    });
  }
};
