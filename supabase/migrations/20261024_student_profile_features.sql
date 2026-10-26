-- ==============================================================================
-- AlumniPath Additive Migration: Dynamic Student Profile Schema
-- Migration: 20261024_student_profile_features.sql
-- ==============================================================================
-- Safe, non-destructive migration that adds fully dynamic student profile columns.
-- No hardcoded data. All existing tables, columns, records, and policies are strictly preserved.

-- 1. Add Dynamic Student Profile Columns to public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS degree TEXT,
  ADD COLUMN IF NOT EXISTS desired_role TEXT,
  ADD COLUMN IF NOT EXISTS preferred_location TEXT,
  ADD COLUMN IF NOT EXISTS internship_interest TEXT,
  ADD COLUMN IF NOT EXISTS current_activities JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS technical_skills JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
  ADD COLUMN IF NOT EXISTS leetcode_url TEXT,
  ADD COLUMN IF NOT EXISTS other_links JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS projects JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS target_companies JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS career_goals JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '{}'::jsonb;

-- 2. Indexes for efficient lookup
CREATE INDEX IF NOT EXISTS idx_profiles_github ON public.profiles(github_url) WHERE github_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_desired_role ON public.profiles(desired_role) WHERE desired_role IS NOT NULL;

-- 3. Row Level Security Policies for profiles table (if not already existing)
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

-- 4. Supabase Storage: Avatars bucket for profile picture uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. Storage Security Policies for Avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public avatar access'
  ) THEN
    CREATE POLICY "Public avatar access"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated avatar upload'
  ) THEN
    CREATE POLICY "Authenticated avatar upload"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'avatars');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated avatar update'
  ) THEN
    CREATE POLICY "Authenticated avatar update"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'avatars');
  END IF;
END $$;
