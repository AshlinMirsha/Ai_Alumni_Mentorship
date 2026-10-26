-- ==============================================================================
-- AlumniPath Backend Architecture: Companies, Verification Codes, Profiles & RLS
-- Migration: 20261024_company_codes_and_roles.sql
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  domain TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Company Verification Codes Table
-- Stores SHA-256 hashes of codes; raw secret codes are never stored in plaintext
CREATE TABLE IF NOT EXISTS public.company_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL UNIQUE,
  code_prefix TEXT NOT NULL, -- First 4 characters for identification, e.g. "DDOG-..."
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'exhausted')),
  expires_at TIMESTAMPTZ,
  max_uses INTEGER DEFAULT 1 CHECK (max_uses IS NULL OR max_uses > 0),
  uses_count INTEGER NOT NULL DEFAULT 0 CHECK (uses_count >= 0),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for rapid code lookup
CREATE INDEX IF NOT EXISTS idx_verification_codes_hash ON public.company_verification_codes(code_hash);
CREATE INDEX IF NOT EXISTS idx_verification_codes_company ON public.company_verification_codes(company_id);

-- 4. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'alumni', 'admin')),
  institution TEXT,
  department TEXT,
  academic_year TEXT,
  graduation_year INTEGER,
  current_role TEXT,
  current_company TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verified_at TIMESTAMPTZ,
  verified_by_code_id UUID REFERENCES public.company_verification_codes(id) ON DELETE SET NULL,
  headline TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company_id);

