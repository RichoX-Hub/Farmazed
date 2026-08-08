/**
 * FADDI Dynamic Checklists
 * Source of truth: FADDI_platform_knowledge.md
 *
 * Each document entry:
 *   id:          unique key (used in Firestore)
 *   faddiCode:   official FADDI field code (e.g. "15.3")
 *   name:        official FADDI document name
 *   description: what the document must contain / tips for the client
 *   required:    true = always required; false = conditional
 *   condition:   human-readable condition (when required=false)
 *   faddiStep:   FADDI step number where this document is uploaded
 *   maxSizeMB:   50 (FADDI platform limit)
 *   accepts:     accepted MIME types hint
 */

// ─── MEDICAMENTOS ──────────────────────────────────────────────────────────────

const MED_BASE_DOCS = [
  { id: 'recibo_iea',      faddiCode: '15.1',  name: 'Recibo del pago de la I.E.A.',                         required: true,  condition: null,                                              faddiStep: 15, description: 'Comprobante de pago de honorarios de análisis al Instituto Especializado de Análisis (Universidad de Panamá).' },
  { id: 'poder',           faddiCode: '15.2',  name: 'Poder Original',                                        required: true,  condition: null,                                              faddiStep: 15, description: 'Poder notarial del titular/fabricante al regente farmacéutico local. Debe estar apostillado o legalizado.' },
  { id: 'clv',             faddiCode: '15.3',  name: 'Certificado de Libre Venta o Producto Farmacéutico',    required: true,  condition: null,                                              faddiStep: 15, description: 'CLV apostillado o legalizado. Expedido por la autoridad sanitaria del país de fabricación.' },
  { id: 'bpm',             faddiCode: '15.4',  name: 'Certificado de Buenas Prácticas de Manufactura',       required: true,  condition: null,                                              faddiStep: 15, description: 'BPM vigente del fabricante. Debe estar apostillado o legalizado.' },
  { id: 'formula',         faddiCode: '15.5',  name: 'Fórmula Cuali-Cuantitativa',                           required: true,  condition: null,                                              faddiStep: 15, description: 'Fórmula completa (PA + excipientes) con concentraciones.' },
  { id: 'metodo_analisis', faddiCode: '15.6',  name: 'Método de Análisis',                                   required: true,  condition: null,                                              faddiStep: 15, description: 'Métodos analíticos validados para el control de calidad del producto.' },
  { id: 'cert_analisis',   faddiCode: '15.7',  name: 'Certificado de Análisis',                              required: true,  condition: null,                                              faddiStep: 15, description: 'Certificado de análisis del lote que se enviará como muestra al IEA.' },
  { id: 'especificaciones',faddiCode: '15.8',  name: 'Especificaciones del Producto Terminado',              required: true,  condition: null,                                              faddiStep: 15, description: 'Especificaciones técnicas completas del producto terminado.' },
  { id: 'clave_lote',      faddiCode: '15.9',  name: 'Clave de Lote',                                        required: true,  condition: null,                                              faddiStep: 15, description: 'Sistema de codificación de lotes del fabricante.' },
  { id: 'estabilidad',     faddiCode: '15.12', name: 'Estudios de Estabilidad',                              required: true,  condition: null,                                              faddiStep: 15, description: 'Estudios de estabilidad en condiciones Zona IVb (40°C/75% HR). Si vida útil ≤ 24 meses: informe de análisis + DJ.' },
  { id: 'proceso_fab',     faddiCode: '15.18', name: 'Proceso de Fabricación del Producto Terminado',        required: true,  condition: null,                                              faddiStep: 15, description: 'Descripción detallada del proceso de fabricación.' },
  { id: 'controles',       faddiCode: '15.19', name: 'Controles en Proceso',                                 required: true,  condition: null,                                              faddiStep: 15, description: 'Controles de calidad durante el proceso de fabricación.' },
  { id: 'tasa_servicio',   faddiCode: '15.17', name: 'Recibo de la Tasa por Servicio',                       required: true,  condition: null,                                              faddiStep: 15, description: 'Comprobante de pago de la tasa de $200 (MEF).' },
  { id: 'prospecto',       faddiCode: '15.10', name: 'Prospecto o Inserto',                                   required: false, condition: 'Cuando el producto incluye inserto/prospecto',     faddiStep: 15, description: 'Prospecto/inserto del producto aprobado.' },
  { id: 'monografia',      faddiCode: '15.11', name: 'Monografía',                                           required: false, condition: 'Cuando aplica según tipo de medicamento',           faddiStep: 15, description: 'Monografía farmacopeica o del fabricante.' },
  { id: 'disposicion',     faddiCode: '15.13', name: 'Información sobre disposición de desecho',             required: false, condition: 'Cuando el producto requiere disposición especial',   faddiStep: 15, description: 'Información sobre manejo y disposición de residuos.' },
  { id: 'almacenamiento',  faddiCode: '15.21', name: 'Condiciones de Almacenamiento, distribución y transporte', required: false, condition: 'Cuando aplica (cadena de frío, etc.)',         faddiStep: 15, description: 'Condiciones especiales de cadena de frío u otras.' },
  { id: 'otros_docs',      faddiCode: '15.14', name: 'Otros Documentos Aclaratorios',                        required: false, condition: 'Cuando existan observaciones previas o documentos adicionales', faddiStep: 15, description: 'Cualquier documento adicional que sustente la solicitud.' },
  { id: 'muestra',         faddiCode: '15.15', name: 'Muestra Física',                                       required: true,  condition: null,                                              faddiStep: 15, description: 'Muestra del producto en su envase comercial para análisis IEA.' },
  { id: 'patrones',        faddiCode: '15.16', name: 'Patrones Analíticos',                                  required: true,  condition: null,                                              faddiStep: 15, description: 'Patrones de referencia del principio activo para análisis.' },
  { id: 'recibo_cnf',      faddiCode: '16.1.1',name: 'Recibo de pago del Colegio Nacional de Farmacéuticos', required: true, condition: null,                                              faddiStep: 16, description: 'Comprobante de pago del refrendo del farmacéutico regente.' },
];

