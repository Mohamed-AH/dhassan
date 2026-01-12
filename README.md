# Notes from the Majlis - Islamic Education Platform

A dedicated platform for managing and sharing Islamic educational content from Sheikh Hassan Dghriri's classes at Jami' Al-Wurud, Jeddah.

## Features

- 📚 **Series Management**: Organize courses by series (Tafsir, Hadith, Fiqh, Aqeedah, etc.)
- 📝 **Lesson Management**: Create and manage detailed lesson notes with timestamps
- 🔐 **Admin Panel**: Secure admin access with role-based permissions
- 🔍 **Browse & Search**: Easy navigation by topics and series
- 🌐 **Professional Design**: Clean, modern interface with Arabic typography support
- 🔒 **OAuth Authentication**: Secure login with Google
- 📱 **Responsive**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Backend**: Node.js + Express.js
- **Templating**: EJS (server-side rendering)
- **Database**: MongoDB
- **Authentication**: Passport.js (Google OAuth)
- **Session Management**: express-session with connect-mongo
- **Security**: Helmet.js with Content Security Policy
- **Testing**: Jest + Supertest
- **Frontend**: Vanilla JavaScript with modern CSS

## Project Structure

```
dhassan/
├── __tests__/              # Test suites
│   ├── admin-lessons.test.js
│   ├── admin-series.test.js
│   ├── authentication.test.js
│   ├── public-routes.test.js
│   ├── helpers.js         # Test utilities
│   └── setup.js           # Test configuration
├── config/
│   └── passport.js        # Passport OAuth configuration
├── middleware/
│   └── auth.js            # Authentication middleware
├── public/
│   └── css/
│       └── styles.css     # Main stylesheet
├── scripts/
│   ├── populate-db.js     # Database seeding script
│   └── import-lesson-wizard.js  # Interactive lesson import
├── views/
│   ├── landing.ejs            # Homepage
│   ├── login.ejs              # Login page
│   ├── topics.ejs             # Browse by topics
│   ├── series.ejs             # Browse series
│   ├── series-detail.ejs      # Series detail page
│   ├── lesson.ejs             # Lesson detail page
│   ├── admin-dashboard.ejs    # Admin dashboard
│   ├── admin-lessons.ejs      # Admin lessons management
│   ├── admin-lesson-edit.ejs  # Lesson editor
│   ├── admin-series.ejs       # Admin series management
│   ├── admin-series-edit.ejs  # Series editor
│   ├── admin-users.ejs        # User management
│   ├── profile.ejs            # User profile
│   └── error.ejs              # Error page
├── app.js                 # Express app configuration
├── server.js              # Main server entry point
├── package.json           # Dependencies
├── render.yaml            # Render deployment config
└── .env.example           # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Atlas account or local instance)
- Google OAuth credentials

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Mohamed-AH/dhassan.git
cd dhassan
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

4. **Edit `.env` and add your credentials:**
   - MongoDB connection string (get from MongoDB Atlas)
   - Session secret (generate random string)
   - Google OAuth credentials
   - Application URLs

5. **Run the development server:**
```bash
npm run dev
```

6. **Open your browser:**
```
http://localhost:8000
```

## Environment Variables

See `.env.example` for all required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_STRING` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `PORT` | Server port (optional) | `8000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `SESSION_SECRET` | Session encryption key | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `DEVELOPMENT_URL` | Local development URL | `http://localhost:8000` |
| `PRODUCTION_URL` | Production URL | `https://your-app.onrender.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | `http://localhost:8000/auth/google/callback` (dev) or `https://your-app.onrender.com/auth/google/callback` (prod) |

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Navigate to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - Development: `http://localhost:8000/auth/google/callback`
   - Production: `https://your-app.onrender.com/auth/google/callback`
7. Copy Client ID and Client Secret to your `.env` file

## Database Schema

### Series Collection
```javascript
{
  seriesId: String,           // URL-friendly ID (e.g., "sahih-bukhari-faith")
  titleEnglish: String,       // "Book of Faith - Sahih Al-Bukhari"
  titleArabic: String,        // Arabic title
  category: String,           // "Tafsir", "Hadith", "Fiqh", "Aqeedah", etc.
  author: String,             // Teacher name
  description: String,        // Series description
  status: String,             // "Ongoing", "Complete", "Paused"
  location: String,           // Teaching location
  telegramLink: String,       // Telegram channel link
  createdAt: Date,
  createdBy: String,
  updatedAt: Date,
  updatedBy: String
}
```

