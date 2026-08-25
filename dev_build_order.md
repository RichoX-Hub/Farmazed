# Farmazed — Orden de desarrollo del wizard
**Para:** Developer
**Fecha:** 2026-08-25
**Base:** process_map.md + wizard.js + faddi_checklists.js

---

## Regla general

Construir de lo más simple a lo más complejo. Cada fase debe estar completa y probada antes de avanzar a la siguiente.

---

## FASE 1 — Infraestructura base del wizard (prerequisito de todo lo demás)

Antes de construir cualquier path específico, el wizard debe poder:

- [ ] Crear el caso en Firestore al completar Paso 1 (`api.createCase()`)
- [ ] Actualizar la URL con `?caseId=` para permitir retomar el proceso
- [ ] Guardar progreso entre pasos sin perder datos
- [ ] Endpoint `GET /api/cases/:id/checklist` funcionando y devolviendo el checklist dinámico
- [ ] Subida de archivos por documento en Paso 4 (máx. 50 MB)
- [ ] Barra de progreso documental en tiempo real
- [ ] Submit final en Paso 5 → `status = 'submitted'` en Firestore
- [ ] Panel admin recibe la solicitud

**Criterio de aceptación:** Se puede completar un caso de principio a fin aunque el checklist esté vacío.

---

## FASE 2 — Path: Publicidad

**Por qué primero:** Solo 2 documentos obligatorios. Camino más corto para validar el flujo completo end-to-end.

### Paso 1
- Selección: tramiteType = "publicidad"
- Sin subramas

### Paso 2
- Datos mínimos del material publicitario (nombre del producto registrado, tipo de material)

### Paso 3
- Entidades estándar (fabricante, titular, solicitante, regente, abogado)

### Paso 4 — Checklist (3 docs)
| Doc | Obligatorio |
|---|---|
| Justificante del pago de tasas | ✓ |
| Muestras de material a evaluar | ✓ |
| Documentos aclaratorios | Condicional |

### Criterio de aceptación
- Caso de publicidad completo llega al admin con los 2 documentos adjuntos.

---

## FASE 3 — Path: Excepción de Registro

**Por qué segundo:** 6 docs obligatorios. Proceso distinto (no otorga RS permanente). Permite probar el disclaimer de alerta en Paso 1.

### Paso 1
- Selección: tramiteType = "excepción"
- ⚠️ Mostrar disclaimer: *"La Excepción de Registro es una autorización temporal para importar un lote específico. NO otorga Registro Sanitario permanente."*

### Paso 2
- Datos del producto a importar (nombre, principio activo, lote, país de origen)

### Paso 4 — Checklist (8 docs)
| Doc | Obligatorio |
|---|---|
| Tasa de Servicio | ✓ |
| Nota que sustenta la Solicitud | ✓ |
| Certificado de Buenas Prácticas (BPM) | ✓ |
| Certificado de Análisis de Lote | ✓ |
| Registro Sanitario del país de origen (ARR) | ✓ |
| Declaración Jurada | ✓ |
| Receta u Orden de Compra | Condicional |
| Otros documentos aclaratorios | Condicional |

### Criterio de aceptación
- Disclaimer visible antes de continuar.
- Caso llega al admin con los 6 docs obligatorios.

---

## FASE 4 — Path: Cosméticos

### Paso 1
- Selección: tramiteType = "cosméticos"
- Sin subramas

### Paso 2
- Datos del cosmético (nombre comercial, ingredientes INCI principales, tipo de producto, presentación)

### Paso 4 — Checklist (9 docs)
| Doc | Obligatorio | Nota especial |
|---|---|---|
| Poder Original | ✓ | |
| Certificado BPM | ✓ | RTCA 71.03.49:08 |
| Fórmula Cuali-Cuantitativa | ✓ | Nomenclatura INCI |
| Especificaciones PT | ✓ | RTCA 71.03.45:07 |
| Foto de la Muestra Física | ✓ | |
| Refrendo CNF | ✓ | |
| CLV (Certificado de Libre Venta) | ✓ | ⚠️ Ver nota abajo |
| Docs que avalan propiedades específicas | Condicional | Si reclama FPS, anti-edad, etc. |
| Otros documentos aclaratorios | Condicional | |

