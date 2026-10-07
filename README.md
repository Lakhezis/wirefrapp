# Wirefrapp

Aplicación web liviana para diseñar wireframes de una pantalla. Combina un editor de tonos suaves con componentes neutrales, pensados para representar interfaces sin definir su diseño final.

## Características

- Lienzos para Desktop (1440 × 900), Tablet (768 × 1024) y Mobile (390 × 844).
- Componentes básicos: texto, título, botón, input, textarea, checkbox, radio, imagen placeholder, rectángulo y línea.
- Bloques editables: Navbar, Sidebar, Card, Formulario, Tabla y Footer.
- Selección, movimiento, redimensionamiento, duplicación y eliminación.
- Edición de contenido, posición, tamaño y estilos.
- Alineación, zoom y cuadrícula con ajuste opcional.
- Historial para deshacer y rehacer.
- Creación, apertura, renombrado y eliminación de proyectos.
- Guardado manual en el navegador mediante localStorage.
- Impresión del lienzo y guardado como PDF desde el navegador.

## Diseño y arquitectura

Desarrollada con **HTML, CSS y JavaScript nativo**, sin frameworks, backend ni dependencias externas.

El editor se organiza en una barra superior, un catálogo de componentes, un lienzo central y un panel de propiedades. La identidad visual utiliza colores pastel y un patrón cuadrillé sutil; los wireframes mantienen una paleta neutra.

JavaScript se divide en módulos por responsabilidad: estado, componentes, lienzo, interacciones, propiedades, alineación, historial, almacenamiento e interfaz. Los proyectos se representan como datos y el DOM se genera a partir de ese estado. Los tamaños de pantalla y los límites se centralizan en `js/config.js`; el catálogo se define en `js/components.js`.

## Uso local

Requiere un navegador moderno y un servidor HTTP estático, como Live Server o el servidor incluido en Python 3:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Acceder a [localhost:8000](http://localhost:8000). No requiere instalación de paquetes ni compilación.

## Guardado e impresión

El guardado es **manual**, mediante Guardar o `Ctrl+S`. Los proyectos permanecen en el navegador y origen utilizados; borrar los datos del sitio elimina las copias locales.

Para generar un PDF, usar `Ctrl+P` y seleccionar **Guardar como PDF**. Se imprime únicamente el lienzo. Se recomienda papel A4 y desactivar los encabezados y pies del navegador.

Cambiar el dispositivo solicita confirmación y vacía el lienzo. Cada proyecto contiene una sola pantalla. Los componentes son representaciones visuales: sus campos, botones y enlaces no tienen comportamiento interactivo.

## Estructura

```text
index.html   Estructura del editor
css/         Tema, componentes e impresión
js/          Módulos de la aplicación
tests/       Pruebas de estado, bloques, historial y almacenamiento
```

## Pruebas

Requieren Node.js:

```sh
node --experimental-default-type=module --test tests/*.test.mjs
```

## Desarrollo con IA

Desarrollé este proyecto con la asistencia de **Codex, una IA de OpenAI**, para
escribir y revisar código, preparar documentación y realizar pruebas. La idea,
la dirección del proyecto y las decisiones finales estuvieron a mi cargo.