// Docs adicionales según tipo de medicamento
const MED_EXTRA_BY_TYPE = {
  'Biotecnológicos': [
    { id: 'farmacovigilancia_bio', faddiCode: '15.20', name: 'Programa de Manejo de Riesgo y plan de Farmacovigilancia (biotecnológicos)', required: true, condition: 'Obligatorio para biotecnológicos (Art. 102 D.E. 27/2024)', faddiStep: 15, description: 'Plan de gestión de riesgos y farmacovigilancia específico para biotecnológicos.' },
    { id: 'estudios_clinicos',     faddiCode: '15.22', name: 'Estudios clínicos',    required: true, condition: 'Obligatorio para biotecnológicos', faddiStep: 15, description: 'Módulo 5 del CTD — estudios clínicos completos.' },
    { id: 'estudios_noclinicos',   faddiCode: '15.23', name: 'Estudios No clínicos', required: true, condition: 'Obligatorio para biotecnológicos', faddiStep: 15, description: 'Módulo 4 del CTD — estudios preclínicos.' },
  ],
  'Biológicos': [
    { id: 'estudios_clinicos_bio', faddiCode: '15.22', name: 'Estudios clínicos',    required: true, condition: 'Obligatorio para biológicos', faddiStep: 15, description: 'Módulo 5 del CTD.' },
    { id: 'estudios_noclinicos_bio',faddiCode: '15.23', name: 'Estudios No clínicos',required: true, condition: 'Obligatorio para biológicos', faddiStep: 15, description: 'Módulo 4 del CTD.' },
  ],
  'Huérfanos': [
    { id: 'estudios_clinicos_hue', faddiCode: '15.22', name: 'Estudios clínicos (Huérfanos)',    required: false, condition: 'Según disponibilidad — Arts. 107-108 D.E. 27/2024', faddiStep: 15, description: 'Resumen clínico disponible. Declaración notarial de países con registro.' },
    { id: 'declaracion_paises',    faddiCode: '15.14', name: 'Declaración notarial de países con registro', required: true, condition: 'Obligatorio para huérfanos', faddiStep: 15, description: 'Declaración notarial indicando los países donde está registrado el producto.' },
  ],
  'Vacuna': [
    { id: 'estudios_clinicos_vac', faddiCode: '15.22', name: 'Estudios clínicos (Vacuna)', required: true, condition: 'Obligatorio para vacunas', faddiStep: 15, description: 'Datos clínicos de eficacia e inmunogenicidad.' },
    { id: 'estudios_noclinicos_vac',faddiCode: '15.23', name: 'Estudios No clínicos (Vacuna)', required: true, condition: 'Obligatorio para vacunas', faddiStep: 15, description: 'Estudios preclínicos de seguridad.' },
  ],
};

