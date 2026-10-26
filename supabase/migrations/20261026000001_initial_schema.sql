-- ====================================================================
-- AlumniPath Initial Schema & Security Configuration
-- ====================================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Public user profile synced with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text,
  role text not null check (role in ('student', 'alumni', 'admin')),
  avatar_url text,
  headline text,
  bio text,
  university text,
  major text,
  graduation_year integer,
  current_company text,
  current_title text,
  location text,
  linkedin_url text,
  github_url text,
  skills text[] default '{}',
  interests text[] default '{}',
  career_goals text,
  years_experience integer default 0,
  is_verified boolean default false,
  available_for_mentorship boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. MENTORSHIP REQUESTS TABLE
create table if not exists public.mentorship_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  alumni_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('pending', 'accepted', 'declined', 'completed')) default 'pending',
  topic text not null,
  message text not null,
  scheduled_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. CHAT CONVERSATIONS & MESSAGES
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  title text,
  conversation_type text not null check (conversation_type in ('peer', 'ai_assistant')) default 'peer',
  created_by uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create table if not exists public.conversation_participants (
  conversation_id uuid references public.conversations(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default timezone('utc'::text, now()) not null,
  primary key (conversation_id, profile_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  role text not null check (role in ('user', 'assistant', 'system')) default 'user',
  content text not null,
  model_used text,
  reasoning_content text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. RESUME REVIEWS TABLE
create table if not exists public.resume_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  file_name text not null,
  file_size text,
  target_role text not null,
  overall_score integer not null,
  ats_score integer not null,
  summary text not null,
  skills_identified jsonb not null default '{}'::jsonb,
  strengths text[] default '{}',
  areas_to_improve jsonb not null default '[]'::jsonb,
  project_suggestions jsonb not null default '[]'::jsonb,
  recommended_next_steps jsonb not null default '[]'::jsonb,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.mentorship_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.resume_reviews enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Mentorship Requests Policies
create policy "Users can view their own mentorship requests as student or alumni"
  on public.mentorship_requests for select
  to authenticated
  using (auth.uid() = student_id or auth.uid() = alumni_id);

create policy "Students can create mentorship requests"
  on public.mentorship_requests for insert
  to authenticated
  with check (auth.uid() = student_id);

create policy "Participants can update their mentorship requests"
  on public.mentorship_requests for update
  to authenticated
  using (auth.uid() = student_id or auth.uid() = alumni_id);

-- Conversations Policies
create policy "Participants can view their conversations"
  on public.conversations for select
  to authenticated
  using (
    id in (
      select conversation_id from public.conversation_participants
      where profile_id = auth.uid()
    ) or created_by = auth.uid()
  );

create policy "Authenticated users can create conversations"
  on public.conversations for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Messages Policies
create policy "Participants can view messages in their conversations"
  on public.messages for select
  to authenticated
  using (
    conversation_id in (
      select id from public.conversations
      where created_by = auth.uid()
      union
      select conversation_id from public.conversation_participants
      where profile_id = auth.uid()
    )
  );

create policy "Participants can insert messages"
  on public.messages for insert
  to authenticated
  with check (
    conversation_id in (
      select id from public.conversations
      where created_by = auth.uid()
      union
      select conversation_id from public.conversation_participants
      where profile_id = auth.uid()
    )
  );

-- Resume Reviews Policies
create policy "Users can view their own resume reviews"
  on public.resume_reviews for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own resume reviews"
  on public.resume_reviews for insert
  to authenticated
  with check (auth.uid() = user_id or user_id is null);

-- Automatically handle user profile creation on auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    avatar_url,
    university,
    major,
    graduation_year,
    current_company,
    current_title
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'university',
    new.raw_user_meta_data->>'major',
    (new.raw_user_meta_data->>'graduation_year')::integer,
    new.raw_user_meta_data->>'current_company',
    new.raw_user_meta_data->>'current_title'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to execute on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

