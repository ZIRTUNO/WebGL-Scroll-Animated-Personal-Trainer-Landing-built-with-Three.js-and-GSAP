import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { getDumbbellPose, getDumbbellResponsiveParams, getDumbbellVisibility } from './dumbbell-path.mjs';

const MODEL_URL = 'assets/models/dumbbell/scene.gltf';
const SUFFIX_RE = /\.(\d{3})$/;

export function initDumbbell3D() {
  const stage = document.getElementById('dumbbell-stage');
  if (!stage) return;

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const isMobile = innerWidth < 760;
  const dprCap = isMobile ? 1.25 : 1.5;
  const anisotropy = isMobile ? 2 : 4;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !isMobile,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));
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

  let params = getDumbbellResponsiveParams(innerWidth, innerHeight);
  let anchors = null;
  applyCameraDepth();
  anchors = measureLayoutAnchors(null);

  function onResize() {
    camera.aspect = innerWidth / innerHeight;
    applyCameraDepth();
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);

    params = getDumbbellResponsiveParams(innerWidth, innerHeight);
    anchors = measureLayoutAnchors(scrollTrigger);
    lastT = -1;
    ScrollTrigger.refresh();
  }
  window.addEventListener('resize', onResize);

  const state = { progress: 0, visible: 0 };
  let scrollTrigger = null;

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

      scrollTrigger = ScrollTrigger.create({
        trigger: '#topo',
        start: 'top top',
        end: () => getScrollEnd(),
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          params = getDumbbellResponsiveParams(innerWidth, innerHeight);
          anchors = measureLayoutAnchors(self);
          state.progress = self.progress;
          lastT = -1;
        },
        onUpdate: (self) => {
          state.progress = self.progress;
        },
      });
      anchors = measureLayoutAnchors(scrollTrigger);
    },
    undefined,
    () => {},
  );

  const FALLBACK_SHRINK_START = 0.62;

  let lastT = -1;
  let lastVisible = -1;
  let lastScrollY = -1;

  function shouldRender() {
    if (Math.abs(state.progress - lastT) > 0.0001) return true;
    if (Math.abs(state.visible - lastVisible) > 0.005) return true;
    if (state.progress >= 0.999 && window.scrollY !== lastScrollY) return true;
    return false;
  }

  function animate() {
    if (shouldRender()) {
      const t = state.progress;
      const pose = getDumbbellPose(t, params, anchors);
      let { x, y, z } = pose.position;

      if (scrollTrigger && t >= 0.999) {
        const overscroll = Math.max(0, window.scrollY - scrollTrigger.end);
        y += pixelsToWorldY(overscroll, camera, anchors?.dock?.z || 0);
      }

      pivot.position.set(x, y, z);
      pivot.rotation.set(pose.rotation.x, pose.rotation.y, pose.rotation.z);

      const shrinkStart = Number.isFinite(params.shrinkStart)
        ? params.shrinkStart
        : FALLBACK_SHRINK_START;
      const shrink = smoothstep01((t - shrinkStart) / (1 - shrinkStart));
      const dockScale = Number.isFinite(params.dockScale)
        ? params.dockScale
        : params.scale * 0.16;
      pivot.scale.setScalar(THREE.MathUtils.lerp(params.scale, dockScale, shrink));

      stage.style.opacity = (state.visible * getDumbbellVisibility(t, params)).toFixed(3);

      renderer.render(scene, camera);

      lastT = state.progress;
      lastVisible = state.visible;
      lastScrollY = window.scrollY;
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  const refreshScrollTrigger = () => ScrollTrigger.refresh();
  if (document.readyState === 'complete') {
    requestAnimationFrame(refreshScrollTrigger);
  } else {
    window.addEventListener('load', refreshScrollTrigger);
  }
  document.fonts?.ready?.then(refreshScrollTrigger).catch(() => {});

  function applyCameraDepth() {
    if (innerWidth < 760) {
      camera.position.z = 10.7;
    } else if (innerWidth < 1080) {
      camera.position.z = 9.8;
    } else {
      camera.position.z = 9;
    }
  }

  function measureLayoutAnchors(trigger) {
    const startScreen = getHeroSlotScreenPoint(trigger);
    const dockScreen = getDockTargetScreenPoint(trigger);

    return {
      start: screenToWorldPoint(startScreen, params.fallback.start.z),
      dock: screenToWorldPoint(dockScreen, params.fallback.dock.z),
      screen: { start: startScreen, dock: dockScreen },
    };
  }

  function getHeroSlotScreenPoint(trigger) {
    const point = getHeroSlotDocumentPoint();
    if (!point) return normalizedScreenPoint(params.screen.start);
    return constrainScreenPoint({ x: point.x, y: point.y - (trigger?.start || 0) });
  }

  function getDockTargetScreenPoint(trigger) {
    const point = getDockTargetDocumentPoint();
    if (!point) return normalizedScreenPoint(params.screen.dock);
    return constrainScreenPoint({ x: point.x, y: point.y - (trigger?.end || getScrollEnd()) });
  }

  function getScrollEnd() {
    const point = getDockTargetDocumentPoint();
    if (!point) return Math.round(innerHeight * 1.25);
    const desiredY = (params.screen.dock.y || 0.4) * innerHeight;
    return Math.round(Math.max(innerHeight * 0.85, point.y - desiredY));
  }

  function getHeroSlotDocumentPoint() {
    const slot = document.querySelector('.hero-dumbbell-slot');
    if (!slot) return null;
    const rect = documentRect(slot);
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function getDockTargetDocumentPoint() {
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
    let left = 0;
    let top = 0;
    let node = element;
    while (node) {
      left += node.offsetLeft || 0;
      top += node.offsetTop || 0;
      node = node.offsetParent;
    }
    return { left, top, width: element.offsetWidth, height: element.offsetHeight };
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

function pixelsToWorldY(px, camera, worldZ = 0) {
  const fovRad = THREE.MathUtils.degToRad(camera.fov);
  const worldHeight = 2 * (camera.position.z - worldZ) * Math.tan(fovRad / 2);
  return px * (worldHeight / innerHeight);
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
