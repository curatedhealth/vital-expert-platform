# Quick Start - VITAL Path Backend Server

## Start the Server

```bash
cd "/Users/hichamnaim/Downloads/Cursor/VITAL path/apps/vital-system"
python3 run_backend.py
```

The server will start on **http://0.0.0.0:8000**

## Verify It's Running

```bash
# Health check
curl http://localhost:8000/health | python3 -m json.tool

# Root endpoint
curl http://localhost:8000/ | python3 -m json.tool

# System info
curl http://localhost:8000/system/info | python3 -m json.tool
```

## API Documentation

When DEBUG mode is enabled, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Stop the Server

Press `Ctrl+C` in the terminal where the server is running.

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Check Server Logs
The server outputs logs to stdout. Look for:
- `✓` marks indicate successful operations
- `INFO` level shows normal operations
- `ERROR` level shows problems

### Test Server Startup
```bash
python3 test_server_startup.py
```

## Configuration

Edit `.env` file or set environment variables:

```bash
export PORT=8000
export HOST=0.0.0.0
export ENVIRONMENT=development
export DEBUG=true
export REDIS_URL=redis://localhost:6379
export DATABASE_URL=postgresql://localhost:5432/vital_path
```

## Integration with Frontend

The backend is configured for CORS to allow requests from:
- http://localhost:3000 (Next.js default)
- http://localhost:3001 (alternative port)

Update `CORS_ORIGINS` in `.env` to add more origins.
