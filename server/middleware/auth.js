const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header - check both x-auth-token and Authorization formats
  let token = req.header('x-auth-token');
  
  // If not found, check for Bearer token in Authorization header
  if (!token && req.header('Authorization')) {
    const authHeader = req.header('Authorization');
    // Extract token from "Bearer <token>"
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 