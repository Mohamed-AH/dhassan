# End-to-End Testing Plan - Notes from the Majlis

Complete testing checklist before deploying to Render.

**Test Environment**: Local Development
**Tester**: _______________
**Date**: _______________
**MongoDB**: Local/Atlas (circle one)

---

## Pre-Test Setup

### 1. Environment Preparation

```bash
# Ensure dependencies are installed
npm install

# Verify .env file exists and has all required variables
cat .env

# Start MongoDB (if local)
# mongod

# Start the application
npm run dev
```

**Checklist:**
- [ ] All dependencies installed without errors
- [ ] `.env` file exists with all variables
- [ ] MongoDB is running and accessible
- [ ] Server starts without errors on http://localhost:8000
- [ ] No console errors in terminal

**Expected Output:**
```
✅ Connected to Database
🔍 Environment Configuration:
NODE_ENV: development
...
🚀 Server running on port 8000
```

### 2. Database Verification

```bash
# Verify collections exist
# In MongoDB Compass or Atlas, check for:
# - series
# - lessons
# - users
# - admins
```

**Checklist:**
- [ ] `series` collection exists with at least 1 series
- [ ] `lessons` collection exists with at least 1 lesson
- [ ] `admins` collection exists with at least 1 admin
- [ ] First admin email is `emah84@gmail.com`
- [ ] Admin has `role: 'super-admin'` and `isActive: true`

**If admins collection is missing:**
```bash
node scripts/seed-admin.js
```

---

## Phase 1: Public Pages Testing (No Authentication)

### Test 1.1: Landing Page

**URL:** `http://localhost:8000/`

**Test Steps:**
1. Open landing page
2. Check hero section displays
3. Verify recent lessons section shows lessons
4. Check all navigation links
5. Verify footer displays

**Checklist:**
- [ ] Page loads without errors
- [ ] Hero section displays: "Notes from the Majlis"
- [ ] Recent lessons section shows at least 1 lesson
- [ ] Lesson cards display: title, hadiths, duration, date
- [ ] Navigation links are visible (Home, Browse Topics, Browse Series)
- [ ] Footer displays properly
- [ ] No console errors in browser DevTools

**Expected Behavior:**
- Recent lessons sorted by newest first
- Lesson summaries truncated at 200 characters
- Dates display correctly (e.g., "Jan 13, 2025")

### Test 1.2: Browse Topics Page

**URL:** `http://localhost:8000/topics`

**Test Steps:**
1. Click "Browse Topics" in navigation
2. Verify categories display
3. Check series are organized by category

**Checklist:**
- [ ] Page loads without errors
- [ ] Categories display (Hadith, Tafsir, Fiqh, Aqeedah, etc.)
- [ ] Each category shows series cards
- [ ] Series cards display title (English and Arabic)
- [ ] Series cards show lesson count
- [ ] Click a series card navigates correctly

### Test 1.3: Browse Series Page

**URL:** `http://localhost:8000/series`

**Test Steps:**
1. Click "Browse Series" in navigation
2. Verify all series display in grid
3. Check series metadata

**Checklist:**
- [ ] Page loads without errors
- [ ] All series display in grid layout
- [ ] Each series card shows:
  - [ ] Title (English)
  - [ ] Title (Arabic) if exists
  - [ ] Category badge
  - [ ] Lesson count
  - [ ] "View Series" button
- [ ] Click series card navigates to series detail

### Test 1.4: Series Detail Page

**URL:** `http://localhost:8000/series/[seriesId]`

**Test Steps:**
1. Click any series from Browse Series
2. Verify series information displays
3. Check lessons list

**Checklist:**
- [ ] Page loads without errors
- [ ] Hero section shows series title and description
- [ ] Series metadata displays (category, status, lessons count)
- [ ] All lessons for this series display
- [ ] Lessons sorted by lesson number
- [ ] Each lesson card shows:
  - [ ] Lesson number
  - [ ] Title (English and Arabic)
  - [ ] Hadiths range
  - [ ] Duration
  - [ ] Date
  - [ ] "View Notes" button
