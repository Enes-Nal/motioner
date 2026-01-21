-- Migration: Allow videos without pull_request_id (project overview videos)
-- Purpose: Support generating videos for repos that have no PRs yet or when a repo URL is provided
-- Affected tables: videos

alter table public.videos
  alter column pull_request_id drop not null;
