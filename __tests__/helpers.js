/**
 * Test Helper Functions
 * Provides utilities for test data creation, database seeding, and cleanup
 */

const { MongoClient, ObjectId } = require('mongodb');
const createApp = require('../app');

let testClient = null;
let testDb = null;

/**
 * Get test database connection string
 */
function getTestDbString() {
  // Use a separate test database
  const dbString = process.env.DB_STRING || 'mongodb://localhost:27017/dhassan';
  return dbString.replace(/\/[^\/]+$/, '/dhassan-test');
}

/**
 * Connect to test database
 */
async function connectTestDb() {
  if (testClient) {
    return testDb;
  }

  const dbString = getTestDbString();
  testClient = new MongoClient(dbString);
  await testClient.connect();
  testDb = testClient.db();

  console.log('Connected to test database');
  return testDb;
}

/**
 * Disconnect from test database
 */
async function disconnectTestDb() {
  if (testClient) {
    await testClient.close();
    testClient = null;
    testDb = null;
    console.log('Disconnected from test database');
  }
}

/**
 * Clear all collections in test database
 */
async function clearTestDatabase() {
  const db = await connectTestDb();
  const collections = await db.listCollections().toArray();

  for (const collection of collections) {
    await db.collection(collection.name).deleteMany({});
  }

  console.log('Test database cleared');
}

/**
 * Seed test database with sample data
 */
async function seedTestDatabase() {
  const db = await connectTestDb();

  // Create collections
  const seriesCollection = db.collection('series');
  const lessonsCollection = db.collection('lessons');
  const adminsCollection = db.collection('admins');
  const usersCollection = db.collection('users');

  // Clear existing data
  await clearTestDatabase();

  // Seed test series
  const testSeries = {
    seriesId: 'test-series-1',
    titleEnglish: 'Test Series One',
    titleArabic: 'سلسلة الاختبار الأولى',
    category: 'Hadith',
    author: 'Test Author',
    description: 'A test series for automated testing',
    status: 'Ongoing',
    totalLessons: 2,
    location: 'Test Location',
    telegramLink: 'https://t.me/test',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await seriesCollection.insertOne(testSeries);

  // Seed test lessons
  const testLesson1 = {
    seriesId: 'test-series-1',
    lessonNumber: 1,
    titleEnglish: 'Test Lesson 1',
    titleArabic: 'الدرس التجريبي 1',
    hadithsDisplay: 'Hadiths 1-5',
    duration: '45 min',
    dateGregorian: new Date('2024-01-01'),
    notes: '# Test Lesson\n\nThis is a test lesson with markdown content.\n\n## Chapter 1\nSome content here.',
    chapters: [
      { level: 1, title: 'Test Lesson', timestamp: null },
      { level: 2, title: 'Chapter 1', timestamp: null }
    ],
    timestamps: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const testLesson2 = {
    seriesId: 'test-series-1',
    lessonNumber: 2,
    titleEnglish: 'Test Lesson 2',
    titleArabic: 'الدرس التجريبي 2',
    hadithsDisplay: 'Hadiths 6-10',
    duration: '50 min',
    dateGregorian: new Date('2024-01-08'),
    notes: '# Another Test Lesson\n\nMore test content.',
    chapters: [
      { level: 1, title: 'Another Test Lesson', timestamp: null }
    ],
    timestamps: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await lessonsCollection.insertMany([testLesson1, testLesson2]);

  // Seed test admins
  const testSuperAdmin = {
    email: 'superadmin@test.com',
    name: 'Super Admin',
    role: 'super-admin',
    googleId: 'test-google-id-super',
    createdAt: new Date(),
    lastLogin: new Date()
  };

  const testEditor = {
    email: 'editor@test.com',
    name: 'Editor User',
    role: 'editor',
    googleId: 'test-google-id-editor',
    createdAt: new Date(),
    lastLogin: new Date()
  };

  await adminsCollection.insertMany([testSuperAdmin, testEditor]);

  // Seed test user
  const testUser = {
    email: 'user@test.com',
    name: 'Regular User',
    googleId: 'test-google-id-user',
    createdAt: new Date(),
    lastLogin: new Date()
  };

  await usersCollection.insertOne(testUser);

  console.log('Test database seeded with sample data');

  return {
    series: testSeries,
    lessons: [testLesson1, testLesson2],
    admins: [testSuperAdmin, testEditor],
    users: [testUser]
  };
}

/**
 * Create a mock session for authenticated requests
 */
function createMockSession(user = null, admin = null) {
  const session = {
    passport: {}
  };

  if (user) {
    session.passport.user = user.googleId || user.email;
  }

  return session;
}

/**
 * Get admin by email from test database
 */
async function getAdminByEmail(email) {
  const db = await connectTestDb();
  return await db.collection('admins').findOne({ email });
}

/**
 * Get lesson by series and lesson number
 */
async function getLessonByNumber(seriesId, lessonNumber) {
  const db = await connectTestDb();
  return await db.collection('lessons').findOne({ seriesId, lessonNumber });
}

/**
 * Get series by ID
 */
async function getSeriesById(seriesId) {
  const db = await connectTestDb();
  return await db.collection('series').findOne({ seriesId });
}

/**
 * Count lessons in a series
 */
async function countLessonsInSeries(seriesId) {
  const db = await connectTestDb();
  return await db.collection('lessons').countDocuments({ seriesId });
}

/**
 * Create test app with test database collections
 * @param {Object} options - Optional configuration
 * @param {Object} options.mockAdmin - Mock admin user to inject (for admin route testing)
 * @returns {Promise<Object>} Configured Express app for testing
 */
async function createTestApp(options = {}) {
  const db = await connectTestDb();

  const collections = {
    seriesCollection: db.collection('series'),
    lessonsCollection: db.collection('lessons'),
    usersCollection: db.collection('users'),
    notesCollection: db.collection('notes'),
    adminsCollection: db.collection('admins')
  };

  // Create mock middleware if mockAdmin provided
  let testMiddleware = null;
  if (options.mockAdmin) {
    testMiddleware = (req, res, next) => {
      req.isAuthenticated = () => true;
      req.user = options.mockAdmin;
      req.admin = options.mockAdmin;
      res.locals.user = options.mockAdmin;
      res.locals.isAdmin = true;
      res.locals.adminRole = options.mockAdmin.role;
      next();
    };
  }

  // Create app without mongoClient to skip session/passport setup
  // Pass testMiddleware to be injected before routes
  const app = createApp(collections, null, testMiddleware);

  return app;
}

module.exports = {
  connectTestDb,
  disconnectTestDb,
  clearTestDatabase,
  seedTestDatabase,
  createMockSession,
  getAdminByEmail,
  getLessonByNumber,
  getSeriesById,
  countLessonsInSeries,
  getTestDbString,
  createTestApp
};