- [ ] Breadcrumb navigation works

### Test 1.5: Lesson Detail Page

**URL:** `http://localhost:8000/lesson/[lessonId]`

**Test Steps:**
1. Click any lesson from series detail or landing page
2. Verify lesson content displays
3. Test table of contents
4. Check timestamps
5. Test bilingual headings

**Checklist:**
- [ ] Page loads without errors
- [ ] Lesson title displays (English | Arabic)
- [ ] Metadata displays (hadiths, duration, date)
- [ ] Table of contents (TOC) displays on left
- [ ] TOC shows all chapter headings
- [ ] **IMPORTANT:** TOC shows "English | Arabic" (not "Arabic | English")
- [ ] Main content area shows markdown-rendered notes
- [ ] **IMPORTANT:** Headings show "English | Arabic" (not reversed)
- [ ] Timestamps display if present
- [ ] Click TOC item scrolls to chapter
- [ ] Breadcrumb navigation works
- [ ] Previous/Next lesson navigation works (if available)
- [ ] No "Edit Lesson" button visible (not logged in)

**Bilingual Test:**
- Find a heading like "## Introduction | مقدمة"
- [ ] TOC shows: "Introduction | مقدمة"
- [ ] Main content shows: "Introduction | مقدمة"
- [ ] NOT reversed (Arabic should be on right)

---

## Phase 2: Authentication Testing

### Test 2.1: Login Page

**URL:** `http://localhost:8000/login`

**Test Steps:**
1. Navigate to `/login`
2. Verify OAuth buttons display

**Checklist:**
- [ ] Page loads without errors
- [ ] "Sign in with Google" button displays
- [ ] "Sign in with GitHub" button displays (if configured)
- [ ] No error messages display

### Test 2.2: Google OAuth Login

**URL:** `http://localhost:8000/auth/google`

**Test Steps:**
1. Click "Sign in with Google"
2. Complete Google authentication
3. Verify redirect back to app

**Checklist:**
- [ ] Redirects to Google login page
- [ ] Can select Google account
- [ ] Redirects back to application
- [ ] Lands on homepage (/) after login
- [ ] User name appears in navigation
- [ ] "Logout" link appears in navigation

**Test with admin email (emah84@gmail.com):**
- [ ] After login, "Admin Panel" link appears in navigation
- [ ] "Admin Panel" link is styled in terracotta color

**Test with non-admin email:**
- [ ] After login, NO "Admin Panel" link appears
- [ ] Only user name and Logout show

### Test 2.3: Logout

**Test Steps:**
1. While logged in, click "Logout"
2. Verify session ends

**Checklist:**
- [ ] Redirects to homepage or login
- [ ] User name no longer in navigation
- [ ] "Admin Panel" link disappears
- [ ] Session cleared (check browser DevTools → Application → Cookies)

---

## Phase 3: Admin Panel Access Control

### Test 3.1: Admin Panel Access (Super-Admin)

**Prerequisites:** Logged in as `emah84@gmail.com`

**Test Steps:**
1. Click "Admin Panel" in navigation
2. Access `/admin` directly

**Checklist:**
- [ ] Can access `/admin` dashboard
- [ ] Dashboard displays stats:
  - [ ] Total Lessons
  - [ ] Series count
  - [ ] Users count
  - [ ] Active Admins count
- [ ] Recent lessons table displays
- [ ] Active admins table displays
- [ ] Admin navigation shows:
  - [ ] Dashboard (active)
  - [ ] All Lessons
  - [ ] Series
  - [ ] User Management
- [ ] Current admin name and role badge display

### Test 3.2: Admin Panel Access (Non-Admin)

**Prerequisites:** Logged in with non-admin Google account

**Test Steps:**
1. Try to access `/admin` directly in URL
2. Try to access `/admin/lessons`
3. Try to access `/admin/series`

**Checklist:**
- [ ] Redirected to error page or access denied
- [ ] Error message: "Admin access required"
- [ ] Cannot access any admin routes
- [ ] No admin navigation visible

### Test 3.3: Admin Panel Access (Not Logged In)

