import { getMinimumSize } from './geometry.js';
import { COMPONENT_TYPES, isValidContent } from './components.js';
import { DEVICE_SIZES, PROJECT_VERSION, STORAGE_KEY, PROJECT_NAME_LIMIT, ZOOM, STYLE_LIMITS } from './config.js';

const validId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const validDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
const validColor = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
const inRange = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;

export function validateProject(project) {
  if (!project || !validId(project.id) || project.version !== PROJECT_VERSION ||
      typeof project.name !== 'string' || !project.name.trim() || project.name.length > PROJECT_NAME_LIMIT ||
      !validDate(project.createdAt) || !Object.hasOwn(DEVICE_SIZES, project.device) || !Array.isArray(project.elements)) {
    throw new Error('El proyecto tiene un formato inválido o una versión incompatible.');
  }
  const ids = new Set();
  const bounds = DEVICE_SIZES[project.device];
  for (const element of project.elements) {
    const defaults = COMPONENT_TYPES[element?.type]?.defaults;
    const styles = element?.styles;
    if (!defaults || !validId(element.id) || ids.has(element.id) || !isValidContent(element.type, element.content) ||
        ![element.x, element.y, element.width, element.height].every(Number.isInteger) ||
        !inRange(element.width, getMinimumSize(element).width, bounds.width) ||
        !inRange(element.height, getMinimumSize(element).height, bounds.height) ||
        !inRange(element.x, 0, bounds.width - element.width) || !inRange(element.y, 0, bounds.height - element.height) ||
        !styles || !inRange(styles.fontSize, STYLE_LIMITS.fontSize.min, STYLE_LIMITS.fontSize.max) ||
        !inRange(styles.borderWidth, 0, Math.min(STYLE_LIMITS.borderWidth.max, element.width / 2, element.height / 2)) ||
        !inRange(styles.borderRadius, 0, STYLE_LIMITS.borderRadius.max) ||
        !['left', 'center', 'right'].includes(styles.textAlign) || !validColor(styles.color) ||
        !validColor(styles.borderColor) || !(validColor(styles.backgroundColor) || styles.backgroundColor === 'transparent')) {
      throw new Error('El proyecto contiene un componente inválido.');
    }
    ids.add(element.id);
  }
}

function validateRecord(record) {
  validateProject(record?.project);
  const editor = record.editor;
  if (!validDate(record.updatedAt) || !editor || !inRange(editor.zoom, ZOOM.min, ZOOM.max) ||
      typeof editor.showGrid !== 'boolean' || typeof editor.snapToGrid !== 'boolean' ||
      !inRange(editor.scrollLeft, 0, Number.MAX_SAFE_INTEGER) || !inRange(editor.scrollTop, 0, Number.MAX_SAFE_INTEGER) ||
      !(editor.selectedElementId === null || record.project.elements.some(element => element.id === editor.selectedElementId))) {
    throw new Error('El proyecto guardado contiene preferencias inválidas.');
  }
}

export function createStorage(getStorage = () => window.localStorage) {
  function read() {
    let raw;
    try { raw = getStorage().getItem(STORAGE_KEY); }
    catch { throw new Error('El navegador no permite acceder al almacenamiento local.'); }
    if (raw === null) return { version: PROJECT_VERSION, projects: [], lastOpenedId: null };
    let data;
    try { data = JSON.parse(raw); }
    catch { throw new Error('Los datos guardados están dañados. No se sobrescribieron.'); }
    if (!data || data.version !== PROJECT_VERSION || !Array.isArray(data.projects)) {
      throw new Error('El almacenamiento tiene un formato o versión incompatible. No se sobrescribió.');
    }
    const ids = new Set();
    for (const record of data.projects) {
      validateRecord(record);
      if (ids.has(record.project.id)) throw new Error('El almacenamiento contiene proyectos duplicados.');
      ids.add(record.project.id);
    }
    if (data.lastOpenedId !== null && !ids.has(data.lastOpenedId)) throw new Error('No se pudo identificar el último proyecto abierto.');
    return data;
  }

  function write(data) {
    try { getStorage().setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch (error) {
      throw new Error(error.name === 'QuotaExceededError'
        ? 'No hay espacio disponible. El proyecto no se guardó; tus cambios siguen en el editor.'
        : 'No se pudo escribir en el almacenamiento local. Tus cambios siguen en el editor.');
    }
  }

  return {
    list() { return read().projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); },
    recover() {
      const data = read();
      return data.projects.find(record => record.project.id === data.lastOpenedId) ?? null;
    },
    save(record) {
      validateRecord(record);
      const data = read();
      const index = data.projects.findIndex(item => item.project.id === record.project.id);
      if (index < 0) data.projects.push(structuredClone(record));
      else data.projects[index] = structuredClone(record);
      data.lastOpenedId = record.project.id;
      write(data);
    },
    open(id) {
      const data = read();
      const record = data.projects.find(item => item.project.id === id);
      if (!record) throw new Error('Ese proyecto ya no está disponible.');
      data.lastOpenedId = id;
      write(data); // Solo recuerda cuál abrir al iniciar; no guarda modificaciones del lienzo.
      return record;
    },
    remove(id) {
      const data = read();
      data.projects = data.projects.filter(record => record.project.id !== id);
      if (data.lastOpenedId === id) data.lastOpenedId = null;
      write(data);
    },
  };
}
