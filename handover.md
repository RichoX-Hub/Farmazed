# Farmazed — PM → Developer Handover
**Last updated:** 2026-08-25
**Prepared by:** Claude (PM)
**For:** Next development session

---

## Auditoría del Sitio en Producción (verificado 2026-08-25)

| URL / Servicio | Estado | Notas |
|---|---|---|
| `farmazed.com/` | ✅ Live | Marketing site completo, profesional |
| `farmazed.com/login.html` | ✅ Live (prototipo) | Login estático con credenciales hardcodeadas |
| `farmazed.com/portal/*` | ❌ NOT deployed | nginx sin rutas → fallback al marketing site |
| `farmazed.com/admin/*` | ❌ NOT deployed | nginx sin rutas → fallback al marketing site |
| `farmazed-tracker` → `/qr` | ✅ Live (v1) | Redirige a farmazed.com ✓ |
| `farmazed-tracker` → `/health` | ✅ (en v2) | Existe en el código v2, no desplegado aún |
| `farmazed-tracker` → `/api/*` | ❌ | No existe en v1 — tracker sigue en v1 |

**Credenciales del prototipo estático actual:**
- Admin: `user=ricardo` / `pass=admins123` → redirige a `dashboard.html`
- Cliente demo: `user=user` / `pass=admins123` → redirige a `client-dashboard.html`
- Estas credenciales son hardcodeadas en `farmazed-web/login.html` y DESAPARECEN cuando se despliegue el v2 con Firebase Auth real.

**Design Reference — NO BORRAR:**
- `farmazed-web/dashboard.html` — prototipo del panel admin (es la spec de diseño, ~100KB)
- `farmazed-web/client-dashboard.html` — prototipo del portal cliente (es la spec de diseño, ~73KB)
- Ambos son los prototipos originales que sirvieron de referencia para construir el v2. Deben conservarse como documentación de diseño, NO son duplicados del v2.

---

## ESTADO DEL CÓDIGO (2026-08-25)