// Docs especiales para procedimiento Abreviado
const MED_ABREVIADO_EXTRA = [
  { id: 'aprobacion_arr', faddiCode: '15.14', name: 'Expediente aprobado por ARR (FDA/EMA/INVIMA/etc.)', required: true, condition: 'Obligatorio para procedimiento Abreviado (D.E. 29/2023)', faddiStep: 15, description: 'Expediente completo tal como fue aprobado por la Autoridad Regulatoria de Referencia. Apostillado o legalizado.' },
];

// ─── COSMÉTICOS ────────────────────────────────────────────────────────────────

const COS_DOCS = [
  { id: 'cos_poder',         faddiCode: '11.1', name: 'Poder Original',                               required: true,  condition: null, faddiStep: 11, description: 'Poder notarial del titular/fabricante al regente local.' },
  { id: 'cos_bpm',           faddiCode: '11.2', name: 'Certificado de Buenas Prácticas de Manufactura', required: true, condition: null, faddiStep: 11, description: 'BPM del fabricante cosmético (RTCA 71.03.49:08). Apostillado/legalizado.' },
  { id: 'cos_formula',       faddiCode: '11.3', name: 'Fórmula Cuali-Cuantitativa',                   required: true,  condition: null, faddiStep: 11, description: 'Lista de ingredientes con nomenclatura INCI y porcentaje de cada componente.' },
  { id: 'cos_propiedades',   faddiCode: '11.4', name: 'Documentos que Avalan Propiedades Específicas', required: false, condition: 'Si el producto reivindica propiedades especiales (ej: FPS, anti-edad, etc.)', faddiStep: 11, description: 'Estudios o certificados que sustenten las propiedades reclamadas.' },
  { id: 'cos_especif',       faddiCode: '11.5', name: 'Especificaciones del Producto Terminado',      required: true,  condition: null, faddiStep: 11, description: 'Especificaciones físico-químicas y microbiológicas del PT (RTCA 71.03.45:07).' },
  { id: 'cos_otros',         faddiCode: '11.6', name: 'Otros Documentos Aclaratorios',                required: false, condition: 'Cuando aplique', faddiStep: 11, description: 'Cualquier documento adicional que respalde la solicitud.' },
  { id: 'cos_muestra',       faddiCode: '11.7', name: 'Foto de la Muestra Física',                    required: true,  condition: null, faddiStep: 11, description: 'Fotografía del producto en su envase comercial.' },
  { id: 'cos_refrendo',      faddiCode: '10.7', name: 'Refrendo del Colegio Nacional de Farmacéuticos', required: true, condition: null, faddiStep: 10, description: 'Comprobante del refrendo del farmacéutico responsable (D.E. 178/2001).' },
  { id: 'cos_clv',           faddiCode: 'EXTRA', name: 'Certificado de Libre Venta (CLV)',            required: true,  condition: null, faddiStep: 11, description: 'CLV del país de fabricación apostillado o legalizado. No está en la lista de adjuntos de FADDI pero es requisito del RTCA 71.03.35:21 — presentar en ventanilla.' },
];

// ─── HIGIÉNICOS / DESINFECTANTES / ANTISÉPTICOS ────────────────────────────────

