/**
 * Farmazed — New Case Wizard (5 steps)
 * Handles step navigation, checklist rendering, and file upload (native fetch).
 */
import { requireLogin } from './auth.js';
import api from './api.js';

// ── State ─────────────────────────────────────────────────────────────────────
const state = {
  user:     null,
  step:     1,
  caseId:   null,           // set after step 1 creates the case
  uploads:  {},             // { [faddiDocId]: { file, status, docId } }
  data: {
    tramiteType:     '',
    tipoSolicitud:   'Nuevo Registro',
    tipoRegistro:    'Regular',
    tipoMedicamento: [],
    product:         {},
    entities:        {},
  },
};

// ── FADDI Tramite metadata ─────────────────────────────────────────────────────
const TRAMITES = [
  { id: 'medicamentos', label: 'Medicamentos',                          icon: '💊', desc: 'Síntesis química, biológicos, homeopáticos, huérfanos y demás.' },
  { id: 'cosmeticos',   label: 'Cosméticos y Similares',               icon: '🧴', desc: 'Cremas, shampoos, maquillaje, protectores solares, etc.' },
  { id: 'higienicos',   label: 'Higiénicos / Desinfectantes',          icon: '🧼', desc: 'Antisépticos, desinfectantes de uso doméstico u hospitalario.' },
  { id: 'plaguicidas',  label: 'Plaguicidas',                           icon: '🌿', desc: 'Uso doméstico o profesional (químico, biológico, otro).' },
  { id: 'excepcion',    label: 'Excepción al Registro Sanitario',      icon: '🚨', desc: 'Calamidad, razón humanitaria, desabasto o investigación.' },
  { id: 'publicidad',   label: 'Publicidad de Producto Registrado',    icon: '📢', desc: 'Aprobación de material publicitario de un RS vigente.' },
];

const TIPOS_REGISTRO = ['Regular', 'Abreviado', 'Reconocimiento Mutuo', 'Reconocimiento WLA'];
const TIPOS_MED = [
  'Síntesis Química', 'Biotecnológicos', 'Homeopáticos', 'Huérfanos',
  'Radiofármacos', 'Biológicos', 'Suplemento Con Propiedad Terapéutica',
  'Producto Natural Medicinal', 'Producto Hemoderivado', 'Vacuna',
  'Alérgeno', 'Medio de Contraste', 'Cannabis',
];
const CONDICION_VENTA = [
  'Con Prescripción Médica', 'Sin Prescripción Médica',
  'Venta Libre o Venta Popular', 'Con Prescripción Médica Controlada',
];
const TIPOS_PUBLICIDAD = [
  'Impresos', 'Audiovisuales', 'Cupones promocionales', 'Material Promocional', 'Otros',
];

// ── DOM helpers ───────────────────────────────────────────────────────────────
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function showStep(n) {
  $$('.wz-step').forEach(el => el.classList.add('d-none'));
  $(`#step-${n}`)?.classList.remove('d-none');
  $$('.wz-tab').forEach((el, i) => {
    el.classList.toggle('active',   i + 1 === n);
    el.classList.toggle('done',     i + 1 < n);
  });
  state.step = n;
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.dataset.orig = btn.dataset.orig || btn.innerHTML;
  btn.innerHTML = loading
    ? '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...'
    : btn.dataset.orig;
}

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast align-items-center text-bg-${type} border-0 show position-fixed bottom-0 end-0 m-3`;
  el.style.zIndex = 9999;
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.closest('.toast').remove()"></button></div>`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

