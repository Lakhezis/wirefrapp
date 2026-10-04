import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorage } from '../js/storage.js';
import { createEditorState, addComponent } from '../js/state.js';
import { STORAGE_KEY } from '../js/config.js';

function setup() {
  const data = new Map();
  const memory = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  return { data, memory, storage: createStorage(() => memory) };
}
function record(name = 'Mi proyecto') {
  const state = createEditorState(); state.project.name = name; addComponent(state, 'button');
  return { project: state.project, updatedAt: new Date().toISOString(), editor: { ...state.view, selectedElementId: state.selectedElementId, scrollLeft: 0, scrollTop: 0 } };
}

test('guarda y recupera datos, estilos, IDs y preferencias sin conservar referencias', () => {
  const { storage } = setup(); const saved = record(); storage.save(saved);
  assert.deepEqual(storage.recover(), saved);
  saved.project.elements[0].content = 'Sin guardar';
  assert.equal(storage.recover().project.elements[0].content, 'Botón');
  const recovered = storage.recover(); recovered.project.name = 'Cambio local';
  assert.equal(storage.recover().project.name, 'Mi proyecto');
});

test('mantiene varios proyectos y abrir solo actualiza el marcador del último abierto', () => {
  const { storage } = setup(); const first = record('Primero'); const second = record('Segundo');
  storage.save(first); storage.save(second);
  assert.equal(storage.list().length, 2);
  storage.open(first.project.id);
  assert.equal(storage.recover().project.name, 'Primero');
  assert.deepEqual(storage.list().find(item => item.project.id === second.project.id), second);
  storage.remove(first.project.id);
  assert.equal(storage.recover(), null);
  assert.equal(storage.list().length, 1);
});

test('datos dañados o incompatibles nunca se sobrescriben', () => {
  const { storage, data } = setup();
  for (const raw of ['{broken', JSON.stringify({ version: 999, projects: [], lastOpenedId: null })]) {
    data.set(STORAGE_KEY, raw);
    assert.throws(() => storage.recover()); assert.throws(() => storage.save(record()));
    assert.equal(data.get(STORAGE_KEY), raw);
  }
});

test('rechaza IDs repetidos, geometría fuera del lienzo y dispositivos inválidos', () => {
  const { storage } = setup(); const saved = record();
  saved.project.elements.push(structuredClone(saved.project.elements[0]));
  assert.throws(() => storage.save(saved)); saved.project.elements.pop();
  saved.project.elements[0].x = 5000; assert.throws(() => storage.save(saved));
  saved.project.elements[0].x = 24; saved.project.device = 'toString'; assert.throws(() => storage.save(saved));
});

test('un error de cuota conserva la copia anterior y los cambios en memoria', () => {
  const { storage, memory } = setup(); const saved = record(); storage.save(saved);
  saved.project.elements[0].content = 'Cambio pendiente';
  memory.setItem = () => { const error = new Error('Full'); error.name = 'QuotaExceededError'; throw error; };
  assert.throws(() => storage.save(saved), /espacio/);
  assert.equal(storage.recover().project.elements[0].content, 'Botón');
  assert.equal(saved.project.elements[0].content, 'Cambio pendiente');
});
