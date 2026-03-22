create table if not exists public.whatsapp_sessions (
  wa_id text primary key,
  state text not null default 'idle',
  goal text,
  file_name text,
  cv_base64 text,
  analysis_json jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists whatsapp_sessions_state_idx on public.whatsapp_sessions(state);
