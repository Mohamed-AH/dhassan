/**
 * Server Entry Point
 * Connects to MongoDB and starts the Express server
 */

const { MongoClient } = require("mongodb");
const createApp = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 8000;
const dbConnectionStr = process.env.DB_STRING;

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

    // Get collections
    const collections = {
      seriesCollection: db.collection("series"),
      lessonsCollection: db.collection("lessons"),
      usersCollection: db.collection("users"),
      notesCollection: db.collection("notes"),
      adminsCollection: db.collection("admins")
    };

    // Create and configure the app
    const app = createApp(collections, client);
    app.listen(process.env.PORT || PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  });
