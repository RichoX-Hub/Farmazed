# Plan de Implementacion — Sistema de Gestion Documental Farmazed
**PM:** Claude (Cowork) | **Product Owner:** Ricardo Pimentel | **Fecha:** Mayo 2026

---

## ESTADO ACTUAL DEL PROYECTO

| Fase | Estado | Entregable |
|------|--------|-----------|
| Fase 0 — Backend API + MCP | COMPLETADA | tracker/ con 7 archivos, 1,326 lineas |
| Fase 1 — Portal Cliente + Admin | COMPLETADA | farmazed-web/portal/ + admin/ (8 HTML/JS) |
| Fase 2 — Integracion y Despliegue | PENDIENTE DEVELOPER | Ver puntos de entrada abajo |
| Fase 3 — Fill-Assist Cowork | PARCIALMENTE LISTA | Modal + contexto generados; MCP server listo |
| Fase 4 — Notificaciones | PENDIENTE | Email alerts, alertas de renovacion |

---

## DECISIONES APROBADAS (mayo 2026)

| # | Decision | Resolucion |
|---|----------|-----------|
| D1 | Auth del cliente | Email/Password con Firebase Auth |
| D2 | Quien inicia el expediente | El cliente (self-service) |
| D3 | Checklist documental | Dinamico segun tramiteType + tipoRegistro + tipoMedicamento |
| D4 | Integracion Cowork | MCP server propio en /mcp + modal "Abrir en Cowork" en admin panel |

---

## DONDE ENTRA EL DEVELOPER

Todo el codigo esta escrito y es sintacticamente valido. El developer NO escribe codigo desde cero.
Su trabajo es: configurar servicios GCP, inyectar credenciales, testear, y deployar.

### TOUCHPOINT #1 — Firebase Project Setup (1-2 horas)
**Archivo a modificar:** `farmazed-web/portal/js/config.js`
```
Acciones:
1. Firebase Console (console.firebase.google.com) → proyecto "farmazed"
2. Authentication → Sign-in method → Habilitar Email/Password
3. Firestore Database → Crear base de datos (region us-central1, modo produccion)
4. Project Settings → General → "Add app" → Web → copiar firebaseConfig
5. Pegar config en farmazed-web/portal/js/config.js (reemplazar los REPLACE_WITH_*)
```

### TOUCHPOINT #2 — Cloud Storage Bucket (30 min)
```
Acciones:
1. GCP Console → Cloud Storage → Crear bucket "farmazed-docs" (us-central1, privado)
2. Configurar CORS en el bucket:
   gsutil cors set cors.json gs://farmazed-docs
   
Contenido de cors.json:
[{
  "origin": ["https://farmazed.com", "http://localhost:8092"],
  "method": ["GET", "POST", "DELETE"],
  "maxAgeSeconds": 3600,
  "responseHeader": ["Content-Type", "Authorization"]
}]
```

### TOUCHPOINT #3 — Service Account para Cloud Run (20 min)
```
Acciones:
1. GCP Console → IAM → Service Accounts → Crear cuenta "farmazed-api-sa"
2. Asignar roles:
   - Cloud Datastore User (Firestore)
   - Storage Object Admin (Cloud Storage)
   - Firebase Auth Admin (via firebase-admin SDK)
3. En Cloud Run: editar servicio tracker → Security → Service account → seleccionar farmazed-api-sa
   (NO descargar JSON key para produccion — Cloud Run usa el SA automaticamente)
4. Para desarrollo local: descargar JSON y apuntar GOOGLE_APPLICATION_CREDENTIALS a el
```

### TOUCHPOINT #4 — Variables de Entorno en Cloud Run (15 min)
```
Variables a configurar en Cloud Run (tracker service):
  GCS_BUCKET     = farmazed-docs
  ADMIN_KEY      = <generar clave segura, no usar la default>
  MCP_KEY        = <generar clave segura para el plugin de Cowork>
  REDIRECT_URL   = https://farmazed.com
  PORT           = 8080 (Cloud Run lo inyecta automaticamente)
```

