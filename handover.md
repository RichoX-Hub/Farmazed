# Farmazed — PM → Developer Handover
**Last updated:** 2026-08-25
**Prepared by:** Claude (PM)
**For:** Next development session

---

## Project State at Handover

**✅ TOUCHPOINT 0 IS RESOLVED (2026-08-25) — see correction below.** El código nuevo (tracker v2 + portal + admin) está completo, con bug fixes de la sesión 08-ago, y ahora está **pusheado a `origin/main` en GitHub** (`8285ec6..66714c0`). El repositorio real está al día. Empezar directamente en Touchpoint 1.

> **Corrección importante sobre cómo se resolvió T0:** la sesión que escribió el procedimiento de abajo (copia manual por PowerShell hacia una carpeta `repo\` separada) asumió que `Proyecto Farmazetd Regulatory\` no estaba bajo control de versiones. Eso era incorrecto — la carpeta ya era un clon git real, con `origin` apuntando a `https://github.com/RichoX-Hub/Farmazed.git` y el commit de fixes (`66714c0`) ya listo, 1 commit adelante de `origin/main`, 0 atrás, sin conflictos. Lo único que hacía falta era `git push origin main` desde esa misma carpeta — no copiar archivos a mano. El bloqueo real no era de integración de código sino de **credenciales de GitHub**: la cuenta cacheada en Git Credential Manager (`IsnotRichox`) no tenía acceso de escritura al repo. Se resolvió agregando `IsnotRichox` como colaborador en `RichoX-Hub/Farmazed` (Settings → Collaborators), tras lo cual el push normal funcionó. La carpeta `repo\` (clon separado en el mismo disco) nunca fue necesaria — ni siquiera es parte del pipeline de deploy, que en Cloud Shell hace su propio `git clone` fresco.
>
> **Pendiente para quien actúe de PM:** actualizar `PM_INSTRUCTIONS.md` — la tabla de Deployment Status todavía dice `repo\ ⚠️ OUTDATED` y el roadmap todavía marca T0 como blocker; ambos están desactualizados tras este push. También vale la pena corregir la sección "Two-Folder Architecture" ya que su premisa (carpeta de trabajo sin git) era incorrecta.

El procedimiento original (dejado abajo por referencia histórica, ya no es necesario ejecutarlo):

---

## ~~TOUCHPOINT 0 — Integrar Código al Repo~~ ✅ RESUELTO — ver nota arriba

**Tiempo estimado:** 30–45 min  
**Por qué:** El `repo\` (= GitHub = lo que se deploya) está desactualizado. Todo el código nuevo está en `Proyecto Farmazetd Regulatory\` pero nunca fue copiado al repo.

### Qué va a dónde

| Desde (`Proyecto Farmazetd Regulatory\`) | Hacia (`repo\`) | Acción |
|---|---|---|
| `tracker\index.js` | `repo\tracker\index.js` | Reemplazar (v1→v2) |
| `tracker\package.json` | `repo\tracker\package.json` | Reemplazar |
| `tracker\Dockerfile` | `repo\tracker\Dockerfile` | Reemplazar |
| `tracker\middleware\auth.js` | `repo\tracker\middleware\auth.js` | Nuevo directorio + archivo |
| `tracker\services\storage.js` | `repo\tracker\services\storage.js` | Nuevo directorio + archivo |
| `tracker\routes\cases.js` | `repo\tracker\routes\cases.js` | Nuevo directorio + archivo |
| `tracker\routes\documents.js` | `repo\tracker\routes\documents.js` | Nuevo archivo |
| `tracker\routes\mcp.js` | `repo\tracker\routes\mcp.js` | Nuevo archivo |
| `tracker\data\faddi_checklists.js` | `repo\tracker\data\faddi_checklists.js` | Nuevo directorio + archivo |
| `farmazed-web\portal\` (carpeta completa) | `repo\farmazed-web\portal\` | Nueva carpeta |
| `farmazed-web\admin\` (carpeta completa) | `repo\farmazed-web\admin\` | Nueva carpeta |

### Comandos (PowerShell desde la raíz del workspace)

```powershell
$src = "C:\Users\richy\Desktop\Programas en PYTON\Farmazed\Proyecto Farmazetd Regulatory"
$dst = "C:\Users\richy\Desktop\Programas en PYTON\Farmazed\repo"

# 1. Copiar tracker completo (reemplaza v1 y agrega todo lo nuevo)
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

New-Item -ItemType Directory -Force "$dst\tracker\data"
Copy-Item "$src\tracker\data\faddi_checklists.js" "$dst\tracker\data\faddi_checklists.js"

# 2. Copiar portal y admin (carpetas completas)
Copy-Item "$src\farmazed-web\portal" "$dst\farmazed-web\portal" -Recurse -Force
Copy-Item "$src\farmazed-web\admin"  "$dst\farmazed-web\admin"  -Recurse -Force
```

### Actualizar nginx.conf en el repo

El `repo\nginx.conf` actual solo tiene el bloque de marketing y el redirect `/qr`. Agregar las rutas del portal y admin:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html/farmazed-web;
    index index.html;

    location = /qr {
        return 302 https://farmazed-tracker-267037695065.us-central1.run.app/qr;
    }

    location /portal/ {
        root /usr/share/nginx/html/farmazed-web;
        try_files $uri $uri/ /portal/login.html;
    }

    location /admin/ {
        root /usr/share/nginx/html/farmazed-web;
        try_files $uri $uri/ /admin/casos.html;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Commit al repo

```bash
cd "C:\Users\richy\Desktop\Programas en PYTON\Farmazed\repo"
git add .
git commit -m "feat: integrate tracker v2 (API + MCP) + client portal + admin panel"
git push origin main
```

### Verificar antes de continuar

```bash
# Confirmar que los archivos existen en el repo:
ls tracker/middleware/auth.js
ls tracker/routes/cases.js
ls farmazed-web/portal/login.html
ls farmazed-web/admin/casos.html
```

---

## TOUCHPOINT 1 — Firebase Project Setup (1–2 horas)

**Donde:** https://console.firebase.google.com → proyecto "farmazed"

```
1. Authentication → Sign-in method → Habilitar "Email/Password"
2. Firestore Database → Create database:
   - Region: us-central1
   - Mode: Production (locked rules — se abren en Fase 3)
3. Project Settings → General → "Add app" → Web → nickname "farmazed-portal"
4. Copiar el objeto firebaseConfig que aparece
5. Abrir: repo/farmazed-web/portal/js/config.js
   Reemplazar los REPLACE_WITH_* con los valores reales:
   apiKey, messagingSenderId, appId
   (authDomain y projectId ya están correctos)
6. Guardar y commit
```

---

## TOUCHPOINT 2 — GCS Bucket (30 min)

**Donde:** GCP Console → Cloud Storage (o Cloud Shell)

```bash
# En Cloud Shell:
gsutil mb -l us-central1 gs://farmazed-docs

# Crear cors.json:
cat > cors.json << 'EOF'
[{
  "origin": ["https://farmazed.com", "https://www.farmazed.com", "http://localhost:8092"],
  "method": ["GET", "POST", "DELETE"],
  "maxAgeSeconds": 3600,
  "responseHeader": ["Content-Type", "Authorization"]
}]
EOF

gsutil cors set cors.json gs://farmazed-docs
# El bucket queda PRIVADO. Los docs se sirven via signed URLs de 1h.
```

---

## TOUCHPOINT 3 — Service Account (20 min)

**Donde:** GCP Console → IAM & Admin → Service Accounts

```
1. Crear service account: farmazed-api-sa
2. Asignar roles:
   - Cloud Datastore User (Firestore)
   - Storage Object Admin (Cloud Storage)
   - Firebase Admin SDK Administrator Service Agent
3. En Cloud Run (cuando se deploya): Security → Service account → farmazed-api-sa
   No descargar JSON key para producción — Cloud Run inyecta credenciales automáticamente
4. Para dev local: descargar JSON y apuntar GOOGLE_APPLICATION_CREDENTIALS a él
```

---

## TOUCHPOINT 4 — Deploy Backend API → api.farmazed.com (30 min)

**Donde:** Google Cloud Shell — ⚠️ NO usar gcloud local, no funciona en esta máquina

```bash
# En Cloud Shell:
git clone https://github.com/RichoX-Hub/Farmazed.git
# (o si ya existe: cd ~/Farmazed && git pull origin main)

cd ~/Farmazed/tracker

# Generar claves seguras (guardar en gestor de contraseñas):
openssl rand -hex 32   # → ADMIN_KEY
openssl rand -hex 32   # → MCP_KEY

# Build:
gcloud builds submit --tag gcr.io/farmazed/farmazed-api

# Deploy:
gcloud run deploy farmazed-api \
  --image gcr.io/farmazed/farmazed-api \
  --region us-central1 \
  --service-account farmazed-api-sa@farmazed.iam.gserviceaccount.com \
  --set-env-vars "GCS_BUCKET=farmazed-docs,ADMIN_KEY=<tu-clave>,MCP_KEY=<tu-clave>,REDIRECT_URL=https://farmazed.com" \
  --allow-unauthenticated \
  --port 8080

# Mapear api.farmazed.com:
gcloud beta run domain-mappings create \
  --service farmazed-api \
  --domain api.farmazed.com \
  --region us-central1
```

> Guardar MCP_KEY — se necesita en Touchpoint 8 para el plugin de Cowork.

---

## TOUCHPOINT 5 — Primer Usuario Admin (5 min)

```bash
# 1. Firebase Console → Authentication → Users → Add user
#    (email + password para Zelky o Ricardo)

# 2. Copiar el UID del usuario de la lista

# 3. Asignar rol admin:
curl -X POST https://api.farmazed.com/api/admin/set-role \
  -H "x-admin-key: <ADMIN_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"uid": "<firebase_uid>", "admin": true}'
```

---

## TOUCHPOINT 6 — Redeploy farmazed-web (20 min)

El nginx.conf ya fue actualizado en Touchpoint 0. Solo hace falta redeploy:

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

## TOUCHPOINT 7 — Verificación End-to-End (15 min)

```
1. GET https://api.farmazed.com/health → {"status":"ok"}

2. Abrir https://farmazed.com/portal/login.html
   → Registrar cuenta de prueba
   → Verificar que aparece en Firebase Console → Authentication

3. Crear caso de prueba (tramiteType: medicamentos, tipoRegistro: Regular)
   → Completar los 5 pasos del wizard
   → Verificar que aparece en Firestore (colección: cases, status: submitted)

4. Subir un PDF de prueba
   → Verificar que aparece en gs://farmazed-docs

5. Abrir https://farmazed.com/admin/casos.html con usuario admin
   → Verificar que el caso aparece

6. Abrir el expediente → clicar "Abrir en Cowork" → copiar contexto generado
```

---

## TOUCHPOINT 8 — Plugin MCP en Cowork (5 min/persona)

Para cada miembro del equipo Farmazed que use Claude Cowork:

```
1. Claude Cowork → Settings → Plugins → Add MCP Server
2. URL: https://api.farmazed.com/mcp
3. Auth: Bearer <MCP_KEY>  (el generado en Touchpoint 4)
4. Verificar: pedir a Claude "farmazed_list_cases" → debe retornar lista de casos
```

---

## Después de Fase 2 — Prioridades Fase 3

Una vez deployado y verificado, en este orden:

1. **Firestore security rules** — actualmente en modo Production (todo bloqueado excepto Admin SDK). Escribir reglas para que los clientes solo lean/escriban sus propios casos.

2. **Email notifications** (SendGrid) — trigger al crear expediente, cambiar estado, solicitar documento. Agregar `SENDGRID_API_KEY` como env var en Cloud Run.

3. **Revisar client-dashboard.html** (73KB en raíz de farmazed-web/) — determinar si duplica `portal/dashboard.html` o tiene otro propósito.

---

## Preguntas abiertas para Ricardo

- ¿Portal permite auto-registro, o Farmazed invita clientes manualmente?
- ¿Email de notificaciones (`notificaciones@farmazed.com`) o usar Gmail personal?
- ¿Panel admin protegido por contraseña separada, o solo Firebase custom claim?

---

## Bugs corregidos (Sesión 08-ago — ya aplicados en `Proyecto Farmazetd Regulatory\`)

Los siguientes bugs fueron encontrados y corregidos. El código en `Proyecto Farmazetd Regulatory\` ya tiene los fixes. Al hacer el Touchpoint 0 (integración al repo), estos fixes van incluidos automáticamente.

- `cases.js` — submit del wizard quedaba en `draft` forever (faltaba `status` en `CLIENT_FIELDS`)
- `cases.js` — `productName` nunca se computaba en GET /cases → "(sin nombre)" en todos los cards
- `cases.js` + `faddi_checklists.js` — tramiteType inválido producía `NaN%` en barras de progreso
- `middleware/auth.js` + `index.js` — claves hardcodeadas (`fz-mcp-2026`) en repo público; eliminadas
- `documents.js` — faltaba endpoint REST `POST /:caseId/documents/request` (solo existía como MCP tool)
- `admin/expediente.html` — botón "Solicitar documento" llamaba fetch sin auth header y a ruta inexistente
- `portal/dashboard.html` — links de casos apuntaban a `/portal/expediente.html` (404); redirigido a wizard con `?caseId=`
- `portal/js/wizard.js` — listener de upload se re-adjuntaba en cada refresh → uploads duplicados
- `tracker/Dockerfile` — `COPY . .` iba a enviar `node_modules` de Windows al container Linux; agregado `.dockerignore`

---

## Deuda técnica conocida (no urgente)

- Ownership-check duplicado en cases.js/documents.js — sin bug activo, riesgo latente
- `express-validator` declarado en package.json pero nunca usado
- Tablas de icons/URLs por tramiteType duplicadas en wizard.js, dashboard.html, casos.html, mcp.js
- Design spec (`References/Frontend Farmazed/Maindasboard.md`) describe dashboard más rico que lo implementado — pendiente decidir si se construye hacia el spec o se actualiza el spec

---

## Key File Locations

| Archivo | Path | Notas |
|---|---|---|
| FADDI credentials | `References/FADDI CREDENTIALS.txt` | Credenciales reales — no exponer en logs ni commits |
| Firebase config | `farmazed-web/portal/js/config.js` | Llenar en T1 |
| Deploy guide | `DEPLOY.md` | Comandos GCP completos |
| FADDI platform map | `FADDI_platform_knowledge.md` | Referencia campo por campo |
| Checklist logic | `tracker/data/faddi_checklists.js` | 6 módulos dinámicos |
| MCP tools | `tracker/routes/mcp.js` | 7 herramientas Cowork |
