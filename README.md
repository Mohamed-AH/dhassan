# Islamic Lecture Notes Platform

A beautiful, mobile-first web application for sharing English notes from Arabic Islamic lectures by Sheikh Ḥasan Ad-Daghrīrī حفظه الله.

## 🎨 Design Philosophy

This platform prioritizes **visual appeal as a core feature**. The design communicates "this is valuable knowledge" through:

- **Premium scholarly aesthetic** - Warm cream backgrounds, elegant serif typography
- **Arabic text prominence** - Large, beautiful Noto Naskh Arabic font with proper RTL support
- **Readable typography** - 18px+ body text, generous line-height (1.8)
- **Share-worthy design** - Every lecture page should make users want to share immediately

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.3+ (strict mode)
- **Styling**: Tailwind CSS 4 (CSS-first configuration)
- **Database**: MongoDB (Docker for local development)
- **ODM**: Mongoose 8+
- **Authentication**: NextAuth.js 5 (planned)
- **Animations**: Framer Motion

## ✅ Current Progress

### Phase 1: Foundation (COMPLETED)

- [x] Next.js 14 project with TypeScript and Tailwind CSS
- [x] Complete design system with custom color palette
- [x] Google Fonts integration (Cormorant Garamond, Crimson Pro, Noto Naskh Arabic, DM Sans)
- [x] MongoDB connection utility with caching
- [x] Mongoose models (Lecture, Book, Sheikh)
- [x] Reusable UI components (Button, Card, Container, ShareButton)
- [x] Beautiful lecture page prototype with dummy data
- [x] Share functionality (native mobile share + clipboard fallback)

### 🚧 Next: Phase 2 (Admin Panel)

- [ ] NextAuth.js authentication
- [ ] Admin dashboard
- [ ] Lecture upload form with rich text editor
- [ ] Books and Sheikhs management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker (for local MongoDB)

### Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start MongoDB** (if you have Docker):
   ```bash
   docker compose up -d
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**: http://localhost:3000

You'll see a beautiful sample lecture page showcasing the design system!

### Environment Variables

The `.env.local` file is already configured for local development:

```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/lecture_notes?authSource=admin
NEXTAUTH_URL=http://localhost:3000
```

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx         # Root layout with Google Fonts
│   ├── page.tsx           # Sample lecture page
│   └── globals.css        # Complete design system
├── components/
│   └── ui/                # Reusable components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Container.tsx
│       └── ShareButton.tsx
└── lib/
    ├── db.ts              # MongoDB connection
    └── models/            # Mongoose schemas
```

## 🎨 Design System

### Colors

- **Primary**: #1e5f5c (Deep teal)
- **Background**: #fdfcf8 (Warm cream)
- **Accent**: #c9a961 (Gold)

### Typography

- **Headings**: Cormorant Garamond
- **Body**: Crimson Pro
- **Arabic**: Noto Naskh Arabic
- **UI**: DM Sans

### Key CSS Classes

```css
.heading-primary        /* Large page titles */
.body-text              /* Main content */
.arabic-text            /* Arabic text (RTL) */
.card-elevated          /* Elevated cards */
.btn-primary            /* Primary button */
.divider                /* Gold divider */
```

## 🚢 Deployment (Render)

1. Connect repository to Render
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables (MongoDB URI, etc.)

## 📚 Documentation

- `docs/claude.md` - Technical specifications
- `docs/prompt.md` - Content conversion guidelines
- `docs/roadmap-features-workflow-design-success.md` - Implementation roadmap
- `docs/databaseschema.md` - Database schema

## 🎯 Success Metrics

- ✅ Admin can publish lecture in <10 minutes
- ✅ Mobile users can read without zooming
- ✅ Design makes users want to share
- ✅ <2s load time on 3G

---

**Status**: Phase 1 Complete ✅ | Phase 2 Next 🚧

**View Sample**: http://localhost:3000 (after `npm run dev`)