### TOUCHPOINT #5 — Primer admin (5 min)
```bash
# Crear primer usuario admin via Firebase Auth Console o SDK
# Luego asignar rol admin:
curl -X POST https://api.farmazed.com/api/admin/set-role \
  -H "x-admin-key: <ADMIN_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"uid": "<firebase_uid>", "admin": true}'
```

### TOUCHPOINT #6 — Deploy (30 min)
```bash
# Backend (tracker/) — ya tiene Dockerfile
cd tracker/
gcloud builds submit --tag gcr.io/farmazed/farmazed-api
gcloud run deploy farmazed-api \
  --image gcr.io/farmazed/farmazed-api \
  --region us-central1 \
  --service-account farmazed-api-sa \
  --set-env-vars GCS_BUCKET=farmazed-docs,ADMIN_KEY=xxx,MCP_KEY=yyy

# Mapear api.farmazed.com al nuevo servicio (Cloud Run domain mapping)
gcloud beta run domain-mappings create --service farmazed-api \
  --domain api.farmazed.com --region us-central1

# Frontend — agregar /portal/ y /admin/ al nginx y redeploy farmazed-web
cd .. && gcloud builds submit --tag gcr.io/farmazed/farmazed-web
```

### TOUCHPOINT #7 — Plugin MCP en Claude Cowork (5 min por admin)
```
Cada miembro del equipo Farmazed que use Cowork:
1. Claude Cowork → Settings → Plugins → Add MCP Server
2. URL: https://api.farmazed.com/mcp
3. Auth: Bearer <MCP_KEY>
4. Verificar: en Cowork, pedir "farmazed_list_cases" — debe retornar casos
```

---

## ARCHIVOS GENERADOS

### Backend — tracker/
```
tracker/
├── index.js                     (99 lineas)  — Servidor Express principal
├── middleware/auth.js           (51 lineas)  — requireAuth, requireAdmin, requireMcpKey
├── services/storage.js          (53 lineas)  — uploadFile, getSignedUrl, deleteFile (GCS)
├── routes/cases.js             (184 lineas) — CRUD expedientes + GET /checklist
├── routes/documents.js         (196 lineas) — Upload multipart, list, get signed URL, review
├── routes/mcp.js               (553 lineas) — MCP server: 7 herramientas para Claude Cowork
├── data/faddi_checklists.js    (190 lineas) — Checklists dinamicos por modulo FADDI
├── package.json                             — Dependencias npm
├── Dockerfile                               — node:20-alpine
└── .env.example                             — Variables de entorno documentadas
```

### Portal del cliente — farmazed-web/portal/
```
farmazed-web/portal/
├── login.html          — Registro + login con Firebase Auth
├── dashboard.html      — Lista de expedientes del cliente
├── nuevo.html          — Wizard 5 pasos (nuevo expediente)
└── js/
    ├── config.js       — *** DEVELOPER LLENA ESTO (Firebase config + API_BASE) ***
    ├── auth.js         — Firebase Auth helpers, requireLogin guard
    ├── api.js          — Fetch wrapper autenticado con Bearer token
    └── wizard.js       — Logica completa del wizard: renderizado, uploads, validaciones
```

### Panel admin — farmazed-web/admin/
```
farmazed-web/admin/
├── casos.html          — Lista de expedientes con filtros, busqueda y stats
└── expediente.html     — Vista detalle por paso FADDI + copia al clipboard +
                          modal "Abrir en Cowork" + FADDI tracking
```

---

