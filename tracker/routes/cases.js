const { Router }  = require('express');
const { v4: uuid } = require('uuid');
const admin         = require('firebase-admin');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getChecklist, TRAMITE_TYPES } = require('../data/faddi_checklists');

const router = Router();
const db     = () => admin.firestore();

// ─── GET /api/cases ─────────────────────────────────────────────────────────
// Admin: all cases. Client: own cases only.
router.get('/', requireAuth, async (req, res) => {
  try {
    let query = db().collection('cases').orderBy('createdAt', 'desc');

    if (!req.user.admin) {
      query = query.where('clientId', '==', req.user.uid);
    }

    // Optional filters
    if (req.query.status)       query = query.where('status', '==', req.query.status);
    if (req.query.tramiteType)  query = query.where('tramiteType', '==', req.query.tramiteType);
    if (req.query.assignedTo)   query = query.where('assignedTo', '==', req.query.assignedTo);

    const snap  = await query.limit(200).get();
    const cases = snap.docs.map(d => {
      const data = d.data();
      return { id: d.id, ...data, productName: data.product?.nombreComercial || '(sin nombre de producto)' };
    });
    res.json({ total: cases.length, cases });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── POST /api/cases ─────────────────────────────────────────────────────────
// Client creates a new case.
router.post('/', requireAuth, async (req, res) => {
  try {
    const { tramiteType, tipoSolicitud, tipoRegistro, tipoMedicamento, product, entities } = req.body;

    if (!tramiteType) return res.status(400).json({ error: 'tramiteType is required' });
    if (!TRAMITE_TYPES.includes(tramiteType)) {
      return res.status(400).json({ error: `tramiteType must be one of: ${TRAMITE_TYPES.join(', ')}` });
    }

    const now      = admin.firestore.Timestamp.now();
    const caseData = {
      createdAt:      now,
      updatedAt:      now,
      status:         'draft',
      tramiteType,
      tipoSolicitud:  tipoSolicitud  || 'Nuevo Registro',
      tipoRegistro:   tipoRegistro   || 'Regular',
      tipoMedicamento: tipoMedicamento || [],
      product:        product   || {},
      entities:       entities  || {},
      monografia:     {},
      clientId:       req.user.uid,
      clientEmail:    req.user.email,
      clientName:     req.user.name || req.user.email,
      assignedTo:     null,
      priority:       'normal',
      notes:          '',
      faddi:          {},
    };

    const ref = await db().collection('cases').add(caseData);
    res.status(201).json({ id: ref.id, ...caseData });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── GET /api/cases/:id ──────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const snap = await db().collection('cases').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Case not found' });

    const data = snap.data();
    // Client can only see their own cases
    if (!req.user.admin && data.clientId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Include dynamic checklist
    const checklist = getChecklist(data.tramiteType, {
      tipoRegistro:    data.tipoRegistro,
      tipoMedicamento: data.tipoMedicamento,
    });

    res.json({ id: snap.id, ...data, checklist });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── PATCH /api/cases/:id ─────────────────────────────────────────────────────
// Update fields — client can update product/entities/monografia while in draft.
// Admin can update any field including status.
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const snap = await db().collection('cases').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Case not found' });

    const data = snap.data();
    if (!req.user.admin && data.clientId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Clients can only update in draft status
    if (!req.user.admin && data.status !== 'draft') {
      return res.status(400).json({ error: 'Case is no longer in draft — contact Farmazed to make changes' });
    }

    // Allowed fields per role
    const ADMIN_FIELDS  = ['status', 'assignedTo', 'priority', 'notes', 'faddi', 'product', 'entities', 'monografia', 'tipoSolicitud', 'tipoRegistro', 'tipoMedicamento'];
    const CLIENT_FIELDS = ['product', 'entities', 'monografia', 'tipoSolicitud', 'tipoRegistro', 'tipoMedicamento'];
    const allowed       = req.user.admin ? ADMIN_FIELDS : CLIENT_FIELDS;

    const update = { updatedAt: admin.firestore.Timestamp.now() };
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    // Clients may not set arbitrary status values — only submit their own draft.
    if (!req.user.admin && req.body.status !== undefined) {
      if (req.body.status !== 'submitted') {
        return res.status(400).json({ error: 'Clients may only set status to "submitted"' });
      }
      update.status = 'submitted';
    }

    await db().collection('cases').doc(req.params.id).update(update);
    res.json({ id: req.params.id, ...update });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── DELETE /api/cases/:id (soft delete, admin only) ─────────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await db().collection('cases').doc(req.params.id).update({
      status:    'deleted',
      updatedAt: admin.firestore.Timestamp.now(),
    });
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── GET /api/cases/:id/checklist ────────────────────────────────────────────
// Returns the dynamic checklist for a case (with upload status per document).
router.get('/:id/checklist', requireAuth, async (req, res) => {
  try {
    const snap = await db().collection('cases').doc(req.params.id).get();
    if (!snap.exists) return res.status(404).json({ error: 'Case not found' });

    const data = snap.data();
    if (!req.user.admin && data.clientId !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get uploaded docs
    const docsSnap = await db()
      .collection('cases').doc(req.params.id)
      .collection('documents').get();

    const uploadedIds = new Set(docsSnap.docs.map(d => d.data().faddiDocId));

    const checklist = getChecklist(data.tramiteType, {
      tipoRegistro:    data.tipoRegistro,
      tipoMedicamento: data.tipoMedicamento,
    });

    const enriched = checklist.map(item => ({
      ...item,
      uploaded: uploadedIds.has(item.id),
    }));

    const total    = enriched.length;
    const uploaded = enriched.filter(i => i.uploaded).length;

    res.json({
      caseId:     req.params.id,
      tramiteType: data.tramiteType,
      progress:   { uploaded, total, percent: Math.round((uploaded / total) * 100) },
      checklist:  enriched,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
