import mongoose, { Document, Model, Schema } from 'mongoose';

// TypeScript interface for Lecture
export interface ILecture extends Document {
  lectureNumber: number;
  bookId: mongoose.Types.ObjectId;
  bookTitleArabic: string;
  bookTitleEnglish: string;
  bookAuthor: string;
  commentaryBy?: string;
  sheikhId: mongoose.Types.ObjectId;
  lessonLabel: string;
  location: string;
  locationType: 'in-person' | 'remote';
  hijriDate: string;
  gregorianDate: Date;
  duration?: string;
  chapterSection?: string;
  content: string;
  excerpt: string;
  category?: 'Tafsir' | 'Hadith' | 'Fiqh' | 'Aqeedah' | 'Other';
  tags: string[];
  published: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Lecture Schema
const LectureSchema = new Schema<ILecture>(
  {
    // Core Identifiers
    lectureNumber: {
      type: Number,
      required: [true, 'Lecture number is required'],
    },

    // Book Information
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book ID is required'],
    },
    bookTitleArabic: {
      type: String,
      required: [true, 'Book Arabic title is required'],
      trim: true,
    },
    bookTitleEnglish: {
      type: String,
      required: [true, 'Book English title is required'],
      trim: true,
    },
    bookAuthor: {
      type: String,
      required: [true, 'Book author is required'],
      trim: true,
    },
    commentaryBy: {
      type: String,
      trim: true,
    },

    // Sheikh Information
    sheikhId: {
      type: Schema.Types.ObjectId,
      ref: 'Sheikh',
      required: [true, 'Sheikh ID is required'],
    },

    // Lesson Details
    lessonLabel: {
      type: String,
      required: [true, 'Lesson label is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    locationType: {
      type: String,
      enum: ['in-person', 'remote'],
      default: 'in-person',
    },

    // Dates
    hijriDate: {
      type: String,
      required: [true, 'Hijri date is required'],
      trim: true,
    },
    gregorianDate: {
      type: Date,
      required: [true, 'Gregorian date is required'],
    },

    // Content
    duration: {
      type: String,
      trim: true,
    },
    chapterSection: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: {
      type: String,
      maxlength: 300,
      trim: true,
    },

    // Categorization
    category: {
      type: String,
      enum: ['Tafsir', 'Hadith', 'Fiqh', 'Aqeedah', 'Other'],
      default: 'Other',
    },
    tags: {
      type: [String],
      default: [],
    },

    // Admin
    published: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimal query performance
LectureSchema.index({ bookId: 1, published: 1 });
LectureSchema.index({ gregorianDate: -1 });
LectureSchema.index({ featured: 1, published: 1 });
LectureSchema.index({ tags: 1 });
LectureSchema.index({ published: 1, createdAt: -1 });

// Pre-save hook to generate excerpt from content if not provided
LectureSchema.pre('save', function (next) {
  if (!this.excerpt && this.content) {
    // Remove HTML tags and get first 200 characters
    const plainText = this.content
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
  }
  next();
});

// Export model with proper typing
const Lecture: Model<ILecture> =
  mongoose.models.Lecture || mongoose.model<ILecture>('Lecture', LectureSchema);

export default Lecture;