-- 5. Company Code Redemptions Table (Audit log of redemptions)
CREATE TABLE IF NOT EXISTS public.company_code_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES public.company_verification_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  ip_hash TEXT,
  redeemed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_code_redemption UNIQUE(code_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_redemptions_user ON public.company_code_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_code ON public.company_code_redemptions(code_id);

-- 6. Verification Attempts Log (For rate limiting and brute force defense)
CREATE TABLE IF NOT EXISTS public.verification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  code_prefix TEXT,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  attempted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verification_attempts_ip_time ON public.verification_attempts(ip_hash, attempted_at);

-- ==============================================================================
-- Triggers and Security Functions
-- ==============================================================================

-- 7. Timestamp Update Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_companies_updated_at ON public.companies;
CREATE TRIGGER set_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_codes_updated_at ON public.company_verification_codes;
CREATE TRIGGER set_codes_updated_at
  BEFORE UPDATE ON public.company_verification_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 8. Prevent Privilege Escalation Trigger
-- Ordinary authenticated users cannot update their own 'role', 'company_id',
-- 'verification_status', or 'verified_at' fields. Only service_role or security definer
-- functions can modify these columns.
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role to update any field
  IF (auth.jwt() ->> 'role' = 'service_role') OR (current_user = 'postgres') THEN
    RETURN NEW;
  END IF;

  -- Block ordinary users from altering role or verification fields
  IF (OLD.role IS DISTINCT FROM NEW.role) THEN
    RAISE EXCEPTION 'Unauthorized: Users cannot alter their own account role.';
  END IF;

  IF (OLD.verification_status IS DISTINCT FROM NEW.verification_status) THEN
    RAISE EXCEPTION 'Unauthorized: Users cannot alter their own verification status.';
  END IF;

  IF (OLD.company_id IS DISTINCT FROM NEW.company_id) THEN
    RAISE EXCEPTION 'Unauthorized: Users cannot alter their own verified company association.';
  END IF;

  IF (OLD.verified_at IS DISTINCT FROM NEW.verified_at) THEN
    RAISE EXCEPTION 'Unauthorized: Users cannot alter verification timestamps.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 9. Automatic Profile Creation on Supabase Auth Signup (Default: Student, Unverified)
-- Even if an applicant passes 'role': 'alumni' in client metadata, the database trigger
-- enforces 'student' until company-code verification is successfully completed!
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    institution,
    department,
    academic_year,
    graduation_year,
    current_role,
    current_company,
    headline,
    verification_status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    -- Security rule: Default role is ALWAYS 'student' unless assigned by trusted backend service role
    COALESCE(
      CASE WHEN (auth.jwt() ->> 'role' = 'service_role') THEN NEW.raw_user_meta_data->>'role' ELSE NULL END,
      'student'
    ),
    NEW.raw_user_meta_data->>'institution',
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'academic_year',
    NULLIF(NEW.raw_user_meta_data->>'graduation_year', '')::INTEGER,
    NEW.raw_user_meta_data->>'current_role',
    NEW.raw_user_meta_data->>'current_company',
    COALESCE(
      NEW.raw_user_meta_data->>'headline',
      CONCAT_WS(' · ', NULLIF(NEW.raw_user_meta_data->>'academic_year', ''), NULLIF(NEW.raw_user_meta_data->>'department', ''))
    ),
    'unverified'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 10. Atomic Company Code Redemption & Alumni Promotion Function
-- This function runs with SECURITY DEFINER privileges to atomically:
-- 1) Lock the code row using SELECT ... FOR UPDATE
-- 2) Validate status, expiration, and remaining usage
-- 3) Increment usage count and update status if exhausted
-- 4) Record redemption audit log
-- 5) Promote user profile to 'alumni' with 'verified' status
CREATE OR REPLACE FUNCTION public.verify_and_redeem_company_code(
  p_user_id UUID,
  p_code_hash TEXT,
  p_company_name TEXT DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code RECORD;
  v_company RECORD;
  v_user_profile RECORD;
BEGIN
  -- 1. Verify user profile exists
  SELECT * INTO v_user_profile FROM public.profiles WHERE id = p_user_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User profile not found.');
  END IF;

  -- 2. Lock the verification code record for update to prevent concurrent race conditions
  SELECT c.*, comp.name AS company_name, comp.status AS comp_status
  INTO v_code
  FROM public.company_verification_codes c
  JOIN public.companies comp ON comp.id = c.company_id
  WHERE c.code_hash = p_code_hash
  FOR UPDATE OF c;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid company verification code.');
  END IF;

  -- 3. Check code status
  IF v_code.status <> 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'This verification code is ' || v_code.status || '.');
  END IF;

  -- 4. Check company status
  IF v_code.comp_status <> 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'The associated company is not currently active.');
  END IF;

  -- 5. Check expiration
  IF v_code.expires_at IS NOT NULL AND v_code.expires_at < NOW() THEN
    UPDATE public.company_verification_codes SET status = 'expired' WHERE id = v_code.id;
    RETURN jsonb_build_object('success', false, 'error', 'This company verification code has expired.');
  END IF;

  -- 6. Check usage limit
  IF v_code.max_uses IS NOT NULL AND v_code.uses_count >= v_code.max_uses THEN
    UPDATE public.company_verification_codes SET status = 'exhausted' WHERE id = v_code.id;
    RETURN jsonb_build_object('success', false, 'error', 'This company verification code has reached its maximum usage limit.');
  END IF;

  -- 7. Check if user already redeemed this code
  IF EXISTS (SELECT 1 FROM public.company_code_redemptions WHERE code_id = v_code.id AND user_id = p_user_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You have already redeemed this company code.');
  END IF;

  -- 8. Atomically increment usage
  UPDATE public.company_verification_codes
  SET
    uses_count = uses_count + 1,
    status = CASE
      WHEN max_uses IS NOT NULL AND (uses_count + 1) >= max_uses THEN 'exhausted'
      ELSE 'active'
    END
  WHERE id = v_code.id;

  -- 9. Insert redemption audit log
  INSERT INTO public.company_code_redemptions (code_id, user_id, company_id, ip_hash)
  VALUES (v_code.id, p_user_id, v_code.company_id, p_ip_hash);

  -- 10. Update user profile with trusted Alumni role and verified status
  UPDATE public.profiles
  SET
    role = 'alumni',
    company_id = v_code.company_id,
    current_company = COALESCE(NULLIF(p_company_name, ''), v_code.company_name),
    verification_status = 'verified',
    verified_at = NOW(),
    verified_by_code_id = v_code.id,
    headline = COALESCE(headline, 'Alumni Mentor at ' || v_code.company_name)
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'company_id', v_code.company_id,
    'company_name', v_code.company_name,
    'verified_at', NOW()
  );
END;
$$;

-- ==============================================================================
-- Row Level Security (RLS) Configuration
-- ==============================================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_code_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_attempts ENABLE ROW LEVEL SECURITY;

-- 11. Companies Policies
-- Authenticated users can view active companies (needed for discovery & autocomplete)
CREATE POLICY "Anyone can view active companies"
  ON public.companies
  FOR SELECT
  TO authenticated, anon
  USING (status = 'active');

-- Only service_role or admin can manage companies
CREATE POLICY "Admins can manage companies"
  ON public.companies
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 12. Company Verification Codes Policies
-- SECURITY REQUIREMENT: Ordinary users must NEVER query company verification codes directly
CREATE POLICY "Admins can view verification codes"
  ON public.company_verification_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage verification codes"
  ON public.company_verification_codes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 13. Company Code Redemptions Policies
