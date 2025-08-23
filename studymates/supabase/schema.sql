-- Enable required extensions
create extension if not exists pgcrypto;

-- Profiles mirrors auth.users
create table if not exists public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	email text unique,
	display_name text,
	shape text,
	color text,
	created_at timestamptz default now()
);

create table if not exists public.groups (
	id uuid primary key default gen_random_uuid(),
	owner_id uuid not null references public.profiles(id) on delete cascade,
	name text not null,
	convenience_tags text[] default '{}',
	created_at timestamptz default now()
);

-- A study session for a group with Pomodoro state
create table if not exists public.sessions (
	id uuid primary key default gen_random_uuid(),
	group_id uuid not null references public.groups(id) on delete cascade,
	status text not null default 'idle', -- idle | focus | break
	pomodoro_started_at timestamptz,
	focus_minutes int default 25,
	break_minutes int default 5,
	created_at timestamptz default now()
);

create table if not exists public.join_requests (
	id uuid primary key default gen_random_uuid(),
	session_id uuid not null references public.sessions(id) on delete cascade,
	requester_id uuid not null references public.profiles(id) on delete cascade,
	status text not null default 'queued', -- queued | accepted | expired | cancelled
	message text,
	expires_at timestamptz,
	created_at timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.sessions enable row level security;
alter table public.join_requests enable row level security;