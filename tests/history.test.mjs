import test from 'node:test';
import assert from 'node:assert/strict';
import { createHistory } from '../js/history.js';
import { createEditorState, addComponent, changeDevice } from '../js/state.js';

test('recupera copias independientes con los mismos IDs, contenido y estilos', () => {
  const state = createEditorState();
  const history = createHistory(state);
  const element = addComponent(state, 'button');
  history.commit();
  element.content = 'Continuar';
  element.styles.borderWidth = 3;
  history.commit();
  assert(history.undo());
  assert.equal(state.project.elements[0].id, element.id);
  assert.equal(state.project.elements[0].content, 'Botón');
  assert.equal(state.project.elements[0].styles.borderWidth, 1);
  assert(history.redo());
  assert.equal(state.project.elements[0].content, 'Continuar');
  assert.equal(state.project.elements[0].styles.borderWidth, 3);
  element.styles.borderWidth = 9;
  assert.equal(state.project.elements[0].styles.borderWidth, 3);
});

test('agrupa cambios pendientes y no registra selecciones, vista ni cambios idénticos', () => {
  const state = createEditorState();
  const history = createHistory(state);
  const element = addComponent(state, 'text');
  history.commit();
  for (let x = 25; x <= 100; x++) element.x = x;
  history.commit();
  assert(history.undo());
  assert.equal(state.project.elements[0].x, 24);
  state.view.zoom = 2;
  state.view.showGrid = true;
  state.selectedElementId = null;
  assert.equal(history.commit(), false);
  assert(history.undo());
  assert.equal(state.project.elements.length, 0);
  assert.equal(state.view.zoom, 2);
  assert.equal(state.view.showGrid, true);
  assert.equal(history.canUndo(), false);
});

test('una edición nueva elimina la rama de rehacer, incluso sin confirmar', () => {
  const state = createEditorState();
  const history = createHistory(state);
  addComponent(state, 'text'); history.commit();
  addComponent(state, 'button'); history.commit();
  history.undo();
  assert(history.canRedo());
  state.project.elements[0].content = 'Otra idea';
  assert.equal(history.canRedo(), false);
  assert.equal(history.redo(), false);
  assert(history.undo());
  assert.equal(state.project.elements[0].content, 'Escribí tu texto aquí');
});

test('respeta el límite y limpia el historial al cambiar de dispositivo', () => {
  const state = createEditorState();
  const history = createHistory(state, 2);
  for (let count = 0; count < 3; count++) { addComponent(state, 'text'); history.commit(); }
  assert(history.undo()); assert(history.undo());
  assert.equal(history.undo(), false);
  assert.equal(state.project.elements.length, 1);
  changeDevice(state, 'mobile'); history.reset();
  assert.equal(history.canUndo(), false);
  assert.equal(history.canRedo(), false);
  assert.equal(state.project.elements.length, 0);
});

test('un gesto restaurado antes de confirmar no agrega una acción', () => {
  const state = createEditorState();
  const history = createHistory(state);
  const element = addComponent(state, 'rectangle'); history.commit();
  const initialX = element.x;
  element.x = 100;
  element.x = initialX;
  assert.equal(history.commit(), false);
  history.undo();
  assert.equal(state.project.elements.length, 0);
});
