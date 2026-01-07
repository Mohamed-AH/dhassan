# Implementation Plan: CLI Import Wizard
## Based on Your Decisions

---

## ✅ YOUR CHOICES

1. **Method**: Option C - Interactive CLI Wizard
2. **Hadith Display**: "Hadith 1-30 | أحاديث ١-٣٠" (Bilingual)
3. **Auto-Extract**: Everything (chapters, timestamps, hadith mentions, key terms)
4. **Telegram Link**: Prominent button in hero + shown in metadata section
5. **Rollout**: Gradual (one lesson at a time)

---

## 🎯 IMPLEMENTATION STEPS

### Step 1: Create Import Wizard Script
**File**: `/scripts/import-lesson-wizard.js`

**What it does:**
```bash
$ npm run import-lesson lecture_notes_L01_COMPREHENSIVE.md

📚 Lesson Import Wizard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Reading Markdown File...
✅ File: lecture_notes_L01_COMPREHENSIVE.md
✅ Size: 1,446 lines
✅ Word Count: ~15,000 words

Step 2: Auto-Extracting Content...
✅ Found 23 chapters
✅ Found 45 timestamps
✅ Detected hadiths: 1-30
✅ Found 18 key terms

Step 3: Collecting Metadata...
[Interactive prompts - 9 questions]

Step 4: Preview & Confirm...
[Show complete lesson data]

Step 5: Import to Database...
✅ Imported successfully!
```

---

### Step 2: Auto-Extraction Logic

#### A. Extract Chapters
**Strategy**: Parse all `## Heading` lines
**Result**: Array of chapter titles

```javascript
// Input from markdown:
## السلام والافتتاح | Opening Greetings
## شهادة العلماء على صحيح البخاري
## The Book of the Beginning of Revelation

// Output:
chapters: [
  "السلام والافتتاح | Opening Greetings",
  "شهادة العلماء على صحيح البخاري",
  "The Book of the Beginning of Revelation",
  // ... 20 more
]
```

#### B. Extract Timestamps
**Strategy**: Find all `(HH:MM:SS-HH:MM:SS)` or `(MM:SS-MM:SS)` patterns

```javascript
// Input from markdown:
(0:00-0:30) السلام عليكم ورحمة الله وبركاته
(3:31-4:19) قال أبو جعفر حمود...

// Output:
timestamps: [
  {
    time: "00:00",
    endTime: "00:30",
    seconds: 0,
    endSeconds: 30,
    description: "السلام والافتتاح | Opening Greetings",
    textSnippet: "السلام عليكم ورحمة الله وبركاته"
  },
  {
    time: "03:31",
    endTime: "04:19",
    seconds: 211,
    endSeconds: 259,
    description: "شهادة العلماء على صحيح البخاري",
    textSnippet: "قال أبو جعفر حمود ابن عمر العُقَيلي..."
  },
  // ... 43 more
]
```

#### C. Detect Hadith Range
**Strategy**: Find all mentions of "Hadith X" or "الحديث X"

```javascript
// Input from markdown:
## الحديث الأول: إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ
## Hadith 1: Actions are by Intentions
...
## Hadith 30: The Incident of Abū Dharr

// Output:
hadithsDetected: [1, 2, 3, ... 30]
hadithsStart: 1
hadithsEnd: 30
hadithsDisplay: "Hadith 1-30 | أحاديث ١-٣٠"
```

**Arabic Number Conversion:**
```javascript
1-30 → ١-٣٠ (using Arabic-Indic numerals)
```

#### D. Extract Key Terms
**Strategy**: Find **bold text** that looks like terms/definitions

```javascript
// Input from markdown:
**Al-Waḥy** (الوحي) is Allah تعالى informing...
**Rūḥ Al-Qudus** breathed into my soul...

// Output:
keyTerms: [
  {
    termEnglish: "Al-Waḥy",
    termArabic: "الوحي",
    definition: "Allah informing His Messenger...",
    firstMention: "line 86"
  },
  {
    termEnglish: "Rūḥ Al-Qudus",
    definition: "The Pure Spirit, breathed into...",
    firstMention: "line 94"
  },
  // ... 16 more
]
```

---

### Step 3: Interactive Prompts

**The 9 Questions:**

```javascript
1. Series Title (English):
   ? › Sahih Al-Bukhari - Book of Knowledge/Faith

2. Series Title (Arabic):
   ? › صحيح البخاري - كتاب العلم

3. Sheikh Name (English):
   ? › Hassan bin Muhammad Mansour Al-Daghriri

4. Sheikh Name (Arabic):
   ? › حسن بن محمد منصور الدغريري

5. Lesson Number:
   ? › 1

6. Lesson Title:
   ? › First Lesson

7. Duration (HH:MM:SS or MM:SS):
   ? › 1:07:19

8. Location (English):
   ? › Al-Wurood Mosque

9. Date (Hijri format):
   ? › ١٣/ ٧/ ١٤٤٧

10. Telegram Audio Link:
    ? › https://t.me/daririhasan/6158
```

