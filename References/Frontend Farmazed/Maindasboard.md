Identidad visual:

Colores: Royal Blue #1B4F8A (primario), Deep Navy #0F3260, Leaf Green #3A7D44 (acento)
Tipografía: Libre Baskerville para títulos/marca, DM Sans para interfaz, IBM Plex Mono para códigos de expediente
Estilo: profesional, limpio, sin gradientes decorativos, bordes sutiles 0.5px

Topbar:
Logo de Farmazed (marca cuadrada en Royal Blue con ícono de cuadrícula 2x2 donde el cuadrante inferior derecho es verde) + nombre "Farmazed" en Libre Baskerville + subtítulo "Asuntos Regulatorios · Panamá". A la derecha: nombre de usuario autenticado + rol (ej. "Lic. Zelky Marín — Farmacéutica") + indicador de estado activo (punto verde) + texto "DNFD / MINSA · Sistema activo".
Sección 1 — Métricas de resumen (4 tarjetas en fila):

Registros activos — número grande + subtexto "+N este trimestre" en verde
En trámite (DNFD) — número + subtexto "N con observaciones" en ámbar
Vencen en 90 días — número + subtexto "Acción requerida" en rojo
Clientes activos — número + subtexto "Centroamérica + Panamá" en verde

Sección 2 — Banner de alerta normativa:
Franja con borde izquierdo ámbar, ícono de advertencia triangular, título en negrita "Alerta normativa" y texto descriptivo. Ejemplo: "Decreto Ejecutivo N.° 27 de 2024 en vigencia — N expedientes requieren adecuación de documentación técnica antes del [fecha]." Diseñada para mostrar 0 a N alertas activas apiladas.
Sección 3 — Dos columnas:
Columna izquierda (60%) — "Registros por categoría de producto":
Badge en encabezado indicando "D.E. 27/2024". Lista de categorías con punto de color identificador, nombre, barra de progreso horizontal proporcional al total, y conteo numérico. Categorías:

Medicamentos de síntesis química — color Royal Blue #1B4F8A
Productos naturales / fitofármacos — color Leaf Green #3A7D44
Productos biológicos y biotecnológicos — color Deep Navy #0F3260
Suplementos vitamínicos, dietéticos y alimenticios — color ámbar #BA7517
Medicamentos homeopáticos — color gris #888780
Gases medicinales — color gris claro
Radiofármacos — color gris claro
Medicamentos huérfanos — color gris claro

Columna derecha (40%) — "Actividad reciente":
Feed vertical cronológico. Cada ítem tiene: punto de color según estado, título del evento, subtexto con fecha y referencia normativa aplicada (ej. "Res. 56/2024", "D.E. 27/2024"), y badge de estado. Estados posibles: Aprobado (verde), En revisión (azul), Con observaciones (ámbar), Vencido (rojo).
Sección 4 — Módulos de acceso rápido (3 columnas, 6 tarjetas):
Cada tarjeta tiene: ícono en cuadrado redondeado con color de fondo tenue, título, descripción de 1 línea, y enlace "Abrir →".

Biblioteca de matrices — Ícono documento. "Requisitos por categoría con fundamento normativo." Color Royal Blue.
Gestión de expedientes — Ícono carpeta. "Seguimiento de trámites ante DNFD/MINSA." Color Royal Blue.
Calculadora de vencimientos — Ícono reloj. "Fechas críticas y alertas de renovación." Color ámbar.
Procedimiento abreviado vs regular — Ícono comparación. "Tabla comparativa D.E. 29/2023." Color Leaf Green.
Clientes y productos — Ícono personas. "Cartera de clientes y registros asociados." Color Leaf Green.
Normativa vigente — Ícono libro. "Marco legal actualizado al D.E. 27/2024." Color Deep Navy.

Sección 5 — Tabla de expedientes activos:
Encabezado de sección con tabs de filtro: Todos / En trámite / Con observaciones / Por renovar / Aprobados.
Columnas de la tabla:

Código (IBM Plex Mono, ej. FZ-0234)
Producto
Categoría (badge con color de la categoría)
Cliente
Fundamento normativo principal
Vencimiento (fecha, resaltada en rojo si es en menos de 90 días)
Estado (pill con color según estado)

