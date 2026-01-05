# Dhassan - Islamic Study Platform

منصة دحسن للدراسات الإسلامية - A dedicated platform for Islamic studies, note-taking, and sharing beneficial knowledge.

## Features

- 📝 **Note Taking**: Create and organize your Islamic study notes
- 🔐 **OAuth Authentication**: Secure login with Google and GitHub
- 🏷️ **Categorization**: Organize notes by topics (Quran, Hadith, Fiqh, Aqeedah, etc.)
- 🔍 **Search & Filter**: Easily find and browse notes
- 👤 **User Profiles**: Personal library for each user
- 🌙 **Islamic Aesthetic**: Beautiful Arabic typography and Islamic design

## Tech Stack

- **Backend**: Node.js + Express
- **Templating**: EJS (server-side rendering)
- **Database**: MongoDB
- **Authentication**: Passport.js (Google OAuth, GitHub OAuth)
- **Session Management**: express-session with connect-mongo
- **Frontend**: Vanilla JavaScript (no frameworks!)
- **Styling**: Pure CSS with RTL Arabic support

## Project Structure

```
dhassan/
├── config/
│   └── passport.js          # Passport OAuth configuration
├── middleware/
│   └── auth.js              # Authentication middleware
├── public/
│   ├── css/
│   │   └── styles.css       # Main stylesheet
│   └── js/
│       ├── landing.js       # Landing page scripts
│       ├── notes.js         # Notes page scripts
│       ├── write.js         # Write page scripts
│       └── profile.js       # Profile page scripts
├── views/
│   ├── landing.ejs          # Homepage
│   ├── login.ejs            # Login page
│   ├── notes.ejs            # Notes library
│   ├── write.ejs            # Create note page
│   ├── profile.ejs          # User profile
│   └── error.ejs            # Error page
├── server.js                # Main Express server
├── package.json             # Dependencies
└── .env.example             # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google OAuth credentials
- GitHub OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Mohamed-AH/dhassan.git
cd dhassan
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your credentials:
   - MongoDB connection string
   - Session secret
   - Google OAuth credentials
   - GitHub OAuth credentials
   - Application URLs

5. Run the development server:
```bash
npm run dev
```

6. Open your browser and navigate to:
```
http://localhost:8000
```

## Environment Variables

See `.env.example` for all required environment variables:

- `DB_STRING`: MongoDB connection string
- `SESSION_SECRET`: Random string for session encryption
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: GitHub OAuth
- `DEVELOPMENT_URL` & `PRODUCTION_URL`: Application URLs

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8000/auth/google/callback`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:8000/auth/github/callback`

## Database Schema

### Users Collection
```javascript
{
  email: String,
  name: String,
  avatar: String,
  provider: String, // 'google' or 'github'
  providerId: String,
  createdAt: Date,
  lastLogin: Date,
  notesCount: Number
}
```

### Notes Collection
```javascript
{
  title: String,
  content: String,
  category: String, // 'Quran', 'Hadith', 'Fiqh', etc.
  tags: String,
  userId: ObjectId,
  userName: String,
  userEmail: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Available Scripts

- `npm start`: Run production server
- `npm run dev`: Run development server with nodemon
- `npm test`: Run tests (not implemented yet)

## Deployment

### Render.com

1. Create a new Web Service
2. Connect your GitHub repository
3. Set environment variables in Render dashboard
4. Deploy!

### Railway.app

1. Create a new project
2. Connect your GitHub repository
3. Add environment variables
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Author

Mohamed AH

## Acknowledgments

- Built with inspiration from the [Anecdotal](https://github.com/Mohamed-AH/anecdotal) project
- Islamic aesthetic design focused on Arabic typography
- RTL (Right-to-Left) support for Arabic content
