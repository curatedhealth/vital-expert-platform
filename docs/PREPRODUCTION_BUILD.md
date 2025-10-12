# Pre-Production Build Configuration

This document explains how to build the application for pre-production environments, which excludes admin functionality.

## Overview

The pre-production build excludes all admin pages and functionality to:
- Reduce build complexity
- Improve security by removing admin access
- Speed up deployment
- Reduce bundle size

## Build Commands

### Standard Build (includes admin)
```bash
npm run build
```

### Pre-Production Build (excludes admin)
```bash
npm run build:preprod
```

## How It Works

The pre-production build process:

1. **Temporarily moves** all admin pages to a temporary directory
2. **Runs the build** without admin pages
3. **Restores** admin pages after build completion
4. **Cleans up** temporary files

## What's Excluded

The following admin pages and functionality are excluded from pre-production builds:

- `/admin` - Main admin dashboard
- `/admin/alerts` - Alert management
- `/admin/api-keys` - API key management
- `/admin/audit-*` - Audit functionality
- `/admin/backup` - Backup management
- `/admin/compliance` - Compliance management
- `/admin/costs` - Cost management
- `/admin/governance` - Governance management
- `/admin/health` - Health monitoring
- `/admin/identity` - Identity management
- `/admin/security` - Security management
- `/admin/settings` - System settings
- `/admin/tenants` - Tenant management
- `/admin/users` - User management

## Environment Variables

You can also use environment variables to control the build:

```bash
# Set build target
export BUILD_TARGET=preprod

# Run build
npm run build
```

## Build Results

### Standard Build
- **Pages**: ~52 pages (includes admin)
- **Bundle Size**: Larger due to admin functionality

### Pre-Production Build
- **Pages**: ~36 pages (excludes admin)
- **Bundle Size**: Smaller, faster loading
- **Security**: No admin access points

## Deployment

For pre-production deployments, use:

```bash
npm run build:preprod
npm run start
```

This ensures that admin functionality is not available in pre-production environments while maintaining all core application features.

## Troubleshooting

If you encounter issues with the pre-production build:

1. **Check admin pages are restored**: Run `npm run build:preprod` again to ensure admin pages are properly restored
2. **Manual restore**: If needed, you can manually restore admin pages using the script:
   ```bash
   node scripts/preprod-build.js restore
   ```
3. **Clean build**: If issues persist, clean the build cache:
   ```bash
   rm -rf .next
   npm run build:preprod
   ```