> **Corrección (Claude Code IDE, 2026-08-25):** Esta sección y el "PASO 0B" de abajo describen un problema que ya fue resuelto el 25-ago en una sesión anterior — `Proyecto Farmazetd Regulatory\` SÍ está bajo git, con `origin` apuntando a `github.com/RichoX-Hub/Farmazed`, y ya se hizo `git push origin main` (confirmado de nuevo ahora: local y `origin/main` están sincronizados, 0 commits de diferencia). La carpeta `repo\` nunca fue necesaria — no es parte del pipeline de deploy (Cloud Shell clona fresco). El procedimiento de copia por PowerShell del PASO 0B es innecesario; no ejecutarlo. Ver `sessions/2026-08-25.md` (Session 2) para el detalle completo de cómo se resolvió (fue un problema de credenciales de GitHub, no de integración de código).
>
> El código de precios (`pricing.js`, `seed_pricing.js`, `precios.html`, más el mount en `index.js`) sí seguía sin commitear hasta ahora — ese es el único paso pendiente real, y se resuelve con un commit + push normal desde `Proyecto Farmazetd Regulatory\`, no con la copia a `repo\`.

El código nuevo (tracker v2 + portal + admin) está en `Proyecto Farmazetd Regulatory\` y **ya fue integrado al repositorio real** (`origin/main` en GitHub) — ver corrección arriba.

### Gaps identificados en el código v2 (TODOS CORREGIDOS — ver archivos adjuntos)

| # | Archivo | Problema | Fix |
|---|---|---|---|
| 1 | `tracker/index.js` | `pricingRouter` no estaba montado | Agregar `require('./routes/pricing')` + `app.use('/', pricingRouter)` |
| 2 | `tracker/index.js` | `db` no se exportaba | Agregar `module.exports = { db }` al final |
| 3 | `repo/nginx.conf` | Faltaban bloques `/portal/` y `/admin/` | Agregar las dos `location` blocks |
| 4 | `farmazed-web/portal/js/config.js` | `FIREBASE_CONFIG` tiene `REPLACE_WITH_*` | Llenar en Touchpoint 1 (esperado) |

**Los archivos corregidos (`index.js` y `nginx.conf`) están adjuntos a este handover como archivos separados. Copiarlos directamente.**

### Código que está limpio (sin cambios necesarios)

| Archivo | Estado |
|---|---|
| `tracker/middleware/auth.js` | ✅ Limpio — Firebase token verify + admin claim + MCP key |
| `tracker/routes/cases.js` | ✅ Con bugs fixes de la sesión 08-ago ya aplicados |
| `tracker/routes/documents.js` | ✅ Con bugs fixes de la sesión 08-ago ya aplicados |
| `tracker/routes/mcp.js` | ✅ 7 herramientas Cowork |
| `tracker/routes/pricing.js` | ✅ Creado en sesión 2026-08-25 |
| `tracker/data/faddi_checklists.js` | ✅ 6 módulos dinámicos |
| `tracker/package.json` | ✅ Todas las dependencias presentes |
| `farmazed-web/portal/js/config.js` | ⏳ API_BASE correcto, Firebase config pendiente (T1) |
| `farmazed-web/portal/js/auth.js` | ✅ Firebase Auth modular SDK v10, correcto |
| `farmazed-web/portal/js/api.js` | ✅ apiFetch wrapper correcto, todos los endpoints coinciden |
| `farmazed-web/portal/js/wizard.js` | ✅ Con bugs fixes de la sesión 08-ago ya aplicados |
| `farmazed-web/admin/precios.html` | ✅ UI de precios admin — creado en sesión 2026-08-25 |
| `tracker/seed_pricing.js` | ✅ Seed de 13 categorías de precios — creado en sesión 2026-08-25 |

---

## CHECKLIST COMPLETO — START HERE

Ejecutar en este orden exacto. Cada touchpoint desbloquea el siguiente.

---

### PASO 0A — Aplicar los 2 fixes de código ANTES de copiar al repo

> Los archivos corregidos están adjuntos a este handover. Copiarlos sobre los originales.

```
fixes/index.js   →  Proyecto Farmazetd Regulatory\tracker\index.js
fixes/nginx.conf →  repo\nginx.conf
```

**Qué cambia en index.js:**
- Agrega `const pricingRouter = require('./routes/pricing'); app.use('/', pricingRouter);`
- Agrega `module.exports = { db };` al final

**Qué cambia en nginx.conf:**
- Agrega bloques `location /portal/` y `location /admin/` antes del catch-all `/`

---

### ~~PASO 0B — Integrar código al repo (T0 original)~~ ✅ YA NO NECESARIO

> Ver corrección arriba — `origin/main` ya tiene todo este código desde una sesión anterior. Dejado abajo solo como referencia histórica; no ejecutar.

**Tiempo estimado:** 30–45 min

```powershell
$src = "C:\Users\richy\Desktop\Programas en PYTON\Farmazed\Proyecto Farmazetd Regulatory"
$dst = "C:\Users\richy\Desktop\Programas en PYTON\Farmazed\repo"

# Tracker completo (reemplaza v1)
Copy-Item "$src\tracker\index.js"       "$dst\tracker\index.js" -Force
Copy-Item "$src\tracker\package.json"   "$dst\tracker\package.json" -Force
Copy-Item "$src\tracker\Dockerfile"     "$dst\tracker\Dockerfile" -Force

New-Item -ItemType Directory -Force "$dst\tracker\middleware"
Copy-Item "$src\tracker\middleware\auth.js" "$dst\tracker\middleware\auth.js"

New-Item -ItemType Directory -Force "$dst\tracker\services"
Copy-Item "$src\tracker\services\storage.js" "$dst\tracker\services\storage.js"

New-Item -ItemType Directory -Force "$dst\tracker\routes"
Copy-Item "$src\tracker\routes\cases.js"     "$dst\tracker\routes\cases.js"
Copy-Item "$src\tracker\routes\documents.js" "$dst\tracker\routes\documents.js"
Copy-Item "$src\tracker\routes\mcp.js"       "$dst\tracker\routes\mcp.js"
Copy-Item "$src\tracker\routes\pricing.js"   "$dst\tracker\routes\pricing.js"

