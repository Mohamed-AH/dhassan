import mongoose, { Document, Model, Schema } from 'mongoose';

// TypeScript interface for Book
export interface IBook extends Document {
  titleArabic: string;
  titleEnglish: string;
  author: string;
  category: 'Tafsir' | 'Hadith' | 'Fiqh' | 'Aqeedah' | 'Other';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Book Schema
const BookSchema = new Schema<IBook>(
  {
    titleArabic: {
      type: String,
      required: [true, 'Arabic title is required'],
      trim: true,
    },
    titleEnglish: {
      type: String,
      required: [true, 'English title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Tafsir', 'Hadith', 'Fiqh', 'Aqeedah', 'Other'],
      default: 'Other',
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
BookSchema.index({ titleEnglish: 1 });
BookSchema.index({ category: 1 });

// Export model with proper typing
const Book: Model<IBook> =
  mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);

export default Book;
