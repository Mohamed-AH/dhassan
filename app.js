/**
 * Express Application Configuration
 * Exports a function that creates and configures the Express app
 * Can be used by both the server and tests
 */

const express = require("express");
const cors = require("cors");
require('dotenv').config();

const bodyParser = require("body-parser");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { ObjectId } = require("mongodb");
const { isAuthenticated, isOwner, injectUser, isAdmin, isSuperAdmin } = require('./middleware/auth');

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

/**
 * Creates and configures the Express application
 * @param {Object} collections - MongoDB collections
 * @param {Object} collections.seriesCollection - Series collection
 * @param {Object} collections.lessonsCollection - Lessons collection
 * @param {Object} collections.usersCollection - Users collection
 * @param {Object} collections.notesCollection - Notes collection
 * @param {Object} collections.adminsCollection - Admins collection
 * @param {Object} mongoClient - MongoDB client (for session store)
 * @param {Function} testMiddleware - Optional middleware for testing (injected before routes)
 * @returns {Object} Configured Express app
 */
function createApp(collections, mongoClient, testMiddleware = null) {
  const {
    seriesCollection,
    lessonsCollection,
    usersCollection,
    notesCollection,
    adminsCollection
  } = collections;

  const app = express();

  // Set view engine
  app.set("view engine", "ejs");

  // Trust first proxy (required for Render, Railway, Heroku, etc.)
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // Middleware
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(express.static("public"));
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_URL : process.env.DEVELOPMENT_URL,
    credentials: true
  }));

  // Session configuration (skip in test mode if no mongoClient)
  if (mongoClient) {
    const sessionConfig = {
      secret: process.env.SESSION_SECRET || 'test-secret-key',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: mongoClient,
        dbName: process.env.NODE_ENV === 'test' ? 'dhassan-test' : 'notes-from-majlis',
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

    app.use(session(sessionConfig));

    // Initialize Passport (only if not in test mode or if testing auth)
    const db = mongoClient.db(process.env.NODE_ENV === 'test' ? 'dhassan-test' : 'notes-from-majlis');
    const passport = require('./config/passport')(db);
    app.use(passport.initialize());
    app.use(passport.session());

    // Make user available in all templates (with admin check)
    app.use(injectUser(adminsCollection));

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
      if (process.env.NODE_ENV !== 'test') {
        console.log("🔵 Initiating Google OAuth...");
      }
      passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
    });

    app.get("/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/login" }),
      (req, res) => {
        if (process.env.NODE_ENV !== 'test') {
          console.log("✅ Google OAuth successful");
          console.log("User:", req.user?.email);
        }
        res.redirect("/");
      }
    );

    // GitHub OAuth
    app.get("/auth/github", (req, res, next) => {
      if (process.env.NODE_ENV !== 'test') {
        console.log("🔵 Initiating GitHub OAuth...");
      }
      passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
    });

    app.get("/auth/github/callback",
      passport.authenticate("github", { failureRedirect: "/login" }),
      (req, res) => {
        if (process.env.NODE_ENV !== 'test') {
          console.log("✅ GitHub OAuth successful");
          console.log("User:", req.user?.email || req.user?.name);
        }
        res.redirect("/");
      }
    );

    // Logout
    app.get("/auth/logout", (req, res) => {
      req.logout((err) => {
        if (err && process.env.NODE_ENV !== 'test') {
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
  } else {
    // Test mode without session/passport - use provided test middleware or default
    if (testMiddleware) {
      app.use(testMiddleware);
    } else {
      // Default: unauthenticated user
      app.use((req, res, next) => {
        req.isAuthenticated = () => false;
        req.user = null;
        res.locals.user = null;
        res.locals.isAuthenticated = false;
        res.locals.isAdmin = false;
        res.locals.adminRole = null;
        next();
      });
    }
  }

  // ===== PAGE ROUTES =====

  // Landing page
  app.get("/", async (req, res) => {
    try {
      const recentLessons = await lessonsCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();

      const allSeries = await seriesCollection
        .find()
        .sort({ category: 1, titleEnglish: 1 })
        .toArray();

      const featuredSeries = await seriesCollection
        .find()
        .limit(3)
        .toArray();

      res.render("landing.ejs", {
        recentLessons,
        allSeries,
        featuredSeries
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error.ejs", { message: "Failed to load page" });
    }
  });

  // Topics page
  app.get("/topics", async (req, res) => {
    try {
      const allSeries = await seriesCollection
        .find()
        .sort({ category: 1, titleEnglish: 1 })
        .toArray();

      const categorizedSeries = {};
      allSeries.forEach(series => {
        const category = series.category || 'Other';
        if (!categorizedSeries[category]) {
          categorizedSeries[category] = [];
        }
        categorizedSeries[category].push(series);
      });

      res.render("topics.ejs", {
        categorizedSeries
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error.ejs", { message: "Failed to load topics" });
    }
  });

  // Series listing page
  app.get("/series", async (req, res) => {
    try {
      const allSeries = await seriesCollection
        .find()
        .sort({ category: 1, titleEnglish: 1 })
        .toArray();

      res.render("series.ejs", {
        allSeries
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error.ejs", { message: "Failed to load series" });
    }
  });

  // Series detail page
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

  // Lesson detail page
  app.get("/lesson/:seriesId/:lessonNumber", async (req, res) => {
    try {
      const { seriesId, lessonNumber } = req.params;

      const series = await seriesCollection.findOne({ seriesId });
      if (!series) {
        return res.status(404).render("error.ejs", { message: "Series not found" });
      }

      const lesson = await lessonsCollection.findOne({
        seriesId,
        lessonNumber: parseInt(lessonNumber)
      });

      if (!lesson) {
        return res.status(404).render("error.ejs", { message: "Lesson not found" });
      }

      const allLessons = await lessonsCollection
        .find({ seriesId })
        .sort({ lessonNumber: 1 })
        .toArray();

      res.render("lesson.ejs", {
        series,
        lesson,
        allLessons
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error.ejs", { message: "Failed to load lesson" });
    }
  });

  // ===== ADMIN ROUTES =====

  // Admin dashboard
  app.get("/admin", isAdmin(adminsCollection), async (req, res) => {
    try {
      const allSeries = await seriesCollection.find().sort({ category: 1, titleEnglish: 1 }).toArray();
      const totalLessons = await lessonsCollection.countDocuments();
      const totalUsers = await usersCollection.countDocuments();
      const totalAdmins = await adminsCollection.countDocuments();

      res.render("admin.ejs", {
        allSeries,
        totalLessons,
        totalUsers,
        totalAdmins,
        currentAdmin: req.admin
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error.ejs", { message: "Failed to load admin dashboard" });
    }
  });

  // Admin lessons list
  app.get("/admin/lessons", isAdmin(adminsCollection), async (req, res) => {
    try {
      const allLessons = await lessonsCollection
        .find()
        .sort({ seriesId: 1, lessonNumber: 1 })
        .toArray();

      const seriesMap = {};
      const allSeries = await seriesCollection.find().toArray();
      allSeries.forEach(s => {
        seriesMap[s.seriesId] = s.titleEnglish;
      });

      res.render("admin-lessons.ejs", {
        allLessons,
        seriesMap,
        currentAdmin: req.admin
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error.ejs", { message: "Failed to load lessons" });
    }
  });

  // Admin lesson edit page
  app.get("/admin/lesson/:lessonId/edit", isAdmin(adminsCollection), async (req, res) => {
    try {
      const { lessonId } = req.params;

      if (!ObjectId.isValid(lessonId)) {
        return res.status(400).render("error.ejs", { message: "Invalid lesson ID" });
      }

      const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) });

      if (!lesson) {
        return res.status(404).render("error.ejs", { message: "Lesson not found" });
      }

      const series = await seriesCollection.findOne({ seriesId: lesson.seriesId });

      res.render("admin-lesson-edit.ejs", {
        lesson,
        series,
        currentAdmin: req.admin,
        adminRole: req.admin.role
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error.ejs", { message: "Failed to load lesson" });
    }
  });

  // Admin lesson update
  app.post("/admin/lesson/:lessonId/update", isAdmin(adminsCollection), async (req, res) => {
    try {
      const { lessonId } = req.params;
      const {
        titleEnglish,
        titleArabic,
        hadithsDisplay,
        duration,
        dateGregorian,
        lessonNumber,
        notes
      } = req.body;

      if (!ObjectId.isValid(lessonId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid lesson ID"
        });
      }

      if (!titleEnglish || titleEnglish.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: "Title (English) is required"
        });
      }

      const MarkdownParser = require('./scripts/markdown-parser');
      const parser = new MarkdownParser(notes, true);
      const parsed = parser.parseAll();

      const updateFields = {
        titleEnglish: titleEnglish.trim(),
        titleArabic: titleArabic ? titleArabic.trim() : '',
        hadithsDisplay: hadithsDisplay ? hadithsDisplay.trim() : '',
        duration: duration ? duration.trim() : '',
        lessonNumber: parseInt(lessonNumber),
        notes: notes.trim(),
        chapters: parsed.chapters,
        timestamps: parsed.timestamps,
        updatedAt: new Date(),
        updatedBy: req.user.email
      };

      if (dateGregorian) {
        updateFields.dateGregorian = new Date(dateGregorian);
      }

      await lessonsCollection.updateOne(
        { _id: new ObjectId(lessonId) },
        { $set: updateFields }
      );

      res.json({ success: true, message: "Lesson updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Failed to update lesson"
      });
    }
  });

  // Admin lesson delete
  app.delete("/admin/lesson/:lessonId/delete", isSuperAdmin(adminsCollection), async (req, res) => {
    try {
      const { lessonId } = req.params;

      if (!ObjectId.isValid(lessonId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid lesson ID"
        });
      }

      const result = await lessonsCollection.deleteOne({ _id: new ObjectId(lessonId) });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          error: "Lesson not found"
        });
      }

      if (process.env.NODE_ENV !== 'test') {
        console.log(`Lesson ${lessonId} deleted by ${req.admin.email}`);
      }

      res.json({
        success: true,
        message: "Lesson deleted successfully"
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Failed to delete lesson"
      });
    }
  });

  // Admin series list
  app.get("/admin/series", isAdmin(adminsCollection), async (req, res) => {
    try {
      const allSeries = await seriesCollection.find().sort({ category: 1, titleEnglish: 1 }).toArray();

      for (const series of allSeries) {
        const count = await lessonsCollection.countDocuments({ seriesId: series.seriesId });
        series.actualLessonCount = count;
      }

      res.render("admin-series.ejs", {
        allSeries,
        currentAdmin: req.admin,
        adminRole: req.admin.role
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error.ejs", { message: "Failed to load series" });
    }
  });

  // Admin series create page
  app.get("/admin/series/new", isAdmin(adminsCollection), (req, res) => {
    res.render("admin-series-edit.ejs", {
      series: null,
      isNew: true,
      currentAdmin: req.admin,
      adminRole: req.admin.role
    });
  });

  // Admin series edit page
  app.get("/admin/series/:seriesId/edit", isAdmin(adminsCollection), async (req, res) => {
    try {
      const { seriesId } = req.params;
      const series = await seriesCollection.findOne({ seriesId });

      if (!series) {
        return res.status(404).render("error.ejs", { message: "Series not found" });
      }

      res.render("admin-series-edit.ejs", {
        series,
        isNew: false,
        currentAdmin: req.admin,
        adminRole: req.admin.role
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error.ejs", { message: "Failed to load series" });
    }
  });

  // Admin series create
  app.post("/admin/series/create", isAdmin(adminsCollection), async (req, res) => {
    try {
      const { seriesId, titleEnglish, titleArabic, category, author, description, status, location, telegramLink } = req.body;

      if (!seriesId || !titleEnglish || !category) {
        return res.status(400).json({
          success: false,
          error: "Series ID, Title (English), and Category are required"
        });
      }

      const existing = await seriesCollection.findOne({ seriesId: seriesId.trim() });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: "Series ID already exists. Please use a unique ID."
        });
      }

      const newSeries = {
        seriesId: seriesId.trim(),
        titleEnglish: titleEnglish.trim(),
        titleArabic: titleArabic ? titleArabic.trim() : '',
        category: category.trim(),
        author: author ? author.trim() : 'Sheikh Hassan bin Muhammad Mansur Ad-Daghriri',
        description: description ? description.trim() : '',
        status: status || 'Ongoing',
        totalLessons: 0,
        location: location ? location.trim() : 'Jami\' Al-Wurud, Al-Wurud District, Jeddah',
        telegramLink: telegramLink ? telegramLink.trim() : null,
        createdAt: new Date(),
        createdBy: req.user.email,
        updatedAt: new Date()
      };

      await seriesCollection.insertOne(newSeries);

      res.json({ success: true, message: "Series created successfully", seriesId: newSeries.seriesId });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Failed to create series"
      });
    }
  });

  // Admin series update
  app.post("/admin/series/:seriesId/update", isAdmin(adminsCollection), async (req, res) => {
    try {
      const { seriesId } = req.params;
      const { titleEnglish, titleArabic, category, author, description, status, location, telegramLink } = req.body;

      if (!titleEnglish || !category) {
        return res.status(400).json({
          success: false,
          error: "Title (English) and Category are required"
        });
      }

      const updateFields = {
        titleEnglish: titleEnglish.trim(),
        titleArabic: titleArabic ? titleArabic.trim() : '',
        category: category.trim(),
        author: author ? author.trim() : '',
        description: description ? description.trim() : '',
        status: status || 'Ongoing',
        location: location ? location.trim() : '',
        telegramLink: telegramLink ? telegramLink.trim() : null,
        updatedAt: new Date(),
        updatedBy: req.user.email
      };

      await seriesCollection.updateOne(
        { seriesId },
        { $set: updateFields }
      );

      res.json({ success: true, message: "Series updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Failed to update series"
      });
    }
  });

  // Admin series delete
  app.delete("/admin/series/:seriesId/delete", isSuperAdmin(adminsCollection), async (req, res) => {
    try {
      const { seriesId } = req.params;

      const lessonCount = await lessonsCollection.countDocuments({ seriesId });
      if (lessonCount > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete series. It has ${lessonCount} lesson(s). Delete all lessons first.`
        });
      }

      const result = await seriesCollection.deleteOne({ seriesId });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          error: "Series not found"
        });
      }

      if (process.env.NODE_ENV !== 'test') {
        console.log(`Series ${seriesId} deleted by ${req.admin.email}`);
      }

      res.json({ success: true, message: "Series deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Failed to delete series"
      });
    }
  });

  // Admin users/admins management
  app.get("/admin/users", isSuperAdmin(adminsCollection), async (req, res) => {
    try {
      const allAdmins = await adminsCollection.find().sort({ createdAt: -1 }).toArray();
      const allUsers = await usersCollection.find().sort({ createdAt: -1 }).limit(50).toArray();

      res.render("admin-users.ejs", {
        allAdmins,
        allUsers,
        currentAdmin: req.admin
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error.ejs", { message: "Failed to load users" });
    }
  });

  // Admin: Add new admin
  app.post("/admin/users/add-admin", isSuperAdmin(adminsCollection), async (req, res) => {
    try {
      const { email, role } = req.body;

      if (!email || !role) {
        return res.status(400).json({
          success: false,
          error: "Email and role are required"
        });
      }

      if (!['super-admin', 'editor'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: "Invalid role. Must be 'super-admin' or 'editor'"
        });
      }

      const existing = await adminsCollection.findOne({ email: email.trim() });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: "This email is already an admin"
        });
      }

      const newAdmin = {
        email: email.trim(),
        role: role,
        createdAt: new Date(),
        createdBy: req.admin.email
      };

      await adminsCollection.insertOne(newAdmin);

      res.json({ success: true, message: "Admin added successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Failed to add admin"
      });
    }
  });

  // Admin: Update admin role
  app.post("/admin/users/update-admin-role", isSuperAdmin(adminsCollection), async (req, res) => {
    try {
      const { email, role } = req.body;

      if (!email || !role) {
        return res.status(400).json({
          success: false,
          error: "Email and role are required"
        });
      }

      if (!['super-admin', 'editor'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: "Invalid role"
        });
      }

      if (email === req.admin.email) {
        return res.status(400).json({
          success: false,
          error: "You cannot change your own role"
        });
      }

      await adminsCollection.updateOne(
        { email },
        { $set: { role, updatedAt: new Date(), updatedBy: req.admin.email } }
      );

      res.json({ success: true, message: "Admin role updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Failed to update admin role"
      });
    }
  });

  // Admin: Remove admin
  app.delete("/admin/users/remove-admin", isSuperAdmin(adminsCollection), async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email is required"
        });
      }

      if (email === req.admin.email) {
        return res.status(400).json({
          success: false,
          error: "You cannot remove yourself as an admin"
        });
      }

      const result = await adminsCollection.deleteOne({ email });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          error: "Admin not found"
        });
      }

      res.json({ success: true, message: "Admin removed successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Failed to remove admin"
      });
    }
  });

  // ===== LEGACY/FUTURE NOTES ROUTES =====

  // Get all notes
  app.get("/api/notes", (req, res) => {
    notesCollection
      .find()
      .sort({ createdAt: -1 })
      .toArray()
      .then((notes) => {
        res.json(notes);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch notes" });
      });
  });

  // Get user's notes
  app.get("/api/notes/my-notes", isAuthenticated, (req, res) => {
    notesCollection
      .find({ userId: req.user._id.toString() })
      .sort({ createdAt: -1 })
      .toArray()
      .then((notes) => {
        res.json(notes);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch your notes" });
      });
  });

  // Create note
  app.post("/api/notes", isAuthenticated, (req, res) => {
    const { content } = req.body;
    const errors = validateNoteInput(content);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    const newNote = {
      content: sanitizeInput(content),
      userId: req.user._id.toString(),
      userName: req.user.name,
      userEmail: req.user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    notesCollection
      .insertOne(newNote)
      .then((result) => {
        res.json({
          success: true,
          note: { ...newNote, _id: result.insertedId }
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({
          success: false,
          errors: ["Failed to create note"]
        });
      });
  });

  // Update note
  app.put("/api/notes/:id", isAuthenticated, isOwner(notesCollection), (req, res) => {
    const { content } = req.body;
    const errors = validateNoteInput(content);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    notesCollection
      .updateOne(
        { _id: new ObjectId(req.params.id) },
        {
          $set: {
            content: sanitizeInput(content),
            updatedAt: new Date()
          }
        }
      )
      .then(() => {
        res.json({
          success: true,
          message: "Note updated successfully"
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({
          success: false,
          errors: ["Failed to update note"]
        });
      });
  });

  // Delete note
  app.delete("/api/notes/:id", isAuthenticated, isOwner(notesCollection), (req, res) => {
    notesCollection
      .deleteOne({ _id: new ObjectId(req.params.id) })
      .then((result) => {
        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            errors: ["Note not found"]
          });
        }
        res.json({
          success: true,
          message: "Note deleted successfully"
        });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({
          success: false,
          errors: ["Failed to delete note"]
        });
      });
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

  return app;
}

module.exports = createApp;
