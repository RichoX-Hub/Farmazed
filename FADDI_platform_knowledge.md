# FADDI / DNFD Digital — Knowledge Base Completo
**Portal:** https://sisregsan.minsa.gob.pa  
**Capturado:** Mayo 2026 · Sesión activa: ZELKY MARIN ALVARADO  
**Propósito:** Referencia técnica exhaustiva para el diseño del sistema Farmazed.

---

## 1. ARQUITECTURA GENERAL DEL PORTAL

### Stack técnico observado
- **Framework:** ASP.NET WebForms (.aspx pages)
- **AJAX:** ASP.NET AJAX Control Toolkit — tabs implementados con clases `ajax__tab_*`
- **Autenticación:** Sesión basada en cookies de servidor (ASP.NET Session)
- **CAPTCHA:** Imagen alfanumérica generada en servidor (6 caracteres, no reCAPTCHA)
- **Validaciones:** Mensajes inline pre-renderizados en HTML, ocultos hasta disparo de validación
- **Búsqueda de entidades:** AJAX postback al servidor para fabricantes, empresas, personas, etc.
- **Adjuntos:** Upload directo al servidor — máx. 50 MB por archivo

### URLs del sistema
```
/Default.aspx                              → Inicio público
/forms/account/login.aspx                 → Login / CAPTCHA
/forms/user/index.aspx                    → Dashboard autenticado
/forms/user/medicamentos/registrar.aspx   → Crear solicitud Medicamentos
/forms/user/medicamentos/index.aspx       → Seguimiento Medicamentos
/forms/user/cosmeticos/registrar.aspx     → Crear solicitud Cosméticos
/forms/user/cosmeticos/index.aspx         → Seguimiento Cosméticos
/forms/user/higienicos/registrar.aspx     → Crear solicitud Higiénicos
/forms/user/higienicos/index.aspx         → Seguimiento Higiénicos
/forms/user/plaguicidas/registrar.aspx    → Crear solicitud Plaguicidas
/forms/user/plaguicidas/index.aspx        → Seguimiento Plaguicidas
/forms/user/excepcion/registrar.aspx      → Crear solicitud Excepción
/forms/user/excepcion/index.aspx          → Seguimiento Excepción
/forms/user/publicidad/registrar.aspx     → Crear solicitud Publicidad
/forms/user/publicidad/index.aspx         → Seguimiento Publicidad
```

---

## 2. ÁREA PÚBLICA (sin login)

### Página de inicio (`/Default.aspx`)
**Tarjeta izquierda — Acceso:**
- Botón: "Acceder" → redirige a login
- Botón: "Registrarse" → registro de nuevo usuario

**Tarjeta derecha — Consulta y Validación:**
- Botón: "Consulta de Registros Sanitarios" → requiere login
- Botón: "Consulta de Solicitudes" (dropdown) → requiere login
- Botón: "Consulta Excepción al Registro" → requiere login

**Menú Consultas (público):**
- Registros Sanitarios / Excepción al Registro / Solicitudes
- Medicamentos / Cosméticos / Higiénicos / Plaguicidas
- **Todos redirigen al login al hacer clic**

### Login (`/forms/account/login.aspx`)
| Campo | Tipo | Notas |
|-------|------|-------|
| Usuario | Texto (email) | — |
| Contraseña | Password | — |
| Código de verificación | Imagen | CAPTCHA alfanumérico, 6 chars |
| Ingrese el código | Texto | Validación contra imagen |
| Botón Acceder | Submit | — |

Links: "¿Olvidó su contraseña?" · "Regístrese aquí"

---

## 3. DASHBOARD AUTENTICADO (`/forms/user/index.aspx`)

**Saludo:** "¡Bienvenido! Usuario: [NOMBRE]"

### Navbar (autenticado)
```
Inicio  |  Procesos ▼  |  Consultas ▼  |  [Nombre Usuario] ▼
```

**Menú Procesos ▼:**
```
Trámites:
  01 | Trámites de Excepciones
  02 | Trámites de Publicidades
Registro Sanitario:
  03 | Trámites de Medicamentos
  04 | Trámites de Cosméticos
  05 | Trámites de Higiénicos
  06 | Trámites de Plaguicidas
```

**Menú Consultas ▼:**
```
Trámites:
  01 | Excepciones
  02 | Publicidad
Registro Sanitario:
  03 | Medicamentos
  04 | Cosméticos
  05 | Higiénicos
  06 | Plaguicidas
```

### 6 Tarjetas de módulo
| Módulo | Crear Solicitud | Solicitudes Tramitadas |
|--------|----------------|------------------------|
| Medicamentos | ✓ | ✓ |
| Cosméticos | ✓ | ✓ |
| Higiénicos | ✓ | ✓ |
| Plaguicidas | ✓ | ✓ |
| Excepción | ✓ | ✓ |
| Publicidad | ✓ | ✓ |

---

## 4. FORMULARIO MEDICAMENTOS (WIZARD 16 PASOS)

**URL:** `/forms/user/medicamentos/registrar.aspx`  
**Tipo:** Wizard con **14 tabs** (Pasos agrupados: "Paso 1 y 2", "Paso 3"..."Paso 14", "Paso 15 y 16")  
**Navegación:** Libre entre tabs — sin validación en cascada. Botones ← → en cada panel.

### TAB 1 — Paso 1 y 2

