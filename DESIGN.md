# Design System Framework: Documentos Ejecutivos y Propuestas

## 1. Filosofía Visual (Look & Feel)
* **Estilo:** Minimalista, corporativo, sofisticado.
* **Enfoque:** Arquitectura de la información basada en la alta legibilidad y jerarquía tipográfica. Cero elementos decorativos innecesarios.
* **Espaciado:** Uso intensivo de *whitespace* (espacio en blanco) para separar bloques lógicos y reducir la carga cognitiva.

## 2. Sistema Tipográfico y Jerarquía
La estructura se sostiene puramente por el tamaño, peso y color, empleando un enfoque de **Tipografía Dual de Autoridad**:
* **Fuente Principal:** Una Sans-Serif geométrica y limpia (ej. Inter, Helvetica) en múltiples pesos para el cuerpo y titulares.
* **Fuente Secundaria (Data & Tech):** Una fuente Monospace (ej. JetBrains Mono, Space Mono) reservada estrictamente para datos duros: números, moneda, folios (ej. `RE-001`), e identificadores de sección (`01`, `02`). Esto inyecta un ADN técnico/contable ("Accounting Look").

* **H1 (Hero Title):** Tamaño masivo (ej. 5.5rem), peso Extra-Bold (800). Frecuentemente partido en dos líneas de alto impacto, alineado a la izquierda. Acompañado arriba por un "Supertítulo" descriptivo en caja alta, tamaño mínimo y espaciado amplio.
* **H2 (Marcadores de Sección):** Título descriptivo acompañado de un número de sección en Monospace gris claro (`01`). En el extremo derecho, suele llevar un "Tag" o etiqueta en caja alta para dar contexto analítico.
* **Body Text:** Regular, color gris oscuro ("muted") para no competir con los titulares, con un interlineado generoso (1.5 - 1.6) para lectura analítica.
* **Énfasis:** Uso estratégico de **Bold** en color negro puro dentro de los párrafos para destacar métricas o conceptos clave.

## 3. Estructura de la Página (Layout)

### A. Cabecera y Grid de Metadatos (Header & Metadata)
El documento rechaza las introducciones suaves. Inicia directamente con un formato operativo y de datos duros:
* **Cabecera Top:** Logo/Nombre alineado a la izquierda. Identificador del documento (ej. `OFFER MEMO DOC-202X-001`) a la derecha, mezclando fuente principal y monospace.
* **Metadata Grid:** Una matriz de datos separada por sutiles líneas divisorias horizontales (1px gris muy claro). Expone los datos críticos con etiquetas en caja alta:
    * DE PARTE DE: [Emisor + Rol + Ubicación] (Usar cargos limpios y corporativos, ej. "Dirección Comercial" sin agregar jerga interna innecesaria).
    * PARA: [Receptor + Segmento]
    * REFERENCIA: [Contexto Estratégico]
    * Bloque Secundario Contable: EMISIÓN / VIGENCIA / FOLIO / TIPO.

### B. Cuerpo del Documento (Layout Analítico)
* **Bloques Modulares:** Cada sección funciona como un módulo independiente. Siempre separar claramente la **Lógica y Requerimientos** del **Esquema Comercial/Pricing**. Nunca mezclar requerimientos técnicos en la misma sección que los precios.
* **Layout Analítico (2 Columnas):** En lugar de viñetas interminables, la información comparativa o estructural se divide en dos columnas paralelas. Esto facilita el escaneo cognitivo de contrastes.
* **Listas Vectoriales:** En lugar de los clásicos *bullet points* (•), se utilizan flechas vectoriales (`→`) en color gris para denotar proceso o dirección, manteniendo un aspecto quirúrgico.

### C. Elementos Visuales de Datos (Data Display)
* **Listas Contables (Accounting Lists):** Para modelos de precios o distribución financiera, se rechazan las tablas tradicionales. Se utiliza un layout aéreo: descripción alineada a la izquierda (en gris) y valor numérico alineado a la derecha en tipografía Monospace.
* **Fórmulas/Callouts:** Cuando hay un "Bottom Line" o regla matemática, se extrae del párrafo y se presenta como una declaración aislada para forzar su retención.

## 4. Patrones de Redacción (Copywriting UX)
* **Naturalidad y Empoderamiento:** El tono es sofisticado y de élite, pero *cliente-céntrico*. Deben evitarse tecnicismos agresivos que abrumen al cliente. El objetivo es transmitir seguridad.
    * *Usa:* "Calificación Inteligente". *Evita:* "Calificación Quirúrgica".
    * *Usa:* "Control Total". *Evita:* "Control AI-Native".
    * *Usa:* "Dirección Comercial". *Evita:* "Dirección Comercial (RevOps)".
* **Esquema Comercial "Zero-Risk" (Pilotos/POC):** En propuestas de validación, el esquema comercial debe enfocarse en los resultados y no en cifras cerradas prematuras. Se divide en "Mes 1: Implementación (Riesgo nuestro)" y "Post-Validación (Renegociación de Partnership tras resultados tangibles)".
* **Títulos Accionables:** Los títulos de las tablas o secciones no son pasivos. (Ej. en lugar de "Ingresos y Gastos", usar "SI SE DESCUENTAN" / "NO SE DESCUENTAN").
* **Párrafos cortos:** Máximo 3-4 líneas por bloque de texto. Si hay más información, se rompe en una lista con viñetas vectoriales.

## 5. Exportación a PDF (Print CSS Styles)
Todo documento HTML diseñado bajo este esquema debe incluir reglas rigurosas `@media print` para asegurar que el usuario final pueda exportar el documento desde Chrome (Cmd+P) sin perder el diseño.

Se deben incluir obligatoriamente las siguientes directivas:
1. **Limpieza del Navegador:** `@page { margin: 0; size: portrait; }` para suprimir la URL, fecha de impresión, título predeterminado del navegador y folios nativos del footer.
2. **Densidad de Información y Espaciado:** `body { padding: 15mm 25mm; }` en las reglas de impresión para maximizar el uso de la página, evitando márgenes blancos gigantes arriba o abajo que rompan la continuidad de lectura.
3. **Mantenimiento de Columnas:** Forzar la retención de las columnas con `display: grid !important` en grids de metadatos y contenedores `.two-col`, asegurando también forzar sus anchos en proporciones como `1fr 1fr !important`.
4. **Fidelidad de Color:** Usar `print-color-adjust: exact;` o `-webkit-print-color-adjust: exact;` en el `body` para que Chrome dibuje todas las líneas grises, fondos y acentos tipográficos.
5. **Rotura de Página:** Utilizar `break-inside: avoid;` en contenedores de secciones completas para evitar que los títulos o párrafos se corten por la mitad entre una hoja y otra.