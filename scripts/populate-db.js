const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.DB_STRING);

async function populateDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('notes-from-majlis');
    const seriesCollection = db.collection('series');
    const lessonsCollection = db.collection('lessons');

    // First, check if series exists
    const seriesId = 'sahih-bukhari-book-of-faith';
    let series = await seriesCollection.findOne({ seriesId });

    if (!series) {
      // Create the series
      series = {
        seriesId: seriesId,
        titleEnglish: 'Sahih Al-Bukhari - Book of Faith',
        titleArabic: 'صحيح البخاري - كتاب الإيمان',
        category: 'Hadith',
        author: 'Sheikh Hassan bin Muhammad Mansur Ad-Daghriri',
        description: 'A detailed study of Kitab Al-Iman (The Book of Faith) from Sahih Al-Bukhari, the most authentic collection of hadith.',
        status: 'Ongoing',
        totalLessons: 1, // Will update as we add more
        location: 'Jami\' Al-Wurud, Al-Wurud District, Jeddah',
        telegramLink: null, // Add if available
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const insertResult = await seriesCollection.insertOne(series);
      console.log('✅ Series created:', insertResult.insertedId);
    } else {
      console.log('ℹ️  Series already exists');
    }

    // Create the lesson
    const lesson = {
      seriesId: seriesId,
      lessonNumber: 1,
      titleEnglish: 'Hadiths 26-30: Faith, Action, and Social Conduct',
      titleArabic: 'الأحاديث ٢٦-٣٠: الإيمان والعمل والسلوك الاجتماعي',

      // Dates
      dateGregorian: new Date('2025-01-13'), // Converted from Hijri ١٣/ ٧/ ١٤٤٧
      dateHijri: '١٣/ ٧/ ١٤٤٧',

      // Audio & Media
      duration: '1:07:19',
      durationSeconds: 4039, // 67 minutes, 19 seconds
      telegramLink: 'https://t.me/daririhasan/6158', // Primary audio source
      whatsappLink: 'https://chat.whatsapp.com/DUvpoPZFcBk22nVL1nIrVg', // Community group
      audioLink: 'https://t.me/daririhasan/6158', // Keep for backwards compatibility

      // Content Structure
      hadithsCovered: '26-30',
      chaptersCovered: [
        'Those Who Say That Īmān is Action',
        'When Islam is Not Upon Truth but Upon Submission or Fear of Being Killed',
        'Spreading Salām is Part of Islam',
        'Ingratitude Toward the Husband (Kufrān Al-ʿAshīr)',
        'Sins from the Pre-Islamic Era (Jāhiliyyah)'
      ],

      // Metadata
      location: 'Jāmiʿ Al-Wurūd, Al-Wurūd District, Jeddah',
      bookName: 'صحيح البخاري - كتاب الإيمان',
      bookNameEnglish: 'Sahih Al-Bukhari - Book of Faith',
      bookAuthor: 'الإمام محمد بن إسماعيل البخاري',
      bookAuthorEnglish: 'Imam Muhammad ibn Ismail Al-Bukhari',

      summary: 'This lesson covers five fundamental chapters from the Book of Faith in Sahih Al-Bukhari (Hadiths 26-30), addressing the relationship between faith and action, the distinction between Islam and Iman, the importance of spreading Salam, marital relations and gratitude, and remnants of pre-Islamic practices.',
      notes: `# Notes: Sahih Al-Bukhari | Book of Faith (Kitab Al-Iman)

**Book**: صحيح البخاري - كتاب الإيمان / Ṣaḥīḥ Al-Bukhārī - Kitāb Al-Īmān (The Book of Faith)
**Author**: Imam Muḥammad ibn Ismāʿīl Al-Bukhārī رحمه الله
**Sheikh**: Ḥasan bin Muḥammad Manṣūr Ad-Daghrīrī حفظه الله
**Location**: Jāmiʿ Al-Wurūd, Al-Wurūd District, Jeddah
**Hadiths Covered**: Hadith 26-30

## Chapters Covered:
1. Those Who Say That Īmān is Action
2. When Islam is Not Upon Truth but Upon Submission or Fear of Being Killed
3. Spreading Salām is Part of Islam
4. Ingratitude Toward the Husband
5. Sins from the Pre-Islamic Era (Jāhiliyyah)

---

## Chapter 1: Those Who Say That Īmān is Action

This chapter addresses the position that īmān (الإيمان - faith) consists of action. The foundation for this is the statement of Allah تعالى:

وَتِلْكَ الْجَنَّةُ الَّتِي أُورِثْتُمُوهَا بِمَا كُنْتُمْ تَعْمَلُونَ

"And that is Paradise which you are made to inherit for what you used to do." [Sūrah Az-Zukhruf 43:72]

### Hadith 26: The Best of Deeds

The sheikh رحمه الله narrated that the Messenger of Allah صلى الله عليه وسلم was asked:

أَيُّ الْعَمَلِ أَفْضَلُ؟ "Which deed is best?"

He صلى الله عليه وسلم replied:

إِيمَانٌ بِاللَّهِ وَرَسُولِهِ "Faith in Allah and His Messenger."

It was said: "Then what?"

He صلى الله عليه وسلم said: الْجِهَادُ فِي سَبِيلِ اللَّهِ "Jihād in the path of Allah."

It was said: "Then what?"

He صلى الله عليه وسلم said: حَجٌّ مَبْرُورٌ "An accepted Hajj."

---

## Chapter 2: When Islam is Not Upon Truth but Upon Submission or Fear

This chapter discusses the difference between true īmān and outward submission. The basis for this is:

قَالَتِ الْأَعْرَابُ آمَنَّا قُل لَّمْ تُؤْمِنُوا وَلَٰكِن قُولُوا أَسْلَمْنَا وَلَمَّا يَدْخُلِ الْإِيمَانُ فِي قُلُوبِكُمْ

"The bedouins say, 'We have believed.' Say, 'You have not [yet] believed; but say [instead], "We have submitted," for faith has not yet entered your hearts.'" [Sūrah Al-Ḥujurāt 49:14]

### Hadith 27: The Difference Between Muslim and Muʾmin

The Prophet صلى الله عليه وسلم gave to a group of people while Saʿd was sitting among them. The Messenger left out one man who was most pleasing to Saʿd.

Saʿd said: "O Messenger of Allah, why did you leave out so-and-so? By Allah, I surely see him as a believer (muʾmin)."

The Prophet صلى الله عليه وسلم said: "Or a Muslim?"

After Saʿd repeated this, the Messenger صلى الله عليه وسلم said:

يَا سَعْدُ إِنِّي لَأُعْطِي الرَّجُلَ وَغَيْرُهُ أَحَبُّ إِلَيَّ مِنْهُ خَشْيَةَ أَن يَكُبَّهُ اللَّهُ فِي النَّارِ

"O Saʿd, indeed I give to a man while another is more beloved to me than him, out of fear that Allah may throw him on his face into the Fire."

**Sheikh's Explanation**: A person is called "Muslim" rather than "Muʾmin" because the term muʾmin is generally applied to one who has complete faith. When addressing someone whose state is uncertain, one says "O Muslim" rather than "O Believer."

---

## Chapter 3: Spreading Salām is Part of Islam

ʿAmmār رضي الله عنه said: "Three qualities—whoever combines them has combined faith:

1. **Justice with oneself** (الإنصاف من نفسك)
2. **Spreading salām to the world** (بذل السلام للعالم)
3. **Spending from poverty** (الإنفاق من الإقتار)"

### Hadith 28: What is the Best Islam?

A man asked the Messenger of Allah صلى الله عليه وسلم: أَيُّ الْإِسْلَامِ خَيْرٌ؟ "What is the best of Islam?"

He صلى الله عليه وسلم said:

تُطْعِمُ الطَّعَامَ وَتَقْرَأُ السَّلَامَ عَلَىٰ مَن عَرَفْتَ وَمَن لَّمْ تَعْرِفْ

"You feed people and spread salām to those you know and those you do not know."

---

## Chapter 4: Ingratitude Toward the Husband (Kufrān Al-ʿAshīr)

This chapter discusses kufr (كفر - disbelief/ingratitude) of different types. There is lesser kufr (كفر أصغر) which does not remove a person from Islam, and greater kufr (كفر أكبر) which does.

### Hadith 29: Women's Ingratitude

The Prophet صلى الله عليه وسلم said:

أُرِيتُ النَّارَ فَإِذَا أَكْثَرُ أَهْلِهَا النِّسَاءُ يَكْفُرْنَ

"I was shown the Hellfire, and the majority of its inhabitants were women who are ungrateful."

It was asked: "Do they disbelieve in Allah?"

He صلى الله عليه وسلم said:

يَكْفُرْنَ الْعَشِيرَ وَيَكْفُرْنَ الْإِحْسَانَ لَوْ أَحْسَنْتَ إِلَىٰ إِحْدَاهُنَّ الدَّهْرَ ثُمَّ رَأَتْ مِنكَ شَيْئًا قَالَتْ مَا رَأَيْتُ مِنكَ خَيْرًا قَطُّ

"They are ungrateful to their husbands and ungrateful for kindness. If you were to do good to one of them for a lifetime, then she sees something from you [that displeases her], she says, 'I have never seen any good from you.'"

**Sheikh's Commentary**: This is the nature of women—they focus on faults and do not look at good qualities. What is obligatory is to look at the good qualities just as one looks at the faults. The Prophet صلى الله عليه وسلم commanded patience with one another:

لَا يَفْرَكْ مُؤْمِنٌ مُؤْمِنَةً إِن كَرِهَ مِنْهَا خُلُقًا رَضِيَ مِنْهَا آخَرَ

"A believing man should not hate a believing woman. If he dislikes one characteristic of hers, he will be pleased with another."

---

## Chapter 5: Sins from the Pre-Islamic Era (Jāhiliyyah)

This chapter addresses sins from jāhiliyyah that do not make one a disbeliever except through shirk.

The basis is the statement of the Prophet صلى الله عليه وسلم: إِنَّكَ امْرُؤٌ فِيكَ جَاهِلِيَّةٌ "Indeed, you are a man in whom there is [some characteristic of] jāhiliyyah."

And the statement of Allah: إِنَّ اللَّهَ لَا يَغْفِرُ أَن يُشْرَكَ بِهِ وَيَغْفِرُ مَا دُونَ ذَٰلِكَ لِمَن يَشَاءُ

"Indeed, Allah does not forgive association with Him, but He forgives what is less than that for whom He wills." [Sūrah An-Nisāʾ 4:48]

### Hadith 30: The Incident of Abū Dharr and His Slave

Abū Dharr رضي الله عنه was wearing a cloak, and his slave was wearing a similar cloak. When asked about this, he said:

إِنِّي سَابَبْتُ رَجُلًا فَعَيَّرْتُهُ بِأُمِّهِ

"I insulted a man and reproached him regarding his mother."

Abū Dharr had said to him: "O son of a black woman" (يَا ابْنَ السَّوْدَاءِ).

The Prophet صلى الله عليه وسلم said to him:

يَا أَبَا ذَرٍّ أَعَيَّرْتَهُ بِأُمِّهِ إِنَّكَ امْرُؤٌ فِيكَ جَاهِلِيَّةٌ

"O Abū Dharr, did you reproach him regarding his mother? Indeed, you are a man in whom there is [some characteristic of] jāhiliyyah."

**Sheikh's Explanation**: Among the actions of pre-Islamic ignorance are:
1. **Boasting about lineages** (الفخر بالأحساب)
2. **Defaming ancestries** (الطعن في الأنساب)
3. **Wailing over the dead** (النياحة على الميت)

These practices will not cease until the Day of Resurrection.

### The Prophet's Command Regarding Slaves

The Prophet صلى الله عليه وسلم said:

إِخْوَانُكُمْ خَوَلُكُمْ جَعَلَهُمُ اللَّهُ تَحْتَ أَيْدِيكُمْ

"Your brothers are your servants. Allah has placed them under your authority."

فَمَن كَانَ أَخُوهُ تَحْتَ يَدِهِ فَلْيُطْعِمْهُ مِمَّا يَأْكُلُ وَلْيُلْبِسْهُ مِمَّا يَلْبَسُ وَلَا تُكَلِّفُوهُم مَّا يَغْلِبُهُمْ فَإِن كَلَّفْتُمُوهُمْ فَأَعِينُوهُمْ

"Whoever has his brother under his authority should feed him from what he eats and clothe him from what he wears. Do not burden them with what is too difficult for them, and if you do burden them, then help them."

This is why Abū Dharr dressed his slave in a cloak similar to his own—as an act of expiation and obedience to the Messenger's command.`,

      keyTerms: [
        {
          termEnglish: 'Īmān',
          termArabic: 'الإيمان',
          definition: 'Faith, which according to Ahl As-Sunnah consists of statement of the tongue, belief in the heart, and action of the limbs.'
        },
        {
          termEnglish: 'Muslim vs Muʾmin',
          termArabic: 'مسلم - مؤمن',
          definition: 'Muslim refers to one who has submitted outwardly, while Muʾmin refers to one who has complete faith. The term Muʾmin is more specific and honorable.'
        },
        {
          termEnglish: 'Kufrān Al-ʿAshīr',
          termArabic: 'كفران العشير',
          definition: 'Ingratitude toward one\'s husband/spouse. This is a form of lesser kufr (kufr aṣghar) that does not expel one from Islam.'
        },
        {
          termEnglish: 'Kufr Aṣghar vs Kufr Akbar',
          termArabic: 'كفر أصغر - كفر أكبر',
          definition: 'Lesser disbelief (such as ingratitude) which does not remove one from Islam, versus greater disbelief which expels one from the religion.'
        },
        {
          termEnglish: 'Jāhiliyyah',
          termArabic: 'جاهلية',
          definition: 'Pre-Islamic ignorance, or characteristics from that era such as boasting about lineages, defaming ancestries, and wailing over the dead.'
        },
        {
          termEnglish: 'Ḥajj Mabrūr',
          termArabic: 'حج مبرور',
          definition: 'An accepted Hajj, one that is done correctly and sincerely, free from sins and showing off.'
        },
        {
          termEnglish: 'Spreading Salām',
          termArabic: 'بذل السلام',
          definition: 'Offering greetings of peace to Muslims, whether you know them or not. This is one of the best characteristics of Islam.'
        },
        {
          termEnglish: 'Ar-Rabādhah',
          termArabic: 'الربذة',
          definition: 'A well-known place between Makkah and Madīnah, to the south of Madīnah, where Abū Dharr settled and died.'
        }
      ],

      timestamps: [
        {
          time: '00:00',
          description: 'Introduction - Chapter: Those Who Say That Īmān is Action'
        },
        {
          time: '05:00',
          description: 'Hadith 26: The Best of Deeds (Faith, Jihad, Hajj)'
        },
        {
          time: '12:00',
          description: 'Chapter: When Islam is Not Upon Truth but Upon Submission'
        },
        {
          time: '15:00',
          description: 'Hadith 27: The Difference Between Muslim and Muʾmin'
        },
        {
          time: '25:00',
          description: 'Chapter: Spreading Salām is Part of Islam'
        },
        {
          time: '28:00',
          description: 'Hadith 28: Feeding People and Spreading Salām'
        },
        {
          time: '35:00',
          description: 'Chapter: Ingratitude Toward the Husband'
        },
        {
          time: '38:00',
          description: 'Hadith 29: Women\'s Ingratitude and Marital Relations'
        },
        {
          time: '45:00',
          description: 'Sheikh\'s Commentary on Patience in Marriage'
        },
        {
          time: '52:00',
          description: 'Chapter: Sins from the Pre-Islamic Era (Jāhiliyyah)'
        },
        {
          time: '55:00',
          description: 'Hadith 30: The Incident of Abū Dharr and His Slave'
        },
        {
          time: '65:00',
          description: 'The Prophet\'s Command Regarding Treatment of Slaves/Servants'
        }
      ],

      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check if lesson already exists
    const existingLesson = await lessonsCollection.findOne({
      seriesId: seriesId,
      lessonNumber: 1
    });

    if (existingLesson) {
      console.log('ℹ️  Lesson already exists');
    } else {
      const lessonResult = await lessonsCollection.insertOne(lesson);
      console.log('✅ Lesson created:', lessonResult.insertedId);

      // Update series total lessons
      await seriesCollection.updateOne(
        { seriesId: seriesId },
        {
          $set: {
            totalLessons: 1,
            updatedAt: new Date()
          }
        }
      );
      console.log('✅ Series updated with lesson count');
    }

    console.log('\n🎉 Database population complete!');

  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

populateDatabase();
