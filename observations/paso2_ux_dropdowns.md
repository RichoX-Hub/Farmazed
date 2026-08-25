# Observaciones UX — Paso 2: Datos del Producto
**Fecha:** 2026-08-25 | **Revisado por:** PM
**Pantalla:** Wizard → Paso 2 "Datos del Producto"
**Prioridad:** Alta — afecta calidad de datos ingresados al sistema FADDI

---

## Principio general de diseño de campos

> Solo se deja campo de texto libre cuando el valor es único por producto (nombre propio, código, etc.).
> Todo campo que tenga un catálogo finito de valores válidos → **dropdown obligatorio**.
> Cuando el valor de un campo determina las opciones del siguiente → **campos en cascada** (el siguiente se habilita y filtra automáticamente).

---

## Bug #1 — Etiqueta incorrecta

| Campo | Etiqueta actual | Etiqueta correcta |
|---|---|---|
| Forma de presentación del producto | **"Forma Cosmética"** | **"Forma Farmacéutica"** |

El campo muestra "Forma Cosmética" incluso cuando el trámite es **Medicamentos**. El label debe cambiar dinámicamente según el `tramiteType` seleccionado en Paso 1:

- tramiteType = `medicamentos` → "Forma Farmacéutica"
- tramiteType = `cosmeticos` → "Forma Cosmética" *(aquí sí aplica)*
- tramiteType = `higienicos` / `plaguicidas` → "Forma de Presentación"

---

## Bug #2 — Campos faltantes en pantalla actual

Comparando con los 12 campos requeridos por el proceso (process_map.md), la pantalla actual solo muestra 5. Faltan:

| Campo faltante | Tipo recomendado |
|---|---|
| Principio Activo | Texto libre |
| Concentración | Texto libre (número) + dropdown (unidad) |
| Vía de Administración | Dropdown — depende de Forma Farmacéutica |
| Condición de Venta | Dropdown |
| Código ATC | Texto libre (opcional) |
| Vida Útil | Dropdown |
| Condiciones de Almacenamiento | Dropdown (multi-selección) |

---

## Campos actuales — estado y corrección requerida

### Campo: Nombre Comercial ✓
- **Tipo actual:** Texto libre
- **Tipo correcto:** Texto libre
- **Acción:** Ninguna — correcto como está.

### Campo: Clasificación ✗
- **Tipo actual:** Texto libre (muestra "Para el dolor")
- **Tipo correcto:** Dropdown — Grupo Terapéutico
- **Opciones:** Ver catálogo más abajo (Sección: Catálogos)
- **Acción:** Convertir a dropdown.

### Campo: Forma Farmacéutica ✗ (actualmente mal etiquetado como "Forma Cosmética")
- **Tipo actual:** Texto libre
- **Tipo correcto:** Dropdown — condiciona los campos siguientes
- **Acción:** Corregir etiqueta + convertir a dropdown + activar cascada.

### Campo: Descripción del Envase ✗
- **Tipo actual:** Texto libre con placeholder
- **Tipo correcto:** Dropdown
- **Opciones:** Ver catálogo más abajo
- **Acción:** Convertir a dropdown.

### Campo: Presentación del Producto ✗
- **Tipo actual:** Texto libre con placeholder
- **Tipo correcto:** Campo compuesto: Cantidad (número libre) + Unidad (dropdown) + Envase (se autocompletará desde "Descripción del Envase")
- **Ejemplo correcto:** `30` + `Tabletas Recubiertas` + en `Caja`
- **Acción:** Reestructurar en 2-3 subcampos.

---

## Lógica de campos en cascada — Medicamentos

Los campos se habilitan en orden. Cada selección puede filtrar las opciones del campo siguiente.

```
[1] Nombre Comercial (libre, siempre activo)
        ↓ habilita
[2] Principio Activo (libre)
        ↓ habilita
[3] Forma Farmacéutica (dropdown)
        ↓ filtra opciones de:
[4] Vía de Administración (dropdown — filtrado por Forma Farmacéutica)
        ↓ habilita
[5] Concentración  → número libre + dropdown de unidad (mg / mg/mL / % / UI / mcg / g)
        ↓ habilita
[6] Condición de Venta (dropdown)
        ↓ habilita
[7] Descripción del Envase (dropdown)
        ↓ habilita
[8] Presentación del Producto → cantidad (número) + unidad (dropdown)
        ↓ habilita
[9] Vida Útil (dropdown)
        ↓ habilita
[10] Condiciones de Almacenamiento (dropdown multi-selección)
        ↓ habilita
[11] Código ATC (libre, opcional)
[12] Tipo de Presentación (dropdown)
```

---

## Catálogos de opciones

### Forma Farmacéutica
```
Sólidos orales:
  Tableta, Tableta Recubierta, Tableta de Liberación Prolongada,
  Cápsula, Cápsula de Gelatina Blanda, Polvo para Suspensión Oral,
  Granulado, Comprimido Masticable, Gragea

Líquidos orales:
  Jarabe, Solución Oral, Suspensión Oral, Elixir, Emulsión Oral, Gotas Orales

Parenterales:
  Solución Inyectable, Polvo para Solución Inyectable, Suspensión Inyectable,
  Concentrado para Solución para Infusión, Emulsión Inyectable

Tópicos:
  Crema, Ungüento, Gel, Loción, Solución Tópica, Espuma Tópica,
  Parche Transdérmico, Pasta

Inhalados:
  Aerosol para Inhalación, Polvo para Inhalación, Solución para Nebulización

Rectales/Vaginales:
  Supositorio, Óvulo, Crema Vaginal, Solución Rectal

Oftálmicos/Óticos:
  Colirio (Gotas Oftálmicas), Ungüento Oftálmico, Gotas Óticas

Otros:
  Implante, Dispositivo Intrauterino, Película Oral
```

