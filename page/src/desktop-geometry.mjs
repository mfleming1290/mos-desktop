export function recoverBounds(bounds, minimum, area) {
  const width = Math.max(minimum.width, bounds.width), height = Math.max(minimum.height, bounds.height);
  return {x: Math.min(Math.max(0, bounds.x), Math.max(0, area.width - Math.min(width, 120))),
    y: Math.min(Math.max(0, bounds.y), Math.max(0, area.height - 36)), width, height};
}
export function previewBounds(start, dx, dy, mode, minimum, area) {
  return recoverBounds(mode === 'move' ? {...start, x: start.x + dx, y: start.y + dy}
    : {...start, width: start.width + dx, height: start.height + dy}, minimum, area);
}