New-Item -ItemType Directory -Force "$dst\tracker\data"
Copy-Item "$src\tracker\data\faddi_checklists.js" "$dst\tracker\data\faddi_checklists.js"
Copy-Item "$src\tracker\seed_pricing.js"           "$dst\tracker\seed_pricing.js"

# Portal y admin
Copy-Item "$src\farmazed-web\portal" "$dst\farmazed-web\portal" -Recurse -Force
Copy-Item "$src\farmazed-web\admin"  "$dst\farmazed-web\admin"  -Recurse -Force
```

**Verificar que existen:**
```bash
ls tracker/middleware/auth.js
ls tracker/routes/cases.js
ls tracker/routes/pricing.js
ls farmazed-web/portal/login.html
ls farmazed-web/admin/casos.html
```

**Commit:**
```bash
cd "C:\Users\richy\Desktop\Programas en PYTON\Farmazed\repo"
git add .
git commit -m "feat: integrate tracker v2 (API + MCP + pricing) + client portal + admin panel"
git push origin main
```

---

### PASO 1 — Firebase Project Setup (1–2 horas)

**Donde:** https://console.firebase.google.com → proyecto "farmazed"

```
1. Authentication → Sign-in method → Habilitar "Email/Password"
2. Firestore Database → Create database:
   - Region: us-central1
   - Mode: Production (locked rules — se abren en Fase 3)
3. Project Settings → General → "Add app" → Web → nickname "farmazed-portal"
4. Copiar el objeto firebaseConfig que aparece
5. Abrir: repo/farmazed-web/portal/js/config.js
   Reemplazar:
     REPLACE_WITH_YOUR_API_KEY  → apiKey real
     REPLACE_WITH_SENDER_ID     → messagingSenderId real
     REPLACE_WITH_APP_ID        → appId real
   (authDomain y projectId ya están correctos: farmazed.firebaseapp.com / farmazed)
6. git add farmazed-web/portal/js/config.js && git commit -m "config: firebase credentials for portal"
```

---

### PASO 2 — GCS Bucket (30 min)

**Donde:** GCP Console → Cloud Shell

```bash
gsutil mb -l us-central1 gs://farmazed-docs

cat > cors.json << 'EOF'
[{
  "origin": ["https://farmazed.com", "https://www.farmazed.com", "http://localhost:8092"],
  "method": ["GET", "POST", "DELETE"],
  "maxAgeSeconds": 3600,
  "responseHeader": ["Content-Type", "Authorization"]
}]
EOF

gsutil cors set cors.json gs://farmazed-docs
# El bucket queda PRIVADO — docs se sirven via signed URLs de 1h
```

---

### PASO 3 — Service Account (20 min)

**Donde:** GCP Console → IAM & Admin → Service Accounts

```
1. Crear service account: farmazed-api-sa
2. Asignar roles:
   - Cloud Datastore User (Firestore)
   - Storage Object Admin (Cloud Storage)
   - Firebase Admin SDK Administrator Service Agent
3. NO descargar JSON key para producción (Cloud Run inyecta credenciales automáticamente)
4. Para dev local: descargar JSON y setear GOOGLE_APPLICATION_CREDENTIALS
```

---

### PASO 4 — Redeploy farmazed-tracker con código v2 (15 min)

⚠️ Usar Google Cloud Shell — NO gcloud local (no funciona en esta máquina)

```bash
# En Cloud Shell:
git clone https://github.com/RichoX-Hub/Farmazed.git
# (o si ya existe: cd ~/Farmazed && git pull origin main)

cd ~/Farmazed/tracker

# Generar claves (guardar en gestor de contraseñas):
openssl rand -hex 32   # → ADMIN_KEY
openssl rand -hex 32   # → MCP_KEY

# Build y redeploy del servicio existente:
gcloud builds submit --tag gcr.io/farmazed/farmazed-tracker

gcloud run deploy farmazed-tracker \
  --image gcr.io/farmazed/farmazed-tracker \
  --region us-central1 \
  --service-account farmazed-api-sa@farmazed.iam.gserviceaccount.com \
  --set-env-vars "GCS_BUCKET=farmazed-docs,ADMIN_KEY=<tu-ADMIN_KEY>,MCP_KEY=<tu-MCP_KEY>,REDIRECT_URL=https://farmazed.com" \
  --allow-unauthenticated \
  --port 8080