Cada fila tiene menú de acciones (tres puntos) con opciones: Ver expediente / Descargar matriz / Registrar observación / Iniciar renovación.
Pie de página:
Dos columnas. Izquierda: "Marco normativo vigente" con lista de instrumentos principales — D.E. N.° 27 de 2024 · Ley N.° 419 de 2024 · Res. N.° 126 de 2021 (RTCA 11.03.59:18) · Res. N.° 56 de 2024 (RTCA 11.03.64:19) · Res. N.° 550 de 2019 · D.E. N.° 29 de 2023. Derecha: datos de contacto — Farmazed · PH Cosmopolitan Towers, Pueblo Nuevo, Panamá · Lic. Zelky Marín, Farmacéutica.
Notas técnicas generales:

Totalmente responsivo
Modo claro como predeterminado, soporte para modo oscuro con CSS variables
Sin librerías externas de UI; HTML + CSS + JS vanilla o React puro
Todos los colores definidos como variables CSS
Los datos de métricas, expedientes y actividad reciente deben venir de un objeto JSON de ejemplo hardcodeado en el código para facilitar la integración posterior con una API real
Los tabs de filtro de la tabla deben funcionar filtrando el array de datos en JS sin recargar la página
El banner de alertas debe renderizar 0 ítems si el array de alertas está vacío, sin mostrar la franja

Sección adicional — Pipeline de trámite (entre la sección de alertas y la sección de dos columnas):
Visualiza el flujo estándar de trabajo de Farmazed como un pipeline horizontal de 4 fases secuenciales. Cada fase tiene: número de fase, nombre, ícono representativo, conteo de expedientes actualmente en esa fase, y barra de progreso interna que muestra el avance promedio de los expedientes dentro de la fase.
Las 4 fases en orden:

Diagnóstico Regulatorio — Evaluación inicial del producto, clasificación por categoría, identificación del marco normativo aplicable (D.E. 27/2024, RTCAs, resoluciones específicas) y determinación de la vía de registro (regular o abreviada D.E. 29/2023). Color: gris neutro como punto de entrada.
Revisión Documental — Verificación y validación de los documentos técnicos exigidos según la categoría: certificados de análisis, estudios de estabilidad, validaciones analíticas, etiquetado, fichas técnicas, certificados de BPM, protección de datos (D.E. 1389/2012), entre otros. Color: ámbar #BA7517 como fase de trabajo intensivo.
Elaboración del Expediente — Estructuración formal del expediente regulatorio conforme a los requisitos de la DNFD/MINSA, completando matrices de requisitos, redactando formularios, organizando anexos y preparando la solicitud formal de registro sanitario. Color: Royal Blue #1B4F8A como fase de producción.
Obtención del Registro — Presentación ante DNFD/MINSA, seguimiento del trámite, atención de observaciones, y recepción del registro sanitario aprobado. Color: Leaf Green #3A7D44 como fase de cierre y éxito.

Diseño del pipeline:

Las 4 fases se muestran en fila horizontal conectadas por flechas o líneas con chevron (›) entre ellas
Cada tarjeta de fase muestra: número de fase en badge pequeño, nombre de la fase, ícono, número de expedientes en esa fase actualmente, y una mini barra de progreso
Al hacer clic en una fase, la tabla de expedientes de la Sección 5 se filtra automáticamente para mostrar solo los expedientes en esa fase
La fase activa/seleccionada se resalta con borde del color correspondiente a esa fase
Los datos del pipeline deben salir del mismo JSON de ejemplo hardcodeado, con cada expediente teniendo un campo fase con valores: "diagnostico", "revision", "elaboracion", "obtencion"
En mobile, el pipeline colapsa a una lista vertical manteniendo las flechas de dirección

Actualización al campo de la tabla (Sección 5):
Agregar columna Fase entre Categoría y Cliente, mostrando un badge con el nombre corto de la fase y el color correspondiente: Diagnóstico (gris) · Revisión (ámbar) · Elaboración (azul) · Obtención (verde). Los tabs de filtro existentes (Todos / En trámite / Con observaciones / Por renovar / Aprobados) se mantienen y el filtro por fase del pipeline opera de forma independiente como un segundo nivel de filtrado que se combina con el tab activo.