**Sección 1: DATOS DE LA SOLICITUD**
| Campo | Tipo | Opciones |
|-------|------|----------|
| 1.1 Tipo de Solicitud | Dropdown | Nuevo Registro · Renovación Sin Cambios · Renovación Con Cambios |
| 1.2 Tipo de Registro | Dropdown | Regular · Abreviado · Reconocimiento Mutuo · Reconocimiento WLA |

**Sección 2: TIPO DE MEDICAMENTO**
| Campo | Tipo | Opciones |
|-------|------|----------|
| 2.1 Seleccione Tipo de Medicamento | Checkboxes (múltiple) | Síntesis Química · Biotecnológicos · Homeopáticos · Huérfanos · Radiofármacos · Biológicos · Suplemento Con Propiedad Terapéutica · Producto Natural Medicinal · Producto Hemoderivado · Vacuna · Alérgeno · Medio de Contraste · Cannabis |

### TAB 2 — Paso 3

**Sección 3.1: DATOS DEL PRODUCTO**
| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| 3.1.1 Nombre de Producto | Texto | Sí | — |
| 3.1.2 Nombre del Principio Activo (DCI) | Texto | Sí | — |
| 3.1.3 Concentración | Texto | Sí | — |
| 3.1.4 Forma Farmacéutica | Dropdown | Sí | **792 opciones** (ver catálogo §8) |
| 3.1.5 Vía de Administración | Dropdown | Sí | ~100+ opciones (ver catálogo §8) |
| 3.1.6 Condición de Venta | Dropdown | Sí | Con Prescripción Médica · Sin Prescripción Médica · Venta Libre o Venta Popular · Con Prescripción Médica Controlada |
| 3.1.7 Código ATC | Texto | No | — |
| 3.1.8 Descripción de Envase | Texto | No | — |
| 3.1.9 Vida Útil | Texto | No | — |
| 3.1.10 Condiciones de Almacenamiento | Área texto | No | — |

**Sección 3.2: PRESENTACIONES** *(sub-formulario repetible)*
| Campo | Tipo | Notas |
|-------|------|-------|
| 3.2.1 Tipo de Presentación | Radio | Comercial · Muestra Médica · Hospitalaria |
| 3.2.2 Descripción de la Presentación | Texto | Ej: CAJA CON 30 TABLETAS RECUBIERTAS · CAJA CON VIAL + DILUYENTE · ENVASE DE 100 ML · CAJA CON TUBO DE 10 G |
| 3.2.3 Documento (arte de empaque) | Archivo | Máx 50 MB — botón "Subir Presentación" |

### TAB 3 — Paso 4: FABRICANTES

**Sección 4.1: EMPRESA FABRICANTE** *(obligatorio)*
| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| 4.1.1 Correo Electrónico | Email | Sí | Botón "Buscar Fabricante" (BD interna) |
| 4.1.2 Nombre | Texto | Sí | — |
| 4.1.3 País | Dropdown | No | 244 países |
| 4.1.4 Dirección | Área texto | Sí | — |

**Sección 4.2: FABRICANTE DEL DILUYENTE** *(opcional — "Si no lleva Fabricante del Diluyente no llenar los campos")*  
Mismos 4 campos. Campos no obligatorios.

**Sección 4.3: FABRICANTE DEL PRINCIPIO ACTIVO** *(opcional — "Si no lleva Fabricante del Principio Activo no llenar los campos")*  
Mismos 4 campos. Campos no obligatorios.

### TAB 4 — Paso 5: ACONDICIONADOR

| Campo | Tipo | Notas |
|-------|------|-------|
| 5.1 Tipo de Acondicionador | Radio | No Aplica (El Fabricante Es Acondicionador Primario y Secundario) · Primario y Secundario Diferentes · Primario y Secundario Iguales |
| 5.1.2.1 Correo / Nombre / País / Dirección (Primario) | Email+Texto | Botón "Buscar Acondicionador Primario" — aparece si tipo ≠ No Aplica |
| 5.1.3.1 Correo / Nombre / País / Dirección (Secundario) | Email+Texto | Botón "Buscar Acondicionador Secundario" — aparece si tipo = Diferentes |

### TAB 5 — Paso 6: TITULAR

| Campo | Tipo | Notas |
|-------|------|-------|
| 6.1 Correo Electrónico | Email | Botón "Buscar Titular" |
| 6.2 Nombre | Texto | — |
| 6.3 País | Dropdown | 244 países |
| 6.4 Dirección | Área texto | — |

### TAB 6 — Paso 7: DISTRIBUIDOR(ES)

| Campo | Tipo | Notas |
|-------|------|-------|
| 7.1 Número de Licencia | Texto | Botón "Buscar Distribuidor" — tabla repetible para múltiples distribuidores panameños |

### TAB 7 — Paso 8: EMPRESA SOLICITANTE

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| 8.1 Número de RUC | Texto | No — Botón "Buscar Empresa" |
| 8.2 Nombre | Texto | Sí |
| 8.3 Teléfono de Contacto | Texto | Sí |
| 8.4 Correo Electrónico | Email | Sí — validación formato |
| 8.5 Dirección | Área texto | Sí |

