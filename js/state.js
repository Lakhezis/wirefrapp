import { moveGeometry } from './geometry.js';
import { DEVICE_SIZES, ZOOM, DUPLICATE_OFFSET } from './config.js';
import { COMPONENT_TYPES, createComponent } from './components.js';

export function createEditorState() {
  return {
    project: { name: 'Proyecto sin título', device: 'desktop', elements: [] },
    view: { zoom: ZOOM.initial, showGrid: false, snapToGrid: false },
    selectedElementId: null,
  };
}

function createElementId(elements) {
  let id;
  do {
    id = `element-${crypto.randomUUID()}`;
  } while (elements.some(element => element.id === id));
  return id;
}

function getInitialPosition(state, dimensions) {
  // Las posiciones iniciales caben en cualquiera de los tamaños disponibles.
  const sizes = Object.values(DEVICE_SIZES);
  const width = Math.min(...sizes.map(size => size.width));
  const height = Math.min(...sizes.map(size => size.height));
  const offset = (state.project.elements.length % 10) * 24;
  return {
    x: Math.max(0, Math.min(24 + offset, width - dimensions.width)),
    y: Math.max(0, Math.min(24 + offset, height - dimensions.height)),
  };
}

export function addComponent(state, type) {
  const definition = COMPONENT_TYPES[type];
  if (!definition?.defaults) return null;
  const element = createComponent(type, createElementId(state.project.elements), getInitialPosition(state, definition.defaults));
  state.project.elements.push(element);
  state.selectedElementId = element.id;
  return element;
}

export function selectElement(state, id) {
  state.selectedElementId = state.project.elements.some(element => element.id === id) ? id : null;
}

export function getSelectedElement(state) {
  return state.project.elements.find(element => element.id === state.selectedElementId) ?? null;
}

export function changeDevice(state, device) {
  if (!DEVICE_SIZES[device] || device === state.project.device) return false;
  state.project.device = device;
  state.project.elements = [];
  state.selectedElementId = null;
  return true;
}

export function duplicateSelectedElement(state) {
  const selected = getSelectedElement(state);
  if (!selected) return null;
  const duplicate = { ...selected, id: createElementId(state.project.elements), styles: { ...selected.styles } };
  Object.assign(duplicate, moveGeometry(duplicate, selected.x + DUPLICATE_OFFSET, selected.y + DUPLICATE_OFFSET, DEVICE_SIZES[state.project.device], state.view.snapToGrid));
  state.project.elements.push(duplicate);
  state.selectedElementId = duplicate.id;
  return duplicate;
}

export function deleteSelectedElement(state) {
  if (!getSelectedElement(state)) return false;
  state.project.elements = state.project.elements.filter(element => element.id !== state.selectedElementId);
  state.selectedElementId = null;
  return true;
}

export function updateSelectedGeometry(state, geometry) {
  const element = getSelectedElement(state);
  if (element) {
    Object.assign(element, geometry);
    element.styles.borderWidth = Math.min(element.styles.borderWidth, Math.floor(Math.min(element.width, element.height) / 2));
  }
}
