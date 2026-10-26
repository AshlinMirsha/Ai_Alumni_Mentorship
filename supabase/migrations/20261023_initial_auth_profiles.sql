-- ==============================================================================
-- AlumniPath Supabase Authentication & Profile Schema
-- ==============================================================================

-- 1. Create Public Profiles Table linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'alumni')),
  institution TEXT,
  department TEXT,
  academic_year TEXT,
  graduation_year INTEGER,
  current_role TEXT,
  current_company TEXT,
  headline TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS) on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Row Level Security Policies
-- Authenticated users can view all profiles (needed for student/alumni discovery & networking)
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

-- Users can update only their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Automatic Profile Creation on Signup via Database Trigger
-- This function runs with SECURITY DEFINER privileges to create the profile row
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
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'institution',
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'academic_year',
    NULLIF(NEW.raw_user_meta_data->>'graduation_year', '')::INTEGER,
    NEW.raw_user_meta_data->>'current_role',
    NEW.raw_user_meta_data->>'current_company',
    CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'alumni' THEN
        COALESCE(
          NEW.raw_user_meta_data->>'headline',
          CONCAT_WS(' at ', NULLIF(NEW.raw_user_meta_data->>'current_role', ''), NULLIF(NEW.raw_user_meta_data->>'current_company', ''))
        )
      ELSE
        COALESCE(
          NEW.raw_user_meta_data->>'headline',
          CONCAT_WS(' · ', NULLIF(NEW.raw_user_meta_data->>'academic_year', ''), NULLIF(NEW.raw_user_meta_data->>'department', ''))
        )
    END,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Trigger definition for auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Timestamp auto-update trigger for public.profiles
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
