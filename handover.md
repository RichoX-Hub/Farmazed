# Farmazed — PM → Developer Handover
**Last updated:** 2026-08-08
**Prepared by:** Claude (PM)
**For:** Next development session

---

## Project State at Handover

All code is complete and syntactically valid. The marketing website (farmazed.com) is live. The backend API (`tracker/`), client portal (`farmazed-web/portal/`), and admin panel (`farmazed-web/admin/`) are fully written but not yet deployed. No GCP services are configured beyond what was already live for farmazed.com.

**The developer's job is configuration and deployment — zero code to write for Phase 2.**

---

## Update — Same Day, Session 2 (Code Review + Direct Fixes)

Ricardo asked for a direct code-audit and fix pass instead of PM-only documentation this round. Deployment status is unchanged (still Phase 2 pending, see below) but the code that will eventually be deployed is now more correct.

**Workflow clarification (going forward):** `PM_INSTRUCTIONS.md` is read-only for whoever is acting as PM in a given session — it's the PM's own authoritative reference and should only be edited by the PM role itself. `handover.md` (this file) is the one shared, bidirectionally-editable document between PM and developer. Session logs (`sessions/*.md`) record what happened each session but aren't meant to be edited after the fact by "the other side."

### Bugs found (multi-angle code review) and fixed
- `tracker/routes/cases.js` — client "submit" (wizard step 5, `PATCH status:'submitted'`) was silently dropped because `status` wasn't in `CLIENT_FIELDS`; every client submission stayed `status:'draft'` forever and never reached admin. Fixed — clients can now transition `draft → submitted` only (not arbitrary statuses, to avoid privilege escalation).
- `tracker/routes/cases.js` — `GET /api/cases` never computed `productName` (only the MCP handler did), so every case card in both the client dashboard and admin panel showed "(sin nombre)". Fixed.
- `tracker/routes/cases.js` + `data/faddi_checklists.js` — an invalid/unvalidated `tramiteType` produced `total: 0` in the checklist, causing `NaN%` progress bars. Added enum validation on case creation.
- `tracker/middleware/auth.js`, `tracker/index.js` — `MCP_KEY`/`ADMIN_KEY` had hardcoded fallback defaults (`fz-mcp-2026`, `fz-admin-2026`) baked into the source. Since this repo is public, anyone could authenticate as the MCP integration or the QR-tracker admin if the env vars were ever left unset in Cloud Run. Removed the fallbacks; auth now fails closed if the env vars aren't set.
- `tracker/routes/documents.js` — added the missing `POST /:caseId/documents/request` REST endpoint (the "solicitar documento" flow only existed as an MCP tool, `farmazed_request_document`, with no REST equivalent for the admin UI to call).
- `farmazed-web/admin/expediente.html` — "Solicitar documento" button called `fetch()` directly with no auth header and a nonexistent route/method combination — always failed silently. Now uses the authenticated `api.js` client against the new route above.
- `farmazed-web/portal/dashboard.html` — case cards linked to `/portal/expediente.html`, which doesn't exist — every client got a 404 clicking their own case. Repointed to the existing resume-in-wizard flow (`/portal/nuevo.html?caseId=`).
- `farmazed-web/portal/js/wizard.js` — the document-upload `change` listener was re-attached to the checklist container on every refresh (after every upload), so uploads after the first triggered duplicate/multiplied upload calls. Fixed with a one-time-wire guard.
- `tracker/Dockerfile` — no `.dockerignore` scoped to `tracker/`, so `COPY . .` would have shipped the Windows-built `node_modules` into the Linux container image, clobbering the Linux-native one `npm install` had just built. Added `tracker/.dockerignore`.
- Restored a dropped `console.error` on `/api/scans` failures and removed a vestigial no-op middleware on the documents route mount.

