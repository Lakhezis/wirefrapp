import { initializePointerInteractions, initializeShortcuts } from './interactions.js';
import { ZOOM } from './config.js';
import { clampZoom, fitZoom, renderCanvas, renderCanvasElements, renderSelection, initializeCanvasSelection, updateElementGeometry } from './canvas.js';
import { addComponent, selectElement, changeDevice, getSelectedElement, duplicateSelectedElement, deleteSelectedElement } from './state.js';
import { renderProperties } from './properties.js';

export function initializeControls(state) {
  const elements = {
    canvas: document.getElementById('canvas'), frame: document.getElementById('canvas-frame'),
    viewport: document.getElementById('canvas-viewport'), size: document.getElementById('canvas-size'),
    zoomValue: document.getElementById('zoom-value'), zoomOut: document.getElementById('zoom-out'),
    zoomIn: document.getElementById('zoom-in'), snapStatus: document.getElementById('snap-status'),
  };
  const render = () => renderCanvas(state, elements);
  const updateSelection = () => {
    renderSelection(state, elements.canvas);
    renderProperties(state);
    const hasSelection = Boolean(getSelectedElement(state));
    document.getElementById('duplicate-element').disabled = !hasSelection;
    document.getElementById('delete-element').disabled = !hasSelection;
  };
  const geometryChange = () => {
    const selected = getSelectedElement(state);
    if (selected) updateElementGeometry(elements.canvas, selected);
    renderProperties(state);
  };
  const refreshElements = () => {
    renderCanvasElements(state, elements.canvas);
    updateSelection();
  };
  const actions = {
    duplicate: () => { duplicateSelectedElement(state); refreshElements(); },
    delete: () => { deleteSelectedElement(state); refreshElements(); },
    geometryChange,
  };
  document.getElementById('duplicate-element').addEventListener('click', actions.duplicate);
  document.getElementById('delete-element').addEventListener('click', actions.delete);
  initializePointerInteractions(state, elements.canvas, updateSelection, geometryChange);
  initializeShortcuts(state, actions);
  initializeCanvasSelection(elements.canvas, id => {
    selectElement(state, id);
    updateSelection();
  });
  document.getElementById('component-catalog').addEventListener('click', event => {
    const button = event.target.closest('[data-component-type]');
    if (!button || button.disabled) return;
    addComponent(state, button.dataset.componentType);
    refreshElements();
  });
  refreshElements();
  const fit = () => { state.view.zoom = fitZoom(state, elements.viewport); render(); };
  const deviceSelector = document.getElementById('device');
  const deviceDialog = document.getElementById('device-change-dialog');
  let pendingDevice = null;
  deviceSelector.addEventListener('change', () => {
    const requestedDevice = deviceSelector.value;
    deviceSelector.value = state.project.device;
    if (requestedDevice === state.project.device) return;
    pendingDevice = requestedDevice;
    deviceDialog.returnValue = 'no';
    deviceDialog.showModal();
  });
  deviceDialog.addEventListener('close', () => {
    if (deviceDialog.returnValue === 'yes' && changeDevice(state, pendingDevice)) {
      deviceSelector.value = state.project.device;
      refreshElements();
      fit();
    }
    pendingDevice = null;
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
  fit();
}