### TAB 8 — Paso 9: REPRESENTANTE LEGAL DEL PRODUCTO

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| 9.1 Número de Cédula | Texto | No — Botón "Buscar Representante" |
| 9.2 Nombre | Texto | Sí |
| 9.3 Teléfono de Contacto | Texto | Sí |
| 9.4 Correo Electrónico | Email | Sí — validación formato |
| 9.5 Dirección | Área texto | Sí |

### TAB 9 — Paso 10: ABOGADO

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| 10.1 Número de Cédula | Texto | No — Botón "Buscar Abogado" |
| 10.2 Nombre | Texto | No |
| 10.3 Teléfono de Contacto | Texto | No |
| 10.4 Correo Electrónico | Email | No |
| 10.5 Dirección | Área texto | No |
| 10.6 Número de Idoneidad | Texto | No |

### TAB 10 — Paso 11: FARMACÉUTICO + RCPR

**Sección 11.1: FARMACÉUTICO**
| Campo | Tipo |
|-------|------|
| 11.1.1 Número de Cédula | Texto — Botón "Buscar Farmacéutico" |
| 11.1.2 Número de Idoneidad | Texto |
| 11.1.3 Nombre | Texto |
| 11.1.4 Teléfono de Contacto | Texto |
| 11.1.5 Correo Electrónico | Email |
| 11.1.6 Dirección | Área texto |

**Sección 11.2: RESPONSABLE DE LOS CONTROLES POST-REGISTRO (RCPR)**  
Mismos 6 campos — Botón "Buscar". Profesional designado ante DNFD.

### TAB 11 — Paso 12: MONOGRAFÍA

| Campo | Tipo |
|-------|------|
| 12.1 Indicaciones Terapéuticas | Área texto |
| 12.2 Contraindicaciones | Área texto |

### TAB 12 — Paso 13: BIOEQUIVALENCIA

| Campo | Tipo | Opciones |
|-------|------|----------|
| 13.1 Requiere bioequivalencia | Dropdown | NO · SI |
| 13.2 Tipo de Solicitud | Dropdown | Nuevo Registro · Renovación |
| Clasificación biofarmacéutica | Dropdown | Clase 1 · Clase 2 · Clase 3 · Clase 4 |
| Tipo de Procedimiento (Med. Intercambiable) | Radio | Procedimiento Regular · Procedimiento Abreviado |
| Nombre del Medicamento de Referencia | Texto | — |
| Laboratorio fabricante del Medicamento Ref. | Texto | — |
| País de origen del Medicamento Ref. | Dropdown | 244 países |
| Número de lote del Medicamento Ref. | Texto | — |
| Fecha de caducidad del Medicamento Ref. | Fecha | — |
| Centro(s) del estudio — Nombre / Tipo / Dirección | Texto | — |

> Nota: Estos campos solo son relevantes si 13.1 = SI.

### TAB 13 — Paso 14: FARMACOVIGILANCIA + EVALUADOR

**Sección 14.1: RESPONSABLE DE FARMACOVIGILANCIA ante el CNFV**
| Campo | Tipo |
|-------|------|
| 14.1.1 Nombre | Texto |
| 14.1.2 Número de Cédula | Texto |
| 14.1.3 Correo Electrónico | Email — validación formato |
| 14.1.4 Dirección | Área texto |

**Sección 14.2: OTRA INFORMACIÓN** *(etiquetada "será llenado por el evaluador asignado")*
| Campo | Tipo | Opciones |
|-------|------|----------|
| 14.2.1 Certificado de Dietilenglicol | Dropdown | NO · SI |
| 14.2.2 Psicotrópico o Estupefaciente | Dropdown | NO · SI |
| 14.2.3 Aspecto Físico del Producto | Texto | — |
| 14.2.4 Droga Nueva | Texto | — |
| 14.2.5 Observaciones de la Fórmula | Texto | — |
| 14.2.6 Inserto | Dropdown | NO · SI |

> ⚠️ Esta sección aparece en el formulario del solicitante pero está designada para el evaluador DNFD.

### TAB 14 — Paso 15 y 16: DOCUMENTOS + CULMINACIÓN

**Sección 15: DOCUMENTOS ADJUNTOS** *(repetible, múltiples archivos)*
| Campo | Tipo | Notas |
|-------|------|-------|
| 15.1 Tipo de Documento | Dropdown | **34 tipos** (ver §6.1) |
| 15.2 Nombre del Documento | Texto | Nombre libre |
| 15.3 Documento | Archivo | Máx 50 MB — botón "Subir Documento" |

**Sección 16.1: CULMINACIÓN DEL TRÁMITE**
| Campo | Tipo | Notas |
|-------|------|-------|
| 16.1.1 Recibo de pago del CNF | Archivo | Máx 50 MB — botón "Subir Recibo" |
| 16.1.2 Datos Protegidos | Dropdown | NO · SI |

**Sección 16.2: DECLARACIÓN JURADA**  
Texto fijo: *"Declaro bajo juramento que la información suministrada a través de esta solicitud es correcta."*

---

## 5. FORMULARIO COSMÉTICOS (PÁGINA ÚNICA)

**URL:** `/forms/user/cosmeticos/registrar.aspx`  
**Tipo:** Página única con scroll (sin tabs/wizard)  
**13 secciones numeradas**

