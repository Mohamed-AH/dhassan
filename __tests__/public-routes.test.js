/**
 * Public Routes Tests
 * Tests for publicly accessible pages (landing, topics, series, lessons)
 */

const request = require('supertest');
const {
  seedTestDatabase,
  clearTestDatabase,
  disconnectTestDb,
  createTestApp
} = require('./helpers');

process.env.NODE_ENV = 'test';
process.env.DB_STRING = require('./helpers').getTestDbString();

let app;

describe('Public Routes', () => {
  beforeAll(async () => {
    // Seed test database
    await seedTestDatabase();

    // Create test app with test database collections
    app = await createTestApp();
  });

  afterAll(async () => {
    // Clean up
    await clearTestDatabase();
    await disconnectTestDb();
  });

  describe('GET /', () => {
    it('should render the landing page', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Notes from the Majlis');
    });

    it('should display featured series', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Test Series One');
    });
  });

  describe('GET /topics', () => {
    it('should render the topics page', async () => {
      const response = await request(app).get('/topics');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Topics');
    });

    it('should display all categories', async () => {
      const response = await request(app).get('/topics');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Hadith');
    });
  });

  describe('GET /series', () => {
    it('should render the series listing page', async () => {
      const response = await request(app).get('/series');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Series');
    });

    it('should display all series', async () => {
      const response = await request(app).get('/series');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Test Series One');
    });
  });

  describe('GET /series/:seriesId', () => {
    it('should render a specific series detail page', async () => {
      const response = await request(app).get('/series/test-series-1');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Test Series One');
    });

    it('should display all lessons in the series', async () => {
      const response = await request(app).get('/series/test-series-1');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Test Lesson 1');
      expect(response.text).toContain('Test Lesson 2');
    });

    it('should return 404 for non-existent series', async () => {
      const response = await request(app).get('/series/non-existent-series');
      expect(response.status).toBe(404);
    });
  });

  describe('GET /lesson/:seriesId/:lessonNumber', () => {
    it('should render a specific lesson page', async () => {
      const response = await request(app).get('/lesson/test-series-1/1');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Test Lesson 1');
    });

    it('should display lesson title and content', async () => {
      const response = await request(app).get('/lesson/test-series-1/1');
      expect(response.status).toBe(200);
      expect(response.text).toContain('This is a test lesson');
    });

    it('should display chapters and timestamps', async () => {
      const response = await request(app).get('/lesson/test-series-1/1');
      expect(response.status).toBe(200);
      // Chapters are rendered in the lesson page
      expect(response.text).toContain('Chapter 1');
    });

    it('should return 404 for non-existent lesson', async () => {
      const response = await request(app).get('/lesson/test-series-1/999');
      expect(response.status).toBe(404);
    });
  });
});
