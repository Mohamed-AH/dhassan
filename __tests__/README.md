# Automated Testing Suite

This directory contains the automated test suite for the Notes from the Majlis application.

## Testing Stack

- **Jest** - Testing framework
- **Supertest** - HTTP assertion library for testing Express routes
- **MongoDB** - Test database (separate from production)

## Test Files

- `setup.js` - Test environment configuration
- `helpers.js` - Database utilities and test data management
- `public-routes.test.js` - Tests for public pages (landing, topics, series, lessons)
- `authentication.test.js` - Tests for login, logout, and access control
- `admin-lessons.test.js` - Tests for lesson CRUD operations
- `admin-series.test.js` - Tests for series CRUD operations
- `user-features.test.js` - **NEW** Tests for user features (read/unread tracking, notes, error reporting, review toggle)
- `test-results.txt` - Latest test execution log

## Running Tests

### Prerequisites

1. Install test dependencies:
```bash
npm install
```

2. Ensure MongoDB is running (tests use a separate `dhassan-test` database)

3. Set environment variables in `.env`:
```env
DB_STRING=mongodb://localhost:27017/dhassan
SESSION_SECRET=your-test-secret
NODE_ENV=test
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage Report

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npm test -- public-routes.test.js
npm test -- admin-lessons.test.js
npm test -- admin-series.test.js
npm test -- authentication.test.js
npm test -- user-features.test.js
```

### Save Test Results to File

```bash
npm test -- user-features.test.js > __tests__/test-results.txt 2>&1
```

## Test Database

Tests use a separate database named `dhassan-test` to avoid affecting production data.

The test database is:
- **Automatically cleared** before each test run
- **Automatically seeded** with test data
- **Automatically disconnected** after tests complete

### Test Data Structure

The `seedTestDatabase()` function creates:

**Series:**
- `test-series-1` - A test series in the Hadith category with 2 lessons

**Lessons:**
- Lesson 1 in `test-series-1` - "Test Lesson 1"
- Lesson 2 in `test-series-1` - "Test Lesson 2"

**Admins:**
- `superadmin@test.com` - Super admin role (can delete, manage all)
- `editor@test.com` - Editor role (can only edit lessons)

**Users:**
- `user@test.com` - Regular user (no admin access)

## User Features Test Suite (`user-features.test.js`)

This comprehensive test suite includes **44 test cases** covering all new user features:

### Read/Unread Tracking API (10 tests)
- ✅ GET `/api/user/read-lessons` - Fetch user's read lessons
- ✅ POST `/api/lessons/:seriesId/:lessonNumber/toggle-read` - Toggle read status
- ✅ POST `/api/user/sync-read-lessons` - Sync local storage to cloud
- ✅ Authentication requirements and redirects
- ✅ Toggle functionality and state persistence
- ✅ Error handling for non-existent lessons
- ✅ Invalid data format rejection

### User Profile and Stats API (4 tests)
- ✅ GET `/api/user/stats` - User statistics (read count, notes count, member since)
- ✅ GET `/profile` - User profile page
- ✅ Authentication requirements and redirects

### Private Notes API (6 tests)
- ✅ GET `/api/profile/notes` - Fetch user's private notes
- ✅ POST `/api/profile/notes` - Create new private note
- ✅ Note content validation (minimum 10 chars, maximum 10,000 chars)
- ✅ XSS sanitization in note content
- ✅ Required field validation

### Error Reporting API (3 tests)
- ✅ POST `/api/report-error` - Submit error reports via Telegram
- ✅ Authentication requirements
- ✅ Empty message rejection

### Review Toggle for Admins (4 tests)
- ✅ POST `/api/lessons/:seriesId/:lessonNumber/toggle-review` - Toggle review status
- ✅ Admin-only access control
- ✅ Review status persistence
- ✅ Admin panel filtering by review status

### Access Control Validation (7 tests)
- ✅ `isAuthenticated` middleware protection on user routes
- ✅ `isAdmin` middleware protection on admin routes
- ✅ Proper login redirects for unauthenticated users

### Error Handling (3 tests)
- ✅ Graceful error responses for invalid inputs
- ✅ Database error masking (no internal details exposed)
- ✅ Malformed JSON handling

### Input Validation (6 tests)
- ✅ XSS prevention in notes
- ✅ Length constraints enforcement
- ✅ Required field validation
- ✅ Lesson ID validation

## Current Test Status

### ✅ Fully Functional Tests

