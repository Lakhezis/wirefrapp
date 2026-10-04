import { DEVICE_SIZES } from './config.js';
import { moveGeometry, resizeGeometry } from './geometry.js';
import { getSelectedElement, selectElement, updateSelectedGeometry } from './state.js';

export function initializePointerInteractions(state, canvas, onSelection, onGeometryChange, lifecycle = {}) {
  let gesture = null;
  let suppressClick = false;
  canvas.addEventListener('click', event => {
    if (!suppressClick) return;
    suppressClick = false;
    event.stopImmediatePropagation();
  }, true);
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !event.isPrimary || gesture) return;
    suppressClick = false;
    const node = event.target.closest('[data-element-id]');
    if (!node) return;
    const direction = event.target.closest('[data-resize-direction]')?.dataset.resizeDirection;
    // Confirma la edición del elemento anterior antes de cambiar la selección.
    if (document.activeElement?.matches('input, textarea, select')) document.activeElement.blur();
    selectElement(state, node.dataset.elementId);
    onSelection();
    const currentNode = canvas.querySelector(`[data-element-id="${node.dataset.elementId}"]`);
    currentNode.focus({ preventScroll: true });
    gesture = {
      pointerId: event.pointerId, direction,
      start: { ...getSelectedElement(state), styles: { ...getSelectedElement(state).styles } },
      clientX: event.clientX, clientY: event.clientY,
      scrollLeft: canvas.parentElement.parentElement.scrollLeft,
      scrollTop: canvas.parentElement.parentElement.scrollTop,
      zoom: state.view.zoom,
    };
    lifecycle.onBusyChange?.(true);
    canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  function updateGesture(event) {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const viewport = canvas.parentElement.parentElement;
    const dx = (event.clientX - gesture.clientX + viewport.scrollLeft - gesture.scrollLeft) / gesture.zoom;
    const dy = (event.clientY - gesture.clientY + viewport.scrollTop - gesture.scrollTop) / gesture.zoom;
    if (!gesture.hasMoved && dx === 0 && dy === 0) return;
    gesture.hasMoved = true;
    const bounds = DEVICE_SIZES[state.project.device];
    const geometry = gesture.direction
      ? resizeGeometry(gesture.start, gesture.direction, dx, dy, bounds, state.view.snapToGrid)
      : moveGeometry(gesture.start, gesture.start.x + dx, gesture.start.y + dy, bounds, state.view.snapToGrid);
    updateSelectedGeometry(state, geometry);
    onGeometryChange();
  }
  canvas.addEventListener('pointermove', updateGesture);
  canvas.addEventListener('pointerup', event => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    updateGesture(event);
    gesture = null;
    suppressClick = true;
    canvas.releasePointerCapture(event.pointerId);
    lifecycle.onBusyChange?.(false);
    lifecycle.onCommit?.();
  });
  canvas.addEventListener('pointercancel', event => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    const { x, y, width, height } = gesture.start;
    updateSelectedGeometry(state, { x, y, width, height });
    getSelectedElement(state).styles.borderWidth = gesture.start.styles.borderWidth;
    gesture = null;
    lifecycle.onBusyChange?.(false);
    onGeometryChange();
  });
  canvas.addEventListener('lostpointercapture', () => {
    if (!gesture) return;
    gesture = null;
    lifecycle.onBusyChange?.(false);
    lifecycle.onCommit?.();
  });
}

export function initializeShortcuts(state, actions) {
  document.addEventListener('keydown', event => {
    if (document.querySelector('dialog[open]')) return;
    const modifier = event.ctrlKey || event.metaKey;
    if (modifier && !event.altKey && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      if (actions.isBusy()) return;
      if (event.shiftKey) actions.redo(); else actions.undo();
      return;
    }
    if (actions.isBusy() || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (!getSelectedElement(state)) return;
    if (modifier && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'd') {
      event.preventDefault(); actions.duplicate(); return;
    }
    if (event.key === 'Delete' && !modifier && !event.altKey) {
      event.preventDefault(); actions.delete(); return;
    }
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (!directions[event.key] || modifier || event.altKey) return;
    event.preventDefault();
    const element = getSelectedElement(state);
    const step = event.shiftKey ? 10 : 1;
    const [dx, dy] = directions[event.key];
    // El teclado conserva movimientos exactos de 1/10 px, incluso con ajuste a cuadrícula.
    updateSelectedGeometry(state, moveGeometry(element, element.x + dx * step, element.y + dy * step, DEVICE_SIZES[state.project.device]));
    actions.geometryChange();
    actions.commit();
  });
}
