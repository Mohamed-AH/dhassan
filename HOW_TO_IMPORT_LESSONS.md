# How to Import Lessons

## 🎯 Quick Start

Import your first lesson with the interactive CLI wizard:

```bash
npm run import-lesson lecture_notes_L01_COMPREHENSIVE.md
```

The wizard will:
1. ✅ Read your markdown file
2. ✅ Auto-extract chapters, timestamps, hadiths, key terms
3. ✅ Ask you 9 questions
4. ✅ Show a preview
5. ✅ Import to MongoDB

---

## 📋 What You Need

### Required Information (9 fields):
1. **Series Title (English)** - e.g., "Sahih Al-Bukhari - Book of Knowledge/Faith"
2. **Series Title (Arabic)** - e.g., "صحيح البخاري - كتاب العلم"
3. **Sheikh Name (English)** - e.g., "Hassan bin Muhammad Mansour Al-Daghriri"
4. **Sheikh Name (Arabic)** - e.g., "حسن بن محمد منصور الدغريري"
5. **Lesson Number** - e.g., `1`
6. **Lesson Title** - e.g., "First Lesson"
7. **Duration** - e.g., "1:07:19" (format: HH:MM:SS or MM:SS)
8. **Location** - e.g., "Al-Wurood Mosque"
9. **Date (Hijri)** - e.g., "١٣/ ٧/ ١٤٤٧" (format: DD/MM/YYYY)
10. **Telegram Link** - e.g., "https://t.me/daririhasan/6158" (optional)

### Auto-Extracted (you don't provide these):
- ✅ Chapters (from `## Headings`)
- ✅ Timestamps (from `(HH:MM-HH:MM)` format)
- ✅ Hadith range (detects "Hadith 1", "Hadith 2", etc.)
- ✅ Key terms (from `**bold text**`)

---

## 🚀 Step-by-Step Guide

### Step 1: Place Your Markdown File

Put your comprehensive markdown file in the project root:

```bash
/home/user/dhassan/
├── lecture_notes_L01_COMPREHENSIVE.md  ← Your file here
├── lecture_notes_L02.md
└── ...
```

### Step 2: Run the Import Wizard

```bash
npm run import-lesson lecture_notes_L01_COMPREHENSIVE.md
```

### Step 3: Answer Questions

The wizard will auto-detect data and show defaults:

```
Step 2: Auto-Extracted Content:
  File: lecture_notes_L01_COMPREHENSIVE.md
  Size: 1,447 lines (~12k words)
  Chapters: 49 sections
  Timestamps: 108 timestamps
  Hadiths: Detected 1-30 (14 hadiths)   ← Auto-detected!
  Key Terms: 148 terms

Step 3: Collecting Metadata...

? Series Title (English): (Sahih Al-Bukhari - Book of Knowledge/Faith)
→ Press Enter to accept default, or type your own
```

**Detected hadiths will be pre-filled** - just press Enter if correct!

### Step 4: Review Preview

The wizard shows a complete preview:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 LESSON DATA PREVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BASIC INFO:
  Series: Sahih Al-Bukhari - Book of Knowledge/Faith
          صحيح البخاري - كتاب العلم
  Sheikh: Hassan bin Muhammad Mansour Al-Daghriri
          حسن بن محمد منصور الدغريري
  Lesson: #1 - First Lesson

HADITHS:
  Range: Hadith 1-30 | أحاديث ١-٣٠          ← Bilingual!
  Count: 30 hadiths

AUDIO:
  Duration: 1:07:19 (4,039 seconds)
  Telegram: https://t.me/daririhasan/6158

DATE & LOCATION:
  Location: Al-Wurood Mosque
  Date (Hijri): ١٣/ ٧/ ١٤٤٧
  Date (Gregorian): January 13, 2025        ← Auto-converted!

CONTENT:
  Notes: 1,447 lines (~12k words)
  Chapters: 49 sections
  Timestamps: 108 timestamps
  Key Terms: 148 terms

GENERATED IDs:
  Series ID: sahih-bukhari-book-of-knowledge-faith
  Lesson ID: sahih-bukhari-book-of-knowledge-faith-lesson-01

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
? Import this lesson to database? (Y/n)
```

### Step 5: Confirm Import

Type `Y` or just press Enter to import!

```
Step 5: Importing to Database...
✔ ✅ Lesson imported successfully!
   Lesson ID: 507f1f77bcf86cd799439011
   ✅ Series created

🎉 Import Complete!

