-- =========================================================
-- Supabase Multi-Tenant SQL Schema Migration Script
-- Copy and paste this script directly into Supabase SQL Editor and click RUN
-- =========================================================

-- 1. Create restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create restaurant_users mapping table
CREATE TABLE IF NOT EXISTS public.restaurant_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'restaurant_admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_restaurant UNIQUE(user_id, restaurant_id)
);

-- Safely add foreign key to auth.users if auth schema exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_restaurant_users_auth_user'
        ) THEN
            ALTER TABLE public.restaurant_users 
            ADD CONSTRAINT fk_restaurant_users_auth_user 
            FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 3. Create riders table (and ensure restaurant_id column exists)
CREATE TABLE IF NOT EXISTS public.riders (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    vehicle VARCHAR(100) DEFAULT 'Bike',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.riders ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- 4. Create orders table (and ensure restaurant_id & rider columns exist)
CREATE TABLE IF NOT EXISTS public.orders (
    id VARCHAR(50) PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    order_type VARCHAR(50) NOT NULL DEFAULT 'DELIVERY',
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'New',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rider_id VARCHAR(50) REFERENCES public.riders(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rider_name VARCHAR(255);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS rider_settled BOOLEAN DEFAULT FALSE;

-- 5. Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

-- =========================================================
-- Grant Full Permissions & Access Policies
-- =========================================================

GRANT ALL ON public.restaurants TO anon, authenticated, service_role;
GRANT ALL ON public.restaurant_users TO anon, authenticated, service_role;
GRANT ALL ON public.riders TO anon, authenticated, service_role;
GRANT ALL ON public.orders TO anon, authenticated, service_role;
GRANT ALL ON public.order_items TO anon, authenticated, service_role;

-- Enable Row Level Security (RLS)
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop previous policies to avoid conflict errors
DROP POLICY IF EXISTS "Allow public full access to restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Allow public full access to restaurant_users" ON public.restaurant_users;
DROP POLICY IF EXISTS "Allow public full access to riders" ON public.riders;
DROP POLICY IF EXISTS "Allow public full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public full access to order_items" ON public.order_items;

DROP POLICY IF EXISTS "User restaurant mapping policy" ON public.restaurant_users;
DROP POLICY IF EXISTS "Tenant restaurant access policy" ON public.restaurants;
DROP POLICY IF EXISTS "Tenant riders access policy" ON public.riders;
DROP POLICY IF EXISTS "Tenant orders access policy" ON public.orders;
DROP POLICY IF EXISTS "Tenant order items access policy" ON public.order_items;

-- Define Policies
CREATE POLICY "Allow public full access to restaurants" ON public.restaurants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to restaurant_users" ON public.restaurant_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to riders" ON public.riders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access to order_items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

-- =========================================================
-- 6. Integration Credentials Table (n8n / External API Access)
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.integration_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(128) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON public.integration_credentials TO anon, authenticated, service_role;

ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public full access to integration_credentials" ON public.integration_credentials;

CREATE POLICY "Allow public full access to integration_credentials"
    ON public.integration_credentials
    FOR ALL USING (true) WITH CHECK (true);
