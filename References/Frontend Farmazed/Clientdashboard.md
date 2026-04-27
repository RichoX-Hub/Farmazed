Diseña un dashboard web completo para el cliente de Farmazed (Asuntos Regulatorios, Panamá). Este es el portal del cliente — la empresa o laboratorio que contrata los servicios de Farmazed para obtener registros sanitarios ante la DNFD/MINSA de Panamá.

**Identidad visual:**
- Colores: Royal Blue #1B4F8A (primario), Deep Navy #0F3260, Leaf Green #3A7D44 (acento), Ámbar #BA7517 (advertencias), Rojo #A32D2D (alertas)
- Tipografía: Libre Baskerville para títulos y marca, DM Sans para interfaz general, IBM Plex Mono para códigos de expediente y producto
- Estilo: profesional, limpio, sin gradientes decorativos, bordes sutiles 0.5px, fondos blancos y gris muy claro
- El dashboard debe sentirse como el portal de un servicio profesional de alto nivel, no como un software médico genérico

**Principio rector de UX:**
Este usuario no es regulador ni experto normativo. No necesita ver decretos ni artículos de ley. Necesita saber: qué pasa con sus productos, qué se le está pidiendo hacer, dónde está cada expediente, y cuándo vence su registro. Farmazed maneja la complejidad regulatoria — el cliente solo ve el estado, las acciones pendientes y el progreso.

---

**TOPBAR:**
Logo de Farmazed a la izquierda (marca cuadrada Royal Blue con ícono de cuadrícula 2x2 donde el cuadrante inferior derecho es verde) + texto "Farmazed" en Libre Baskerville + subtítulo pequeño "Portal del Cliente". A la derecha: nombre de la empresa cliente (ej. "Laboratorios Centroamérica S.A.") + nombre del contacto (ej. "Carlos Méndez") + indicador de estado activo (punto verde) + ícono de notificaciones con badge de conteo + ícono de perfil/avatar con menú desplegable (Ver perfil / Cambiar contraseña / Cerrar sesión).

---

**SECCIÓN 1 — Métricas de resumen (4 tarjetas en fila):**

1. Mis registros activos — número grande + subtexto "productos con registro vigente" en verde
2. En proceso — número + subtexto "expedientes en trámite con Farmazed" en Royal Blue
3. Pendientes de mi parte — número + subtexto "acciones que requieren tu atención" en ámbar. Si es mayor que 0, la tarjeta tiene borde ámbar resaltado.
4. Próximos a vencer — número + subtexto "vencen en los próximos 90 días" en rojo. Si es mayor que 0, la tarjeta tiene borde rojo resaltado.

---

**SECCIÓN 2 — Pendientes: acción requerida de tu parte:**

Esta sección solo se muestra si hay ítems pendientes. Si el array de pendientes está vacío, la sección desaparece completamente.

Encabezado con título "Necesitamos algo de tu parte" + subtexto "Farmazed está esperando los siguientes elementos para continuar con tus trámites."

Lista de ítems pendientes. Cada ítem tiene:
- Ícono según tipo de acción (subir documento / revisar borrador / confirmar información / firmar)
- Nombre del producto al que aplica en IBM Plex Mono
- Descripción de lo que se solicita (ej. "Subir certificado de análisis del lote de producción")
- Fase del pipeline a la que pertenece (badge simple: Diagnóstico / Revisión / Elaboración / Obtención)
- Fecha límite si aplica (resaltada en rojo si es en menos de 5 días)
- Botón de acción contextual: "Subir archivo" / "Revisar y aprobar" / "Completar información" / "Ver detalle"

---

**SECCIÓN 3 — Mis productos y su progreso:**

Título "Mis productos" + botón "Solicitar nuevo registro →" alineado a la derecha del encabezado.

Lista de productos del cliente. Cada producto ocupa una fila tipo card expandible con:

Parte izquierda:
- Código del producto en IBM Plex Mono (ej. FZ-0234)
- Nombre comercial del producto
- Categoría en badge con color: Síntesis química (Royal Blue) / Naturales-fitofármacos (verde) / Biológicos (Deep Navy) / Suplementos (ámbar) / Homeopáticos (gris)

Parte central — pipeline visual simplificado de 4 fases en línea horizontal:
- Fase 1: Diagnóstico Regulatorio
- Fase 2: Revisión Documental
- Fase 3: Elaboración del Expediente
- Fase 4: Obtención del Registro
- La fase actual se resalta con el color de su estado. Las fases completadas se muestran en gris oscuro con checkmark. Las fases futuras en gris claro. Si hay un bloqueo (pendiente sin resolver), la fase actual muestra ícono de advertencia en ámbar.
- Entre fases hay líneas conectoras que se llenan de color según el avance.

Parte derecha:
- Fecha de vencimiento del registro (si ya fue obtenido). Resaltada en rojo si vence en menos de 90 días.
- Badge de estado general del producto: Activo (verde) / En trámite (azul) / Bloqueado (ámbar) / Vencido (rojo) / Por renovar (ámbar)
- Ícono de chevron para expandir la fila

Al expandir la fila del producto se muestra:
- Lista de documentos del expediente agrupados por fase, cada uno con estado: Pendiente de subir / En revisión por Farmazed / Aprobado / Rechazado (con nota explicativa en rojo)
- Botón "Subir documento" por cada documento pendiente
- Historial breve de últimas 3 actividades de ese producto con fecha

---

