import * as THREE from "three";
import { createPreview } from "./preview.js";

/* 安装说明 · 复用定制页的实体模型
 * 第 1 步拆开 7 块主体板，第 2 步装 3 块曲面装饰，
 * 第 3 步装用户选好的装饰条，第 4 步从白色刷成可可蛋奶色。
 */

const BASE_SHELL = 0xfbf7ef;
const BASE_TRIM = BASE_SHELL;
const PAINT_SHELL = 0xf2e2cb;
// 刷漆后板材和装饰条用同一个颜色，只靠 3D 光照体现明暗。
const PAINT_TRIM = PAINT_SHELL;

const PANEL_NAMES = [
  "下横前挡板·正面",
  "下横左侧板·左侧面",
  "下横右侧板·右侧面",
  "下横顶板·顶面",
  "烟道前挡板·正面",
  "烟道左侧板·左侧面",
  "烟道右侧板·右侧面",
];

const CURVE_NAMES = [
  "装饰曲面·正面",
  "装饰曲面·左侧面",
  "装饰曲面·右侧面",
];

const TRIM_NAMES = [
  "烟道顶部装饰条",
  "装饰曲面起点装饰条",
  "下横顶边装饰条",
  "下横底边装饰条",
];

const TRIM_STYLE_KEYS = {
  "烟道顶部装饰条": "top",
  "装饰曲面起点装饰条": "start",
  "下横顶边装饰条": "hoodTop",
  "下横底边装饰条": "hoodBottom",
};

const TRIM_WIDTH = 16;
const PROXY_SCALE = 1.8;

// 和定制页保持同一套装饰条截面。
function trimProfile(style) {
  const width = TRIM_WIDTH;
  if (style === "double") {
    const gap = width * 0.18;
    const bead = (width - gap) / 2;
    const steps = 10;
    const profile = [];
    for (let index = 0; index <= steps; index++) {
      const angle = (Math.PI * index) / steps;
      profile.push([bead / 2 - (bead / 2) * Math.cos(angle), (bead / 2) * Math.sin(angle)]);
    }
    profile.push([bead + gap, 0]);
    for (let index = 1; index <= steps; index++) {
      const angle = (Math.PI * index) / steps;
      profile.push([
        bead + gap + bead / 2 - (bead / 2) * Math.cos(angle),
        (bead / 2) * Math.sin(angle),
      ]);
    }
    return profile;
  }
  if (style === "corner") {
    return [[0, 0], [0, width], [width, 0]];
  }
  const steps = 16;
  const profile = [];
  for (let index = 0; index <= steps; index++) {
    const angle = (Math.PI * index) / steps;
    profile.push([
      width / 2 - (width / 2) * Math.cos(angle),
      (width / 2) * Math.sin(angle),
    ]);
  }
  return profile;
}