**Note:** Hadith range is AUTO-DETECTED (shows "✅ Detected: 1-30")

---

### Step 4: Data Preview

```javascript
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 LESSON DATA PREVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASIC INFO:
  Series: Sahih Al-Bukhari - Book of Knowledge/Faith
          صحيح البخاري - كتاب العلم
  Sheikh: Hassan bin Muhammad Mansour Al-Daghriri
          حسن بن محمد منصور الدغريري
  Lesson: #1 - First Lesson

HADITHS:
  Range: Hadith 1-30 | أحاديث ١-٣٠
  Detected: 30 hadiths found in text

AUDIO:
  Duration: 1:07:19 (4,039 seconds)
  Telegram: https://t.me/daririhasan/6158

DATE & LOCATION:
  Location: Al-Wurood Mosque
  Date (Hijri): ١٣/ ٧/ ١٤٤٧
  Date (Gregorian): January 13, 2025

CONTENT:
  Notes: 1,446 lines (~15,000 words)
  Chapters: 23 sections
  Timestamps: 45 timestamps
  Key Terms: 18 terms

GENERATED IDs:
  Series ID: sahih-bukhari-book-of-knowledge-faith
  Lesson ID: sahih-bukhari-book-of-knowledge-faith-lesson-01

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
? Import this lesson to database? (Y/n) ›
```

---

### Step 5: MongoDB Document Structure

```javascript
{
  // Basic Info
  seriesId: "sahih-bukhari-book-of-knowledge-faith",
  seriesTitle: "Sahih Al-Bukhari - Book of Knowledge/Faith",
  seriesTitleArabic: "صحيح البخاري - كتاب العلم",

  sheikhName: "Hassan bin Muhammad Mansour Al-Daghriri",
  sheikhNameArabic: "حسن بن محمد منصور الدغريري",

  lessonNumber: 1,
  lessonTitle: "First Lesson",
  lessonId: "sahih-bukhari-book-of-knowledge-faith-lesson-01",

  // Hadiths
  hadithsStart: 1,
  hadithsEnd: 30,
  hadithsArray: [1,2,3,...,30],
  hadithsDisplay: "Hadith 1-30 | أحاديث ١-٣٠",

  // Audio
  duration: "1:07:19",
  durationSeconds: 4039,
  telegramLink: "https://t.me/daririhasan/6158",

  // Location & Date
  location: "Al-Wurood Mosque",
  dateHijri: "١٣/ ٧/ ١٤٤٧",
  dateGregorian: ISODate("2025-01-13"),

  // Content
  notesFile: "lecture_notes_L01_COMPREHENSIVE.md",
  notes: "# صحيح البخاری... [full 1446 lines]",
  notesWordCount: 15420,

  // Auto-Extracted
  chapters: [
    "السلام والافتتاح | Opening Greetings",
    "شهادة العلماء على صحيح البخاري",
    // ... 21 more
  ],

  timestamps: [
    {
      time: "00:00",
      endTime: "00:30",
      seconds: 0,
      endSeconds: 30,
      description: "السلام والافتتاح | Opening Greetings",
      textSnippet: "السلام عليكم..."
    },
    // ... 44 more
  ],

  keyTerms: [
    {
      termEnglish: "Al-Waḥy",
      termArabic: "الوحي",
      definition: "Revelation - Allah informing...",
      firstMention: "line 86"
    },
    // ... 17 more
  ],

  // Metadata
  createdAt: ISODate(),
  updatedAt: ISODate()
}
```

---

### Step 6: Lesson Page Display

#### Hero Section:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    [Sage Green Hero]

← Back to Sahih Al-Bukhari - Book of Knowledge/Faith

[Lesson 1] [Hadith 1-30 | أحاديث ١-٣٠] [⏱ 1:07:19]

Hadiths 1-30: The Beginning of Revelation
and Actions by Intentions
[Auto-generated title from hadith range + first chapter]

📚 Book: Sahih Al-Bukhari
👤 Sheikh: Hassan bin Muhammad Mansour Al-Daghriri
📍 Location: Al-Wurood Mosque
📅 Date: January 13, 2025 (١٣/ ٧/ ١٤٤٧)

[🎧 Listen to Recording] ← PROMINENT BUTTON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Metadata Section (below hero):
```
Also shown in metadata grid:
🎧 Audio: https://t.me/daririhasan/6158
```

---

## 🔧 TECHNICAL IMPLEMENTATION

