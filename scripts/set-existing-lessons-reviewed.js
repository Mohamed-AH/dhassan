/**
 * One-time script to set all existing lessons as reviewed
 * Run this to ensure your existing lessons are visible to the public
 *
 * Usage: node scripts/set-existing-lessons-reviewed.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

async function setExistingLessonsReviewed() {
  const client = new MongoClient(process.env.DB_STRING);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const lessonsCollection = db.collection('lessons');

    // Find lessons without isReviewed field
    const lessonsWithoutReview = await lessonsCollection.countDocuments({
      isReviewed: { $exists: false }
    });

    console.log(`\n📊 Found ${lessonsWithoutReview} lessons without review status`);

    if (lessonsWithoutReview === 0) {
      console.log('✅ All lessons already have review status!');
      return;
    }

    // Update all lessons without isReviewed to be reviewed
    const result = await lessonsCollection.updateMany(
      { isReviewed: { $exists: false } },
      {
        $set: {
          isReviewed: true,
          reviewedBy: 'System Migration',
          reviewedAt: new Date()
        }
      }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} lessons`);
    console.log('✅ All existing lessons are now marked as reviewed and visible to public');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n👋 Connection closed');
  }
}

setExistingLessonsReviewed();
