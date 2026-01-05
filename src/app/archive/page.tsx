import Container from '@/components/ui/Container';
import LectureCard from '@/components/lecture/LectureCard';
import { connectDB } from '@/lib/db';
import Lecture from '@/lib/models/Lecture';
import Book from '@/lib/models/Book';

async function getArchiveData() {
  try {
    await connectDB();

    // Get all published lectures
    const lectures = await Lecture.find({ published: true })
      .sort({ gregorianDate: -1 })
      .populate('bookId')
      .lean();

    // Get all books that have lectures
    const books = await Book.find().sort({ titleEnglish: 1 }).lean();

    return {
      lectures: JSON.parse(JSON.stringify(lectures)),
      books: JSON.parse(JSON.stringify(books)),
    };
  } catch (error) {
    console.error('Archive data error:', error);
    return { lectures: [], books: [] };
  }
}

export default async function ArchivePage() {
  const { lectures, books } = await getArchiveData();

  // Group lectures by book
  const lecturesByBook = books.map((book) => ({
    book,
    lectures: lectures.filter(
      (lecture) => lecture.bookId?._id?.toString() === book._id.toString()
    ),
  })).filter(group => group.lectures.length > 0);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16">
        <Container variant="wide">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="heading-primary text-white mb-4">
              Lecture Archive
            </h1>
            <p className="text-xl opacity-90">
              Browse all English notes from Arabic Islamic lectures by Sheikh Ḥasan Ad-Daghrīrī <span className="arabic-text-inline">حفظه الله</span>
            </p>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container variant="wide">
        <div className="py-12">
          {/* Stats */}
          <div className="flex flex-wrap gap-6 mb-12 justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                {lectures.length}
              </div>
              <div className="metadata-text">Total Lectures</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-gold mb-1">
                {lecturesByBook.length}
              </div>
              <div className="metadata-text">Book Series</div>
            </div>
          </div>

          {/* Lectures by Book */}
          {lecturesByBook.length > 0 ? (
            <div className="space-y-16">
              {lecturesByBook.map((group) => (
                <section key={group.book._id}>
                  {/* Book Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-3">
                      <hr className="flex-1 border-accent-gold" />
                      <h2 className="heading-secondary text-center">
                        {group.book.titleEnglish}
                      </h2>
                      <hr className="flex-1 border-accent-gold" />
                    </div>
                    <p className="arabic-text text-center mb-2">
                      {group.book.titleArabic}
                    </p>
                    <p className="text-center text-text-muted">
                      By {group.book.author} · {group.lectures.length} Lecture{group.lectures.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  {/* Lecture Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.lectures.map((lecture) => (
                      <LectureCard
                        key={lecture._id}
                        id={lecture._id}
                        lectureNumber={lecture.lectureNumber}
                        lessonLabel={lecture.lessonLabel}
                        bookTitleEnglish={lecture.bookTitleEnglish}
                        bookTitleArabic={lecture.bookTitleArabic}
                        chapterSection={lecture.chapterSection}
                        gregorianDate={lecture.gregorianDate}
                        duration={lecture.duration}
                        excerpt={lecture.excerpt}
                        featured={lecture.featured}
                        published={lecture.published}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="card-elevated text-center py-16">
              <p className="text-xl text-text-muted mb-4">
                No lectures published yet
              </p>
              <p className="text-text-secondary">
                Check back soon for new content!
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

export const metadata = {
  title: 'Lecture Archive | Islamic Lecture Notes',
  description: 'Browse all English notes from Arabic Islamic lectures organized by book series',
};