**Prerequisites:** Logged out

**Test Steps:**
1. Try to access `/admin` directly
2. Try to access `/admin/lessons`

**Checklist:**
- [ ] Redirected to `/login` page
- [ ] After login (with admin account), redirected back to intended page

---

## Phase 4: CRUD Testing - Lessons

### Test 4.1: View All Lessons

**URL:** `http://localhost:8000/admin/lessons`

**Prerequisites:** Logged in as admin

**Checklist:**
- [ ] Page loads without errors
- [ ] Lessons grouped by series
- [ ] Each series section shows:
  - [ ] Series title (English and Arabic)
  - [ ] Table of lessons
- [ ] Each lesson row shows:
  - [ ] Lesson number
  - [ ] Title (English and Arabic)
  - [ ] Date
  - [ ] Hadiths and duration metadata
  - [ ] View button
  - [ ] Edit button

### Test 4.2: Edit Lesson (Full Metadata)

**URL:** `http://localhost:8000/admin/lesson/[lessonId]/edit`

**Test Steps:**
1. From All Lessons page, click "Edit" on any lesson
2. Verify form loads with existing data
3. Edit all fields
4. Save changes
5. Verify changes appear

**Form Fields Checklist:**
- [ ] Title (English) field populated
- [ ] Title (Arabic) field populated
- [ ] Hadiths Display field populated
- [ ] Duration field populated
- [ ] Date (Gregorian) field populated
- [ ] Lesson Number field populated
- [ ] Notes (Markdown) editor populated

**Edit Test:**
1. Change Title (English) from "X" to "X - EDITED"
2. Change Duration from "1h 45m" to "1h 50m"
3. Add text to Notes
4. Click "Save All Changes"

**Checklist:**
- [ ] Save button shows "Saving..."
- [ ] Success message displays
- [ ] Redirects to lesson view page
- [ ] Title shows "X - EDITED"
- [ ] Duration shows "1h 50m"
- [ ] Notes changes are visible

**Return to edit page and verify:**
- [ ] All changes persisted
- [ ] updatedAt timestamp changed
- [ ] updatedBy shows admin email

### Test 4.3: Delete Lesson (Super-Admin Only)

**Prerequisites:** Logged in as super-admin

**Test Steps:**
1. Edit any lesson
2. Scroll to bottom
3. Verify Delete button exists
4. Click Delete button
5. Confirm deletion twice

**Checklist:**
- [ ] "Delete Lesson" button visible (red)
- [ ] First confirmation dialog appears
- [ ] Second confirmation dialog appears
- [ ] After confirming, success message displays
- [ ] Redirects to /admin/lessons
- [ ] Lesson no longer appears in list
- [ ] Lesson deleted from database

**Test with Editor Role:**
- [ ] Login as editor (if you have one)
- [ ] Delete button should NOT be visible

---

## Phase 5: CRUD Testing - Series

### Test 5.1: View All Series

**URL:** `http://localhost:8000/admin/series`

**Prerequisites:** Logged in as admin

**Checklist:**
- [ ] Page loads without errors
- [ ] "Create New Series" button visible
- [ ] All series display in table
- [ ] Each series row shows:
  - [ ] Series ID (code)
  - [ ] Title (English and Arabic)
  - [ ] Category badge
  - [ ] Status badge (Ongoing/Complete/Paused)
  - [ ] Actual lesson count
  - [ ] View, Edit buttons
  - [ ] Delete button (only if super-admin AND 0 lessons)

### Test 5.2: Create New Series

**URL:** `http://localhost:8000/admin/series/new`

**Test Steps:**
1. Click "Create New Series" button
2. Fill in all required fields
3. Save

**Form Data:**
```
Series ID: test-series-2025
Title (English): Test Series for Verification
Title (Arabic): سلسلة الاختبار
Category: Hadith
Status: Ongoing
Author: Sheikh Hassan bin Muhammad Mansur Ad-Daghriri
Description: This is a test series to verify CRUD operations
Location: Jami' Al-Wurud, Al-Wurud District, Jeddah
Telegram Link: (leave blank)
```

