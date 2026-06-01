-- Execute este arquivo uma única vez no SQL Editor do Supabase.

create table if not exists public.voxdev_comments (
  id uuid primary key,
  name text not null check (char_length(name) between 2 and 60),
  message text not null check (char_length(message) between 3 and 400),
  name_normalized text not null,
  message_normalized text not null,
  ip_hash text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists voxdev_comments_duplicate_idx
  on public.voxdev_comments (name_normalized, message_normalized);

create index if not exists voxdev_comments_rate_limit_idx
  on public.voxdev_comments (ip_hash, created_at desc);

alter table public.voxdev_comments enable row level security;

create table if not exists public.voxdev_contacts (
  id text primary key check (id = 'main'),
  config jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.voxdev_contacts enable row level security;

comment on table public.voxdev_comments is
  'Comentários públicos da VoxDev. A API serverless acessa a tabela com a chave service_role.';

comment on table public.voxdev_contacts is
  'Canais públicos da VoxDev editados pela área administrativa.';
