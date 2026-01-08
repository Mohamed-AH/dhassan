const { MongoClient } = require('mongodb');
require('dotenv').config();

async function seedAdmin() {
  const client = await MongoClient.connect(process.env.DB_STRING);
  const db = client.db('notes-from-majlis');
  const adminsCollection = db.collection('admins');

  try {
    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({ email: 'emah84@gmail.com' });

    if (existingAdmin) {
      console.log('✅ Admin already exists');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Status: ${existingAdmin.isActive ? 'Active' : 'Inactive'}`);
      await client.close();
      return;
    }

    // Create first super-admin
    const adminDoc = {
      email: 'emah84@gmail.com',
      name: 'Mohamed Hassan',
      role: 'super-admin',
      addedBy: 'system',
      addedAt: new Date(),
      lastLogin: null,
      isActive: true
    };

    await adminsCollection.insertOne(adminDoc);

    // Create unique index on email
    await adminsCollection.createIndex({ email: 1 }, { unique: true });

    console.log('✅ First admin created successfully');
    console.log(`   Email: ${adminDoc.email}`);
    console.log(`   Role: ${adminDoc.role}`);
    console.log(`   Name: ${adminDoc.name}`);
    console.log('\n🎉 Admin system initialized!');
    console.log('   You can now add more admins via the admin panel.');

  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the seed function
seedAdmin().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
