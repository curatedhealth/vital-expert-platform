# Alembic Migrations

- Config: `alembic.ini` (script_location = alembic)
- Entry: `alembic/env.py` (expects DATABASE_URL)

Run:
```bash
cd services/ai-engine
export DATABASE_URL=postgresql://USER:PASS@HOST:PORT/DB
alembic upgrade head
```
