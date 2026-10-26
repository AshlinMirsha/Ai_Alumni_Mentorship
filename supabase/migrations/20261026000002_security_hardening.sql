-- ====================================================================
-- AlumniPath Security Hardening & Strict Role-Based Access Controls
-- ====================================================================

-- 1. Ensure RLS is active on all public application tables
alter table public.profiles enable row level security;
alter table public.mentorship_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.resume_reviews enable row level security;

-- 2. Prevent role escalation: Authenticated users can NOT change their own role once assigned
create or replace function public.prevent_role_tampering()
returns trigger as $$
begin
  if old.role is not null and new.role is distinct from old.role then
    raise exception 'Permission denied: User role cannot be altered directly.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists check_role_tampering on public.profiles;
create trigger check_role_tampering
  before update on public.profiles
  for each row execute procedure public.prevent_role_tampering();

-- 3. Messages sanitization & validation
create or replace function public.validate_message_content()
returns trigger as $$
begin
  if length(trim(new.content)) = 0 then
    raise exception 'Message content cannot be empty.';
  end if;
  if length(new.content) > 10000 then
    raise exception 'Message content exceeds maximum allowed length (10,000 characters).';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists check_message_content on public.messages;
create trigger check_message_content
  before insert or update on public.messages
  for each row execute procedure public.validate_message_content();

