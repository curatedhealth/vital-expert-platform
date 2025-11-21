-- Create agent_memories table for persistent agent context
create table if not exists agent_memories (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null,
  summary text not null,
  details text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists agent_memories_agent_id_idx on agent_memories(agent_id, created_at desc);

comment on table agent_memories is 'Lightweight agent memory snippets used to personalize interactions.';
comment on column agent_memories.summary is 'Short summary of the remembered fact or preference.';
comment on column agent_memories.details is 'Detailed context captured from the interaction.';
