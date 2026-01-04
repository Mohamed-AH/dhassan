# Islamic Lecture Notes Platform - Claude Code Instructions

<project_overview>
This is a web application for sharing English notes from Arabic Islamic lectures. The system allows an admin to upload lecture notes (converted from Arabic audio transcriptions) and presents them in a clean, mobile-first interface for students to read and benefit from.

**Core Mission**: Make Islamic knowledge accessible to non-Arabic speakers through professionally formatted lecture notes.
</project_overview>

<investigate_before_answering>
Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering. Make sure to investigate and read relevant files BEFORE answering questions about the codebase. Never make any claims about code before investigating unless you are certain of the correct answer - give grounded and hallucination-free answers.
</investigate_before_answering>

## Tech Stack

**Framework**: Next.js 14+ (App Router)
**Language**: TypeScript 5.3+
**Styling**: Tailwind CSS 3.4+
**Database**: MongoDB Atlas (Free Tier - 512MB)
**ODM**: Mongoose 8+
**Authentication**: NextAuth.js 5 (simple email/password for single admin)
**Deployment**: Vercel (Free Tier)
**Fonts**:
- Arabic Text: Noto Naskh Arabic (Google Fonts)
- English Body: Crimson Pro or Spectral (readable serif)
- Headings: DM Serif Display or Cormorant

## Project Structure
```
/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/          # Public routes (no auth)
│   │   │   ├── page.tsx       # Home page
│   │   │   ├── notes/
│   │   │   │   ├── [id]/      # Individual lecture page
│   │   │   │   └── archive/   # Archive/browse all
│   │   │   └── about/         # About page
│   │   ├── (admin)/           # Admin routes (protected)
│   │   │   ├── dashboard/
│   │   │   ├── upload/
│   │   │   └── manage/
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── lectures/
│   │   │   └── books/
│   │   └── layout.tsx
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI (buttons, cards)
│   │   ├── lecture/          # Lecture-specific components
│   │   └── admin/            # Admin panel components
│   ├── lib/                  # Core business logic
│   │   ├── db.ts            # MongoDB connection
│   │   ├── models/          # Mongoose schemas
│   │   └── utils.ts         # Helper functions
│   └── styles/
│       └── globals.css      # Global Tailwind + custom CSS
├── public/                   # Static assets
└── package.json
```

## Database Schema

### Lectures Collection
```typescript
{
  _id: ObjectId,
  lectureNumber: Number,
  bookId: ObjectId,               // Reference to Books
  bookTitleArabic: String,
  bookTitleEnglish: String,
  bookAuthor: String,             // Original book author
  commentaryBy: String?,          // If sharḥ/commentary
  sheikhId: ObjectId,             // Reference to Sheikhs
  lessonLabel: String,            // "Lesson 18", "Lecture 9"
  location: String,               // "Jāmiʿ Al-Wurūd, Jeddah" or "Remote"
  hijriDate: String,              // "٢٠ / ٥ / ١٤٤٧"
  gregorianDate: Date,
  duration: String,               // "10:46"
  chapterSection: String?,        // "Sūrah At-Takwīr", "Book of Prayer"
  content: String,                // HTML or Markdown
  excerpt: String,                // First 200 chars for cards
  createdAt: Date,
  published: Boolean,
  featured: Boolean,
  tags: String[]                  // ["Tafsir", "Tawhid", "Fiqh"]
}
```

### Books Collection
```typescript
{
  _id: ObjectId,
  titleArabic: String,
  titleEnglish: String,
  author: String,
  category: String,               // "Tafsir", "Hadith", "Fiqh", "Aqeedah"
  description: String?
}
```

### Sheikhs Collection
```typescript
{
  _id: ObjectId,
  nameArabic: String,             // "حسن بن محمد منصور الدغريري"
  nameEnglish: String,            // "Ḥasan bin Muḥammad Manṣūr Ad-Daghrīrī"
  honorific: String,              // "حفظه الله"
  bio: String?
}
```

## Commands
```bash
# Development
npm run dev                 # Start dev server (localhost:3000)
npm run build              # Production build
npm run start              # Start production server

# Database
npm run db:seed            # Seed initial data (admin user, sample books)
npm run db:migrate         # Run migrations (if needed)

# Linting & Formatting
npm run lint               # ESLint
npm run format             # Prettier
npm run type-check         # TypeScript check
```

