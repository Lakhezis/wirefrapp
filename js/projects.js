import { createStorage } from './storage.js';
import { createProject, createEditorState } from './state.js';
import { DEFAULT_PROJECT_NAME, DEVICE_SIZES, PROJECT_NAME_LIMIT } from './config.js';

function showDialog(title, message, content, choices) {
  const dialog = document.getElementById('project-dialog');
  document.getElementById('project-dialog-title').textContent = title;
  document.getElementById('project-dialog-message').textContent = message;
  const body = document.getElementById('project-dialog-content');
  body.replaceChildren();
  if (content) body.append(content);
  const actions = document.getElementById('project-dialog-actions');
  actions.replaceChildren();
  for (const [value, text] of choices) {
    const button = document.createElement('button');
    button.value = value; button.textContent = text;
    button.type = value === 'cancel' ? 'button' : 'submit';
    if (value === 'cancel') button.addEventListener('click', () => dialog.close('cancel'));
    if (value !== 'cancel') button.className = 'confirm-device-change';
    actions.append(button);
  }
  dialog.returnValue = 'cancel';
  return new Promise(resolve => {
    dialog.addEventListener('close', () => resolve(dialog.returnValue), { once: true });
    dialog.showModal();
    (body.querySelector('input, select') ?? actions.querySelector('button')).focus();
  });
}

function nameField(value) {
  const label = document.createElement('label');
  label.textContent = 'Nombre del proyecto';
  const input = document.createElement('input');
  input.id = 'project-name-input'; input.value = value;
  input.required = true; input.maxLength = PROJECT_NAME_LIMIT;
  const validate = () => input.setCustomValidity(input.value.trim() ? '' : 'Ingresá un nombre para el proyecto.');
  input.addEventListener('input', validate); validate();
  label.append(input);
  return { label, input };
}