You can now view this lesson at:
http://localhost:3000/series/sahih-bukhari-book-of-knowledge-faith
```

---

## 📊 What Gets Stored

The wizard creates a complete MongoDB document:

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

  // Hadiths (Bilingual Display)
  hadithsStart: 1,
  hadithsEnd: 30,
  hadithsArray: [1,2,3,...,30],
  hadithsDisplay: "Hadith 1-30 | أحاديث ١-٣٠",  ← Used in UI

  // Audio
  duration: "1:07:19",
  durationSeconds: 4039,
  telegramLink: "https://t.me/daririhasan/6158",

  // Location & Date
  location: "Al-Wurood Mosque",
  dateHijri: "١٣/ ٧/ ١٤٤٧",
  dateGregorian: ISODate("2025-01-13"),     ← Auto-converted

  // Content
  notesFile: "lecture_notes_L01_COMPREHENSIVE.md",
  notes: "# Full markdown content...",      ← All 1,447 lines
  notesWordCount: 12000,

  // Auto-Extracted
  chapters: [49 chapter titles],            ← From ## headings
  timestamps: [108 timestamp objects],      ← From (HH:MM-HH:MM)
  keyTerms: [148 key term objects],         ← From **bold**

  createdAt: ISODate(),
  updatedAt: ISODate()
}
```

---

## 🎨 How It Appears on Website

### Lesson Page Features:

**Hero Section:**
```
[Lesson 1] [Hadith 1-30 | أحاديث ١-٣٠] [⏱ 1:07:19]

Sahih Al-Bukhari - Book of Knowledge/Faith

📚 Book: Sahih Al-Bukhari
👤 Sheikh: Hassan bin Muhammad Mansour Al-Daghriri
📍 Location: Al-Wurood Mosque
📅 Date: January 13, 2025 (١٣/ ٧/ ١٤٤٧)

[🎧 Listen to Recording]  ← Prominent button (Telegram link)
```

**Also shows:**
- Telegram link in metadata section
- Auto-generated Table of Contents (49 chapters)
- 108 clickable timestamps
- 148 key terms glossary
- Full markdown notes rendered beautifully

---

## ❓ Troubleshooting

### "File not found"
Make sure the file path is correct. Use relative path from project root:
```bash
npm run import-lesson lecture_notes_L01_COMPREHENSIVE.md  ✅
npm run import-lesson /full/path/to/file.md               ✅
```

### "Lesson already exists"
The wizard will ask if you want to overwrite. Choose:
- `Y` - Update the existing lesson
- `N` - Cancel import

### "Invalid duration format"
Use `HH:MM:SS` or `MM:SS` format:
```
Valid:   1:07:19  ✅
Valid:   67:19    ✅
Invalid: 1h 7m    ❌
```

### "Invalid Hijri date"
Use `DD/MM/YYYY` format with `/` separators:
```
Valid:   13/7/1447    ✅
Valid:   ١٣/ ٧/ ١٤٤٧  ✅
Invalid: 13-7-1447    ❌
```

### Hadiths not detected
If auto-detection fails, just enter manually when prompted:
```
? Hadiths - Start Number: 1
? Hadiths - End Number: 30
```

---

## 🔄 Importing More Lessons

For your second lesson:

```bash
npm run import-lesson lecture_notes_L02.md
```

The wizard will:
- Detect if it's the same series (suggests same series name)
- Auto-increment lesson number
- Extract new content
- Add to the same series

**Series page will automatically show both lessons!**

---

## 💡 Tips

### 1. **Consistent Naming**
Name your markdown files consistently:
```
lecture_notes_L01_COMPREHENSIVE.md
lecture_notes_L02.md
lecture_notes_L03.md
```

### 2. **Markdown Format**
For best auto-extraction, use:
- `## Chapter Title` for chapters
- `(00:00-00:30)` for timestamps at line start
- `**Term**` for key terms you want highlighted
- `## Hadith 1:` or `## الحديث الأول:` for hadiths

### 3. **Review Before Import**
Always review the preview carefully before confirming!

### 4. **Backup Database**
Before bulk imports, backup your database:
```bash
mongodump --db notes-from-majlis --out backup/
```

---

## 🎯 Next Steps

After importing:

1. **View Lesson**: Visit `http://localhost:3000/series/{seriesId}`
2. **Check Display**: Verify hadith badge shows "Hadith 1-30 | أحاديث ١-٣٠"
3. **Test Audio**: Click "🎧 Listen to Recording" button
4. **Navigate**: Use Table of Contents and timestamps
5. **Import More**: Repeat for additional lessons!

---

## 📞 Need Help?

If you encounter issues:
1. Check this guide
2. Review error messages
3. Verify markdown file format
4. Check MongoDB connection (`.env` file)

**Happy importing! 🎉**