// ── Step 1: Tipo de trámite ───────────────────────────────────────────────────
function renderStep1() {
  const grid = $('#tramite-grid');
  grid.innerHTML = TRAMITES.map(t => `
    <div class="col-md-4 col-sm-6">
      <label class="tramite-card ${state.data.tramiteType === t.id ? 'selected' : ''}" data-id="${t.id}">
        <input type="radio" name="tramiteType" value="${t.id}" class="d-none" ${state.data.tramiteType === t.id ? 'checked' : ''}>
        <div class="tramite-icon">${t.icon}</div>
        <div class="tramite-label">${t.label}</div>
        <div class="tramite-desc text-muted small">${t.desc}</div>
      </label>
    </div>`).join('');

  // Tipo de solicitud / registro (only for medicamentos)
  grid.addEventListener('click', e => {
    const card = e.target.closest('.tramite-card');
    if (!card) return;
    $$('.tramite-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    card.querySelector('input').checked = true;
    state.data.tramiteType = card.dataset.id;
    const medExtra = $('#med-extra');
    if (medExtra) medExtra.classList.toggle('d-none', state.data.tramiteType !== 'medicamentos');
  });

  // Tipo de registro (Medicamentos only)
  const tipoRegSelect = $('#tipoRegistro');
  if (tipoRegSelect) {
    tipoRegSelect.innerHTML = TIPOS_REGISTRO.map(t => `<option value="${t}">${t}</option>`).join('');
    tipoRegSelect.value = state.data.tipoRegistro;
    tipoRegSelect.addEventListener('change', () => { state.data.tipoRegistro = tipoRegSelect.value; });
  }
}

// ── Step 2: Datos del producto ────────────────────────────────────────────────
function renderStep2() {
  const isMed = state.data.tramiteType === 'medicamentos';
  const isCos = state.data.tramiteType === 'cosmeticos';
  const isPub = state.data.tramiteType === 'publicidad';
  $$('[data-only-med]').forEach(el => el.classList.toggle('d-none', !isMed));
  $$('[data-only-cos]').forEach(el => el.classList.toggle('d-none', !isCos));
  $$('[data-only-pub]').forEach(el => el.classList.toggle('d-none', !isPub));
  $$('[data-hide-pub]').forEach(el => el.classList.toggle('d-none', isPub));

  // Tipo medicamento checkboxes
  const container = $('#tipo-med-checks');
  if (container && isMed) {
    container.innerHTML = TIPOS_MED.map(t => `
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="checkbox" value="${t}" id="tm-${t.replace(/\s/g,'-')}"
          ${state.data.tipoMedicamento.includes(t) ? 'checked' : ''}>
        <label class="form-check-label" for="tm-${t.replace(/\s/g,'-')}">${t}</label>
      </div>`).join('');
    container.addEventListener('change', () => {
      state.data.tipoMedicamento = $$('input[type=checkbox]:checked', container).map(cb => cb.value);
    });
  }

  // Tipo publicidad checkboxes
  const pubContainer = $('#tipo-pub-checks');
  if (pubContainer && isPub) {
    const selected = state.data.product.tipoPublicidad || [];
    pubContainer.innerHTML = TIPOS_PUBLICIDAD.map(t => `
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="checkbox" value="${t}" id="tp-${t.replace(/\s/g,'-')}"
          ${selected.includes(t) ? 'checked' : ''}>
        <label class="form-check-label" for="tp-${t.replace(/\s/g,'-')}">${t}</label>
      </div>`).join('');
  }

  // Condición de venta
  const condSelect = $('#condicionVenta');
  if (condSelect) {
    condSelect.innerHTML = CONDICION_VENTA.map(c => `<option>${c}</option>`).join('');
    if (state.data.product.condicionVenta) condSelect.value = state.data.product.condicionVenta;
  }

  // Restore field values
  const fields = ['nombreComercial','principioActivo','concentracion','formaFarmaceutica',
                  'viaAdministracion','codigoATC','descripcionEnvase','vidaUtil',
                  'condicionesAlmacenamiento','descripcionPresentacion','clasificacion',
                  'variante','formaCosmetica','numeroRegistroSanitario','codigoPublicidad',
                  'descripcionMaterial'];
  fields.forEach(f => {
    const el = $(`#${f}`);
    if (el && state.data.product[f]) el.value = state.data.product[f];
  });
}

function collectStep2() {
  const fields = ['nombreComercial','principioActivo','concentracion','formaFarmaceutica',
                  'viaAdministracion','condicionVenta','codigoATC','descripcionEnvase',
                  'vidaUtil','condicionesAlmacenamiento','descripcionPresentacion',
                  'tipoPresentacion','clasificacion','variante','formaCosmetica',
                  'numeroRegistroSanitario','codigoPublicidad','descripcionMaterial'];
  const product = {};
  fields.forEach(f => {
    const el = $(`#${f}`);
    if (el) product[f] = el.value;
  });
  const radios = $$('input[name=tipoPresentacion]:checked');
  if (radios.length) product.tipoPresentacion = radios[0].value;
  const pubContainer = $('#tipo-pub-checks');
  if (pubContainer) {
    product.tipoPublicidad = $$('input[type=checkbox]:checked', pubContainer).map(cb => cb.value);
  }
  state.data.product = product;
}

// ── Step 3: Entidades ─────────────────────────────────────────────────────────
function collectEntities() {
  const collect = (prefix) => {
    const obj = {};
    $$(`[id^="${prefix}-"]`).forEach(el => { obj[el.id.replace(prefix + '-', '')] = el.value; });
    return obj;
  };
  state.data.entities = {
    fabricante:          collect('fab'),
    titular:             collect('tit'),
    solicitante:         collect('sol'),
    representanteLegal:  collect('rep'),
    abogado:             collect('abo'),
    farmaceutico:        collect('far'),
    distribuidores:      $$('.distribuidor-licencia').map(el => ({ numeroLicencia: el.value })).filter(d => d.numeroLicencia),
  };
}

// ── Step 4: Carga documental ──────────────────────────────────────────────────
let currentChecklist = [];

async function renderChecklist() {
  const container = $('#checklist-container');
  if (!container || !state.caseId) return;
  container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>';

  try {
    const { checklist, progress } = await api.getChecklist(state.caseId);
    currentChecklist = checklist;
    renderProgressBar(progress);

    const required = checklist.filter(d => d.required);
    const optional = checklist.filter(d => !d.required);

    container.innerHTML = `
      ${renderDocGroup('Documentos Obligatorios', required)}
      ${optional.length ? renderDocGroup('Documentos Condicionales / Opcionales', optional, true) : ''}`;

    // Attach upload handler once — innerHTML above replaces children but not
    // the container node itself, so re-adding here on every refresh would
    // stack duplicate listeners and cause repeated uploads.
    if (!container.dataset.wired) {
      container.dataset.wired = '1';
      container.addEventListener('change', e => {
        if (e.target.type === 'file' && e.target.files[0]) {
          const docId = e.target.dataset.docid;
          const file  = e.target.files[0];
          if (file.size > 52 * 1024 * 1024) {
            toast('El archivo supera los 50 MB.', 'danger');
            e.target.value = '';
            return;
          }
          state.uploads[docId] = { file, status: 'pending' };
          uploadDoc(docId, file, currentChecklist.find(d => d.id === docId));
        }
      });
    }
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
}

function renderProgressBar({ uploaded, total, percent }) {
  const bar = $('#upload-progress');
  if (!bar) return;
  bar.innerHTML = `
    <div class="d-flex justify-content-between mb-1">
      <small><strong>${uploaded}</strong> de <strong>${total}</strong> documentos subidos</small>
      <small>${percent}%</small>
    </div>
    <div class="progress" style="height:8px">
      <div class="progress-bar bg-success" style="width:${percent}%"></div>
    </div>`;
}

function renderDocGroup(title, docs, collapsed = false) {
  return `
    <div class="doc-group mb-4">
      <h6 class="text-muted fw-bold mb-3 text-uppercase small">${title}</h6>
      ${docs.map(d => renderDocCard(d)).join('')}
    </div>`;
}

function renderDocCard(doc) {
  const up     = state.uploads[doc.id];
  const status = up?.status || (doc.uploaded ? 'uploaded' : 'pending');
  const icons  = { pending: '⬜', pending_upload: '📤', uploaded: '✅', approved: '✅', rejected: '❌', requested: '🔔' };
  const badge  = { pending: 'secondary', uploaded: 'success', approved: 'success', rejected: 'danger', requested: 'warning' };

  return `
    <div class="doc-card card mb-2 border-0 shadow-sm" id="doc-${doc.id}">
      <div class="card-body py-2 px-3 d-flex align-items-start gap-3">
        <div class="doc-status-icon fs-5 mt-1">${icons[status] || '⬜'}</div>
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2 flex-wrap">
            <span class="fw-semibold small">${doc.faddiCode} — ${doc.name}</span>
            ${doc.required ? '<span class="badge bg-danger-subtle text-danger border border-danger-subtle small">Obligatorio</span>' : '<span class="badge bg-secondary-subtle text-secondary border small">Opcional</span>'}
            <span class="badge bg-${badge[status] || 'secondary'} small">${status}</span>
          </div>
          <div class="text-muted small mt-1">${doc.description}</div>
          ${up?.file ? `<div class="small text-success mt-1">📎 ${up.file.name}</div>` : ''}
          ${doc.condition ? `<div class="small text-warning-emphasis mt-1">⚡ ${doc.condition}</div>` : ''}
        </div>
        <div class="doc-upload-action" style="min-width:120px">
          ${status === 'uploaded' || status === 'approved'
            ? '<span class="text-success small">✓ Subido</span>'
            : `<label class="btn btn-sm btn-outline-primary" style="cursor:pointer">
                 <input type="file" class="d-none" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" data-docid="${doc.id}">
                 ${status === 'pending_upload' ? '<span class="spinner-border spinner-border-sm"></span>' : '📎 Subir'}
               </label>`}
        </div>
      </div>
    </div>`;
}

async function uploadDoc(faddiDocId, file, docMeta) {
  const card = $(`#doc-${faddiDocId}`);
  if (card) card.querySelector('.doc-upload-action').innerHTML = '<span class="spinner-border spinner-border-sm text-primary"></span>';

  try {
    await api.uploadDocument(state.caseId, file, {
      faddiDocId,
      faddiCode:    docMeta?.faddiCode    || '',
      faddiDocName: docMeta?.name         || '',
      faddiStep:    docMeta?.faddiStep    || 0,
    });
    state.uploads[faddiDocId] = { file, status: 'uploaded' };
    toast(`✅ ${docMeta?.name || faddiDocId} subido correctamente.`);
    renderChecklist(); // refresh
  } catch (err) {
    state.uploads[faddiDocId] = { file, status: 'error' };
    toast(`❌ Error al subir ${docMeta?.name}: ${err.message}`, 'danger');
    if (card) card.querySelector('.doc-upload-action').innerHTML =
      `<label class="btn btn-sm btn-outline-danger" style="cursor:pointer">
         <input type="file" class="d-none" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" data-docid="${faddiDocId}">
         Reintentar
       </label>`;
  }
}

// ── Step 5: Confirmación ──────────────────────────────────────────────────────
async function renderConfirmation() {
  const cs = await api.getCase(state.caseId);
  const cl = await api.getChecklist(state.caseId);
  const missing = cl.checklist.filter(d => d.required && !d.uploaded);

  $('#confirm-product-name').textContent = cs.product?.nombreComercial || '(sin nombre)';
  $('#confirm-tramite').textContent      = cs.tramiteType;
  $('#confirm-progress').textContent     = `${cl.progress.uploaded}/${cl.progress.total} documentos`;

  const missingEl = $('#confirm-missing');
  if (missing.length) {
    missingEl.innerHTML = `<div class="alert alert-warning">
      <strong>⚠️ Documentos obligatorios faltantes (${missing.length}):</strong>
      <ul class="mb-0 mt-2">${missing.map(d => `<li>${d.faddiCode} — ${d.name}</li>`).join('')}</ul>
      <p class="mb-0 mt-2 small">Puedes enviar ahora y subir los documentos faltantes luego, o regresar al Paso 4.</p>
    </div>`;
  } else {
    missingEl.innerHTML = '<div class="alert alert-success">✅ Todos los documentos obligatorios están subidos.</div>';
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────
async function nextStep() {
  const btn = $('#btn-next');
  setLoading(btn, true);

  try {
    if (state.step === 1) {
      if (!state.data.tramiteType) { toast('Selecciona el tipo de trámite.', 'warning'); return; }
      // Create case in Firestore
      if (!state.caseId) {
        const res = await api.createCase({
          tramiteType:     state.data.tramiteType,
          tipoSolicitud:   state.data.tipoSolicitud,
          tipoRegistro:    state.data.tipoRegistro,
          tipoMedicamento: state.data.tipoMedicamento,
        });
        state.caseId = res.id;
        window.history.replaceState({}, '', `?caseId=${state.caseId}`);
      } else {
        await api.updateCase(state.caseId, {
          tramiteType:     state.data.tramiteType,
          tipoSolicitud:   state.data.tipoSolicitud,
          tipoRegistro:    state.data.tipoRegistro,
          tipoMedicamento: state.data.tipoMedicamento,
        });
      }
    }

    if (state.step === 2) {
      collectStep2();
      await api.updateCase(state.caseId, { product: state.data.product, tipoMedicamento: state.data.tipoMedicamento });
    }

    if (state.step === 3) {
      collectEntities();
      await api.updateCase(state.caseId, { entities: state.data.entities });
    }

    if (state.step === 4) {
      // Checklist upload — already saved per upload. Just advance.
    }

    if (state.step === 5) {
      await api.updateCase(state.caseId, { status: 'submitted' });
      toast('🎉 Expediente enviado a Farmazed para revisión.');
      setTimeout(() => window.location.href = '/portal/dashboard.html', 2000);
      return;
    }

    showStep(state.step + 1);

    if (state.step === 4) await renderChecklist();
    if (state.step === 5) await renderConfirmation();

  } catch (err) {
    toast(`Error: ${err.message}`, 'danger');
  } finally {
    setLoading(btn, false);
  }
}

function prevStep() {
  if (state.step > 1) showStep(state.step - 1);
  if (state.step === 2) renderStep2();
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  state.user = await requireLogin();

  // Resume from URL param
  const urlParams = new URLSearchParams(window.location.search);
  const resumeId  = urlParams.get('caseId');
  if (resumeId) {
    state.caseId = resumeId;
    const cs = await api.getCase(resumeId).catch(() => null);
    if (cs) {
      state.data.tramiteType     = cs.tramiteType;
      state.data.tipoSolicitud   = cs.tipoSolicitud;
      state.data.tipoRegistro    = cs.tipoRegistro;
      state.data.tipoMedicamento = cs.tipoMedicamento || [];
      state.data.product         = cs.product || {};
      state.data.entities        = cs.entities || {};
    }
  }

  renderStep1();
  showStep(1);

  $('#btn-next')?.addEventListener('click', nextStep);
  $('#btn-prev')?.addEventListener('click', prevStep);

  // Name in nav
  const nameEl = $('#user-name');
  if (nameEl) nameEl.textContent = state.user.displayName || state.user.email;
}

document.addEventListener('DOMContentLoaded', init);
