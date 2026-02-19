const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function mask(v) {
  if (!v || v.length < 6) return v ? '***' : '(empty)';
  return v.slice(0, 4) + '***' + v.slice(-2);
}
console.log('[AUTH] JWT_SECRET in auth.js:', mask(JWT_SECRET));

async function authOptional(req, res, next) {
  const authHeader = req.headers && req.headers.authorization;
  const token = (req.cookies && req.cookies.token) || (authHeader ? (authHeader.split(' ')[1] || null) : null) || req.query.token || null;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (user) req.user = user;
  } catch (e) {
    // ignore
  }
  return next();
}

async function requireAuth(req, res, next) {
  console.log('[AUTH] requireAuth: Starting...');
  const authHeader = req.headers.authorization;
  console.log('[AUTH] Authorization Header (first 20 chars):', authHeader ? authHeader.substring(0, 20) + '...' : 'None');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AUTH] No token or invalid format (Bearer token expected).');
    return res.status(401).json({ ok: false, message: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  console.log('[AUTH] Extracted Token (first 10 chars):', token.substring(0, 10) + '...');

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    console.log('[AUTH] Token decoded successfully. User ID:', decodedToken.id, 'Role (from token):', decodedToken.role);

    const user = await User.findById(decodedToken.id).select('-passwordHash');

    if (!user) {
      console.log('[AUTH] User not found for decoded ID:', decodedToken.id);
      return res.status(401).json({ ok: false, message: 'Unauthorized: User not found' });
    } else {
      console.log('[AUTH] User found:', user.email, 'Role (from DB):', user.role);
      req.user = user;
      next();
    }
  } catch (error) {
    console.error('[AUTH] Token verification failed:', error.message);
    return res.status(401).json({ ok: false, message: `Invalid or expired token: ${error.message}` });
  }
}

function requireAdmin(req, res, next) {
  console.log('[AUTH] requireAdmin: Checking role...');
  if (!req.user) {
    console.log('[AUTH] Access Denied: No user object found on request after requireAuth.');
    return res.status(401).json({ ok: false, message: 'Unauthorized: No user session' });
  }

  console.log('[AUTH] User Role (from req.user):', req.user.role);
  if (req.user.role !== 'admin') {
    console.log('[AUTH] Access Denied: User is not an admin. Actual role:', req.user.role);
    return res.status(403).json({ ok: false, message: 'Forbidden: Admin access required' });
  }
  console.log('[AUTH] Admin access granted.');
  next();
}

module.exports = { authOptional, requireAuth, requireAdmin };
