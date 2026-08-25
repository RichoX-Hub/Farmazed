# Bug — GET /api/cases/:id/documents → 500 Internal Server Error
**Fecha detectada:** 2026-08-25 | **Detectado por:** PM (revisión visual)
**Prioridad:** Crítica — bloquea el Paso 4 completo (carga documental)

---

## Síntoma

En consola del navegador (localhost:8080) aparece:

```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
GET :8080/api/cases/HjbY…sKk53z9/documents
```

El error se repite dos veces — indica que el wizard está llamando al endpoint al menos dos veces en el montaje del Paso 4.

---

## Impacto

- El Paso 4 (Carga Documental) no puede cargar el checklist de documentos.
- El usuario queda bloqueado y no puede avanzar al Paso 5.
- **Todo el flujo del wizard está roto a partir del Paso 4.**

---

## Causa probable

El endpoint `GET /api/cases/:id/documents` (o `/api/cases/:id/checklist`) existe en el frontend (wizard.js lo llama) pero **no está implementado en el backend** (tracker/routes/) o tiene un error interno.

Posibles causas específicas:
1. La ruta no está definida en ningún archivo de routes del tracker.
2. La ruta existe pero falla al consultar Firestore (colección o campo inexistente).
3. La ruta existe pero `getChecklist()` de `faddi_checklists.js` no está siendo importada correctamente.
4. El `caseId` en la URL no encuentra el documento en Firestore (caso no creado correctamente en Paso 1).

---

## Acción requerida del developer

### Paso 1 — Verificar si la ruta existe
```bash
grep -r "documents" tracker/routes/
grep -r "checklist" tracker/routes/
```
Si no aparece nada → la ruta no está implementada.

### Paso 2 — Implementar el endpoint si no existe

El endpoint debe:
1. Recibir el `caseId` de la URL
2. Leer el caso desde Firestore (`db.collection('cases').doc(caseId).get()`)
3. Extraer `tramiteType`, `tipoRegistro`, `tipoMedicamento` del documento
4. Llamar a `getChecklist(tramiteType, { tipoRegistro, tipoMedicamento })` de `faddi_checklists.js`
5. Devolver el checklist como JSON

```javascript
// Ejemplo de implementación mínima
const { getChecklist } = require('../data/faddi_checklists');

router.get('/api/cases/:caseId/documents', requireAuth, async (req, res) => {
  try {
    const { caseId } = req.params;
    const snap = await db.collection('cases').doc(caseId).get();

    if (!snap.exists) {
      return res.status(404).json({ error: 'Case not found' });
    }

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

### Paso 3 — Verificar que el endpoint está montado en index.js
```javascript
// En tracker/index.js debe existir algo como:
const casesRouter = require('./routes/cases');
app.use('/', casesRouter);
```

### Paso 4 — Verificar que el caseId se está pasando correctamente desde el wizard
En wizard.js, la llamada al endpoint usa el `caseId` guardado en el estado local. Si el Paso 1 no creó el caso correctamente en Firestore, el caseId puede ser inválido.

---

## Verificación (para el PM)

Una vez el developer aplique el fix, verificar en el navegador:
1. Abrir DevTools → Network
2. Navegar hasta Paso 4 del wizard
3. Confirmar que `GET /api/cases/:id/documents` devuelve `200 OK` con JSON
4. Confirmar que el checklist de documentos aparece en pantalla

---

*Bug registrado por PM — no tocar código. Pasar al developer.*
