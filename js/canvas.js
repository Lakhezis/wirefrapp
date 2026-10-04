import { DEVICE_SIZES, GRID_SIZE, ZOOM } from './config.js';
import { renderComponent } from './components.js';

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
  // Medio milímetro de holgura evita páginas extra por redondeos al imprimir.
  const pageWidth = landscape ? 276.5 : 189.5;
  const pageHeight = landscape ? 189.5 : 276.5;
  const millimetersPerPixel = Math.min(pageWidth / size.width, pageHeight / size.height);
  const pixelsPerMillimeter = 96 / 25.4;
  document.documentElement.style.setProperty('--print-scale', millimetersPerPixel * pixelsPerMillimeter);
  document.documentElement.style.setProperty('--print-width', `${size.width * millimetersPerPixel}mm`);
  document.documentElement.style.setProperty('--print-height', `${size.height * millimetersPerPixel}mm`);
  document.getElementById('print-page-style').textContent = `@media print { @page { size: A4 ${landscape ? 'landscape' : 'portrait'}; margin: 10mm; } }`;
}

export function renderCanvasElements(state, canvas) {
  const fragment = document.createDocumentFragment();
  for (const element of state.project.elements) {
    fragment.append(renderComponent(element));
  }
  canvas.replaceChildren(fragment);
  renderSelection(state, canvas);
}

export function renderSelection(state, canvas) {
  for (const node of canvas.querySelectorAll('[data-element-id]')) {
    const selected = node.dataset.elementId === state.selectedElementId;
    node.classList.toggle('is-selected', selected);
    node.setAttribute('aria-pressed', String(selected));
  }
}

export function initializeCanvasSelection(canvas, onSelect) {
  canvas.addEventListener('click', event => {
    const element = event.target.closest('[data-element-id]');
    onSelect(element?.dataset.elementId ?? null);
  });
  canvas.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const element = event.target.closest('[data-element-id]');
    if (!element) return;
    event.preventDefault();
    onSelect(element.dataset.elementId);
  });
}
