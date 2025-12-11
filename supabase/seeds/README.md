# Supabase Seeds (Ask Expert Modes 3/4)

This directory contains SQL seed files provided by the user for missions and runner integration. Run them against your Supabase/Postgres instance as needed (order according to dependencies):

1) `seed_runners_v4_isolated.sql` — Runner/schema seed
2) `seed_mission_templates.sql` — Mission templates seed
3) `seed_missions_infrastructure.sql` — Missions/events/artifacts/checkpoints/todos/sources

These are non-executable here; apply via `psql`/Supabase tooling in your environment.
