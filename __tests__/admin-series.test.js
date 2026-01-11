/**
 * Admin Series CRUD Tests
 * Tests for admin series management (view, create, edit, delete)
 */

const request = require('supertest');
const {
  seedTestDatabase,
  clearTestDatabase,
  disconnectTestDb,
  getSeriesById,
  countLessonsInSeries,
  getAdminByEmail,
  createTestApp,
  connectTestDb
} = require('./helpers');

process.env.NODE_ENV = 'test';
process.env.DB_STRING = require('./helpers').getTestDbString();

let appWithSuperAdmin;
let appWithEditor;
let testData;

describe('Admin Series CRUD', () => {
  beforeAll(async () => {
    testData = await seedTestDatabase();

    // Get admin users from database
    const superAdmin = await getAdminByEmail('superadmin@test.com');
    const editor = await getAdminByEmail('editor@test.com');

    // Create apps with different auth levels
    appWithSuperAdmin = await createTestApp({ mockAdmin: superAdmin });
    appWithEditor = await createTestApp({ mockAdmin: editor });
  });

  afterAll(async () => {
    await clearTestDatabase();
    await disconnectTestDb();
  });

  describe('GET /admin/series', () => {
    it('should render series list for authenticated admin', async () => {
      const response = await request(appWithSuperAdmin).get('/admin/series');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Test Series One');
    });

    it('should display series with lesson counts', async () => {
      const series = await getSeriesById('test-series-1');
      expect(series).toBeTruthy();
      expect(series.titleEnglish).toBe('Test Series One');

      const lessonCount = await countLessonsInSeries('test-series-1');
      expect(lessonCount).toBe(2);

      const response = await request(appWithEditor).get('/admin/series');
      expect(response.status).toBe(200);
      expect(response.text).toContain('2 lessons');
    });

    it('should show delete button only for empty series (super-admin)', async () => {
      const response = await request(appWithSuperAdmin).get('/admin/series');
      expect(response.status).toBe(200);
      // Series with lessons should not show delete button
      expect(response.text).not.toMatch(/test-series-1.*Delete/);
    });
  });

  describe('GET /admin/series/new', () => {
    it('should render create series form for admin', async () => {
      const response = await request(appWithEditor).get('/admin/series/new');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Create New Series');
    });

    it('should include all category options', async () => {
      const response = await request(appWithSuperAdmin).get('/admin/series/new');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Hadith');
      expect(response.text).toContain('Tafsir');
      expect(response.text).toContain('Fiqh');
    });
  });

  describe('GET /admin/series/:seriesId/edit', () => {
    it('should render edit form with existing series data', async () => {
      const series = await getSeriesById('test-series-1');
      expect(series.titleEnglish).toBe('Test Series One');

      const response = await request(appWithEditor)
        .get('/admin/series/test-series-1/edit');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Test Series One');
      expect(response.text).toContain('test-series-1');
    });

    it('should make seriesId field read-only', async () => {
      const response = await request(appWithSuperAdmin)
        .get('/admin/series/test-series-1/edit');

      expect(response.status).toBe(200);
      expect(response.text).toContain('readonly');
    });

    it('should return 404 for non-existent series', async () => {
      const response = await request(appWithEditor)
        .get('/admin/series/non-existent-series-xyz/edit');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /admin/series/create', () => {
    it('should create new series successfully', async () => {
      const response = await request(appWithEditor)
        .post('/admin/series/create')
        .send({
          seriesId: 'test-series-2',
          titleEnglish: 'Test Series Two',
          titleArabic: 'سلسلة الاختبار الثانية',
          category: 'Fiqh',
          author: 'Test Author',
          description: 'Another test series',
          status: 'Ongoing',
          location: 'Test Location',
          telegramLink: 'https://t.me/test2'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify in database
      const newSeries = await getSeriesById('test-series-2');
      expect(newSeries).toBeTruthy();
      expect(newSeries.titleEnglish).toBe('Test Series Two');
      expect(newSeries.category).toBe('Fiqh');
    });

    it('should require seriesId, titleEnglish, and category', async () => {
      const response = await request(appWithSuperAdmin)
        .post('/admin/series/create')
        .send({
          titleEnglish: 'Incomplete Series'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should prevent duplicate seriesId', async () => {
      const response = await request(appWithEditor)
        .post('/admin/series/create')
        .send({
          seriesId: 'test-series-1', // Already exists
          titleEnglish: 'Duplicate Series',
          category: 'Hadith'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });

    it('should set default values for optional fields', async () => {
      const response = await request(appWithSuperAdmin)
        .post('/admin/series/create')
        .send({
          seriesId: 'test-series-3',
          titleEnglish: 'Minimal Series',
          category: 'Aqeedah'
        });

      expect(response.status).toBe(200);

      const series = await getSeriesById('test-series-3');
      expect(series.status).toBe('Ongoing');
      expect(series.totalLessons).toBe(0);
    });

    it('should track createdBy field', async () => {
      const response = await request(appWithEditor)
        .post('/admin/series/create')
        .send({
          seriesId: 'test-series-4',
          titleEnglish: 'Created By Test',
          category: 'Seerah'
        });

      expect(response.status).toBe(200);

      const series = await getSeriesById('test-series-4');
      expect(series.createdBy).toBe('editor@test.com');
    });
  });

  describe('POST /admin/series/:seriesId/update', () => {
    it('should update series metadata successfully', async () => {
      const series = await getSeriesById('test-series-1');
      expect(series.status).toBe('Ongoing');

      const response = await request(appWithEditor)
        .post('/admin/series/test-series-1/update')
        .send({
          titleEnglish: 'Updated Test Series',
          titleArabic: series.titleArabic,
          category: 'Hadith',
          status: 'Complete',
          author: series.author,
          description: 'Updated description'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const updated = await getSeriesById('test-series-1');
      expect(updated.titleEnglish).toBe('Updated Test Series');
      expect(updated.status).toBe('Complete');
    });

    it('should not allow changing seriesId', async () => {
      // SeriesId is in the URL path, so it's immutable
      const series = await getSeriesById('test-series-1');
      expect(series.seriesId).toBe('test-series-1');

      await request(appWithSuperAdmin)
        .post('/admin/series/test-series-1/update')
        .send({
          seriesId: 'different-id', // This should be ignored
          titleEnglish: series.titleEnglish,
          category: series.category
        });

      const afterUpdate = await getSeriesById('test-series-1');
      expect(afterUpdate.seriesId).toBe('test-series-1'); // Unchanged
    });

    it('should track updatedBy field', async () => {
      const response = await request(appWithSuperAdmin)
        .post('/admin/series/test-series-1/update')
        .send({
          titleEnglish: 'Update Tracking Test',
          category: 'Hadith',
          status: 'Ongoing'
        });

      expect(response.status).toBe(200);

      const updated = await getSeriesById('test-series-1');
      expect(updated.updatedBy).toBe('superadmin@test.com');
    });
  });

  describe('DELETE /admin/series/:seriesId/delete', () => {
    it('should prevent deletion of series with lessons', async () => {
      const lessonCount = await countLessonsInSeries('test-series-1');
      expect(lessonCount).toBeGreaterThan(0);

      const response = await request(appWithSuperAdmin)
        .delete('/admin/series/test-series-1/delete');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('has');

      // Verify series still exists
      const series = await getSeriesById('test-series-1');
      expect(series).toBeTruthy();
    });

    it('should allow super-admin to delete empty series', async () => {
      // Create an empty series first
      await request(appWithSuperAdmin)
        .post('/admin/series/create')
        .send({
          seriesId: 'empty-series',
          titleEnglish: 'Empty Series',
          category: 'Other'
        });

      const lessonCount = await countLessonsInSeries('empty-series');
      expect(lessonCount).toBe(0);

      const response = await request(appWithSuperAdmin)
        .delete('/admin/series/empty-series/delete');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify deletion
      const series = await getSeriesById('empty-series');
      expect(series).toBeNull();
    });

    it('should prevent editor from deleting series', async () => {
      // Create another empty series
      await request(appWithSuperAdmin)
        .post('/admin/series/create')
        .send({
          seriesId: 'editor-test-series',
          titleEnglish: 'Editor Test',
          category: 'Other'
        });

      const response = await request(appWithEditor)
        .delete('/admin/series/editor-test-series/delete');

      expect(response.status).toBe(302); // Redirect (not authorized)
      expect(response.headers.location).toBe('/login');
    });

    it('should return 404 for non-existent series', async () => {
      const response = await request(appWithSuperAdmin)
        .delete('/admin/series/non-existent-xyz/delete');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
