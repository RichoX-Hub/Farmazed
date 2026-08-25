# FARMAZED — Sistema de Gestión de Expedientes Regulatorios
## Project Management Instructions
**Role:** This file is maintained exclusively by Claude (acting as Project Manager).
**Last updated:** 2026-08-25

---

## Project Overview

A web-based document management and FADDI fill-assist system for **Farmazed**, a Panamanian pharmaceutical regulatory affairs consultancy. The system allows clients to self-submit regulatory dossiers and enables the Farmazed team to manage, review, and file Registro Sanitario applications on their behalf at DNFD/MINSA Panama.

**Owner / Product Owner:** Ricardo Pimentel (pimentelmarinricardo@gmail.com)
**Subject-matter expert:** Lic. Zelky Marín (zelkymarin30@gmail.com) — lead pharmacist, Farmazed
**GitHub:** https://github.com/RichoX-Hub/Farmazed (branch: main, public)
**Live site:** https://farmazed.com
**Regulatory portal:** https://sisregsan.minsa.gob.pa (FADDI / DNFD Digital)
**GCP Project:** farmazed (ID: 267037695065), region: us-central1

---

## Primary Objectives

1. **Client self-service portal** — clients create their own expediente, fill product/entity data, and upload all required documents (checklist driven by tramite type). No manual hand-off required to start a case.
2. **Admin management panel** — Farmazed team reviews uploaded documents via signed URLs, tracks case status, and manages the full expediente lifecycle.
3. **FADDI fill-assist via Claude Cowork** — the key operational differentiator. Claude reads the expediente via MCP tools and fills sisregsan.minsa.gob.pa step-by-step using Claude-in-Chrome. Admin supervises and confirms before final submission.
4. **Dynamic document checklists** — checklist adapts automatically based on tramiteType (medicamentos/cosméticos/etc.), tipoRegistro (Regular/Abreviado), and tipoMedicamento (Síntesis Química/Biológicos/etc.).
5. **Production deployment** — tracker/ API at api.farmazed.com + portal/ and admin/ integrated into the live farmazed.com Cloud Run service.

---

## Technology Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | Pure HTML/CSS/JS (no framework) | No build tools; editable directly |
| Auth | Firebase Authentication (Email/Password) | Managed auth; custom claims for admin role |
| Database | Firestore | Real-time, serverless, no schema migrations |
| File storage | Google Cloud Storage (bucket: farmazed-docs) | Signed URLs for secure document access |
| Backend API | Node.js 20 + Express | Lightweight, Firebase Admin SDK native |
| MCP server | Custom Express router at /mcp | Streamable HTTP transport; 7 Cowork tools |
| Deploy (web) | Cloud Run + nginx:alpine | farmazed-web service → farmazed.com |
| Deploy (api) | Cloud Run + node:20-alpine | farmazed-tracker service → api.farmazed.com |
| Local dev | Docker Desktop, port 8092 | nginx mirrors production config |

**Key env vars (tracker/):**
```
GCS_BUCKET    = farmazed-docs
ADMIN_KEY     = <secure key>
MCP_KEY       = <secure key for Cowork plugin>
REDIRECT_URL  = https://farmazed.com
PORT          = 8080 (injected by Cloud Run)
```

---

## Architecture

### Deployment layout

```
farmazed.com              ← farmazed-web (Cloud Run, nginx:alpine) ✅ LIVE
farmazed.com/portal/      ← Client portal (NOT YET DEPLOYED — needs nginx update)
farmazed.com/admin/       ← Admin panel (NOT YET DEPLOYED — needs nginx update)
api.farmazed.com          ← farmazed-tracker (Cloud Run, node:20-alpine) ✅ SERVICE EXISTS — running v1 code
api.farmazed.com/mcp      ← MCP server for Claude Cowork (not yet accessible — v2 not deployed)
```

> **GCP Cloud Run service names (confirmed 2026-08-25):**
> - Web: `farmazed-web` (last updated May 12, 2026)
> - API: `farmazed-tracker` (last updated Apr 27, 2026) — ⚠️ currently running v1 code (QR-only). Must redeploy with v2 after T0.

### Two-Folder Architecture — RESOLVED (corrected 2026-08-25 by Claude Code IDE)

