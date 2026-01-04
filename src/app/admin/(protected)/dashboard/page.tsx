import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { connectDB } from '@/lib/db';
import Lecture from '@/lib/models/Lecture';
import Book from '@/lib/models/Book';
import Sheikh from '@/lib/models/Sheikh';

async function getDashboardStats() {
  try {
    await connectDB();

    const [
      totalLectures,
      publishedLectures,
      draftLectures,
      totalBooks,
      totalSheikhs,
      recentLectures,
    ] = await Promise.all([
      Lecture.countDocuments(),
      Lecture.countDocuments({ published: true }),
      Lecture.countDocuments({ published: false }),
      Book.countDocuments(),
      Sheikh.countDocuments(),
      Lecture.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('bookId', 'titleEnglish')
        .populate('sheikhId', 'nameEnglish')
        .lean(),
    ]);

    return {
      totalLectures,
      publishedLectures,
      draftLectures,
      totalBooks,
      totalSheikhs,
      recentLectures: JSON.parse(JSON.stringify(recentLectures)),
    };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return {
      totalLectures: 0,
      publishedLectures: 0,
      draftLectures: 0,
      totalBooks: 0,
      totalSheikhs: 0,
      recentLectures: [],
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <Container variant="wide">
      <div className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-primary mb-2">Dashboard</h1>
          <p className="text-text-secondary">
            Welcome to the Islamic Lecture Notes Admin Panel
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {stats.totalLectures}
              </div>
              <div className="metadata-text">Total Lectures</div>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-gold mb-2">
                {stats.publishedLectures}
              </div>
              <div className="metadata-text">Published</div>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="text-center">
              <div className="text-4xl font-bold text-text-muted mb-2">
                {stats.draftLectures}
              </div>
              <div className="metadata-text">Drafts</div>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-light mb-2">
                {stats.totalBooks}
              </div>
              <div className="metadata-text">Books</div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="heading-tertiary mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" href="/admin/lectures/new">
              + New Lecture
            </Button>
            <Button variant="secondary" href="/admin/books">
              Manage Books
            </Button>
            <Button variant="secondary" href="/admin/sheikhs">
              Manage Sheikhs
            </Button>
            <Button variant="ghost" href="/admin/lectures">
              View All Lectures
            </Button>
          </div>
        </div>

        {/* Recent Lectures */}
        <div>
          <h2 className="heading-tertiary mb-4">Recent Lectures</h2>
          {stats.recentLectures.length > 0 ? (
            <div className="space-y-4">
              {stats.recentLectures.map((lecture: any) => (
                <Card key={lecture._id} variant="flat">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {lecture.lessonLabel} - {lecture.bookTitleEnglish}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {lecture.sheikhId?.nameEnglish || 'Unknown Sheikh'} ·{' '}
                        {new Date(lecture.gregorianDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          lecture.published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {lecture.published ? 'Published' : 'Draft'}
                      </span>
                      <Button
                        variant="ghost"
                        href={`/admin/lectures/${lecture._id}`}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card variant="flat">
              <div className="text-center py-8">
                <p className="text-text-muted mb-4">
                  No lectures yet. Create your first lecture to get started!
                </p>
                <Button variant="primary" href="/admin/lectures/new">
                  Create First Lecture
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Container>
  );
}
