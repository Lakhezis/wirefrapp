export const DEVICE_SIZES = Object.freeze({
  desktop: { label: 'Desktop', width: 1440, height: 900 },
  tablet: { label: 'Tablet', width: 768, height: 1024 },
  mobile: { label: 'Mobile', width: 390, height: 844 },
});

export const GRID_SIZE = 16;
export const ZOOM = Object.freeze({ min: 0.1, max: 2, step: 0.1, initial: 0.5 });

// Las acciones se conectarán cuando estén implementadas; no bloqueamos atajos nativos todavía.
export const PLANNED_SHORTCUTS = Object.freeze({
  undo: 'Ctrl+Z', redo: 'Ctrl+Shift+Z', duplicate: 'Ctrl+D',
  delete: 'Delete', move: 'Arrow', moveFast: 'Shift+Arrow', save: 'Ctrl+S',
});