| # | Sección | Campos clave | Diferencia vs. Medicamentos |
|---|---------|-------------|----------------------------|
| 1 | DATOS DE LA SOLICITUD | 1.1 Tipo Solicitud: Nuevo Registro · Renovación Sin Cambios · Renovación Con Cambios | Sin "Tipo de Registro" (no hay Abreviado/WLA) |
| 2 | DATOS DEL PRODUCTO | Nombre · Variante · Vía Adm · Clasificación · Desc. Envase · Forma Cosmética | Campo "Variante" (para tonos/fragancias). Sin Principio Activo ni Concentración |
| 3 | FABRICANTE(S) | Correo · Nombre · País · Dirección + "Agregar Fabricante" | Repetible para múltiples fabricantes |
| 4 | ACONDICIONADOR | Checkbox "Sin Acondicionador" · Tipo · Correo · Nombre · País · Dir | Tipo: Primario/Secundario/Primario-Secundario (un solo campo) |
| 5 | TITULAR | Correo · Nombre · País · Dirección | Igual |
| 6 | DISTRIBUIDOR(ES) | N° Licencia + Buscar | Igual |
| 7 | EMPRESA SOLICITANTE | RUC · Nombre · Tel · Correo · Dir | Igual |
| 8 | REPRESENTANTE LEGAL | Cédula · Nombre · Tel · Correo · Dir | Igual |
| 9 | ABOGADO | Cédula · Nombre · Tel · Correo · Dir · Idoneidad | Igual |
| 10 | FARMACÉUTICO | Cédula · Nombre · Tel · Correo · Dir · Idoneidad · **Refrendo CNF (archivo)** | ⚠️ 10.7 Refrendo del CNF obligatorio como archivo — no existe en Medicamentos |
| 11 | ADJUNTOS | Tipo Doc (7 tipos) · Nombre · Archivo 50MB | Solo 7 tipos vs 34 en Medicamentos |
| 12 | PRESENTACIONES | Tipo (Comercial · Muestra Promocional) · Nombre · Archivo | "Muestra Promocional" vs "Muestra Médica/Hospitalaria" |
| 13 | CONFIRMACIÓN | Declaración Jurada | Igual |

### Catálogos específicos de Cosméticos

**2.3 Vía de Administración:** `EXTERNO · TÓPICO`

**2.4 Clasificación (13 categorías):**
```
PRODUCTOS DESODORANTES Y ANTITRANSPIRANTES
PRODUCTOS PARA BEBÉS-NIÑOS
PRODUCTOS PARA EL ÁREA DE LOS OJOS
PRODUCTOS PARA EL ASEO E HIGIENE CORPORAL
PRODUCTOS PARA EL BRONCEADO Y PROTECCIÓN SOLAR
PRODUCTOS PARA EL CABELLO
PRODUCTOS PARA LAS CEJAS
PRODUCTOS PARA LAS MANOS
PRODUCTOS PARA LAS UÑAS
PRODUCTOS PARA LOS LABIOS
PRODUCTOS PARA USO BUCAL Y DENTAL
PRODUCTOS PARA USO CORPORAL
PRODUCTOS PARA USO FACIAL
```

**2.6 Forma Cosmética (65 opciones):**
```
ACEITE · ACONDICIONADOR · AEROSOL · AGUA MICELAR · BÁLSAMO · BANDA DEPILATORIA
BARRA · BASE DE MAQUILLAJE · BRILLOS PARA LAS UÑAS · CERA · COLONIAS · CONCENTRADO
CORRECTORES · CREMA · CREMA-GEL · DELINEADOR · DESODORANTES
DESODORANTES Y ANTITRANSPIRANTES · EMULSIÓN · ENJUAGUES BUCALES (NO MEDICADOS)
ESMALTE · ESPUMA · EXFOLIANTE · FIJADOR · FLUIDO CON BASE ACUOSA · GEL · GRANULADO
HILO DENTAL · JABONES · LABIAL (LIP) · LACA · LÁPIZ · LECHE · LÍQUIDO
LÍQUIDO VISCOSO · LOCIÓN · MASCARAS PARA PESTAÑAS · MASCARILLAS · MICROESFERAS
MOUSSE · PAÑAL · PARCHE · PASTA · PERFUME · PERLAS · PLUMA · POLVO · POMADA
PROTECTOR SOLAR · REPELENTE · ROLL-ON · RUBORES · SALES · SERUM/SUERO
SHAMPOO / CHAMPÚ · SÓLIDO · SOLUCIÓN · SOMBRAS DE OJOS
SOPORTES IMPREGNADOS (MASCARILLAS, TOALLITAS Y OTROS) · SPRAY · SUERO / SERUM
SUSPENSIÓN · TALCO · TOALLA SANITARIA/TAMPONES · TONICO
```

---

## 6. INVENTARIOS DOCUMENTALES

