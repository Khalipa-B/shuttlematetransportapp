const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Clerk authentication middleware
const requireAuth = ClerkExpressRequireAuth({
  // Optional: customize error handling
  onError: (error) => {
    console.error('Authentication error:', error);
    return {
      status: 401,
      message: 'Unauthorized access'
    };
  }
});

// Custom middleware to extract user info from Clerk
const extractUserInfo = async (req, res, next) => {
  try {
    if (req.auth && req.auth.userId) {
      // Get user info from Clerk
      const { clerkClient } = require('@clerk/clerk-sdk-node');
      const user = await clerkClient.users.getUser(req.auth.userId);
      
      req.user = {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.publicMetadata?.role || 'parent'
      };
    }
    next();
  } catch (error) {
    console.error('Error extracting user info:', error);
    res.status(500).json({ message: 'Error processing user information' });
  }
};

module.exports = {
  requireAuth,
  extractUserInfo
};