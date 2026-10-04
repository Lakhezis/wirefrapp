export function getAlignmentChanges(elements, direction, bounds) {
  return elements.map(element => {
    const geometry = {};
    if (direction === 'left') geometry.x = 0;
    if (direction === 'center-x') geometry.x = Math.round((bounds.width - element.width) / 2);
    if (direction === 'right') geometry.x = bounds.width - element.width;
    if (direction === 'top') geometry.y = 0;
    if (direction === 'center-y') geometry.y = Math.round((bounds.height - element.height) / 2);
    if (direction === 'bottom') geometry.y = bounds.height - element.height;
    return { id: element.id, geometry };
  });
}