```

> ⚠️ El servicio se llama **`farmazed-tracker`**, NO crear uno nuevo.
> Guardar `MCP_KEY` — se necesita en el Paso 8 para el plugin de Cowork.

**Verificar después del deploy:**
```bash
curl https://farmazed-tracker-267037695065.us-central1.run.app/health
# → {"status":"ok"}
```

---

### PASO 4.5 — Seed de precios en Firestore (5 min)

**Ejecutar UNA SOLA VEZ después del Paso 4, desde la carpeta tracker/:**

```bash
# En local (con GOOGLE_APPLICATION_CREDENTIALS configurado):
cd "C:\Users\richy\Desktop\Programas en PYTON\Farmazed\Proyecto Farmazetd Regulatory\tracker"
node seed_pricing.js
# → ✅ Seeded 13 pricing categories.

# O desde Cloud Shell (después de git pull):
cd ~/Farmazed/tracker
node seed_pricing.js
```

Este script crea la colección `pricing` en Firestore con las 13 categorías de precios. Sin esto, la página `/admin/precios.html` aparece vacía.

---

### PASO 5 — Primer Usuario Admin (5 min)

```bash
# 1. Firebase Console → Authentication → Users → Add user
#    (email + password para Zelky o Ricardo)

# 2. Copiar el UID del usuario

# 3. Asignar rol admin:
curl -X POST https://api.farmazed.com/api/admin/set-role \
  -H "x-admin-key: <ADMIN_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"uid": "<firebase_uid>", "admin": true}'
```

> Si `api.farmazed.com` aún no está mapeado al servicio, usar la URL directa del Cloud Run en su lugar.

---

### PASO 6 — Redeploy farmazed-web (20 min)

El nginx.conf ya fue actualizado en el Paso 0A. Solo hace falta redeploy:

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

### PASO 7 — Verificación End-to-End (15 min)

```
1. GET https://api.farmazed.com/health → {"status":"ok"}

2. Abrir https://farmazed.com/portal/login.html
   → Debe cargar el login de Firebase (NO el prototipo estático)
   → Registrar cuenta de prueba
   → Verificar que aparece en Firebase Console → Authentication

3. Crear caso de prueba (tramiteType: medicamentos, tipoRegistro: Regular)
   → Completar los 5 pasos del wizard
   → Verificar en Firestore: colección 'cases', status: 'submitted'

4. Subir un PDF de prueba
   → Verificar que aparece en gs://farmazed-docs

5. Abrir https://farmazed.com/admin/casos.html con usuario admin
   → Verificar que el caso aparece en la lista

6. Abrir el expediente → clicar "Abrir en Cowork" → copiar contexto generado

7. GET https://api.farmazed.com/api/admin/pricing
   → Debe retornar las 13 categorías de precios