### 6.1 Medicamentos — 34 tipos de documento (Paso 15)
```
15.1  Recibo del pago de la I.E.A.
15.2  Poder Original
15.3  Certificado de Libre Venta o Producto Farmacéutico
15.4  Certificado de Buenas Prácticas de Manufactura
15.5  Fórmula Cuali-Cuantitativa
15.6  Método de Análisis
15.7  Certificado de Análisis
15.8  Especificaciones del Producto Terminado
15.9  Clave de Lote
15.10 Prospecto O Inserto (cuando aplique)
15.11 Monografía
15.12 Estudios de Estabilidad
15.13 Información sobre disposición de desecho
15.14 Otros Documentos Aclaratorios
15.15 Muestra Física
15.16 Patrones Analíticos
15.17 Recibo de la Tasa por Servicio
15.18 Proceso de Fabricación del Producto Terminado
15.19 Controles en Proceso
15.20 Programa de Manejo de Riesgo y plan de Farmacovigilancia para los biotecnológicos
15.21 Condiciones de Almacenamiento, distribución y transporte
15.22 Estudios clínicos
15.23 Estudios No clínicos
15.24 Autorización de inicio de control de calidad (AICC)
15.25 Solicitud de muestreo de control de calidad
15.26 Actas de muestreo de control de calidad
15.27 Formulario de evaluación de muestras y evidencias de S.C.C.
15.28 Informe de incumplimiento de etiquetado y evidencias por S.C.C.
15.29 Solicitud de cotización de análisis por S.C.C.
15.30 Notas de los trámites de control de calidad
15.31 Evidencia de entrega de SQR ante el laboratorio de referencia
15.32 Autorización de análisis por S.C.C
15.33 Informe de resultado de análisis por S.C.C.
15.34 Informe de verificación de los controles posteriores de la S.C.C.
```

### 6.2 Cosméticos — 7 tipos de documento (Sección 11)
```
11.1 Poder Original
11.2 Certificado de Buenas Prácticas de Manufactura
11.3 Fórmula Cuali-Cuantitativa
11.4 Documentos que Avalan Propiedades Específicas
11.5 Especificaciones del Producto Terminado
11.6 Otros Documentos Aclaratorios
11.7 Foto de la Muestra Física
```

### 6.3 Higiénicos — 11 tipos de documento (Sección 11)
```
28.1  Poder
29.2  Documento original o copia legalizada de la personería jurídica
30.3  Certificado de Libre Venta
31.4  Certificado de Buenas Prácticas de Manufactura
32.5  Copia del permiso de operación
33.6  Fórmula Cuali-cuantitativa
34.7  Especificaciones del Producto Terminado
35.8  Hoja de datos de seguridad
36.9  Muestra
37.10 Declaración jurada
38.11 Otros Documentos
```
> Nota: El sistema usa numeración global (28–38), no 11.1–11.11.

### 6.4 Plaguicidas — 18 tipos de documento (Sección 11)
```
11.1  Poder
11.2  Certificado de Libre Venta
11.3  Certificado de buenas prácticas de fabricación
11.4  Licencia Sanitaria o permiso de funcionamiento
11.5  Fórmula cuali-cuantitativa
11.6  Método de análisis
11.7  Especificaciones del producto terminado
11.8  Certificado de análisis
11.9  Estudios de estabilidad
11.10 Información del tipo de empaque o envase
11.11 Hoja de seguridad
11.12 Estudio de Eficacia de la formulación
11.13 Estudio de toxicidad aguda
11.14 Residualidad e información ecotoxicológica (PA)
11.15 Muestras
11.16 Codificación de lote
11.17 Método de destrucción
11.18 Otros Documentos
```

---

## 7. FORMULARIO HIGIÉNICOS

**URL:** `/forms/user/higienicos/registrar.aspx`  
**Título completo:** "Trámite de Registro Sanitario — Producto Higiénico, Desinfectante y Antiséptico de Uso Doméstico y Hospitalario"  
**Tipo:** Página única con scroll (igual a Cosméticos)

### Diferencias clave vs. Cosméticos
- **1.1 Tipo de Solicitud** incluye opción adicional: `Reconocimiento Mutuo`
- **2.1 Clasificación de Producto:** `Antisépticos · Doméstico · Hospitalario`
- **2.3 Número CAS** (para ingrediente activo)
- **2.4.1 Nombre de Ingrediente Activo (ISO/IUPAC)** + **2.4.2 Concentración** — repetibles con "Agregar Activo"
- **2.5 Tipo Producto** (texto libre)
- **2.6 Forma Física** (texto libre)
- **2.8 Origen del Producto:** `Nacional · Importado`
- **2.9 Condición de Venta:** `Popular · Sin Prescripción Médica · Prescripción Médica`
- **2.10 Vía de administración:** `Tópico · No Aplica`
- **2.11 Variante** (texto)
- Sección **12 PRESENTACIONES** incluye: "Cotización de I.E.A." como campo adicional de archivo
- **Sin sección 14 de Farmacovigilancia**

---

## 8. FORMULARIO PLAGUICIDAS

**URL:** `/forms/user/plaguicidas/registrar.aspx`  
**Título:** "Trámite de Registro Sanitario — Plaguicida de Uso Doméstico o Profesional"  
**Tipo:** Página única con scroll

### Campos únicos vs. otros formularios
- **1.1 Tipo de Solicitud:** `Nuevo Registro · Renovación Sin Cambios · Reconocimiento Mutuo` (sin "Renovación Con Cambios")
- **2.1 Clasificación:** `Doméstico · Profesional`
- **2.3 Número CAS** + **2.3.1 Nombre Ingrediente Activo (ISO/IUPAC)** + **2.3.2 Concentración** (repetibles)
- **2.4 Tipo de Producto:** `Químico · Biológico · Otros`
- **2.5 Tipo de Formulación** (texto libre)
- **2.7 Origen del Producto:** `Nacional · Importado`
- **2.8 Condición de Venta** (texto libre — no dropdown)
- **2.9 Vía de Administración** (texto libre)
- **Sección 10** sin campo 10.7 Refrendo CNF (diferencia vs. Cosméticos e Higiénicos)
- **Sección 13 OTROS DOCUMENTOS:** 13.1 Refrendo CNF + 13.2 Cotización IEA (ambos archivos)
- **14 secciones** en total (vs. 13 en Cosméticos/Higiénicos)

