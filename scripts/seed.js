// Seed script for MongoDB - Run with: node scripts/seed.js
const { MongoClient } = require('mongodb');

const uri = 'mongodb://admin:password123@localhost:27017/lecture_notes?authSource=admin';

const seedData = {
  // Sheikh
  sheikh: {
    nameArabic: 'حسن بن محمد منصور الدغريري',
    nameEnglish: 'Ḥasan bin Muḥammad Manṣūr Ad-Daghrīrī',
    honorific: 'حفظه الله',
    bio: 'Student of the late Sheikh Aḥmad bin Yaḥyá An-Najmī رحمه الله',
  },

  // Books
  books: [
    {
      titleArabic: 'الملخص شرح كتاب التوحيد',
      titleEnglish: 'Al-Mulakhkhaṣ: Explanation of Kitāb At-Tawḥīd',
      author: 'Sheikh Ṣāliḥ Al-Fawzān حفظه الله',
      category: 'Aqeedah',
      description: 'A comprehensive explanation of the book on Islamic monotheism',
    },
    {
      titleArabic: 'الملخص الفقهي',
      titleEnglish: 'Al-Mulakhkhaṣ Al-Fiqhī',
      author: 'Sheikh Ṣāliḥ Al-Fawzān حفظه الله',
      category: 'Fiqh',
      description: 'A summary of Islamic jurisprudence',
    },
    {
      titleArabic: 'التفسير الميسر',
      titleEnglish: 'At-Tafsīr Al-Muyassar',
      author: 'A group of scholars',
      category: 'Tafsir',
      description: 'A simplified explanation of the Quran',
    },
  ],

  // Sample Lectures
  lectures: [
    {
      lectureNumber: 18,
      lessonLabel: 'Lesson 18',
      bookTitle: 'Al-Mulakhkhaṣ: Explanation of Kitāb At-Tawḥīd',
      location: 'Jāmiʿ Al-Wurūd, Al-Wurūd District, Jeddah',
      locationType: 'in-person',
      hijriDate: '٢٠ / ٥ / ١٤٤٧',
      gregorianDate: '2025-11-25',
      duration: '10:46',
      chapterSection: 'Fundamentals of Tawḥīd',
      category: 'Aqeedah',
      tags: ['Tawhid', 'Aqeedah', 'Islamic Monotheism'],
      published: true,
      featured: true,
      content: `<h2>The Reality of Tawḥīd</h2>
<p>In this blessed gathering, we continue our study of the fundamental principles of Islamic monotheism (tawḥīd), exploring the essential foundations that every Muslim must understand and implement in their daily life.</p>
<p>Allah تعالى says:</p>
<div class="text-center my-8">
  <p class="arabic-text">قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ</p>
  <p class="transliteration">"Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent." [Sūrah Al-Ikhlāṣ 112:1-4]</p>
</div>`,
      excerpt: 'In this blessed gathering, we continue our study of the fundamental principles of Islamic monotheism (tawḥīd), exploring the essential foundations...',
    },
    {
      lectureNumber: 18,
      lessonLabel: 'Lesson 18',
      bookTitle: 'Al-Mulakhkhaṣ Al-Fiqhī',
      location: 'Jāmiʿ Al-Wurūd, Al-Wurūd District, Jeddah',
      locationType: 'in-person',
      hijriDate: '٢١ / ٥ / ١٤٤٧',
      gregorianDate: '2025-11-26',
      duration: '11:25',
      category: 'Fiqh',
      tags: ['Fiqh', 'Islamic Jurisprudence'],
      published: true,
      featured: false,
      content: '<p>Lesson on Islamic jurisprudence principles and applications in daily life.</p>',
      excerpt: 'Lesson on Islamic jurisprudence principles and applications in daily life.',
    },
    {
      lectureNumber: 9,
      lessonLabel: 'Lesson 9',
      bookTitle: 'At-Tafsīr Al-Muyassar',
      location: 'Jāmiʿ Al-Wurūd',
      locationType: 'in-person',
      hijriDate: '١٥ / ٥ / ١٤٤٧',
      gregorianDate: '2025-11-20',
      duration: '06:05',
      chapterSection: 'Sūrah At-Takwīr (2)',
      category: 'Tafsir',
      tags: ['Tafsir', 'Quran'],
      published: true,
      featured: false,
      content: '<p>Explanation of Sūrah At-Takwīr, focusing on the signs of the Day of Judgment.</p>',
      excerpt: 'Explanation of Sūrah At-Takwīr, focusing on the signs of the Day of Judgment.',
    },
    {
      lectureNumber: 11,
      lessonLabel: 'Lesson 11',
      bookTitle: 'At-Tafsīr Al-Muyassar',
      location: 'Jāmiʿ Al-Wurūd',
      locationType: 'in-person',
      hijriDate: '١٧ / ٥ / ١٤٤٧',
      gregorianDate: '2025-11-22',
      duration: '05:35',
      chapterSection: 'Sūrah Al-Muṭaffifīn (1)',
      category: 'Tafsir',
      tags: ['Tafsir', 'Quran'],
      published: true,
      featured: false,
      content: '<p>Explanation of Sūrah Al-Muṭaffifīn, discussing honesty in business transactions.</p>',
      excerpt: 'Explanation of Sūrah Al-Muṭaffifīn, discussing honesty in business transactions.',
    },
  ],
};

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('lecture_notes');

    // Clear existing data
    await db.collection('sheikhs').deleteMany({});
    await db.collection('books').deleteMany({});
    await db.collection('lectures').deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert Sheikh
    const sheikhResult = await db.collection('sheikhs').insertOne(seedData.sheikh);
    const sheikhId = sheikhResult.insertedId;
    console.log('✅ Inserted Sheikh');

    // Insert Books
    const booksResult = await db.collection('books').insertMany(seedData.books);
    const bookIds = Object.values(booksResult.insertedIds);
    console.log('✅ Inserted Books');

    // Insert Lectures with references
    const lectures = seedData.lectures.map((lecture, index) => {
      const bookIndex = index % 3; // Distribute lectures across books
      const book = seedData.books[bookIndex];

      return {
        ...lecture,
        bookId: bookIds[bookIndex],
        bookTitleArabic: book.titleArabic,
        bookTitleEnglish: book.titleEnglish,
        bookAuthor: book.author,
        sheikhId: sheikhId,
        gregorianDate: new Date(lecture.gregorianDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    await db.collection('lectures').insertMany(lectures);
    console.log('✅ Inserted Lectures');

    console.log('\n🎉 Database seeded successfully!');
    console.log(`   - 1 Sheikh`);
    console.log(`   - ${seedData.books.length} Books`);
    console.log(`   - ${seedData.lectures.length} Lectures`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seed();
