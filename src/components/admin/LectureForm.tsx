'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import RichTextEditor from './RichTextEditor';

interface LectureFormProps {
  books: Array<{ _id: string; titleEnglish: string; titleArabic: string; author: string }>;
  sheikhs: Array<{ _id: string; nameEnglish: string; nameArabic: string }>;
  initialData?: any;
  mode?: 'create' | 'edit';
}

export default function LectureForm({
  books,
  sheikhs,
  initialData,
  mode = 'create',
}: LectureFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    lectureNumber: initialData?.lectureNumber || '',
    bookId: initialData?.bookId || '',
    sheikhId: initialData?.sheikhId || '',
    lessonLabel: initialData?.lessonLabel || '',
    location: initialData?.location || '',
    locationType: initialData?.locationType || 'in-person',
    hijriDate: initialData?.hijriDate || '',
    gregorianDate: initialData?.gregorianDate?.split('T')[0] || '',
    duration: initialData?.duration || '',
    chapterSection: initialData?.chapterSection || '',
    content: initialData?.content || '',
    category: initialData?.category || 'Other',
    tags: initialData?.tags?.join(', ') || '',
    published: initialData?.published || false,
    featured: initialData?.featured || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get selected book and sheikh details
      const selectedBook = books.find((b) => b._id === formData.bookId);
      const selectedSheikh = sheikhs.find((s) => s._id === formData.sheikhId);

      if (!selectedBook || !selectedSheikh) {
        throw new Error('Please select a book and sheikh');
      }

      const payload = {
        ...formData,
        bookTitleArabic: selectedBook.titleArabic,
        bookTitleEnglish: selectedBook.titleEnglish,
        bookAuthor: selectedBook.author,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        lectureNumber: parseInt(formData.lectureNumber as string),
      };

      const url = mode === 'create' ? '/api/lectures' : `/api/lectures/${initialData._id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save lecture');
      }

      const data = await response.json();
      router.push('/admin/lectures');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <section className="card-elevated">
        <h3 className="heading-tertiary mb-6">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="metadata-text block mb-2">Lecture Number *</label>
            <input
              type="number"
              required
              value={formData.lectureNumber}
              onChange={(e) => handleChange('lectureNumber', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-cream"
            />
          </div>

          <div>
            <label className="metadata-text block mb-2">Lesson Label *</label>
            <input
              type="text"
              required
              value={formData.lessonLabel}
              onChange={(e) => handleChange('lessonLabel', e.target.value)}
              placeholder="e.g., Lesson 18"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-cream"
            />
          </div>

          <div>
            <label className="metadata-text block mb-2">Book *</label>
            <select
              required
              value={formData.bookId}
              onChange={(e) => handleChange('bookId', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-cream"
            >
              <option value="">Select a book</option>
              {books.map((book) => (
                <option key={book._id} value={book._id}>
                  {book.titleEnglish}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="metadata-text block mb-2">Sheikh *</label>
            <select
              required
              value={formData.sheikhId}
              onChange={(e) => handleChange('sheikhId', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-cream"
            >
              <option value="">Select a sheikh</option>
              {sheikhs.map((sheikh) => (
                <option key={sheikh._id} value={sheikh._id}>
                  {sheikh.nameEnglish}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="metadata-text block mb-2">Chapter/Section</label>
            <input
              type="text"
              value={formData.chapterSection}
              onChange={(e) => handleChange('chapterSection', e.target.value)}
              placeholder="e.g., Sūrah At-Takwīr"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-cream"
            />
          </div>

          <div>
            <label className="metadata-text block mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-cream"
            >
              <option value="Tafsir">Tafsir</option>
              <option value="Hadith">Hadith</option>
              <option value="Fiqh">Fiqh</option>
              <option value="Aqeedah">Aqeedah</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </section>

      {/* Date & Location */}
      <section className="card-elevated">
        <h3 className="heading-tertiary mb-6">Date & Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="metadata-text block mb-2">Hijri Date *</label>
            <input
              type="text"
              required
              value={formData.hijriDate}
              onChange={(e) => handleChange('hijriDate', e.target.value)}
              placeholder="e.g., ٢٠ / ٥ / ١٤٤٧"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-cream"
            />
          </div>

          <div>
            <label className="metadata-text block mb-2">Gregorian Date *</label>
            <input
              type="date"
              required
              value={formData.gregorianDate}
              onChange={(e) => handleChange('gregorianDate', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-cream"
            />
          </div>

          <div>
            <label className="metadata-text block mb-2">Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Jāmiʿ Al-Wurūd, Jeddah"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-cream"
            />
          </div>

          <div>
            <label className="metadata-text block mb-2">Location Type</label>
            <select
              value={formData.locationType}
              onChange={(e) => handleChange('locationType', e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-cream"
            >
              <option value="in-person">In-Person</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          <div>
            <label className="metadata-text block mb-2">Duration</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              placeholder="e.g., 10:46"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-cream"
            />
          </div>

          <div>
            <label className="metadata-text block mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="e.g., Tawhid, Fiqh, Prayer"
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-cream"
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="card-elevated">
        <h3 className="heading-tertiary mb-6">Lecture Content</h3>
        <RichTextEditor
          content={formData.content}
          onChange={(content) => handleChange('content', content)}
        />
      </section>

      {/* Publishing Options */}
      <section className="card-elevated">
        <h3 className="heading-tertiary mb-6">Publishing Options</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => handleChange('published', e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
            <span className="text-lg">Publish lecture (make it visible to public)</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => handleChange('featured', e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
            <span className="text-lg">Feature on home page</span>
          </label>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Create Lecture' : 'Update Lecture'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/lectures')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
