import Container from '@/components/ui/Container';
import LectureForm from '@/components/admin/LectureForm';
import { connectDB } from '@/lib/db';
import Book from '@/lib/models/Book';
import Sheikh from '@/lib/models/Sheikh';

async function getBooksAndSheikhs() {
  try {
    await connectDB();

    const [books, sheikhs] = await Promise.all([
      Book.find().sort({ titleEnglish: 1 }).lean(),
      Sheikh.find().sort({ nameEnglish: 1 }).lean(),
    ]);

    return {
      books: JSON.parse(JSON.stringify(books)),
      sheikhs: JSON.parse(JSON.stringify(sheikhs)),
    };
  } catch (error) {
    console.error('Error fetching books/sheikhs:', error);
    return { books: [], sheikhs: [] };
  }
}

export default async function NewLecturePage() {
  const { books, sheikhs } = await getBooksAndSheikhs();

  return (
    <Container variant="wide">
      <div className="py-8">
        <div className="mb-8">
          <h1 className="heading-primary mb-2">Create New Lecture</h1>
          <p className="text-text-secondary">
            Add a new lecture to the platform
          </p>
        </div>

        {books.length === 0 || sheikhs.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <p className="text-lg mb-4">
              {books.length === 0 && 'Please create at least one book first.'}
              {sheikhs.length === 0 && 'Please create at least one sheikh first.'}
            </p>
            <div className="flex gap-4 justify-center">
              {books.length === 0 && (
                <a
                  href="/admin/books"
                  className="btn btn-primary"
                >
                  Add Book
                </a>
              )}
              {sheikhs.length === 0 && (
                <a
                  href="/admin/sheikhs"
                  className="btn btn-primary"
                >
                  Add Sheikh
                </a>
              )}
            </div>
          </div>
        ) : (
          <LectureForm books={books} sheikhs={sheikhs} mode="create" />
        )}
      </div>
    </Container>
  );
}
