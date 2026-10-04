export const DEVICE_SIZES = Object.freeze({
  desktop: { label: 'Desktop', width: 1440, height: 900 },
  tablet: { label: 'Tablet', width: 768, height: 1024 },
  mobile: { label: 'Mobile', width: 390, height: 844 },
});

export const GRID_SIZE = 16;
export const ZOOM = Object.freeze({ min: 0.1, max: 2, step: 0.1, initial: 0.5 });

// Guardar se conectará en la etapa de persistencia.
export const PLANNED_SHORTCUTS = Object.freeze({
  undo: 'Ctrl+Z', redo: 'Ctrl+Shift+Z', duplicate: 'Ctrl+D',
  delete: 'Delete', move: 'Arrow', moveFast: 'Shift+Arrow', save: 'Ctrl+S',
});

export const MIN_ELEMENT_SIZE = 24;
export const DUPLICATE_OFFSET = 24;

export const STYLE_LIMITS = Object.freeze({
  fontSize: { min: 8, max: 96 },
  borderWidth: { min: 0, max: 20 },
  borderRadius: { min: 0, max: 200 },
});

export const HISTORY_LIMIT = 50;
