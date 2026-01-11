# Smoke Test - Quick Verification

**Time Required:** ~15 minutes

Use this quick checklist to verify critical functionality before deployment.

---

## Pre-Test Setup (2 min)

```bash
# Start the application
npm run dev

# Verify server starts
# Expected: ✅ Connected to Database, 🚀 Server running on port 8000
```

- [ ] Server starts without errors
- [ ] Visit http://localhost:8000 - page loads

---

## Critical Path Testing (10 min)

### 1. Public Access (2 min)

- [ ] **Landing**: Visit `/` - Recent lessons display
- [ ] **Series**: Visit `/series` - All series display
- [ ] **Lesson**: Click any lesson - Content displays correctly
- [ ] **Bilingual**: Check heading shows "English | Arabic" (NOT reversed)

### 2. Authentication (2 min)

- [ ] Visit `/login`
- [ ] Click "Sign in with Google"
- [ ] Login with `emah84@gmail.com`
- [ ] Redirected to homepage
- [ ] **VERIFY:** "Admin Panel" link visible in navigation (terracotta color)

### 3. Admin Access (1 min)

- [ ] Click "Admin Panel"
- [ ] Dashboard loads with stats
- [ ] Navigation shows: Dashboard, All Lessons, Series, User Management

### 4. CRUD - Lessons (3 min)

- [ ] Go to "All Lessons"
- [ ] Click "Edit" on any lesson
- [ ] Change title: Add "- TEST" to end
- [ ] Change duration to different value
- [ ] Click "Save All Changes"
- [ ] **VERIFY:** Success message, redirects to lesson view
- [ ] **VERIFY:** Changes appear on lesson page
- [ ] **VERIFY:** Navigate back to edit page - changes persisted

### 5. CRUD - Series (2 min)

- [ ] Go to "Series" tab
- [ ] Click "Create New Series"
- [ ] Fill in:
  - Series ID: `smoke-test-series`
  - Title (English): `Smoke Test Series`
  - Category: Hadith
- [ ] Click "Create Series"
- [ ] **VERIFY:** Success, redirects to series list
- [ ] **VERIFY:** New series appears in table
- [ ] Click "Delete" on new series
- [ ] Confirm deletion
- [ ] **VERIFY:** Series removed

### 6. CRUD - Users (Super-Admin Only) (1 min)

- [ ] Go to "User Management" tab
- [ ] Verify current admins display
- [ ] Form shows: Email, Name, Role fields
- [ ] **VERIFY:** Cannot deactivate self (no button on your row)

---

## Security Check (1 min)

- [ ] Logout
- [ ] Try to access `/admin` directly
- [ ] **VERIFY:** Redirected to `/login`
- [ ] Try to access `/admin/lessons`
- [ ] **VERIFY:** Redirected to `/login`

---

## UI/Contrast Check (1 min)

- [ ] Login again
- [ ] Go to any edit page
- [ ] **VERIFY:** Cancel button has DARK text on BEIGE background (readable)
- [ ] **VERIFY:** NOT white text on gray (hard to read)
- [ ] Go to User Management
- [ ] **VERIFY:** Inactive badge has DARK text on LIGHT GRAY (if any inactive admins exist)

---

## Pass/Fail

**All checkboxes checked?**

- ✅ **PASS** - Ready for deployment
- ❌ **FAIL** - Run full E2E_TESTING_PLAN.md

**Issues Found:**
```
1.
2.
3.
```

---

## Quick Fixes for Common Issues

**"Admin Panel link not showing"**
→ Run: `node scripts/seed-admin.js`
→ Verify admin exists: Check MongoDB `admins` collection

**"Cannot edit lesson"**
→ Check you're logged in as admin
→ Check MongoDB connection

**"Bilingual headings reversed"**
→ Check lesson.ejs line ~82 (bilingual swap logic)

**"White text hard to read"**
→ Check contrast fixes were applied (admin-*.ejs files)

---

**Next:** If smoke test passes, run full E2E_TESTING_PLAN.md before production deployment.
