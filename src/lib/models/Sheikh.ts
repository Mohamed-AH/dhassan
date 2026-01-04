import mongoose, { Document, Model, Schema } from 'mongoose';

// TypeScript interface for Sheikh
export interface ISheikh extends Document {
  nameArabic: string;
  nameEnglish: string;
  honorific: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sheikh Schema
const SheikhSchema = new Schema<ISheikh>(
  {
    nameArabic: {
      type: String,
      required: [true, 'Arabic name is required'],
      trim: true,
    },
    nameEnglish: {
      type: String,
      required: [true, 'English name is required'],
      trim: true,
    },
    honorific: {
      type: String,
      default: 'حفظه الله',
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SheikhSchema.index({ nameEnglish: 1 });

// Export model with proper typing
const Sheikh: Model<ISheikh> =
  mongoose.models.Sheikh || mongoose.model<ISheikh>('Sheikh', SheikhSchema);

export default Sheikh;
