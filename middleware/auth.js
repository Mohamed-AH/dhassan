// Authentication middleware

// Check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  // Redirect to login for better UX
  res.redirect('/login');
}

// Check if user owns the resource (for notes/content)
function isOwner(notesCollection) {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) {
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

// Inject user into all templates (accepts admins collection for admin check)
function injectUser(adminsCollection = null) {
  return async (req, res, next) => {
    res.locals.user = req.user || null;
    res.locals.isAuthenticated = req.isAuthenticated();

    // In test mode, if res.locals already has admin data from mock middleware, skip DB query
    if (process.env.NODE_ENV === 'test' && res.locals.isAdmin !== undefined) {
      return next();
    }

    // Check if user is admin by querying database
    if (req.user && adminsCollection) {
      try {
        const admin = await adminsCollection.findOne({
          email: req.user.email,
          isActive: true
        });
        res.locals.isAdmin = !!admin;
        res.locals.adminRole = admin ? admin.role : null;
      } catch (error) {
        console.error('Admin check error:', error);
        res.locals.isAdmin = false;
        res.locals.adminRole = null;
      }
    } else {
      res.locals.isAdmin = false;
      res.locals.adminRole = null;
    }

    next();
  };
}

// Check if user is admin (accepts admins collection)
function isAdmin(adminsCollection) {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }

    // In test mode, if req.admin is already set by mock middleware, skip DB query
    if (process.env.NODE_ENV === 'test' && req.admin) {
      return next();
    }

    try {
      // Check if user is an active admin in database
      const admin = await adminsCollection.findOne({
        email: req.user.email,
        isActive: true
      });

      if (!admin) {
        if (req.path.startsWith('/api/')) {
          return res.status(403).json({
            success: false,
            errors: ['Admin access required']
          });
        }
        return res.status(403).render('error.ejs', {
          message: 'Admin access required',
          user: req.user,
          isAuthenticated: true,
          isAdmin: false
        });
      }

      // Attach admin data to request
      req.admin = admin;
      next();
    } catch (error) {
      console.error('Admin authentication error:', error);
      if (req.path.startsWith('/api/')) {
        return res.status(500).json({
          success: false,
          errors: ['Server error during authorization']
        });
      }
      return res.status(500).render('error.ejs', {
        message: 'Server error',
        user: req.user,
        isAuthenticated: req.isAuthenticated(),
        isAdmin: false
      });
    }
  };
}

// Check if user is super admin (for user management features)
function isSuperAdmin(adminsCollection) {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }

    // In test mode, if req.admin is already set with super-admin role, skip DB query
    if (process.env.NODE_ENV === 'test' && req.admin && req.admin.role === 'super-admin') {
      return next();
    }

    try {
      const admin = await adminsCollection.findOne({
        email: req.user.email,
        isActive: true,
        role: 'super-admin'
      });

      if (!admin) {
        if (req.path.startsWith('/api/')) {
          return res.status(403).json({
            success: false,
            errors: ['Super admin access required']
          });
        }
        return res.redirect('/login');
      }

      req.admin = admin;
      next();
    } catch (error) {
      console.error('Super admin check error:', error);
      if (req.path.startsWith('/api/')) {
        return res.status(500).json({
          success: false,
          errors: ['Server error during authorization']
        });
      }
      return res.status(500).render('error.ejs', {
        message: 'Server error',
        user: req.user,
        isAuthenticated: req.isAuthenticated(),
        isAdmin: false
      });
    }
  };
}

module.exports = {
  isAuthenticated,
  isOwner,
  optionalAuth,
  injectUser,
  isAdmin,
  isSuperAdmin
};