┌─────────────────────────────────────────────────────────────────────┐
│  TOPBAR                                                             │
│  [Logo] Farmazed · Asuntos Regulatorios · Panamá    [Usuario] [●]  │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ Registros     │ │ En trámite    │ │ Vencen 90d    │ │ Clientes      │
│ activos       │ │ (DNFD)        │ │               │ │ activos       │
│     142       │ │      27       │ │      11       │ │      34       │
│ +8 trimestre  │ │ 5 observac.   │ │ Acción req.   │ │ CA + Panamá   │
└───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ ⚠  ALERTA NORMATIVA                                                 │
│    D.E. 27/2024 — N expedientes requieren adecuación antes del...  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  PIPELINE DE TRÁMITE                                                │
│                                                                     │
│  ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌─────────┐ │
│  │  FASE 1   │     │  FASE 2   │     │  FASE 3   │     │ FASE 4  │ │
│  │Diagnóstico│ ──› │ Revisión  │ ──› │Elaboración│ ──› │Obtención│ │
│  │Regulatorio│     │Documental │     │Expediente │     │Registro │ │
│  │  [ícono]  │     │  [ícono]  │     │  [ícono]  │     │ [ícono] │ │
│  │  N exped. │     │  N exped. │     │  N exped. │     │N exped. │ │
│  │  [====  ] │     │  [======] │     │  [===   ] │     │[=======]│ │
│  └───────────┘     └───────────┘     └───────────┘     └─────────┘ │
│    (gris)              (ámbar)          (Royal Blue)     (verde)    │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────┐ ┌──────────────────────────┐
│  REGISTROS POR CATEGORÍA             │ │  ACTIVIDAD RECIENTE      │
│  [badge: D.E. 27/2024]               │ │                          │
│                                      │ │  ● Fitofármaco FZ-0234   │
│  ■ Síntesis química       ████░  52  │ │    Aprobado · hoy        │
│  ■ Naturales / fito       ███░░  33  │ │    Res. 56/2024  [verde] │
│  ■ Biológicos             ██░░░  20  │ │  ─────────────────────── │
│  ■ Suplementos            ███░░  25  │ │  ● Biológico FZ-0198     │
│  ■ Homeopáticos           █░░░░  12  │ │    Observación · ayer    │
│  ■ Gases                  ░░░░░   3  │ │    D.E. 27/2024  [ámbar] │
│  ■ Radiofármacos          ░░░░░   2  │ │  ─────────────────────── │
│  ■ Huérfanos              ░░░░░   1  │ │  ● Suplemento FZ-0211    │
│                                      │ │    En revisión · 22 abr  │
│                                      │ │    Res. 550/2019  [azul] │
└──────────────────────────────────────┘ └──────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  MÓDULOS DE ACCESO RÁPIDO                                           │
│                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                   │
│  │ [doc]       │ │ [carpeta]   │ │ [reloj]     │                   │
│  │ Biblioteca  │ │ Gestión de  │ │ Calculadora │                   │
│  │ de matrices │ │ expedientes │ │ vencimientos│                   │
│  │ Abrir →     │ │ Abrir →     │ │ Abrir →     │                   │
│  └─────────────┘ └─────────────┘ └─────────────┘                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                   │
│  │ [compare]   │ │ [personas]  │ │ [libro]     │                   │
│  │ Proc. abrev │ │ Clientes y  │ │ Normativa   │                   │
│  │ vs regular  │ │ productos   │ │ vigente     │                   │
│  │ Abrir →     │ │ Abrir →     │ │ Abrir →     │                   │
│  └─────────────┘ └─────────────┘ └─────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  EXPEDIENTES ACTIVOS                                                │
│                                                                     │
│  [ Todos ] [ En trámite ] [ Con observaciones ] [ Por renovar ]     │
│                                                                     │
│  Código      Producto   Categoría  Fase        Cliente  Normativa  Vencimiento  Estado      │
│  ─────────────────────────────────────────────────────────────────────────────────────────  │
│  FZ-0234     Producto A [verde]    [Obtención] Cliente1 Res.56     2025-08-10   [Aprobado]  │
│  FZ-0198     Producto B [navy]     [Revisión]  Cliente2 D.E.27     2025-06-01   [Observac.] │
│  FZ-0211     Producto C [ámbar]    [Elaborac.] Cliente3 Res.550    2025-05-15 ⚠ [Trámite]   │
│  FZ-0187     Producto D [azul]     [Diagnóst.] Cliente4 D.E.27     2025-07-22   [Trámite]   │
│                                                                     │
│                                              [ ··· ]  por cada fila │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐ ┌──────────────────────────────┐
│  Marco normativo vigente         │ │  Contacto                    │
│                                  │ │                              │
│  · D.E. N.° 27 de 2024           │ │  Farmazed                    │
│  · Ley N.° 419 de 2024           │ │  PH Cosmopolitan Towers      │
│  · Res. N.° 126 de 2021          │ │  Pueblo Nuevo, Panamá        │
│  · Res. N.° 56 de 2024           │ │  Lic. Zelky Marín            │
│  · Res. N.° 550 de 2019          │ │  Farmacéutica                │
│  · D.E. N.° 29 de 2023           │ │                              │
└──────────────────────────────────┘ └──────────────────────────────┘