> ⚠️ **CLV de cosméticos — acción requerida del developer:**
> El CLV NO se sube en plataforma FADDI. El cliente debe presentarlo físicamente en ventanilla DNFD.
> El checklist debe mostrar este documento con una nota visible: *"Este documento se presenta físicamente en DNFD, no se carga en FADDI. Farmazed coordinará la entrega."*
> El campo de upload debe estar deshabilitado para este documento específico.

### Criterio de aceptación
- Nota del CLV visible y campo de upload deshabilitado para ese doc.
- Caso llega al admin correctamente.

---

## FASE 5 — Path: Higiénicos

### Paso 1
- Selección: tramiteType = "higiénicos"

### Paso 4 — Checklist (13 docs)
| Doc | Obligatorio |
|---|---|
| Poder | ✓ |
| Personería Jurídica | ✓ |
| Certificado de Libre Venta | ✓ |
| Certificado BPM | ✓ |
| Copia del permiso de operación | ✓ |
| Fórmula Cuali-cuantitativa | ✓ |
| Especificaciones PT | ✓ |
| Hoja de datos de seguridad (SDS) | ✓ |
| Muestra | ✓ |
| Declaración jurada | ✓ |
| Refrendo CNF | ✓ |
| Cotización de I.E.A. | ✓ |
| Otros Documentos | Condicional |

### Criterio de aceptación
- Los 12 obligatorios aparecen en el checklist.
- Caso llega al admin.

---

## FASE 6 — Path: Plaguicidas

**Más documentos de todos los paths:** 19 obligatorios. Incluye estudios técnicos especializados.

### Paso 1
- Selección: tramiteType = "plaguicidas"

### Paso 4 — Checklist (20 docs)
| Doc | Obligatorio |
|---|---|
| Poder | ✓ |
| Certificado de Libre Venta | ✓ |
| Certificado BPM de fabricación | ✓ |
| Licencia Sanitaria | ✓ |
| Fórmula cuali-cuantitativa | ✓ |
| Método de análisis | ✓ |
| Especificaciones PT | ✓ |
| Certificado de análisis | ✓ |
| Estudios de estabilidad | ✓ |
| Información del tipo de empaque/envase | ✓ |
| Hoja de seguridad (SDS) | ✓ |
| Estudio de Eficacia de la formulación | ✓ |
| Estudio de toxicidad aguda | ✓ |
| Residualidad e info ecotoxicológica | ✓ |
| Muestras | ✓ |
| Codificación de lote | ✓ |
| Método de destrucción | ✓ |
| Refrendo CNF | ✓ |
| Cotización de I.E.A. | ✓ |
| Otros Documentos | Condicional |

### Criterio de aceptación
- Los 19 obligatorios aparecen en el checklist.
- Caso llega al admin.

---

## FASE 7 — Path: Medicamentos Regular (base)

**El path más importante del negocio.** Construir primero con el tipo base (Síntesis Química) y luego agregar los subtipos.

### Paso 1
- Selección: tramiteType = "medicamentos"
- **Sub-selección 1 — tipoRegistro:**
  - Regular ← empezar aquí
  - Abreviado ← Fase 8
  - Reconocimiento Mutuo ← mostrar: *"Contáctenos para este tipo de trámite"*
  - Reconocimiento WLA ← mostrar: *"Contáctenos para este tipo de trámite"*
- **Sub-selección 2 — tipoMedicamento** (checkboxes múltiples):
  - Síntesis Química ← empezar aquí
  - Los demás ← Fase 7B

### Paso 2 — 12 campos técnicos
| Campo | Obligatorio |
|---|---|
| Nombre Comercial | ✓ |
| Principio Activo | ✓ |
| Concentración | ✓ |
| Forma Farmacéutica | ✓ |
| Vía de Administración | ✓ |
| Condición de Venta | ✓ |
| Código ATC | — |
| Descripción del Envase | ✓ |
| Vida Útil | ✓ |
| Condiciones de Almacenamiento | ✓ |
| Descripción de Presentación | ✓ |
| Tipo de Presentación | ✓ |

