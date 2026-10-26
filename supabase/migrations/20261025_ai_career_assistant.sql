-- ==============================================================================
-- AlumniPath Additive Migration: AI Career Assistant & Career Services Schema
-- Migration: 20261025_ai_career_assistant.sql
-- ==============================================================================
-- Safe, non-destructive migration adding tables and policies for AI Career Assistant,
-- roadmaps, skill gaps, and secure resume reviews.
-- Strictly preserves all existing tables, profiles, and columns.

-- 1. Career Assistant Conversations
CREATE TABLE IF NOT EXISTS public.career_assistant_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Career Advisory Chat',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_conv_user ON public.career_assistant_conversations(user_id);

-- 2. Career Assistant Messages
CREATE TABLE IF NOT EXISTS public.career_assistant_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.career_assistant_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  suggestions JSONB DEFAULT '[]'::jsonb,
  suggested_actions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_msg_conv ON public.career_assistant_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_career_msg_user ON public.career_assistant_messages(user_id);

-- 3. Student Career Roadmaps (Personalized Track & Progress)
CREATE TABLE IF NOT EXISTS public.student_career_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  stages JSONB NOT NULL DEFAULT '[]'::jsonb,
  completion_percentage INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_student_roadmap_role UNIQUE(user_id, target_role)
);

CREATE INDEX IF NOT EXISTS idx_student_roadmaps_user ON public.student_career_roadmaps(user_id);

-- 4. Student Resume Reviews
CREATE TABLE IF NOT EXISTS public.student_resume_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size TEXT NOT NULL,
  target_role TEXT NOT NULL,
  review_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_reviews_user ON public.student_resume_reviews(user_id);

-- 5. Row Level Security Policies (Ensure absolute privacy between students)
ALTER TABLE public.career_assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_career_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_resume_reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Conversations RLS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'career_assistant_conversations' AND policyname = 'Users can view own conversations') THEN
    CREATE POLICY "Users can view own conversations" ON public.career_assistant_conversations
      FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'career_assistant_conversations' AND policyname = 'Users can insert own conversations') THEN
    CREATE POLICY "Users can insert own conversations" ON public.career_assistant_conversations
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'career_assistant_conversations' AND policyname = 'Users can delete own conversations') THEN
    CREATE POLICY "Users can delete own conversations" ON public.career_assistant_conversations
      FOR DELETE TO authenticated USING (auth.uid() = user_id);
  END IF;

  -- Messages RLS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'career_assistant_messages' AND policyname = 'Users can view own messages') THEN
    CREATE POLICY "Users can view own messages" ON public.career_assistant_messages
      FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'career_assistant_messages' AND policyname = 'Users can insert own messages') THEN
    CREATE POLICY "Users can insert own messages" ON public.career_assistant_messages
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Roadmaps RLS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_career_roadmaps' AND policyname = 'Users can view own roadmaps') THEN
    CREATE POLICY "Users can view own roadmaps" ON public.student_career_roadmaps
      FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_career_roadmaps' AND policyname = 'Users can insert own roadmaps') THEN
    CREATE POLICY "Users can insert own roadmaps" ON public.student_career_roadmaps
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_career_roadmaps' AND policyname = 'Users can update own roadmaps') THEN
    CREATE POLICY "Users can update own roadmaps" ON public.student_career_roadmaps
      FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Resume Reviews RLS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_resume_reviews' AND policyname = 'Users can view own resume reviews') THEN
    CREATE POLICY "Users can view own resume reviews" ON public.student_resume_reviews
      FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_resume_reviews' AND policyname = 'Users can insert own resume reviews') THEN
    CREATE POLICY "Users can insert own resume reviews" ON public.student_resume_reviews
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 6. Supabase Storage: Private resumes bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload own resume') THEN
    CREATE POLICY "Users can upload own resume" ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can read own resume') THEN
    CREATE POLICY "Users can read own resume" ON storage.objects
      FOR SELECT TO authenticated USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;
