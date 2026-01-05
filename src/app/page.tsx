import Button from '@/components/ui/Button';
import ShareButton from '@/components/ui/ShareButton';

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-cream">
      {/* Simple centered container */}
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Back button */}
        <div className="mb-8">
          <Button variant="ghost" href="/archive">
            ← Back to Archive
          </Button>
        </div>

        {/* Article header */}
        <header className="text-center mb-12">
          <p className="text-sm text-text-muted uppercase tracking-wider mb-4">
            LESSON 18 · JĀMI' AL-WURŪD, JEDDAH
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-semibold text-text-primary mb-8">
            Explanation of Kitāb At-Tawḥīd
          </h1>
          <div className="h-px bg-border max-w-xs mx-auto"></div>
        </header>

        {/* Lecture info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📖</span>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Book</p>
                <p className="text-base font-medium text-text-primary">Kitāb At-Tawḥīd</p>
                <p className="text-sm text-text-secondary mt-1">Muhammad ibn Abd al-Wahhab</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎓</span>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Scholar</p>
                <p className="text-base font-medium text-text-primary">Shaykh Ṣāliḥ al-Fawzān</p>
                <p className="text-sm text-text-secondary mt-1">حفظه الله</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Date</p>
                <p className="text-base font-medium text-text-primary">March 15, 2024</p>
                <p className="text-sm text-text-secondary mt-1">1445 AH</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Location</p>
                <p className="text-base font-medium text-text-primary">Jāmi' Al-Wurūd</p>
                <p className="text-sm text-text-secondary mt-1">Jeddah, Saudi Arabia</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-border mb-12"></div>

        {/* Main article content */}
        <article className="prose prose-lg max-w-none">
          <p className="text-lg leading-relaxed text-text-primary mb-6">
            In this blessed gathering, we continue our study of the fundamental principles of Islamic monotheism (tawḥīd),
            exploring the essential foundations that every Muslim must understand and implement in their daily life.
          </p>

          <h2 className="text-3xl font-serif font-semibold text-text-primary mt-12 mb-6">
            The Concept of Shirk
          </h2>

          <p className="text-lg leading-relaxed text-text-primary mb-6">
            The shaykh, may Allah preserve him, began by explaining the gravity of shirk (associating partners with Allah)
            and its various forms. He emphasized that understanding tawḥīd requires first understanding what negates it,
            as one cannot properly affirm something without knowing what contradicts it.
          </p>

          <blockquote className="border-l-4 border-accent-gold bg-bg-accent pl-6 py-4 my-8 italic text-text-secondary">
            "The greatest right that Allah has upon His servants is that they worship Him alone and do not associate
            anything with Him."
          </blockquote>

          <h2 className="text-3xl font-serif font-semibold text-text-primary mt-12 mb-6">
            Categories of Tawḥīd
          </h2>

          <p className="text-lg leading-relaxed text-text-primary mb-6">
            The scholars have divided tawḥīd into three main categories, each representing a crucial aspect of Islamic
            monotheism that must be affirmed:
          </p>

          <ul className="space-y-3 mb-6 text-lg text-text-primary">
            <li><strong>Tawḥīd ar-Rubūbiyyah:</strong> Affirming Allah's Lordship and sovereignty over creation</li>
            <li><strong>Tawḥīd al-Ulūhiyyah:</strong> Singling out Allah alone in worship</li>
            <li><strong>Tawḥīd al-Asmā' was-Ṣifāt:</strong> Affirming Allah's names and attributes</li>
          </ul>

          <h2 className="text-3xl font-serif font-semibold text-text-primary mt-12 mb-6">
            Practical Applications
          </h2>

          <p className="text-lg leading-relaxed text-text-primary mb-6">
            The shaykh stressed the importance of implementing these principles in our daily lives. It is not sufficient
            to merely have theoretical knowledge; rather, this understanding must translate into action and adherence to
            the Sunnah of the Prophet ﷺ.
          </p>

          <p className="text-lg leading-relaxed text-text-primary mb-6">
            He cautioned against the subtle forms of shirk that may creep into one's worship, such as showing off (riyā')
            or seeking praise from people rather than sincerely seeking Allah's pleasure alone.
          </p>

          <h2 className="text-3xl font-serif font-semibold text-text-primary mt-12 mb-6">
            Conclusion
          </h2>

          <p className="text-lg leading-relaxed text-text-primary mb-6">
            In closing, the shaykh reminded us that the path to Paradise is achieved through sincere adherence to tawḥīd
            and following the way of the Prophet ﷺ. He encouraged the students to continue their studies with dedication
            and to always seek authentic knowledge from trustworthy scholars.
          </p>

          <p className="text-lg leading-relaxed text-text-primary">
            May Allah grant us understanding of His religion and make us firm upon the straight path. May peace and
            blessings be upon our Prophet Muhammad, his family, and all his companions.
          </p>
        </article>

        {/* Navigation */}
        <div className="mt-16 pt-8 border-t border-border">
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
      </div>
    </div>
  );
}
