const TAU = Math.PI * 2;
const MOBILE_BREAKPOINT = 760;
const TABLET_BREAKPOINT = 1080;

export const FINAL_SCREEN_ROTATION_Z = Math.PI / 2;

export const DUMBBELL_PHASES = Object.freeze({
  suba: 0.18,
  proximo: 0.38,
  patamar: 0.58,
  image: 0.78,
});

const PRESETS = Object.freeze({
  mobile: {
    screen: {
      start: { x: 0.5, y: 0.27 },
      dock: { x: 0.5, y: 0.48 },
    },
    fallback: {
      start: { x: 0, y: 1.34, z: 0.04 },
      dock: { x: 0, y: 0.16, z: -0.02 },
    },
    scale: 0.58,
    dockScale: 0.18,
    shrinkStart: 0.24,
    finalRotationZ: 0,
    orbit: 0.34,
    zBehind: -0.14,
    zFront: 0.2,
  },
  tablet: {
    screen: {
      start: { x: 0.5, y: 0.25 },
      dock: { x: 0.56, y: 0.32 },
    },
    fallback: {
      start: { x: 0, y: 1.55, z: 0.05 },
      dock: { x: 0.42, y: 0.56, z: -0.02 },
    },
    scale: 1.06,
    dockScale: 0.16,
    orbit: 0.44,
    zBehind: -0.16,
    zFront: 0.24,
  },
  desktop: {
    screen: {
      start: { x: 0.5, y: 0.24 },
      dock: { x: 0.67, y: 0.34 },
    },
    fallback: {
      start: { x: 0, y: 1.78, z: 0.06 },
      dock: { x: 0.64, y: 0.44, z: -0.02 },
    },
    scale: 1.48,
    dockScale: 0.18,
    orbit: 0.56,
    zBehind: -0.18,
    zFront: 0.28,
  },
});

export function getDumbbellResponsiveParams(width, height) {
  const safeWidth = Number.isFinite(width) && width > 0 ? width : 1280;
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 720;
  const breakpoint = getBreakpoint(safeWidth);
  const preset = PRESETS[breakpoint];
  const heightFactor = clamp(safeHeight / 800, 0.88, 1.1);
  const fallback = {
    start: scaleVector(preset.fallback.start, 1, heightFactor),
    dock: scaleVector(preset.fallback.dock, 1, heightFactor),
  };

  return {
    breakpoint,
    viewport: { width: safeWidth, height: safeHeight },
    screen: cloneScreenPreset(preset.screen),
    fallback,
    points: buildPathPoints(fallback.start, fallback.dock, preset),
    scale: preset.scale,
    dockScale: preset.dockScale,
    spinTurns: 1,
    tumbleTurns: 1,
    finalRotationZ: Number.isFinite(preset.finalRotationZ)
      ? preset.finalRotationZ
      : FINAL_SCREEN_ROTATION_Z,
    shrinkStart: Number.isFinite(preset.shrinkStart) ? preset.shrinkStart : 0.62,
    orbit: preset.orbit,
    zBehind: preset.zBehind,
    zFront: preset.zFront,
  };
}

export function getDumbbellPose(progress, params, anchors) {
  const p = params || getDumbbellResponsiveParams(1280, 720);
  const t = clamp(progress, 0, 1);
  const resolved = resolveAnchors(p, anchors);
  const points = buildPathPoints(resolved.start, resolved.dock, p);
  const position = sampleCatmullRom(points, t);
  const ease = easeInOutCubic(t);
  const spinTurns = Number.isFinite(p.spinTurns) ? p.spinTurns : 0;
  const tumbleTurns = Number.isFinite(p.tumbleTurns) ? p.tumbleTurns : 0;
  const finalRotationZ = Number.isFinite(p.finalRotationZ)
    ? p.finalRotationZ
    : FINAL_SCREEN_ROTATION_Z;

  return {
    position,
    rotation: {
      x: 0,
      y: ease * spinTurns * TAU,
      z: ease * (tumbleTurns * TAU + finalRotationZ),
    },
  };
}

export function getDumbbellVisibility(progress, params) {
  const p = params || getDumbbellResponsiveParams(1280, 720);
  if (p.breakpoint !== 'mobile') return 1;

  const t = clamp(progress, 0, 1);
  const fadeOut = smoothstep01((t - 0.12) / 0.18);
  const fadeIn = smoothstep01((t - 0.68) / 0.16);
  return clamp(Math.max(1 - fadeOut, fadeIn), 0, 1);
}

function getBreakpoint(width) {
  if (width < MOBILE_BREAKPOINT) return 'mobile';
  if (width < TABLET_BREAKPOINT) return 'tablet';
  return 'desktop';
}

function resolveAnchors(params, anchors) {
  return {
    start: toVector(anchors?.start || params.fallback.start),
    dock: toVector(anchors?.dock || params.fallback.dock),
  };
}

function buildPathPoints(start, dock, params) {
  const orbit = Number.isFinite(params.orbit) ? params.orbit : 0.42;
  const zBehind = Number.isFinite(params.zBehind) ? params.zBehind : -0.14;
  const zFront = Number.isFinite(params.zFront) ? params.zFront : 0.22;
  const direction = dock.x >= start.x ? 1 : -1;

  return [
    { t: 0, ...start },
    {
      t: DUMBBELL_PHASES.suba,
      x: lerp(start.x, dock.x, 0.16) - direction * orbit * 0.55,
      y: lerp(start.y, dock.y, 0.2),
      z: zBehind,
    },
    {
      t: DUMBBELL_PHASES.proximo,
      x: lerp(start.x, dock.x, 0.38) + direction * orbit * 0.72,
      y: lerp(start.y, dock.y, 0.43),
      z: zBehind * 1.1,
    },
    {
      t: DUMBBELL_PHASES.patamar,
      x: lerp(start.x, dock.x, 0.64) + direction * orbit * 0.28,
      y: lerp(start.y, dock.y, 0.66),
      z: zFront,
    },
    {
      t: DUMBBELL_PHASES.image,
      x: lerp(start.x, dock.x, 0.86) - direction * orbit * 0.2,
      y: lerp(start.y, dock.y, 0.84),
      z: zBehind * 0.65,
    },
    { t: 1, ...dock },
  ];
}

function cloneScreenPreset(screen) {
  return {
    start: { ...screen.start },
    dock: { ...screen.dock },
  };
}

function scaleVector(vector, xScale, yScale) {
  return {
    x: vector.x * xScale,
    y: vector.y * yScale,
    z: vector.z,
  };
}

function sampleCatmullRom(points, t) {
  const last = points.length - 1;
  if (t <= points[0].t) return toVector(points[0]);
  if (t >= points[last].t) return toVector(points[last]);

  let i = 0;
  while (i < last && t > points[i + 1].t) i++;

  const p0 = points[Math.max(0, i - 1)];
  const p1 = points[i];
  const p2 = points[i + 1];
  const p3 = points[Math.min(last, i + 2)];
  const localT = (t - p1.t) / (p2.t - p1.t);

  return {
    x: catmull(p0.x, p1.x, p2.x, p3.x, localT),
    y: catmull(p0.y, p1.y, p2.y, p3.y, localT),
    z: catmull(p0.z, p1.z, p2.z, p3.z, localT),
  };
}

function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothstep01(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function toVector(point) {
  return { x: point.x, y: point.y, z: point.z };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
