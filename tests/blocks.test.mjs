import test from 'node:test';
import assert from 'node:assert/strict';
import { createEditorState, addComponent, duplicateSelectedElement } from '../js/state.js';
import { applyProperty } from '../js/properties.js';
import { createHistory } from '../js/history.js';
import { createStorage } from '../js/storage.js';
import { resizeGeometry } from '../js/geometry.js';

for (const type of ['card', 'navbar']) {
  test(`${type}: contenido independiente, historial, mínimos y recuperación`, () => {
    const state = createEditorState(); const history = createHistory(state);
    const first = addComponent(state, type); history.commit();
    const second = addComponent(state, type);
    assert.notEqual(first.content, second.content);
    history.commit();
    const key = type === 'card' ? 'title' : 'brand';
    const original = second.content[key];
    assert(applyProperty(state, 'content', { ...second.content, [key]: 'Mi bloque' })); history.commit();
    assert.equal(first.content[key], original);
    assert(history.undo()); assert.equal(state.project.elements[1].content[key], original);
    assert(history.redo()); assert.equal(state.project.elements[1].content[key], 'Mi bloque');
    const duplicate = duplicateSelectedElement(state);
    duplicate.content[key] = 'Copia';
    assert.equal(state.project.elements[1].content[key], 'Mi bloque');
    assert(!applyProperty(state, 'content', 'Contenido inválido'));
    const resized = resizeGeometry(duplicate, 'se', -5000, -5000, { width: 1440, height: 900 });
    assert.equal(resized.width, type === 'card' ? 140 : 180);
    assert.equal(resized.height, type === 'card' ? 120 : 48);
    let raw = null;
    const storage = createStorage(() => ({ getItem: () => raw, setItem: (_, value) => { raw = value; } }));
    storage.save({ project: state.project, updatedAt: new Date().toISOString(), editor: { ...state.view, selectedElementId: state.selectedElementId, scrollLeft: 0, scrollTop: 0 } });
    assert.deepEqual(storage.recover().project.elements, state.project.elements);
  });
}

test('los proyectos anteriores con contenido de texto siguen siendo válidos', () => {
  const state = createEditorState(); addComponent(state, 'text');
  let raw = null;
  const storage = createStorage(() => ({ getItem: () => raw, setItem: (_, value) => { raw = value; } }));
  storage.save({ project: state.project, updatedAt: new Date().toISOString(), editor: { ...state.view, selectedElementId: state.selectedElementId, scrollLeft: 0, scrollTop: 0 } });
  assert.equal(typeof storage.recover().project.elements[0].content, 'string');
});