**SECCIÓN 4 — Dos columnas:**

Columna izquierda (55%) — "Mis documentos":
Panel de gestión documental. Tabs de filtro: Todos / Pendientes / En revisión / Aprobados / Rechazados.
Cada documento en lista muestra: nombre del documento, producto al que pertenece (IBM Plex Mono), fase, fecha de última actualización, estado en badge de color, y botón de acción (Subir / Ver / Resubir).
Los documentos rechazados muestran una nota de Farmazed explicando el motivo del rechazo, con fondo rojo muy tenue.

Columna derecha (45%) — "Mensajes de Farmazed":
Canal de comunicación directo entre el cliente y el equipo de Farmazed. Muestra conversación estilo hilo por producto/expediente. Cada mensaje tiene: avatar o iniciales de quien escribe (cliente o "FZ" para Farmazed), nombre, texto del mensaje, fecha y hora. Al fondo del panel hay un campo de texto simple + botón "Enviar" para que el cliente responda. El panel tiene selector de producto/expediente arriba para cambiar de hilo. Los mensajes de Farmazed se muestran con acento Royal Blue; los del cliente en gris.

---

**SECCIÓN 5 — Solicitar nuevo registro (CTA destacado):**

Card de ancho completo con fondo Royal Blue muy tenue (#E8EFF8) y borde izquierdo Royal Blue de 3px.
Título: "¿Tienes un nuevo producto que registrar?"
Subtexto: "Inicia el proceso con Farmazed. Te guiamos desde el diagnóstico regulatorio hasta la obtención de tu registro sanitario ante DNFD/MINSA."
Botón primario: "Iniciar solicitud →" en Royal Blue sólido.
Botón secundario: "Ver qué documentos necesitaré" en borde Royal Blue, fondo transparente.

Al hacer clic en "Iniciar solicitud" se despliega un formulario guiado de 4 pasos inline (sin modal, sin redirección):
- Paso 1: Tipo de producto (selector visual con íconos: medicamento de síntesis / producto natural / biológico / suplemento / homeopático / otro)
- Paso 2: Información básica del producto (nombre comercial, nombre genérico o IFA principal, país de fabricación, fabricante)
- Paso 3: Vía de registro sugerida (el sistema muestra automáticamente si aplica procedimiento regular o abreviado según el país de fabricación ingresado, con explicación simple en lenguaje no técnico)
- Paso 4: Resumen y confirmación — muestra lista estimada de documentos que se necesitarán según la categoría seleccionada, con botón "Enviar solicitud a Farmazed"

Al hacer clic en "Ver qué documentos necesitaré" se despliega un panel con checklist de documentos típicos según categoría, seleccionable por el usuario para explorar antes de comprometerse.

---

**SECCIÓN 6 — PIE DE PÁGINA:**

Dos columnas.
Izquierda: logo pequeño de Farmazed + texto "Tu expediente está en manos expertas." + datos de contacto: PH Cosmopolitan Towers, Pueblo Nuevo, Panamá · Lic. Zelky Marín, Farmacéutica.
Derecha: enlaces rápidos — Mis productos / Mis documentos / Solicitar registro / Preguntas frecuentes / Contactar a Farmazed.

---

**Datos de ejemplo hardcodeados en JSON:**

El archivo debe incluir un objeto de datos de ejemplo con:
- cliente: nombre de empresa, nombre de contacto, correo
- metricas: registros activos, en proceso, pendientes, próximos a vencer
- pendientes: array de acciones pendientes con campos — id, producto_codigo, producto_nombre, tipo_accion, descripcion, fase, fecha_limite
- productos: array de productos con campos — codigo, nombre_comercial, categoria, fase_actual, fases_completadas, estado, vencimiento, documentos (array con nombre, fase, estado, nota_rechazo), actividad_reciente (array con fecha, descripcion)
- documentos: array plano de todos los documentos del cliente
- mensajes: array de hilos por producto, cada hilo con array de mensajes con remitente, texto, fecha_hora
- alertas: array de alertas normativas (puede estar vacío)

---

**Comportamiento e interacciones:**

- La sección de pendientes desaparece completamente si el array está vacío
- Al hacer clic en una fase del pipeline de un producto, se filtra automáticamente el panel de documentos para mostrar solo los de esa fase y producto
- Los tabs de documentos filtran el array en JS sin recargar
- El formulario de nuevo registro avanza paso a paso con validación simple antes de continuar
- En el paso 3 del formulario, si el país de fabricación está en la lista de países habilitados para procedimiento abreviado (D.E. 29/2023), el sistema muestra automáticamente "Aplica procedimiento abreviado — proceso más rápido" en verde; si no está, muestra "Aplica procedimiento regular" en azul neutro
- Los mensajes del canal de comunicación se ordenan del más antiguo al más reciente, con el campo de respuesta siempre visible al fondo
- Totalmente responsivo: en mobile el pipeline de cada producto colapsa a un stepper vertical, las dos columnas de documentos y mensajes se apilan, y el formulario de solicitud mantiene sus 4 pasos pero ocupa ancho completo

---

**Notas técnicas:**
- HTML + CSS + JS vanilla o React puro, sin librerías de UI externas
- Todos los colores como variables CSS
- Sin gradientes decorativos, sin sombras pesadas, bordes 0.5px
- Dark mode soportado con CSS variables
- Los datos del JSON de ejemplo deben ser lo suficientemente ricos para que todas las secciones se vean pobladas al cargar