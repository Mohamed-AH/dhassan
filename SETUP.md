# Setup Guide for Notes from the Majlis

## Quick Start

### 1. Start MongoDB with Docker

```bash
# Start MongoDB container
docker run -d \
  --name notes-mongo \
  -p 27017:27017 \
  mongo:latest

# Verify it's running
docker ps
```

### 2. Install Dependencies (if not already done)

```bash
npm install
```

### 3. Populate Database with Sample Lesson

```bash
node scripts/populate-db.js
```

This will create:
- **Series**: Sahih Al-Bukhari - Book of Faith
- **Lesson 1**: Hadiths 26-30 covering faith, action, and social conduct

### 4. Start the Development Server

```bash
npm run dev
```

Visit: http://localhost:8000

---

## Database Structure

### Series Collection
```javascript
{
  seriesId: String,           // Unique identifier (e.g., "sahih-bukhari-book-of-faith")
  titleEnglish: String,       // English title
  titleArabic: String,        // Arabic title
  category: String,           // "Tafsir", "Aqeedah", "Fiqh", "Hadith", or "Khutbah"
  author: String,             // Sheikh's name
  description: String,        // Brief description
  status: String,             // "Ongoing" or "Completed"
  totalLessons: Number,       // Total number of lessons
  location: String,           // Physical location of classes
  telegramLink: String,       // Link to Telegram channel (optional)
  createdAt: Date,
  updatedAt: Date
}
```

### Lessons Collection
```javascript
{
  seriesId: String,           // Reference to series
  lessonNumber: Number,       // Sequential lesson number
  titleEnglish: String,       // Lesson title in English
  titleArabic: String,        // Lesson title in Arabic (optional)
  date: Date,                 // Date of lesson
  duration: String,           // Duration (e.g., "1h 15m") - optional
  summary: String,            // Brief summary
  notes: String,              // Full lesson notes (markdown format)
  keyTerms: Array,            // Array of key terms
  timestamps: Array,          // Array of timestamps
  audioLink: String,          // Link to audio recording (optional)
  createdAt: Date,
  updatedAt: Date
}
```

### Key Terms Structure
```javascript
{
  termEnglish: String,
  termArabic: String,
  definition: String
}
```

### Timestamps Structure
```javascript
{
  time: String,              // Format: "00:00" or "1:15:30"
  description: String
}
```

---

## Adding More Lessons

To add more lessons, you can:

1. **Edit the populate script** (`scripts/populate-db.js`)
2. **Create a new script** for each lesson
3. **Use MongoDB Compass** or another GUI tool
4. **Import from JSON files**

### Example: Adding Lesson 2

```javascript
const lesson2 = {
  seriesId: 'sahih-bukhari-book-of-faith',
  lessonNumber: 2,
  titleEnglish: 'Your Lesson Title',
  titleArabic: 'عنوان الدرس',
  date: new Date('2024-01-08'),
  summary: 'Brief summary...',
  notes: `# Full lesson notes in markdown...`,
  keyTerms: [
    {
      termEnglish: 'Term',
      termArabic: 'المصطلح',
      definition: 'Definition here'
    }
  ],
  timestamps: [
    { time: '00:00', description: 'Introduction' }
  ],
  audioLink: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

await lessonsCollection.insertOne(lesson2);

// Update series total lessons
await seriesCollection.updateOne(
  { seriesId: 'sahih-bukhari-book-of-faith' },
  { $inc: { totalLessons: 1 }, $set: { updatedAt: new Date() } }
);
```

---

## Category Guidelines

- **Tafsir**: Quranic exegesis and commentary
- **Aqeedah**: Islamic creed and theology
- **Fiqh**: Islamic jurisprudence and rulings
- **Hadith**: Hadith studies and collections
- **Khutbah**: Friday sermons and lectures

---

## Stopping MongoDB

```bash
# Stop the container
docker stop notes-mongo

# Remove the container (data will be lost)
docker rm notes-mongo

# To persist data, use a volume:
docker run -d \
  --name notes-mongo \
  -p 27017:27017 \
  -v notes-data:/data/db \
  mongo:latest
```

---

## Troubleshooting

### MongoDB Connection Error
- Ensure Docker is running
- Ensure MongoDB container is running: `docker ps`
- Check connection string in `.env` file

### Port Already in Use
- Stop other MongoDB instances
- Use a different port: `-p 27018:27017` and update `.env`

### Permission Errors
- Ensure you have Docker permissions
- Try running with `sudo` (Linux)

---

## Next Steps

1. Parse and import all lessons from `monthdec.md`
2. Add more series (Tafsir, Aqeedah, Fiqh series)
3. Configure OAuth for Google login
4. Deploy to production