## Code Style & Conventions

### TypeScript
- **Strict mode enabled**: No `any` types
- **Naming**: 
  - Components: PascalCase (`LectureCard.tsx`)
  - Utilities: camelCase (`formatDate.ts`)
  - Constants: UPPER_SNAKE_CASE
- **Imports**: Use absolute imports with `@/` alias
```typescript
  import { LectureCard } from '@/components/lecture/LectureCard'
  import { connectDB } from '@/lib/db'
```

### React Components
- **Functional components** with TypeScript
- **Server Components by default** (Next.js 14 App Router)
- Client Components: `'use client'` directive when needed
- Props: Always define interfaces
```typescript
  interface LectureCardProps {
    title: string
    excerpt: string
    date: Date
    id: string
  }
```

### Tailwind CSS
- **Mobile-first**: Start with mobile styles, use `md:`, `lg:` for larger screens
- **Custom utilities** in `globals.css` for Arabic text handling
- **Color palette**: Warm, scholarly tones
```css
  --primary: #2C5F5D        /* Deep teal */
  --bg-cream: #FDFDF8       /* Warm white */
  --text-primary: #2D3748   /* Dark gray */
  --accent: #D4A574         /* Gold accent */
```

### Database Queries
- **Mongoose models** in `/lib/models/`
- Always handle errors with try-catch
- Use lean queries for read-only operations: `.lean()`
- Index frequently queried fields

## Arabic Text Handling

### CSS for Arabic
```css
.arabic-text {
  font-family: 'Noto Naskh Arabic', serif;
  font-size: 1.25rem;
  line-height: 2;
  direction: rtl;
  text-align: right;
}

.transliteration {
  font-style: italic;
  color: var(--text-secondary);
}
```

### Content Format
- **Markdown with HTML**: Allow both for flexibility
- **Arabic quotes**: Wrap in `<p class="arabic-text">`
- **Footnotes**: Use superscript `<sup>` with anchor links
- **Honorifics**: Never strip صلى الله عليه وسلم, رحمه الله, etc.

## Frontend Aesthetics

**DO NOT** create generic "AI slop" designs. Follow these principles:

### Typography
- **Headings**: DM Serif Display (distinctive, elegant)
- **Body**: Spectral or Crimson Pro (highly readable serif, not Inter/Roboto)
- **Arabic**: Noto Naskh Arabic (clear, traditional style)
- **Monospace** (for code/references): JetBrains Mono

### Color & Theme
- **Warm scholarly palette**: Cream backgrounds, deep teal/olive accents
- **Not purple gradients on white** (overused AI aesthetic)
- **Inspiration**: Islamic manuscript aesthetics, academic journals
- **Dark mode**: Optional, but if added use deep warm tones

### Layout
- **Max-width 720px** for reading comfort on lectures
- **Generous spacing**: line-height 1.7-1.8 for body text
- **Asymmetric layouts**: Avoid perfectly centered everything
- **Breathing room**: Large margins, spacious cards

### Motion
- **Subtle**: Page transitions, card hover effects
- **CSS-first**: Use Tailwind `transition` utilities
- **Meaningful**: Staggered reveals on archive page load
```tsx
  <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
```

### Backgrounds
- **Not solid white**: Use `#FDFDF8` warm cream
- **Subtle textures**: Consider CSS patterns for depth
- **Geometric patterns**: Islamic geometry inspiration (optional)

## API Routes

### GET /api/lectures
- Query params: `?featured=true`, `?book=ID`, `?limit=10`
- Returns: Array of lecture objects

### POST /api/lectures (Admin only)
- Body: Lecture object
- Returns: Created lecture with ID

### GET /api/lectures/[id]
- Returns: Full lecture content

### PATCH /api/lectures/[id] (Admin only)
- Body: Partial lecture object
- Returns: Updated lecture

### DELETE /api/lectures/[id] (Admin only)
- Returns: Success message

## Authentication

- **Single admin user** (you)
- **NextAuth.js** with Credentials provider
- **Protected routes**: Use middleware for `/admin/*`
- **Session storage**: Database sessions (MongoDB)
```typescript
// middleware.ts
export { default } from "next-auth/middleware"
export const config = { matcher: ["/admin/:path*"] }
```

