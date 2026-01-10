# Quick Deployment Checklist

Use this checklist to ensure smooth deployment to Render.

---

## Pre-Deployment (Do This First)

### MongoDB Atlas
- [ ] Create MongoDB Atlas account
- [ ] Create cluster (free M0 tier is fine)
- [ ] Create database user with password
- [ ] Whitelist IP: `0.0.0.0/0`
- [ ] Get connection string
- [ ] Test connection locally

### Google OAuth
- [ ] Go to Google Cloud Console
- [ ] Create/use project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Note Client ID and Client Secret
- [ ] Will add redirect URI after deployment

### Session Secret
- [ ] Generate secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Save the output

---

## Render Deployment

### Create Service
- [ ] Sign up at render.com
- [ ] New Web Service
- [ ] Connect GitHub repo: `Mohamed-AH/dhassan`
- [ ] Configure:
  - Name: `notes-from-majlis`
  - Branch: `main` or `claude/rebuild-with-anecdotal-stack-5oeCy`
  - Build: `npm install`
  - Start: `npm start`
  - Plan: Free or Starter

### Environment Variables
Add these in Render:

```
NODE_ENV=production
DB_STRING=mongodb+srv://username:password@cluster.mongodb.net/notes-from-majlis
SESSION_SECRET=[your generated secret]
PRODUCTION_URL=https://your-app.onrender.com
DEVELOPMENT_URL=http://localhost:8000
GOOGLE_CLIENT_ID=[from google console]
GOOGLE_CLIENT_SECRET=[from google console]
```

- [ ] All environment variables added
- [ ] Values pasted correctly (no quotes)
- [ ] DB_STRING includes database name

### Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (3-5 minutes)
- [ ] Check logs for errors
- [ ] Note your Render URL

---

## Post-Deployment

### Update OAuth
- [ ] Go to Google Cloud Console
- [ ] Add redirect URI: `https://your-app.onrender.com/auth/google/callback`
- [ ] Save changes

### Seed First Admin
Option 1 - Render Shell:
- [ ] Render Dashboard → Shell
- [ ] Run: `node scripts/seed-admin.js`

Option 2 - Local:
- [ ] Update local .env with production DB_STRING
- [ ] Run: `node scripts/seed-admin.js`
- [ ] Restore local .env

### Test Application
- [ ] Visit your Render URL
- [ ] Homepage loads
- [ ] Browse pages work
- [ ] Login with Google OAuth
- [ ] Access /admin (should work for emah84@gmail.com)
- [ ] Edit a lesson
- [ ] Create a series
- [ ] Add another admin

---

## Critical Environment Variables

**Required:**
- `NODE_ENV` → `production`
- `DB_STRING` → MongoDB connection string
- `SESSION_SECRET` → Random secure string
- `PRODUCTION_URL` → Your Render URL
- `GOOGLE_CLIENT_ID` → From Google Console
- `GOOGLE_CLIENT_SECRET` → From Google Console

**Optional:**
- `GITHUB_CLIENT_ID` → For GitHub OAuth
- `GITHUB_CLIENT_SECRET` → For GitHub OAuth
- `DEVELOPMENT_URL` → Not needed in production but harmless

---

## Common Issues & Quick Fixes

**"Application failed to start"**
→ Check: DB_STRING format, environment variables, logs

**"OAuth redirect mismatch"**
→ Update PRODUCTION_URL and Google OAuth redirect URI

**"Admin access denied"**
→ Run seed-admin script in production

**"Cannot connect to database"**
→ Check MongoDB Atlas IP whitelist is 0.0.0.0/0

---

## Deployment Time Estimate

- MongoDB setup: 10 minutes
- Google OAuth setup: 5 minutes
- Render configuration: 5 minutes
- First deployment: 3-5 minutes
- Post-deployment testing: 5 minutes

**Total: ~25-30 minutes**

---

## After Successful Deployment

- [ ] Monitor logs for 30 minutes
- [ ] Test all major features
- [ ] Bookmark admin URL
- [ ] Share public URL with team
- [ ] Set up uptime monitoring (optional)
- [ ] Plan content import strategy

---

**Ready to Deploy?** Follow RENDER_DEPLOYMENT.md for detailed steps!
