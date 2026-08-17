-- Chat logs for the AI twin on edward2.com
-- Run once in the Supabase SQL editor (Dashboard → SQL Editor → New query).

create table if not exists public.chat_logs (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  session_id  uuid,                    -- random per tab, not tied to a person
  role        text not null check (role in ('visitor', 'twin')),
  message     text not null,
  no_answer   boolean not null default false  -- twin deflected: a gap to fix in the prompt
);

-- Read a conversation in order, and find the gaps quickly
create index if not exists chat_logs_session_idx on public.chat_logs (session_id, created_at);
create index if not exists chat_logs_no_answer_idx on public.chat_logs (created_at desc) where no_answer;

-- RLS on with no policies: the anon key (which is public) can neither read nor
-- write. Only the service role key, used server side in api/chat.js, has access.
alter table public.chat_logs enable row level security;
