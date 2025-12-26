const UserManager = require('../firebase/userManager');

// Role-based access control middleware
const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const validation = await UserManager.validateUserRole(req.user.uid, allowedRoles);
      if (!validation.valid) {
        return res.status(403).json({ error: validation.error });
      }
      next();
    } catch (error) {
      console.error('Error validating user role:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = requireRole;