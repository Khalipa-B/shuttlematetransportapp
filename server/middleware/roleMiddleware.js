// Role-based access control middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userRole = req.user.role;
      
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          message: 'Access denied. Insufficient permissions.',
          requiredRoles: allowedRoles,
          userRole: userRole
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({ message: 'Error checking user permissions' });
    }
  };
};

// Specific role middlewares
const requireAdmin = requireRole(['admin']);
const requireDriver = requireRole(['driver', 'admin']);
const requireParent = requireRole(['parent', 'admin']);
const requireDriverOrAdmin = requireRole(['driver', 'admin']);
const requireParentOrAdmin = requireRole(['parent', 'admin']);

module.exports = {
  requireRole,
  requireAdmin,
  requireDriver,
  requireParent,
  requireDriverOrAdmin,
  requireParentOrAdmin
};