const HIG_DOCS = [
  { id: 'hig_poder',      faddiCode: '28.1',  name: 'Poder',                                               required: true, condition: null, faddiStep: 11, description: 'Poder notarial apostillado/legalizado.' },
  { id: 'hig_personeria', faddiCode: '29.2',  name: 'Personería Jurídica de la empresa registrante',        required: true, condition: null, faddiStep: 11, description: 'Documento original o copia legalizada de la personería jurídica.' },
  { id: 'hig_clv',        faddiCode: '30.3',  name: 'Certificado de Libre Venta',                           required: true, condition: null, faddiStep: 11, description: 'CLV apostillado o legalizado del país de origen.' },
  { id: 'hig_bpm',        faddiCode: '31.4',  name: 'Certificado de Buenas Prácticas de Manufactura',      required: true, condition: null, faddiStep: 11, description: 'BPM vigente del fabricante.' },
  { id: 'hig_permiso',    faddiCode: '32.5',  name: 'Copia del permiso de operación',                      required: true, condition: null, faddiStep: 11, description: 'Licencia sanitaria o permiso de funcionamiento del fabricante.' },
  { id: 'hig_formula',    faddiCode: '33.6',  name: 'Fórmula Cuali-cuantitativa',                         required: true, condition: null, faddiStep: 11, description: 'Composición completa del producto con concentraciones.' },
  { id: 'hig_especif',    faddiCode: '34.7',  name: 'Especificaciones del Producto Terminado',             required: true, condition: null, faddiStep: 11, description: 'Especificaciones de control de calidad del PT.' },
  { id: 'hig_sds',        faddiCode: '35.8',  name: 'Hoja de datos de seguridad (SDS)',                    required: true, condition: null, faddiStep: 11, description: 'Safety Data Sheet según formato GHS/SGA.' },
  { id: 'hig_muestra',    faddiCode: '36.9',  name: 'Muestra',                                             required: true, condition: null, faddiStep: 11, description: 'Muestra del producto en envase comercial.' },
  { id: 'hig_dj',         faddiCode: '37.10', name: 'Declaración jurada',                                  required: true, condition: null, faddiStep: 11, description: 'DJ del representante legal.' },
  { id: 'hig_otros',      faddiCode: '38.11', name: 'Otros Documentos',                                    required: false, condition: 'Cuando aplique', faddiStep: 11, description: 'Documentos adicionales.' },
  { id: 'hig_refrendo',   faddiCode: '10.7',  name: 'Refrendo del Colegio Nacional de Farmacéuticos',      required: true, condition: null, faddiStep: 10, description: 'Refrendo del farmacéutico responsable.' },
  { id: 'hig_cotizacion', faddiCode: 'EXTRA', name: 'Cotización de I.E.A.',                                required: true, condition: null, faddiStep: 12, description: 'Cotización de análisis del IEA para higiénicos.' },
];

// ─── PLAGUICIDAS ───────────────────────────────────────────────────────────────