### NPM Packages Required:
```json
{
  "inquirer": "^9.1.0",        // CLI prompts
  "gray-matter": "^4.0.3",     // Parse markdown frontmatter (if needed)
  "marked": "^9.1.0",          // Markdown parsing
  "slugify": "^1.6.5",         // Generate IDs
  "hijri-date": "^1.0.0",      // Hijri → Gregorian conversion
  "chalk": "^5.2.0",           // Colored terminal output
  "ora": "^6.1.2"              // Spinners for loading
}
```

### Regex Patterns:
```javascript
// Timestamps: (3:31-4:19) or (0:00-0:30)
const TIMESTAMP_REGEX = /\((\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*(\d{1,2}:\d{2}(?::\d{2})?)\)/g;

// Chapters: ## Any Title
const CHAPTER_REGEX = /^##\s+(.+)$/gm;

// Hadiths: ## Hadith 1: or ## الحديث الأول:
const HADITH_REGEX = /##\s*(?:Hadith|الحديث)\s+(\d+|الأول|الثاني|الثالث)/gi;

// Bold terms: **Term**
const BOLD_REGEX = /\*\*([^*]+)\*\*/g;

// Arabic text detection
const ARABIC_REGEX = /[\u0600-\u06FF]/;

// Arabic numbers: 1-30 → ١-٣٠
const arabicNumerals = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
function toArabicNumerals(num) {
  return String(num).replace(/\d/g, d => arabicNumerals[d]);
}
```

### Hijri Date Conversion:
```javascript
// Input: "١٣/ ٧/ ١٤٤٧" or "13/7/1447"
// Process:
//   1. Extract day, month, year
//   2. Use hijri-date package to convert
//   3. Output: ISODate("2025-01-13")

function convertHijriToGregorian(hijriDate) {
  // Parse format: DD/MM/YYYY
  const [day, month, year] = hijriDate.replace(/[٠-٩]/g, d =>
    '٠١٢٣٤٥٦٧٨٩'.indexOf(d)
  ).split('/').map(Number);

  // Use library to convert
  const gregorian = hijriToGregorian(year, month, day);
  return new Date(gregorian.year, gregorian.month - 1, gregorian.day);
}
```

---

## 📂 FILE STRUCTURE

```
/home/user/dhassan/
├── scripts/
│   ├── import-lesson-wizard.js   ← NEW: Main import script
│   ├── markdown-parser.js        ← NEW: Auto-extraction logic
│   ├── validators.js             ← NEW: Input validation
│   └── populate-db.js            ← EXISTING: Keep as reference
├── lesson-notes/                 ← NEW: Store markdown files
│   └── lecture_notes_L01_COMPREHENSIVE.md
└── package.json
    └── "import-lesson": "node scripts/import-lesson-wizard.js"
```

---

## ✅ SUCCESS CRITERIA

After running the import wizard for Sahih Bukhari lesson:

1. ✅ Lesson appears in database with all fields
2. ✅ Lesson page shows:
   - "Hadith 1-30 | أحاديث ١-٣٠" badge
   - Prominent "🎧 Listen to Recording" button
   - Telegram link in metadata section
   - Auto-generated TOC with 23 chapters
   - 45 clickable timestamps
   - 18 key terms
3. ✅ Arabic text displays properly (RTL)
4. ✅ Can navigate to lesson via:
   - `/lesson/[id]`
   - From series page
   - From landing page (if recent)

---

## 🚀 EXECUTION PLAN

### Phase 1: Build Core Script (1-2 hours)
- [ ] Create `import-lesson-wizard.js`
- [ ] Add interactive prompts (9 questions)
- [ ] Add markdown file reading
- [ ] Test with dummy data

### Phase 2: Add Auto-Extraction (2-3 hours)
- [ ] Parse chapters (## regex)
- [ ] Parse timestamps ((HH:MM-HH:MM) regex)
- [ ] Detect hadith range
- [ ] Extract key terms (bold text)
- [ ] Test extraction accuracy

### Phase 3: Database Integration (1 hour)
- [ ] Connect to MongoDB
- [ ] Generate unique IDs
- [ ] Insert lesson document
- [ ] Handle duplicates/errors
- [ ] Test import

### Phase 4: Test with Real Data (30 min)
- [ ] Run wizard with `lecture_notes_L01_COMPREHENSIVE.md`
- [ ] Verify all data imported correctly
- [ ] Check lesson page display
- [ ] Verify all links work

**Total Estimated Time: 4-6 hours**

---

## 🎯 READY TO CODE?

**This plan covers:**
✅ CLI wizard (your choice)
✅ Bilingual hadith display
✅ All auto-extraction
✅ Prominent telegram button
✅ Gradual rollout support

**Next steps:**
1. I build the import wizard script
2. You run: `npm run import-lesson lecture_notes_L01_COMPREHENSIVE.md`
3. You answer 9 questions
4. Script imports everything
5. You visit lesson page and verify

**Shall I proceed with coding?** (Yes to start implementation)