---

## 9. FORMULARIO EXCEPCIÓN AL REGISTRO

**URL:** `/forms/user/excepcion/registrar.aspx`  
**Título:** "Trámite de Excepción al Registro Sanitario"  
**Tipo:** Página única. **Formulario completamente diferente** — no sigue la estructura de RS.

### Estructura (6 secciones)

**Sección 1: DATOS DEL SOLICITANTE**
| Campo | Tipo | Opciones |
|-------|------|----------|
| 1.1 No. de Cédula | Texto | — |
| 1.2 Nombre completo | Texto | — |
| 1.3 No. de contacto | Texto | — |
| 1.4 Correo electrónico | Email | — |
| 1.5 Tipo | Radio/Dropdown | Distribuidora · Paciente · Compra Directa |
| 1.6 Nombre Distribuidora | Texto | Solo si Tipo = Distribuidora |

**Sección 2: DATOS DE LA SOLICITUD**
| Campo | Tipo | Opciones |
|-------|------|----------|
| 2.1 Tipo de Entidad | Radio | Públicas · Privadas |
| 2.2 Tipo de Excepción al Registro | Checkboxes | Calamidades públicas y desastres naturales · Razones humanitarias · No existe disponibilidad en el mercado · Investigación científica · Desabastecimiento crítico |

**Sección 3: DATOS DEL PRODUCTO**
| Campo | Tipo | Notas |
|-------|------|-------|
| 3.1 Nombre del producto | Texto | — |
| 3.2 Principio Activo y Concentración | Texto | — |
| 3.3 Forma Farmacéutica | Texto libre | (no es el dropdown de 792 opciones) |
| 3.4 Laboratorio Fabricante | Texto | — |
| 3.5 País Fabricante | Dropdown | 244 países |
| 3.6 Laboratorio Acondicionador | Texto | — |
| 3.7 País Laboratorio Acondicionador | Dropdown | 244 países |
| 3.8 Titular del Producto | Texto | — |
| 3.9 País del Titular | Dropdown | 244 países |
| 3.10 Institución Requirente / Nombre Paciente | Texto | Según Tipo de Excepción |

**Sección 4: DATOS DE LA CANTIDAD A IMPORTAR**
| Campo | Tipo | Notas |
|-------|------|-------|
| 4.1 Cantidad | Texto | — |
| 4.2 Presentación del Producto | Dropdown | ~90 tipos (Ampolla · Frasco · Blister · Vial · Jeringa · Tubo · etc.) |
| 4.2.1 Detalles de la Presentación | Texto | — |
| 4.3 Lote(s) | Texto | — |
| 4.4 Fecha(s) de Expiración | Texto/Fecha | — |

**Sección 5: ADJUNTAR DOCUMENTOS** *(archivos individuales fijos, no repetibles)*
```
5.1 Tasa de Servicio
5.2 Nota que sustenta la Solicitud
5.3 Certificado de Buenas Prácticas
5.4 Certificado de Análisis de Lote a Importar
5.5 Receta u Orden de Compra
5.6 Registro Sanitario del país de origen de Alto Estándar
5.7 Declaración Jurada
5.8 Otros documentos aclaratorios
```

**Sección 6: CONFIRMACIÓN DE CULMINACIÓN** — Declaración Jurada

---

## 10. FORMULARIO PUBLICIDAD

**URL:** `/forms/user/publicidad/registrar.aspx`  
**Título:** "Trámite de Registro de Solicitud de Publicidad"  
**Tipo:** Página única. **El formulario más simple del portal** — 4 secciones.

### Estructura
**Sección 1: DATOS DE LA SOLICITUD**
| Campo | Tipo | Notas |
|-------|------|-------|
| 1.1 No. de Registro Sanitario | Texto | Botón "Buscar Registro Sanitario" — busca RS existente. Tabla de RS asociados. |
| 1.2 Nombre completo del solicitante | Texto | — |
| 1.3 Correo electrónico | Email | — |
| 1.4 Nombre de la empresa | Texto | — |

**Sección 2: DATOS DEL PRODUCTO A PUBLICAR**
| Campo | Tipo | Notas |
|-------|------|-------|
| 2.1 Código de la publicidad | Texto | — |
| 2.2 Tipo de publicidad | Checkboxes | Impresos · Audiovisuales · Cupones promocionales · Material Promocional · Otros |
| 2.3 Descripción breve del material | Área texto | Tipo material, duración, etc. |

**Sección 3: ADJUNTAR DOCUMENTOS** *(fijos, 3 slots)*
```
3.1 Justificante del pago de tasas      [archivo]
3.2 Muestras de material a evaluar      [archivo]
3.3 Documentos aclaratorios             [archivo]
```
> Botón "Quitar Adjunto" visible — permite eliminar antes de enviar.

**Sección 4: CONFIRMACIÓN** — Declaración Jurada

---

## 11. MÓDULO DE SEGUIMIENTO (SOLICITUDES TRAMITADAS)

**URL patrón:** `/forms/user/{modulo}/index.aspx`  
**Título:** "Consulta de Trámites de Registro Sanitario de {Módulo}"

