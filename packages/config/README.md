# @vital/config

**Version:** 0.1.0  
**Purpose:** Shared configuration for VITAL Platform monorepo

---

## Overview

This package provides shared configuration files for ESLint, TypeScript, and Tailwind CSS that are used across all workspace packages and applications.

---

## Installation

This package is automatically included in the monorepo workspace. No manual installation needed.

---

## Usage

### TypeScript Configuration

```json
// tsconfig.json
{
  "extends": "@vital/config/typescript"
}
```

**Provides:**
- Base TypeScript compiler options
- Path mappings
- Strict type checking settings

---

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": "@vital/config/eslint"
}
```

**Provides:**
- Monorepo-aware ESLint rules
- TypeScript ESLint integration
- Prettier integration
- Next.js specific rules

---

### Tailwind Configuration

```js
// tailwind.config.js
const baseConfig = require('@vital/config/tailwind');

module.exports = {
  ...baseConfig,
  // Your app-specific overrides
};
```

**Provides:**
- Base Tailwind theme
- Shared color palette
- Common utility classes

---

## Structure

```
config/
├── src/
│   ├── typescript/
│   │   └── tsconfig.base.json    # Base TypeScript config
│   ├── eslint/
│   │   └── .eslintrc.js          # ESLint configuration
│   └── tailwind/
│       └── tailwind.config.js   # Tailwind configuration
└── package.json
```

---

## Exports

| Export | Path | Description |
|--------|------|-------------|
| `./typescript` | `src/typescript/tsconfig.base.json` | TypeScript base config |
| `./eslint` | `src/eslint/.eslintrc.js` | ESLint configuration |
| `./tailwind` | `src/tailwind/tailwind.config.js` | Tailwind configuration |

---

## Dependencies

- `@typescript-eslint/eslint-plugin` - TypeScript ESLint rules
- `@typescript-eslint/parser` - TypeScript parser for ESLint
- `eslint-config-next` - Next.js ESLint config
- `eslint-config-prettier` - Prettier integration
- `tailwindcss` - Tailwind CSS
- `autoprefixer` - CSS autoprefixer
- `postcss` - PostCSS processor

---

## Contributing

When updating shared configurations:

1. Test changes across all workspace packages
2. Ensure compatibility with Next.js, React, and TypeScript versions
3. Update this README if exports change

---

## License

Private - VITAL Path Platform