### Lessons Collection
```javascript
{
  seriesId: String,           // References series
  lessonNumber: Number,       // Sequential number
  titleEnglish: String,
  titleArabic: String,
  dateGregorian: Date,
  dateHijri: String,
  duration: String,           // "45 min"
  hadithsCovered: String,     // "Hadiths 1-5"
  hadithsDisplay: String,     // Display format
  bookNameEnglish: String,    // Source book
  bookAuthorEnglish: String,
  location: String,
  summary: String,            // Brief lesson summary
  notes: String,              // Full markdown notes
  chaptersCovered: [String],  // Array of chapter names
  timestamps: [{              // Audio timestamps
    time: String,
    description: String
  }],
  audioLink: String,
  telegramLink: String,
  whatsappLink: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Users Collection
```javascript
{
  email: String,
  name: String,
  avatar: String,
  provider: String,           // 'google'
  providerId: String,
  createdAt: Date,
  lastLogin: Date
}
```

### Admins Collection
```javascript
{
  email: String,
  role: String,               // 'super-admin' or 'editor'
  isActive: Boolean,
  createdAt: Date,
  createdBy: String,
  updatedAt: Date,
  updatedBy: String
}
```

## Available Scripts

- `npm start` - Run production server
- `npm run dev` - Run development server with nodemon
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run populate-db` - Seed database with sample data
- `npm run import-lesson` - Interactive lesson import wizard

## Testing

The application includes a comprehensive test suite with 72 tests covering:
- Public routes and navigation
- Admin CRUD operations for series
- Admin CRUD operations for lessons
- Authentication and authorization
- Role-based access control

Run tests with:
```bash
npm test
```

## Deployment to Render

### Step 1: Prepare Your Repository

1. Ensure all changes are committed and pushed to GitHub
2. Verify `render.yaml` exists in your repository root

### Step 2: Set Up MongoDB

1. Create a MongoDB Atlas account (if you don't have one)
2. Create a new cluster (free tier is fine)
3. Create a database user with password
4. Get your connection string (looks like: `mongodb+srv://user:password@cluster.mongodb.net/`)

### Step 3: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml` and show services to create
5. Review and click "Apply"

### Step 4: Configure Environment Variables

After deployment, go to your web service settings and add:

```
NODE_ENV=production
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-app.onrender.com/auth/google/callback
PRODUCTION_URL=https://your-app.onrender.com
SESSION_SECRET=your_random_secret_key_here
```

**Important:** Update your Google OAuth settings to include the production callback URL!

### Step 5: Seed the Database (Optional)

If you want to populate your database with sample data:

1. Go to Render Shell (in your service dashboard)
2. Run: `npm run populate-db`

### Alternative: Manual Deploy

If you prefer not to use `render.yaml`:

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Add environment variables as listed above
5. Create a MongoDB database on Render or use MongoDB Atlas
6. Deploy!

## Admin Access

To grant admin access to users:

1. User must first log in via Google OAuth
2. Manually add their email to the `admins` collection in MongoDB:

```javascript
db.admins.insertOne({
  email: "user@example.com",
  role: "super-admin",  // or "editor"
  isActive: true,
  createdAt: new Date(),
  createdBy: "system"
})
```

### Admin Roles

- **super-admin**: Full access including user management and deletion
- **editor**: Can create and edit content, but cannot delete or manage users

## Security Features

- Helmet.js for security headers
- Content Security Policy (CSP)
- Session encryption with secure cookies in production
- Rate limiting (recommended to add)
- Input validation and sanitization
- Role-based access control
- CORS configuration

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Author

Mohamed AH

## Acknowledgments

- Sheikh Hassan Dghriri for the invaluable Islamic teachings
- Jami' Al-Wurud community in Jeddah
- Built with inspiration for sharing beneficial knowledge
- All content is unofficial and should be verified from original sources

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Important Notice:** This is an unofficial student project. The content has not been reviewed or endorsed by Sheikh Hassan Dghriri. Always verify information from original audio recordings and consult the Sheikh directly for Islamic rulings.
