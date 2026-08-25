/**
 * pricing.js — Farmazed Admin Pricing Router
 *
 * Mounts on the main Express app (index.js):
 *   const pricingRouter = require('./routes/pricing');
 *   app.use('/', pricingRouter);
 *
 * Endpoints:
 *   GET  /api/admin/pricing               → all categories (public)
 *   PATCH /api/admin/pricing/:categoryId  → update one category (x-admin-key)
 *   GET  /api/pricing/:tramiteType        → public, filtered by grupo (for portal)
 */

const express = require('express');
const router  = express.Router();
const admin   = require('firebase-admin');

// Get the already-initialised Firestore instance (same singleton as index.js).
// Do NOT require('../index') — that creates a circular require and db comes back undefined.
const db = admin.firestore();

// ─── Auth helper ────────────────────────────────────────────────────────────

function requireAdminKey(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ─── GET /api/admin/pricing ──────────────────────────────────────────────────
// Returns the full pricing table. Public read — prices are not secret.

router.get('/api/admin/pricing', async (req, res) => {
  try {
    const snap = await db.collection('pricing').orderBy('grupo').get();
    const docs = snap.docs.map(d => d.data());
    res.json({ ok: true, pricing: docs });
  } catch (err) {
    console.error('GET /api/admin/pricing error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PATCH /api/admin/pricing/:categoryId ────────────────────────────────────
// Merges supplied component fields, recomputes total, writes audit fields.
// Body: { components: { honorarios_farmazed: 1300, tasa_dnfd_tramite: 800 } }

router.patch('/api/admin/pricing/:categoryId', requireAdminKey, async (req, res) => {
  const { categoryId } = req.params;
  const { components, notes } = req.body;

  if (!components || typeof components !== 'object') {
    return res.status(400).json({ error: 'Body must include { components: { ... } }' });
  }

  try {
    const ref = db.collection('pricing').doc(categoryId);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(404).json({ error: `Category '${categoryId}' not found` });
    }

    const existing = snap.data();
    const merged = { ...existing.components, ...components };

    // Recompute total — sum all numeric component values
    const COMPONENT_KEYS = [
      'honorarios_farmazed',
      'honorarios_abogado',
      'gastos_adicionales',
      'refrendo_cnf',
      'tasa_dnfd_servicio',
      'tasa_dnfd_tramite',
      'iea',
      'tasa_mef'
    ];
    const total = COMPONENT_KEYS.reduce((sum, k) => sum + (Number(merged[k]) || 0), 0);

    const update = {
      components: merged,
      total,
      updatedAt: new Date().toISOString(),
      updatedBy: req.headers['x-updated-by'] || 'admin'
    };
    if (notes !== undefined) update.notes = notes;

    await ref.update(update);

    const updated = (await ref.get()).data();
    res.json({ ok: true, pricing: updated });
  } catch (err) {
    console.error(`PATCH /api/admin/pricing/${categoryId} error:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── GET /api/pricing/:tramiteType ───────────────────────────────────────────
// Public endpoint for the portal to display "Costo estimado".
// :tramiteType is matched against the `grupo` field for now; extend as needed.
// Example: GET /api/pricing/Registros%20Nuevos

router.get('/api/pricing/:tramiteType', async (req, res) => {
  const { tramiteType } = req.params;
  try {
    const snap = await db.collection('pricing')
      .where('grupo', '==', tramiteType)
      .get();
    const docs = snap.docs.map(d => d.data());
    res.json({ ok: true, pricing: docs });
  } catch (err) {
    console.error('GET /api/pricing/:tramiteType error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
