# Wirefrapp

Editor local de wireframes con HTML, CSS y JavaScript nativo. Implementa las etapas 1 a 6 y los seis bloques de la etapa 7: editor visual, componentes básicos, manipulación, propiedades, historial y proyectos con **guardado manual**. No requiere dependencias, backend ni compilación.

## Ejecutar localmente

Desde esta carpeta, con Python 3 instalado:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abrir http://127.0.0.1:8000 en el navegador. Para detener el servidor, presionar Ctrl+C. También se puede usar un servidor estático como Live Server de VS Code. Los módulos JavaScript necesitan HTTP; no abrir index.html directamente con file://.

## Proyectos y guardado manual

- **Nuevo:** elegir nombre y pantalla; se crea un proyecto vacío en memoria.
- **Guardar / Ctrl+S:** guardar la copia actual en el navegador (Cmd+S en macOS).
- **Abrir:** elegir entre los proyectos guardados y recuperar su última copia guardada.
- **Renombrar:** cambiar el nombre en el editor. Presionar Guardar para conservar el nombre nuevo.
- **Eliminar:** confirmar para eliminar el proyecto actual, su copia guardada y sus cambios pendientes. Esta acción no se puede deshacer.

**No hay guardado automático.** Editar componentes, deshacer, rehacer o renombrar no escribe el diseño en localStorage. La barra indica “Cambios sin guardar”, “Guardado localmente” o si ocurrió un error. Nuevo y Abrir ofrecen Cancelar, Descartar cambios o Guardar y continuar cuando corresponde. Al cerrar o recargar con cambios pendientes, el navegador puede mostrar su advertencia nativa.

Al iniciar se recupera el último proyecto guardado o abierto. Se restauran nombre, dispositivo, componentes, IDs, contenido, estilos y las preferencias de vista de la copia guardada: zoom, cuadrícula, selección y desplazamiento. Abrir recuerda el identificador del último proyecto sin guardar modificaciones del lienzo. El historial se reinicia al cambiar de proyecto o reiniciar la aplicación.

Se usa **localStorage** porque el proyecto contiene principalmente texto y números: resulta sencillo y suficiente para este MVP. Las operaciones conservan varios proyectos en una colección versionada y validan los datos antes de usarlos. Un fallo de cuota o acceso deja los cambios en memoria y no informa que se guardaron. Los datos dañados o incompatibles no se sobrescriben.

Los proyectos pertenecen al navegador, perfil y origen utilizados. Usar siempre la misma dirección y puerto para encontrar los mismos proyectos. Borrar los datos del sitio elimina sus copias locales. No hay cuentas, sincronización, archivos JSON ni exportación programática.

## Lienzo y componentes

- Desktop: 1440 × 900; Tablet: 768 × 1024; Mobile: 390 × 844.
- Zoom de 10% a 200%, ajuste a la vista y desplazamiento del área de diseño.
- Cuadrícula opcional de 16 px y ajuste al arrastrar o redimensionar.
- Texto, Título, Botón, Input, Textarea, Checkbox, Radio button, Imagen placeholder, Rectángulo y Línea.
- Selección individual, arrastre, ocho tiradores, duplicación y eliminación.
- Edición inmediata de posición, tamaño, contenido y estilos disponibles por tipo.
- Seis herramientas de alineación respecto del lienzo.

Card, Navbar, Sidebar, Footer, Formulario y Tabla están habilitados como bloques. Los componentes son representaciones visuales; sus botones y campos se seleccionan y no funcionan como formularios reales.

Cambiar el dispositivo pide confirmación. Sí elimina los elementos y el historial; No o Escape conserva todo. El cambio se mantiene en memoria hasta pulsar Guardar, por lo que la copia anterior sigue disponible mientras no se la reemplace mediante un guardado manual.

Ningún componente puede salir del lienzo. El mínimo general es 24 px; Línea conserva un grosor mínimo de 2 px. Los límites del lienzo tienen prioridad sobre la cuadrícula. La edición numérica y las alineaciones utilizan posiciones exactas. El borde se limita también al tamaño del elemento.

## Atajos

- Ctrl+S: guardar manualmente.
- Ctrl+Z / Ctrl+Shift+Z: deshacer / rehacer, incluso dentro del panel de propiedades.
- Ctrl+D: duplicar.
- Delete: eliminar.
- Flechas / Shift+flechas: mover 1 / 10 px, aunque esté activada la cuadrícula.

En macOS se usa Cmd en lugar de Ctrl. Los atajos de manipulación se ignoran dentro de campos y diálogos.

## Historial

Se conservan hasta 50 acciones, configurables con HISTORY_LIMIT. Cada incorporación, duplicación, eliminación, alineación o movimiento con flechas cuenta como una acción. Cada arrastre y redimensionamiento completo cuenta como una sola acción. Las ediciones de un campo se agrupan hasta confirmar o salir del campo. Los cambios sin efecto y los gestos cancelados no agregan entradas.