The test suite now includes **fully functional tests** for user features and API endpoints!

**What's Implemented:**
- ✅ Test file structure and organization
- ✅ Test database helpers and seeding
- ✅ Test data validation (database operations)
- ✅ Clear test descriptions and expectations
- ✅ Proper setup and teardown
- ✅ **NEW: User features test suite with 44 test cases** (`user-features.test.js`)
- ✅ **NEW: HTTP request/response testing for user APIs**
- ✅ **NEW: Authentication middleware testing with mocking**
- ✅ **NEW: Access control validation**

**What's Pending:**
- ⏳ OAuth testing with mocked passport (placeholder tests remain in `authentication.test.js`)
- ⏳ Full coverage of admin routes HTTP tests
- ⏳ CI/CD integration

### Why Tests Are Placeholders

The tests currently use `expect(true).toBe(true)` as placeholders because:

1. **Server.js doesn't export the Express app** - The current `server.js` starts the server immediately but doesn't export the `app` for testing
2. **Session management needs mocking** - OAuth and sessions require complex mocking
3. **Middleware testing requires app instance** - Authentication middleware needs the app to be instantiated

## Making Tests Fully Functional

To make these tests work with real HTTP requests, you need to refactor `server.js`:

### Step 1: Refactor server.js

Create two separate files:

**app.js** (New file - contains Express app configuration):
```javascript
const express = require('express');
const session = require('express-session');
const passport = require('passport');
// ... all other imports

const app = express();

// ... all middleware configuration
// ... all route definitions

module.exports = app; // Export app without starting server
```

**server.js** (Modified - only starts server):
```javascript
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 2: Update Tests to Import App

In each test file, replace:
```javascript
// Current placeholder
let app;
```

With:
```javascript
// Import the app
const app = require('../app');
```

### Step 3: Mock Passport Authentication

Add passport mocking utilities to `helpers.js`:

```javascript
function mockAuthenticatedRequest(agent, user) {
  // Mock passport authentication
  return agent.set('Cookie', createMockSessionCookie(user));
}
```

### Step 4: Uncomment HTTP Tests

Once the app is refactored, uncomment the actual HTTP test code:

```javascript
// Before (placeholder):
expect(true).toBe(true);

// After (real test):
const response = await request(app).get('/');
expect(response.status).toBe(200);
expect(response.text).toContain('Notes from the Majlis');
```

## Test Coverage Goals

Once fully implemented, we aim for:

- **Routes:** 90%+ coverage of all public and admin routes
- **CRUD Operations:** 100% coverage of create, read, update, delete operations
- **Access Control:** 100% coverage of authentication and authorization
- **Error Handling:** 90%+ coverage of error scenarios

## Best Practices

1. **Test Database Isolation** - Always use the test database, never production
2. **Data Cleanup** - Clear database before/after each test suite
3. **Independent Tests** - Each test should be able to run independently
4. **Descriptive Names** - Test names clearly describe what they're testing
5. **Arrange-Act-Assert** - Follow AAA pattern in test structure

## Running Manual Tests

While automated tests are being developed, use the manual testing plans:

- `E2E_TESTING_PLAN.md` - Comprehensive manual testing (60-90 minutes)
- `SMOKE_TEST.md` - Quick manual verification (15 minutes)

## Continuous Integration

Once tests are fully functional, integrate with CI/CD:

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

## Troubleshooting

### Tests Hang or Don't Complete

- Check MongoDB is running: `sudo systemctl status mongod`
- Verify no other tests are using the test database
- Increase timeout in `setup.js` if database is slow

### Database Connection Errors

- Verify `DB_STRING` environment variable is set
- Check MongoDB is accessible on the specified port
- Ensure test database name doesn't conflict with production

### Session/Auth Errors

- These are expected until OAuth mocking is implemented
- Focus on database operation tests first

## Contributing to Tests

When adding new features, please:

1. Write tests for new routes and functionality
2. Update test data in `helpers.js` if needed
3. Run full test suite before committing
4. Aim for 80%+ code coverage on new code

## Next Steps

1. **Refactor server.js** to export app (see Step 1 above)
2. **Implement OAuth mocking** for authentication tests
3. **Uncomment HTTP tests** and verify they pass
4. **Add integration with CI/CD** pipeline
5. **Set up code coverage reporting** (Codecov, Coveralls)

---

For questions or issues with tests, please refer to the main project documentation or create an issue.