### Vía de Administración (filtrada por Forma Farmacéutica)

| Forma Farmacéutica | Vías disponibles |
|---|---|
| Tableta, Cápsula, Jarabe, Suspensión Oral, Polvo para Suspensión | Oral |
| Tableta (sublingual) | Sublingual |
| Solución Inyectable, Polvo para Solución Inyectable | Intravenosa (IV), Intramuscular (IM), Subcutánea (SC) |
| Crema, Ungüento, Gel, Loción, Parche | Tópica, Transdérmica |
| Aerosol, Polvo para Inhalación | Inhalatoria |
| Supositorio | Rectal |
| Óvulo, Crema Vaginal | Vaginal |
| Colirio | Oftálmica |
| Gotas Óticas | Ótica |
| Gotas Orales | Oral |

### Condición de Venta
```
Con Receta Médica
Sin Receta Médica (OTC)
Uso Hospitalario
Producto Controlado (Requiere receta especial)
```

### Descripción del Envase
```
Frasco de Vidrio, Frasco Plástico (HDPE), Frasco Plástico (PET),
Frasco Gotero, Ampolla, Vial, Caja (con blister/strip/aluminio),
Blister, Strip, Tubo (Aluminio), Tubo (Plástico), Sachet/Sobre,
Jeringa Precargada, Bolsa para Infusión, Tarro, Lata, Aerosol
```

### Unidades de Concentración
```
mg, mg/mL, mg/5mL, g, g/100mL, %, UI (Unidades Internacionales),
mcg (microgramos), mcg/mL, mEq/mL, mg/g, nmol
```

### Unidades de Presentación (cantidad)
```
Tabletas, Cápsulas, mL, g, mg, Ampollas, Viales, Óvulos,
Supositorios, Parches, Sobres, Jeringas
```

### Vida Útil
```
12 meses, 18 meses, 24 meses, 30 meses, 36 meses, 48 meses, 60 meses
```

### Condiciones de Almacenamiento (multi-selección)
```
Temperatura ambiente (15–30°C)
Refrigerar (2–8°C)
Congelar (≤ –20°C)
Proteger de la luz
Proteger de la humedad
No requiere condiciones especiales
```

### Grupo Terapéutico (Clasificación)
```
Sistema Nervioso Central
Sistema Cardiovascular
Sistema Respiratorio
Sistema Digestivo y Metabolismo
Antiinfecciosos (Antibióticos, Antivirales, Antifúngicos, Antiparasitarios)
Sistema Musculoesquelético
Sistema Genitourinario y Hormonas Sexuales
Hormonas Sistémicas (excl. hormonas sexuales)
Dermatológicos
Oftalmológicos y Otológicos
Antineoplásicos e Inmunomoduladores
Sistema Hematológico
Nutrición y Metabolismo
Diagnóstico y Contraste
Otros
```

### Tipo de Presentación
```
Unitaria, Múltiple, Institucional / Hospital
```

---

## Campos para otros tramiteTypes (a implementar en fases posteriores)

### Cosméticos — Paso 2
| Campo | Tipo |
|---|---|
| Nombre Comercial | Libre |
| Tipo de Cosmético | Dropdown (Hidratante, Protector Solar, Champú, Maquillaje, Perfume, etc.) |
| Ingredientes activos principales (INCI) | Texto libre |
| Uso previsto | Dropdown (Cuerpo, Rostro, Cabello, Íntimo, etc.) |
| Presentación | Dropdown (Crema, Loción, Spray, Gel, Polvo, etc.) |
| Volumen/Peso neto | Número libre + Unidad dropdown (mL, g, oz) |

### Excepción — Paso 2
| Campo | Tipo |
|---|---|
| Nombre del Producto | Libre |
| Principio Activo | Libre |
| País de Origen | Dropdown (lista de países) |
| Número de Lote | Libre |
| Cantidad a Importar | Número libre + Unidad dropdown |
| Motivo de la Excepción | Dropdown (Calamidad pública, Desabasto, Uso compasivo, Paciente específico, Compra institucional) |

---

## Resumen de acciones para el developer

| # | Acción | Prioridad |
|---|---|---|
| 1 | Corregir etiqueta "Forma Cosmética" → dinámica por tramiteType | Alta |
| 2 | Agregar campos faltantes (Principio Activo, Concentración, Vía, Condición Venta, Vida Útil, Almacenamiento) | Alta |
| 3 | Convertir Clasificación a dropdown (Grupo Terapéutico) | Alta |
| 4 | Convertir Forma Farmacéutica a dropdown | Alta |
| 5 | Implementar cascada: Forma Farmacéutica → filtra Vía de Administración | Alta |
| 6 | Convertir Descripción del Envase a dropdown | Media |
| 7 | Convertir Presentación del Producto a campos compuestos (cantidad + unidad) | Media |
| 8 | Convertir Vida Útil a dropdown | Media |
| 9 | Convertir Condiciones de Almacenamiento a dropdown multi-selección | Media |
| 10 | Habilitar campos en orden (cascada visual) — el siguiente se habilita al completar el anterior | Media |
| 11 | Implementar campos Paso 2 para Cosméticos y Excepción | Baja (Fases 4 y 3) |

---

*Observación del PM — 2026-08-25. No modificar código directamente. Pasar al developer como orden de trabajo.*
