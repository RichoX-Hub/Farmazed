const admin = require('firebase-admin');

/**
 * Verifies Firebase ID token from Authorization: Bearer <token>
 * Attaches decoded token to req.user
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = header.slice(7);
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // uid, email, role (custom claim)
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Requires admin role (custom claim: admin === true)
 * Must run after requireAuth
 */
function requireAdmin(req, res, next) {
  if (!req.user?.admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/**
 * MCP key auth — separate from user auth.
 * The Cowork plugin sends: Authorization: Bearer mcp_<key>
 */
function requireMcpKey(req, res, next) {
  const header = req.headers.authorization || '';
  const key = header.startsWith('Bearer ') ? header.slice(7) : '';
  const validKey = process.env.MCP_KEY;
  if (!validKey || key !== validKey) {
    return res.status(401).json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Unauthorized — invalid MCP key' },
      id: null
    });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, requireMcpKey };
