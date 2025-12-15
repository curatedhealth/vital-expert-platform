# @vital/utils

**Version:** 0.1.0  
**Purpose:** Shared utility functions for VITAL Platform

---

## Overview

This package provides shared utility functions for formatting, validation, logging, and helper functions used across the VITAL Platform.

---

## Installation

```bash
pnpm add @vital/utils
```

---

## Usage

### Formatting

```typescript
import { formatDate, formatCurrency } from '@vital/utils/formatting';

const date = formatDate(new Date());
const price = formatCurrency(99.99);
```

### Validation

```typescript
import { validateEmail, validateMission } from '@vital/utils/validation';

const isValid = validateEmail('user@example.com');
const missionValidation = validateMission(missionData);
```

### Helpers

```typescript
import { debounce, throttle } from '@vital/utils/helpers';

const debouncedSearch = debounce((query) => {
  // Search logic
}, 300);
```

### Logging

```typescript
import { logger } from '@vital/utils/logging';

logger.info('Application started');
logger.error('Error occurred', { error });
```

---

## Structure

```
utils/
├── src/
│   ├── formatting/
│   │   └── index.ts       # Formatting utilities
│   ├── validation/
│   │   ├── index.ts       # General validation
│   │   └── mission.ts     # Mission-specific validation
│   ├── helpers/
│   │   └── index.ts       # Helper functions
│   ├── logging/
│   │   └── logger.ts      # Logging utilities
│   └── index.ts           # Main exports
└── package.json
```

---

## Exports

| Export | Path | Description |
|--------|------|-------------|
| `.` | `src/index.ts` | Main utility exports |
| `./formatting` | `src/formatting/index.ts` | Formatting functions |
| `./validation` | `src/validation/index.ts` | Validation functions |
| `./helpers` | `src/helpers/index.ts` | Helper functions |

---

## Available Utilities

### Formatting
- `formatDate()` - Format dates
- `formatCurrency()` - Format currency
- `formatNumber()` - Format numbers
- `formatDuration()` - Format time durations

### Validation
- `validateEmail()` - Email validation
- `validateURL()` - URL validation
- `validateMission()` - Mission data validation
- `validateUUID()` - UUID validation

### Helpers
- `debounce()` - Debounce function calls
- `throttle()` - Throttle function calls
- `sleep()` - Async delay
- `retry()` - Retry with backoff

### Logging
- `logger.info()` - Info level logging
- `logger.warn()` - Warning level logging
- `logger.error()` - Error level logging
- `logger.debug()` - Debug level logging

---

## Features

- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Tree-Shakeable** - Import only what you need
- ✅ **Well-Tested** - Comprehensive test coverage
- ✅ **Documented** - JSDoc comments for all functions

---

## Dependencies

- None (pure utility functions)

---

## License

Private - VITAL Path Platform
