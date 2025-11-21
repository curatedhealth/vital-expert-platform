# bin/ - Executable Shortcuts

Quick access to common operational commands through symlinks.

## Usage

All scripts in this directory are executable shortcuts (symlinks) to scripts in the main `scripts/` directory.

```bash
# View all available commands
ls -la

# Run a command
./setup-environment dev
./deploy-production
./health-check
```

## Available Commands

- `setup-environment` - Setup development/staging/production environment
- `deploy-production` - Deploy to production
- `run-migrations` - Run database migrations
- `start-services` - Start all services
- `stop-services` - Stop all services
- `health-check` - Check system health
- `create-backup` - Create database backup
- `rollback` - Rollback deployment

## Adding New Commands

To add a new command to bin/:
```bash
ln -s ../scripts/<category>/<script-name>.sh <command-name>
chmod +x <command-name>
```

## Best Practices

- Keep command names simple and intuitive
- Use kebab-case for naming
- Ensure all symlinks point to existing scripts
- Test commands before committing

