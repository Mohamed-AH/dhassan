// Authentication middleware

// Check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  // For API requests, return JSON error
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({
      success: false,
      errors: ['Authentication required']
    });
  }

  // For page requests, redirect to login
  res.redirect('/login');
}

// Check if user owns the resource (for notes/content)
function isOwner(notesCollection) {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) {
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({
          success: false,
          errors: ['Authentication required']
        });
      }
      return res.redirect('/login');
    }

    const noteId = req.params.id;
    const { ObjectId } = require('mongodb');

    if (!ObjectId.isValid(noteId)) {
      return res.status(400).json({
        success: false,
        errors: ['Invalid note ID']
      });
    }

    try {
      const note = await notesCollection.findOne({ _id: new ObjectId(noteId) });

      if (!note) {
        return res.status(404).json({
          success: false,
          errors: ['Note not found']
        });
      }

      // Check if user owns this note
      if (!note.userId || note.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          errors: ['You do not have permission to modify this note']
        });
      }

      // Attach note to request for use in route handler
      req.note = note;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        errors: ['Server error during authorization']
      });
    }
  };
}

// Optional authentication (makes user available but doesn't require login)
function optionalAuth(req, res, next) {
  // User will be available at req.user if logged in, otherwise null
  next();
}

// Inject user into all templates
function injectUser(req, res, next) {
  res.locals.user = req.user || null;
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
}

module.exports = {
  isAuthenticated,
  isOwner,
  optionalAuth,
  injectUser
};