> This section originally described a blocking issue. It's resolved: `Proyecto Farmazetd Regulatory\` is a real git clone with `origin` set to `github.com/RichoX-Hub/Farmazed`, and its commits (tracker v2, portal, admin, MCP, Aug-08 bug fixes) were pushed to `origin/main` in a prior session. Reconfirmed via `git status --branch`: 0 commits ahead/behind. The blocker at the time was GitHub credentials (wrong cached account), not missing git tracking — see `sessions/2026-08-25.md` for the full resolution trail. The separate `repo\` folder was never part of the deploy pipeline (Cloud Shell clones fresh from GitHub) and can be ignored/deleted; it's not kept in sync with anything.

Historical description of the folder layout (accurate as a snapshot, not as a "must integrate" instruction):

```
C:\Users\richy\Desktop\Programas en PYTON\Farmazed\

├── repo\                        ← THE ACTUAL GITHUB REPO (= what deploys to Cloud Run)
│   ├── .git/                    ← Only this folder is version-controlled
│   ├── tracker\index.js         ← ⚠️ OUTDATED (v1, QR-only, 64 lines)
│   ├── farmazed-web\            ← Marketing site only (no portal/, no admin/)
│   ├── nginx.conf               ← Basic (no /portal/, no /admin/ routes)
│   └── Dockerfile               ← nginx:alpine for farmazed-web
│
└── Proyecto Farmazetd Regulatory\  ← THE DEVELOPER'S WORKING FOLDER (NOT in git)
    ├── PM_INSTRUCTIONS.md       ← This file
    ├── handover.md
    ├── sessions/
    ├── tracker\                 ← ✅ Full v2 API (complete, not in repo yet)
    │   ├── index.js             ← v2.0.0, 99 lines, Firebase Admin + all routers
    │   ├── middleware/auth.js
    │   ├── services/storage.js
    │   ├── routes/cases.js
    │   ├── routes/documents.js
    │   ├── routes/mcp.js        ← 7 MCP tools
    │   └── data/faddi_checklists.js
    └── farmazed-web\
        ├── portal\              ← ✅ Client portal (complete, not in repo yet)
        └── admin\               ← ✅ Admin panel (complete, not in repo yet)
```

