import { COMPONENT_TYPES } from './components.js';
import { getSelectedElement } from './state.js';

export function renderProperties(state) {
  const element = getSelectedElement(state);
  document.getElementById('selection-empty').hidden = Boolean(element);
  document.getElementById('selection-info').hidden = !element;
  document.getElementById('selected-type').textContent = element ? COMPONENT_TYPES[element.type].name : '';
  document.getElementById('selected-id').textContent = element?.id ?? '';
  for (const property of ['x', 'y', 'width', 'height']) {
    document.getElementById(`property-${property}`).value = element?.[property] ?? '';
  }
  const hasContent = element && COMPONENT_TYPES[element.type].editableProperties.includes('content');
  document.getElementById('content-properties').hidden = Boolean(element) && !hasContent;
  document.getElementById('property-content').value = hasContent ? element.content : '';
}
