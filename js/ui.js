import { ZOOM } from './config.js';
import { clampZoom, fitZoom, renderCanvas } from './canvas.js';

export function initializeControls(state) {
  const elements = {
    canvas: document.getElementById('canvas'), frame: document.getElementById('canvas-frame'),
    viewport: document.getElementById('canvas-viewport'), size: document.getElementById('canvas-size'),
    zoomValue: document.getElementById('zoom-value'), zoomOut: document.getElementById('zoom-out'),
    zoomIn: document.getElementById('zoom-in'), snapStatus: document.getElementById('snap-status'),
  };
  const render = () => renderCanvas(state, elements);
  const fit = () => { state.view.zoom = fitZoom(state, elements.viewport); render(); };
  document.getElementById('device').addEventListener('change', event => {
    state.project.device = event.target.value;
    fit();
  });
  elements.zoomOut.addEventListener('click', () => {
    state.view.zoom = clampZoom(Number((state.view.zoom - ZOOM.step).toFixed(3))); render();
  });
  elements.zoomIn.addEventListener('click', () => {
    state.view.zoom = clampZoom(Number((state.view.zoom + ZOOM.step).toFixed(3))); render();
  });
  document.getElementById('zoom-fit').addEventListener('click', fit);
  document.getElementById('show-grid').addEventListener('change', event => {
    state.view.showGrid = event.target.checked; render();
  });
  document.getElementById('snap-grid').addEventListener('change', event => {
    state.view.snapToGrid = event.target.checked; render();
  });
  window.addEventListener('beforeprint', render);
  fit();
}
