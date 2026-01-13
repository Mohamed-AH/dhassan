# Phase 3: User Profile Dashboard - Visual Design Plan

## Overview
A clean, welcoming profile page that matches the warm scholarly aesthetic of the site, featuring progress tracking and private notes with a tab-based interface.

---

## Page Layout Structure

### 1. **Navigation Bar** (Existing)
- Same navigation as all pages
- User's name in nav becomes a link to `/profile` (already implemented)
- Active state when on profile page

### 2. **Profile Hero Section** (Top Banner)
```
┌─────────────────────────────────────────────────────────────┐
│  Welcome Back, [User Name]                                   │
│  Continue your journey through the teachings                 │
│                                                              │
│  [Progress Tab] [My Notes Tab]                              │
└─────────────────────────────────────────────────────────────┘
```

**Design Details:**
- Background: `var(--warm-cream)`
- Padding: 3rem 0 1.5rem
- Centered content with max-width: 1200px
- Heading: Font `var(--font-display)`, size 2.5rem, color `var(--sage-green)`
- Subtitle: Font `var(--font-body)`, size 1.1rem, color `var(--text-secondary)`
- Tab buttons below subtitle with active state styling

---

## Tab 1: Progress Tab (Default)

### Layout:
```
┌────────────────────────────────────────────────────────────┐
│  Your Learning Journey                                      │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  [Number]    │  │  [Number]    │  │  [Number]    │   │
│  │  Lessons     │  │  Series      │  │  Completion  │   │
│  │  Completed   │  │  Started     │  │  Rate        │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                            │
│  Overall Progress                                          │
│  ▓▓▓▓▓▓▓░░░░░░░░  42%                                    │
│                                                            │
│  Recent Activity                                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │ ● Lesson 15 - Sahih Bukhari          2 days ago   │   │
│  │ ● Lesson 12 - Aqeedah Studies        5 days ago   │   │
│  │ ● Lesson 8 - Tafsir Essentials       1 week ago   │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Series in Progress                                        │
│  [Series Card] [Series Card] [Series Card]                │
└────────────────────────────────────────────────────────────┘
```

### Component Specifications:

#### **Stats Cards** (Top Row)
- **Layout**: 3-column grid (same as homepage stats)
- **Card Style**:
  - Background: `white`
  - Border: `1px solid var(--border-light)`
  - Border-radius: `var(--radius-lg)` (8px)
  - Padding: `2rem`
  - Text align: center
  - Hover: subtle lift (`translateY(-4px)`) + shadow
- **Number Style**:
  - Font: `var(--font-display)`
  - Size: `3rem`
  - Color: `var(--sage-green)`
  - Weight: 700
- **Label Style**:
  - Font: `var(--font-body)`
  - Size: `0.95rem`
  - Color: `var(--text-secondary)`

**Stats to Show:**
1. **Lessons Completed**: Count of read lessons
2. **Series Started**: Count of unique series with at least 1 lesson read
3. **Completion Rate**: Percentage of total available lessons read

#### **Progress Bar**
- **Container**:
  - Background: `white`
  - Border: `1px solid var(--border-light)`
  - Border-radius: `var(--radius-lg)`
  - Padding: `2rem`
  - Margin: `2rem 0`
- **Title**: "Overall Progress" in `var(--font-display)`, 1.5rem
- **Bar**:
  - Height: `24px`
  - Background: `var(--soft-beige)`
  - Border-radius: `var(--radius-lg)`
  - Inner fill: `var(--sage-green)`
  - Smooth transition animation (0.6s ease)
  - Percentage text aligned right, inside or next to bar

#### **Recent Activity Section**
- **Container**: Same white card style
- **Title**: "Recent Activity" (h2 style)
- **Activity Items**:
  - List style with subtle separators
  - Each item:
    ```
    [●] [Lesson Title] - [Series Name]     [Time ago]
    ```
  - Bullet color: `var(--muted-gold)`
  - Title: `var(--text-primary)`, clickable link
  - Time: `var(--text-light)`, right-aligned
  - Hover: subtle background `var(--soft-beige)`
  - Show last 10 read lessons (most recent first)
  - Format time: "2 days ago", "1 week ago", "Just now"

