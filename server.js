const express = require("express");
const app = express();
const PORT = 8000;
const cors = require("cors");
require('dotenv').config();

const bodyParser = require("body-parser");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { MongoClient, ObjectId } = require("mongodb");
const { isAuthenticated, isOwner, injectUser } = require('./middleware/auth');

// Set view engine
app.set("view engine", "ejs");

// Trust first proxy (required for Render, Railway, Heroku, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_URL : process.env.DEVELOPMENT_URL,
  credentials: true
}));

// Input validation helper
const validateNoteInput = (content) => {
  const errors = [];

  if (!content || content.trim().length === 0) {
    errors.push("Note content is required");
  } else if (content.trim().length < 10) {
    errors.push("Note must be at least 10 characters long");
  } else if (content.trim().length > 10000) {
    errors.push("Note must be less than 10000 characters");
  }

  return errors;
};

// Sanitize input
const sanitizeInput = (text) => {
  return text ? text.trim().replace(/[<>]/g, '') : '';
};

let dbConnectionStr = process.env.DB_STRING;

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
  .then((client) => {
    console.log("✅ Connected to Database");

    // Debug: Log environment configuration
    console.log("\n🔍 Environment Configuration:");
    console.log("NODE_ENV:", process.env.NODE_ENV || "NOT SET");
    console.log("DEVELOPMENT_URL:", process.env.DEVELOPMENT_URL || "NOT SET");
    console.log("PRODUCTION_URL:", process.env.PRODUCTION_URL || "NOT SET");
    console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "✅ Set" : "❌ NOT SET");
    console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ NOT SET");
    console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ NOT SET");
    console.log("GITHUB_CLIENT_ID:", process.env.GITHUB_CLIENT_ID ? "✅ Set" : "❌ NOT SET");
    console.log("GITHUB_CLIENT_SECRET:", process.env.GITHUB_CLIENT_SECRET ? "✅ Set" : "❌ NOT SET");

    const callbackURL = (process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_URL : process.env.DEVELOPMENT_URL);
    console.log("\n🔗 OAuth Callback URLs will be:");
    console.log("Google:", `${callbackURL}/auth/google/callback`);
    console.log("GitHub:", `${callbackURL}/auth/github/callback\n`);

    const db = client.db("notes-from-majlis");
    const seriesCollection = db.collection("series");
    const lessonsCollection = db.collection("lessons");
    const usersCollection = db.collection("users");

    // Session configuration
    const sessionConfig = {
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: client,
        dbName: 'notes-from-majlis',
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60 // 14 days
      }),
      cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'lax'
      }
    };

    console.log("\n🍪 Session Configuration:");
    console.log("Cookie secure:", sessionConfig.cookie.secure);
    console.log("Cookie httpOnly:", sessionConfig.cookie.httpOnly);
    console.log("Cookie sameSite:", sessionConfig.cookie.sameSite);
    console.log("Trust proxy:", app.get('trust proxy'), "\n");

    app.use(session(sessionConfig));

    // Initialize Passport
    const passport = require('./config/passport')(db);
    app.use(passport.initialize());
    app.use(passport.session());

    // Make user available in all templates
    app.use(injectUser);

    // ===== AUTHENTICATION ROUTES =====

    // Login page
    app.get("/login", (req, res) => {
      if (req.isAuthenticated()) {
        return res.redirect('/');
      }
      res.render("login.ejs");
    });

    // Google OAuth
    app.get("/auth/google", (req, res, next) => {
      console.log("🔵 Initiating Google OAuth...");
      passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
    });

    app.get("/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/login" }),
      (req, res) => {
        console.log("✅ Google OAuth successful");
        console.log("User:", req.user?.email);
        console.log("Session ID:", req.sessionID);
        console.log("Is Authenticated:", req.isAuthenticated());
        res.redirect("/");
      }
    );

    // GitHub OAuth
    app.get("/auth/github", (req, res, next) => {
      console.log("🔵 Initiating GitHub OAuth...");
      passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
    });

    app.get("/auth/github/callback",
      passport.authenticate("github", { failureRedirect: "/login" }),
      (req, res) => {
        console.log("✅ GitHub OAuth successful");
        console.log("User:", req.user?.email || req.user?.name);
        console.log("Session ID:", req.sessionID);
        console.log("Is Authenticated:", req.isAuthenticated());
        res.redirect("/");
      }
    );

    // Logout
    app.get("/auth/logout", (req, res) => {
      req.logout((err) => {
        if (err) {
          console.error('Logout error:', err);
        }
        res.redirect("/");
      });
    });

    // Get current user info (API)
    app.get("/api/auth/user", (req, res) => {
      if (req.isAuthenticated()) {
        res.json({
          success: true,
          user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatar: req.user.avatar,
            provider: req.user.provider
          }
        });
      } else {
        res.json({
          success: false,
          user: null
        });
      }
    });

    // ===== PAGE ROUTES =====

    // Landing page
    app.get("/", async (req, res) => {
      console.log("🏠 Landing page accessed");
      console.log("Session ID:", req.sessionID);
      console.log("Is Authenticated:", req.isAuthenticated());
      console.log("User:", req.user ? req.user.email || req.user.name : "Not logged in");

      try {
        const recentLessons = await lessonsCollection
          .find()
          .sort({ date: -1 })
          .limit(6)
          .toArray();

        const totalSeries = await seriesCollection.countDocuments();
        const totalLessons = await lessonsCollection.countDocuments();

        res.render("landing.ejs", {
          recentLessons,
          totalSeries,
          totalLessons
        });
      } catch (error) {
        console.error(error);
        res.status(500).render("error.ejs", { message: "Failed to load content" });
      }
    });

    // Browse by Topics page
    app.get("/topics", async (req, res) => {
      try {
        const allSeries = await seriesCollection
          .find()
          .sort({ category: 1, titleEnglish: 1 })
          .toArray();

        // Group series by category
        const seriesByCategory = {};
        allSeries.forEach(series => {
          if (!seriesByCategory[series.category]) {
            seriesByCategory[series.category] = [];
          }
          seriesByCategory[series.category].push(series);
        });

        res.render("topics.ejs", {
          seriesByCategory
        });
      } catch (error) {
        console.error(error);
        res.status(500).render("error.ejs", { message: "Failed to load topics" });
      }
    });

    // Browse by Series page
    app.get("/series", async (req, res) => {
      try {
        const category = req.query.category || "";

        let query = {};
        if (category) {
          query.category = category;
        }

        const allSeries = await seriesCollection
          .find(query)
          .sort({ titleEnglish: 1 })
          .toArray();

        // Get latest lesson for each series
        for (let series of allSeries) {
          const latestLesson = await lessonsCollection
            .find({ seriesId: series.seriesId })
            .sort({ date: -1 })
            .limit(1)
            .toArray();

          if (latestLesson.length > 0) {
            series.latestLesson = latestLesson[0];
          }
        }

        res.render("series.ejs", {
          allSeries,
          selectedCategory: category
        });
      } catch (error) {
        console.error(error);
        res.status(500).render("error.ejs", { message: "Failed to load series" });
      }
    });

    // Individual Series page
    app.get("/series/:seriesId", async (req, res) => {
      try {
        const { seriesId } = req.params;

        const series = await seriesCollection.findOne({ seriesId });

        if (!series) {
          return res.status(404).render("error.ejs", { message: "Series not found" });
        }

        const lessons = await lessonsCollection
          .find({ seriesId })
          .sort({ lessonNumber: 1 })
          .toArray();

        res.render("series-detail.ejs", {
          series,
          lessons
        });
      } catch (error) {
        console.error(error);
        res.status(500).render("error.ejs", { message: "Failed to load series" });
      }
    });

    // Individual Lesson page
    app.get("/lesson/:lessonId", async (req, res) => {
      try {
        const { lessonId } = req.params;

        if (!ObjectId.isValid(lessonId)) {
          return res.status(404).render("error.ejs", { message: "Lesson not found" });
        }

        const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) });

        if (!lesson) {
          return res.status(404).render("error.ejs", { message: "Lesson not found" });
        }

        const series = await seriesCollection.findOne({ seriesId: lesson.seriesId });

        // Get previous and next lessons
        const previousLesson = await lessonsCollection.findOne({
          seriesId: lesson.seriesId,
          lessonNumber: lesson.lessonNumber - 1
        });

        const nextLesson = await lessonsCollection.findOne({
          seriesId: lesson.seriesId,
          lessonNumber: lesson.lessonNumber + 1
        });

        res.render("lesson.ejs", {
          lesson,
          series,
          previousLesson,
          nextLesson
        });
      } catch (error) {
        console.error(error);
        res.status(500).render("error.ejs", { message: "Failed to load lesson" });
      }
    });

    // Write page (requires authentication)
    app.get("/write", isAuthenticated, (req, res) => {
      res.render("write.ejs");
    });

    // User profile page
    app.get("/profile", isAuthenticated, async (req, res) => {
      try {
        const userNotes = await notesCollection
          .find({ userId: req.user._id })
          .sort({ createdAt: -1 })
          .toArray();

        res.render("profile.ejs", {
          profileUser: req.user,
          notes: userNotes,
          isOwnProfile: true
        });
      } catch (error) {
        console.error(error);
        res.status(500).render("error.ejs", { message: "Failed to load profile" });
      }
    });

    // Public profile page
    app.get("/profile/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        if (!ObjectId.isValid(userId)) {
          return res.status(404).render("error.ejs", { message: "User not found" });
        }

        const profileUser = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (!profileUser) {
          return res.status(404).render("error.ejs", { message: "User not found" });
        }

        const userNotes = await notesCollection
          .find({ userId: new ObjectId(userId) })
          .sort({ createdAt: -1 })
          .toArray();

        const isOwnProfile = req.isAuthenticated() && req.user._id.toString() === userId;

        res.render("profile.ejs", {
          profileUser,
          notes: userNotes,
          isOwnProfile
        });
      } catch (error) {
        console.error(error);
        res.status(500).render("error.ejs", { message: "Failed to load profile" });
      }
    });

    // ===== NOTES API ROUTES =====

    // Create new note (requires authentication)
    app.post("/api/notes", isAuthenticated, async (req, res) => {
      const { title, content, category, tags } = req.body;

      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          errors: ["Title is required"]
        });
      }

      const errors = validateNoteInput(content);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors
        });
      }

      const newNote = {
        title: sanitizeInput(title),
        content: sanitizeInput(content),
        category: category || "General",
        tags: tags ? sanitizeInput(tags) : "",
        userId: req.user._id,
        userName: req.user.name,
        userEmail: req.user.email,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      try {
        const result = await notesCollection.insertOne(newNote);

        // Update user's notes count
        await usersCollection.updateOne(
          { _id: req.user._id },
          { $inc: { notesCount: 1 } }
        );

        res.json({
          success: true,
          message: "Note created successfully",
          noteId: result.insertedId
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          errors: ["Failed to create note"]
        });
      }
    });

    // Update note by ID (requires ownership)
    app.put("/api/notes/:id", isOwner(notesCollection), async (req, res) => {
      const { id } = req.params;
      const { title, content, category, tags } = req.body;

      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          errors: ["Title is required"]
        });
      }

      const errors = validateNoteInput(content);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors
        });
      }

      try {
        await notesCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              title: sanitizeInput(title),
              content: sanitizeInput(content),
              category: category || "General",
              tags: tags ? sanitizeInput(tags) : "",
              updatedAt: new Date()
            }
          }
        );

        res.json({
          success: true,
          message: "Note updated successfully"
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          errors: ["Failed to update note"]
        });
      }
    });

    // Delete note by ID (requires ownership)
    app.delete("/api/notes/:id", isOwner(notesCollection), async (req, res) => {
      const { id } = req.params;

      try {
        await notesCollection.deleteOne({ _id: new ObjectId(id) });

        // Update user's notes count
        await usersCollection.updateOne(
          { _id: req.user._id },
          { $inc: { notesCount: -1 } }
        );

        res.json({
          success: true,
          message: "Note deleted successfully"
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          errors: ["Failed to delete note"]
        });
      }
    });

    // Get statistics
    app.get("/api/stats", (req, res) => {
      Promise.all([
        notesCollection.countDocuments(),
        usersCollection.countDocuments()
      ])
        .then(([totalNotes, totalUsers]) => {
          res.json({
            totalNotes,
            totalUsers
          });
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ error: "Failed to fetch stats" });
        });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).render("error.ejs", {
        message: "Page not found"
      });
    });

    app.listen(process.env.PORT || PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  });
