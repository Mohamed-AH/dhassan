// MongoDB seed script - Run directly in mongosh
// Usage: docker exec -i dhassan-mongodb mongosh -u admin -p password123 --authenticationDatabase admin lecture_notes < scripts/seed-mongo.js

// Switch to lecture_notes database
db = db.getSiblingDB('lecture_notes');

print('🗑️  Clearing existing data...');
db.sheikhs.deleteMany({});
db.books.deleteMany({});
db.lectures.deleteMany({});

print('✅ Inserting Sheikh...');
const sheikhResult = db.sheikhs.insertOne({
  nameArabic: 'حسن بن محمد منصور الدغريري',
  nameEnglish: 'Ḥasan bin Muḥammad Manṣūr Ad-Daghrīrī',
  honorific: 'حفظه الله',
  bio: 'Student of the late Sheikh Aḥmad bin Yaḥyá An-Najmī رحمه الله',
  createdAt: new Date(),
  updatedAt: new Date(),
});
const sheikhId = sheikhResult.insertedId;

print('✅ Inserting Books...');
const booksResult = db.books.insertMany([
  {
    titleArabic: 'الملخص شرح كتاب التوحيد',
    titleEnglish: 'Al-Mulakhkhaṣ: Explanation of Kitāb At-Tawḥīd',
    author: 'Sheikh Ṣāliḥ Al-Fawzān حفظه الله',
    category: 'Aqeedah',
    description: 'A comprehensive explanation of the book on Islamic monotheism',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    titleArabic: 'الملخص الفقهي',
    titleEnglish: 'Al-Mulakhkhaṣ Al-Fiqhī',
    author: 'Sheikh Ṣāliḥ Al-Fawzān حفظه الله',
    category: 'Fiqh',
    description: 'A summary of Islamic jurisprudence',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    titleArabic: 'التفسير الميسر',
    titleEnglish: 'At-Tafsīr Al-Muyassar',
    author: 'A group of scholars',
    category: 'Tafsir',
    description: 'A simplified explanation of the Quran',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

const bookIds = Object.values(booksResult.insertedIds);

print('✅ Inserting Lectures...');
db.lectures.insertMany([
  {
    lectureNumber: 18,
    bookId: bookIds[0],
    bookTitleArabic: 'الملخص شرح كتاب التوحيد',
    bookTitleEnglish: 'Al-Mulakhkhaṣ: Explanation of Kitāb At-Tawḥīd',
    bookAuthor: 'Sheikh Ṣāliḥ Al-Fawzān حفظه الله',
    sheikhId: sheikhId,
    lessonLabel: 'Lesson 18',
    location: 'Jāmiʿ Al-Wurūd, Al-Wurūd District, Jeddah',
    locationType: 'in-person',
    hijriDate: '٢٠ / ٥ / ١٤٤٧',
    gregorianDate: new Date('2025-11-25'),
    duration: '10:46',
    chapterSection: 'Fundamentals of Tawḥīd',
    content: '<h2>The Reality of Tawḥīd</h2><p>In this blessed gathering, we continue our study of the fundamental principles of Islamic monotheism (tawḥīd), exploring the essential foundations that every Muslim must understand and implement in their daily life.</p><p>Allah تعالى says:</p><div class="text-center my-8"><p class="arabic-text">قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ</p><p class="transliteration">"Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent." [Sūrah Al-Ikhlāṣ 112:1-4]</p></div><h3>The Testimony of Faith</h3><p>Sheikh Aḥmad An-Najmī رحمه الله explained in his commentary: The testimony "Lā ilāha illa Allāh" encompasses belief in the heart, affirmation on the tongue, and action with the limbs.</p>',
    excerpt: 'In this blessed gathering, we continue our study of the fundamental principles of Islamic monotheism (tawḥīd), exploring the essential foundations...',
    category: 'Aqeedah',
    tags: ['Tawhid', 'Aqeedah', 'Islamic Monotheism'],
    published: true,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    lectureNumber: 18,
    bookId: bookIds[1],
    bookTitleArabic: 'الملخص الفقهي',
    bookTitleEnglish: 'Al-Mulakhkhaṣ Al-Fiqhī',
    bookAuthor: 'Sheikh Ṣāliḥ Al-Fawzān حفظه الله',
    sheikhId: sheikhId,
    lessonLabel: 'Lesson 18',
    location: 'Jāmiʿ Al-Wurūd, Al-Wurūd District, Jeddah',
    locationType: 'in-person',
    hijriDate: '٢١ / ٥ / ١٤٤٧',
    gregorianDate: new Date('2025-11-26'),
    duration: '11:25',
    content: '<h2>Principles of Islamic Jurisprudence</h2><p>This lesson covers fundamental principles of Islamic jurisprudence (fiqh) and their practical applications in daily life. We explore how the scholars derived rulings from the Quran and Sunnah.</p>',
    excerpt: 'This lesson covers fundamental principles of Islamic jurisprudence (fiqh) and their practical applications in daily life.',
    category: 'Fiqh',
    tags: ['Fiqh', 'Islamic Jurisprudence'],
    published: true,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    lectureNumber: 9,
    bookId: bookIds[2],
    bookTitleArabic: 'التفسير الميسر',
    bookTitleEnglish: 'At-Tafsīr Al-Muyassar',
    bookAuthor: 'A group of scholars',
    sheikhId: sheikhId,
    lessonLabel: 'Lesson 9',
    location: 'Jāmiʿ Al-Wurūd',
    locationType: 'in-person',
    hijriDate: '١٥ / ٥ / ١٤٤٧',
    gregorianDate: new Date('2025-11-20'),
    duration: '06:05',
    chapterSection: 'Sūrah At-Takwīr (2)',
    content: '<h2>Sūrah At-Takwīr</h2><p>Explanation of Sūrah At-Takwīr, focusing on the signs of the Day of Judgment and the cosmic events that will occur.</p>',
    excerpt: 'Explanation of Sūrah At-Takwīr, focusing on the signs of the Day of Judgment and the cosmic events that will occur.',
    category: 'Tafsir',
    tags: ['Tafsir', 'Quran'],
    published: true,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    lectureNumber: 11,
    bookId: bookIds[2],
    bookTitleArabic: 'التفسير الميسر',
    bookTitleEnglish: 'At-Tafsīr Al-Muyassar',
    bookAuthor: 'A group of scholars',
    sheikhId: sheikhId,
    lessonLabel: 'Lesson 11',
    location: 'Jāmiʿ Al-Wurūd',
    locationType: 'in-person',
    hijriDate: '١٧ / ٥ / ١٤٤٧',
    gregorianDate: new Date('2025-11-22'),
    duration: '05:35',
    chapterSection: 'Sūrah Al-Muṭaffifīn (1)',
    content: '<h2>Sūrah Al-Muṭaffifīn</h2><p>Explanation of Sūrah Al-Muṭaffifīn, discussing the importance of honesty and fairness in business transactions and the severe punishment for those who cheat.</p>',
    excerpt: 'Explanation of Sūrah Al-Muṭaffifīn, discussing the importance of honesty and fairness in business transactions.',
    category: 'Tafsir',
    tags: ['Tafsir', 'Quran', 'Business Ethics'],
    published: true,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    lectureNumber: 17,
    bookId: bookIds[0],
    bookTitleArabic: 'الملخص شرح كتاب التوحيد',
    bookTitleEnglish: 'Al-Mulakhkhaṣ: Explanation of Kitāb At-Tawḥīd',
    bookAuthor: 'Sheikh Ṣāliḥ Al-Fawzān حفظه الله',
    sheikhId: sheikhId,
    lessonLabel: 'Lesson 17',
    location: 'Jāmiʿ Al-Wurūd, Al-Wurūd District, Jeddah',
    locationType: 'in-person',
    hijriDate: '١٨ / ٥ / ١٤٤٧',
    gregorianDate: new Date('2025-11-23'),
    duration: '09:30',
    chapterSection: 'The Meaning of Lā ilāha illa Allāh',
    content: '<h2>The Testimony of Faith</h2><p>Understanding the deep meaning of the testimony of faith and its conditions.</p>',
    excerpt: 'Understanding the deep meaning of the testimony of faith and its conditions.',
    category: 'Aqeedah',
    tags: ['Tawhid', 'Aqeedah'],
    published: true,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    lectureNumber: 19,
    bookId: bookIds[0],
    bookTitleArabic: 'الملخص شرح كتاب التوحيد',
    bookTitleEnglish: 'Al-Mulakhkhaṣ: Explanation of Kitāb At-Tawḥīd',
    bookAuthor: 'Sheikh Ṣāliḥ Al-Fawzān حفظه الله',
    sheikhId: sheikhId,
    lessonLabel: 'Lesson 19',
    location: 'Jāmiʿ Al-Wurūd, Al-Wurūd District, Jeddah',
    locationType: 'in-person',
    hijriDate: '٢٢ / ٥ / ١٤٤٧',
    gregorianDate: new Date('2025-11-27'),
    duration: '10:15',
    chapterSection: 'Types of Shirk',
    content: '<h2>Understanding Shirk</h2><p>Explaining the different types of shirk (associating partners with Allah) and how to avoid them.</p>',
    excerpt: 'Explaining the different types of shirk (associating partners with Allah) and how to avoid them.',
    category: 'Aqeedah',
    tags: ['Tawhid', 'Aqeedah', 'Shirk'],
    published: true,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

print('\n🎉 Database seeded successfully!');
print('   - 1 Sheikh');
print('   - 3 Books');
print('   - 6 Lectures');
print('\n✅ You can now view the lectures at http://localhost:3000');
