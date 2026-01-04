IMPLEMENTATION ROADMAP
Phase 1: Foundation (Week 1)

 Set up Next.js 14 project with TypeScript
 Configure Tailwind CSS with custom theme
 Set up MongoDB Atlas connection
 Create Mongoose schemas (Lecture, Book, Sheikh)
 Implement NextAuth.js authentication
 Create admin login page

Phase 2: Admin Panel (Week 2)

 Build upload/create lecture form

Rich text editor (TipTap or React-Quill)
All metadata fields
Arabic text support


 Create lecture management table

List all lectures
Edit/delete actions
Search/filter


 Implement books & sheikhs management
 Add preview before publish feature

Phase 3: Public Frontend (Week 3)

 Home page

Featured lecture (large card)
Recent lectures (5-7)
Clean, mobile-first design


 Individual lecture page

Full notes display
Proper Arabic rendering
Share buttons
Previous/Next navigation


 Archive/Browse page

All lectures by book/date
Simple filtering
Pagination



Phase 4: Polish & Deploy (Week 4)

 Mobile optimization
 Loading states & error handling
 SEO meta tags
 Share functionality (WhatsApp, Copy link)
 Deploy to Vercel
 Test with real lecture data
 Final design refinements


6. KEY FEATURES SUMMARY
For Students (Public):

✅ Latest lecture highlighted on home
✅ Clean, readable notes (18px+ font, serif)
✅ Mobile-first (most users on phones)
✅ Easy sharing (WhatsApp, link copy)
✅ Browse by book series
✅ Simple search (by title/book)

For You (Admin):

✅ Simple upload interface
✅ Paste converted notes from prompt
✅ Fill metadata (book, sheikh, date auto-extracted if possible)
✅ Preview before publish
✅ Edit anytime
✅ Featured lecture toggle


7. SAMPLE ADMIN WORKFLOW

Get transcript from TurboScribe.ai (Arabic)
Use conversion prompt (provided above) with Claude/GPT
Copy formatted notes (markdown/HTML)
Log into admin panel
Create new lecture:

Paste notes into rich text editor
Select book from dropdown (or add new)
Lecture number (auto-increment suggested)
Date (Hijri → auto-convert Gregorian)
Location (preset options + custom)
Duration


Preview
Publish → Appears on site immediately


8. MOBILE DESIGN PRIORITIES
Since most users will read on phones:

Font sizes: 18px body minimum (20px ideal)
Line height: 1.75 minimum for easy reading
Tap targets: 44px minimum (buttons, links)
Swipe navigation: Previous/Next lectures
Sticky header: Quick access to archive
Share button: Always visible (bottom right)
No horizontal scroll: Ever
Arabic text: Extra large (1.5rem minimum)


9. EXAMPLE FEATURES TO AVOID
(Based on "keep it simple"):

❌ User accounts/comments (just read-only for now)
❌ Complex search with filters (basic search sufficient)
❌ Email subscriptions (nice-to-have later)
❌ Audio playback (you're only sharing notes)
❌ Multi-language (English only for now)
❌ Analytics dashboard (use Vercel Analytics if needed)


10. SUCCESS METRICS
You'll know the system works when:
✅ You can go from transcript → published notes in under 10 minutes
✅ Mobile users can read comfortably without zooming
✅ Friends share links easily on WhatsApp
✅ Archive is organized and browsable
✅ Notes are faithful to sheikh's teaching
✅ Site loads fast (<2s on 3G)