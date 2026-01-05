import Button from '@/components/ui/Button';
import ShareButton from '@/components/ui/ShareButton';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Desktop: Two Column Layout | Mobile: Single Column */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

          {/* Main Content */}
          <main>
            {/* Breadcrumb */}
            <div className="mb-8">
              <Button variant="ghost" href="/archive">
                ← Back to Archive
              </Button>
            </div>

            {/* Decorative Border */}
            <hr className="divider" />

            {/* Metadata */}
            <div className="text-center mb-8">
              <p className="metadata-text mb-2">LESSON 18 · JĀMI' AL-WURŪD, JEDDAH</p>
              <h1 className="heading-primary mb-4">
                Explanation of Kitāb At-Tawḥīd
              </h1>
              <hr className="divider" />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-4xl mx-auto">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📖</span>
                <div>
                  <p className="metadata-text mb-1">Book</p>
                  <p className="arabic-text-inline">الملخص شرح كتاب التوحيد</p>
                  <p className="text-text-secondary">Al-Mulakhkhaṣ: Explanation of Kitāb At-Tawḥīd</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="metadata-text mb-1">Teaching Sheikh</p>
                  <p className="font-medium">Ḥasan bin Muḥammad Manṣūr Ad-Daghrīrī <span className="arabic-text-inline">حفظه الله</span></p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="metadata-text mb-1">Date</p>
                  <p className="font-medium">20/5/1447 H · November 25, 2025 CE</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">⏱</span>
                <div>
                  <p className="metadata-text mb-1">Duration</p>
                  <p className="font-medium">10:46</p>
                </div>
              </div>
            </div>

            <hr className="divider-simple" />

            {/* Lecture Content - Optimal Reading Width */}
            <article className="lecture-content max-w-3xl mx-auto px-4 md:px-6">
              <p>
                In this blessed gathering, we continue our study of the fundamental principles of Islamic monotheism (tawḥīd),
                exploring the essential foundations that every Muslim must understand and implement in their daily life.
              </p>

              <h2>The Reality of Tawḥīd</h2>

              <p>
                Allah <span className="arabic-text-inline">تعالى</span> says:
              </p>

              <div className="text-center my-8">
                <p className="arabic-text mb-3">
                  قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ
                </p>
                <p className="transliteration text-center">
                  "Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent."
                  <span className="text-text-muted"> [Sūrah Al-Ikhlāṣ 112:1-4]</span>
                </p>
              </div>

              <p>
                This noble sūrah establishes the cornerstone of Islamic belief: the absolute oneness and uniqueness of Allah.
                The scholars have emphasized that understanding this principle is fundamental to one's faith.
              </p>

              <h3>The Testimony of Faith</h3>

              <p>
                Sheikh Aḥmad An-Najmī <span className="arabic-text-inline">رحمه الله</span> explained in his commentary:
              </p>

              <blockquote>
                The testimony "Lā ilāha illa Allāh" (There is no deity worthy of worship except Allah) is not merely
                a statement uttered by the tongue, but rather it is a comprehensive declaration that encompasses belief
                in the heart, affirmation on the tongue, and action with the limbs.
              </blockquote>

              <p>
                This understanding is crucial for every believer. The statement of tawḥīd requires:
              </p>

              <ol>
                <li>
                  <strong>Knowledge</strong> of its meaning - understanding what you are affirming and what you are negating
                </li>
                <li>
                  <strong>Certainty</strong> that removes all doubt from the heart
                </li>
                <li>
                  <strong>Acceptance</strong> of all that it entails, without rejection or hesitation
                </li>
                <li>
                  <strong>Submission</strong> through actions that conform to this declaration
                </li>
              </ol>

              <h3>The Prophet's Teaching Method</h3>

              <p>
                Abū Hurayrah <span className="arabic-text-inline">رضي الله عنه</span> reported that the Messenger of Allah
                <span className="arabic-text-inline"> صلى الله عليه وسلم</span> was asked: "Which deed is best?"
              </p>

              <div className="my-6 p-6 bg-bg-accent rounded-lg">
                <p className="arabic-text mb-4">
                  إِيمَانٌ بِاللَّهِ وَرَسُولِهِ
                </p>
                <p className="body-text">
                  He <span className="arabic-text-inline">صلى الله عليه وسلم</span> replied: "Belief in Allah and His Messenger."
                </p>
                <p className="metadata-text mt-3">📚 Source: Ṣaḥīḥ Al-Bukhārī</p>
              </div>

              <p>
                This hadith demonstrates the priority that faith (īmān) holds in Islam. All righteous deeds stem from
                and are built upon the foundation of correct belief in Allah and His Messenger.
              </p>

              <h2>Practical Implementation</h2>

              <p>
                The knowledge of tawḥīd is not meant to remain theoretical. Rather, it must manifest in our daily lives through:
              </p>

              <ul>
                <li>Directing all worship exclusively to Allah alone</li>
                <li>Seeking help and relying solely upon Him</li>
                <li>Making duʿāʾ (supplication) to Him alone</li>
                <li>Having tawakkul (trust) in Him in all affairs</li>
              </ul>

              <p>
                May Allah grant us understanding of His religion and make us firm upon the truth. We ask Him to guide us
                to that which pleases Him and to keep us steadfast upon tawḥīd until we meet Him.
              </p>

              <p className="mt-8 text-text-muted italic">
                And all praise is due to Allah, Lord of the worlds. May peace and blessings be upon our Prophet Muhammad,
                his family, and all his companions.
              </p>
            </article>

            {/* Share & Navigation */}
            <div className="mt-12 pt-8 border-t border-border max-w-3xl mx-auto px-4 md:px-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <Button variant="secondary" href="/">
                  ← Previous Lecture
                </Button>

                <ShareButton
                  title="Explanation of Kitāb At-Tawḥīd - Lesson 18"
                  text="Check out this Islamic lecture notes"
                />

                <Button variant="secondary" href="/">
                  Next Lecture →
                </Button>
              </div>
            </div>
          </main>

          {/* Sidebar (Desktop Only) */}
          <aside className="hidden lg:block space-y-6">
            {/* Quick Info Card */}
            <Card variant="elevated" className="sticky top-8">
              <h3 className="heading-tertiary text-lg mb-4">Lecture Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="metadata-text mb-1">Series</p>
                  <p className="font-medium">Al-Mulakhkhaṣ</p>
                </div>
                <div>
                  <p className="metadata-text mb-1">Category</p>
                  <p className="font-medium">Aqeedah</p>
                </div>
                <div>
                  <p className="metadata-text mb-1">Tags</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-bg-accent rounded text-xs">Tawhid</span>
                    <span className="px-2 py-1 bg-bg-accent rounded text-xs">Aqeedah</span>
                  </div>
                </div>
              </div>

              <hr className="divider-simple my-4" />

              {/* Actions */}
              <div className="space-y-2">
                <Button variant="primary" className="w-full text-sm">
                  📤 Share
                </Button>
                <Button variant="ghost" href="/archive" className="w-full text-sm">
                  📚 View Archive
                </Button>
              </div>
            </Card>

            {/* Other Lectures in Series */}
            <Card variant="flat">
              <h3 className="heading-tertiary text-base mb-4">More from This Series</h3>
              <div className="space-y-3">
                {[17, 19, 20].map((num) => (
                  <Link
                    key={num}
                    href="/"
                    className="block p-3 rounded-lg hover:bg-bg-accent transition-colors"
                  >
                    <p className="metadata-text text-primary mb-1">Lesson {num}</p>
                    <p className="text-sm font-medium">
                      Explanation of Kitāb At-Tawḥīd
                    </p>
                  </Link>
                ))}
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