### Not fixed (lower priority — logged for a future pass)
- Ownership-check logic (`if (!user.admin && data.clientId !== user.uid)`) is duplicated 3–4× across `cases.js`/`documents.js` instead of centralized as middleware — no active bug, but a latent risk if a future route forgets the check.
- `express-validator` is a declared dependency in `tracker/package.json` but never used anywhere.
- `tramiteType` → icon/URL lookup tables are duplicated independently across `wizard.js`, `dashboard.html`, `casos.html`, and `mcp.js`.
- `client-dashboard.html` (73KB, in `farmazed-web/` root) still needs review against `portal/dashboard.html` for overlap — unchanged from the original handover note below.
- Design-vs-build gap: `References/Frontend Farmazed/Maindasboard.md` and `Clientdashboard.md` describe a richer dashboard (regulatory pipeline visualization, D.E. 27/2024 alert banners, client messaging threads) than what's actually implemented in `admin/casos.html` / `portal/dashboard.html`. Not addressed this session — needs a decision on whether to build toward the spec or update the spec to match reality.

### Files Modified This Session (2)
- `tracker/index.js`, `tracker/middleware/auth.js`, `tracker/routes/cases.js`, `tracker/routes/documents.js`, `tracker/data/faddi_checklists.js`
- `tracker/.dockerignore` (new)
- `farmazed-web/portal/js/wizard.js`, `farmazed-web/portal/js/api.js`, `farmazed-web/portal/dashboard.html`, `farmazed-web/admin/expediente.html`

---

## Immediate Priority — Phase 2 Deployment

Execute the 8 touchpoints below in order. Estimated total: ~3 hours.

> ⚠️ **Use Google Cloud Shell** for all gcloud commands — local gcloud auth does not work on this machine. Open console.cloud.google.com → Cloud Shell.

---

### TOUCHPOINT 1 — Firebase Project Setup (1–2 hours)

**Where:** https://console.firebase.google.com → project "farmazed"

```
1. Authentication → Sign-in method → Enable "Email/Password"
2. Firestore Database → Create database:
   - Region: us-central1
   - Mode: Production (locked rules — we'll open them in Phase 3)
3. Project Settings → General → "Add app" → Web → give it a nickname "farmazed-portal"
4. Copy the firebaseConfig object shown
5. Open: farmazed-web/portal/js/config.js
   Replace the REPLACE_WITH_* values with real values from step 4
   (apiKey, messagingSenderId, appId — authDomain and projectId are already correct)
6. Save and commit to git
```

---

### TOUCHPOINT 2 — GCS Bucket (30 min)

**Where:** GCP Console → Cloud Storage

```bash
# In Cloud Shell:
gsutil mb -l us-central1 gs://farmazed-docs
gsutil iam ch allUsers:objectViewer gs://farmazed-docs  # NOT this — keep bucket private

# Create cors.json locally:
cat > cors.json << 'EOF'
[{
  "origin": ["https://farmazed.com", "https://www.farmazed.com", "http://localhost:8092"],
  "method": ["GET", "POST", "DELETE"],
  "maxAgeSeconds": 3600,
  "responseHeader": ["Content-Type", "Authorization"]
}]
EOF

gsutil cors set cors.json gs://farmazed-docs
```

---

### TOUCHPOINT 3 — Service Account (20 min)

**Where:** GCP Console → IAM → Service Accounts

```
1. Create service account: farmazed-api-sa
2. Assign roles:
   - Cloud Datastore User (Firestore)
   - Storage Object Admin (Cloud Storage)
   - Firebase Admin SDK Administrator Service Agent
3. For local dev ONLY: download JSON key → set GOOGLE_APPLICATION_CREDENTIALS env var
   (In Cloud Run, the service account is attached automatically — no JSON key needed)
```

---

### TOUCHPOINT 4 — Deploy Backend API (30 min)

**Where:** Google Cloud Shell

```bash
cd ~/Farmazed  # or: git clone https://github.com/RichoX-Hub/Farmazed.git

# Build and deploy tracker/ as a separate Cloud Run service
cd tracker/
gcloud builds submit --tag gcr.io/farmazed/farmazed-api

gcloud run deploy farmazed-api \
  --image gcr.io/farmazed/farmazed-api \
  --region us-central1 \
  --service-account farmazed-api-sa@farmazed.iam.gserviceaccount.com \
  --set-env-vars "GCS_BUCKET=farmazed-docs,ADMIN_KEY=<generate-secure-key>,MCP_KEY=<generate-secure-key>,REDIRECT_URL=https://farmazed.com" \
  --allow-unauthenticated \
  --port 8080

# Map api.farmazed.com to this service
gcloud beta run domain-mappings create \
  --service farmazed-api \
  --domain api.farmazed.com \
  --region us-central1
```

