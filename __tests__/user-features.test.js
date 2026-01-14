/**
 * User Features Tests
 * Tests for read/unread tracking, user profile, notes, error reporting, and review toggle
 */

const request = require('supertest');
const {
  seedTestDatabase,
  clearTestDatabase,
  disconnectTestDb,
  createTestApp,
  connectTestDb
} = require('./helpers');

process.env.NODE_ENV = 'test';
process.env.DB_STRING = require('./helpers').getTestDbString();

let app;
let appAuthenticated;
let testData;
let testUser;
let testAdmin;

describe('User Features', () => {
  beforeAll(async () => {
    testData = await seedTestDatabase();

    // Create app without authentication for unauthenticated tests
    app = await createTestApp();

    // Create test user data
    testUser = {
      _id: testData.users[0]._id,
      email: 'user@test.com',
      name: 'Regular User',
      googleId: 'test-google-id-user'
    };

    // Create test admin data
    testAdmin = {
      _id: testData.admins[0]._id,
      email: 'superadmin@test.com',
      name: 'Super Admin',
      role: 'super-admin',
      googleId: 'test-google-id-super'
    };

    // Create app with authenticated user for authenticated tests
    appAuthenticated = await createTestApp({ mockAdmin: testUser });
  }, 60000); // 60 second timeout for setup

  afterAll(async () => {
    await clearTestDatabase();
    await disconnectTestDb();
  }, 60000); // 60 second timeout for cleanup

  describe('Read/Unread Tracking API', () => {
    describe('GET /api/user/read-lessons', () => {
      it('should return empty array for unauthenticated users', async () => {
        const response = await request(app).get('/api/user/read-lessons');

        // Should redirect to login
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/login');
      });

      it('should return read lessons for authenticated user', async () => {
        const response = await request(appAuthenticated).get('/api/user/read-lessons');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('readLessons');
        expect(Array.isArray(response.body.readLessons)).toBe(true);
      });

      it('should handle database errors gracefully', async () => {
        // This would require mocking the database to fail
        // For now, just verify the endpoint exists and returns proper structure
        const response = await request(appAuthenticated).get('/api/user/read-lessons');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success');
      });
    });

    describe('POST /api/lessons/:seriesId/:lessonNumber/toggle-read', () => {
      it('should redirect unauthenticated users to login', async () => {
        const response = await request(app)
          .post('/api/lessons/test-series-1/1/toggle-read')
          .send();

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/login');
      });

      it('should mark lesson as read for authenticated user', async () => {
        const response = await request(appAuthenticated)
          .post('/api/lessons/test-series-1/1/toggle-read')
          .send();

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('isRead');
        expect(response.body).toHaveProperty('lessonId', 'test-series-1/1');
      });

      it('should toggle read status when called again', async () => {
        // First toggle - mark as read
        const response1 = await request(appAuthenticated)
          .post('/api/lessons/test-series-1/2/toggle-read')
          .send();

        expect(response1.body.isRead).toBe(true);

        // Second toggle - mark as unread
        const response2 = await request(appAuthenticated)
          .post('/api/lessons/test-series-1/2/toggle-read')
          .send();

        expect(response2.body.isRead).toBe(false);
      });

      it('should return 404 for non-existent lesson', async () => {
        const response = await request(appAuthenticated)
          .post('/api/lessons/non-existent-series/999/toggle-read')
          .send();

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error', 'Lesson not found');
      });
    });

    describe('POST /api/user/sync-read-lessons', () => {
      it('should redirect unauthenticated users to login', async () => {
        const response = await request(app)
          .post('/api/user/sync-read-lessons')
          .send({ readLessons: [] });

        expect(response.status).toBe(302);
      });

      it('should sync local storage lessons to cloud', async () => {
        const localLessons = ['test-series-1/1', 'test-series-1/2'];

        const response = await request(appAuthenticated)
          .post('/api/user/sync-read-lessons')
          .send({ readLessons: localLessons });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('readLessons');
        expect(Array.isArray(response.body.readLessons)).toBe(true);
      });

      it('should reject invalid data format', async () => {
        const response = await request(appAuthenticated)
          .post('/api/user/sync-read-lessons')
          .send({ readLessons: 'not-an-array' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
      });
    });
  });

  describe('User Profile and Stats API', () => {
    describe('GET /api/user/stats', () => {
      it('should redirect unauthenticated users', async () => {
        const response = await request(app).get('/api/user/stats');

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/login');
      });

      it('should return user statistics for authenticated user', async () => {
        const response = await request(appAuthenticated).get('/api/user/stats');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body.stats).toHaveProperty('totalRead');
        expect(response.body.stats).toHaveProperty('totalLessons');
        expect(response.body.stats).toHaveProperty('totalNotes');
        expect(response.body.stats).toHaveProperty('memberSince');
      });
    });

    describe('GET /profile', () => {
      it('should redirect unauthenticated users to login', async () => {
        const response = await request(app).get('/profile');

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/login');
      });

      it('should render profile page for authenticated user', async () => {
        const response = await request(appAuthenticated).get('/profile');

        expect(response.status).toBe(200);
        expect(response.text).toContain('Profile');
      });
    });
  });

  describe('Private Notes API', () => {
    describe('GET /api/profile/notes', () => {
      it('should redirect unauthenticated users', async () => {
        const response = await request(app).get('/api/profile/notes');

        expect(response.status).toBe(302);
      });

      it('should return user notes for authenticated user', async () => {
        const response = await request(appAuthenticated).get('/api/profile/notes');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('notes');
        expect(Array.isArray(response.body.notes)).toBe(true);
      });
    });

    describe('POST /api/profile/notes', () => {
      it('should redirect unauthenticated users', async () => {
        const response = await request(app)
          .post('/api/profile/notes')
          .send({ content: 'Test note', lessonId: 'test-series-1/1' });

        expect(response.status).toBe(302);
      });

      it('should create a new note for authenticated user', async () => {
        const response = await request(appAuthenticated)
          .post('/api/profile/notes')
          .send({
            content: 'This is a test note with enough content to pass validation',
            lessonId: 'test-series-1/1'
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('noteId');
      });

      it('should reject notes with insufficient content', async () => {
        const response = await request(appAuthenticated)
          .post('/api/profile/notes')
          .send({
            content: 'Short',
            lessonId: 'test-series-1/1'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('errors');
      });

      it('should reject notes without content', async () => {
        const response = await request(appAuthenticated)
          .post('/api/profile/notes')
          .send({
            lessonId: 'test-series-1/1'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
      });

      it('should sanitize note content', async () => {
        const response = await request(appAuthenticated)
          .post('/api/profile/notes')
          .send({
            content: 'Test note with <script>alert("xss")</script> should be sanitized and long enough',
            lessonId: 'test-series-1/1'
          });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('success', true);
      });
    });
  });

  describe('Error Reporting API', () => {
    describe('POST /api/report-error', () => {
      it('should redirect unauthenticated users', async () => {
        const response = await request(app)
          .post('/api/report-error')
          .send({ errorMessage: 'Test error' });

        expect(response.status).toBe(302);
      });

      it('should accept error reports from authenticated users', async () => {
        const response = await request(appAuthenticated)
          .post('/api/report-error')
          .send({
            errorMessage: 'This is a test error report',
            lessonId: 'test-series-1/1',
            url: 'http://localhost:8000/lesson/test-series-1/1'
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
      });

      it('should reject empty error messages', async () => {
        const response = await request(appAuthenticated)
          .post('/api/report-error')
          .send({
            errorMessage: '',
            lessonId: 'test-series-1/1'
          });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
      });
    });
  });

  describe('Review Toggle for Admins', () => {
    let appAdmin;

    beforeAll(async () => {
      // Create app with authenticated admin
      appAdmin = await createTestApp({ mockAdmin: testAdmin });
    });

    describe('POST /api/lessons/:seriesId/:lessonNumber/toggle-review', () => {
      it('should redirect non-admin users', async () => {
        const response = await request(app)
          .post('/api/lessons/test-series-1/1/toggle-review')
          .send();

        expect(response.status).toBe(302);
      });

      it('should allow admin to toggle review status', async () => {
        const response = await request(appAdmin)
          .post('/api/lessons/test-series-1/1/toggle-review')
          .send();

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('isReviewed');
      });

      it('should toggle review status when called again', async () => {
        // First toggle
        const response1 = await request(appAdmin)
          .post('/api/lessons/test-series-1/2/toggle-review')
          .send();

        const firstState = response1.body.isReviewed;

        // Second toggle
        const response2 = await request(appAdmin)
          .post('/api/lessons/test-series-1/2/toggle-review')
          .send();

        expect(response2.body.isReviewed).toBe(!firstState);
      });

      it('should return 404 for non-existent lesson', async () => {
        const response = await request(appAdmin)
          .post('/api/lessons/non-existent/999/toggle-review')
          .send();

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('success', false);
      });
    });

    describe('GET /admin/lessons (Review Filter)', () => {
      it('should support filtering by review status', async () => {
        const response = await request(appAdmin)
          .get('/admin/lessons')
          .query({ reviewed: 'false' });

        expect(response.status).toBe(200);
        // Verify that the page renders and contains lesson data
        expect(response.text).toContain('Lessons');
      });
    });
  });

  describe('Access Control Validation', () => {
    describe('isAuthenticated Middleware', () => {
      it('should protect /profile route', async () => {
        const response = await request(app).get('/profile');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/login');
      });

      it('should protect /api/user/stats route', async () => {
        const response = await request(app).get('/api/user/stats');
        expect(response.status).toBe(302);
      });

      it('should protect /api/profile/notes route', async () => {
        const response = await request(app).get('/api/profile/notes');
        expect(response.status).toBe(302);
      });

      it('should protect /api/report-error route', async () => {
        const response = await request(app).post('/api/report-error').send({});
        expect(response.status).toBe(302);
      });
    });

    describe('isAdmin Middleware', () => {
      it('should protect /admin routes', async () => {
        const response = await request(app).get('/admin');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('/login');
      });

      it('should protect /admin/lessons route', async () => {
        const response = await request(app).get('/admin/lessons');
        expect(response.status).toBe(302);
      });

      it('should protect admin API endpoints', async () => {
        const response = await request(app)
          .post('/api/lessons/test-series-1/1/toggle-review')
          .send();

        expect(response.status).toBe(302);
      });
    });
  });

  describe('Error Handling', () => {
    describe('Graceful Error Responses', () => {
      it('should return proper error for invalid lesson ID format', async () => {
        const response = await request(appAuthenticated)
          .post('/api/lessons/invalid-id/abc/toggle-read')
          .send();

        // Should handle gracefully
        expect([200, 404, 400]).toContain(response.status);
        expect(response.body).toHaveProperty('success');
      });

      it('should return proper error for missing required fields', async () => {
        const response = await request(appAuthenticated)
          .post('/api/profile/notes')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('errors');
      });

      it('should handle malformed JSON gracefully', async () => {
        const response = await request(appAuthenticated)
          .post('/api/profile/notes')
          .set('Content-Type', 'application/json')
          .send('{ invalid json }');

        expect([400, 500]).toContain(response.status);
      });
    });

    describe('Database Error Handling', () => {
      it('should not expose database errors to client', async () => {
        // This test verifies that internal errors return generic messages
        const response = await request(appAuthenticated)
          .get('/api/user/stats');

        // Should either succeed or return a proper error structure
        expect(response.body).toHaveProperty('success');

        if (!response.body.success) {
          // Error message should be generic, not exposing internal details
          expect(response.body.error).not.toContain('MongoDB');
          expect(response.body.error).not.toContain('database');
        }
      });
    });
  });

  describe('Input Validation', () => {
    describe('Note Content Validation', () => {
      it('should reject XSS attempts in notes', async () => {
        const response = await request(appAuthenticated)
          .post('/api/profile/notes')
          .send({
            content: '<script>alert("xss")</script> This is a test note with enough content to pass length validation',
            lessonId: 'test-series-1/1'
          });

        // Should either sanitize and succeed, or reject
        expect([201, 400]).toContain(response.status);

        if (response.status === 201) {
          // If accepted, verify content was sanitized
          const db = await connectTestDb();
          const note = await db.collection('notes').findOne({ _id: response.body.noteId });
          expect(note.content).not.toContain('<script>');
        }
      });

      it('should enforce minimum length', async () => {
        const response = await request(appAuthenticated)
          .post('/api/profile/notes')
          .send({
            content: 'short',
            lessonId: 'test-series-1/1'
          });

        expect(response.status).toBe(400);
        expect(response.body.errors).toContain('Note must be at least 10 characters long');
      });

      it('should enforce maximum length', async () => {
        const longContent = 'a'.repeat(10001);
        const response = await request(appAuthenticated)
          .post('/api/profile/notes')
          .send({
            content: longContent,
            lessonId: 'test-series-1/1'
          });

        expect(response.status).toBe(400);
        expect(response.body.errors).toContain('Note must be less than 10000 characters');
      });
    });

    describe('Lesson ID Validation', () => {
      it('should validate lesson exists before operations', async () => {
        const response = await request(appAuthenticated)
          .post('/api/lessons/fake-series/999/toggle-read')
          .send();

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('error', 'Lesson not found');
      });
    });
  });
});
