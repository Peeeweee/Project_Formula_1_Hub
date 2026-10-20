// Render columns run clockwise from the helmet front (+Z in Three.js).
export function helmetViewIndex(x, y, z) {
  const yaw = Math.atan2(x, z);
  const column = ((Math.round(yaw / (Math.PI / 4)) % 8) + 8) % 8;
  const elevation = Math.atan2(y, Math.hypot(x, z));
  return column + (elevation > 25 * Math.PI / 180 ? 8 : 0);
}
