// src/lib/models/Lecture.ts
import mongoose from 'mongoose'

const LectureSchema = new mongoose.Schema({
  // Core Identifiers
  lectureNumber: { type: Number, required: true },
  
  // Book Information
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  bookTitleArabic: { type: String, required: true },
  bookTitleEnglish: { type: String, required: true },
  bookAuthor: { type: String, required: true },
  commentaryBy: { type: String }, // For sharḥ books
  
  // Sheikh Information
  sheikhId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sheikh', required: true },
  
  // Lesson Details
  lessonLabel: { type: String, required: true }, // "Lesson 18"
  location: { type: String, required: true }, // "Jāmiʿ Al-Wurūd, Jeddah"
  locationType: { type: String, enum: ['in-person', 'remote'], default: 'in-person' },
  
  // Dates
  hijriDate: { type: String, required: true },
  gregorianDate: { type: Date, required: true },
  
  // Content
  duration: { type: String }, // "10:46"
  chapterSection: { type: String }, // "Sūrah At-Takwīr"
  content: { type: String, required: true }, // Main notes (HTML or Markdown)
  excerpt: { type: String, maxlength: 300 },
  
  // Categorization
  category: { type: String, enum: ['Tafsir', 'Hadith', 'Fiqh', 'Aqeedah', 'Other'] },
  tags: [{ type: String }],
  
  // Admin
  published: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  
}, { timestamps: true })

// Indexes
LectureSchema.index({ bookId: 1, published: 1 })
LectureSchema.index({ gregorianDate: -1 })
LectureSchema.index({ featured: 1, published: 1 })
LectureSchema.index({ tags: 1 })

export default mongoose.models.Lecture || mongoose.model('Lecture', LectureSchema)