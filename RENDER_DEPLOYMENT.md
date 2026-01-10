# Render.com Deployment Guide - Notes from the Majlis

Complete step-by-step guide to deploy the application to Render.com.

---

## Pre-Deployment Checklist

### ✅ Completed Items
- [x] Admin system implemented (database-driven)
- [x] Landing page fixed
- [x] Full CRUD for series and lessons
- [x] Authentication middleware updated
- [x] Environment variables documented

### 🔧 Before You Deploy

1. **MongoDB Atlas Setup** (if not already done)
   - Create a MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
   - Create a cluster (free tier is fine for testing)
   - Create a database user with password
   - Whitelist IP: `0.0.0.0/0` (allows connections from anywhere - required for Render)
   - Get connection string (looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`)

2. **Google OAuth Setup** (if not already done)
   - Go to: https://console.cloud.google.com/
   - Create project or use existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://your-app-name.onrender.com/auth/google/callback`
     - Keep localhost for development too

3. **GitHub OAuth Setup** (Optional)
   - Go to: https://github.com/settings/developers
   - Create new OAuth App
   - Set callback URL: `https://your-app-name.onrender.com/auth/github/callback`

4. **Session Secret Generation**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Save this output - you'll need it for environment variables.

---

## Deployment Steps

### Step 1: Create Render Account
1. Go to: https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `Mohamed-AH/dhassan`
3. Select the repository
4. Configure settings:

**Basic Settings:**
- **Name**: `notes-from-majlis` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your production branch)
- **Root Directory**: (leave blank)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Plan:**
- Select **Free** tier (for testing) or **Starter** ($7/month) for production

### Step 3: Configure Environment Variables

Click "Advanced" → "Add Environment Variable"

Add these environment variables (one by one):

| Key | Value | Example |
|-----|-------|---------|
| `NODE_ENV` | `production` | `production` |
| `DB_STRING` | Your MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/notes-from-majlis` |
| `SESSION_SECRET` | Random string from step above | `f23ee4c323271624ebe04f8a078a61311660e5f432e96c0e625fe47e093b1105` |
| `PRODUCTION_URL` | Your Render URL | `https://notes-from-majlis.onrender.com` |
| `DEVELOPMENT_URL` | Localhost URL | `http://localhost:8000` |
| `GOOGLE_CLIENT_ID` | From Google Console | `123456789-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | From Google Console | `GOCSPX-xxxxxxxxxxxxx` |
| `GITHUB_CLIENT_ID` | From GitHub Settings | `Iv1.xxxxxxxxxxxxx` (optional) |
| `GITHUB_CLIENT_SECRET` | From GitHub Settings | `xxxxxxxxxxxxx` (optional) |

**Important Notes:**
- Make sure `DB_STRING` includes the database name at the end
- `PRODUCTION_URL` should match your Render URL exactly (no trailing slash)
- Don't include quotes around the values

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will start building and deploying
3. Watch the logs in real-time
4. First deploy takes 3-5 minutes

### Step 5: Update OAuth Redirect URIs

Once deployed, update your OAuth apps:

**Google Cloud Console:**
1. Go to: https://console.cloud.google.com/
2. Navigate to: APIs & Services → Credentials
3. Click your OAuth client ID
4. Add to "Authorized redirect URIs":
   - `https://your-app-name.onrender.com/auth/google/callback`
5. Save

**GitHub (if using):**
1. Go to: https://github.com/settings/developers
2. Click your OAuth app
3. Update "Authorization callback URL":
   - `https://your-app-name.onrender.com/auth/github/callback`
4. Save

---

## Post-Deployment Tasks

### 1. Seed First Admin

**Option A: Using Render Shell**
1. In Render dashboard → Your service → "Shell"
2. Run:
   ```bash
   node scripts/seed-admin.js
   ```

**Option B: Locally (if MongoDB accessible)**
1. Update your local `.env` with production `DB_STRING`
2. Run:
   ```bash
   node scripts/seed-admin.js
   ```
3. Restore local `.env` to development settings

This creates the first super-admin: `emah84@gmail.com`

### 2. Test the Application

Visit your Render URL: `https://your-app-name.onrender.com`

**Test Checklist:**
- [ ] Homepage loads correctly
- [ ] Browse Topics page works
- [ ] Browse Series page works
- [ ] Individual lesson pages load
- [ ] Google OAuth login works
- [ ] Admin can access `/admin` dashboard
- [ ] Admin can edit lessons
- [ ] Admin can create/edit series
- [ ] Super-admin can manage users

### 3. Test Admin Functions

1. Login with `emah84@gmail.com` (via Google OAuth)
2. Go to `/admin` dashboard
3. Verify you see admin controls
4. Test editing a lesson
5. Test creating a series
6. Test adding another admin (if super-admin)

---

## Custom Domain (Optional)

### Using Your Own Domain

