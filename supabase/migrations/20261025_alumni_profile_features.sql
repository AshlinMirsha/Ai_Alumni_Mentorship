-- ==============================================================================
-- AlumniPath Additive Migration: Dynamic Alumni Professional Profile Schema
-- Migration: 20261025_alumni_profile_features.sql
-- ==============================================================================
-- Safe, non-destructive migration that adds fully dynamic alumni professional profile columns.
-- No hardcoded data. All existing tables, columns, records, and policies are strictly preserved.

-- 1. Add Dynamic Alumni Profile Columns to public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS specializations JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS current_employment JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS work_experience JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS internships JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS career_journey JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS mentorship_interests JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS skills_detailed JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS detailed_education JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS other_professional_links JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS specialization_details JSONB DEFAULT '{}'::jsonb;

-- 2. Indexes for efficient lookup
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city) WHERE city IS NOT NULL;

-- 3. Row Level Security verification for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Public profiles read'
  ) THEN
    CREATE POLICY "Public profiles read"
      ON public.profiles FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
