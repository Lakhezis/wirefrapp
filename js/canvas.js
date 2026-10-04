import { DEVICE_SIZES, GRID_SIZE, ZOOM } from './config.js';

export function clampZoom(value) {
  return Math.max(ZOOM.min, Math.min(ZOOM.max, value));
}

export function fitZoom(state, viewport) {
  const size = DEVICE_SIZES[state.project.device];
  const style = getComputedStyle(viewport);
  const width = viewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const height = viewport.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  return clampZoom(Math.min(width / size.width, height / size.height, 1));
}

export function renderCanvas(state, elements) {
  const size = DEVICE_SIZES[state.project.device];
  const zoom = state.view.zoom;
  elements.canvas.style.width = `${size.width}px`;
  elements.canvas.style.height = `${size.height}px`;
  elements.canvas.style.transform = `scale(${zoom})`;
  elements.canvas.style.setProperty('--grid-size', `${GRID_SIZE}px`);
  elements.canvas.classList.toggle('show-grid', state.view.showGrid);
  elements.frame.style.width = `${size.width * zoom}px`;
  elements.frame.style.height = `${size.height * zoom}px`;
  elements.size.textContent = `${size.label} · ${size.width} × ${size.height} px`;
  elements.zoomValue.textContent = `${Math.round(zoom * 100)}%`;
  elements.zoomOut.disabled = zoom <= ZOOM.min;
  elements.zoomIn.disabled = zoom >= ZOOM.max;
  elements.snapStatus.textContent = state.view.snapToGrid ? 'Ajuste activado · disponible al mover elementos' : 'Ajuste a cuadrícula desactivado';
  updatePrintLayout(size);
}

function updatePrintLayout(size) {
  // Página A4 con 10 mm de margen. La escala impresa es independiente del zoom del editor.
  const landscape = size.width > size.height;
  const pageWidth = landscape ? 277 : 190;
  const pageHeight = landscape ? 190 : 277;
  const millimetersPerPixel = Math.min(pageWidth / size.width, pageHeight / size.height);
  const pixelsPerMillimeter = 96 / 25.4;
  document.documentElement.style.setProperty('--print-scale', millimetersPerPixel * pixelsPerMillimeter);
  document.documentElement.style.setProperty('--print-width', `${size.width * millimetersPerPixel}mm`);
  document.documentElement.style.setProperty('--print-height', `${size.height * millimetersPerPixel}mm`);
  document.getElementById('print-page-style').textContent = `@page { size: A4 ${landscape ? 'landscape' : 'portrait'}; margin: 10mm; }`;
}