### Paso 4 — Checklist base (21 docs)
**Obligatorios (16):**
| Código | Doc |
|---|---|
| 15.1 | Recibo pago I.E.A. |
| 15.2 | Poder Original |
| 15.3 | Certificado de Libre Venta (CLV) |
| 15.4 | Certificado BPM |
| 15.5 | Fórmula Cuali-Cuantitativa |
| 15.6 | Método de Análisis |
| 15.7 | Certificado de Análisis |
| 15.8 | Especificaciones PT |
| 15.9 | Clave de Lote |
| 15.12 | Estudios de Estabilidad |
| 15.18 | Proceso de Fabricación |
| 15.19 | Controles en Proceso |
| 15.17 | Recibo Tasa por Servicio ($200 MEF) |
| 15.15 | Muestra Física |
| 15.16 | Patrones Analíticos |
| 16.1.1 | Recibo CNF |

**Condicionales (5):**
| Código | Doc | Condición |
|---|---|---|
| 15.10 | Prospecto o Inserto | Si incluye inserto |
| 15.11 | Monografía | Según tipo |
| 15.13 | Info disposición de desecho | Si requiere disposición especial |
| 15.21 | Condiciones almacenamiento/transporte | Cadena de frío u otras |
| 15.14 | Otros Documentos Aclaratorios | Cuando aplique |

### Criterio de aceptación
- Los 16 obligatorios aparecen.
- Los 5 condicionales aparecen en sección separada.
- Caso llega al admin.

---

## FASE 7B — Medicamentos Regular — Subtipos especiales

Agregar docs adicionales según tipoMedicamento seleccionado. El checklist debe sumar los docs al listado base sin duplicar.

| tipoMedicamento | Docs adicionales obligatorios |
|---|---|
| Biotecnológicos | Farmacovigilancia (15.20) + Clínicos (15.22) + No clínicos (15.23) |
| Biológicos | Clínicos (15.22) + No clínicos (15.23) |
| Huérfanos | Declaración notarial países (15.14) + Clínicos condicional (15.22) |
| Vacuna | Clínicos (15.22) + No clínicos (15.23) |
| Síntesis Química, Homeopáticos, Radiofármacos, Suplemento, Natural, Hemoderivado, Alérgeno, Contraste, Cannabis | Sin docs extra |

**Criterio de aceptación:** Al seleccionar Biotecnológicos, el checklist muestra 19 obligatorios en total.

---

## FASE 8 — Medicamentos Abreviado

**Diferencia del Regular:** Se agrega 1 documento adicional obligatorio.

| Código | Doc adicional |
|---|---|
| 15.14 | Expediente aprobado por ARR (FDA/EMA/INVIMA/etc.) — apostillado/legalizado |

El resto del flujo es idéntico a Regular.

**Criterio de aceptación:** Al seleccionar "Abreviado", el checklist muestra el expediente ARR como obligatorio adicional.

---

## Resumen de secuencia

```
FASE 1  → Infraestructura base (crear caso, checklist API, subida docs, submit)
FASE 2  → Publicidad          (2 docs, validar flujo completo)
FASE 3  → Excepción           (6 docs, disclaimer)
FASE 4  → Cosméticos          (7 docs, CLV físico)
FASE 5  → Higiénicos          (12 docs)
FASE 6  → Plaguicidas         (19 docs)
FASE 7  → Medicamentos Regular base (16 docs, Síntesis Química)
FASE 7B → Medicamentos Regular subtipos (Biotecnológicos, Biológicos, Huérfanos, Vacuna)
FASE 8  → Medicamentos Abreviado (+1 doc ARR)
```

---

## QA por fase — responsabilidad del PM

Antes de dar por cerrada cada fase, el PM verificará:
1. El checklist del path muestra todos los documentos correctos (comparar con process_map.md)
2. Los documentos obligatorios están marcados como tales
3. Los condicionales aparecen en sección separada con su condición visible
4. El caso llega al panel admin con el estado correcto
5. Los disclaimers especiales están visibles (Excepción, CLV cosméticos)

---

*Documento de PM — no tocar código. Solo el developer modifica el código.*
