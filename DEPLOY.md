# Farmazed — Deployment Guide

## Repositorio
- **GitHub:** https://github.com/RichoX-Hub/Farmazed
- **Branch:** `main`
- **Visibilidad:** Público (requerido para clone en Cloud Shell sin auth)

---

## Producción — Google Cloud Run

### Datos del proyecto
| Campo | Valor |
|-------|-------|
| GCP Project ID | `farmazed` |
| Project Number | `267037695065` |
| Region | `us-central1` |
| Service | `farmazed-web` |
| Service URL | `https://farmazed-web-267037695065.us-central1.run.app` |
| Dominio principal | `https://farmazed.com` |
| Dominio www | `https://www.farmazed.com` |

### DNS — Cloud DNS
- **Zona:** `farmazed-zone`
- **Nameservers:**
  - `ns-cloud-e1.googledomains.com`
  - `ns-cloud-e2.googledomains.com`
  - `ns-cloud-e3.googledomains.com`
  - `ns-cloud-e4.googledomains.com`
- **Registrador:** Squarespace (migrado desde Google Domains)

### Registros DNS configurados
| Nombre | Tipo | Valor |
|--------|------|-------|
| `farmazed.com.` | A | `216.239.32.21`, `216.239.34.21`, `216.239.36.21`, `216.239.38.21` |
| `www.farmazed.com.` | CNAME | `ghs.googlehosted.com.` |

### Domain Mappings en Cloud Run
```
farmazed.com     → farmazed-web (us-central1)
www.farmazed.com → farmazed-web (us-central1)
```

### Cómo redesplegar (desde Google Cloud Shell)

> **IMPORTANTE:** La auth local (`gcloud auth login`) no funciona en esta máquina.
> Usar siempre **Cloud Shell** en console.cloud.google.com

```bash
# 1. Clonar o actualizar el repo
git clone https://github.com/RichoX-Hub/Farmazed.git
# o si ya existe:
cd ~/Farmazed && git pull origin main

# 2. Ir a la carpeta raíz del proyecto
cd ~/Farmazed

# 3. Desplegar
gcloud run deploy farmazed-web \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 80 \
  --memory 256Mi \
  --quiet
```

### Permisos requeridos (ya configurados)
- Service account `267037695065-compute@developer.gserviceaccount.com` tiene:
  - `roles/cloudbuild.builds.builder`
  - `roles/storage.admin`
  - `roles/run.invoker` para `allUsers`
- Org policy `iam.allowedPolicyMemberDomains` → Override: Allow All (proyecto farmazed)
- DNSSEC: **Deshabilitado** en el dominio

### Verificar estado del dominio
```bash
gcloud beta run domain-mappings describe --domain farmazed.com --region us-central1
gcloud beta run domain-mappings describe --domain www.farmazed.com --region us-central1
gcloud dns record-sets list --zone=farmazed-zone
```

---

## Local — Docker Desktop

### Datos del contenedor
| Campo | Valor |
|-------|-------|
| Nombre | `farmazed-web` |
| Puerto | `http://localhost:8092` |
| Imagen base | `nginx:alpine` |
| Dockerfile | `./Dockerfile` |
| Build context | `.` (raíz del proyecto) |

### Estructura nginx (local y producción)
```
root: /usr/share/nginx/html/farmazed-web
index: index.html
location /: try_files $uri $uri/ /index.html
```

### Comandos locales

```bash
# Construir y levantar
cd "Proyecto Farmazetd Regulatory/"
docker compose up --build -d

# Ver logs
docker logs farmazed-web

# Detener
docker compose down

# Reiniciar sin rebuild
docker compose restart
```

### Nota sobre el stack LOCAL-DOCKER.md
Este contenedor corre en el puerto `8092` para no colisionar con el stack principal de `pb-website`. No modifica `LOCAL-DOCKER.md`.

---

## Flujo de trabajo recomendado

```
1. Editar archivos en farmazed-web/
2. Probar local: docker compose up --build -d → localhost:8092
3. Commit y push: git add . && git commit -m "..." && git push origin main
4. Desplegar: Cloud Shell → git pull && gcloud run deploy ...
5. Verificar en farmazed.com
```

---

## Archivos clave
| Archivo | Propósito |
|---------|-----------|
| `Dockerfile` | Build nginx:alpine, copia farmazed-web/ como root |
| `nginx.conf` | Sirve farmazed-web/ en `/`, subpaths funcionan directamente |
| `docker-compose.yml` | Contenedor local puerto 8092 |
| `farmazed-web/` | Todo el sitio web (self-contained) |
| `farmazed-web/css/farmazed.css` | Overrides y responsive CSS |
| `farmazed-web/src/approx/` | Approx admin template (dashboards) |
| `farmazed-web/src/wecare/` | WeCare frontend template (landing) |
| `farmazed-web/src/images/` | Imágenes del sitio (Logo.png, About1-6.png, etc.) |
| `farmazed-web/src/icons/` | Iconos de categorías regulatorias |
