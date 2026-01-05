import Link from 'next/link';
import Card from '../ui/Card';

interface LectureCardProps {
  id: string;
  lectureNumber: number;
  lessonLabel: string;
  bookTitleEnglish: string;
  bookTitleArabic: string;
  chapterSection?: string;
  gregorianDate: string;
  duration?: string;
  excerpt: string;
  featured: boolean;
  published: boolean;
}

export default function LectureCard({
  id,
  lectureNumber,
  lessonLabel,
  bookTitleEnglish,
  bookTitleArabic,
  chapterSection,
  gregorianDate,
  duration,
  excerpt,
  featured,
}: LectureCardProps) {
  const date = new Date(gregorianDate);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/notes/${id}`}>
      <Card variant="elevated" className="h-full hover:scale-[1.02] transition-transform cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="metadata-text text-primary mb-1">
              {lessonLabel} {featured && '⭐'}
            </p>
            <h3 className="heading-tertiary text-xl mb-2">
              {bookTitleEnglish}
            </h3>
            {chapterSection && (
              <p className="text-sm text-text-muted italic mb-2">
                {chapterSection}
              </p>
            )}
          </div>
        </div>

        {/* Arabic Title */}
        <p className="arabic-text-inline text-lg mb-3 text-right">
          {bookTitleArabic}
        </p>

        {/* Excerpt */}
        <p className="text-text-secondary text-sm line-clamp-3 mb-4">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-sm text-text-muted">
            📅 {formattedDate}
          </span>
          {duration && (
            <span className="text-sm text-text-muted">
              ⏱ {duration}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
