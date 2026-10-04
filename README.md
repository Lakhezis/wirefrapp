# Wirefrapp

Editor local de wireframes con HTML, CSS y JavaScript nativo. Esta versión implementa las etapas 1 a 5: base visual, componentes básicos, selección, manipulación, edición de propiedades e historial. No requiere dependencias ni compilación.

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

Gestión de proyectos y guardado están deshabilitados. Navbar, Sidebar, Card, Formulario, Tabla y Footer siguen visibles como próximos. Todavía no se implementa persistencia. Los componentes son representaciones visuales: sus botones y campos se seleccionan, pero no funcionan como un formulario real. Ctrl+D (Cmd+D en macOS) duplica, Delete elimina, las flechas mueven 1 px y Shift+flechas mueven 10 px. Los atajos se ignoran dentro de campos y diálogos. Undo/Redo y Ctrl+Z / Ctrl+Shift+Z están habilitados (Cmd en macOS), también mientras se editan propiedades. Guardar todavía no está conectado.

## Organización

- `index.html`: estructura accesible de los cuatro espacios del editor.
- `css/editor.css`: tema mediante variables, distribución, controles, patrón decorativo y estilos de impresión.
- `css/components.css`: catálogo visual y paleta neutral reservada para componentes.
- `js/app.js`: inicio y conexión de módulos.
- `js/config.js`: tamaños de dispositivo, cuadrícula, zoom y atajos previstos.
- `js/state.js`: datos del proyecto, creación de instancias con ID único, posiciones iniciales y selección, sin persistencia.
- `js/components.js`: catálogo centralizado, valores iniciales, propiedades editables previstas, creación de datos y representación visual de cada tipo.
- `js/canvas.js`: dimensiones, cuadrícula, escala, representación de elementos, eventos de selección y disposición impresa.
- `js/properties.js`: edición, validación y presentación de propiedades según el tipo seleccionado.
- `js/ui.js`: eventos de los controles activos.

Los módulos de almacenamiento y proyectos se crearán cuando se implementen sus respectivas etapas. No existe módulo de exportación ni librerías externas.

## Estado y representación

Cada instancia contiene `id`, `type`, `x`, `y`, `width`, `height`, `content` y `styles`. El proyecto guarda una lista de estos objetos, nunca HTML. El DOM se genera desde esa lista. La selección se guarda por separado en `selectedElementId`, por lo que el estilo de selección no forma parte del wireframe. Cada instancia recibe su propia copia de estilos.

Para incorporar otro tipo básico, agregar una definición en `COMPONENT_TYPES` con nombre, icono, valores iniciales, propiedades editables y función de representación. Los textos se insertan con `textContent`. El guardado todavía no está implementado: recargar o cerrar la página descarta el trabajo de esta etapa.

## Manipulación

Arrastrá un componente para moverlo y usá sus ocho tiradores para cambiar el tamaño. Las coordenadas tienen en cuenta el zoom y el desplazamiento del área de diseño. Ningún elemento puede salir del lienzo. El tamaño mínimo general es 24 px; los componentes inicialmente menores, como Línea, conservan ese mínimo menor. La cuadrícula ajusta posiciones y bordes durante los gestos; los límites del lienzo tienen prioridad. Las flechas conservan pasos exactos de 1 o 10 px aunque esté activado el ajuste.

Duplicar crea un ID nuevo y copia independiente de estilos, con desplazamiento limitado al lienzo. Eliminar limpia la selección. Cancelar un gesto de puntero restaura su geometría inicial.

- `js/geometry.js`: cálculos de movimiento, redimensionamiento, límites y cuadrícula.
- `js/interactions.js`: gestos de puntero y atajos de manipulación.

## Propiedades y alineación

El panel permite editar posición, tamaño, contenido y estilos disponibles en el catálogo de cada tipo. Los cambios se ven al escribir. Campos vacíos o valores inválidos no modifican el estado; al confirmar se muestran los valores válidos. Las posiciones y dimensiones se limitan al lienzo, con los mismos tamaños mínimos que los tiradores. La fuente admite de 8 a 96 px, el borde de 0 a 20 px (limitado además por el tamaño del elemento), y el radio de 0 a 200 px. Estos límites están en config.js. El fondo puede ser transparente mediante “Sin fondo”.

Las seis herramientas alinean el componente respecto del lienzo y conservan su tamaño. La edición numérica y la alineación usan posiciones exactas, independientemente de la cuadrícula. Las propiedades de texto se ocultan en formas sin contenido.

- `js/alignment.js`: calcula cambios para una lista de elementos, preparada para selección múltiple futura.

El guardado permanece pendiente.

## Historial

Undo y Redo recuperan copias de los datos del proyecto. Se conservan hasta 50 acciones anteriores, configurable con HISTORY_LIMIT en config.js. Cada incorporación, duplicación, eliminación, alineación o movimiento con flechas cuenta como una acción. Cada arrastre y redimensionamiento completo cuenta como una sola acción. Las ediciones de un campo se agrupan hasta confirmar el cambio o salir del campo; se siguen viendo mientras se escribe. Los gestos cancelados y los cambios que no alteran datos no generan entradas.

Ctrl+Z deshace y Ctrl+Shift+Z rehace, incluso dentro del panel de propiedades; en macOS se usa Cmd. Una nueva edición después de deshacer descarta la rama de rehacer. Selección, zoom y cuadrícula no se guardan en el historial. Si una restauración elimina el elemento seleccionado, se limpia la selección.

Confirmar el cambio de dispositivo limpia también el historial; cancelar lo conserva. El historial vive solamente en memoria durante la sesión.

- `js/history.js`: copias del proyecto, registro, restauración y límite del historial.

## Verificar el historial

Las pruebas usan únicamente las herramientas incluidas en Node.js. Con Node instalado, ejecutar desde la carpeta del proyecto:

```sh
node --experimental-default-type=module --test tests/history.test.mjs
```

Estas pruebas comprueban recuperación de datos y estilos, agrupación, cambios sin efecto, ramas de rehacer, límite de acciones y reinicio. Node solo se utiliza para las pruebas; la aplicación sigue funcionando con un servidor estático.
