// All 3D motion and console states follow this single illustrative pit-stop clock.
export const PIT_STOP_DURATION_MS = 10000;
export const INTRO_LOGO_MS = PIT_STOP_DURATION_MS;
export const INTRO_DURATION_MS = 15000;
export const INTRO_FADE_MS = 800;
const sequenceTime = elapsed => Math.max(0, elapsed) * 8800 / PIT_STOP_DURATION_MS;
export const INTRO_LAUNCH_MS = 7000 * PIT_STOP_DURATION_MS / 8800;
export const PIT_STAGES = ['arrival', 'jack', 'tires', 'secure', 'clear', 'release'];
const clamp = value => Math.min(1, Math.max(0, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
export function introFrame(elapsed, reducedMotion = false) {
  const time = sequenceTime(elapsed);
  if (reducedMotion) return { lights: 0, phase: elapsed >= 700 ? 'done' : 'arrival' };
  return { lights: time >= 7000 ? 1 : 0, phase: elapsed >= INTRO_DURATION_MS ? 'done' : elapsed >= INTRO_LOGO_MS ? 'logo' : time >= 7000 ? 'release' : time >= 6000 ? 'clear' : time >= 5000 ? 'secure' : time >= 2700 ? 'tires' : time >= 2000 ? 'jack' : 'arrival' };
}
export function pitStopPose(elapsed) {
  const t = sequenceTime(elapsed);
  const entry = 1 - smooth(t / 1950);
  const exit = clamp((t - 7000) / (8800 - 7000));
  let wheelOffset = 0;
  if (t >= 2850 && t < 3800) wheelOffset = smooth((t - 2850) / 600) * .72;
  if (t >= 4200 && t < 4900) wheelOffset = (1 - smooth((t - 4200) / 700)) * .72;
  return {
    carZ: entry * 10 - exit * exit * 17,
    lift: .16 * smooth((t - 2100) / 450) * (1 - smooth((t - 5600) / 400)),
    approach: smooth((t - 1500) / 650) * (1 - smooth((t - 5900) / 850)),
    wheelOffset,
    wheelVisible: t < 3800 || t >= 4200,
    carrying: t >= 3400 && t < 4600,
    servicing: t >= 2500 && t < 5400,
    released: t >= 7000,
  };
}
const CAMERA_BEATS = [
  [0, [8.8, 5.5, -9.8]],
  [2000, [7.6, 4.5, -8.7]],
  [4200, [6.6, 4.1, -7.5]],
  [6100, [7.8, 5.4, -8.2]],
  [8800, [9.4, 5.6, -10.5]],
];
export function introCameraPosition(elapsed) {
  const t = sequenceTime(elapsed);
  for (let i = 1; i < CAMERA_BEATS.length; i++) {
    const [endTime, end] = CAMERA_BEATS[i], [startTime, start] = CAMERA_BEATS[i - 1];
    if (t <= endTime) return start.map((value, axis) => value + (end[axis] - value) * smooth((t - startTime) / (endTime - startTime)));
  }
  return [...CAMERA_BEATS.at(-1)[1]];
}
