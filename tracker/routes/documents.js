const { Router }   = require('express');
const multer        = require('multer');
const { v4: uuid }  = require('uuid');
const admin         = require('firebase-admin');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { uploadFile, getSignedUrl, deleteFile } = require('../services/storage');

const router  = Router({ mergeParams: true }); // mergeParams to access :caseId
const db      = () => admin.firestore();
const upload  = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 52 * 1024 * 1024 }, // 52 MB (slightly above 50 MB limit)
});

// Helper: verify case exists and user has access
async function getCaseOrFail(caseId, user, res) {
  const snap = await db().collection('cases').doc(caseId).get();
  if (!snap.exists) { res.status(404).json({ error: 'Case not found' }); return null; }
  const data = snap.data();
  if (!user.admin && data.clientId !== user.uid) { res.status(403).json({ error: 'Forbidden' }); return null; }
  return { id: snap.id, ...data };
}

// ─── GET /api/cases/:caseId/documents ────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const caseData = await getCaseOrFail(req.params.caseId, req.user, res);
    if (!caseData) return;

    const snap = await db()
      .collection('cases').doc(req.params.caseId)
      .collection('documents')
      .orderBy('uploadedAt', 'desc')
      .get();

    const docs = snap.docs.map(d => {
      const data = d.data();
      return {
        id:           d.id,
        faddiDocId:   data.faddiDocId,
        faddiCode:    data.faddiCode,
        faddiDocName: data.faddiDocName,
        faddiStep:    data.faddiStep,
        fileName:     data.fileName,
        fileSize:     data.fileSize,
        mimeType:     data.mimeType,
        status:       data.status,
        reviewNotes:  data.reviewNotes,
        uploadedAt:   data.uploadedAt?.toDate?.()?.toISOString(),
        uploadedBy:   data.uploadedBy,
      };
    });

    res.json({ total: docs.length, documents: docs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── POST /api/cases/:caseId/documents ───────────────────────────────────────
// Accepts multipart/form-data with fields: faddiDocId, faddiCode, faddiDocName, faddiStep
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const caseData = await getCaseOrFail(req.params.caseId, req.user, res);
    if (!caseData) return;

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { faddiDocId, faddiCode, faddiDocName, faddiStep } = req.body;
    if (!faddiDocId) return res.status(400).json({ error: 'faddiDocId is required' });

    const docId = uuid();
    const { gcsPath, signedUrl, storagePath } = await uploadFile(
      req.params.caseId,
      docId,
      req.file.originalname,
      req.file.buffer,
      req.file.mimetype
    );

    const now = admin.firestore.Timestamp.now();
    const docData = {
      faddiDocId,
      faddiCode:    faddiCode    || '',
      faddiDocName: faddiDocName || '',
      faddiStep:    parseInt(faddiStep, 10) || 0,
      fileName:     req.file.originalname,
      fileSize:     req.file.size,
      mimeType:     req.file.mimetype,
      storagePath,
      gcsPath,
      status:       'uploaded',
      reviewNotes:  '',
      reviewedBy:   null,
      reviewedAt:   null,
      uploadedAt:   now,
      uploadedBy:   req.user.uid,
    };

    await db()
      .collection('cases').doc(req.params.caseId)
      .collection('documents').doc(docId).set(docData);

    // Update case updatedAt
    await db().collection('cases').doc(req.params.caseId).update({
      updatedAt: now
    });

    res.status(201).json({
      id: docId,
      ...docData,
      signedUrl,
      uploadedAt: now.toDate().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── POST /api/cases/:caseId/documents/request (admin only) ──────────────────
// Flag a document as required from the client. Updates the matching document
// to status "requested" if one already exists, or creates a placeholder entry.
router.post('/request', requireAuth, requireAdmin, async (req, res) => {
  try {
    const caseData = await getCaseOrFail(req.params.caseId, req.user, res);
    if (!caseData) return;

    const { faddiDocId, message } = req.body;
    if (!faddiDocId) return res.status(400).json({ error: 'faddiDocId is required' });

    const now = admin.firestore.Timestamp.now();
    const docsCol = db().collection('cases').doc(req.params.caseId).collection('documents');
    const existing = await docsCol.where('faddiDocId', '==', faddiDocId).limit(1).get();

    if (!existing.empty) {
      await existing.docs[0].ref.update({
        status: 'requested', reviewNotes: message || '',
        reviewedBy: req.user.email, reviewedAt: now,
      });
    } else {
      await docsCol.add({
        faddiDocId, faddiCode: '', faddiDocName: '', faddiStep: 0,
        fileName: '(pendiente)', fileSize: 0, mimeType: '', storagePath: '',
        status: 'requested', reviewNotes: message || '',
        uploadedAt: now, uploadedBy: 'admin',
      });
    }

    await db().collection('cases').doc(req.params.caseId).update({ status: 'pending_docs', updatedAt: now });

    res.json({ requested: true, faddiDocId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── GET /api/cases/:caseId/documents/:docId ─────────────────────────────────
// Returns document metadata + a fresh signed URL
router.get('/:docId', requireAuth, async (req, res) => {
  try {
    const caseData = await getCaseOrFail(req.params.caseId, req.user, res);
    if (!caseData) return;

    const snap = await db()
      .collection('cases').doc(req.params.caseId)
      .collection('documents').doc(req.params.docId).get();

    if (!snap.exists) return res.status(404).json({ error: 'Document not found' });

    const data      = snap.data();
    const signedUrl = await getSignedUrl(data.storagePath);

    res.json({
      id: snap.id,
      ...data,
      signedUrl,
      uploadedAt: data.uploadedAt?.toDate?.()?.toISOString(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── PATCH /api/cases/:caseId/documents/:docId (admin only) ──────────────────
// Update status (uploaded|reviewing|approved|rejected) and review notes
router.patch('/:docId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const ref = db()
      .collection('cases').doc(req.params.caseId)
      .collection('documents').doc(req.params.docId);

    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Document not found' });

    const update = {
      ...(req.body.status      && { status: req.body.status }),
      ...(req.body.reviewNotes !== undefined && { reviewNotes: req.body.reviewNotes }),
      reviewedBy: req.user.email,
      reviewedAt: admin.firestore.Timestamp.now(),
    };

    await ref.update(update);
    res.json({ id: req.params.docId, ...update });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── DELETE /api/cases/:caseId/documents/:docId ──────────────────────────────
router.delete('/:docId', requireAuth, async (req, res) => {
  try {
    const caseData = await getCaseOrFail(req.params.caseId, req.user, res);
    if (!caseData) return;

    const ref  = db().collection('cases').doc(req.params.caseId).collection('documents').doc(req.params.docId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Document not found' });

    // Only owner or admin can delete
    if (!req.user.admin && snap.data().uploadedBy !== req.user.uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await deleteFile(snap.data().storagePath);
    await ref.delete();

    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
