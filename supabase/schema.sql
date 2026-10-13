-- =============================================================================
-- Ali Agent — Supabase Production Schema
-- Run this in the Supabase SQL Editor to provision all tables & indexes.
-- =============================================================================

create extension if not exists "pgcrypto";

-- 1. LEADS
create table if not exists public.leads (
  id text primary key,
  name text not null,
  phone text not null,
  city text not null default '',
  interest text not null default '',
  network text not null default 'any',
  best_time text not null default 'any',
  source text not null default 'Website form',
  score integer not null default 50,
  status text not null default 'warm' check (status in ('hot', 'warm', 'cold', 'won', 'lost')),
  updated text not null default 'Just now',
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_created_at on public.leads(created_at desc);

-- 2. CONVERSATIONS
create table if not exists public.conversations (
  id text primary key,
  name text not null,
  phone text not null,
  city text not null default 'UK',
  channel text not null default 'web' check (channel in ('wa', 'web')),
  status text not null default 'bot' check (status in ('bot', 'human', 'waiting', 'closed')),
  time text not null default 'Just now',
  preview text not null default '',
  is_new boolean not null default true,
  score integer not null default 60,
  source text not null default 'Website widget',
  first_seen text not null default 'Just now',
  assignee text,
  tags jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_conversations_status on public.conversations(status);
create index if not exists idx_conversations_updated_at on public.conversations(updated_at desc);

-- 3. BOT CONFIG & PROMPT VERSIONS
create table if not exists public.bot_configs (
  id text primary key default 'default',
  prompt text not null,
  model text not null default 'claude-haiku-4-5-20251001',
  temperature numeric not null default 0.4,
  max_tokens integer not null default 512,
  escalate_discount boolean not null default true,
  escalate_complaint boolean not null default true,
  escalate_human boolean not null default true,
  escalate_long boolean not null default false,
  hash text not null default 'a3f9b2',
  updated_at timestamptz not null default now(),
  history jsonb not null default '[]'::jsonb
);

-- 4. KNOWLEDGE BASE ARTICLES
create table if not exists public.kb_articles (
  id text primary key,
  title text not null,
  category text not null default 'General',
  content text not null default '',
  updated text not null default 'Just now',
  uses integer not null default 0,
  created_at timestamptz not null default now()
);

-- 5. BROADCASTS
create table if not exists public.broadcasts (
  id text primary key,
  title text not null,
  message text not null default '',
  audience_key text not null default 'london',
  audience integer not null default 0,
  status text not null default 'draft' check (status in ('scheduled', 'sent', 'draft')),
  sends text not null default '—',
  created_at timestamptz not null default now()
);

-- 6. TEAM MEMBERS
create table if not exists public.team_members (
  id text primary key,
  name text not null,
  role text not null default 'Agent',
  email text not null,
  active text not null default 'Just now',
  handled integer not null default 0,
  created_at timestamptz not null default now()
);

-- 7. SETTINGS
create table if not exists public.app_settings (
  id text primary key default 'default',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