-- Users can view their own redemptions
CREATE POLICY "Users can view their own redemptions"
  ON public.company_code_redemptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all redemptions"
  ON public.company_code_redemptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 14. Profiles Policies
-- Authenticated users can view profiles
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update non-privileged fields on their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 15. Verification Attempts Policies
-- Only service_role and admins can view verification attempt logs
CREATE POLICY "Admins can view verification attempts"
  ON public.verification_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ==============================================================================
-- Initial Seed Data: Participating Companies & Verification Codes
-- ==============================================================================

-- Seed verified organizations
INSERT INTO public.companies (id, name, domain, status)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Datadog', 'datadog.com', 'active'),
  ('c0000000-0000-0000-0000-000000000002', 'Google', 'google.com', 'active'),
  ('c0000000-0000-0000-0000-000000000003', 'Airbnb', 'airbnb.com', 'active'),
  ('c0000000-0000-0000-0000-000000000004', 'Stripe', 'stripe.com', 'active'),
  ('c0000000-0000-0000-0000-000000000005', 'Stanford University', 'stanford.edu', 'active')
ON CONFLICT (name) DO UPDATE
SET status = EXCLUDED.status, domain = EXCLUDED.domain;

-- Seed verifiable codes for testing:
-- Note: Code hashes below are SHA-256 of:
-- 1) "DDOG-ALUM-2026" (Multi-use code for Datadog)
--    SHA-256: 4b29bb3ff73e614bb5f84d0092c73d9e87707e44e99f57fa3c1c911cf232c1eb
-- 2) "GOOG-PARTNER-77" (Multi-use code for Google)
--    SHA-256: a8883e1c6b16d418dc47690623270428be014aa2d6507a21396fce6c5c0d24f0
-- 3) "ABNB-SINGLE-101" (Single-use code for Airbnb)
--    SHA-256: 39a04f938d21c436b772b12bbda1c62f2f1165aebcf40c8fa216bb65ebcf997e
-- 4) "STRP-EXPIRED-99" (Expired code for Stripe)
--    SHA-256: db93e8e19c35583aa79d23507c91d8486ce45b23b3a3224b10b0b83e390c9b68
-- 5) "DDOG-REVOKED-00" (Revoked code for Datadog)
--    SHA-256: 5fcfbe42c0eb4a6838a6a2daef30c926a576d338f0c9ea47b97c0c1b4b574169

INSERT INTO public.company_verification_codes (
  company_id,
  code_hash,
  code_prefix,
  status,
  expires_at,
  max_uses,
  uses_count,
  notes
)
VALUES
  -- 1. Active Multi-Use Datadog Code
  (
    'c0000000-0000-0000-0000-000000000001',
    '4b29bb3ff73e614bb5f84d0092c73d9e87707e44e99f57fa3c1c911cf232c1eb',
    'DDOG',
    'active',
    NOW() + INTERVAL '1 year',
    500,
    0,
    'Official Spring 2026 Datadog Alumni Mentorship Batch'
  ),
  -- 2. Active Multi-Use Google Code
  (
    'c0000000-0000-0000-0000-000000000002',
    'a8883e1c6b16d418dc47690623270428be014aa2d6507a21396fce6c5c0d24f0',
    'GOOG',
    'active',
    NOW() + INTERVAL '1 year',
    100,
    0,
    'Google University Relations Mentor Code'
  ),
  -- 3. Active Single-Use Airbnb Code
  (
    'c0000000-0000-0000-0000-000000000003',
    '39a04f938d21c436b772b12bbda1c62f2f1165aebcf40c8fa216bb65ebcf997e',
    'ABNB',
    'active',
    NOW() + INTERVAL '6 months',
    1,
    0,
    'Single-Use VIP Invite for Airbnb Mentors'
  ),
  -- 4. Expired Stripe Code
  (
    'c0000000-0000-0000-0000-000000000004',
    'db93e8e19c35583aa79d23507c91d8486ce45b23b3a3224b10b0b83e390c9b68',
    'STRP',
    'expired',
    NOW() - INTERVAL '1 month',
    50,
    12,
    'Expired 2025 Stripe Alumni Cohort'
  ),
  -- 5. Revoked Datadog Code
  (
    'c0000000-0000-0000-0000-000000000001',
    '5fcfbe42c0eb4a6838a6a2daef30c926a576d338f0c9ea47b97c0c1b4b574169',
    'DDOG',
    'revoked',
    NOW() + INTERVAL '6 months',
    20,
    3,
    'Revoked Security Compromised Token'
  )
ON CONFLICT (code_hash) DO NOTHING;
