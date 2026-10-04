import { ZOOM } from './config.js';

export function createEditorState() {
  return {
    project: { name: 'Proyecto sin título', device: 'desktop', elements: [] },
    view: { zoom: ZOOM.initial, showGrid: false, snapToGrid: false },
    selectedElementId: null,
  };
}