```

---

### PASO 8 — Plugin MCP en Cowork (5 min/persona)

Para cada miembro del equipo Farmazed que use Claude Cowork:

```
1. Claude Cowork → Settings → Plugins → Add MCP Server
2. URL: https://api.farmazed.com/mcp
3. Auth: Bearer <MCP_KEY>  (generado en Paso 4)
4. Verificar: pedir a Claude "farmazed_list_cases" → debe retornar lista de casos
```

---

## Después del deploy — Prioridades Fase 3

1. **Firestore security rules** — actualmente Production (todo bloqueado excepto Admin SDK). Escribir reglas para que clientes solo lean/escriban sus propios casos.

2. **Email notifications** (SendGrid) — trigger al crear expediente, cambiar estado, solicitar documento. Agregar `SENDGRID_API_KEY` como env var en Cloud Run.

3. **Domain mapping `api.farmazed.com`** — si no está mapeado aún al servicio `farmazed-tracker`:
   ```bash
   gcloud beta run domain-mappings create \
     --service farmazed-tracker \
     --domain api.farmazed.com \
     --region us-central1
   ```

---

## Preguntas abiertas para Ricardo

- ¿Portal permite auto-registro, o Farmazed invita clientes manualmente?
- ¿Email de notificaciones (`notificaciones@farmazed.com`) o usar Gmail personal?
- ¿Panel admin protegido por contraseña separada, o solo Firebase custom claim?

---

## Bugs corregidos (Sesión 08-ago — ya en código)

- `cases.js` — submit del wizard quedaba en `draft` forever
- `cases.js` — `productName` nunca se computaba → "(sin nombre)" en todos los cards
- `cases.js` + `faddi_checklists.js` — tramiteType inválido producía `NaN%` en progreso
- `middleware/auth.js` + `index.js` — claves hardcodeadas en repo público; eliminadas
- `documents.js` — faltaba endpoint REST `POST /:caseId/documents/request`
- `admin/expediente.html` — botón "Solicitar documento" sin auth header y a ruta inexistente
- `portal/dashboard.html` — links de casos apuntaban a ruta 404
- `portal/js/wizard.js` — listener de upload se re-adjuntaba en cada refresh → uploads duplicados
- `tracker/Dockerfile` — `COPY . .` enviaba `node_modules` de Windows; agregado `.dockerignore`

## Bugs corregidos (Sesión 2026-08-25 — archivos adjuntos)

- `tracker/index.js` — `pricingRouter` no estaba montado → endpoints de precios daban 404
- `tracker/index.js` — `module.exports = { db }` agregado (no rompe nada, queda como referencia para futuros módulos)
- `repo/nginx.conf` — faltaban bloques `/portal/` y `/admin/` → portal/admin caían en marketing site
- `tracker/routes/pricing.js` — **BUG CRÍTICO (detectado por Claude Code IDE):** `const { db } = require('../index')` creaba un circular require. Node resuelve el circular require devolviendo los exports de `index.js` en el punto en que se encuentran al requerirse — que es vacío, porque `module.exports = { db }` está al final del archivo. Resultado: `db` era `undefined` en tiempo de ejecución y cada endpoint de precios lanzaba `Cannot read properties of undefined (reading 'collection')`. Fix aplicado: reemplazado por `const admin = require('firebase-admin'); const db = admin.firestore();` — el mismo patrón que usan `cases.js` y `documents.js`.

---

## Observaciones PM — Sesión 2026-08-25 (wizard en local)

> PM revisó el wizard corriendo en localhost. Anotar y resolver antes de siguiente deploy.

---

### BUG CRÍTICO — GET /api/cases/:id/documents → 500 Internal Server Error

**Síntoma:** Consola del navegador muestra dos veces:
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
GET :8080/api/cases/<caseId>/documents
```

**Impacto:** El Paso 4 (Carga Documental) no carga el checklist. El wizard queda bloqueado — ningún cliente puede avanzar más allá del Paso 3.

**Causa probable:** La ruta `GET /api/cases/:id/documents` no está implementada en el backend, o falla al consultar Firestore.

**Fix requerido:** Verificar si la ruta existe:
```bash
grep -r "documents" tracker/routes/
grep -r "checklist" tracker/routes/
```
Si no existe, implementarla. El endpoint debe:
1. Leer el caso desde Firestore por `caseId`
2. Extraer `tramiteType`, `tipoRegistro`, `tipoMedicamento`
3. Llamar a `getChecklist(tramiteType, { tipoRegistro, tipoMedicamento })` de `faddi_checklists.js`
4. Devolver `{ ok: true, documents: checklist }`