export function initializeProjects(state, hooks) {
  const storage = createStorage();
  let savedProject = null;
  let lastError = '';
  const status = document.getElementById('project-status');

  function isDirty() {
    if (savedProject) return JSON.stringify(state.project) !== JSON.stringify(savedProject);
    return state.project.elements.length > 0 || state.project.name !== DEFAULT_PROJECT_NAME || state.project.device !== 'desktop';
  }

  function updateStatus() {
    document.getElementById('project-name').textContent = state.project.name;
    const dirty = isDirty();
    status.textContent = lastError || (savedProject ? dirty ? 'Cambios sin guardar' : 'Guardado localmente' : 'Proyecto nuevo · sin guardar');
    status.classList.toggle('has-error', Boolean(lastError));
    status.classList.toggle('has-changes', dirty);
    for (const id of ['new-project', 'open-project', 'rename-project', 'delete-project', 'save-project']) {
      document.getElementById(id).disabled = hooks.isBusy();
    }
  }

  function reportError(error) { lastError = error.message; updateStatus(); }

  function activate(project, record = null) {
    state.project = structuredClone(project);
    state.view = record ? {
      zoom: record.editor.zoom, showGrid: record.editor.showGrid, snapToGrid: record.editor.snapToGrid,
    } : createEditorState().view;
    state.selectedElementId = record?.editor.selectedElementId ?? null;
    savedProject = record ? structuredClone(record.project) : null;
    lastError = '';
    hooks.onLoad(record);
    updateStatus();
  }

  async function askName(title, value) {
    const { label, input } = nameField(value);
    const answer = await showDialog(title, '', label, [['cancel', 'Cancelar'], ['accept', 'Aceptar']]);
    return answer === 'accept' ? input.value.trim() : null;
  }

  async function save() {
    if (hooks.isBusy()) return false;
    hooks.beforeAction();
    if (!savedProject && state.project.name === DEFAULT_PROJECT_NAME) {
      const name = await askName('Guardar proyecto', state.project.name);
      if (name === null) return false;
      state.project.name = name;
      hooks.onRename();
    }
    try {
      storage.save({
        project: structuredClone(state.project), updatedAt: new Date().toISOString(),
        editor: { ...state.view, selectedElementId: state.selectedElementId, ...hooks.getViewport() },
      });
      savedProject = structuredClone(state.project);
      lastError = '';
      updateStatus();
      return true;
    } catch (error) { reportError(error); return false; }
  }

  async function canLeave() {
    if (!isDirty()) return true;
    const answer = await showDialog('Cambios sin guardar',
      `“${state.project.name}” tiene cambios sin guardar. ¿Cómo querés continuar?`, null,
      [['cancel', 'Cancelar'], ['discard', 'Descartar cambios'], ['save', 'Guardar y continuar']]);
    if (answer === 'save') return save();
    return answer === 'discard';
  }

  async function newProject() {
    hooks.beforeAction();
    const fields = document.createElement('div');
    const { label, input } = nameField('');
    const deviceLabel = document.createElement('label'); deviceLabel.textContent = 'Pantalla';
    const device = document.createElement('select'); device.id = 'project-device-input';
    for (const [value, size] of Object.entries(DEVICE_SIZES)) {
      const option = document.createElement('option'); option.value = value;
      option.textContent = `${size.label} · ${size.width} × ${size.height}`; device.append(option);
    }
    deviceLabel.append(device); fields.append(label, deviceLabel);
    const answer = await showDialog('Nuevo proyecto', 'Elegí un nombre y el tamaño inicial del lienzo.', fields,
      [['cancel', 'Cancelar'], ['create', 'Crear proyecto']]);
    if (answer !== 'create' || !(await canLeave())) return;
    activate(createProject(input.value.trim(), device.value));
  }

  async function openProject() {
    hooks.beforeAction();
    try {
      const records = storage.list();
      if (!records.length) {
        await showDialog('Abrir proyecto', 'Todavía no hay proyectos guardados.', null, [['cancel', 'Cerrar']]);
        return;
      }
      const label = document.createElement('label'); label.textContent = 'Proyectos guardados';
      const select = document.createElement('select'); select.id = 'project-open-select';
      for (const record of records) {
        const option = document.createElement('option'); option.value = record.project.id;
        option.textContent = `${record.project.name} · ${DEVICE_SIZES[record.project.device].label} · ${new Date(record.updatedAt).toLocaleString('es-AR')}`;
        select.append(option);
      }
      label.append(select);
      const answer = await showDialog('Abrir proyecto', 'Se abrirá la última copia guardada del proyecto.', label,
        [['cancel', 'Cancelar'], ['open', 'Abrir']]);
      if (answer !== 'open' || !(await canLeave())) return;
      const record = storage.open(select.value);
      activate(record.project, record);
    } catch (error) { reportError(error); }
  }

  async function renameProject() {
    hooks.beforeAction();
    const name = await askName('Renombrar proyecto', state.project.name);
    if (name === null || name === state.project.name) return;
    state.project.name = name;
    lastError = '';
    hooks.onRename();
    updateStatus();
  }

  async function deleteProject() {
    hooks.beforeAction();
    const answer = await showDialog('Eliminar proyecto',
      `¿Querés eliminar “${state.project.name}”? Se eliminará su copia guardada, si existe, y se descartarán los cambios actuales. Esta acción no se puede deshacer.`,
      null, [['cancel', 'Cancelar'], ['delete', 'Eliminar proyecto']]);
    if (answer !== 'delete') return;
    try { if (savedProject) storage.remove(state.project.id); activate(createProject()); }
    catch (error) { reportError(error); }
  }

  for (const [id, action] of [['new-project', newProject], ['open-project', openProject], ['rename-project', renameProject], ['delete-project', deleteProject], ['save-project', save]]) {
    document.getElementById(id).addEventListener('click', action);
  }
  document.addEventListener('keydown', event => {
    if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey || event.key.toLowerCase() !== 's') return;
    event.preventDefault();
    if (!document.querySelector('dialog[open]') && !hooks.isBusy()) save();
  });
  window.addEventListener('beforeunload', event => {
    if (!isDirty()) return;
    event.preventDefault(); event.returnValue = '';
  });
  try {
    const record = storage.recover();
    if (record) activate(record.project, record);
  } catch (error) { reportError(error); }
  updateStatus();
  return { updateStatus, isDirty, save };
}