1. In Render dashboard → Your service → "Settings"
2. Scroll to "Custom Domain"
3. Click "Add Custom Domain"
4. Enter your domain (e.g., `notesfromthemajlis.com`)
5. Add DNS records in your domain registrar:
   - **CNAME**: `www` → `your-app-name.onrender.com`
   - **ANAME or ALIAS**: `@` → `your-app-name.onrender.com`
6. Wait for DNS propagation (5-60 minutes)
7. Update environment variables:
   - `PRODUCTION_URL` → `https://your-domain.com`
8. Update OAuth redirect URIs to use new domain

---

## Monitoring & Maintenance

### Check Application Logs
1. Render dashboard → Your service → "Logs"
2. Monitor for errors
3. Check startup logs for database connection

### Health Checks
Render automatically monitors your service:
- Expects HTTP 200 response
- Restarts if unhealthy
- Shows status in dashboard

### Auto-Deploy
Every push to your main branch triggers automatic deployment:
1. Render detects new commits
2. Rebuilds application
3. Deploys automatically
4. Zero-downtime deployment

### Backup Strategy
**MongoDB Atlas** (recommended):
- Enable automatic backups in Atlas
- Configure backup schedule
- Store backups for 7-30 days

**Manual Exports:**
```bash
# Export all collections
mongodump --uri="your_mongodb_connection_string" --out=./backup

# Export specific collection
mongoexport --uri="your_mongodb_connection_string" --collection=lessons --out=lessons.json
```

---

## Troubleshooting

### Issue: "Application failed to start"
**Check:**
- Environment variables are set correctly
- MongoDB connection string is valid
- MongoDB IP whitelist includes `0.0.0.0/0`
- All required dependencies in package.json

**Fix:**
1. Check Render logs for specific error
2. Verify all environment variables
3. Test MongoDB connection locally with production string

### Issue: "OAuth redirect mismatch"
**Check:**
- `PRODUCTION_URL` matches your actual Render URL
- OAuth apps have correct redirect URIs
- No trailing slashes in URLs

**Fix:**
1. Update `PRODUCTION_URL` in Render environment variables
2. Update redirect URIs in Google/GitHub
3. Redeploy if needed

### Issue: "Admin access denied"
**Check:**
- Admin was seeded in production database
- Using correct email for login
- Admin is marked as `isActive: true`

**Fix:**
```bash
# In Render shell:
node scripts/seed-admin.js

# Or check database directly in MongoDB Atlas
```

### Issue: "Session not persisting"
**Check:**
- `SESSION_SECRET` is set
- MongoDB connection is working
- `connect-mongo` sessions collection exists

**Fix:**
1. Verify `SESSION_SECRET` environment variable
2. Check MongoDB connection
3. Look for session errors in logs

### Issue: Free tier sleeps after inactivity
**Note:** Render free tier sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Consider **Starter plan** ($7/month) for always-on service

**Workaround:**
- Use uptime monitoring (pings every 5 minutes)
- Services: UptimeRobot, Pingdom (free tiers available)

---

## Performance Optimization

### Enable Compression
Already configured in your app (if using compression middleware).

### Database Indexing
Create indexes in MongoDB Atlas:
```javascript
// In MongoDB Atlas → Collections → Indexes
lessons: { seriesId: 1, lessonNumber: 1 }
series: { category: 1 }
admins: { email: 1 } (unique)
```

### Caching
Consider adding Redis for session storage (future enhancement).

---

## Security Checklist

- [x] `.env` file in `.gitignore`
- [x] SESSION_SECRET is random and secure
- [x] MongoDB IP whitelist configured
- [x] OAuth credentials are secret
- [x] HTTPS enforced (automatic on Render)
- [x] Sessions use httpOnly cookies
- [x] Admin authentication required for sensitive routes

---

## Cost Estimate

**Free Tier** (for testing):
- Render Web Service: Free
- MongoDB Atlas: Free (512 MB)
- **Total: $0/month**

**Production** (recommended):
- Render Starter: $7/month
- MongoDB Atlas M2: $9/month (or stick with free)
- Custom Domain: $10-15/year (optional)
- **Total: $7-16/month**

---

## Quick Deploy Checklist

```
□ MongoDB Atlas cluster created
□ Database user created
□ IP whitelist: 0.0.0.0/0
□ Connection string copied
□ Google OAuth credentials created
□ OAuth redirect URIs configured
□ Session secret generated
□ Render account created
□ GitHub repository connected
□ Environment variables set
□ Deploy button clicked
□ First admin seeded
□ OAuth tested
□ Admin panel tested
□ Custom domain configured (optional)
```

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **Application Logs**: Render Dashboard → Logs

---

## Next Steps After Deployment

1. ✅ Monitor application for 24 hours
2. ✅ Test all features in production
3. ✅ Add team members as admins
4. ✅ Import remaining lessons
5. ✅ Set up uptime monitoring
6. ✅ Configure domain (if desired)
7. ✅ Plan future features from roadmap

---

**Deployment Ready!** 🚀

Your application is now production-ready and can be deployed to Render in under 15 minutes.