Ejemplo mínimo:
```javascript
const { getChecklist } = require('../data/faddi_checklists');

router.get('/api/cases/:caseId/documents', requireAuth, async (req, res) => {
  try {
    const snap = await db.collection('cases').doc(req.params.caseId).get();
    if (!snap.exists) return res.status(404).json({ error: 'Case not found' });
    const data = snap.data();
    const checklist = getChecklist(data.tramiteType, {
      tipoRegistro:    data.tipoRegistro    || 'Regular',
      tipoMedicamento: data.tipoMedicamento || [],
    });
    res.json({ ok: true, documents: checklist });
  } catch (err) {
    console.error('GET /api/cases/:caseId/documents error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

### UX — Paso 2 "Datos del Producto": campos libres que deben ser dropdowns

**Principio:** Solo dejar campo de texto libre cuando el valor es único por producto (nombre propio). Todo campo con catálogo finito de valores válidos → dropdown. Cuando el valor de un campo determina las opciones del siguiente → campos en cascada.

#### Bug de etiqueta
El campo "Forma Farmacéutica" aparece etiquetado como **"Forma Cosmética"** incluso en trámites de medicamentos. El label debe ser dinámico según `tramiteType`:
- `medicamentos` → "Forma Farmacéutica"
- `cosmeticos` → "Forma Cosmética"
- `higienicos` / `plaguicidas` → "Forma de Presentación"

#### Campos faltantes en pantalla actual
Comparando con los 12 campos requeridos por el proceso regulatorio, faltan:

| Campo | Tipo |
|---|---|
| Principio Activo | Texto libre |
| Concentración | Número libre + dropdown de unidad (mg / mg/mL / % / UI / mcg / g) |
| Vía de Administración | Dropdown — filtrado por Forma Farmacéutica |
| Condición de Venta | Dropdown |
| Código ATC | Texto libre (opcional) |
| Vida Útil | Dropdown |
| Condiciones de Almacenamiento | Dropdown multi-selección |

#### Campos actuales que deben convertirse a dropdown

| Campo | Acción |
|---|---|
| Clasificación (muestra "Para el dolor" como texto libre) | → Dropdown: Grupo Terapéutico |
| Forma Farmacéutica / "Forma Cosmética" | → Dropdown + activa cascada hacia Vía de Administración |
| Descripción del Envase | → Dropdown |
| Presentación del Producto | → Campo compuesto: cantidad (número) + unidad (dropdown) |

#### Lógica de cascada recomendada
Los campos se habilitan en secuencia. Forma Farmacéutica filtra las opciones de Vía de Administración:
```
Tableta / Cápsula / Jarabe / Suspensión Oral  →  Vía: Oral
Tableta Sublingual                             →  Vía: Sublingual
Solución Inyectable / Polvo para Inyectable   →  Vía: IV / IM / SC
Crema / Gel / Parche                          →  Vía: Tópica / Transdérmica
Aerosol / Polvo para Inhalación               →  Vía: Inhalatoria
Supositorio                                   →  Vía: Rectal
Óvulo / Crema Vaginal                         →  Vía: Vaginal
Colirio                                       →  Vía: Oftálmica
```

#### Catálogos completos

**Forma Farmacéutica:**
Tableta, Tableta Recubierta, Tableta de Liberación Prolongada, Cápsula, Cápsula de Gelatina Blanda, Polvo para Suspensión Oral, Granulado, Comprimido Masticable, Jarabe, Solución Oral, Suspensión Oral, Gotas Orales, Solución Inyectable, Polvo para Solución Inyectable, Suspensión Inyectable, Concentrado para Infusión, Crema, Ungüento, Gel, Loción, Solución Tópica, Parche Transdérmico, Aerosol para Inhalación, Polvo para Inhalación, Solución para Nebulización, Supositorio, Óvulo, Crema Vaginal, Colirio, Ungüento Oftálmico, Gotas Óticas, Implante, Película Oral

**Condición de Venta:**
Con Receta Médica, Sin Receta Médica (OTC), Uso Hospitalario, Producto Controlado

**Descripción del Envase:**
Frasco de Vidrio, Frasco Plástico (HDPE), Frasco Plástico (PET), Frasco Gotero, Ampolla, Vial, Caja (con blister), Blister, Strip, Tubo (Aluminio), Tubo (Plástico), Sachet/Sobre, Jeringa Precargada, Bolsa para Infusión, Tarro, Lata, Aerosol

**Unidades de Concentración:**
mg, mg/mL, mg/5mL, g, g/100mL, %, UI, mcg, mcg/mL, mEq/mL, mg/g

**Vida Útil:**
12 meses, 18 meses, 24 meses, 30 meses, 36 meses, 48 meses, 60 meses

**Condiciones de Almacenamiento (multi-selección):**
Temperatura ambiente (15–30°C), Refrigerar (2–8°C), Congelar (≤–20°C), Proteger de la luz, Proteger de la humedad, No requiere condiciones especiales

**Grupo Terapéutico:**
Sistema Nervioso Central, Sistema Cardiovascular, Sistema Respiratorio, Sistema Digestivo y Metabolismo, Antiinfecciosos, Sistema Musculoesquelético, Sistema Genitourinario y Hormonas Sexuales, Hormonas Sistémicas, Dermatológicos, Oftalmológicos y Otológicos, Antineoplásicos e Inmunomoduladores, Sistema Hematológico, Nutrición y Metabolismo, Diagnóstico y Contraste, Otros

**Tipo de Presentación:**
Unitaria, Múltiple, Institucional / Hospital

---

### Respuesta developer — BUG CRÍTICO 500 en /api/cases/:id/documents: NO reproducible

> **Claude Code IDE, 2026-08-25:** Investigado antes de implementar el fix propuesto arriba, porque no coincidía con el código real: `GET /api/cases/:id/documents` (en `documents.js`) ya existe y es un endpoint distinto de `/api/cases/:id/checklist` (en `cases.js`) — que es el que `wizard.js` realmente llama en Paso 4 (confirmado por grep, `wizard.js` nunca llama a `/documents`).
>
> Probado end-to-end con un usuario y caso de prueba reales (token real vía Identity Toolkit, no simulado): `POST /api/cases` → `GET /api/cases/:id/checklist` → `GET /api/cases/:id/documents`. Los tres devuelven `200` con datos correctos. Cero errores en los logs del servidor local (corriendo toda la sesión).
>
> Hipótesis: el PM probablemente testeó contra el `node_modules` corrupto que esta sesión encontró y arregló más temprano (faltaban archivos internos de `firebase-admin` y `whatwg-url` — cualquier ruta que tocara Firestore habría lanzado 500 con esa corrupción). Ya resuelto vía `rm -rf node_modules && npm install` limpio + `package-lock.json` commiteado.
>
> No se implementó el fix propuesto (habría agregado una ruta duplicada con semántica incorrecta — mezclar checklist y documentos). Si el 500 reaparece con node_modules limpio, avisar con el caseId y el stack trace completo del servidor para diagnosticar el caso real.

### Documentos de referencia del proceso (generados sesión 2026-08-25)

| Archivo | Contenido |
|---|---|
| `process_map.md` | Mapa completo de las 6 rutas del wizard — decisiones, documentos por path, flujo paso a paso |
| `dev_build_order.md` | Orden de desarrollo recomendado: 8 fases de menor a mayor complejidad, con criterios de aceptación por fase |

---

## Deuda técnica conocida (no urgente)

- Ownership-check duplicado en cases.js/documents.js
- `express-validator` declarado en package.json pero no usado
- Tablas de icons/URLs por tramiteType duplicadas en wizard.js, dashboard.html, casos.html, mcp.js
- Design spec (`References/Frontend Farmazed/Maindasboard.md`) más rico que lo implementado

---

## Key File Locations

| Archivo | Path | Notas |
|---|---|---|
| FADDI credentials | `References/FADDI CREDENTIALS.txt` | Credenciales reales — no exponer en logs ni commits |
| Firebase config | `farmazed-web/portal/js/config.js` | Llenar en Paso 1 |
| Deploy guide | `DEPLOY.md` | Comandos GCP completos |
| FADDI platform map | `FADDI_platform_knowledge.md` | Referencia campo por campo |
| Checklist logic | `tracker/data/faddi_checklists.js` | 6 módulos dinámicos |
| MCP tools | `tracker/routes/mcp.js` | 7 herramientas Cowork |
| Pricing route | `tracker/routes/pricing.js` | GET + PATCH admin, GET portal |
| Pricing seed | `tracker/seed_pricing.js` | Ejecutar UNA VEZ post-deploy (Paso 4.5) |
| Admin pricing UI | `farmazed-web/admin/precios.html` | Panel de gestión de precios |
