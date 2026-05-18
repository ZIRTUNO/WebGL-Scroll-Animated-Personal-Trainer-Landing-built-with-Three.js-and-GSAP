import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { getDumbbellPose, getDumbbellResponsiveParams, getDumbbellVisibility } from './dumbbell-path.mjs';

const MODEL_URL = 'assets/models/dumbbell/scene.gltf';
const SUFFIX_RE = /\.(\d{3})$/;
const RESIZE_DEBOUNCE_MS = 120;
const PROGRESS_RENDER_EPSILON = 0.00002;

export function initDumbbell3D() {
  const stage = document.getElementById('dumbbell-stage');
  if (!stage) return;

  const isMobile = getResponsiveViewportWidth() < 760;
  const anisotropy = isMobile ? 2 : 4;

  // --- Renderer / scene / camera ---
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(getCappedDpr());
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  scene.add(new THREE.AmbientLight(0xffffff, 0.30));
  const keyLight = new THREE.DirectionalLight(0xb88dff, 1.6);
  keyLight.position.set(-3, 4, 5);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0x88c4ff, 0.9);
  fillLight.position.set(4, -1, 3);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.55);
  rimLight.position.set(0, 6, -5);
  scene.add(rimLight);

  const pivot = new THREE.Group();
  scene.add(pivot);

  // --- Cached layout state ---
  // The whole point of this rewrite: these values are computed ONCE on real layout
  // changes (width resize, fonts ready, model load, orientation change). They are NOT
  // recomputed during scroll. iOS URL bar / pinch / on-screen keyboard cannot trigger
  // a refresh storm because nothing listens for those events.
  let params = applyZoomCompensation(getDumbbellResponsiveParams(getResponsiveViewportWidth(), innerHeight));
  let anchors = null;            // { start: world, dock: world, screen: { start, dock } }
  let scrollStart = 0;           // page scroll at which animation begins (top of #topo)
  let scrollEnd = innerHeight;   // page scroll at which animation lands at dock
  let lastViewportSignature = getViewportSignature();
  let resizeDebounceTimer = 0;
  let stageAttachment = '';
  let stageTop = '';

  applyCameraDepth();
  recomputeLayout();

  // --- Animation state ---
  const state = { progress: 0, visible: 0 };
  let lastT = -1;
  let lastVisible = -1;

  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    state.visible = 0;
    stage.style.opacity = '0';
  }, false);
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    syncRendererToViewport();
    recomputeLayout();
    state.visible = 1;
    lastT = -1;
  }, false);

  // --- Model load ---
  new GLTFLoader().load(
    MODEL_URL,
    (gltf) => {
      const root = gltf.scene;
      stripDuplicateByName(root);
      stripDuplicateByCentroidGap(root);

      root.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3()).length();
      const centre = box.getCenter(new THREE.Vector3());
      root.position.sub(centre);
      root.scale.setScalar(2.6 / size);

      root.traverse((obj) => {
        if (!obj.isMesh) return;
        const mat = obj.material;
        if (!mat) return;
        mat.envMapIntensity = 1.4;
        if (mat.metalness !== undefined && mat.metalness < 0.6) mat.metalness = 0.85;
        if (mat.roughness !== undefined) {
          mat.roughness = THREE.MathUtils.clamp(mat.roughness, 0.18, 0.48);
        }
        if (mat.map) mat.map.anisotropy = anisotropy;
        if (mat.normalMap) mat.normalMap.anisotropy = anisotropy;
        mat.needsUpdate = true;
      });

      pivot.add(root);
      pivot.scale.setScalar(params.scale);
      state.visible = 1;
      lastT = -1;
      // Re-measure once the model is in the tree (in case parent layout shifted).
      recomputeLayout();
    },
    undefined,
    () => {},
  );

  // --- Real layout listeners (NOT scroll) ---
  // Debounced and signature-gated: normal scrolling must not remeasure the path,
  // but actual viewport / zoom changes must resize the renderer and anchors.
  window.addEventListener('resize', () => {
    scheduleLayoutRefresh();
  }, { passive: true });

  window.visualViewport?.addEventListener('resize', () => {
    if (!shouldTrackVisualViewport()) return;
    scheduleLayoutRefresh();
  }, { passive: true });

  window.addEventListener('wheel', (event) => {
    if (event.ctrlKey) scheduleLayoutRefresh();
  }, { passive: true, capture: true });

  window.addEventListener('orientationchange', () => {
    scheduleLayoutRefresh();
  }, { passive: true });

  // Fonts can shift dock target / slot positions.
  window.addEventListener('load', () => {
    scheduleLayoutRefresh(true);
  }, { once: true, passive: true });

  document.fonts?.ready?.then(() => scheduleLayoutRefresh(true)).catch(() => {});

  function scheduleLayoutRefresh(immediate = false) {
    window.clearTimeout(resizeDebounceTimer);
    const run = () => {
      if (!immediate && !hasViewportChanged()) return;
      lastViewportSignature = getViewportSignature();
      syncRendererToViewport();
      recomputeLayout();
      syncStageAttachment(state.progress >= 1);
      lastT = -1;
    };
    if (immediate) {
      run();
    } else {
      resizeDebounceTimer = window.setTimeout(run, RESIZE_DEBOUNCE_MS);
    }
  }

  // --- The rAF loop. Single source of truth. ---
  requestAnimationFrame(animate);

  function animate() {
    const scrollY = getPageScrollY();
    const span = scrollEnd - scrollStart;
    const rawProgress = span > 0 ? (scrollY - scrollStart) / span : 0;
    state.progress = rawProgress < 0 ? 0 : rawProgress > 1 ? 1 : rawProgress;
    syncStageAttachment(state.progress >= 1);

    if (shouldRender()) {
      renderFrame(state.progress);
      lastT = state.progress;
      lastVisible = state.visible;
    }
    requestAnimationFrame(animate);
  }

  function shouldRender() {
    if (Math.abs(state.progress - lastT) > PROGRESS_RENDER_EPSILON) return true;
    if (Math.abs(state.visible - lastVisible) > 0.005) return true;
    return false;
  }

  function renderFrame(t) {
    const pose = getDumbbellPose(t, params, anchors);
    const { x, y, z } = pose.position;

    pivot.position.set(x, y, z);
    pivot.rotation.set(pose.rotation.x, pose.rotation.y, pose.rotation.z);

    const shrinkStart = Number.isFinite(params.shrinkStart) ? params.shrinkStart : 0.62;
    const shrink = smoothstep01((t - shrinkStart) / (1 - shrinkStart));
    const dockScale = Number.isFinite(params.dockScale) ? params.dockScale : params.scale * 0.16;
    pivot.scale.setScalar(THREE.MathUtils.lerp(params.scale, dockScale, shrink));

    stage.style.opacity = (state.visible * getDumbbellVisibility(t, params)).toFixed(3);

    renderer.render(scene, camera);
  }

  function syncStageAttachment(docked) {
    const nextAttachment = docked ? 'absolute' : 'fixed';
    const nextTop = docked ? `${Math.round(scrollEnd)}px` : '0px';
    if (stageAttachment === nextAttachment && stageTop === nextTop) return;

    stage.style.position = nextAttachment;
    stage.style.top = nextTop;
    stage.style.left = '0px';
    stageAttachment = nextAttachment;
    stageTop = nextTop;
  }

  // --- Layout helpers ---
  function syncRendererToViewport() {
    camera.aspect = innerWidth / innerHeight;
    applyCameraDepth();
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(getCappedDpr());
    renderer.setSize(innerWidth, innerHeight);
  }

  function recomputeLayout() {
    params = applyZoomCompensation(getDumbbellResponsiveParams(getResponsiveViewportWidth(), innerHeight));

    const heroTrigger = document.getElementById('topo');
    scrollStart = heroTrigger ? Math.max(0, documentRect(heroTrigger).top) : 0;
    scrollEnd = scrollStart + computeAnimationDistance();

    const startScreen = getHeroSlotScreenPoint(scrollStart);
    const dockScreen = getDockTargetScreenPoint(scrollEnd);
    anchors = {
      start: screenToWorldPoint(startScreen, params.fallback.start.z),
      dock: screenToWorldPoint(dockScreen, params.fallback.dock.z),
      screen: { start: startScreen, dock: dockScreen },
    };
  }

  function computeAnimationDistance() {
    // Distance from scrollStart to where the dock target should land at its desired
    // viewport y. Mirrors the previous getScrollEnd() heuristic but expressed as a
    // delta from the trigger's start so it works even if #topo isn't at scrollY=0.
    const dockPoint = getDockTargetDocumentPoint();
    const minSpan = Math.round(innerHeight * 0.85);
    if (!dockPoint) return Math.max(minSpan, Math.round(innerHeight * 1.25));
    const desiredY = (params.screen.dock.y || 0.4) * innerHeight;
    return Math.max(minSpan, Math.round(dockPoint.y - desiredY - scrollStart));
  }

  function applyCameraDepth() {
    const responsiveWidth = getResponsiveViewportWidth();
    if (responsiveWidth < 760) camera.position.z = 10.7;
    else if (responsiveWidth < 1080) camera.position.z = 9.8;
    else camera.position.z = 9;
  }

  function getCappedDpr() {
    const dpr = window.devicePixelRatio || 1;
    const responsiveWidth = getResponsiveViewportWidth();
    if (responsiveWidth < 760) return Math.min(dpr, 1.1);
    if (responsiveWidth < 1080) return Math.min(dpr, 1.5);
    return Math.min(dpr, 2);
  }

  function getResponsiveViewportWidth() {
    const outer = Number.isFinite(window.outerWidth) ? window.outerWidth : 0;
    if (isFinePointerViewport() && outer > 0) {
      return outer;
    }
    return innerWidth;
  }

  function applyZoomCompensation(base) {
    const zoomScale = getZoomCompensationScale();
    return {
      ...base,
      scale: base.scale * zoomScale,
      dockScale: base.dockScale * zoomScale,
    };
  }

  function getZoomCompensationScale() {
    const outer = Number.isFinite(window.outerWidth) ? window.outerWidth : 0;
    if (!isFinePointerViewport() || outer <= 0 || innerWidth <= 0) return 1;

    const ratio = outer / innerWidth;
    if (ratio < 0.98) return THREE.MathUtils.clamp(ratio, 0.72, 1);
    if (ratio > 1.02) return THREE.MathUtils.clamp(Math.sqrt(ratio), 1, 1.18);
    return 1;
  }

  function isFinePointerViewport() {
    return window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches === true;
  }

  function getViewportSignature() {
    const baseSignature = [
      window.innerWidth,
      window.innerHeight,
      getResponsiveViewportWidth(),
      window.devicePixelRatio || 1,
    ];
    if (!shouldTrackVisualViewport()) return baseSignature.join(':');

    const visualViewport = window.visualViewport;
    return [
      ...baseSignature,
      visualViewport?.width || 0,
      visualViewport?.height || 0,
      visualViewport?.scale || 1,
    ].join(':');
  }

  function shouldTrackVisualViewport() {
    return isFinePointerViewport();
  }

  function hasViewportChanged() {
    return getViewportSignature() !== lastViewportSignature;
  }

  function getHeroSlotScreenPoint(scrollAtAnchor) {
    const point = getHeroSlotDocumentPoint();
    if (!point) return normalizedScreenPoint(params.screen.start);
    return constrainScreenPoint({ x: point.x, y: point.y - scrollAtAnchor });
  }

  function getDockTargetScreenPoint(scrollAtAnchor) {
    const point = getDockTargetDocumentPoint();
    if (!point) return normalizedScreenPoint(params.screen.dock);
    const dockLift = Number.isFinite(params.dockLift) ? params.dockLift * innerHeight : 0;
    return constrainScreenPoint({ x: point.x, y: point.y - scrollAtAnchor - dockLift });
  }

  function getHeroSlotDocumentPoint() {
    const slot = document.querySelector('.hero-dumbbell-slot');
    if (!slot) return null;
    const rect = documentRect(slot);
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function getDockTargetDocumentPoint() {
    const dockMarker = document.querySelector('.story-dumbbell-dock');
    if (dockMarker && dockMarker.offsetParent !== null) {
      const rect = documentRect(dockMarker);
      if (rect.width > 0 || rect.height > 0) {
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
    }

    if (innerWidth < 760) {
      const image = document.querySelector('#historia .story-img');
      if (image) {
        const rect = documentRect(image);
        return {
          x: rect.left + rect.width * 0.5,
          y: rect.top + rect.height * 0.42,
        };
      }
    }

    const eyebrow = document.querySelector('#historia .story-grid .eyebrow');
    if (eyebrow) {
      const rect = documentRect(eyebrow);
      const dockX = innerWidth < 900
        ? innerWidth * params.screen.dock.x
        : rect.left + rect.width + 58;
      return {
        x: THREE.MathUtils.clamp(dockX, innerWidth * 0.5, innerWidth * 0.74),
        y: rect.top + rect.height * 0.55,
      };
    }

    const storyText = document.querySelector('#historia .story-grid > div:nth-child(2)');
    if (storyText) {
      const rect = documentRect(storyText);
      return { x: rect.left + rect.width * 0.38, y: rect.top + Math.min(rect.height * 0.16, 86) };
    }

    return null;
  }

  function documentRect(element) {
    const layoutRect = layoutDocumentRect(element);
    if (layoutRect) return layoutRect;

    const rect = element.getBoundingClientRect();
    return {
      left: rect.left + getPageScrollX(),
      top: rect.top + getPageScrollY(),
      width: rect.width,
      height: rect.height,
    };
  }

  function layoutDocumentRect(element) {
    if (!(element instanceof HTMLElement)) return null;

    let left = element.offsetLeft;
    let top = element.offsetTop;
    let parent = element.offsetParent;

    while (parent instanceof HTMLElement) {
      left += parent.offsetLeft + parent.clientLeft;
      top += parent.offsetTop + parent.clientTop;
      parent = parent.offsetParent;
    }

    return {
      left,
      top,
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
  }

  function normalizedScreenPoint(screen) {
    return constrainScreenPoint({ x: screen.x * innerWidth, y: screen.y * innerHeight });
  }

  function constrainScreenPoint(point) {
    return {
      x: THREE.MathUtils.clamp(point.x, innerWidth * 0.06, innerWidth * 0.94),
      y: THREE.MathUtils.clamp(point.y, innerHeight * 0.08, innerHeight * 0.92),
    };
  }

  function screenToWorldPoint(point, worldZ = 0) {
    const distance = camera.position.z - worldZ;
    const fovRad = THREE.MathUtils.degToRad(camera.fov);
    const worldHeight = 2 * distance * Math.tan(fovRad / 2);
    const worldWidth = worldHeight * camera.aspect;
    return {
      x: (point.x / innerWidth - 0.5) * worldWidth,
      y: (0.5 - point.y / innerHeight) * worldHeight,
      z: worldZ,
    };
  }
}

function getPageScrollY() {
  const scrollingElement = document.scrollingElement;
  const primary = Math.max(
    0,
    window.scrollY || 0,
    window.pageYOffset || 0,
    document.documentElement?.scrollTop || 0,
    scrollingElement?.scrollTop || 0,
  );
  if (primary > 0) return primary;
  return Math.max(0, document.body?.scrollTop || 0);
}

function getPageScrollX() {
  const scrollingElement = document.scrollingElement;
  const primary = Math.max(
    0,
    window.scrollX || 0,
    window.pageXOffset || 0,
    document.documentElement?.scrollLeft || 0,
    scrollingElement?.scrollLeft || 0,
  );
  if (primary > 0) return primary;
  return Math.max(0, document.body?.scrollLeft || 0);
}

function smoothstep01(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

function baseName(name) {
  return (name || '').replace(SUFFIX_RE, '');
}

function suffixIndex(name) {
  const m = (name || '').match(SUFFIX_RE);
  return m ? parseInt(m[1], 10) : 0;
}

function stripDuplicateByName(node) {
  if (!node || !node.children || node.children.length === 0) return;

  const groups = new Map();
  for (const child of node.children) {
    const base = baseName(child.name);
    if (!groups.has(base)) groups.set(base, []);
    groups.get(base).push(child);
  }

  const toRemove = [];
  for (const [, members] of groups) {
    if (members.length < 2) continue;
    members.sort((a, b) => suffixIndex(a.name) - suffixIndex(b.name));
    const keepCount = Math.ceil(members.length / 2);
    for (let i = keepCount; i < members.length; i++) toRemove.push(members[i]);
  }
  toRemove.forEach((c) => node.remove(c));

  for (const child of [...node.children]) stripDuplicateByName(child);
}

function stripDuplicateByCentroidGap(root) {
  root.updateMatrixWorld(true);
  const meshes = [];
  root.traverse((o) => { if (o.isMesh) meshes.push(o); });
  if (meshes.length < 4) return;

  const centroids = meshes.map((m) => {
    const box = new THREE.Box3().setFromObject(m);
    return box.getCenter(new THREE.Vector3());
  });

  const bb = new THREE.Box3();
  centroids.forEach((c) => bb.expandByPoint(c));
  const size = bb.getSize(new THREE.Vector3());

  let bestAxis = null;
  let bestGap = 0;
  let bestSplit = 0;

  for (const axis of ['x', 'y', 'z']) {
    const projs = centroids.map((c) => c[axis]).slice().sort((a, b) => a - b);
    const span = size[axis] || 1;
    for (let i = 1; i < projs.length; i++) {
      const gap = projs[i] - projs[i - 1];
      if (gap > bestGap && gap > span * 0.25) {
        bestGap = gap;
        bestAxis = axis;
        bestSplit = (projs[i] + projs[i - 1]) / 2;
      }
    }
  }

  if (!bestAxis) return;

  const lower = [];
  const upper = [];
  centroids.forEach((c, i) => {
    (c[bestAxis] < bestSplit ? lower : upper).push(i);
  });

  const meanAt = (axis, idxs) =>
    idxs.reduce((s, i) => s + centroids[i][axis], 0) / (idxs.length || 1);

  const dropIdxs = Math.abs(meanAt(bestAxis, lower)) > Math.abs(meanAt(bestAxis, upper))
    ? lower
    : upper;
  const drop = new Set(dropIdxs);

  meshes.forEach((m, i) => {
    if (drop.has(i) && m.parent) m.parent.remove(m);
  });
}
