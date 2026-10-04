# Wirefrapp

Editor local de wireframes con HTML, CSS y JavaScript nativo. Esta versión implementa únicamente la etapa 1: base visual y estructural. No requiere dependencias ni compilación.

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
- Activar la preferencia de ajuste a cuadrícula. Todavía no tiene efecto sobre elementos.
- Impresión del lienzo con Ctrl+P (Cmd+P en macOS), sin interfaz ni cuadrícula.

El cambio de dispositivo cambia únicamente las dimensiones del lienzo y ajusta el zoom de la vista. No modifica los datos de los elementos. El lienzo está vacío en esta etapa.

## Impresión

Elegir “Guardar como PDF”, papel A4 y desactivar los encabezados y pies de página del navegador. Wirefrapp propone orientación horizontal para Desktop y vertical para Tablet/Mobile; escala el lienzo proporcionalmente dentro de márgenes de 10 mm, independientemente del zoom del editor. Mantener la escala de impresión en 100% o predeterminada. Las preferencias manuales de la impresora o navegador pueden reemplazar el tamaño y los márgenes propuestos.

## Controles preparados

Gestión de proyectos, guardado, Undo/Redo, catálogo, propiedades, alineación, duplicación y eliminación están deshabilitados. No se implementan componentes, arrastre, redimensionamiento, historial ni persistencia. Los atajos futuros están documentados en config.js y todavía no interceptan teclas.

## Organización

- `index.html`: estructura accesible de los cuatro espacios del editor.
- `css/editor.css`: tema mediante variables, distribución, controles, patrón decorativo y estilos de impresión.
- `css/components.css`: catálogo visual y paleta neutral reservada para componentes.
- `js/app.js`: inicio y conexión de módulos.
- `js/config.js`: tamaños de dispositivo, cuadrícula, zoom y atajos previstos.
- `js/state.js`: estado inicial del proyecto y preferencias de vista, sin persistencia.
- `js/components.js`: catálogo y representación de sus botones deshabilitados.
- `js/canvas.js`: dimensiones, cuadrícula, escala del lienzo y disposición impresa.
- `js/ui.js`: eventos de los controles activos.

Los módulos de propiedades, alineación, historial, almacenamiento y proyectos se crearán cuando se implementen sus respectivas etapas. No existe módulo de exportación ni librerías externas.
