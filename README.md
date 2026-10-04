# Wirefrapp

Editor local de wireframes con HTML, CSS y JavaScript nativo. Esta versión implementa las etapas 1 a 3: base visual, componentes básicos, selección y manipulación. No requiere dependencias ni compilación.

## Ejecutar localmente

Desde esta carpeta, con Python 3 instalado:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abrir http://127.0.0.1:8000 en el navegador. Para detener el servidor, presionar Ctrl+C en la terminal. También se puede usar un servidor estático como Live Server de VS Code. Los módulos JavaScript necesitan servir los archivos por HTTP; no abrir index.html directamente con file://.

## Qué funciona

- Selector Desktop (1440 × 900), Tablet (768 × 1024) y Mobile (390 × 844).
- Zoom entre 10% y 200%, ajuste al espacio disponible y desplazamiento del área de diseño.
- Mostrar u ocultar la cuadrícula de 16 px.
- Activar la preferencia de ajuste a cuadrícula. Se aplica al arrastrar y redimensionar.
- Agregar Texto, Título, Botón, Input, Textarea, Checkbox, Radio button, Imagen placeholder, Rectángulo y Línea.
- Seleccionar una instancia con un clic (o Enter/Espacio al enfocarla), y deseleccionar haciendo clic en el fondo del lienzo.
- Consultar tipo, ID, posición, tamaño y contenido en el panel de propiedades.
- Impresión del lienzo con Ctrl+P (Cmd+P en macOS), sin interfaz, cuadrícula ni contorno de selección.

Al cambiar de dispositivo aparece una advertencia con las opciones Sí y No. Confirmar elimina todos los componentes, limpia la selección, cambia las dimensiones y ajusta el zoom. Elegir No o presionar Escape conserva el dispositivo, los elementos, la selección y el zoom. Se solicita confirmación tanto al pasar a un tamaño menor como a uno mayor, incluso si el lienzo está vacío. El nombre del proyecto y las preferencias de cuadrícula se conservan.

Las posiciones iniciales de los componentes se escalonan dentro del lienzo. Las instancias pueden superponerse y moverse arrastrando.

## Impresión

Elegir “Guardar como PDF”, papel A4 y desactivar los encabezados y pies de página del navegador. Wirefrapp propone orientación horizontal para Desktop y vertical para Tablet/Mobile; escala el lienzo proporcionalmente dentro de márgenes de 10 mm, independientemente del zoom del editor. Mantener la escala de impresión en 100% o predeterminada. Las preferencias manuales de la impresora o navegador pueden reemplazar el tamaño y los márgenes propuestos.

## Controles preparados

Gestión de proyectos, guardado, Undo/Redo, edición de propiedades, alineación están deshabilitados. Navbar, Sidebar, Card, Formulario, Tabla y Footer siguen visibles como próximos. Todavía no se implementan historial ni persistencia. Los componentes son representaciones visuales: sus botones y campos se seleccionan, pero no funcionan como un formulario real. Ctrl+D (Cmd+D en macOS) duplica, Delete elimina, las flechas mueven 1 px y Shift+flechas mueven 10 px. Los atajos se ignoran dentro de campos y diálogos. Deshacer, rehacer y guardar todavía no están conectados.

## Organización

- `index.html`: estructura accesible de los cuatro espacios del editor.
- `css/editor.css`: tema mediante variables, distribución, controles, patrón decorativo y estilos de impresión.
- `css/components.css`: catálogo visual y paleta neutral reservada para componentes.
- `js/app.js`: inicio y conexión de módulos.
- `js/config.js`: tamaños de dispositivo, cuadrícula, zoom y atajos previstos.
- `js/state.js`: datos del proyecto, creación de instancias con ID único, posiciones iniciales y selección, sin persistencia.
- `js/components.js`: catálogo centralizado, valores iniciales, propiedades editables previstas, creación de datos y representación visual de cada tipo.
- `js/canvas.js`: dimensiones, cuadrícula, escala, representación de elementos, eventos de selección y disposición impresa.
- `js/properties.js`: información del elemento seleccionado, en modo lectura.
- `js/ui.js`: eventos de los controles activos.

Los módulos de alineación, historial, almacenamiento y proyectos se crearán cuando se implementen sus respectivas etapas. No existe módulo de exportación ni librerías externas.

## Estado y representación

Cada instancia contiene `id`, `type`, `x`, `y`, `width`, `height`, `content` y `styles`. El proyecto guarda una lista de estos objetos, nunca HTML. El DOM se genera desde esa lista. La selección se guarda por separado en `selectedElementId`, por lo que el estilo de selección no forma parte del wireframe. Cada instancia recibe su propia copia de estilos.

Para incorporar otro tipo básico, agregar una definición en `COMPONENT_TYPES` con nombre, icono, valores iniciales, propiedades editables y función de representación. Los textos se insertan con `textContent`. El guardado todavía no está implementado: recargar o cerrar la página descarta el trabajo de esta etapa.

## Manipulación

Arrastrá un componente para moverlo y usá sus ocho tiradores para cambiar el tamaño. Las coordenadas tienen en cuenta el zoom y el desplazamiento del área de diseño. Ningún elemento puede salir del lienzo. El tamaño mínimo general es 24 px; los componentes inicialmente menores, como Línea, conservan ese mínimo menor. La cuadrícula ajusta posiciones y bordes durante los gestos; los límites del lienzo tienen prioridad. Las flechas conservan pasos exactos de 1 o 10 px aunque esté activado el ajuste.

Duplicar crea un ID nuevo y copia independiente de estilos, con desplazamiento limitado al lienzo. Eliminar limpia la selección. Cancelar un gesto de puntero restaura su geometría inicial.

- `js/geometry.js`: cálculos de movimiento, redimensionamiento, límites y cuadrícula.
- `js/interactions.js`: gestos de puntero y atajos de manipulación.
