# Admin System Setup Guide

## Overview

The Notes from the Majlis platform now has a database-driven admin system that allows multiple administrators with role-based permissions.

## Admin Roles

1. **Super Admin** - Full access including user management
   - Can add/remove other admins
   - Can edit all lessons
   - Can view analytics and stats

2. **Editor** - Content management only
   - Can edit lessons
   - Cannot manage other admins

## Initial Setup

### Step 1: Start MongoDB

Ensure MongoDB is running either:
- **Locally**: `mongod` or via Docker
- **MongoDB Atlas**: Update `.env` with your connection string

### Step 2: Seed the First Admin

Run the seed script to create your first super-admin:

```bash
node scripts/seed-admin.js
```

This will create an admin account for `emah84@gmail.com` with super-admin privileges.

**Output:**
```
✅ First admin created successfully
   Email: emah84@gmail.com
   Role: super-admin
   Name: Mohamed Hassan

🎉 Admin system initialized!
   You can now add more admins via the admin panel.
```

If the admin already exists, the script will notify you and skip creation.

### Step 3: Start the Server

```bash
npm run dev
```

### Step 4: Login and Access Admin Panel

1. Visit `http://localhost:8000/login`
2. Login with Google OAuth using the admin email
3. Visit `http://localhost:8000/admin`

## Admin Panel Features

### Dashboard (`/admin`)
- View platform statistics (lessons, series, users, admins)
- See recent lessons
- Quick links to edit lessons
- View all active admins

### All Lessons (`/admin/lessons`)
- Browse all lessons organized by series
- Quick view and edit links for each lesson
- See lesson metadata (hadith numbers, duration)

### User Management (`/admin/users`) - Super Admin Only
- Add new admins with email, name, and role
- Deactivate/reactivate admin accounts
- View admin activity (who added whom, when)
- Prevent self-deactivation

## Adding New Admins

### Via Admin Panel (Recommended)

1. Navigate to `/admin/users`
2. Fill in the "Add New Admin" form:
   - Email address (must be valid)
   - Full name
   - Role (editor or super-admin)
3. Click "Add Admin"

The new admin will be added to the database and can immediately login using Google OAuth with that email.

### Via Database (Manual)

```javascript
db.admins.insertOne({
  email: "newadmin@example.com",
  name: "Admin Name",
  role: "editor", // or "super-admin"
  addedBy: "system",
  addedAt: new Date(),
  lastLogin: null,
  isActive: true
})
```

## Database Schema

### Admins Collection

```javascript
{
  _id: ObjectId,
  email: String,           // Unique, indexed
  name: String,
  role: String,            // "super-admin" or "editor"
  addedBy: String,         // Email of who added them
  addedAt: Date,
  lastLogin: Date,
  isActive: Boolean,
  deactivatedBy: String,   // Optional
  deactivatedAt: Date,     // Optional
  reactivatedBy: String,   // Optional
  reactivatedAt: Date      // Optional
}
```

## Security Features

1. **Database-driven permissions** - No hardcoded emails
2. **Active status check** - Inactive admins cannot login
3. **Role-based access control** - Editors can't access user management
4. **Self-protection** - Admins cannot deactivate themselves
5. **Audit trail** - Tracks who added/deactivated admins and when
6. **OAuth authentication** - Secure Google OAuth login required

## API Endpoints

### Admin Dashboard
- `GET /admin` - View dashboard (requires: admin)

### Lesson Management
- `GET /admin/lessons` - View all lessons (requires: admin)
- `GET /admin/lesson/:id/edit` - Edit lesson page (requires: admin)
- `POST /admin/lesson/:id/update` - Update lesson (requires: admin)

### User Management
- `GET /admin/users` - View all admins (requires: super-admin)
- `POST /admin/users/add` - Add new admin (requires: super-admin)
- `POST /admin/users/:id/deactivate` - Deactivate admin (requires: super-admin)
- `POST /admin/users/:id/reactivate` - Reactivate admin (requires: super-admin)

## Troubleshooting

### "Admin access required" error

**Cause:** User is not in the admins collection or is inactive

**Solution:**
1. Run the seed script: `node scripts/seed-admin.js`
2. Check MongoDB: `db.admins.find({ email: "your@email.com" })`
3. Ensure `isActive: true`

### Cannot add new admin

**Cause:** Not logged in as super-admin

**Solution:** Only super-admins can manage users. Login with a super-admin account.

### Seed script fails with connection error

**Cause:** MongoDB is not running

**Solution:**
- Start MongoDB locally: `mongod`
- Or update `.env` with MongoDB Atlas connection string

## Migration from Hardcoded Admin

The old system used a hardcoded email check:
```javascript
// OLD (removed)
if (req.user.email === 'emah84@gmail.com')
```

The new system uses database lookups:
```javascript
// NEW
const admin = await adminsCollection.findOne({
  email: req.user.email,
  isActive: true
});
```

All existing routes have been updated to use the new middleware.

## Next Steps

After setting up the admin system:

1. **Add team members** - Invite other admins via `/admin/users`
2. **Deploy to production** - Follow `ADMIN_DEPLOYMENT_ROADMAP.md`
3. **Set up backups** - Configure MongoDB backups for admin data
4. **Monitor activity** - Check admin activity logs periodically

## Production Checklist

Before deploying to Render/production:

- [ ] Run seed script to create first admin
- [ ] Test admin login flow
- [ ] Test adding new admins
- [ ] Test lesson editing as both roles
- [ ] Verify super-admin can manage users
- [ ] Verify editors cannot access user management
- [ ] Update MongoDB Atlas IP whitelist (0.0.0.0/0 for Render)
- [ ] Set all environment variables in Render dashboard

## Support

For issues or questions:
- Check logs: `console.error` messages indicate auth/permission issues
- Verify MongoDB connection: Ensure `DB_STRING` in `.env` is correct
- Review middleware: Check `middleware/auth.js` for permission logic