## SEO & Meta

- **Dynamic meta tags** for each lecture
- **Open Graph** images with lecture title
- **Structured data**: JSON-LD for articles
- **Sitemap**: Auto-generated from lectures

## The "Do Not Touch" List

❌ **DO NOT**:
1. Remove Arabic honorifics (صلى الله عليه وسلم, رحمه الله, حفظه الله)
2. Simplify transliterations to ASCII (keep diacritics: ḥ, ṣ, ʿ)
3. Convert notes to bullet-heavy lists (preserve scholarly paragraph style)
4. Use generic fonts (Inter, Roboto, Arial)
5. Implement dark mode without warm tones (no pure black backgrounds)
6. Create purple gradient headers (overused AI aesthetic)
7. Make the admin panel complex (keep it simple, functional)
8. Skip error handling on DB queries
9. Use `any` types in TypeScript
10. Forget to add loading states for data fetching

## Deployment Checklist

Before deploying to Vercel:
- [ ] Environment variables set (MongoDB URI, NextAuth secret)
- [ ] Build passes (`npm run build`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Admin credentials created
- [ ] Sample books/sheikhs seeded
- [ ] MongoDB Atlas IP whitelist configured (allow all for Vercel)
- [ ] Test upload/publish flow
- [ ] Mobile responsiveness verified

## Content Guidelines

When building content display:
1. **Preserve sheikh's words exactly** - no summarization
2. **Maintain Arabic text integrity** - RTL, proper fonts
3. **Include all footnotes** - numbered, linked
4. **Show metadata clearly** - book, sheikh, date prominent
5. **Enable sharing** - WhatsApp, copy link (important for users)
6. **Paginate archive** - Don't load 100+ lectures at once

## Accessibility

- **Semantic HTML**: `<article>`, `<section>`, `<aside>`
- **ARIA labels**: For Arabic text, screen readers
- **Focus states**: Visible on all interactive elements
- **Contrast ratios**: WCAG AA minimum
- **Font sizing**: Respect user preferences, use `rem` not `px`

## Performance

- **Image optimization**: Next.js `<Image>` component
- **Code splitting**: Automatic with App Router
- **Database indexing**: On `bookId`, `published`, `createdAt`
- **Static generation**: For public lecture pages when possible
- **Edge caching**: Leverage Vercel's CDN

---

## Quick Start for Claude

When starting work on this project:

1. **Read the schema** - Understand the data model first
2. **Check `/lib/models`** - See existing Mongoose schemas
3. **Review components** - Don't recreate what exists
4. **Test mobile first** - Most users on phones
5. **Preserve Arabic** - Never compromise on proper rendering

This project prioritizes **clarity, accessibility, and faithfulness to the original teachings** above all else.

<investigate_before_answering>
Never speculate about code you have not opened. If the user references a specific file, you MUST read the file before answering. Make sure to investigate and read relevant files BEFORE answering questions about the codebase. Never make any claims about code before investigating unless you are certain of the correct answer - give grounded and hallucination-free answers.
</investigate_before_answering>

<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight.

Focus on:
- Typography: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics.
- Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.
- Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.
- Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:
- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!
</frontend_aesthetics>

<use_parallel_tool_calls>
If you intend to call multiple tools and there are no dependencies between the tool calls, make all of the independent tool calls in parallel. Prioritize calling tools simultaneously whenever the actions can be done in parallel rather than sequentially. For example, when reading 3 files, run 3 tool calls in parallel to read all 3 files into context at the same time. Maximize use of parallel tool calls where possible to increase speed and efficiency. However, if some tool calls depend on previous calls to inform dependent values like the parameters, do NOT call these tools in parallel and instead call them sequentially. Never use placeholders or guess missing parameters in tool calls.
</use_parallel_tool_calls>

<do_not_act_before_instructions>
Do not jump into implementatation or changes files unless clearly instructed to make changes. When the user's intent is ambiguous, default to providing information, doing research, and providing recommendations rather than taking action. Only proceed with edits, modifications, or implementations when the user explicitly requests them.
</do_not_act_before_instructions>