import { GRID_SIZE, MIN_ELEMENT_SIZE } from './config.js';
import { COMPONENT_TYPES } from './components.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const snap = value => Math.round(value / GRID_SIZE) * GRID_SIZE;

export function moveGeometry(element, x, y, bounds, snapToGrid = false) {
  return {
    x: clamp(Math.round(snapToGrid ? snap(x) : x), 0, bounds.width - element.width),
    y: clamp(Math.round(snapToGrid ? snap(y) : y), 0, bounds.height - element.height),
  };
}

export function resizeGeometry(start, direction, dx, dy, bounds, snapToGrid = false) {
  const defaults = COMPONENT_TYPES[start.type]?.defaults ?? start;
  const minWidth = Math.min(MIN_ELEMENT_SIZE, defaults.width);
  const minHeight = Math.min(MIN_ELEMENT_SIZE, defaults.height);
  const coordinate = value => Math.round(snapToGrid ? snap(value) : value);
  let left = start.x;
  let right = start.x + start.width;
  let top = start.y;
  let bottom = start.y + start.height;
  if (direction.includes('w')) left = clamp(coordinate(start.x + dx), 0, right - minWidth);
  if (direction.includes('e')) right = clamp(coordinate(right + dx), left + minWidth, bounds.width);
  if (direction.includes('n')) top = clamp(coordinate(start.y + dy), 0, bottom - minHeight);
  if (direction.includes('s')) bottom = clamp(coordinate(bottom + dy), top + minHeight, bounds.height);
  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function editGeometry(element, property, value, bounds) {
  if (!Number.isFinite(value)) return null;
  if (property === 'x' || property === 'y') {
    return moveGeometry(element, property === 'x' ? value : element.x, property === 'y' ? value : element.y, bounds);
  }
  const defaults = COMPONENT_TYPES[element.type].defaults;
  if (property === 'width' || property === 'height') {
    const origin = property === 'width' ? element.x : element.y;
    const minimum = Math.min(MIN_ELEMENT_SIZE, defaults[property]);
    return { [property]: clamp(Math.round(value), minimum, bounds[property] - origin) };
  }
  return null;
}
