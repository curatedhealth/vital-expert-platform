# VITAL Platform - Test Suite

**Last Updated:** December 14, 2025  
**Structure:** Organized by test type

---

## Test Organization

```
tests/
├── unit/                    # Unit tests
│   └── [test files]
│
├── integration/             # Integration tests
│   └── [test files]
│
├── e2e/                     # End-to-end tests (Playwright)
│   ├── helpers/
│   ├── specs/
│   └── [config files]
│
├── performance/             # Performance tests (k6)
│   └── [test files]
│
├── scripts/                 # Test runner scripts
│   └── [runner scripts]
│
└── docs/                    # Test documentation
    └── [documentation]
```

---

## Running Tests

### Unit Tests

```bash
# Run unit tests
cd tests/unit
node prompt-starters-api.test.js
node prompt-detail-api.test.js
```

### Integration Tests

```bash
# Run integration tests
cd tests/integration
node test_supabase_connection.js
python test_interactive_engine.py
```

### E2E Tests

```bash
# Run E2E tests (Playwright)
cd tests/e2e
pnpm install
pnpm test
```

See [e2e/README.md](./e2e/README.md) for details.

### Performance Tests

```bash
# Run performance tests (k6)
cd tests/performance
k6 run api-load-test.js
```

See [performance/README.md](./performance/README.md) for details.

### All Tests

```bash
# Run all tests via script
cd tests/scripts
./run-all-tests.js
```

---

## Test Categories

### Unit Tests
- Fast, isolated tests
- Test individual functions/components
- No external dependencies

### Integration Tests
- Test component interactions
- May require database/API connections
- Test full workflows

### E2E Tests
- Test complete user flows
- Browser-based (Playwright)
- Full application stack

### Performance Tests
- Load and stress testing
- k6-based
- API performance metrics

---

## Database Tests

Database test queries are located in:
```
database/postgres/tests/queries/
```

These SQL files contain test queries for database verification.

---

## Test Documentation

Test documentation is located in:
```
tests/docs/
```

Includes:
- Test plans
- Test results
- Test documentation

---

## Contributing

When adding new tests:

1. **Unit tests** → `tests/unit/`
2. **Integration tests** → `tests/integration/`
3. **E2E tests** → `tests/e2e/specs/`
4. **Performance tests** → `tests/performance/`
5. **Database test queries** → `database/postgres/tests/queries/`
6. **Test runners** → `tests/scripts/`
7. **Test docs** → `tests/docs/`

---

## CI/CD Integration

Tests run automatically in GitHub Actions:
- Unit tests: On every push
- Integration tests: On every push
- E2E tests: On pull requests
- Performance tests: Nightly

---

**See Also:**
- [E2E Tests README](./e2e/README.md)
- [Performance Tests README](./performance/README.md)
- [Test Documentation](./docs/)
