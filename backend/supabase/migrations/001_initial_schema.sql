create extension if not exists pgcrypto;

create type public.user_role as enum ('ADMIN','RECRUITER');
create type public.job_status as enum ('Open','Closed','Draft');
create type public.location_type as enum ('Remote','Hybrid','On-site');
create type public.resume_status as enum ('New','Screened','Shortlisted','Rejected','Interviewing');
create type public.interview_type as enum ('Phone','Video','On-site');

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 150),
  website text,
  location text,
  size text,
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text not null,
  name text not null,
  password_hash text not null,
  job_title text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'RECRUITER',
  created_at timestamptz not null default now(),
  constraint users_email_normalized check (email = lower(trim(email)))
);
create unique index users_email_unique on public.users(email);
create index users_company_idx on public.users(company_id);

create table public.refresh_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  csrf_hash text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  replaced_by uuid references public.refresh_sessions(id),
  created_at timestamptz not null default now()
);
create index refresh_sessions_user_idx on public.refresh_sessions(user_id);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text not null,
  role public.user_role not null,
  token_hash text not null unique,
  invited_by uuid not null references public.users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.password_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.notification_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  new_candidate boolean not null default true,
  application boolean not null default true,
  weekly_digest boolean not null default true,
  product_update boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  department text not null,
  location text not null,
  location_type public.location_type not null,
  required_skills text[] not null default '{}',
  required_experience text not null default '',
  education text not null default '',
  languages text[] not null default '{}',
  status public.job_status not null default 'Draft',
  posted_date timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index jobs_company_idx on public.jobs(company_id);

create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete restrict,
  name text not null,
  position_applied text not null,
  years_experience numeric not null default 0,
  skills text[] not null default '{}',
  education text not null default '',
  languages text[] not null default '{}',
  location text not null default '',
  location_type public.location_type not null,
  email text not null,
  phone text not null default '',
  resume_status public.resume_status not null default 'New',
  match_score numeric not null default 0 check (match_score between 0 and 100),
  availability text not null default '',
  summary text not null default '',
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  experience_timeline jsonb not null default '[]',
  certificates text[] not null default '{}',
  portfolio text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index candidates_company_idx on public.candidates(company_id);
create index candidates_job_idx on public.candidates(job_id);
create index candidates_created_idx on public.candidates(created_at);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  candidate_id uuid references public.candidates(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  type text not null,
  title text not null,
  detail text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_company_idx on public.notifications(company_id,created_at desc);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  interviewer_id uuid references public.users(id) on delete set null,
  interviewer text not null,
  starts_at timestamptz not null,
  type public.interview_type not null,
  location_or_link text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index interviews_company_start_idx on public.interviews(company_id,starts_at);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index audit_company_created_idx on public.audit_logs(company_id,created_at desc);

alter table public.companies enable row level security;
alter table public.users enable row level security;
alter table public.refresh_sessions enable row level security;
alter table public.invitations enable row level security;
alter table public.password_resets enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.jobs enable row level security;
alter table public.candidates enable row level security;
alter table public.notifications enable row level security;
alter table public.interviews enable row level security;
alter table public.audit_logs enable row level security;

revoke all on all tables in schema public from anon, authenticated;
