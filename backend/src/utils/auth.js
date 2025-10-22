const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
  // safer compatibility without optional chaining
  let token = null;
  if (req && req.cookies && req.cookies.jwt) token = req.cookies.jwt;
  if (!token && req && req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2) token = parts[1];
  }

  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
