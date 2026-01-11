const express = require("express");
const app = express();
const PORT = 8000;
const cors = require("cors");
require('dotenv').config();

const bodyParser = require("body-parser");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { MongoClient, ObjectId } = require("mongodb");
const { isAuthenticated, isOwner, injectUser, isAdmin, isSuperAdmin } = require('./middleware/auth');

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
    const notesCollection = db.collection("notes"); // User-generated notes (legacy/future feature)
    const adminsCollection = db.collection("admins"); // Admin users collection

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
          .sort({ dateGregorian: -1, date: -1, _id: -1 })
          .limit(6)
          .toArray();

        // Generate summary from notes if missing
        recentLessons.forEach(lesson => {
          if (!lesson.summary && lesson.notes) {
            // Extract first 200 chars from notes, removing markdown
            const plainText = lesson.notes
              .replace(/#{1,6}\s/g, '') // Remove markdown headers
              .replace(/\*\*/g, '') // Remove bold
              .replace(/\*/g, '') // Remove italic
              .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
              .trim();
            lesson.summary = plainText.substring(0, 200);
          }
        });

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

    // ===== ADMIN ROUTES =====

    // Admin: Dashboard
    app.get("/admin", isAdmin(adminsCollection), async (req, res) => {
      try {
        // Get stats
        const totalLessons = await lessonsCollection.countDocuments();
        const totalSeries = await seriesCollection.countDocuments();
        const totalUsers = await usersCollection.countDocuments();
        const totalAdmins = await adminsCollection.countDocuments({ isActive: true });

        // Get recent lessons
        const recentLessons = await lessonsCollection
          .find()
          .sort({ createdAt: -1, dateGregorian: -1 })
          .limit(10)
          .toArray();

        // Get all admins (for display)
        const admins = await adminsCollection
          .find({ isActive: true })
          .sort({ role: -1, name: 1 })
          .toArray();

        res.render("admin-dashboard.ejs", {
          stats: {
            totalLessons,
            totalSeries,
            totalUsers,
            totalAdmins
          },
          recentLessons,
          admins,
          currentAdmin: req.admin
        });
      } catch (error) {
        console.error(error);
        res.status(500).render("error.ejs", { message: "Failed to load admin dashboard" });
      }
    });

    // Admin: All lessons list
    app.get("/admin/lessons", isAdmin(adminsCollection), async (req, res) => {
      try {
        const allLessons = await lessonsCollection
          .find()
          .sort({ seriesId: 1, lessonNumber: 1 })
          .toArray();

        // Group by series
        const lessonsBySeries = {};
        for (const lesson of allLessons) {
          if (!lessonsBySeries[lesson.seriesId]) {
            lessonsBySeries[lesson.seriesId] = [];
          }
          lessonsBySeries[lesson.seriesId].push(lesson);
        }

        // Get series info
        const allSeries = await seriesCollection.find().toArray();
        const seriesMap = {};
        allSeries.forEach(series => {
          seriesMap[series.seriesId] = series;
        });

        res.render("admin-lessons.ejs", {
          lessonsBySeries,
          seriesMap,
          currentAdmin: req.admin
        });
      } catch (error) {
        console.error(error);
        res.status(500).render("error.ejs", { message: "Failed to load lessons" });
      }
    });

    // Admin: Series management
    app.get("/admin/series", isAdmin(adminsCollection), async (req, res) => {
      try {
        const allSeries = await seriesCollection.find().sort({ category: 1, titleEnglish: 1 }).toArray();

        // Get lesson counts for each series
        for (const series of allSeries) {
          const count = await lessonsCollection.countDocuments({ seriesId: series.seriesId });
          series.actualLessonCount = count;
        }

        res.render("admin-series.ejs", {
          allSeries,
          currentAdmin: req.admin
        });
      } catch (error) {
        console.error(error);
        res.status(500).render("error.ejs", { message: "Failed to load series" });
      }
    });

    // Admin: Create series page
    app.get("/admin/series/new", isAdmin(adminsCollection), async (req, res) => {
      res.render("admin-series-edit.ejs", {
        series: null,
        currentAdmin: req.admin,
        isNew: true
      });
    });

    // Admin: Edit series page
    app.get("/admin/series/:seriesId/edit", isAdmin(adminsCollection), async (req, res) => {
      try {
        const { seriesId } = req.params;
        const series = await seriesCollection.findOne({ seriesId });

        if (!series) {
          return res.status(404).render("error.ejs", { message: "Series not found" });
        }

        res.render("admin-series-edit.ejs", {
          series,
          currentAdmin: req.admin,
          isNew: false
        });
      } catch (error) {
        console.error(error);
        res.status(500).render("error.ejs", { message: "Failed to load series editor" });
      }
    });

    // Admin: Create new series
    app.post("/admin/series/create", isAdmin(adminsCollection), async (req, res) => {
      try {
        const {
          seriesId,
          titleEnglish,
          titleArabic,
          category,
          author,
          description,
          status,
          location,
          telegramLink
        } = req.body;

        // Validate required fields
        if (!seriesId || !titleEnglish || !category) {
          return res.status(400).json({
            success: false,
            error: "Series ID, Title (English), and Category are required"
          });
        }

        // Check if series ID already exists
        const existing = await seriesCollection.findOne({ seriesId: seriesId.trim() });
        if (existing) {
          return res.status(400).json({
            success: false,
            error: "Series ID already exists. Please use a unique ID."
          });
        }

        // Create new series
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

        res.json({
          success: true,
          message: "Series created successfully",
          seriesId: newSeries.seriesId
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          error: "Failed to create series"
        });
      }
    });

    // Admin: Update series
    app.post("/admin/series/:seriesId/update", isAdmin(adminsCollection), async (req, res) => {
      try {
        const { seriesId } = req.params;
        const {
          titleEnglish,
          titleArabic,
          category,
          author,
          description,
          status,
          location,
          telegramLink
        } = req.body;

        // Validate required fields
        if (!titleEnglish || !category) {
          return res.status(400).json({
            success: false,
            error: "Title (English) and Category are required"
          });
        }

        // Update series
        const updateFields = {
          titleEnglish: titleEnglish.trim(),
          titleArabic: titleArabic ? titleArabic.trim() : '',
          category: category.trim(),
          author: author ? author.trim() : 'Sheikh Hassan bin Muhammad Mansur Ad-Daghriri',
          description: description ? description.trim() : '',
          status: status || 'Ongoing',
          location: location ? location.trim() : 'Jami\' Al-Wurud, Al-Wurud District, Jeddah',
          telegramLink: telegramLink ? telegramLink.trim() : null,
          updatedAt: new Date(),
          updatedBy: req.user.email
        };

        const result = await seriesCollection.updateOne(
          { seriesId },
          { $set: updateFields }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({
            success: false,
            error: "Series not found"
          });
        }

        res.json({
          success: true,
          message: "Series updated successfully"
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          error: "Failed to update series"
        });
      }
    });

    // Admin: Delete series (super-admin only)
    app.delete("/admin/series/:seriesId/delete", isSuperAdmin(adminsCollection), async (req, res) => {
      try {
        const { seriesId } = req.params;

        // Check if series has any lessons
        const lessonCount = await lessonsCollection.countDocuments({ seriesId });
        if (lessonCount > 0) {
          return res.status(400).json({
            success: false,
            error: `Cannot delete series. It has ${lessonCount} lesson(s). Delete all lessons first.`
          });
        }

        // Delete the series
        const result = await seriesCollection.deleteOne({ seriesId });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            error: "Series not found"
          });
        }

        console.log(`Series ${seriesId} deleted by ${req.admin.email}`);

        res.json({
          success: true,
          message: "Series deleted successfully"
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          error: "Failed to delete series"
        });
      }
    });

    // Admin: User management (super-admin only)
    app.get("/admin/users", isSuperAdmin(adminsCollection), async (req, res) => {
      try {
        const admins = await adminsCollection
          .find()
          .sort({ isActive: -1, role: -1, name: 1 })
          .toArray();

        res.render("admin-users.ejs", {
          admins,
          currentAdmin: req.admin
        });
      } catch (error) {
        console.error(error);
        res.status(500).render("error.ejs", { message: "Failed to load users" });
      }
    });

    // Admin: Add new admin (super-admin only)
    app.post("/admin/users/add", isSuperAdmin(adminsCollection), async (req, res) => {
      try {
        const { email, name, role } = req.body;

        // Validate input
        if (!email || !name || !role) {
          return res.status(400).json({
            success: false,
            error: "Email, name, and role are required"
          });
        }

        if (!email.includes('@')) {
          return res.status(400).json({
            success: false,
            error: "Invalid email address"
          });
        }

        if (!['super-admin', 'editor'].includes(role)) {
          return res.status(400).json({
            success: false,
            error: "Role must be 'super-admin' or 'editor'"
          });
        }

        // Check if admin already exists
        const existingAdmin = await adminsCollection.findOne({ email: email.trim().toLowerCase() });
        if (existingAdmin) {
          return res.status(400).json({
            success: false,
            error: "Admin with this email already exists"
          });
        }

        // Create new admin
        const newAdmin = {
          email: email.trim().toLowerCase(),
          name: name.trim(),
          role: role,
          addedBy: req.admin.email,
          addedAt: new Date(),
          lastLogin: null,
          isActive: true
        };

        await adminsCollection.insertOne(newAdmin);

        res.json({
          success: true,
          message: "Admin added successfully"
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          error: "Failed to add admin"
        });
      }
    });

    // Admin: Deactivate admin (super-admin only)
    app.post("/admin/users/:id/deactivate", isSuperAdmin(adminsCollection), async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            error: "Invalid admin ID"
          });
        }

        // Prevent self-deactivation
        const targetAdmin = await adminsCollection.findOne({ _id: new ObjectId(id) });
        if (targetAdmin && targetAdmin.email === req.admin.email) {
          return res.status(400).json({
            success: false,
            error: "Cannot deactivate your own account"
          });
        }

        // Deactivate admin
        await adminsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              isActive: false,
              deactivatedBy: req.admin.email,
              deactivatedAt: new Date()
            }
          }
        );

        res.json({
          success: true,
          message: "Admin deactivated successfully"
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          error: "Failed to deactivate admin"
        });
      }
    });

    // Admin: Reactivate admin (super-admin only)
    app.post("/admin/users/:id/reactivate", isSuperAdmin(adminsCollection), async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            error: "Invalid admin ID"
          });
        }

        await adminsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              isActive: true,
              reactivatedBy: req.admin.email,
              reactivatedAt: new Date()
            }
          }
        );

        res.json({
          success: true,
          message: "Admin reactivated successfully"
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          error: "Failed to reactivate admin"
        });
      }
    });

    // Admin: Edit lesson page
    app.get("/admin/lesson/:lessonId/edit", isAdmin(adminsCollection), async (req, res) => {
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

        res.render("admin-lesson-edit.ejs", {
          lesson,
          series
        });
      } catch (error) {
        console.error(error);
        res.status(500).render("error.ejs", { message: "Failed to load lesson editor" });
      }
    });

    // Admin: Update lesson (all fields)
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

        // Validate required fields
        if (!titleEnglish || titleEnglish.trim().length === 0) {
          return res.status(400).json({
            success: false,
            error: "Title (English) is required"
          });
        }

        if (!lessonNumber || lessonNumber < 1) {
          return res.status(400).json({
            success: false,
            error: "Valid lesson number is required"
          });
        }

        if (!notes || notes.trim().length === 0) {
          return res.status(400).json({
            success: false,
            error: "Notes content is required"
          });
        }

        // Re-parse markdown to update chapters, timestamps, etc.
        const MarkdownParser = require('./scripts/markdown-parser');
        const parser = new MarkdownParser(notes, true); // true = raw content, not file path
        const parsed = parser.parseAll();

        // Prepare update object
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

        // Add dateGregorian if provided
        if (dateGregorian) {
          updateFields.dateGregorian = new Date(dateGregorian);
        }

        // Update lesson in database
        await lessonsCollection.updateOne(
          { _id: new ObjectId(lessonId) },
          { $set: updateFields }
        );

        res.json({
          success: true,
          message: "Lesson updated successfully"
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          error: "Failed to update lesson"
        });
      }
    });

    // Admin: Delete lesson (super-admin only)
    app.delete("/admin/lesson/:lessonId/delete", isSuperAdmin(adminsCollection), async (req, res) => {
      try {
        const { lessonId } = req.params;

        if (!ObjectId.isValid(lessonId)) {
          return res.status(400).json({
            success: false,
            error: "Invalid lesson ID"
          });
        }

        // Delete the lesson
        const result = await lessonsCollection.deleteOne({ _id: new ObjectId(lessonId) });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            success: false,
            error: "Lesson not found"
          });
        }

        console.log(`Lesson ${lessonId} deleted by ${req.admin.email}`);

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

    // ===== END ADMIN ROUTES =====

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