#### **Series in Progress Section**
- **Title**: "Series in Progress" (h2 style)
- **Cards**: Reuse existing `.lesson-card` component from homepage
- **Layout**: 3-column grid (responsive to 1 column on mobile)
- **Show**: Series where user has read at least 1 lesson but not all
- **Card Content**:
  - Series title (English + Arabic if available)
  - Category tag
  - Progress indicator: "5/12 lessons completed"
  - Small progress bar inside card
  - "Continue →" link button

---

## Tab 2: My Notes Tab

### Layout:
```
┌────────────────────────────────────────────────────────────┐
│  My Personal Notes                                          │
│  Private notes visible only to you. Use this space to      │
│  record your thoughts, questions, and reflections.         │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ [Markdown Editor - Large Textarea]                 │   │
│  │                                                    │   │
│  │ Write your notes here in markdown format...       │   │
│  │                                                    │   │
│  │                                                    │   │
│  │                                                    │   │
│  │                                                    │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  [Characters: 245 / 5000]         [💾 Save Notes]         │
│  Last saved: 2 minutes ago                                 │
└────────────────────────────────────────────────────────────┘
```

### Component Specifications:

#### **Notes Container**
- **Layout**: Single column, max-width: 900px, centered
- **Header**:
  - Title: "My Personal Notes" in `var(--font-display)`, 2rem
  - Subtitle: Explanation text in `var(--text-secondary)`, 1rem
  - Margin bottom: 2rem

#### **Markdown Editor**
- **Style**: Clean, minimal textarea (NOT EasyMDE - too heavy for personal notes)
- **Textarea**:
  - Background: `white`
  - Border: `2px solid var(--border-light)`
  - Border-radius: `var(--radius-lg)`
  - Padding: `1.5rem`
  - Font: `var(--font-body)`, size: 1rem
  - Line height: 1.8
  - Min height: `400px`
  - Resize: vertical
  - Focus border: `var(--sage-green)`
- **Character Counter**:
  - Position: Below textarea
  - Font size: 0.85rem
  - Color: `var(--text-light)`
  - Changes to red if over 5000 characters
  - Format: "245 / 5000 characters"

#### **Save Button**
- **Style**:
  - Background: `var(--sage-green)`
  - Color: `white`
  - Padding: `0.875rem 2rem`
  - Border-radius: `var(--radius-sm)`
  - Font weight: 600
  - Font size: 1rem
  - Hover: Darken to `var(--deep-sage)` + slight lift
  - Disabled state: `var(--border-light)` background, grayed out
- **Position**: Below character counter, right-aligned
- **Icon**: 💾 Save Notes

#### **Auto-save Indicator**
- **Text**: "Last saved: X minutes ago"
- **Style**:
  - Font size: 0.85rem
  - Color: `var(--text-light)`
  - Position: Below textarea, left side
  - Changes to "Saving..." during save with spinner
  - Changes to "✓ Saved" on success (green color)
  - Auto-save triggers 30 seconds after user stops typing

#### **Markdown Support Hint**
- **Small info box** below editor (collapsible or always visible):
  - Background: `var(--soft-beige)`
  - Border-left: `4px solid var(--muted-gold)`
  - Padding: `1rem 1.5rem`
  - Title: "💡 Markdown Supported"
  - Quick tips:
    - `**bold**` for bold text
    - `## Heading` for headings
    - `- List item` for lists
    - `[link](url)` for links

---

## Tab Navigation Design

### Tab Buttons
```
[📊 Progress]  [📝 My Notes]
```

**Inactive Tab:**
- Background: transparent
- Color: `var(--text-secondary)`
- Border-bottom: `3px solid transparent`
- Padding: `1rem 2rem`
- Font weight: 600
- Cursor: pointer
- Hover: Color `var(--sage-green)`

**Active Tab:**
- Background: transparent
- Color: `var(--sage-green)`
- Border-bottom: `3px solid var(--sage-green)`
- Padding: `1rem 2rem`
- Font weight: 700