// 把截面沿 X 轴拉成一段直条；两端可以做成 45° 海棠角。
function createTrimPrism(profile, length, startMiter = 0, endMiter = 0, width = TRIM_WIDTH) {
  const positions = [];
  const indices = [];
  const middle = width / 2;

  for (const [offset, height] of profile) {
    const startX = -length / 2 + startMiter * (offset - middle);
    const endX = length / 2 + endMiter * (offset - middle);
    positions.push(startX, height, offset, endX, height, offset);
  }

  for (let index = 0; index < profile.length - 1; index++) {
    const a = index * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, b, c, b, d, c);
  }

  const contour = profile.map(([offset, height]) => new THREE.Vector2(offset, height));
  const caps = THREE.ShapeUtils.triangulateShape(contour, []);
  for (const [a, b, c] of caps) {
    indices.push(a * 2, b * 2, c * 2);
    indices.push(a * 2 + 1, b * 2 + 1, c * 2 + 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = THREE.MathUtils.lerp;

function makeSoftCircleTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.65)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeMistTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 128, 0);
  gradient.addColorStop(0, "rgba(255, 246, 228, 0)");
  gradient.addColorStop(0.42, "rgba(255, 246, 228, 0.4)");
  gradient.addColorStop(0.5, "rgba(255, 250, 239, 0.68)");
  gradient.addColorStop(0.58, "rgba(255, 246, 228, 0.4)");
  gradient.addColorStop(1, "rgba(255, 246, 228, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 512);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createInstallScene(container, initialState, options = {}) {
  if (!container) throw new Error("缺少安装场景容器");

  const compact = Boolean(options.compact);
  const previewOptions = compact
    ? { fitMargin: 1.18, direction: [0.34, 0.16, 1.5], softLighting: true, aspectFit: true }
    : {
        fitMargin: 1.35,
        direction: [0.3, 0.18, 1.5],
        targetOffset: [(initialState.hoodWidth + 40) * 0.1, 0, 0],
        softLighting: true,
        aspectFit: true,
      };
  const preview = createPreview(container, initialState, previewOptions);
  const canvas = container.querySelector("canvas");
  if (canvas) canvas.style.touchAction = "pan-y";
  const scene = preview.getScene();
  const model = preview.getModel();
  const materials = preview.getMaterials();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const originalChildren = [...model.children];
  model.updateMatrixWorld(true);
  const modelBox = new THREE.Box3().setFromObject(model);
  const modelSize = modelBox.getSize(new THREE.Vector3());
  const modelCenter = modelBox.getCenter(new THREE.Vector3());
  const W = Math.max(1, modelSize.x);
  const H = Math.max(1, modelSize.y);
  const D = Math.max(1, modelSize.z);
  const frontZ = modelBox.max.z;

  const baseItems = [];
  const curveItems = [];
  const trimItems = [];
  const shimItems = [];
  const proxyStrips = [];
  const cutRigs = [];
  const tweens = new Set();

  let proxyRoot = null;
  let proxyTrimMat = null;
  let rawLength = 0;
  let rawZ = 0;
  let rawCenterY = 0;
  let stackGap = 34;
  let cutStackHeight = 0;
  let cutX1 = 0;
  let cutX2 = 0;

  const baseShell = new THREE.Color(BASE_SHELL);
  const baseTrim = new THREE.Color(BASE_TRIM);
  const paintShell = new THREE.Color(PAINT_SHELL);
  const paintTrim = new THREE.Color(PAINT_TRIM);
  const tempShell = new THREE.Color();
  const tempTrim = new THREE.Color();

  let disposed = false;
  let rafId = 0;

  let mistPlane;
  let mistMaterial;
  let sprayPoints;
  let sprayMaterial;
  let sprayPositions;
  const spraySeeds = [];

  function isShim(name) {
    return name.startsWith("内部垫高");
  }

  function groupParts(name, match, collection, allowShim = false) {
    const objects = originalChildren.filter(
      (object) => (allowShim || !isShim(object.name)) && match(object.name)
    );
    if (!objects.length) return null;

    const box = new THREE.Box3();
    for (const object of objects) box.expandByObject(object);
    if (box.isEmpty()) return null;

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const group = new THREE.Group();
    group.name = `${name}·安装组`;
    group.position.copy(center);
    model.add(group);
    model.updateMatrixWorld(true);
    for (const object of objects) group.attach(object);

    const item = {
      name,
      group,
      home: center.clone(),
      size,
      away: new THREE.Vector3(),
      awayRotation: new THREE.Euler(),
    };
    collection.push(item);
    return item;
  }

  function buildInstallGroups() {
    for (const name of PANEL_NAMES) {
      groupParts(name, (objectName) => objectName.startsWith(name), baseItems);
    }
    for (const name of CURVE_NAMES) {
      groupParts(name, (objectName) => objectName.startsWith(`${name}·`), curveItems);
    }
    for (const name of TRIM_NAMES) {
      groupParts(name, (objectName) => objectName === name, trimItems);
    }
    // 垫高板只在用户设置了垫高时存在；左右两侧各成一组，跟侧板一起出现。
    groupParts("内部垫高左", (objectName) => objectName.startsWith("内部垫高左"), shimItems, true);
    groupParts("内部垫高右", (objectName) => objectName.startsWith("内部垫高右"), shimItems, true);

    for (const item of [...baseItems, ...curveItems, ...trimItems, ...shimItems]) {
      item.group.visible = false;
    }
  }

  function buildTrimCutScene() {
    if (!trimItems.length) return;

    proxyRoot = new THREE.Group();
    proxyRoot.name = "装饰条裁切演示";
    proxyTrimMat = materials.trimMat.clone();
    scene.add(proxyRoot);

    const maxSpan = Math.max(...trimItems.map((item) => item.size.x + item.size.z * 2), W * 1.15);
    // 长条要有“余量”，但裁切位置要留在画面里。
    rawLength = Math.min(maxSpan * 1.06, W * 0.92);
    cutX1 = -rawLength / 4;
    cutX2 = rawLength / 4;
    rawCenterY = modelCenter.y + H * 0.06;
    rawZ = frontZ + Math.max(D * 0.55, 180);
    stackGap = 58;
    const proxyWidth = TRIM_WIDTH * PROXY_SCALE;

    const styles = trimItems.map((item) => {
      const key = TRIM_STYLE_KEYS[item.name];
      return initialState.trimStyles?.[key] || initialState.trimStyle || "single";
    });
    const profiles = styles.map((style) =>
      trimProfile(style).map(([offset, height]) => [offset * PROXY_SCALE, height * PROXY_SCALE])
    );
    const profileHeights = profiles.map((profile) =>
      Math.max(...profile.map((point) => point[1]))
    );
    cutStackHeight = (trimItems.length - 1) * stackGap + Math.max(...profileHeights) + 30;

    trimItems.forEach((item, index) => {
      const style = styles[index];
      const profile = profiles[index];
      const stripGroup = new THREE.Group();
      stripGroup.name = `${item.name}·长条`;
      const y = rawCenterY + ((trimItems.length - 1) / 2 - index) * stackGap;
      stripGroup.position.set(0, y, rawZ);
      stripGroup.visible = false;

      const pieces = [];
      const lengths = [rawLength * 0.25, rawLength * 0.5, rawLength * 0.25];
      const centers = [
        -rawLength / 2 + lengths[0] / 2,
        -rawLength / 2 + lengths[0] + lengths[1] / 2,
        rawLength / 2 - lengths[2] / 2,
      ];
      const miters = [
        [0, 1],
        [1, -1],
        [-1, 0],
      ];

      for (let pieceIndex = 0; pieceIndex < 3; pieceIndex++) {
        const geometry = createTrimPrism(
          profile,
          lengths[pieceIndex],
          miters[pieceIndex][0],
          miters[pieceIndex][1],
          proxyWidth
        );
        const mesh = new THREE.Mesh(geometry, proxyTrimMat || materials.trimMat);
        mesh.name = `${item.name}·${["左", "前", "右"][pieceIndex]}`;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.x = centers[pieceIndex];
        stripGroup.add(mesh);
        pieces.push({
          mesh,
          rawX: centers[pieceIndex],
          length: lengths[pieceIndex],
          kind: ["left", "front", "right"][pieceIndex],
        });
      }

      proxyRoot.add(stripGroup);
      proxyStrips.push({
        item,
        style,
        group: stripGroup,
        pieces,
        rawY: y,
        profileHeight: Math.max(...profile.map((point) => point[1])),
      });
    });

    for (const [index, x] of [[0, cutX1], [1, cutX2]]) {
      const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0xff5a24,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      });
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(3, cutStackHeight + 90, 3),
        lineMaterial
      );
      line.position.set(x, rawCenterY, rawZ + proxyWidth + 14);
      line.rotation.y = Math.PI / 4;
      line.visible = false;
      line.renderOrder = 22;
      proxyRoot.add(line);

      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x2c2c2e,
        metalness: 0.25,
        roughness: 0.55,
      });
      const gripMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8a33d,
        metalness: 0.1,
        roughness: 0.5,
      });
      const bladeMaterial = new THREE.MeshStandardMaterial({
        color: 0xd7dde1,
        metalness: 0.9,
        roughness: 0.22,
      });
      const cutter = new THREE.Group();
      cutter.name = `裁切刀${index + 1}`;
      // 美工刀：深色刀身 + 黄色握把 + 银色刀片，刀尖朝下
      const body = new THREE.Mesh(new THREE.BoxGeometry(26, 74, 16), bodyMaterial);
      body.position.y = 26;
      body.castShadow = true;
      const grip = new THREE.Mesh(new THREE.BoxGeometry(28, 30, 18), gripMaterial);
      grip.position.y = 56;
      grip.castShadow = true;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(3, 58, 12), bladeMaterial);
      blade.position.set(0, -40, 5);
      blade.castShadow = true;
      const tip = new THREE.Mesh(new THREE.BoxGeometry(3, 14, 7), bladeMaterial);
      tip.position.set(0, -74, 4);
      tip.rotation.x = 0.34;
      cutter.add(body, grip, blade, tip);
      cutter.position.set(x, rawCenterY + cutStackHeight / 2 + 40, rawZ + proxyWidth + 14);
      cutter.rotation.y = Math.PI / 4;
      cutter.visible = false;
      proxyRoot.add(cutter);

      // 每根长条顶面的 45° 切割线，让海棠角更直观。
      const topLines = proxyStrips.map((strip) => {
        const material = new THREE.MeshBasicMaterial({
          color: 0xff7a3d,
          transparent: true,
          opacity: 0,
          depthTest: false,
          depthWrite: false,
          toneMapped: false,
        });
        const topLine = new THREE.Mesh(
          new THREE.BoxGeometry(2.4, 1.4, proxyWidth * 1.42),
          material
        );
        topLine.position.set(x, strip.rawY + strip.profileHeight + 1.5, rawZ + proxyWidth / 2);
        topLine.rotation.y = index === 0 ? Math.PI / 4 : -Math.PI / 4;
        topLine.visible = false;
        topLine.renderOrder = 23;
        proxyRoot.add(topLine);
        return { mesh: topLine, material };
      });

      cutRigs.push({ x, line, lineMaterial, cutter, topLines });
    }
  }

  function addTween(duration, update, options = {}) {
    const tween = {
      start: performance.now() + (options.delay || 0) * 1000,
      duration: Math.max(1, duration * 1000),
      update,
      ease: options.ease || easeOutCubic,
      complete: options.complete,
    };
    tweens.add(tween);
    return tween;
  }

  function clearTweens() {
    tweens.clear();
  }

  function tick(now) {
    if (disposed) return;
    if (!document.hidden && container.offsetParent !== null) {
      for (const tween of Array.from(tweens)) {
        if (now < tween.start) continue;
        const raw = clamp01((now - tween.start) / tween.duration);
        tween.update(tween.ease(raw));
        if (raw >= 1) {
          tweens.delete(tween);
          tween.complete?.();
        }
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  /* ---------- 7 块主体板 ---------- */

  function panelAway(item) {
    const name = item.name;
    const offset = new THREE.Vector3();
    const rotation = new THREE.Euler();
    if (name.includes("左侧板") || name.includes("左侧面")) {
      offset.set(-W * 0.45, H * 0.1, D * 0.08);
      rotation.set(0, 0.34, 0.07);
    } else if (name.includes("右侧板") || name.includes("右侧面")) {
      offset.set(W * 0.45, H * 0.1, D * 0.08);
      rotation.set(0, -0.34, -0.07);
    } else if (name.includes("顶板")) {
      offset.set(0, H * 0.28, D * 0.1);
      rotation.set(0.2, 0, 0);
    } else {
      offset.set(0, H * 0.22, D * 0.38);
      rotation.set(-0.2, 0, 0);
    }
    return { offset, rotation };
  }

  function resetBase() {
    for (const item of baseItems) {
      const away = panelAway(item);
      item.away.copy(item.home).add(away.offset);
      item.awayRotation.copy(away.rotation);
      item.group.position.copy(item.away);
      item.group.rotation.copy(item.awayRotation);
      item.group.visible = true;
    }
    for (const item of shimItems) {
      item.group.position.copy(item.home);
      item.group.rotation.set(0, 0, 0);
      item.group.visible = false;
    }
  }

  function snapBase() {
    for (const item of baseItems) {
      item.group.position.copy(item.home);
      item.group.rotation.set(0, 0, 0);
      item.group.visible = true;
    }
    for (const item of shimItems) {
      item.group.position.copy(item.home);
      item.group.rotation.set(0, 0, 0);
      item.group.visible = true;
    }
  }

  function baseItem(name) {
    return baseItems.find((item) => item.name === name) || null;
  }

  // 统一的总览视角：稍微向右平移，让模型的投影轮廓落在画面正中。
  function installOverview() {
    return preview.overviewView();
  }

  function snapOverview() {
    const view = installOverview();
    if (view) preview.cameraTo(view.position, view.target, 0);
  }

  // 延迟执行（用于和相机动画对齐）
  function at(delay, fn) {
    addTween(0.001, fn, { delay, ease: (t) => t });
  }

  function playBase() {
    if (reducedMotion.matches) {
      snapBase();
      snapOverview();
      revealCurveAsBase(true);
      return;
    }

    const lowerL = baseItem("下横左侧板·左侧面");
    const lowerR = baseItem("下横右侧板·右侧面");
    const lowerFront = baseItem("下横前挡板·正面");
    const lowerTop = baseItem("下横顶板·顶面");
    const upperL = baseItem("烟道左侧板·左侧面");
    const upperR = baseItem("烟道右侧板·右侧面");
    const upperFront = baseItem("烟道前挡板·正面");

    for (const item of baseItems) {
      item.group.visible = false;
      item.group.position.copy(item.home);
      item.group.rotation.set(0, 0, 0);
    }
    for (const item of shimItems) {
      item.group.visible = false;
      item.group.position.copy(item.home);
      item.group.rotation.set(0, 0, 0);
    }

    const move = (item, from, to, delay, duration, tilt = 0) => {
      if (!item) return;
      at(delay, () => {
        item.group.visible = true;
        item.group.position.copy(from);
        item.group.rotation.set(tilt, 0, 0);
        addTween(duration, (t) => {
          item.group.position.lerpVectors(from, to, t);
          item.group.rotation.x = tilt * (1 - t);
        }, { ease: easeInOutCubic });
      });
    };

    const dir = (x, y, z) => new THREE.Vector3(x, y, z).normalize();
    const centerZ = (modelBox.min.z + modelBox.max.z) * 0.5;
    const lift = new THREE.Vector3(0, H * 0.15, 0);
    const overview = installOverview();

    // 观察点都保留下横 / 顶板 / 上竖的完整宽度，避免镜头里只剩一块板的局部
    const lowerTarget = new THREE.Vector3(0, modelBox.min.y + H * 0.34, centerZ);
    const lowerPos = lowerTarget.clone().addScaledVector(dir(0.6, 0.24, 1), H * 2.95);
    const lowerPos2 = lowerTarget.clone().addScaledVector(dir(0.42, 0.3, 1), H * 2.95);

    const plateTarget = new THREE.Vector3(0, modelBox.min.y + H * 0.34, centerZ - D * 0.02);
    const platePos = plateTarget.clone().addScaledVector(dir(0.45, 0.5, 1), H * 2.8);
    const platePos2 = plateTarget.clone().addScaledVector(dir(0.32, 0.55, 1), H * 2.8);

    const upperTarget = new THREE.Vector3(0, modelBox.min.y + H * 0.7, centerZ);
    const upperPos = upperTarget.clone().addScaledVector(dir(0.55, 0.24, 1), H * 2.2);
    const upperPos2 = upperTarget.clone().addScaledVector(dir(0.42, 0.3, 1), H * 2.2);
    const upperPos3 = upperTarget.clone().addScaledVector(dir(0.32, 0.38, 1), H * 2.2);

    if (overview && !compact) {
      // 一镜到底：镜头一直在动；只在观察点附近缓慢漂移，板材在这段时间里拼装
      preview.cameraPath([
        { time: 0, position: overview.position, target: overview.target },
        { time: 0.9, position: lowerPos, target: lowerTarget },
        { time: 2.1, position: lowerPos2, target: lowerTarget },
        { time: 3.4, position: platePos, target: plateTarget },
        { time: 4.5, position: platePos2, target: plateTarget },
        { time: 5.0, position: upperPos, target: upperTarget },
        { time: 5.8, position: upperPos2, target: upperTarget },
        { time: 6.4, position: upperPos3, target: upperTarget },
        { time: 7.8, position: overview.position, target: overview.target },
      ], 7800);
    }

    // 1. 总览：下方左右侧板先立好（从内侧滑入，避免一开场就冲出画面）
    move(lowerL, lowerL.home.clone().add(new THREE.Vector3(-W * 0.08, 0, 0)), lowerL.home.clone(), 0.3, 0.6);
    move(lowerR, lowerR.home.clone().add(new THREE.Vector3(W * 0.08, 0, 0)), lowerR.home.clone(), 0.3, 0.6);

    // 1.1 有垫高时，左右两侧作为同一个部件一起贴到内侧面
    shimItems.forEach((item) => {
      const side = item.name.includes("左") ? -1 : 1;
      const from = item.home.clone().add(new THREE.Vector3(side * W * 0.012, H * 0.03, D * 0.16));
      move(item, from, item.home.clone(), 1.0, 0.9, 0.02);
    });

    // 2. 垫高贴好后，顶板从上往下压住
    move(lowerTop, lowerTop.home.clone().add(new THREE.Vector3(0, H * 0.26, 0)), lowerTop.home.clone(), 2.1, 0.8, 0.05);

    // 3. 顶板到位后，主正面板从前往后盖上
    move(
      lowerFront,
      lowerFront.home.clone().add(new THREE.Vector3(0, 0, D * 0.28)),
      lowerFront.home.clone(),
      3.4, 0.9, -0.04
    );

    // 4. 上竖：左右侧板先立起，再上正面板
    const upperLHome = upperL.home.clone().add(lift);
    const upperRHome = upperR.home.clone().add(lift);
    const upperFHome = upperFront.home.clone().add(lift);
    move(upperL, upperLHome.clone().add(new THREE.Vector3(-W * 0.08, 0, 0)), upperLHome, 5.0, 0.55);
    move(upperR, upperRHome.clone().add(new THREE.Vector3(W * 0.08, 0, 0)), upperRHome, 5.0, 0.55);
    move(
      upperFront,
      upperFHome.clone().add(new THREE.Vector3(0, 0, D * 0.28)),
      upperFHome,
      5.55, 0.6, -0.04
    );

    // 5. 上竖整体落到顶板上
    move(upperL, upperLHome.clone(), upperL.home.clone(), 6.3, 0.85);
    move(upperR, upperRHome.clone(), upperR.home.clone(), 6.3, 0.85);
    move(upperFront, upperFHome.clone(), upperFront.home.clone(), 6.3, 0.85);

    if (!hasCurve()) {
      addTween(0.01, () => revealCurveAsBase(false), { delay: 7.5 });
    }
  }

  /* ---------- 3 块曲面装饰 ---------- */

  function hasCurve() {
    return curveItems.length > 0 && initialState.surfaceType !== "flat";
  }

  function curveAway(item) {
    const index = curveItems.indexOf(item);
    const offset = new THREE.Vector3(0, H * 0.17, D * 0.22);
    const rotation = new THREE.Euler(-0.06, 0, 0);
    if (index === 1) {
      offset.set(-W * 0.24, H * 0.17, 0);
      rotation.set(0, 0.14, 0);
    } else if (index === 2) {
      offset.set(W * 0.24, H * 0.17, 0);
      rotation.set(0, -0.14, 0);
    }
    return { offset, rotation };
  }

  function hideCurve() {
    for (const item of curveItems) item.group.visible = false;
  }

  function snapCurve() {
    for (const item of curveItems) {
      item.group.position.copy(item.home);
      item.group.rotation.set(0, 0, 0);
      item.group.visible = true;
    }
  }

  function revealCurveAsBase(instant) {
    if (hasCurve()) return;
    for (const item of curveItems) {
      const away = item.home.clone().add(new THREE.Vector3(0, H * 0.12, 0));
      item.group.visible = true;
      if (instant || reducedMotion.matches) {
        item.group.position.copy(item.home);
        item.group.rotation.set(0, 0, 0);
      } else {
        item.group.position.copy(away);
        const from = away.clone();
        const to = item.home.clone();
        addTween(0.44, (t) => {
          item.group.position.lerpVectors(from, to, t);
        }, { ease: easeOutCubic });
      }
    }
  }

  function playCurve() {
    if (!hasCurve() || reducedMotion.matches) {
      revealCurveAsBase(true);
      return;
    }
    hideCurve();
    curveItems.forEach((item, index) => {
      const away = curveAway(item);
      item.group.visible = true;
      item.group.position.copy(item.home).add(away.offset);
      item.group.rotation.copy(away.rotation);
      const fromPosition = item.group.position.clone();
      const toPosition = item.home.clone();
      const fromRotation = away.rotation.clone();
      addTween(0.72, (t) => {
        item.group.position.lerpVectors(fromPosition, toPosition, t);
        item.group.rotation.set(
          fromRotation.x * (1 - t),
          fromRotation.y * (1 - t),
          fromRotation.z * (1 - t)
        );
      }, { delay: index * 0.11, ease: easeOutQuint });
    });
  }

  /* ---------- 装饰条 ---------- */

  function resetProxyPiece(piece) {
    piece.mesh.position.set(piece.rawX, 0, 0);
    piece.mesh.rotation.set(0, 0, 0);
    piece.mesh.scale.set(1, 1, 1);
    piece.mesh.visible = true;
  }

  function hideProxy() {
    for (const strip of proxyStrips) {
      strip.group.visible = false;
      strip.group.position.set(0, strip.rawY, rawZ);
      for (const piece of strip.pieces) resetProxyPiece(piece);
    }
    for (const rig of cutRigs) {
      rig.line.visible = false;
      rig.lineMaterial.opacity = 0;
      rig.cutter.visible = false;
      rig.cutter.position.y = rawCenterY + cutStackHeight / 2 + 36;
      for (const topLine of rig.topLines || []) {
        topLine.mesh.visible = false;
        topLine.material.opacity = 0;
      }
    }
  }

  function hideTrim() {
    hideProxy();
    for (const item of trimItems) {
      item.group.position.copy(item.home);
      item.group.rotation.set(0, 0, 0);
      item.group.scale.set(1, 1, 1);
      item.group.visible = false;
    }
  }

  function snapTrim() {
    preview.setModelOpacity(1);
    hideProxy();
    for (const item of trimItems) {
      item.group.position.copy(item.home);
      item.group.rotation.set(0, 0, 0);
      item.group.scale.set(1, 1, 1);
      item.group.visible = true;
    }
  }

  function pieceTarget(strip, piece) {
    const item = strip.item;
    const baseY = item.home.y - item.size.y / 2;
    // 用整段宽度/深度，让中间段的两个 45° 端正好碰到两侧的 45° 端。
    const frontLength = Math.max(item.size.x, 40);
    const sideLength = Math.max(item.size.z, 40);
    const sideX = item.size.x / 2;
    const midZ = item.home.z;
    let targetPos;
    let targetRot;
    let targetLength;

    if (piece.kind === "front") {
      targetPos = new THREE.Vector3(0, baseY, frontZ - 2);
      targetRot = new THREE.Euler(0, 0, 0);
      targetLength = frontLength;
    } else {
      const sign = piece.kind === "left" ? -1 : 1;
      targetPos = new THREE.Vector3(sign * sideX, baseY, midZ);
      targetRot = new THREE.Euler(0, sign * Math.PI / 2, 0);
      targetLength = sideLength;
    }

    return {
      localTarget: targetPos.clone().sub(strip.group.position),
      targetRot,
      scaleX: targetLength / piece.length,
    };
  }

  function playTrim() {
    if (reducedMotion.matches) {
      snapTrim();
      preview.setModelOpacity(1);
      snapOverview();
      return;
    }
    hideTrim();
    // 罩体保持可见：装饰条在它前面裁切、再直接贴回去，避免悬空。
    const overview = installOverview();
    const cutTarget = new THREE.Vector3(0, rawCenterY, rawZ);
    const cutPos = cutTarget.clone().addScaledVector(new THREE.Vector3(0, 0.03, 1).normalize(), H * 1.95);
    const cutPos2 = cutTarget.clone().addScaledVector(new THREE.Vector3(0.2, 0.07, 1).normalize(), H * 1.85);
    if (overview && !compact) {
      preview.cameraPath([
        { time: 0, position: overview.position, target: overview.target },
        { time: 1.5, position: cutPos, target: cutTarget },
        { time: 2.7, position: cutPos2, target: cutTarget },
        { time: 3.6, position: cutPos2, target: cutTarget },
        { time: 5.4, position: overview.position, target: overview.target },
      ], 5400);
    }
    if (!proxyStrips.length || !proxyRoot) {
      // 兜底：没有生成裁切演示时，直接让装饰条贴上去。
      trimItems.forEach((item, index) => {
        const offset = new THREE.Vector3(0, H * 0.035, D * 0.5);
        item.group.visible = true;
        item.group.position.copy(item.home).add(offset);
        item.group.rotation.set(-0.06, 0, 0);
        const fromPosition = item.group.position.clone();
        const toPosition = item.home.clone();
        addTween(0.56, (t) => {
          item.group.position.lerpVectors(fromPosition, toPosition, t);
          item.group.rotation.x = lerp(-0.06, 0, t);
        }, { delay: index * 0.12, ease: easeOutCubic });
      });
      return;
    }

    // 1. 4 根长条从右侧进入工作区
    const startX = W * 0.52;
    proxyStrips.forEach((strip, index) => {
      strip.group.visible = true;
      strip.group.position.set(startX, strip.rawY, rawZ);
      for (const piece of strip.pieces) resetProxyPiece(piece);
      addTween(0.82, (t) => {
        strip.group.position.x = lerp(startX, 0, t);
      }, { delay: 0.15 + index * 0.05, ease: easeOutCubic });
    });

    // 2. 两刀 45° 海棠角，切完让左右两端分开
    const runCut = (rig, startTime, side) => {
      if (!rig) return;
      addTween(0.01, () => {
        rig.line.visible = true;
        rig.cutter.visible = true;
        rig.lineMaterial.opacity = 0;
        rig.cutter.position.y = rawCenterY + cutStackHeight / 2 + 40;
        for (const topLine of rig.topLines || []) {
          topLine.mesh.visible = true;
          topLine.material.opacity = 0;
        }
      }, { delay: startTime });

      addTween(0.18, (t) => {
        rig.lineMaterial.opacity = t * 0.9;
        for (const topLine of rig.topLines || []) topLine.material.opacity = t * 0.9;
      }, { delay: startTime });

      addTween(0.62, (t) => {
        rig.cutter.position.y = lerp(
          rawCenterY + cutStackHeight / 2 + 40,
          rawCenterY - cutStackHeight / 2 - 40,
          t
        );
      }, { delay: startTime + 0.08, ease: easeInOutCubic });

      addTween(0.26, (t) => {
        rig.lineMaterial.opacity = 0.9 * (1 - t);
        for (const topLine of rig.topLines || []) topLine.material.opacity = 0.9 * (1 - t);
      }, { delay: startTime + 0.58 });

      addTween(0.01, () => {
        rig.line.visible = false;
        rig.cutter.visible = false;
        for (const topLine of rig.topLines || []) topLine.mesh.visible = false;
      }, { delay: startTime + 0.9 });

      const sign = side === "left" ? -1 : 1;
      proxyStrips.forEach((strip) => {
        const piece = side === "left" ? strip.pieces[0] : strip.pieces[2];
        addTween(0.42, (t) => {
          piece.mesh.position.x = piece.rawX + sign * 26 * t;
        }, { delay: startTime + 0.26, ease: easeOutCubic });
      });
    };

    runCut(cutRigs[0], 1.55, "left");
    runCut(cutRigs[1], 2.3, "right");

    // 3. 12 段切好的短条直接飞回罩体，到点后瞬时变成正式装饰条（不淡出）
    const flightStart = 3.1;
    const flightDuration = 1.1;

    proxyStrips.forEach((strip, index) => {
      const item = strip.item;
      const stripDelay = flightStart + index * 0.09;

      strip.pieces.forEach((piece, pieceIndex) => {
        const target = pieceTarget(strip, piece);
        const fromPos = piece.mesh.position.clone();
        const fromQuat = piece.mesh.quaternion.clone();
        const toQuat = new THREE.Quaternion().setFromEuler(target.targetRot);
        const delay = stripDelay + pieceIndex * 0.04;

        addTween(flightDuration, (t) => {
          piece.mesh.position.lerpVectors(fromPos, target.localTarget, t);
          piece.mesh.quaternion.copy(fromQuat).slerp(toQuat, t);
          const thickness = lerp(1, 1 / PROXY_SCALE, Math.min(1, t * 1.4));
          piece.mesh.scale.set(target.scaleX, thickness, thickness);
        }, {
          delay,
          ease: easeInOutCubic,
          complete: () => {
            piece.mesh.visible = false;
          },
        });
      });

      addTween(0.001, () => {
        item.group.visible = true;
        item.group.scale.set(1, 1, 1);
      }, { delay: stripDelay + flightDuration + 0.14 });
    });
  }

  /* ---------- 刷漆 ---------- */

  function buildPaintEffects() {
    const random = (() => {
      let seed = 11;
      return () => {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    })();

    mistMaterial = new THREE.MeshBasicMaterial({
      map: makeMistTexture(),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    mistPlane = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.36, H * 1.18), mistMaterial);
    mistPlane.position.set(modelBox.min.x, modelCenter.y, frontZ + 34);
    mistPlane.visible = false;
    mistPlane.renderOrder = 20;
    model.add(mistPlane);

    const count = 66;
    sprayPositions = new Float32Array(count * 3);
    for (let index = 0; index < count; index++) {
      spraySeeds.push({
        x: random() * 2 - 1,
        y: modelBox.min.y + H * (0.04 + random() * 0.92),
        z: random() * 52,
        phase: random() * Math.PI * 2,
        speed: 0.6 + random() * 0.9,
      });
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(sprayPositions, 3));
    sprayMaterial = new THREE.PointsMaterial({
      color: 0xfff4de,
      size: Math.max(2, Math.min(W, H) * 0.012),
      map: makeSoftCircleTexture(),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      toneMapped: false,
    });
    sprayPoints = new THREE.Points(geometry, sprayMaterial);
    sprayPoints.visible = false;
    sprayPoints.frustumCulled = false;
    sprayPoints.renderOrder = 21;
    model.add(sprayPoints);
  }

  function setPaint(amount) {
    const progress = clamp01(amount);
    tempShell.copy(baseShell).lerp(paintShell, progress);
    tempTrim.copy(baseTrim).lerp(paintTrim, progress);
    preview.setModelColors({
      shell: `#${tempShell.getHexString()}`,
      trim: `#${tempTrim.getHexString()}`,
    });
    if (materials.shellMat) materials.shellMat.roughness = lerp(0.68, 0.52, progress);
    if (materials.transitionMat) materials.transitionMat.roughness = lerp(0.68, 0.52, progress);
    if (materials.trimMat) materials.trimMat.roughness = lerp(0.62, 0.52, progress);
    if (proxyTrimMat) {
      proxyTrimMat.color.copy(tempTrim);
      proxyTrimMat.roughness = lerp(0.62, 0.52, progress);
    }
  }

  function updateSpray(progress, now) {
    if (!sprayPoints) return;
    const frontX = modelBox.min.x - W * 0.08 + progress * (W * 1.16);
    const seconds = now * 0.001;
    for (let index = 0; index < spraySeeds.length; index++) {
      const seed = spraySeeds[index];
      const offset = index * 3;
      sprayPositions[offset] = frontX + seed.x * W * 0.12 + Math.sin(seconds * 1.8 * seed.speed + seed.phase) * W * 0.02;
      sprayPositions[offset + 1] = seed.y + Math.sin(seconds * 1.3 * seed.speed + seed.phase) * H * 0.02;
      sprayPositions[offset + 2] = frontZ + 22 + seed.z;
    }
    sprayPoints.geometry.attributes.position.needsUpdate = true;
    const envelope = Math.sin(Math.PI * progress);
    sprayMaterial.opacity = envelope * 0.55;
    mistMaterial.opacity = envelope * 0.28;
    mistPlane.position.x = frontX;
  }

  function resetPaint() {
    clearTweens();
    setPaint(0);
    if (sprayPoints) sprayPoints.visible = false;
    if (mistPlane) mistPlane.visible = false;
    if (sprayMaterial) sprayMaterial.opacity = 0;
    if (mistMaterial) mistMaterial.opacity = 0;
  }

  function snapPaint() {
    resetPaint();
    setPaint(1);
  }

  function playPaint() {
    resetPaint();
    if (reducedMotion.matches) {
      snapPaint();
      return;
    }
    if (sprayPoints) sprayPoints.visible = true;
    if (mistPlane) mistPlane.visible = true;

    const runPass = (delay, from, to) => {
      addTween(1.15, (t) => {
        setPaint(lerp(from, to, t));
        updateSpray(t, performance.now());
      }, {
        delay,
        ease: easeInOutCubic,
        complete: () => {
          setPaint(to);
          if (sprayMaterial) sprayMaterial.opacity = 0;
          if (mistMaterial) mistMaterial.opacity = 0;
        },
      });
    };
    runPass(0.08, 0, 0.55);
    runPass(1.52, 0.55, 1);
  }

  /* ---------- 步骤切换 ---------- */

  function ensureBase() {
    snapBase();
    if (hasCurve()) snapCurve();
    else revealCurveAsBase(true);
  }

  function setPhase(phase, options = {}) {
    const animate = options.animate !== false;
    const key = ["base", "curve", "trim", "paint"].includes(phase) ? phase : "base";
    clearTweens();
    // 切换步骤时收掉上一段可能没走完的淡入淡出和镜头路径。
    preview.setModelOpacity(1);
    snapOverview();

    if (key === "base") {
      resetPaint();
      hideCurve();
      hideTrim();
      if (animate) playBase();
      else {
        snapBase();
        snapOverview();
        if (!hasCurve()) revealCurveAsBase(true);
      }
      return;
    }

    snapOverview();
    ensureBase();
    if (!hasCurve()) revealCurveAsBase(true);

    if (key === "curve") {
      hideTrim();
      resetPaint();
      if (animate) playCurve();
      else snapCurve();
      return;
    }

    snapCurve();

    if (key === "trim") {
      resetPaint();
      if (animate) playTrim();
      else snapTrim();
      return;
    }

    snapTrim();
    if (animate) playPaint();
    else snapPaint();
  }

  function dispose() {
    disposed = true;
    cancelAnimationFrame(rafId);
    clearTweens();
    mistMaterial?.map?.dispose();
    sprayMaterial?.map?.dispose();
    preview.dispose();
    if (proxyRoot) {
      scene?.remove(proxyRoot);
      proxyRoot.traverse((object) => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose?.());
        else object.material?.dispose?.();
      });
      proxyRoot = null;
    }
  }

  buildInstallGroups();
  buildTrimCutScene();
  buildPaintEffects();
  setPaint(0);
  setPhase("base", { animate: false });
  rafId = requestAnimationFrame(tick);

  return {
    setPhase,
    setStep: setPhase,
    dispose,
  };
}