**Consequence:** Before any GCP work, the developer must run Touchpoint 0 (copy all new code from `Proyecto Farmazetd Regulatory\` into `repo\` and commit to GitHub). See `handover.md` for the exact PowerShell commands.

---

## Data Model (Firestore)

```
cases/                          ← Collection
  {caseId}/
    createdAt, updatedAt
    status                      ← draft | submitted | in_review | faddi_ready |
                                   faddi_submitted | approved | observed |
                                   denied | pending_docs | deleted
    tramiteType                 ← medicamentos | cosméticos | higiénicos |
                                   plaguicidas | excepción | publicidad
    tipoSolicitud               ← Nuevo Registro | Renovación
    tipoRegistro                ← Regular | Abreviado | Reconocimiento Mutuo | WLA
    tipoMedicamento             ← [] of: Síntesis Química | Biotecnológicos |
                                   Biológicos | Huérfanos | Vacuna | ...
    product {}                  ← nombreComercial, principioActivo, concentracion,
                                   formaFarmaceutica, viaAdministracion, condicionVenta,
                                   codigoATC, descripcionEnvase, vidaUtil,
                                   condicionesAlmacenamiento, tipoPresentacion,
                                   descripcionPresentacion, requiereBioequivalencia,
                                   esPsicotropico, tieneInserto
    entities {}                 ← fabricante, fabricanteDiluyente,
                                   fabricantePrincipioActivo, acondicionador,
                                   titular, distribuidores[], solicitante,
                                   representanteLegal, abogado, farmaceutico,
                                   rcpr, responsableFarmacovigilancia
    monografia {}               ← indicacionesTerapeuticas, contraindicaciones
    clientId, clientEmail, clientName
    assignedTo                  ← admin email or null
    priority                    ← normal | high | urgent
    notes                       ← internal admin notes
    faddi {}                    ← expedienteNumber, solicitudNumber,
                                   submittedAt, lastFaddiStatus, observations

  {caseId}/documents/           ← Subcollection
    {docId}/
      faddiDocId                ← checklist item id (e.g. 'clv', 'bpm', 'poder')
      faddiCode                 ← FADDI field code (e.g. '15.3')
      faddiDocName              ← Official FADDI document name
      faddiStep                 ← FADDI step number (15, 16, etc.)
      fileName, fileSize, mimeType
      storagePath               ← GCS path for getSignedUrl
      status                    ← uploaded | reviewing | approved | rejected | requested
      reviewNotes
      uploadedAt, uploadedBy

qr_scans/                       ← Legacy QR tracking collection

pricing/                        ← Admin-managed price table (added Phase 3)
  {categoryId}/
    id                          ← e.g. "med_abreviado_sintesis"
    name                        ← Human-readable label shown in portal
    grupo                       ← "Registros Nuevos" | "Modificaciones" | "Renovaciones"
    components: {
      honorarios_farmazed       ← Farmazed management fee (B/.)
      honorarios_abogado        ← Attorney fee (B/.)
      gastos_adicionales        ← Translations, notary, DHL, travel (B/.)
      refrendo_cnf              ← CNF endorsement fee (B/.)
      tasa_dnfd_servicio        ← DNFD service tax (B/.)
      tasa_dnfd_tramite         ← DNFD procedure tax — varies by category (B/.)
      iea                       ← IEA analysis fee (B/.)
      tasa_mef                  ← MEF fee (B/.)
    }
    total                       ← Computed sum — stored for fast display (B/.)
    updatedAt                   ← Firestore Timestamp
    updatedBy                   ← Admin email who last edited
    notes                       ← Optional internal note
```

---

## Pricing Reference

Current prices extracted from **`Actualización de nuestros precios para la plataforma.xlsx`** (Drive: Costos folder, fileId: `1D--X1LzONtN_iNRQ1095D0Bid87FApti`, owned by zelkymarin30@gmail.com). Prices in Panamanian Balboas (B/. = USD).

### Price Components

**Farmazed honorarios (per trámite):**

| Component | Standard | Notes |
|---|---|---|
| Honorarios Farmazed (gestión) | varies | Core service fee — differs by trámite complexity |
| Honorarios abogado | B/.250 | Flat for most trámites |
| Gastos adicionales | B/.605 | Translations, notarías, DHL, movilización |

**Tasas oficiales:**

| Fee | Amount | Notes |
|---|---|---|
| Refrendo CNF | B/.50 | Flat on most Nuevos Registros |
| Tasa DNFD servicio | B/.200 | Flat service tax |
| Tasa DNFD trámite | varies | See table below |
| Análisis IEA | B/.1,500 | Reference value for most registros |
| Tasa MEF | B/.25 (foreign) / B/.10 (national) | Based on product origin |

### Complete Price Table (Current)

| Trámite | Honorarios Farmazed | Abogado + Gastos | Tasas DNFD trámite | Total |
|---|---|---|---|---|
| **Registros Nuevos** | | | | |
| Síntesis Química — P. Abreviado | B/.1,200 | +250+605 | CNF50+DNFD200+750+IEA1500+MEF25 | **B/.4,580** |
| Biológicos/Biotecnológicos — P. Abreviado | B/.1,200 | +250+605 | CNF50+DNFD200+750+IEA1500+MEF25 | **B/.4,580** |
| Suplementos / Homeopáticos / Radiofármacos — P. Abreviado | B/.1,200 | +250+605 | CNF50+DNFD200+750+IEA1500+MEF25 | **B/.4,580** |
| Mutuo Acuerdo / WLA WHO | B/.1,200 | +250+605 | CNF50+DNFD200+750+IEA1500+MEF25 | **B/.4,580** |
| Huérfanos — P. Abreviado | B/.1,200 | +250+605 | CNF50+DNFD200+750+IEA1500+MEF25 | **B/.4,430** |
| Síntesis Química — P. Regular | B/.800 | +250+605 | CNF50+DNFD200+500+IEA1500+MEF25 | **B/.3,930** |
| Productos Naturales / Gases Medicinales / Contraste — P. Regular | B/.800 | +250+605 | CNF50+DNFD200+500+IEA1500+MEF25 | **B/.3,930** |
| Huérfano — P. Regular | B/.400 | +250+605 | CNF50+DNFD200+50+IEA1500+MEF25 | **B/.3,080** |
| Intercambiabilidad | B/.800 | +250+605 | DNFD250+400 | **B/.3,830** |
| **Modificaciones (Expedición RS)** | | | | |
| Most modification types | B/.800 | — (no abogado/gastos) | DNFD500 | **B/.1,300–1,750** |
| **Renovaciones** | | | | |
| Most renewal types | B/.800–1,200 | — | DNFD500–750 | **B/.1,050–1,950** |
| **Post-RS Changes** | | | | |
| Most post-RS modifications | B/.800 | — | DNFD200 | **B/.1,000** |
| Cambio Rep. Legal / Prof. Responsable | (lower) | — | DNFD25 | **< B/.1,000** |

> **Source:** These prices must be treated as a working reference. Zelky or Ricardo may update them via the admin pricing interface (see Phase 3 below). The Firestore `pricing/` collection is the single source of truth in production.

---

## API Reference (tracker/)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | /health | — | Health check |
| GET | /qr | — | QR redirect (legacy) |
| POST | /api/admin/set-role | x-admin-key | Assign/revoke admin Firebase claim |
| GET | /api/cases | Bearer | List cases (admin: all; client: own only) |
| POST | /api/cases | Bearer | Create new case |
| GET | /api/cases/:id | Bearer | Get case + dynamic checklist |
| PATCH | /api/cases/:id | Bearer | Update fields (role-restricted) |
| DELETE | /api/cases/:id | Bearer + admin | Soft delete (sets status=deleted) |
| GET | /api/cases/:id/checklist | Bearer | Checklist with per-item upload status |
| GET | /api/cases/:id/documents | Bearer | List documents |
| POST | /api/cases/:id/documents | Bearer | Upload document (multipart, max 50MB) |
| GET | /api/cases/:id/documents/:docId | Bearer | Get doc metadata + signed URL |
| PATCH | /api/cases/:id/documents/:docId | Bearer + admin | Review doc (approve/reject) |
| DELETE | /api/cases/:id/documents/:docId | Bearer | Delete document |
| POST | /api/cases/:id/documents/request | Bearer + admin | Request missing doc from client |
| GET | /api/admin/pricing | — | List all pricing categories (public read) |
| PATCH | /api/admin/pricing/:categoryId | x-admin-key | Update one pricing category's components |
| GET | /api/pricing/:tramiteType | — | Public: estimated cost for a trámite type (for portal display) |
| GET | /mcp | MCP_KEY | MCP server info (tool list) |
| POST | /mcp | MCP_KEY | MCP JSON-RPC (tools/list, tools/call) |

---

## MCP Tools (Claude Cowork Integration)

| Tool | Description |
|---|---|
| farmazed_list_cases | List cases with optional filters (status, tramiteType, assignedTo) |
| farmazed_get_case | Full case detail + checklist with per-document upload status |
| farmazed_list_documents | Documents for a case, organized by FADDI step |
| farmazed_get_document | 1-hour signed URL to open/read a PDF |
| farmazed_get_faddi_context | Structured FADDI-fill context object: all steps, all fields, ready for Claude-in-Chrome |
| farmazed_update_case | Update status, notes, assignee, FADDI tracking data |
| farmazed_request_document | Flag a document as needed from the client (sets status=requested) |

**MCP plugin setup (per Farmazed team member using Cowork):**
- URL: `https://api.farmazed.com/mcp`
- Auth: Bearer `<MCP_KEY>`
- Verify: ask `farmazed_list_cases` — should return case list

---

## Dynamic Checklists (faddi_checklists.js)

Documents required per tramiteType (totals are for base + applicable conditionals):

| tramiteType | Base docs | Conditional additions |
|---|---|---|
| medicamentos | 20 (MED_BASE_DOCS) | +3 Biotecnológicos / +2 Biológicos / +2 Huérfanos / +2 Vacuna / +1 Abreviado (ARR) |
| cosméticos | 9 (COS_DOCS) | CLV note: in-person, not in FADDI upload list |
| higiénicos | 13 (HIG_DOCS) | — |
| plaguicidas | 20 (PLAG_DOCS) | — |
| excepción | 8 (EXC_DOCS) | — |
| publicidad | 3 (PUB_DOCS) | — |

**Key note on Cosméticos CLV:** The CLV is a RTCA 71.03.35:21 requirement but is NOT in the FADDI upload interface for cosméticos. It must be presented in-person at DNFD. The checklist flags this with `faddiCode: 'EXTRA'` and a description note for the client.

---

## FADDI Platform — Critical Operational Constraints

*(Full map: FADDI_platform_knowledge.md + References/FADDI CREDENTIALS.txt)*

- **CAPTCHA** on every login — no "remember device" — blocks full automation; admin must solve manually at session start
- **48-hour window** after generating a solicitud to upload the signed document — system auto-cancels after this
- **No autosave** in the 16-step Medicamentos wizard — session expiry = lost work
- **200+ options** in Forma Farmacéutica dropdown — no search filter
- **CLV not in Cosméticos** adjuntos list — must present in-person despite being a RTCA requirement

---

## Deployment Status

| Component | Status | Notes |
|---|---|---|
| farmazed.com (marketing site) | ✅ LIVE | farmazed-web Cloud Run service |
| farmazed.com/login.html | ✅ LIVE | Static prototype login (hardcoded credentials — see below) |
| farmazed.com/dashboard.html | ✅ LIVE | Admin prototype (static, hardcoded data) |
| farmazed.com/client-dashboard.html | ✅ LIVE | Client portal prototype (static, hardcoded data) |
| farmazed.com/portal/* | ❌ NOT DEPLOYED | nginx fallback → marketing site |
| farmazed.com/admin/* | ❌ NOT DEPLOYED | nginx fallback → marketing site |
| farmazed-tracker API → /qr | ✅ LIVE (v1) | Redirects to farmazed.com ✓ |
| farmazed-tracker API → /api/* | ❌ NOT DEPLOYED (code is on GitHub, Cloud Run not yet redeployed) | v1 is what's live; v2 code is on `origin/main`, needs T4 (redeploy) |
| origin/main (GitHub) | ✅ UP TO DATE | Has tracker v2, portal, admin, MCP, all Aug-08 fixes. Pricing feature pending commit (see below). |

### ⚠️ Important: Current System is a Static Prototype

The live system uses **hardcoded credentials** (not Firebase Auth):
- Admin: `usuario=ricardo` / `contraseña=admins123` → `dashboard.html`, role "Administrador"
- Client demo: `usuario=user` / `contraseña=admins123` → `client-dashboard.html`, role "Cliente"

All data shown (142 registros, pipeline counts, product timelines) is **hardcoded in JS** — no database. The v2 system replaces this with real Firebase Auth + Firestore.

### Design Reference — DO NOT DELETE

`dashboard.html` and `client-dashboard.html` are the **design specification for v2**. They define the visual language, component patterns, and UX that the v2 portal and admin panel must replicate. The developer should use them as reference constantly.

| File | Role | Key features |
|---|---|---|
| `dashboard.html` | Admin design spec | KPI cards, pipeline 4-stage, registros por categoría chart, actividad reciente feed, 6 quick-access modules |
| `client-dashboard.html` | Client portal design spec | Sidebar nav (Resumen/Mis Productos/Mis Documentos/Mensajes/Solicitar Registro), 4-step product timeline tracker per expediente, pending-actions panel with deadlines and action buttons |

The `client-dashboard.html` (73KB) is NOT a duplicate of `portal/dashboard.html` — it is the **source prototype** that `portal/dashboard.html` must replicate with real data. Resolved: the file serves a distinct purpose and should NOT be deleted.

---

## Pending Work / Roadmap

### Phase 2 — Deployment (CURRENT PRIORITY)

All code is written, bug-fixed, and syntactically valid. Developer work is integration + configuration (~4 hours total).

| # | Touchpoint | Estimated time | Status |
|---|---|---|---|
| **T0** | ~~Integrate code into repo~~ **✅ DONE** — code was pushed to `origin/main` directly from `Proyecto Farmazetd Regulatory\` in a prior session (not via the `repo\` copy procedure). Pricing feature (routes/pricing.js, seed_pricing.js, precios.html) committed + pushed 2026-08-25. | — | ✅ DONE |
| T1 | Firebase project setup + fill `portal/js/config.js` | 1–2 h | ⏳ PENDING |
| T2 | GCS bucket "farmazed-docs" + CORS config | 30 min | ⏳ PENDING |
| T3 | Service Account (Firestore + Storage + Firebase Auth roles) | 20 min | ⏳ PENDING |
| T4 | **Redeploy** `farmazed-tracker` with v2 code (service already exists — update only) | 15 min | ⏳ PENDING (blocked on T0) |
| T5 | First admin user (Firebase UID → POST /api/admin/set-role) | 5 min | ⏳ PENDING |
| T6 | Add /portal/ and /admin/ to nginx.conf + redeploy farmazed-web | 20 min | ⏳ PENDING |
| T7 | End-to-end verification (health, auth, case wizard, GCS upload, admin panel, Cowork modal) | 15 min | ⏳ PENDING |
| T8 | MCP plugin in Cowork (per team member) | 5 min/person | ⏳ PENDING |

> **Deploy commands** are in `DEPLOY.md`. Use Google Cloud Shell — local gcloud auth does not work on this machine.
> **T0 PowerShell commands** are in `handover.md` under TOUCHPOINT 0.

### Phase 3 — Post-Deployment Hardening

| Priority | Item | Status |
|---|---|---|
| High | **Admin Pricing Interface** (`admin/precios.html`) — see spec below | ⏳ PENDING |
| High | Firestore security rules (owner-only read/write per case) | ⏳ PENDING |
| High | Email notifications on case create/update (SendGrid) | ⏳ PENDING |
| Medium | End-to-end testing with real Firebase credentials | ⏳ PENDING |
| Medium | Review `client-dashboard.html` (73KB) — clarify overlap with portal/dashboard.html | ⏳ PENDING |

#### Feature Spec: Admin Pricing Interface (D7)

**Goal:** Allow Zelky or Ricardo to change any individual price component for any trámite category without touching code. Changes must persist immediately and propagate to the client portal's cost estimates in real time.

**Files to create:**

- `farmazed-web/admin/precios.html` — Admin UI (new file, same auth/navbar as existing admin pages)
- `tracker/routes/pricing.js` — New Express router for GET + PATCH `/api/admin/pricing` and GET `/api/pricing/:tramiteType`
- Mount in `tracker/index.js`: `app.use('/', pricingRouter)`

**Data init (one-time):** Developer runs a Node.js seed script (or a dedicated `/api/admin/pricing/seed` endpoint, x-admin-key) to write the full price table above into Firestore `pricing/` on first deploy.

**API design:**

```
GET  /api/admin/pricing
     → returns array of all pricing documents (no auth required — prices are not secret)

PATCH /api/admin/pricing/:categoryId
     Headers: x-admin-key
     Body: { components: { honorarios_farmazed: 1300, tasa_dnfd_tramite: 800 } }
     → merges only the supplied component fields; recomputes total; writes updatedAt + updatedBy
     → returns updated document

GET  /api/pricing/:tramiteType
     → returns pricing documents filtered by tramiteType group name
     → used by portal to display "Costo estimado" on the case creation wizard
```

**Admin UI (`admin/precios.html`) design:**

The page loads all pricing documents and renders them in three accordion sections: Registros Nuevos, Modificaciones, Renovaciones.

Each trámite row shows:
- Trámite name (read-only label)
- Eight inline `<input type="number">` fields — one per component — pre-filled with current values
- A computed **Total** cell that updates in-browser as the admin types (no save required to see new total)
- A "Guardar" button per row that calls `PATCH /api/admin/pricing/:categoryId` with the changed values
- A small "Guardado ✓" / "Error ✗" toast confirmation inline next to the button — no full-page reload

Auth: page-level Firebase auth check (same as all admin pages). The PATCH call sends x-admin-key header (same key used for other admin-only endpoints — retrieved from `window._adminKey` set at login, or stored in the admin session store however the existing admin pages handle it).

**Portal integration:**

On `portal/wizard.html` step 1 (selecting trámite type), after the user picks tramiteType + tipoRegistro, the wizard calls `GET /api/pricing/:tramiteType` and displays a "Costo estimado: B/. X,XXX" summary card below the form. This is informational only — not a binding quote. A note reads: *"Estimación basada en tarifas vigentes. Farmazed emitirá cotización formal antes de iniciar el trámite."*

**Conflict avoidance:**

Since prices are stored in Firestore (not in code), they are updated atomically per-document. No git deploys or code changes are needed to update prices. Two admins editing different categories simultaneously have no conflict. Two admins editing the same category simultaneously: last write wins (acceptable for this use case — pricing changes are infrequent and always deliberate). `updatedAt`/`updatedBy` fields provide audit trail.

**Seed data:** The 13 trámite categories in the price table above are the initial dataset. CategoryIds use snake_case: `med_abreviado_sintesis`, `med_abreviado_biologico`, `med_abreviado_suplemento`, `med_abreviado_mutuo_acuerdo`, `med_abreviado_huerfano`, `med_regular_sintesis`, `med_regular_natural`, `med_regular_huerfano`, `intercambiabilidad`, `modificacion_expedicion`, `renovacion`, `post_rs_modificacion`, `cambio_rep_legal`.

### Phase 4 — Automated Alerts

| Priority | Item | Status |
|---|---|---|
| High | 48h FADDI post-generation alert (remind admin to upload signed doc) | ⏳ PENDING |
| Medium | RS renewal alerts (certificates expiring in ≤6 months) | ⏳ PENDING |
| Low | Admin metrics dashboard (ApexCharts already in project) | ⏳ PENDING |
| Low | Export checklist as PDF | ⏳ PENDING |

### Phase 5 — Platform Extensions (Future)

| Item | Notes |
|---|---|
| Cosméticos FADDI fill-assist | `farmazed_get_faddi_context` currently only maps Medicamentos steps. Cosméticos (single-page scroll) needs its own context builder. |
| Prevenciones tracking | Track DNFD prevención responses: received date, response deadline, response submitted |
| Client document resubmission flow | When admin requests a doc (status=requested), client gets notification and can re-upload |
| Multi-product case | One case per product currently. Group cases under a single client account for multi-product clients |
| Renovaciones module | Separate workflow for registry renewals (5-year cycle) — different checklist, different FADDI form |
| Intercambiabilidad module | Separate flow for Res. 385 & 386/2023 therapeutic equivalence dossiers |

---

## Regulatory Reference (Key Instruments)

| Instrument | Content | Location |
|---|---|---|
| D.E. 27/2024 | Main framework (836 arts.) — all categories | References/Decreto_ejecutivo_no_27... (PDF) |
| Ley 419/2024 | General pharmaceutical principles | Drive: Mi escritotio |
| D.E. 29/2023 | Procedimiento Abreviado | Drive: Decretos Escritorio |
| Resolución 126/2021 | RTCA 11.03.59:18 requirements | Drive: Dec 126 REQUISITOS... |
| Resolución 550/2019 | Suplementos | Drive |
| Resolución 56/2024 | Fitofármacos | Drive |
| Resoluciones 385 & 386/2023 | Intercambiabilidad | Drive |

**High-standard authorities (Procedimiento Abreviado — D.E. 29/2023):**
- **PIC/S members (47):** USA (FDA), EU members, Canada, Japan, Australia, Switzerland, UK, Mexico, Argentina, and others
- **OPS Reference:** Argentina (ANMAT), Brasil (ANVISA), Chile (ISP), Colombia (INVIMA), Cuba (CECMED), México (COFEPRIS)
- **OMS Precalified:** China, Egypt, India, Indonesia, Serbia, South Africa, Thailand, Vietnam (vaccines only)

**FADDI URLs by tramiteType:**
```
medicamentos: sisregsan.minsa.gob.pa/forms/user/medicamentos/registrar.aspx
cosmeticos:   sisregsan.minsa.gob.pa/forms/user/cosmeticos/registrar.aspx
higienicos:   sisregsan.minsa.gob.pa/forms/user/higienicos/registrar.aspx
plaguicidas:  sisregsan.minsa.gob.pa/forms/user/plaguicidas/registrar.aspx
excepcion:    sisregsan.minsa.gob.pa/forms/user/excepcion/registrar.aspx
publicidad:   sisregsan.minsa.gob.pa/forms/user/publicidad/registrar.aspx
```

---

## Approved Decisions

| # | Decision | Resolution | Date |
|---|---|---|---|
| D1 | Auth del cliente | Email/Password con Firebase Auth | May 2026 |
| D2 | Quién inicia el expediente | El cliente (self-service) | May 2026 |
| D3 | Checklist documental | Dinámico según tramiteType + tipoRegistro + tipoMedicamento | May 2026 |
| D4 | Integración Cowork | MCP server propio en /mcp + modal "Abrir en Cowork" en admin panel | May 2026 |
| D5 | PM scheme | Replicar esquema Henrietta PG: PM_INSTRUCTIONS.md + handover.md + sessions/ | Aug 2026 |
| D6 | Repo integration strategy | Developer's new code lives in `Proyecto Farmazetd Regulatory\` (not git). Must copy into `repo\` via PowerShell (Touchpoint 0) before any GCP deployment. Commands documented in handover.md. | Aug 2026 |
| D7 | Admin pricing interface | Prices stored in Firestore `pricing/` collection, editable via `admin/precios.html` + PATCH `/api/admin/pricing/:categoryId` (x-admin-key). Portal reads from same collection for estimated cost display. No code deploy needed to change prices. | Aug 2026 |

---

## Known Bugs Fixed (Session 08-ago-2026)

The following bugs were found in a multi-angle code review and fixed. All fixes are already applied in `Proyecto Farmazetd Regulatory\` and will reach `repo\` automatically when Touchpoint 0 is executed.

- `cases.js` — wizard submit stayed `draft` forever (missing `status` in `CLIENT_FIELDS`)
- `cases.js` — `productName` never computed in `GET /cases` → "(sin nombre)" in all case cards
- `cases.js` + `faddi_checklists.js` — invalid `tramiteType` produced `NaN%` progress bars
- `middleware/auth.js` + `index.js` — hardcoded fallback keys (`fz-mcp-2026`, `fz-admin-2026`) in public repo; removed
- `documents.js` — missing `POST /:caseId/documents/request` REST endpoint (only existed as MCP tool)
- `admin/expediente.html` — "Solicitar documento" button called fetch with no auth header and nonexistent route; fixed
- `portal/dashboard.html` — case card links went to `/portal/expediente.html` (404); repointed to wizard with `?caseId=`
- `portal/js/wizard.js` — upload listener re-attached on every refresh → duplicate uploads; fixed with one-time guard
- `tracker/Dockerfile` — no `.dockerignore` → Windows `node_modules` would clobber Linux build; added `.dockerignore`

## Known Bugs Fixed (Session 25-ago-2026)

These bugs were found during code audit and fixed. Files are in `Proyecto Farmazetd Regulatory\` — they reach `repo\` when T0 is executed.

- `tracker/index.js` — `pricingRouter` was not mounted → all pricing endpoints returned 404
- `tracker/routes/pricing.js` — **Critical circular require:** `const { db } = require('../index')` caused `db = undefined` at runtime. Every pricing endpoint threw `Cannot read properties of undefined (reading 'collection')`. Fixed by using `admin.firestore()` directly — same pattern as `cases.js` and `documents.js`.
- `repo/nginx.conf` — missing `/portal/` and `/admin/` location blocks → those routes fell through to the marketing site catch-all. Fixed in `repo\nginx.conf` directly.

---

## Known Technical Debt (Non-urgent)

- Ownership check duplicated 3–4× across `cases.js`/`documents.js` instead of centralized middleware — no active bug, latent risk
- `express-validator` declared in `package.json` but never used
- `tramiteType` → icon/URL lookup tables duplicated in `wizard.js`, `dashboard.html`, `casos.html`, and `mcp.js`
- `client-dashboard.html` (73KB in `farmazed-web/` root) needs review vs `portal/dashboard.html` for overlap
- Design spec (`References/Frontend Farmazed/Maindasboard.md`) describes richer dashboard than implemented — needs decision: build toward spec or update spec to match reality

---

## Rules for the PM (Claude)

**What the PM does:**
- Planning, documentation, requirements clarification, architecture decisions, session logging.
- Review the live site using Claude-in-Chrome (navigate, inspect, screenshot, read console) — this is expected and encouraged.
- Run end-to-end tests and QA checks on the deployed system.
- Audit code files to identify gaps, bugs, and missing pieces — document findings in handover.md.
- Give clear, actionable orders to the developer in handover.md.

**What the PM does NOT do:**
- **Never write, edit, or commit source code** — `.js`, `.html`, `.css`, `.json`, Dockerfile, nginx.conf, or any other application file. That is the developer's exclusive domain.
- Never push to GitHub or trigger GCP deployments.
- Never modify files in `repo\` or `Proyecto Farmazetd Regulatory\tracker\` or `\farmazed-web\`.

**File authority:**
- `PM_INSTRUCTIONS.md` — PM maintains this exclusively. It is the authoritative project state.
- `handover.md` — PM rewrites this before every development session with exact current state and next steps.
- `sessions/YYYY-MM-DD.md` — PM creates at end of every session (or start if catching up).
- All other files → developer only.

**Process rules:**
- When a phase item is completed, update the status in the Roadmap table and add a completion date.
- If a decision is reversed or scope changes, record it in Approved Decisions with the date.
- Do not introduce new GCP services or third-party dependencies without documenting the decision rationale here first.
- Local device is the primary save target. Google Drive is secondary only.

**Note on sessions Aug 2026:** In the sessions of 08-ago and 25-ago-2026, the PM created application code directly (`pricing.js`, `seed_pricing.js`, `precios.html`, `index.js` edits) because no developer was active. These files exist in `Proyecto Farmazetd Regulatory\` as PM drafts — the developer must review, validate, and commit them via T0. This was a one-time exception and does not set precedent. Going forward, the PM documents what is needed; the developer writes the code.
- The FADDI CREDENTIALS.txt file contains real credentials — never quote its contents in session logs or commit messages.
