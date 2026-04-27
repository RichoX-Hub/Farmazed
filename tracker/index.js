const express = require('express');
const { Firestore } = require('@google-cloud/firestore');

const app = express();
const db = new Firestore({ projectId: 'farmazed' });
const REDIRECT_URL = 'https://farmazed.com';
const ADMIN_KEY = process.env.ADMIN_KEY || 'fz-admin-2026';

function detectDevice(ua) {
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}

// QR scan endpoint — logs and redirects
app.get('/qr', async (req, res) => {
  try {
    const ua = req.headers['user-agent'] || '';
    const forwarded = req.headers['x-forwarded-for'] || req.ip || '';
    const ip = forwarded.split(',')[0].trim();
    await db.collection('qr_scans').add({
      timestamp: Firestore.Timestamp.now(),
      ip,
      device: detectDevice(ua),
      ua
    });
  } catch (e) {
    console.error('Firestore write error:', e.message);
  }
  res.redirect(302, REDIRECT_URL);
});

// Admin API — returns scan data (protected by simple key)
app.get('/api/scans', async (req, res) => {
  if (req.query.key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const snap = await db.collection('qr_scans')
      .orderBy('timestamp', 'desc')
      .limit(1000)
      .get();
    const scans = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        timestamp: data.timestamp.toDate().toISOString(),
        ip: data.ip,
        device: data.device
      };
    });
    res.json({ total: scans.length, scans });
  } catch (e) {
    console.error('Firestore read error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Health check
app.get('/', (req, res) => res.json({ status: 'ok', service: 'farmazed-tracker' }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`farmazed-tracker running on :${PORT}`));
