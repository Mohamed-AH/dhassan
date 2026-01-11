/**
 * Admin Lessons CRUD Tests
 * Tests for admin lesson management (view, edit, delete)
 */

const request = require('supertest');
const {
  seedTestDatabase,
  clearTestDatabase,
  disconnectTestDb,
  getLessonByNumber,
  getAdminByEmail,
  countLessonsInSeries,
  createTestApp
} = require('./helpers');

process.env.NODE_ENV = 'test';
process.env.DB_STRING = require('./helpers').getTestDbString();

let appWithSuperAdmin;
let appWithEditor;
let appNoAuth;
let testData;

describe('Admin Lessons CRUD', () => {
  beforeAll(async () => {
    testData = await seedTestDatabase();

    // Get admin users from database
    const superAdmin = await getAdminByEmail('superadmin@test.com');
    const editor = await getAdminByEmail('editor@test.com');

    // Create apps with different auth levels
    appWithSuperAdmin = await createTestApp({ mockAdmin: superAdmin });
    appWithEditor = await createTestApp({ mockAdmin: editor });
    appNoAuth = await createTestApp(); // No authentication
  });

  afterAll(async () => {
    await clearTestDatabase();
    await disconnectTestDb();
  });

  describe('GET /admin/lessons', () => {
    it('should render lessons list for authenticated admin', async () => {
      const response = await request(appWithSuperAdmin).get('/admin/lessons');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Test Lesson 1');
      expect(response.text).toContain('Test Lesson 2');
    });

    it('should redirect to login for non-authenticated users', async () => {
      const response = await request(appNoAuth).get('/admin/lessons');
      expect(response.status).toBe(302); // Redirect
      expect(response.headers.location).toBe('/login');
    });

    it('should display lesson count and metadata', async () => {
      const response = await request(appWithEditor).get('/admin/lessons');
      expect(response.status).toBe(200);
      expect(response.text).toContain('test-series-1');
    });
  });

  describe('GET /admin/lesson/:lessonId/edit', () => {
    it('should render lesson edit form for admin', async () => {
      const lesson = await getLessonByNumber('test-series-1', 1);
      const response = await request(appWithEditor)
        .get(`/admin/lesson/${lesson._id}/edit`);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Test Lesson 1');
      expect(response.text).toContain('titleEnglish');
    });

    it('should show delete button only for super-admin', async () => {
      const lesson = await getLessonByNumber('test-series-1', 1);
      const response = await request(appWithSuperAdmin)
        .get(`/admin/lesson/${lesson._id}/edit`);

      expect(response.status).toBe(200);
      expect(response.text).toContain('Delete Lesson');
    });

    it('should not show delete button for editor role', async () => {
      const lesson = await getLessonByNumber('test-series-1', 1);
      const response = await request(appWithEditor)
        .get(`/admin/lesson/${lesson._id}/edit`);

      expect(response.status).toBe(200);
      expect(response.text).not.toContain('Delete Lesson');
    });
  });

  describe('POST /admin/lesson/:lessonId/update', () => {
    it('should update lesson metadata successfully', async () => {
      const lesson = await getLessonByNumber('test-series-1', 1);
      expect(lesson).toBeTruthy();
      expect(lesson.titleEnglish).toBe('Test Lesson 1');

      const response = await request(appWithSuperAdmin)
        .post(`/admin/lesson/${lesson._id}/update`)
        .send({
          titleEnglish: 'Updated Test Lesson 1',
          titleArabic: 'الدرس المحدث 1',
          hadithsDisplay: 'Hadiths 1-10',
          duration: '60 min',
          lessonNumber: 1,
          notes: lesson.notes
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify update in database
      const updatedLesson = await getLessonByNumber('test-series-1', 1);
      expect(updatedLesson.titleEnglish).toBe('Updated Test Lesson 1');
      expect(updatedLesson.titleArabic).toBe('الدرس المحدث 1');
    });

    it('should require titleEnglish field', async () => {
      const lesson = await getLessonByNumber('test-series-1', 1);

      const response = await request(appWithEditor)
        .post(`/admin/lesson/${lesson._id}/update`)
        .send({
          titleEnglish: '', // Empty title
          lessonNumber: 1,
          notes: lesson.notes
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    it('should reparse markdown chapters and timestamps', async () => {
      const lesson = await getLessonByNumber('test-series-1', 1);

      const newNotes = '# New Chapter\n\nContent here.\n\n## Section 1\n\nMore content.';
      const response = await request(appWithEditor)
        .post(`/admin/lesson/${lesson._id}/update`)
        .send({
          titleEnglish: lesson.titleEnglish,
          lessonNumber: 1,
          notes: newNotes
        });

      expect(response.status).toBe(200);

      const updatedLesson = await getLessonByNumber('test-series-1', 1);
      expect(updatedLesson.chapters).toBeDefined();
      expect(updatedLesson.chapters.length).toBeGreaterThan(0);
    });

    it('should track updatedBy field', async () => {
      const lesson = await getLessonByNumber('test-series-1', 1);

      const response = await request(appWithEditor)
        .post(`/admin/lesson/${lesson._id}/update`)
        .send({
          titleEnglish: 'Test Update Tracking',
          lessonNumber: 1,
          notes: lesson.notes
        });

      expect(response.status).toBe(200);

      const updatedLesson = await getLessonByNumber('test-series-1', 1);
      expect(updatedLesson.updatedBy).toBe('editor@test.com');
    });
  });

  describe('DELETE /admin/lesson/:lessonId/delete', () => {
    it('should allow super-admin to delete lesson', async () => {
      const countBefore = await countLessonsInSeries('test-series-1');
      expect(countBefore).toBe(2);

      const lesson = await getLessonByNumber('test-series-1', 2);

      const response = await request(appWithSuperAdmin)
        .delete(`/admin/lesson/${lesson._id}/delete`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify deletion
      const countAfter = await countLessonsInSeries('test-series-1');
      expect(countAfter).toBe(1);
    });

    it('should prevent editor from deleting lesson', async () => {
      const lesson = await getLessonByNumber('test-series-1', 1);

      const response = await request(appWithEditor)
        .delete(`/admin/lesson/${lesson._id}/delete`);

      expect(response.status).toBe(302); // Redirect (not authorized)
      expect(response.headers.location).toBe('/login');
    });

    it('should return 404 for non-existent lesson', async () => {
      const response = await request(appWithSuperAdmin)
        .delete(`/admin/lesson/507f1f77bcf86cd799439011/delete`); // Valid ObjectId but doesn't exist

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid lesson ID', async () => {
      const response = await request(appWithSuperAdmin)
        .delete(`/admin/lesson/invalid-id/delete`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