**Tab Container:**
- Display: flex
- Gap: 0
- Border-bottom: `1px solid var(--border-light)`
- Margin bottom: `2rem`
- Position: Below hero subtitle

---

## Mobile Responsive Design

### Breakpoint: 768px and below

**Stats Cards:**
- Change from 3 columns to 1 column stack
- Full width on mobile

**Progress Bar:**
- Percentage text moves below bar instead of inside

**Recent Activity:**
- Time moves to second line below title
- Smaller font sizes

**Series Cards:**
- Single column stack

**Tab Buttons:**
- Full width, stacked on small screens
- Reduce padding to `0.75rem 1rem`

**Notes Editor:**
- Min height: `300px` on mobile
- Full width with minimal side padding

---

## Color Palette (Reusing Site Colors)

**Primary Actions:** `var(--sage-green)` #7C9885
**Hover States:** `var(--deep-sage)` #5a7563
**Backgrounds:** `var(--warm-cream)` #FAF8F3
**Cards:** `white` with `var(--border-light)` #E8E5DD border
**Accents:** `var(--muted-gold)` #C5A572
**Text Primary:** `var(--text-primary)` #2C2C2C
**Text Secondary:** `var(--text-secondary)` #5A5A5A
**Text Light:** `var(--text-light)` #8A8A8A

---

## Animations & Transitions

**Card Hovers:**
- `transform: translateY(-4px)` + `box-shadow` increase
- Transition: `0.3s ease`

**Tab Switching:**
- Fade out old content (0.2s)
- Fade in new content (0.3s)
- Border-bottom slide animation on active tab (0.2s)

**Progress Bar Fill:**
- Animate from 0 to actual percentage on page load
- Transition: `0.6s ease`

**Save Button:**
- State changes (saving/saved) with smooth color transition (0.2s)

**Auto-save Indicator:**
- Fade in/out when status changes

---

## Technical Implementation Notes

### Backend Routes Required:
1. `GET /profile` - Render profile page with user data
2. `GET /api/user/stats` - Return user statistics JSON
3. `POST /api/profile/notes` - Save user notes
4. `GET /api/profile/notes` - Retrieve user notes

### Database Schema Addition:
```javascript
// Add to users collection:
{
  userNotes: String,           // Max 5000 chars
  lastNotesUpdate: Date
}
```

### Frontend JavaScript:
- Tab switching logic (show/hide content)
- Auto-save timer for notes (debounce 30 seconds)
- Character counter updates on input
- Progress bar animation on load
- Fetch user stats for Progress tab
- Fetch/save notes for Notes tab

---

## Mockup Visual Reference

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  Navigation: Home | Topics | Series | [Profile] | Logout  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

        Welcome Back, Ahmad Al-Rashid
        Continue your journey through the teachings

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        [Progress]  My Notes
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        Your Learning Journey

    ┏━━━━━━━━━┓  ┏━━━━━━━━━┓  ┏━━━━━━━━━┓
    ┃   24    ┃  ┃    3    ┃  ┃   42%   ┃
    ┃ Lessons ┃  ┃ Series  ┃  ┃Complete ┃
    ┃Complete ┃  ┃ Started ┃  ┃  Rate   ┃
    ┗━━━━━━━━━┛  ┗━━━━━━━━━┛  ┗━━━━━━━━━┛

        Overall Progress
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        ┃▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░  42%┃
        ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

        Recent Activity
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        ┃ ● Lesson 15 - Sahih Bukhari  2d┃
        ┃ ● Lesson 12 - Aqeedah        5d┃
        ┃ ● Lesson 8 - Tafsir          7d┃
        ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

        Series in Progress
        [Card] [Card] [Card]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Final Notes

- All components use existing CSS design system
- Maintains warm, scholarly aesthetic of the site
- Clean, uncluttered interface focusing on content
- Responsive and mobile-friendly
- Accessible with proper ARIA labels and semantic HTML
- Fast loading with minimal additional JavaScript
- Privacy-first: Notes are private and stored securely

**Estimated Implementation Time:**
- Backend routes: 1 hour
- Frontend HTML/CSS: 2 hours
- JavaScript functionality: 2 hours
- Testing & refinement: 1 hour
**Total: ~6 hours**