> **Generate keys:** use `openssl rand -hex 32` for both ADMIN_KEY and MCP_KEY. Store them securely (e.g., in a password manager). You'll need MCP_KEY for Touchpoint 8.

---

### TOUCHPOINT 5 — First Admin User (5 min)

```bash
# 1. Create the user via Firebase Console:
#    Authentication → Users → Add user → email + password for Zelky / Ricardo

# 2. Get their Firebase UID from the user list

# 3. Assign admin role (replace <ADMIN_KEY> and <firebase_uid>):
curl -X POST https://api.farmazed.com/api/admin/set-role \
  -H "x-admin-key: <ADMIN_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"uid": "<firebase_uid>", "admin": true}'
```

---

### TOUCHPOINT 6 — Update nginx.conf + Redeploy farmazed-web (20 min)

**Where:** `nginx.conf` in project root

Add these location blocks to serve portal/ and admin/ correctly:

```nginx
# Add to the existing server block:
location /portal/ {
    root /usr/share/nginx/html/farmazed-web;
    try_files $uri $uri/ /portal/index.html;
}

location /admin/ {
    root /usr/share/nginx/html/farmazed-web;
    try_files $uri $uri/ /admin/casos.html;
}
```

Then redeploy from Cloud Shell:

```bash
cd ~/Farmazed
gcloud run deploy farmazed-web \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 80 \
  --memory 256Mi \
  --quiet
```

---

### TOUCHPOINT 7 — Verify End-to-End (15 min)

```
1. Open https://farmazed.com/portal/login.html
   → Register a test account → verify Firebase Auth user appears in Firebase Console

2. Create a test case (tramiteType: medicamentos, tipoRegistro: Regular)
   → Complete all 5 wizard steps → verify case appears in Firestore

3. Upload a test PDF document
   → Verify it appears in GCS bucket farmazed-docs

4. Open https://farmazed.com/admin/casos.html
   → Verify the test case appears with status 'submitted'

5. Open the expediente → verify all data fields and docs are visible
   → Click "Abrir en Cowork" modal → copy context

6. GET https://api.farmazed.com/health → should return {"status":"ok"}
```

---

### TOUCHPOINT 8 — MCP Plugin in Cowork (5 min/person)

For each Farmazed team member who uses Claude Cowork:
```
1. Claude Cowork → Settings → Plugins → Add MCP Server
2. URL: https://api.farmazed.com/mcp
3. Auth: Bearer <MCP_KEY>
4. Test: ask Claude "farmazed_list_cases" — should return case list
```

---

## After Phase 2 — Phase 3 Priorities

Once deployed and verified, address in this order:

1. **Firestore security rules** — currently in production mode (all reads/writes blocked except via Admin SDK). Write rules so clients can only read/write their own cases.

2. **Email notifications** (SendGrid) — trigger on case create, case status change, document request. Add `SENDGRID_API_KEY` env var to Cloud Run.

3. **Review client-dashboard.html** (73KB standalone file in farmazed-web/) — determine if it overlaps with portal/dashboard.html or serves a different purpose.

---

## Open Questions for Ricardo

- Should portal/login.html allow self-registration, or should Farmazed invite clients manually?
- Is there a domain email for notifications (e.g., notificaciones@farmazed.com) or use the personal Gmail?
- Should admin panel be password-protected separately, or rely on Firebase admin custom claim?

---

## Files Modified This Session

- `PM_INSTRUCTIONS.md` — created (PM reference)
- `handover.md` — created (this file)
- `sessions/2026-08-08.md` — created (session log)
- `farmazed-web/portal/js/config.js` — ⚠️ STILL HAS PLACEHOLDER VALUES — Touchpoint 1

---

## Key File Locations

| File | Path | Notes |
|---|---|---|
| FADDI credentials | `References/FADDI CREDENTIALS.txt` | Real credentials — handle securely |
| Firebase config (unfilled) | `farmazed-web/portal/js/config.js` | Fill in T1 |
| Deploy guide | `DEPLOY.md` | Full GCP details |
| FADDI platform map | `FADDI_platform_knowledge.md` | Field-by-field reference |
| Checklist logic | `tracker/data/faddi_checklists.js` | All 6 tramite types |
| MCP tools | `tracker/routes/mcp.js` | 7 Cowork tools |
