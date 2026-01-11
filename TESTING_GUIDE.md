# Testing Guide for Notes from the Majlis

This guide explains the automated and manual testing approaches for the application.

## Overview

We have **two complementary testing approaches**:

1. **Automated Tests** - Jest-based test suite for programmatic verification
2. **Manual Tests** - Human-guided testing plans for comprehensive validation

Both are important for ensuring quality before production deployment.

---

## Automated Testing

### Status: Structure Complete, Needs MongoDB + Refactoring

The automated test suite is **fully structured** but requires two things to run:

1. **MongoDB running locally** (tests use `dhassan-test` database)
2. **Server.js refactoring** to export the Express app (see `__tests__/README.md`)

### What's Included

✅ **Test Infrastructure:**
- Jest configuration in `package.json`
- Test helpers for database seeding (`__tests__/helpers.js`)
- Setup configuration (`__tests__/setup.js`)
- npm scripts for running tests

✅ **Test Files:**
- `public-routes.test.js` - Tests for landing, topics, series, lessons pages
- `authentication.test.js` - Tests for login, logout, and access control
- `admin-lessons.test.js` - Tests for lesson CRUD operations
- `admin-series.test.js` - Tests for series CRUD operations

✅ **Test Coverage:**
- 60+ test cases covering all major functionality
- Database operations validation
- Access control verification
- CRUD operations testing
- Error handling scenarios

### Running Automated Tests

**Prerequisites:**
```bash
# 1. Ensure MongoDB is running
sudo systemctl status mongod
# or
brew services list | grep mongodb

# 2. Install dependencies (already done)
npm install

# 3. Run tests
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

**Expected Current Behavior:**
Tests will fail with database connection errors if MongoDB is not running. This is expected and documented in `__tests__/README.md`.

### Making Tests Fully Functional

See the detailed guide in `__tests__/README.md` for:
- How to refactor `server.js` to export the app
- How to implement OAuth mocking
- How to uncomment and activate HTTP request tests

---

## Manual Testing

### Two Manual Test Plans Available

#### 1. Smoke Test (Quick - 15 minutes)
**File:** `SMOKE_TEST.md`

**Purpose:** Quick verification of critical functionality

**Use When:**
- Before deployment
- After major changes
- Quick sanity check

**Coverage:**
- Core user flows
- Critical features only
- Pass/fail assessment

#### 2. End-to-End Test Plan (Comprehensive - 60-90 minutes)
**File:** `E2E_TESTING_PLAN.md`

**Purpose:** Thorough testing of all features

**Phases:**
1. Public Pages Testing
2. Authentication Testing
3. Admin Panel Access Control
4. CRUD Testing - Lessons
5. CRUD Testing - Series
6. CRUD Testing - Users/Admins
7. Security Testing
8. Edge Cases & Error Handling
9. UI/UX Testing
10. Performance Testing
11. Data Integrity

**Use When:**
- Before first production deployment
- After significant feature additions
- For comprehensive quality assurance

---

## Testing Workflow Before Deployment

### Recommended Testing Sequence

**Phase 1: Quick Verification (15 min)**
1. Run smoke test (`SMOKE_TEST.md`)
2. Verify all critical paths work
3. If fails → fix issues and re-test

**Phase 2: Comprehensive Testing (60-90 min)**
1. Run full E2E test plan (`E2E_TESTING_PLAN.md`)
2. Document any issues found
3. Fix all issues
4. Re-test affected areas

**Phase 3: Automated Testing (Optional, Future)**
1. Ensure MongoDB is running
2. Run `npm test`
3. Verify all tests pass
4. Check coverage report: `npm run test:coverage`

**Phase 4: Pre-Production Checklist**
1. Follow `DEPLOYMENT_CHECKLIST.md`
2. Verify all environment variables set
3. Test on staging environment (if available)
4. Final smoke test in production-like environment

---

## Test Data Management

### Manual Testing
- Use existing production data or seed with `npm run populate-db`
- Create test admin accounts via Google OAuth
- Test series and lessons you can safely delete

### Automated Testing
- Tests use separate `dhassan-test` database
- Database automatically cleared and seeded before each test run
- Test data defined in `__tests__/helpers.js` `seedTestDatabase()`

---

## Continuous Integration (Future)

Once automated tests are fully functional, integrate with CI/CD:

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:5
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

This will automatically run tests on every push and pull request.

---

## File Reference

### Automated Testing Files
- `__tests__/README.md` - Detailed testing documentation
- `__tests__/setup.js` - Jest configuration
- `__tests__/helpers.js` - Database utilities
- `__tests__/*.test.js` - Test suites
- `package.json` - Test scripts and Jest config

### Manual Testing Files
- `SMOKE_TEST.md` - Quick 15-minute verification
- `E2E_TESTING_PLAN.md` - Comprehensive testing plan
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist

### Deployment Files
- `RENDER_DEPLOYMENT.md` - Render.com deployment guide

---

## Current Recommendation

**Before deploying to Render:**

1. ✅ **Run Smoke Test** (`SMOKE_TEST.md`) - 15 minutes
   - Quick verification of core functionality
   - Ensure nothing is broken

2. ✅ **Run Full E2E Test** (`E2E_TESTING_PLAN.md`) - 60-90 minutes
   - Comprehensive validation
   - Test all CRUD operations
   - Verify security and access control

3. ⏳ **Automated Tests** (Future enhancement)
   - Refactor server.js to export app
   - Set up MongoDB for testing
   - Run `npm test` regularly during development

---

## Testing Best Practices

1. **Test Early, Test Often** - Don't wait until deployment
2. **Document Issues** - Keep track of bugs found during testing
3. **Re-test After Fixes** - Always verify fixes don't break other features
4. **Use Both Approaches** - Manual tests catch UX issues, automated tests catch regressions
5. **Update Tests** - When adding features, add corresponding tests

---

## Need Help?

- **Automated Testing Issues:** See `__tests__/README.md`
- **Manual Testing Questions:** Review test plan files
- **Deployment Questions:** Check `RENDER_DEPLOYMENT.md`

For issues or questions, create an issue in the GitHub repository.