**Checklist:**
- [ ] All form fields display
- [ ] Series ID field is editable (new series only)
- [ ] Category dropdown shows all options
- [ ] Status dropdown shows Ongoing/Complete/Paused
- [ ] Click "Create Series"
- [ ] Success message displays
- [ ] Redirects to /admin/series
- [ ] New series appears in table
- [ ] Series has 0 lessons

**Validation Test:**
1. Try to create series with existing ID
2. Try to submit without required fields

**Checklist:**
- [ ] Duplicate ID error: "Series ID already exists"
- [ ] Empty required field error displayed
- [ ] Form validation works

### Test 5.3: Edit Series

**Test Steps:**
1. From series list, click "Edit" on test series
2. Verify form populates
3. Change fields
4. Save

**Edit Data:**
```
Title (English): Test Series - EDITED
Description: Updated description
Status: Complete
```

**Checklist:**
- [ ] Form loads with existing data
- [ ] Series ID field is NOT editable (read-only or hidden)
- [ ] Change title to "Test Series - EDITED"
- [ ] Change status to "Complete"
- [ ] Click "Save Changes"
- [ ] Success message displays
- [ ] Redirects to /admin/series
- [ ] Series shows updated title
- [ ] Status badge shows "Complete"

### Test 5.4: Delete Series

**Prerequisites:** Series with 0 lessons, logged in as super-admin

**Test Steps:**
1. Find test series (0 lessons)
2. Click "Delete" button
3. Confirm deletion

**Checklist:**
- [ ] Delete button visible for series with 0 lessons
- [ ] Delete button NOT visible for series with lessons
- [ ] Confirmation dialog appears
- [ ] After confirming, success message displays
- [ ] Series removed from list
- [ ] Series deleted from database

**Test Protection:**
1. Try to delete series with lessons

**Checklist:**
- [ ] Error message: "Cannot delete series. It has X lesson(s). Delete all lessons first."
- [ ] Series NOT deleted

---

## Phase 6: CRUD Testing - Users/Admins

### Test 6.1: View Admin Users

**URL:** `http://localhost:8000/admin/users`

**Prerequisites:** Logged in as super-admin

**Checklist:**
- [ ] Page loads without errors
- [ ] "Add New Admin" form displays
- [ ] Current admins table displays
- [ ] Each admin row shows:
  - [ ] Name
  - [ ] Email
  - [ ] Role badge (super-admin/editor)
  - [ ] Status badge (Active/Inactive)
  - [ ] Added date
  - [ ] Added by (email)
  - [ ] Actions (Deactivate/Reactivate)
- [ ] Current admin marked with "(You)"
- [ ] Current admin has no action buttons

**Test with Editor Role:**
- [ ] Editor cannot access /admin/users
- [ ] Redirected with "Super admin access required"

### Test 6.2: Add New Admin

**Test Steps:**
1. Fill in Add New Admin form
2. Submit
3. Verify new admin appears

**Form Data:**
```
Email: testadmin@example.com
Full Name: Test Administrator
Role: Editor
```

**Checklist:**
- [ ] Fill in all fields
- [ ] Select "Editor" role
- [ ] Click "Add Admin"
- [ ] Success message displays
- [ ] Form resets
- [ ] New admin appears in table
- [ ] New admin shows:
  - [ ] Email: testadmin@example.com
  - [ ] Name: Test Administrator
  - [ ] Role: editor (badge)
  - [ ] Status: Active
  - [ ] Added by: your email

**Validation Test:**
1. Try to add admin with duplicate email
2. Try to add admin with invalid email
3. Try to submit without role

**Checklist:**
- [ ] Duplicate email error: "Admin with this email already exists"
- [ ] Invalid email error displayed
- [ ] Missing role validation works

### Test 6.3: Deactivate Admin

**Test Steps:**
1. Find test admin in table
2. Click "Deactivate" button
3. Confirm

