import { COMPONENT_TYPES, isValidContent } from './components.js';
import { DEVICE_SIZES, STYLE_LIMITS } from './config.js';
import { editGeometry } from './geometry.js';
import { getSelectedElement, updateSelectedGeometry } from './state.js';

const STYLE_FIELDS = {
  fontSize: { label: 'Texto (px)', type: 'number' },
  textAlign: { label: 'Alineación del texto', type: 'select' },
  backgroundColor: { label: 'Fondo', type: 'color' },
  borderColor: { label: 'Color del borde', type: 'color' },
  borderWidth: { label: 'Borde (px)', type: 'number' },
  borderRadius: { label: 'Radio (px)', type: 'number' },
};

export function applyProperty(state, property, value) {
  const element = getSelectedElement(state);
  if (!element || !COMPONENT_TYPES[element.type].editableProperties.includes(property)) return false;
  if (['x', 'y', 'width', 'height'].includes(property)) {
    if (String(value).trim() === '') return false;
    const geometry = editGeometry(element, property, Number(value), DEVICE_SIZES[state.project.device]);
    if (!geometry) return false;
    updateSelectedGeometry(state, geometry);
  } else if (property === 'content') {
    if (!isValidContent(element.type, value)) return false;
    element.content = structuredClone(value);
  } else if (STYLE_LIMITS[property]) {
    if (String(value).trim() === '' || !Number.isFinite(Number(value))) return false;
    const { min, max } = STYLE_LIMITS[property];
    element.styles[property] = Math.max(min, Math.min(max, Math.round(Number(value))));
    if (property === 'borderWidth') updateSelectedGeometry(state, {});
  } else if (property === 'textAlign') {
    if (!['left', 'center', 'right'].includes(value)) return false;
    element.styles.textAlign = value;
  } else {
    if (!/^#[0-9a-f]{6}$/i.test(value) && !(property === 'backgroundColor' && value === 'transparent')) return false;
    element.styles[property] = value;
  }
  return true;
}

function setFieldValue(id, value) {
  const field = document.getElementById(id);
  // No reemplazamos el valor mientras se escribe: permite vaciar y completar un número.
  if (document.activeElement !== field) field.value = value;
}

export function renderProperties(state) {
  const element = getSelectedElement(state);
  const properties = element ? COMPONENT_TYPES[element.type].editableProperties : [];
  document.getElementById('selection-empty').hidden = Boolean(element);
  document.getElementById('selection-info').hidden = !element;
  document.getElementById('selected-type').textContent = element ? COMPONENT_TYPES[element.type].name : '';
  document.getElementById('selected-id').textContent = element?.id ?? '';
  for (const id of ['geometry-properties', 'content-properties', 'style-properties', 'alignment-properties']) {
    document.getElementById(id).disabled = !element;
  }
  for (const property of ['x', 'y', 'width', 'height']) setFieldValue(`property-${property}`, element?.[property] ?? '');
  document.getElementById('content-properties').hidden = Boolean(element) && !properties.includes('content');
  const fields = element ? COMPONENT_TYPES[element.type].contentFields : null;
  document.getElementById('basic-content-fields').hidden = Boolean(fields);
  document.getElementById('block-content-fields').hidden = !fields;
  document.getElementById('block-content-note').hidden = !fields;
  setFieldValue('property-content', typeof element?.content === 'string' ? element.content : '');
  for (const field of document.querySelectorAll('[data-content-key]')) {
    const relevant = Boolean(element?.type === field.dataset.contentType && fields?.some(definition => definition.key === field.dataset.contentKey));
    field.parentElement.hidden = !relevant;
    field.disabled = !relevant;
    setFieldValue(field.id, relevant ? element.content[field.dataset.contentKey] : '');
  }
  for (const [property, definition] of Object.entries(STYLE_FIELDS)) {
    document.getElementById(`field-${property}`).hidden = !properties.includes(property);
    const value = element?.styles[property];
    setFieldValue(`property-${property}`, definition.type === 'color' ? (value === 'transparent' || !value ? '#ffffff' : value) : value ?? '');
  }
  const transparent = document.getElementById('transparent-background');
  transparent.parentElement.hidden = !properties.includes('backgroundColor');
  transparent.checked = element?.styles.backgroundColor === 'transparent';
  document.getElementById('property-backgroundColor').disabled = transparent.checked;
  document.getElementById('style-properties').hidden = !element || !Object.keys(STYLE_FIELDS).some(property => properties.includes(property));
}

export function initializeProperties(state, onChange, onCommit = () => {}) {
  const container = document.getElementById('style-fields');
  for (const [property, definition] of Object.entries(STYLE_FIELDS)) {
    const label = document.createElement('label');
    label.id = `field-${property}`;
    label.textContent = definition.label;
    const field = document.createElement(definition.type === 'select' ? 'select' : 'input');
    field.id = `property-${property}`;
    field.dataset.property = property;
    if (definition.type === 'select') {
      for (const [value, text] of [['left', 'Izquierda'], ['center', 'Centro'], ['right', 'Derecha']]) {
        const option = document.createElement('option'); option.value = value; option.textContent = text; field.append(option);
      }
    } else {
      field.type = definition.type;
      if (STYLE_LIMITS[property]) Object.assign(field, STYLE_LIMITS[property], { step: 1 });
    }
    label.append(field); container.append(label);
  }
  const blockContainer = document.getElementById('block-content-fields');
  for (const [type, definition] of Object.entries(COMPONENT_TYPES)) {
    for (const contentField of definition.contentFields ?? []) {
      const label = document.createElement('label');
      label.textContent = contentField.label;
      const field = document.createElement(contentField.type === 'textarea' ? 'textarea' : 'input');
      if (contentField.type === 'textarea') field.rows = 3;
      else field.type = 'text';
      field.id = `content-${type}-${contentField.key}`;
      field.dataset.contentKey = contentField.key;
      field.dataset.contentType = type;
      label.append(field); blockContainer.append(label);
      const apply = () => {
        const element = getSelectedElement(state);
        if (!element || element.type !== type) return;
        if (applyProperty(state, 'content', { ...element.content, [contentField.key]: field.value })) {
          onChange(); renderProperties(state);
        }
      };
      field.addEventListener('input', apply);
      field.addEventListener('change', () => { apply(); onCommit(); });
      field.addEventListener('blur', onCommit);
    }
  }
  const transparentLabel = document.createElement('label');
  transparentLabel.className = 'transparent-option';
  const transparent = document.createElement('input');
  transparent.type = 'checkbox'; transparent.id = 'transparent-background';
  transparentLabel.append(transparent, document.createTextNode('Sin fondo'));
  container.append(transparentLabel);
  transparent.addEventListener('change', () => {
    applyProperty(state, 'backgroundColor', transparent.checked ? 'transparent' : document.getElementById('property-backgroundColor').value);
    onChange(); renderProperties(state); onCommit();
  });
  for (const property of ['x', 'y', 'width', 'height', 'content', ...Object.keys(STYLE_FIELDS)]) {
    const field = document.getElementById(`property-${property}`);
    field.addEventListener('input', () => {
      if (applyProperty(state, property, field.value)) { onChange(); renderProperties(state); }
    });
    field.addEventListener('change', () => {
      applyProperty(state, property, field.value);
      onChange();
      const element = getSelectedElement(state);
      if (element) field.value = property in element ? element[property] : element.styles[property];
      renderProperties(state);
      onCommit();
    });
    field.addEventListener('blur', onCommit);
  }
}
