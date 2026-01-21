-- Migration: Initial schema for Motioner
-- Purpose: Create tables for PRs, videos, and user data
-- Affected tables: pull_requests, videos, user_profiles

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create user_profiles table
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  github_username text,
  github_access_token text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.user_profiles is 'User profiles with GitHub integration';

-- Create pull_requests table
create table public.pull_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  github_pr_id bigint not null,
  github_repo text not null,
  github_repo_owner text not null,
  title text not null,
  description text,
  pr_url text not null,
  diff_text text,
  pr_number integer not null,
  merged_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint unique_github_pr unique (github_repo_owner, github_repo, github_pr_id)
);

comment on table public.pull_requests is 'GitHub pull requests that have been processed';

-- Create videos table
create table public.videos (
  id uuid primary key default uuid_generate_v4(),
  pull_request_id uuid references public.pull_requests(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  theme text not null,
  title text not null,
  voiceover_script text,
  highlight_code text,
  duration_seconds integer default 15,
  status text default 'pending' not null,
  remotion_props jsonb,
  video_url text,
  thumbnail_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.videos is 'Generated changelog videos from PRs';

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger update_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.update_updated_at();

create trigger update_pull_requests_updated_at
before update on public.pull_requests
for each row
execute function public.update_updated_at();

create trigger update_videos_updated_at
before update on public.videos
for each row
execute function public.update_updated_at();

-- Enable Row Level Security
alter table public.user_profiles enable row level security;
alter table public.pull_requests enable row level security;
alter table public.videos enable row level security;

-- RLS Policies for user_profiles
create policy "Users can view their own profile"
on public.user_profiles
for select
to authenticated
using ( (select auth.uid()) = id );

create policy "Users can insert their own profile"
on public.user_profiles
for insert
to authenticated
with check ( (select auth.uid()) = id );

create policy "Users can update their own profile"
on public.user_profiles
for update
to authenticated
using ( (select auth.uid()) = id )
with check ( (select auth.uid()) = id );

-- RLS Policies for pull_requests
create policy "Users can view their own pull requests"
on public.pull_requests
for select
to authenticated
using ( (select auth.uid()) = user_id );

create policy "Users can insert their own pull requests"
on public.pull_requests
for insert
to authenticated
with check ( (select auth.uid()) = user_id );

create policy "Users can update their own pull requests"
on public.pull_requests
for update
to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );

-- RLS Policies for videos
create policy "Users can view their own videos"
on public.videos
for select
to authenticated
using ( (select auth.uid()) = user_id );

create policy "Users can insert their own videos"
on public.videos
for insert
to authenticated
with check ( (select auth.uid()) = user_id );

create policy "Users can update their own videos"
on public.videos
for update
to authenticated
using ( (select auth.uid()) = user_id )
with check ( (select auth.uid()) = user_id );

create policy "Users can delete their own videos"
on public.videos
for delete
to authenticated
using ( (select auth.uid()) = user_id );

-- Create indexes for performance
create index idx_pull_requests_user_id on public.pull_requests(user_id);
create index idx_pull_requests_github_pr on public.pull_requests(github_repo_owner, github_repo, github_pr_id);
create index idx_videos_user_id on public.videos(user_id);
create index idx_videos_pull_request_id on public.videos(pull_request_id);
create index idx_videos_status on public.videos(status);