### Estructura (3 tabs)
**Tab 1 — Ver Trámites:**
- Filtros de búsqueda: Número de Registro · Número de Solicitud · Nombre del Producto
- Botones: Filtrar · Limpiar Filtros
- Tabla de resultados
- **Aviso crítico:** *"Al generar la solicitud, tendrá un periodo de 48 horas para adjuntar el documento firmado, de no adjuntar el documento la solicitud será cancelada automáticamente y deberá generar una nueva."*

**Tab 2 — Datos y Adjuntos de la Solicitud:**  
Detalle completo de la solicitud seleccionada + archivos adjuntos

**Tab 3 — Cargar Firma:**  
Carga del documento firmado dentro del plazo de 48 horas

> ⚠️ **Regla de negocio crítica:** 48h desde generación para subir firma. Sin firma → cancelación automática.

---

## 12. CATÁLOGOS CLAVE

### Tipo de Registro — Medicamentos (1.2)
```
Regular · Abreviado · Reconocimiento Mutuo · Reconocimiento WLA
```

### Tipo de Solicitud por módulo
| Módulo | Opciones disponibles |
|--------|---------------------|
| Medicamentos | Nuevo Registro · Renovación Sin Cambios · Renovación Con Cambios |
| Cosméticos | Nuevo Registro · Renovación Sin Cambios · Renovación Con Cambios |
| Higiénicos | Nuevo Registro · Renovación Sin Cambios · Renovación Con Cambios · Reconocimiento Mutuo |
| Plaguicidas | Nuevo Registro · Renovación Sin Cambios · Reconocimiento Mutuo |
| Excepción | N/A (formulario diferente) |
| Publicidad | N/A (formulario diferente) |

### Condición de Venta — Medicamentos (3.1.6)
```
Con Prescripción Médica · Sin Prescripción Médica · Venta Libre o Venta Popular · Con Prescripción Médica Controlada
```

### Forma Farmacéutica — Medicamentos (3.1.4)
**Total: 792 opciones.** Muestra representativa:
```
ACEITE · AEROSOL · AMPOLLAS · ANILLO VAGINAL · CÁPSULA · CÁPSULA BLANDA
CÁPSULA DE LIBERACIÓN MODIFICADA · COMPRIMIDO · COMPRIMIDO EFERVESCENTE
COMPRIMIDO MASTICABLE · COMPRIMIDO RECUBIERTO · CREMA · EMULSIÓN · ENJUAGUE
GEL · GRANULADO · IMPLANTE · INYECTABLE · JARABE · LOCIÓN · PARCHE
POLVO PARA SOLUCIÓN INYECTABLE · SOLUCIÓN · SPRAY · SUPOSITORIO
SUSPENSIÓN · TABLETA · TABLETA DE LIBERACIÓN PROLONGADA · UNGÜENTO · VIAL
```
> El catálogo completo incluye formas veterinarias, homeopáticas, biotecnológicas y productos especiales.

### Vía de Administración — Medicamentos (3.1.5)
**Total: ~100+ opciones.** Muestra representativa:
```
ANAL · BUCAL · CUTÁNEA · DENTAL · EPIDURAL · ENTERAL · INFILTRACIÓN
INHALACIÓN · INTRAMUSCULAR · INTRATECAL · INTRAVENOSA · NASAL · OCULAR
ORAL · ÓTICA · SUBLINGUAL · SUBCUTÁNEA · TÓPICA · TRANSDÉRMICA · URETRAL
VAGINAL
```

### Clasificación biofarmacéutica — Bioequivalencia (13)
```
Clase 1 · Clase 2 · Clase 3 · Clase 4
```

### Países (244) — Dropdown compartido en todos los módulos
Lista completa de la ONU + territorios. Incluye "No Aplica" como opción especial.

---

## 13. COMPORTAMIENTO UX Y REGLAS DE NEGOCIO

### Comportamiento de los botones "Buscar"
- Disponibles en: Fabricante, Acondicionador, Titular, Distribuidor, Empresa Solicitante, Representante Legal, Abogado, Farmacéutico, Registro Sanitario (Publicidad)
- **Mecanismo:** AJAX postback al servidor — busca la entidad en la BD interna del sistema
- **Pre-condición:** La entidad debe estar registrada previamente en el sistema FADDI
- **Post-condición:** Si se encuentra, autocompleta los campos del formulario

### Formularios repetibles (sub-formularios tipo "Agregar")
- Presentaciones (Medicamentos, Cosméticos, Higiénicos)
- Fabricantes (Cosméticos — "Agregar Fabricante")
- Formas Cosméticas (Cosméticos — "Agregar Forma")
- Ingredientes Activos (Higiénicos, Plaguicidas — "Agregar Activo")
- Acondicionadores (Cosméticos, Higiénicos — "Agregar Acondicionador")
- Distribuidores (todos los módulos con distribuidor)

### Validaciones detectadas
- Formato de correo electrónico (en todos los campos email)
- Campos obligatorios marcados inline (mensajes ocultos en DOM desde carga)
- Sin validación entre pasos en Medicamentos (wizard permite avanzar sin completar)

### Límites del sistema
- Tamaño máximo por archivo: **50 MB**
- Plazo para firma post-generación: **48 horas** (cancelación automática)
- Sesión: basada en cookies, duración desconocida (probable timeout por inactividad)

---

