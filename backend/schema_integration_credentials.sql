-- =========================================================
-- Integration Credentials Table for n8n / External API Access
-- Run this in Supabase SQL Editor after the main schema.sql
-- =========================================================

-- 1. Create integration_credentials table
CREATE TABLE IF NOT EXISTS public.integration_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(128) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Grant permissions
GRANT ALL ON public.integration_credentials TO anon, authenticated, service_role;

-- 3. Enable RLS
ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;

-- 4. Drop policy if exists to avoid conflict on re-run
DROP POLICY IF EXISTS "Allow public full access to integration_credentials" ON public.integration_credentials;

-- 5. Create permissive policy (backend uses service_role key)
CREATE POLICY "Allow public full access to integration_credentials" 
    ON public.integration_credentials 
    FOR ALL USING (true) WITH CHECK (true);

-- =========================================================
-- Seed a test integration credential for Gourmet Bistro
-- =========================================================
-- API Key: n8n_gourmet_test_key_2026
-- SHA-256 hash of "n8n_gourmet_test_key_2026":
--   Computed via: SELECT encode(digest('n8n_gourmet_test_key_2026', 'sha256'), 'hex');
-- 
-- You MUST have the pgcrypto extension enabled.
-- Supabase projects have it enabled by default.
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert ONLY if no credential exists for this restaurant yet
INSERT INTO public.integration_credentials (restaurant_id, name, api_key_hash)
SELECT 
    r.id,
    'n8n Gourmet Bistro Integration',
    encode(digest('n8n_gourmet_test_key_2026', 'sha256'), 'hex')
FROM public.restaurants r
WHERE r.name = 'Gourmet Bistro'
AND NOT EXISTS (
    SELECT 1 FROM public.integration_credentials ic
    WHERE ic.restaurant_id = r.id AND ic.name = 'n8n Gourmet Bistro Integration'
)
LIMIT 1;