const PLAG_DOCS = [
  { id: 'plag_poder',       faddiCode: '11.1',  name: 'Poder',                                           required: true,  condition: null, faddiStep: 11, description: 'Poder notarial apostillado/legalizado.' },
  { id: 'plag_clv',         faddiCode: '11.2',  name: 'Certificado de Libre Venta',                      required: true,  condition: null, faddiStep: 11, description: 'CLV del país de fabricación.' },
  { id: 'plag_bpm',         faddiCode: '11.3',  name: 'Certificado de buenas prácticas de fabricación',  required: true,  condition: null, faddiStep: 11, description: 'BPM del fabricante de plaguicidas.' },
  { id: 'plag_licencia',    faddiCode: '11.4',  name: 'Licencia Sanitaria o permiso de funcionamiento',  required: true,  condition: null, faddiStep: 11, description: 'Licencia sanitaria vigente del fabricante.' },
  { id: 'plag_formula',     faddiCode: '11.5',  name: 'Fórmula cuali-cuantitativa',                     required: true,  condition: null, faddiStep: 11, description: 'Composición del plaguicida con IA y coadyuvantes.' },
  { id: 'plag_metodo',      faddiCode: '11.6',  name: 'Método de análisis',                              required: true,  condition: null, faddiStep: 11, description: 'Métodos analíticos para el PA.' },
  { id: 'plag_especif',     faddiCode: '11.7',  name: 'Especificaciones del producto terminado',         required: true,  condition: null, faddiStep: 11, description: 'Especificaciones del PT.' },
  { id: 'plag_cert_analisis',faddiCode: '11.8', name: 'Certificado de análisis',                        required: true,  condition: null, faddiStep: 11, description: 'Certificado de análisis del lote.' },
  { id: 'plag_estabilidad', faddiCode: '11.9',  name: 'Estudios de estabilidad',                         required: true,  condition: null, faddiStep: 11, description: 'Estudios de estabilidad en condiciones climáticas relevantes.' },
  { id: 'plag_envase',      faddiCode: '11.10', name: 'Información del tipo de empaque o envase',        required: true,  condition: null, faddiStep: 11, description: 'Compatibilidad del envase con el formulado.' },
  { id: 'plag_sds',         faddiCode: '11.11', name: 'Hoja de seguridad (SDS)',                         required: true,  condition: null, faddiStep: 11, description: 'Safety Data Sheet según GHS.' },
  { id: 'plag_eficacia',    faddiCode: '11.12', name: 'Estudio de Eficacia de la formulación',           required: true,  condition: null, faddiStep: 11, description: 'Estudio que demuestre la eficacia del plaguicida.' },
  { id: 'plag_toxicidad',   faddiCode: '11.13', name: 'Estudio de toxicidad aguda',                      required: true,  condition: null, faddiStep: 11, description: 'Datos toxicológicos (DL50 oral, dérmica, inhalatoria).' },
  { id: 'plag_ecotox',      faddiCode: '11.14', name: 'Residualidad e información ecotoxicológica (PA)', required: true,  condition: null, faddiStep: 11, description: 'Información ecotoxicológica del principio activo.' },
  { id: 'plag_muestras',    faddiCode: '11.15', name: 'Muestras',                                        required: true,  condition: null, faddiStep: 11, description: 'Muestras del producto.' },
  { id: 'plag_lote',        faddiCode: '11.16', name: 'Codificación de lote',                            required: true,  condition: null, faddiStep: 11, description: 'Sistema de codificación de lotes.' },
  { id: 'plag_destruccion', faddiCode: '11.17', name: 'Método de destrucción',                           required: true,  condition: null, faddiStep: 11, description: 'Procedimiento de eliminación segura del plaguicida.' },
  { id: 'plag_otros',       faddiCode: '11.18', name: 'Otros Documentos',                                required: false, condition: 'Cuando aplique', faddiStep: 11, description: 'Documentos adicionales.' },
  { id: 'plag_refrendo',    faddiCode: '13.1',  name: 'Refrendo del Colegio Nacional de Farmacéuticos',  required: true,  condition: null, faddiStep: 13, description: 'Refrendo del farmacéutico responsable.' },
  { id: 'plag_cotizacion',  faddiCode: '13.2',  name: 'Cotización de I.E.A.',                            required: true,  condition: null, faddiStep: 13, description: 'Cotización de análisis del IEA.' },
];

// ─── EXCEPCIÓN ─────────────────────────────────────────────────────────────────