## API ENDPOINTS

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| GET    | /health | — | Health check |
| GET    | /qr | — | QR redirect (legacy) |
| POST   | /api/admin/set-role | x-admin-key | Asignar rol admin |
| GET    | /api/cases | Bearer token | Listar casos (propios o todos si admin) |
| POST   | /api/cases | Bearer token | Crear expediente |
| GET    | /api/cases/:id | Bearer token | Obtener expediente + checklist |
| PATCH  | /api/cases/:id | Bearer token | Actualizar campos |
| DELETE | /api/cases/:id | Bearer token + admin | Soft delete |
| GET    | /api/cases/:id/checklist | Bearer token | Checklist con estado de uploads |
| GET    | /api/cases/:id/documents | Bearer token | Listar documentos |
| POST   | /api/cases/:id/documents | Bearer token | Subir documento (multipart) |
| GET    | /api/cases/:id/documents/:docId | Bearer token | Get doc + signed URL |
| PATCH  | /api/cases/:id/documents/:docId | Bearer token + admin | Revisar doc |
| DELETE | /api/cases/:id/documents/:docId | Bearer token | Eliminar doc |
| GET    | /mcp | MCP_KEY | MCP server info |
| POST   | /mcp | MCP_KEY | MCP JSON-RPC (tools/list, tools/call) |

---

## MCP TOOLS (Claude Cowork)

| Tool | Descripcion |
|------|-------------|
| farmazed_list_cases | Listar casos con filtros |
| farmazed_get_case | Caso completo + checklist con estado de uploads |
| farmazed_list_documents | Documentos del caso por paso FADDI |
| farmazed_get_document | URL firmada (1h) para abrir/leer PDF |
| farmazed_get_faddi_context | Objeto estructurado listo para llenar FADDI paso a paso |
| farmazed_update_case | Actualizar estado, notas, FADDI tracking |
| farmazed_request_document | Marcar documento como requerido al cliente |

---

## FLUJO COMPLETO DE UN EXPEDIENTE

```
CLIENTE:
  1. Abre farmazed.com/portal/login.html → se registra
  2. Dashboard → "Nuevo Expediente"
  3. Wizard paso 1: selecciona tipo (ej: Medicamentos Nuevo Registro Regular)
  4. Wizard paso 2: llena datos del producto
  5. Wizard paso 3: llena datos de fabricante, titular, solicitante, etc.
  6. Wizard paso 4: ve checklist dinamico con los docs que necesita
     → 14 docs obligatorios para Medicamentos Regular Sintesis Quimica
     → 7 para Cosmeticos
     → Sube cada PDF desde su computadora
  7. Wizard paso 5: confirma y envia

FARMAZED (ADMIN):
  8. Recibe notificacion (pendiente implementar)
  9. Abre farmazed.com/admin/casos.html → ve el expediente nuevo
  10. Abre farmazed.com/admin/expediente.html?id=XXX
      → Ve todos los datos del producto con botones de copia
      → Ve todos los docs organizados por paso FADDI (15.1, 15.2, ...)
      → Puede abrir cada PDF con un click (signed URL)
  11. Cuando listo: click "Abrir en Cowork"
      → Copia el contexto generado automaticamente
      → Pega en Claude Cowork (o Claude llama farmazed_get_faddi_context via MCP)
  12. Claude navega FADDI con Claude in Chrome
      → Llena paso a paso usando los datos del expediente
      → Llama farmazed_get_document para abrir cada PDF y verificar datos
      → Admin supervisa y confirma antes del submit final
  13. Admin actualiza estado → "faddi_submitted" + numero de expediente FADDI
  14. Cuando DNFD responde: actualizar lastFaddiStatus + observations
```

---

## BACKLOG PENDIENTE

### Siguiente sesion de desarrollo:
1. Firestore security rules (solo el owner puede leer/escribir sus casos)
2. Notificaciones por email (SendGrid — trigger al crear/actualizar expediente)
3. Agregar /portal/ y /admin/ al nginx.conf y redeploy de farmazed-web
4. Testing end-to-end con credenciales reales

### Fase 4 — Pendiente:
1. Alertas de renovacion (RS que vencen en 6 meses)
2. Alerta de 48h post-generacion en FADDI
3. Dashboard de metricas admin (ApexCharts ya disponible en el proyecto)
4. Exportar checklist como PDF

---

*PM: Claude (Cowork) | mayo 2026 | Pendiente aprobacion de Ricardo Pimentel*
