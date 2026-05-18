import assert from 'node:assert/strict';
import {
  FINAL_SCREEN_ROTATION_Z,
  getDumbbellPose,
  getDumbbellResponsiveParams,
  getDumbbellVisibility,
} from '../js/dumbbell-path.mjs';

const TAU = Math.PI * 2;

function approx(actual, expected, epsilon = 1e-4, message = '') {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `${message} expected ${expected}, received ${actual}`,
  );
}

function normalizeAngle(angle) {
  return ((angle % TAU) + TAU) % TAU;
}

function assertVector(actual, expected, message) {
  approx(actual.x, expected.x, 1e-4, `${message} x`);
  approx(actual.y, expected.y, 1e-4, `${message} y`);
  approx(actual.z, expected.z, 1e-4, `${message} z`);
}

const desktop = getDumbbellResponsiveParams(1280, 720);
const tablet = getDumbbellResponsiveParams(820, 900);
const mobile = getDumbbellResponsiveParams(390, 844);

assert.ok(desktop.scale > tablet.scale, 'desktop starts larger than tablet');
assert.ok(tablet.scale > mobile.scale, 'tablet starts larger than mobile');
assert.ok(desktop.dockScale < desktop.scale, 'desktop docks smaller than its hero size');
assert.ok(mobile.dockScale < mobile.scale, 'mobile docks smaller than its hero size');

assert.ok(
  mobile.screen.start.y > 0.18 && mobile.screen.start.y < 0.38,
  'mobile start anchor stays close to the nav/headline composition',
);
assert.ok(
  desktop.screen.start.y > 0.16 && desktop.screen.start.y < 0.34,
  'desktop start anchor reserves a visible slot above the headline',
);

assert.ok(
  mobile.screen.dock.x > 0.44 && mobile.screen.dock.x < 0.56,
  'mobile dock target stays centered over the story dock marker',
);
assert.ok(
  mobile.screen.dock.y > 0.22 && mobile.screen.dock.y < 0.34,
  'mobile dock target lands above the story headline instead of overlapping it',
);
assert.ok(
  mobile.dockLift >= 0 && mobile.dockLift <= 0.018,
  'mobile docked dumbbell stays close to the explicit blue-reference story marker',
);
assert.ok(
  mobile.shrinkStart < 0.36,
  'mobile dumbbell starts shrinking before it crosses the CTA stack',
);
assert.ok(
  desktop.screen.dock.x > 0.52 && desktop.screen.dock.y > 0.22 && desktop.screen.dock.y < 0.3,
  'desktop dock target sits next to the story eyebrow and above the headline',
);
assert.ok(desktop.dockScale <= 0.14, 'desktop docked dumbbell is a small accent, not a headline overlay');
assert.ok(
  desktop.dockLift >= 0 && desktop.dockLift <= 0.022,
  'desktop docked dumbbell stays close to the explicit blue-reference story marker',
);

const desktopFinal = getDumbbellPose(1, desktop);
assert.notEqual(desktopFinal.position.x, 0, 'desktop fallback dock is not the old centered x=0 point');
assert.notEqual(desktopFinal.position.y, 0, 'desktop fallback dock is not the old centered y=0 point');
approx(
  normalizeAngle(desktopFinal.rotation.z),
  FINAL_SCREEN_ROTATION_Z,
  1e-4,
  'desktop final screen-plane rotation is vertical',
);
approx(
  normalizeAngle(desktopFinal.rotation.y),
  0,
  1e-4,
  'final y rotation settles on a complete turn',
);

const measuredAnchors = {
  start: { x: -0.18, y: 1.62, z: 0.06 },
  dock: { x: 0.74, y: 0.42, z: -0.02 },
};

assertVector(
  getDumbbellPose(0, desktop, measuredAnchors).position,
  measuredAnchors.start,
  'measured start anchor',
);
assertVector(
  getDumbbellPose(1, desktop, measuredAnchors).position,
  measuredAnchors.dock,
  'measured final dock anchor',
);

const mobileStart = getDumbbellPose(0, mobile).position;
const mobileDock = getDumbbellPose(1, mobile).position;
assert.ok(
  mobileStart.y > mobileDock.y,
  'mobile path descends from the reserved hero slot into the story dock',
);
approx(
  normalizeAngle(getDumbbellPose(1, mobile).rotation.z),
  0,
  1e-4,
  'mobile final screen-plane rotation settles horizontal, not as a vertical sliver over text',
);
assert.ok(getDumbbellVisibility(0.06, mobile) > 0.9, 'mobile dumbbell is visible in the reserved hero slot');
assert.equal(getDumbbellVisibility(0.42, mobile), 1, 'mobile dumbbell stays visible through the full path');
assert.ok(getDumbbellVisibility(0.9, mobile) > 0.9, 'mobile dumbbell returns as a small accent over the story image');
assert.equal(getDumbbellVisibility(0.42, desktop), 1, 'desktop dumbbell stays visible through the full path');

console.log('dumbbell path tests passed');
