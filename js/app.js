import { GRID_SIZE } from './config.js';
import { createEditorState } from './state.js';
import { renderCatalog } from './components.js';
import { initializeControls } from './ui.js';

const printStyle = document.createElement('style');
printStyle.id = 'print-page-style';
document.head.append(printStyle);

const state = createEditorState();
renderCatalog(document.getElementById('component-catalog'));
document.getElementById('grid-size').textContent = `${GRID_SIZE} px`;
initializeControls(state);