## 14. COMPARATIVA ENTRE FORMULARIOS

| Atributo | Medicamentos | Cosméticos | Higiénicos | Plaguicidas | Excepción | Publicidad |
|----------|-------------|-----------|-----------|------------|----------|-----------|
| Tipo de form | Wizard 16 pasos | Página única | Página única | Página única | Página única | Página única |
| Secciones | 14 tabs | 13 sec | 13 sec | 14 sec | 6 sec | 4 sec |
| Tipo de Registro | Sí (4 opciones) | No | No | No | No | No |
| Tipo de Medicamento | Sí (13 tipos) | No | No | No | No | No |
| Principio Activo/DCI | Sí | No | Sí (ISO/IUPAC) | Sí (ISO/IUPAC) | Sí (texto) | No |
| Forma Farmacéutica | Dropdown (792) | Dropdown (65) | Texto libre | Texto libre | Texto libre | No |
| Reconocimiento Mutuo | Sí | No | Sí | Sí | No | No |
| Bioequivalencia | Sí (paso 13) | No | No | No | No | No |
| Monografía | Sí (paso 12) | No | No | No | No | No |
| Farmacovigilancia | Sí (paso 14) | No | No | No | No | No |
| Refrendo CNF (archivo) | No | Sí (obligatorio) | Sí | No | No | No |
| Cotización IEA | No | No | Sí | Sí | No | No |
| Docs adjuntos (tipos) | 34 | 7 | 11 | 18 | 8 | 3 |
| Acondicionador | Tipo radio (3 op.) | Dropdown (3 op.) | Dropdown (3 op.) | Dropdown (3 op.) | No | No |
| Clasificación producto | No | Sí (13 cat.) | Sí (3 cat.) | Sí (2 cat.) | No | No |
| Condición de Venta | Sí (4 op.) | No | Sí (3 op.) | Texto libre | No | No |

---

## 15. GAPS PENDIENTES DE EXPLORACIÓN

Los siguientes aspectos no pudieron ser mapeados en esta sesión y deben verificarse directamente con acceso a expedientes reales:

1. **Estados de trámite** — ¿Qué estados maneja el sistema? (ej: Borrador, En Revisión, Observado, Aprobado, Denegado, Cancelado) No fue visible porque no hay solicitudes tramitadas en la cuenta de prueba.
2. **Flujo de pago (NeoPayment)** — Cómo se conecta la pasarela de pago al trámite post-Declaración Jurada.
3. **Pantalla post-Declaración Jurada** — Qué se genera exactamente al hacer clic en "finalizar" (¿PDF para firma? ¿folio?).
4. **Flujo de registro de nuevo usuario** — Campos del formulario de registro y verificación de correo.
5. **Página de consulta pública de RS** — Qué información es visible sin login (número de RS, titular, vigencia, etc.).
6. **Comportamiento de Tipo de Registro** — ¿El formulario cambia dinámicamente según Regular/Abreviado/WLA? ¿Se ocultan pasos?
7. **Límite de archivos** — ¿Hay un número máximo de adjuntos por solicitud?
8. **Modificaciones y transferencias** — ¿Existe un flujo separado para CMV, CMaV y transferencias de RS o se usan los mismos formularios?
9. **Menú de usuario autenticado** — Qué opciones tiene el dropdown [Nombre Usuario] (perfil, cambio de contraseña, cerrar sesión).

---

## 16. IMPLICACIONES PARA EL SISTEMA FARMAZED

### Datos que Farmazed debe modelar (extraído del mapeo)
- Todos los catálogos de la plataforma (Forma Farmacéutica, Vía de Adm., Clasificaciones, Condición de Venta, etc.)
- Relaciones: Solicitante → Producto → Fabricante → Titular → Distribuidor → Farmacéutico
- Flujo de estados del trámite (pending mapping §15.1)
- Tipos de documento por módulo (34 Med, 7 Cos, 11 Hig, 18 Plag)
- Regla de negocio de 48h para firma

### Campos compartidos entre todos los módulos (núcleo reutilizable)
- Empresa Solicitante (RUC, Nombre, Tel, Correo, Dir)
- Representante Legal (Cédula, Nombre, Tel, Correo, Dir)
- Abogado (Cédula, Nombre, Tel, Correo, Dir, Idoneidad)
- Farmacéutico (Cédula, Nombre, Tel, Correo, Dir, Idoneidad)
- Distribuidor (N° Licencia)
- Fabricante (Correo, Nombre, País, Dirección)
- Acondicionador (Tipo, Correo, Nombre, País, Dirección)
- Titular (Correo, Nombre, País, Dirección)

### Oportunidades de mejora vs. la plataforma FADDI
- **Guardado automático** de borrador (FADDI no lo tiene)
- **Validación progresiva** por paso (FADDI valida todo al final)
- **Catálogos con búsqueda** (dropdowns con 792 opciones son inutilizables sin filtro)
- **Pre-llenado inteligente** de campos compartidos entre módulos
- **Panel de control** con estado del expediente en tiempo real
- **Alertas proactivas** para la ventana de 48h de firma
- **Checklist de documentos** pre-llenado según tipo de medicamento seleccionado

---

*Documento generado con exploración directa de la plataforma FADDI/DNFD Digital.*  
*Sesión: ZELKY MARIN ALVARADO — Mayo 2026 — Farmazed Regulatory Consulting*