**Checklist:**
- [ ] Confirmation dialog appears
- [ ] Click "Yes" to confirm
- [ ] Success message displays
- [ ] Page reloads
- [ ] Admin row shows:
  - [ ] Status: Inactive (gray badge)
  - [ ] Row has reduced opacity
  - [ ] "Reactivate" button instead of "Deactivate"

**Test Protection:**
- [ ] Cannot deactivate own account
- [ ] Error if trying: "Cannot deactivate your own account"

### Test 6.4: Reactivate Admin

**Test Steps:**
1. Find inactive admin
2. Click "Reactivate" button
3. Confirm

**Checklist:**
- [ ] Confirmation dialog appears
- [ ] Click "Yes" to confirm
- [ ] Success message displays
- [ ] Page reloads
- [ ] Admin shows as Active
- [ ] "Deactivate" button appears again

### Test 6.5: Inactive Admin Login Test

**Test Steps:**
1. Logout current admin
2. Login with deactivated admin email (testadmin@example.com)
3. Try to access /admin

**Checklist:**
- [ ] Can login with Google OAuth
- [ ] Cannot access /admin
- [ ] Error: "Admin access required"
- [ ] No "Admin Panel" link in navigation

---

## Phase 7: Security Testing

### Test 7.1: Direct URL Access (Not Logged In)

**Test all these URLs while logged out:**

```
/admin
/admin/lessons
/admin/series
/admin/series/new
/admin/series/[id]/edit
/admin/lesson/[id]/edit
/admin/users
```

**Checklist:**
- [ ] All URLs redirect to /login
- [ ] No unauthorized access granted
- [ ] No data exposed before login

### Test 7.2: API Endpoint Security

**Test Steps:**
1. Open browser DevTools → Network
2. Try to call admin APIs directly

**Test URLs (POST/DELETE):**
```
POST /admin/lesson/[id]/update
DELETE /admin/lesson/[id]/delete
POST /admin/series/create
POST /admin/users/add
POST /admin/users/[id]/deactivate
```

**Checklist:**
- [ ] All return 401 (Unauthorized) when not logged in
- [ ] All return 403 (Forbidden) when logged in as non-admin
- [ ] Super-admin only routes return 403 for editors

### Test 7.3: Role-Based Access

**As Editor (if available):**
- [ ] Can access /admin dashboard
- [ ] Can access /admin/lessons
- [ ] Can edit lessons
- [ ] Can access /admin/series
- [ ] Can create/edit series
- [ ] **CANNOT** access /admin/users
- [ ] **CANNOT** see delete buttons
- [ ] **CANNOT** delete lessons or series

**As Super-Admin:**
- [ ] Can access all pages
- [ ] Can see all buttons
- [ ] Can delete lessons
- [ ] Can delete series
- [ ] Can manage users

---

## Phase 8: Edge Cases & Error Handling

### Test 8.1: Invalid URLs

**Test Steps:**
1. Navigate to non-existent lesson
2. Navigate to non-existent series

**URLs:**
```
/lesson/invalid-id-12345
/series/non-existent-series
```

**Checklist:**
- [ ] Shows error page (not crash)
- [ ] Error message: "Lesson not found" or "Series not found"
- [ ] Can navigate back using breadcrumb or browser back

### Test 8.2: Empty States

**Test Steps:**
1. Create series with no lessons
2. View series detail page

**Checklist:**
- [ ] Series page loads
- [ ] Shows message: "No lessons yet" or similar
- [ ] Doesn't crash

### Test 8.3: Large Content

**Test Steps:**
1. Create/edit lesson with very long notes (>10,000 characters)
2. Save

**Checklist:**
- [ ] Form accepts large content
- [ ] Save succeeds
- [ ] No payload size errors
- [ ] Content displays correctly on view page

### Test 8.4: Special Characters

**Test Steps:**
1. Create series with Arabic, special chars in title
2. Create lesson with markdown special chars

**Test Data:**
```
Title: Test "Quotes" & <HTML> Special's
Arabic: التجربة 'الخاصة' "بالعربية"
```

**Checklist:**
- [ ] Saves without errors
- [ ] Displays correctly (no HTML injection)
- [ ] Special characters render properly
- [ ] No XSS vulnerabilities

