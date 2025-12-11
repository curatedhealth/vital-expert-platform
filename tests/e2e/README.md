# VITAL Platform - E2E Tests

End-to-end tests using Playwright.

## Setup

```bash
cd tests/e2e
pnpm install
npx playwright install
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Run headed (see browser)
pnpm test:headed

# Debug mode
pnpm test:debug

# Specific test file
pnpm test specs/auth.spec.ts

# Specific browser
pnpm test --project=chromium
```

## Test Structure

```
tests/e2e/
├── specs/                    # Test specifications
│   ├── auth.spec.ts          # Authentication tests
│   ├── ask-expert.spec.ts    # Ask Expert feature tests
│   └── workflow-designer.spec.ts  # Workflow Designer tests
├── helpers/                  # Test helpers
│   └── auth.ts               # Auth utilities
├── playwright.config.ts      # Playwright configuration
└── package.json
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BASE_URL` | Application URL (default: http://localhost:3000) |
| `TEST_USER_EMAIL` | Test user email |
| `TEST_USER_PASSWORD` | Test user password |

## CI Integration

Tests run automatically in GitHub Actions. See `.github/workflows/e2e.yml`.

## Code Generation

Use Playwright codegen to record tests:

```bash
pnpm codegen http://localhost:3000
```

---

**Version**: 1.0.0  
**Last Updated**: December 5, 2025