const EXC_DOCS = [
  { id: 'exc_tasa',      faddiCode: '5.1', name: 'Tasa de Servicio',                            required: true,  condition: null, faddiStep: 5, description: 'Comprobante de pago de la tasa de servicio.' },
  { id: 'exc_nota',      faddiCode: '5.2', name: 'Nota que sustenta la Solicitud',              required: true,  condition: null, faddiStep: 5, description: 'Nota oficial que justifica la excepción (calamidad, razón humanitaria, desabasto, etc.).' },
  { id: 'exc_bpm',       faddiCode: '5.3', name: 'Certificado de Buenas Prácticas',             required: true,  condition: null, faddiStep: 5, description: 'BPM del fabricante del país de origen.' },
  { id: 'exc_cert_lote', faddiCode: '5.4', name: 'Certificado de Análisis de Lote a Importar', required: true,  condition: null, faddiStep: 5, description: 'Certificado de análisis del lote específico que se importará.' },
  { id: 'exc_receta',    faddiCode: '5.5', name: 'Receta u Orden de Compra',                    required: false, condition: 'Según tipo: Paciente requiere receta; Compra Directa requiere orden de compra', faddiStep: 5, description: 'Receta médica (paciente) u orden de compra institucional.' },
  { id: 'exc_rs_origen', faddiCode: '5.6', name: 'Registro Sanitario del país de origen de Alto Estándar', required: true, condition: null, faddiStep: 5, description: 'RS del país de origen de autoridad de alto estándar (FDA, EMA, etc.).' },
  { id: 'exc_dj',        faddiCode: '5.7', name: 'Declaración Jurada',                          required: true,  condition: null, faddiStep: 5, description: 'DJ del solicitante sobre los datos declarados.' },
  { id: 'exc_otros',     faddiCode: '5.8', name: 'Otros documentos aclaratorios',               required: false, condition: 'Cuando aplique', faddiStep: 5, description: 'Documentos adicionales de apoyo.' },
];

// ─── PUBLICIDAD ────────────────────────────────────────────────────────────────

const PUB_DOCS = [
  { id: 'pub_tasa',     faddiCode: '3.1', name: 'Justificante del pago de tasas',   required: true, condition: null, faddiStep: 3, description: 'Comprobante de pago de la tasa por revisión de publicidad.' },
  { id: 'pub_muestras', faddiCode: '3.2', name: 'Muestras de material a evaluar',   required: true, condition: null, faddiStep: 3, description: 'Muestras del material publicitario (impresos, storyboard, guión, etc.).' },
  { id: 'pub_otros',    faddiCode: '3.3', name: 'Documentos aclaratorios',          required: false, condition: 'Cuando aplique', faddiStep: 3, description: 'Cualquier documento adicional.' },
];

// ─── EXPORT — getChecklist(tramiteType, options) ────────────────────────────────

/**
 * Returns the document checklist for a given tramite type.
 * @param {string} tramiteType  - medicamentos|cosmeticos|higienicos|plaguicidas|excepcion|publicidad
 * @param {object} options
 * @param {string} options.tipoRegistro     - Regular|Abreviado|Reconocimiento Mutuo|Reconocimiento WLA
 * @param {string[]} options.tipoMedicamento - ['Síntesis Química', 'Biotecnológicos', ...]
 * @returns {Array} checklist entries
 */
function getChecklist(tramiteType, options = {}) {
  const { tipoRegistro = 'Regular', tipoMedicamento = [] } = options;

  switch (tramiteType) {
    case 'medicamentos': {
      let docs = [...MED_BASE_DOCS];

      // Add type-specific docs
      for (const tipo of tipoMedicamento) {
        const extras = MED_EXTRA_BY_TYPE[tipo] || [];
        for (const extra of extras) {
          // Avoid duplicates by id
          if (!docs.find(d => d.id === extra.id)) docs.push(extra);
        }
      }

      // Abreviado adds ARR expediente
      if (tipoRegistro === 'Abreviado') {
        docs.push(...MED_ABREVIADO_EXTRA.filter(d => !docs.find(x => x.id === d.id)));
      }

      return docs;
    }

    case 'cosmeticos':   return COS_DOCS;
    case 'higienicos':   return HIG_DOCS;
    case 'plaguicidas':  return PLAG_DOCS;
    case 'excepcion':    return EXC_DOCS;
    case 'publicidad':   return PUB_DOCS;
    default:             return [];
  }
}

const TRAMITE_TYPES = ['medicamentos', 'cosmeticos', 'higienicos', 'plaguicidas', 'excepcion', 'publicidad'];

module.exports = { getChecklist, TRAMITE_TYPES };