---

## Phase 9: UI/UX Testing

### Test 9.1: Responsive Design (Mobile)

**Test Steps:**
1. Open browser DevTools
2. Toggle device toolbar (mobile view)
3. Test responsive breakpoints

**Screen Sizes:**
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone X)
- [ ] 768px (iPad)
- [ ] 1024px (iPad Pro)
- [ ] 1920px (Desktop)

**Checklist:**
- [ ] Navigation collapses properly
- [ ] Lesson content readable
- [ ] TOC accessible on mobile
- [ ] Admin tables scroll horizontally if needed
- [ ] Buttons are touch-friendly
- [ ] Forms are usable
- [ ] No horizontal scroll on small screens

### Test 9.2: Contrast & Readability

**Checklist:**
- [ ] All text is readable (good contrast)
- [ ] Cancel buttons have dark text on light background (not white on gray)
- [ ] Status badges have sufficient contrast
- [ ] "Inactive" badge uses dark text on light gray
- [ ] "Complete" badge uses white text on rich gold (not muted gold)
- [ ] Admin Panel link stands out (terracotta color)

### Test 9.3: Loading States

**Checklist:**
- [ ] Save buttons show "Saving..." during save
- [ ] Forms disable buttons during submission
- [ ] Success/error messages display clearly
- [ ] No double-submissions possible

---

## Phase 10: Performance Testing

### Test 10.1: Page Load Times

**Use browser DevTools → Network → Disable cache**

**Measure:**
- [ ] Landing page loads < 2 seconds
- [ ] Lesson page loads < 2 seconds
- [ ] Admin dashboard loads < 2 seconds
- [ ] All pages load without errors

### Test 10.2: Database Queries

**Check server logs for:**
- [ ] No N+1 query issues
- [ ] Reasonable query counts per page
- [ ] No slow query warnings

### Test 10.3: Large Dataset

**If possible:**
- [ ] Test with 10+ series
- [ ] Test with 50+ lessons
- [ ] Check admin pages still load quickly
- [ ] Check pagination if implemented

---

## Phase 11: Data Integrity

### Test 11.1: Database Consistency

**After all CRUD tests, verify in MongoDB:**

**Lessons:**
- [ ] All lessons have valid seriesId
- [ ] updatedAt timestamps are recent
- [ ] updatedBy shows correct admin email
- [ ] All required fields present

**Series:**
- [ ] All series have unique seriesId
- [ ] totalLessons count matches actual lessons (may be off, but check)
- [ ] All required fields present

**Admins:**
- [ ] All admins have email, name, role
- [ ] At least one super-admin exists
- [ ] isActive field present on all

### Test 11.2: Referential Integrity

**Checklist:**
- [ ] All lessons reference existing series
- [ ] No orphaned lessons (lesson.seriesId doesn't exist)
- [ ] Series deletion blocked if lessons exist

---

## Testing Summary

### Critical Issues (Must Fix Before Deploy)
```
List any blocking issues here:
1.
2.
3.
```

### Medium Priority Issues
```
List issues that should be fixed but don't block deploy:
1.
2.
3.
```

### Low Priority / Future Enhancements
```
Nice-to-have improvements:
1.
2.
3.
```

### Overall Status

- [ ] All critical features working
- [ ] No security vulnerabilities found
- [ ] Authentication working properly
- [ ] All CRUD operations functional
- [ ] Admin role system working
- [ ] UI/UX acceptable
- [ ] Ready for production deployment

---

## Sign-Off

**Tester Name:** _______________________

**Date:** _______________________

**Approval:** ⬜ APPROVED FOR DEPLOYMENT  /  ⬜ NEEDS FIXES

**Notes:**
```




```

---

## Next Steps After Testing

1. ✅ Fix all critical issues
2. ✅ Document known medium/low priority issues
3. ✅ Take database backup before deploy
4. ✅ Proceed with Render deployment (follow RENDER_DEPLOYMENT.md)
5. ✅ Repeat selected tests in production
6. ✅ Monitor logs for first 24 hours

**Good luck with testing!** 🧪
