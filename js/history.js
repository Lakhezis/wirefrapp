import { HISTORY_LIMIT } from './config.js';

const copyProject = project => structuredClone(project);
const projectsEqual = (first, second) => JSON.stringify(first) === JSON.stringify(second);

export function createHistory(state, limit = HISTORY_LIMIT) {
  let current = copyProject(state.project);
  const past = [];
  const future = [];

  function restore(project) {
    current = copyProject(project);
    state.project = copyProject(project);
    // La selección no se guarda: se conserva solo si el elemento todavía existe.
    if (!state.project.elements.some(element => element.id === state.selectedElementId)) state.selectedElementId = null;
  }

  function commit() {
    const next = copyProject(state.project);
    if (projectsEqual(current, next)) return false;
    past.push(current);
    if (past.length > limit) past.shift();
    current = next;
    future.length = 0;
    return true;
  }

  return {
    commit,
    canUndo: () => past.length > 0 || !projectsEqual(current, state.project),
    canRedo: () => future.length > 0 && projectsEqual(current, state.project),
    undo() {
      commit();
      if (!past.length) return false;
      future.push(current);
      restore(past.pop());
      return true;
    },
    redo() {
      if (!projectsEqual(current, state.project)) { commit(); return false; }
      if (!future.length) return false;
      past.push(current);
      restore(future.pop());
      return true;
    },
    reset() {
      current = copyProject(state.project);
      past.length = 0;
      future.length = 0;
    },
  };
}