Una edición nueva después de deshacer descarta la rama de rehacer. Selección, zoom y cuadrícula quedan fuera del historial. La selección se limpia si su elemento deja de existir. Guardar no agrega una acción ni limpia el historial; crear, abrir o eliminar un proyecto sí lo reinicia. Renombrar se registra como una acción del proyecto.

## Impresión

Usar Ctrl+P (Cmd+P en macOS), elegir “Guardar como PDF”, papel A4 y desactivar encabezados y pies del navegador. Se imprime solamente el lienzo, sin interfaz, cuadrícula, selección ni tiradores. Desktop propone orientación horizontal y Tablet/Mobile vertical. Se conservan las proporciones dentro de márgenes de 10 mm, independientemente del zoom del editor. Mantener la escala de impresión en 100% o predeterminada; las preferencias del navegador pueden reemplazar los ajustes propuestos.

## Organización

- `index.html`: estructura del editor, controles y diálogos accesibles.
- `css/editor.css`: tema mediante variables, distribución, controles, patrón decorativo e impresión.
- `css/components.css`: catálogo, componentes neutrales, selección y tiradores.
- `js/app.js`: inicialización y conexión de módulos.
- `js/config.js`: dimensiones, límites, atajos, versión y clave de almacenamiento.
- `js/state.js`: proyectos en memoria, instancias, IDs, selección y acciones básicas.
- `js/components.js`: catálogo centralizado, valores iniciales, propiedades editables y representación.
- `js/canvas.js`: representación del lienzo, selección, zoom, cuadrícula e impresión.
- `js/geometry.js`: cálculos de movimiento, tamaño, límites y cuadrícula.
- `js/interactions.js`: gestos de puntero y atajos de manipulación e historial.
- `js/properties.js`: edición, validación y agrupación de propiedades.
- `js/alignment.js`: cálculos de alineación preparados para varias instancias.
- `js/history.js`: copias del proyecto, registro, restauración y límite de acciones.
- `js/storage.js`: lectura, validación y escritura de copias locales versionadas.
- `js/projects.js`: guardado manual, recuperación, gestión de proyectos, mensajes y cambios pendientes.
- `js/ui.js`: conexión de controles, estado y módulos.

Las instancias contienen `id`, `type`, `x`, `y`, `width`, `height`, `content` y `styles`. El DOM se genera desde los datos, nunca se almacena HTML. Cada instancia tiene estilos independientes. Para incorporar un tipo básico, agregar su definición en COMPONENT_TYPES. Los textos se insertan con textContent.

## Pruebas

Con Node.js instalado, ejecutar desde la carpeta del proyecto:

```sh
node --experimental-default-type=module --test tests/*.test.mjs
```

Las pruebas usan herramientas incluidas en Node: comprueban historial, validación, recuperación de proyectos, varias copias, datos dañados y fallos de cuota. Node solo se utiliza para las pruebas; la aplicación sigue necesitando únicamente un servidor estático.

## Bloques reutilizables

Card contiene título, descripción y texto de un botón opcional. Dejar el botón vacío lo oculta. Navbar contiene nombre de marca y enlaces, uno por línea; las líneas vacías se ignoran. Sidebar contiene título, enlaces verticales y texto inferior opcional; dejarlo vacío lo oculta. Footer contiene texto del pie y enlaces horizontales. En todos los bloques, los enlaces se escriben uno por línea y las líneas vacías se ignoran. Sus piezas internas no se seleccionan ni funcionan como botones o enlaces reales. Se mueve, redimensiona y edita el bloque completo.

Los campos se definen en contentFields dentro del catálogo. En estos tipos, content es un objeto de textos; los componentes básicos conservan sus cadenas de texto anteriores. Cada instancia y duplicado recibe una copia independiente. El historial y el almacenamiento siguen guardando datos, nunca HTML. Los proyectos anteriores siguen siendo compatibles.

Los mínimos de tamaño son 140 × 120 para Card, 180 × 48 para Navbar, 140 × 160 para Sidebar y 180 × 72 para Footer, 160 × 160 para Formulario y 180 × 100 para Tabla, definidos en minimumSize del catálogo y compartidos por tiradores, propiedades y validación de almacenamiento. El contenido se ajusta al espacio del bloque; textos largos que exceden el tamaño disponible se recortan dentro del bloque. Se conservan los estilos neutrales y el guardado exclusivamente manual.

Formulario contiene título opcional, campos (una etiqueta por línea) y botón opcional. Los campos son representaciones de inputs vacíos, no controles para ingresar datos. Tabla contiene título opcional, encabezados separados por `|` y filas, una por línea, con sus celdas separadas por `|`. Por ejemplo:

```text
Columnas: Nombre | Estado | Fecha
Filas:
Proyecto A | Activo | 01/10
Proyecto B | Pendiente | 02/10
```

Las líneas vacías se ignoran. Las filas cortas se completan con celdas vacías; las celdas que exceden la cantidad de columnas no se muestran, pero su texto se conserva en el panel. Sin encabezados no se muestra la grilla de la tabla. `|` funciona como separador y no admite escape dentro de una celda. Los títulos y botones vacíos se ocultan. Para ver más contenido, ampliar el bloque; el contenido que excede su tamaño se recorta.
