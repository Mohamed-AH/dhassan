const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

module.exports = function(db) {
  const usersCollection = db.collection('users');

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const { ObjectId } = require('mongodb');
      const user = await usersCollection.findOne({ _id: new ObjectId(id) });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // ===== GOOGLE OAUTH STRATEGY =====
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_URL : process.env.DEVELOPMENT_URL}/auth/google/callback`,
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await usersCollection.findOne({ providerId: profile.id, provider: 'google' });

          if (user) {
            // Update last login
            await usersCollection.updateOne(
              { _id: user._id },
              {
                $set: {
                  lastLogin: new Date(),
                  avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null
                }
              }
            );
            return done(null, user);
          }

          // Create new user
          const newUser = {
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
            name: profile.displayName,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            provider: 'google',
            providerId: profile.id,
            providerProfile: profile._json,
            createdAt: new Date(),
            lastLogin: new Date(),
            notesCount: 0
          };

          const result = await usersCollection.insertOne(newUser);
          newUser._id = result.insertedId;

          done(null, newUser);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  // ===== GITHUB OAUTH STRATEGY =====
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_URL : process.env.DEVELOPMENT_URL}/auth/github/callback`,
        scope: ['user:email'],
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await usersCollection.findOne({ providerId: profile.id, provider: 'github' });

          if (user) {
            // Update last login
            await usersCollection.updateOne(
              { _id: user._id },
              {
                $set: {
                  lastLogin: new Date(),
                  avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : profile._json.avatar_url
                }
              }
            );
            return done(null, user);
          }

          // Get primary email from GitHub
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

          // Create new user
          const newUser = {
            email: email,
            name: profile.displayName || profile.username,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : profile._json.avatar_url,
            provider: 'github',
            providerId: profile.id,
            providerProfile: profile._json,
            createdAt: new Date(),
            lastLogin: new Date(),
            notesCount: 0
          };

          const result = await usersCollection.insertOne(newUser);
          newUser._id = result.insertedId;

          done(null, newUser);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );

  return passport;
};
