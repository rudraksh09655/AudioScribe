const jwt = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided. Access denied.'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token. Please login again.'
      });
    }

    // Add user to request
    req.user = { id: decoded.id };
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed. Please login again.'
    });
  }
};

// Optional: Admin middleware
const adminMiddleware = (req, res, next) => {
  // This would check if user has admin role
  // For now, just pass through
  next();
};

module.exports = authMiddleware;