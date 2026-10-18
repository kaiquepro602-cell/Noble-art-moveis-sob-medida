// Shared camera math keeps the canvas and accessible detail buttons aligned.
export const radians = Math.PI / 180;
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const normalizeYaw = value => ((value + 180) % 360 + 360) % 360 - 180;

export function cameraView({ width, height, yaw = 0, pitch = 0, zoom = 1 }) {
  width = Math.max(1, width);
  height = Math.max(1, height);
  const aspect = width / height;
  zoom = clamp(zoom, 1, 2);
  // Preserve a comfortable vertical view on portrait phones and wide desktops.
  const vfov = Math.min(82 / zoom * radians,
    2 * Math.atan(Math.tan(95 / zoom * radians / 2) / aspect));
  const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
  return { width, height, aspect, vfov, hfov, yaw: normalizeYaw(yaw), pitch: clamp(pitch, -80, 80), zoom };
}

export function projectHotspot(spot, view) {
  const lon = spot.yaw * radians, lat = spot.pitch * radians;
  const cy = Math.cos(view.yaw * radians), sy = Math.sin(view.yaw * radians);
  const cp = Math.cos(view.pitch * radians), sp = Math.sin(view.pitch * radians);
  const dx = Math.sin(lon) * Math.cos(lat), dy = Math.sin(lat), dz = -Math.cos(lon) * Math.cos(lat);
  const x = dx * cy + dz * sy;
  const z = -dx * sy + dz * cy;
  const y = dy * cp + z * sp;
  const cameraZ = -dy * sp + z * cp;
  if (cameraZ >= -0.001) return { visible: false, x: 0, y: 0 };
  const scale = -cameraZ * Math.tan(view.vfov / 2);
  const sx = x / (scale * view.aspect), syScreen = y / scale;
  return { visible: Math.abs(sx) < 0.94 && Math.abs(syScreen) < 0.94,
    x: (sx + 1) * view.width / 2, y: (1 - syScreen) * view.height / 2 };
}
