-- À exécuter dans Supabase → SQL Editor (une seule fois)
create table if not exists kv (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

alter table kv enable row level security;

-- Politique ouverte : toute personne disposant de la clé anon peut lire/écrire.
-- Suffisant pour un outil interne dont l'URL reste privée.
-- Pour durcir plus tard : ajouter Supabase Auth et restreindre par utilisateur.
create policy "kv_all" on kv for all using (true) with check (true);
