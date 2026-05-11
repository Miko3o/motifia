-- Motifia dictionary. Run via Supabase SQL Editor or `supabase db push` / migration apply.
create table if not exists public.words (
  id serial primary key,
  word text not null unique,
  definition text,
  example text,
  part_of_speech text,
  motif text,
  mnemonic text,
  status text not null default 'queued'
    constraint words_status_check check (status in ('queued', 'accepted')),
  created_at timestamptz not null default now()
);

comment on table public.words is 'Motifia dictionary entries';

alter table public.words enable row level security;

insert into public.words (word, definition, example, part_of_speech, motif, mnemonic, status)
values
  ('coda', 'A closing passage marking the end of a phrase or composition.', null, 'noun', 'C E G', '', 'accepted'),
  ('rise', 'To ascend in pitch or intensity.', null, 'verb', 'D F# A', '', 'accepted'),
  ('bright', 'Sonic quality suggesting higher harmonics or major color.', null, 'adjective', 'A C# E', '', 'accepted')
on conflict (word) do nothing;
