/* 烟罩实验室 H5
 * 所有价格、微信号、收款码和后台地址都集中在 CONFIG，改这里即可。
 */
const CONFIG = {
  basePrice: 700,
  trimPrices: { none: 0, single: 30, double: 50, corner: 40 },
  wechatId: "Jonathan_Ge",
  qrImage: "assets/pay-qr.jpg",
  serviceQrImage: "assets/service-qr.jpg",
  orderEndpoint: location.hostname.endsWith("github.io")
    ? "https://yyj-h5-d5gaovp196680d93f-1258663924.ap-shanghai.app.tcloudbase.com/api/orders"
    : "/api/orders",
};

const STYLES = [
  {
    id: "cloud", name: "云朵弧", tone: "暖米", desc: "钟形弧线 · 双层收边",
    curve: "concave", start: "middle",
    dims: { hoodWidth: 1000, hoodDepth: 510, rearHeight: 390, frontHeight: 260, chimneyWidth: 400, chimneyDepth: 320, chimneyHeight: 760 },
    trims: { top: "corner", start: "double", hoodTop: "corner", hoodBottom: "single" },
    notch: { shape: "arch", width: 300, height: 60, offset: 0 },
  },
  {
    id: "tall", name: "高窄弧", tone: "暖米", desc: "窄身长弧 · 顶部起弧",
    curve: "concave", start: "top",
    dims: { hoodWidth: 780, hoodDepth: 470, rearHeight: 470, frontHeight: 300, chimneyWidth: 260, chimneyDepth: 280, chimneyHeight: 980 },
    trims: { top: "corner", start: "none", hoodTop: "single", hoodBottom: "single" },
    notch: { shape: "arch", width: 320, height: 70, offset: 0 },
  },
  {
    id: "line", name: "直边塔", tone: "暖米", desc: "直边收分 · 单线压顶",
    curve: "flat", start: "middle",
    dims: { hoodWidth: 920, hoodDepth: 500, rearHeight: 410, frontHeight: 260, chimneyWidth: 360, chimneyDepth: 310, chimneyHeight: 660 },
    trims: { top: "corner", start: "single", hoodTop: "single", hoodBottom: "single" },
    notch: { shape: "arch", width: 360, height: 60, offset: 0 },
  },
  {
    id: "arch", name: "圆顶拱", tone: "暖米", desc: "圆顶外凸 · 大弧口",
    curve: "convex", start: "lowest",
    dims: { hoodWidth: 1080, hoodDepth: 530, rearHeight: 380, frontHeight: 280, chimneyWidth: 440, chimneyDepth: 340, chimneyHeight: 420 },
    trims: { top: "none", start: "none", hoodTop: "single", hoodBottom: "single" },
    notch: { shape: "arch", width: 600, height: 150, offset: 0 },
  },
  {
    id: "crown", name: "宽方冠", tone: "暖米", desc: "宽肩方冠 · 台阶压顶",
    curve: "flat", start: "middle",
    dims: { hoodWidth: 1060, hoodDepth: 520, rearHeight: 360, frontHeight: 240, chimneyWidth: 600, chimneyDepth: 400, chimneyHeight: 560 },
    trims: { top: "single", start: "none", hoodTop: "corner", hoodBottom: "single" },
    notch: { shape: "arch", width: 520, height: 150, offset: 0 },
  },
  {
    id: "float", name: "极简方盒", tone: "暖米", desc: "无侧面 · 干净直边",
    curve: "none", start: "middle",
    dims: { hoodWidth: 1080, hoodDepth: 520, rearHeight: 320, frontHeight: 220, chimneyWidth: 600, chimneyDepth: 390, chimneyHeight: 580 },
    trims: { top: "none", start: "none", hoodTop: "single", hoodBottom: "single" },
    notch: { enabled: false, shape: "rect", width: 260, height: 50, offset: 90 },
  },
];

// 首页案例：大图先用原来的 3D 渲染占位，之后换成 AI 实景图。
// model 是右下角「3D 模型」小图；这里指向带独立豁口/比例的新模型。
const HOME_CASES = [
  { styleId: "cloud", name: "云朵弧", image: "assets/styles/cloud.png", model: "assets/models/cloud.png", fit: "contain" },
  { styleId: "tall", name: "高窄弧", image: "assets/styles/tall.png", model: "assets/models/tall.png", fit: "contain" },
  { styleId: "line", name: "直边塔", image: "assets/styles/line.png", model: "assets/models/line.png", fit: "contain" },
  { styleId: "arch", name: "圆顶拱", image: "assets/styles/arch.png", model: "assets/models/arch.png", fit: "contain" },
  { styleId: "crown", name: "宽方冠", image: "assets/styles/crown.png", model: "assets/models/crown.png", fit: "contain" },
  { styleId: "float", name: "极简方盒", image: "assets/styles/float.png", model: "assets/models/float.png", fit: "contain" },
];
// 3D 小图的全局兜底；每个案例自己的 model 优先。
let HOME_3D_IMAGE = "";

/* 线上可替换的内容：content.json 不存在或加载失败时，保留上面的默认值。 */
async function loadSiteContent() {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 1500);
    const response = await fetch(`content.json?v=${Date.now()}`, { cache: "no-store", signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) return;
    const data = await response.json();
    if (data && data.wechatId) CONFIG.wechatId = String(data.wechatId);
    if (data && data.qrImage) CONFIG.qrImage = String(data.qrImage);
    if (data && data.serviceQrImage) CONFIG.serviceQrImage = String(data.serviceQrImage);
    if (data && Number.isFinite(Number(data.basePrice))) CONFIG.basePrice = Number(data.basePrice);
    if (data && data.trimPrices && typeof data.trimPrices === "object") {
      Object.keys(CONFIG.trimPrices).forEach((key) => {
        if (Number.isFinite(Number(data.trimPrices[key]))) CONFIG.trimPrices[key] = Number(data.trimPrices[key]);
      });
    }
    if (data && Array.isArray(data.cases) && data.cases.length) {
      const cases = data.cases
        .filter((item) => item && item.styleId && item.image)
        .map((item) => ({
          styleId: String(item.styleId),
          name: String(item.name || ""),
          image: String(item.image),
          model: item.model ? String(item.model) : "",
          fit: item.fit === "cover" ? "cover" : "contain",
        }));
      if (cases.length) {
        HOME_CASES.length = 0;
        HOME_CASES.push(...cases);
      }
    }
    if (data && data.home3dImage) HOME_3D_IMAGE = String(data.home3dImage);
  } catch { /* 使用内置默认内容 */ }
}

const TRIMS = [
  { id: "none", name: "无装饰条", desc: "干净利落", price: 0 },
  { id: "single", name: "单眼皮", desc: "半圆细边", price: 30 },
  { id: "double", name: "双眼皮", desc: "双线层次", price: 50 },
  { id: "corner", name: "顶角条", desc: "直角收边", price: 40 },
];

const TRIM_POSITIONS = [
  { key: "top", name: "烟道顶部", hint: "烟道最上方一圈" },
  { key: "start", name: "曲面起点", hint: "上竖与曲面的接缝" },
  { key: "hoodTop", name: "下横顶边", hint: "下横上沿" },
  { key: "hoodBottom", name: "下横底边", hint: "下横下沿" },
];

const DIMS = {
  chimneyWidth: { label: "烟道宽", hint: "左右各留 5mm", min: 220, max: 600, step: 10 },
  chimneyDepth: { label: "烟道深", hint: "从墙到前外沿", min: 180, max: 500, step: 10 },
  chimneyHeight: { label: "上竖高", hint: "下横以上", min: 300, max: 1000, step: 10 },
  hoodWidth: { label: "烟机宽", hint: "量最外沿", min: 600, max: 1100, step: 10 },
  hoodDepth: { label: "烟机深", hint: "从墙到最外沿", min: 350, max: 650, step: 10 },
  rearHeight: { label: "靠墙侧高", hint: "贴墙那一侧", min: 220, max: 520, step: 10 },
  frontHeight: { label: "前侧高", hint: "朝外这一侧", min: 120, max: 520, step: 10 },
  notchWidth: { label: "开口宽", hint: "豁口左右宽度", min: 120, max: 620, step: 10 },
  notchHeight: { label: "开口高", hint: "从底边往上", min: 30, max: 220, step: 10 },
};

const NOTCH_SHAPES = [
  { id: "rect", label: "矩形" },
  { id: "rounded", label: "圆角矩形" },
  { id: "arch", label: "圆弧" },
  { id: "trapezoid", label: "梯形" },
];

// 每个尺寸项对应的相机视角（preview.js 里的 viewPreset）
const DIM_VIEW = {
  chimneyWidth: "front",
  chimneyDepth: "side",
  chimneyHeight: "chimneyHeight",
  hoodWidth: "hoodWidth",
  hoodDepth: "hoodDepth",
  rearHeight: "rearHeight",
  frontHeight: "frontHeight",
  notchWidth: "notch",
  notchHeight: "notch",
};

const DEFAULTS = {
  styleId: "cloud",
  hoodWidth: 800, hoodDepth: 450, rearHeight: 380, frontHeight: 240,
  chimneyWidth: 320, chimneyDepth: 280, chimneyHeight: 500,
  shimHeight: 0, surfaceType: "concave", surfaceStart: "middle",
  notchEnabled: true, notchShape: "arch", notchWidth: 420, notchHeight: 80, notchOffset: 0,
  trimStyles: { top: "corner", start: "double", hoodTop: "single", hoodBottom: "single" },
};

const CURVES = [
  { id: "concave", label: "向内弯曲" },
  { id: "convex", label: "向外弯曲" },
  { id: "flat", label: "不弯曲" },
  { id: "none", label: "无侧面" },
];

function allowedStarts(type) {
  if (type === "none") {
    return [{ id: "middle", label: "中间" }];
  }
  if (type === "convex") {
    return [{ id: "lower", label: "中间偏下" }, { id: "lowest", label: "中间更偏下" }];
  }
  if (type === "flat") {
    return [{ id: "middle", label: "中间" }, { id: "top", label: "顶部" }];
  }
  return [{ id: "middle", label: "中间" }, { id: "top", label: "上面" }];
}

function startLabelFor(type = state.surfaceType, value = state.surfaceStart) {
  if (value === "lowest") return "中间更偏下";
  if (value === "lower") return "中间偏下";
  if (value === "top") return type === "flat" ? "顶部" : "上面";
  return "中间";
}

const STORAGE = {
  customer: "yyj_customer",
  orders: "yyj_orders",
  pending: "yyj_pending_orders",
  lastOrder: "yyj_last_order",
  pendingOrder: "yyj_pending_order",
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const fmt = (value) => `¥${Number(value).toLocaleString("zh-CN")}`;
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeStored(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}
function removeStored(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

let artSeq = 0;
function shade(hex, percent) {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  const target = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const to = (channel) => Math.round((target - channel) * p + channel).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

const CURVE_CONTROLS = {
  concave: { l1: [132, 140], l2: [86, 150], r1: [234, 150], r2: [188, 140] },
  convex: { l1: [116, 124], l2: [52, 136], r1: [268, 136], r2: [204, 124] },
};

function hoodArt(style, { transparent = false } = {}) {
  const uid = `hood${++artSeq}`;
  const color = style.color;
  const bg = style.bg;
  const light = shade(color, 14);
  const dark = shade(color, -10);
  const edge = shade(color, -25);
  const gold = "#d8be9e";
  const controls = CURVE_CONTROLS[style.curve];
  let frontTransition;
  let sideTransition;
  if (style.curve === "flat") {
    frontTransition = "M132 112 L52 150 H268 L188 112 Z";
    sideTransition = "M188 112 L268 150 L288 142 L204 103 Z";
  } else {
    const { l1, l2, r1, r2 } = controls;
    frontTransition = `M132 112 C${l1[0]} ${l1[1]} ${l2[0]} ${l2[1]} 52 150 H268 C${r1[0]} ${r1[1]} ${r2[0]} ${r2[1]} 188 112 Z`;
    sideTransition = `M188 112 C${r2[0]} ${r2[1]} ${r1[0]} ${r1[1]} 268 150 L288 142 C${r1[0] - 18} ${r1[1] - 8} ${r2[0] + 8} ${r2[1] - 8} 204 103 Z`;
  }

  const edges = [
    "M132 38 H188 L204 31",
    "M132 112 H188",
    "M52 150 H268 L288 142",
    "M52 196 H268 L288 188",
  ];
  let trims = "";
  if (style.trim === "single" || style.trim === "corner") {
    const width = style.trim === "corner" ? 6 : 4;
    trims = edges.map((d) => `<path d="${d}" fill="none" stroke="${gold}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
    if (style.trim === "corner") {
      trims += edges.map((d) => `<path d="${d}" fill="none" stroke="#c9b08d" stroke-width="1.3" opacity=".3"/>`).join("");
    }
  } else if (style.trim === "double") {
    trims = edges.map((d) => `<path d="${d}" fill="none" stroke="${gold}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
    trims += edges.map((d) => `<path d="${d}" transform="translate(0 5)" fill="none" stroke="${gold}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
  }

  return `<svg viewBox="0 0 320 240" role="img" aria-label="${esc(style.name)}${esc(style.tone)}烟机罩示意">
    <defs>
      <linearGradient id="${uid}bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${shade(bg, 10)}"/><stop offset="1" stop-color="${bg}"/>
      </linearGradient>
      <linearGradient id="${uid}p" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${light}"/><stop offset=".58" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/>
      </linearGradient>
      <linearGradient id="${uid}s" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${dark}"/><stop offset="1" stop-color="${shade(color, -18)}"/>
      </linearGradient>
      <filter id="${uid}sh" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#7a6248" flood-opacity=".14"/>
      </filter>
    </defs>
    ${transparent ? "" : `<rect width="320" height="240" fill="url(#${uid}bg)"/>
    <path d="M0 201h320" stroke="${edge}" stroke-width="1" opacity=".18"/>
    <path d="M0 58h320" stroke="#fff" stroke-width="1" opacity=".35"/>`}
    <ellipse cx="164" cy="211" rx="104" ry="11" fill="#7a5f3e" opacity=".1"/>
    <g filter="url(#${uid}sh)">
      <path d="M52 150 72 142h216l-20 8Z" fill="${dark}" stroke="${edge}" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M268 150l20-8v38l-20 8Z" fill="url(#${uid}s)" stroke="${edge}" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M132 38 148 31h56l-16 7Z" fill="${dark}" stroke="${edge}" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M188 38l16-7v72l-16 9Z" fill="url(#${uid}s)" stroke="${edge}" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M132 38h56v74h-56Z" fill="url(#${uid}p)" stroke="${edge}" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="${frontTransition}" fill="url(#${uid}p)" stroke="${edge}" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="${sideTransition}" fill="url(#${uid}s)" stroke="${edge}" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M52 150h216v46H52Z" fill="url(#${uid}p)" stroke="${edge}" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M268 150l20-8v38l-20 8Z" fill="url(#${uid}s)" stroke="${edge}" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M70 160h176" stroke="#fff" stroke-width="1.1" opacity=".32"/>
      <path d="M140 46h40" stroke="#fff" stroke-width="1" opacity=".28"/>
    </g>
    ${trims}
  </svg>`;
}

function trimArt(id) {
  const base = `<rect x="2" y="2" width="60" height="44" rx="9" fill="#ffffff"/>`;
  if (id === "none") {
    return `<svg viewBox="0 0 64 48">${base}<path d="M10 31h44" stroke="#c9b79d" stroke-width="1.4" stroke-dasharray="4 4"/><path d="M10 31h44" stroke="#e9dfd0" stroke-width="7" opacity=".45"/></svg>`;
  }
  if (id === "single") {
    return `<svg viewBox="0 0 64 48">${base}<path d="M10 32h44" stroke="#c9ae8b" stroke-width="7" stroke-linecap="round"/><path d="M13 29h38" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".7"/></svg>`;
  }
  if (id === "double") {
    return `<svg viewBox="0 0 64 48">${base}<path d="M10 26h44" stroke="#c9ae8b" stroke-width="4" stroke-linecap="round"/><path d="M10 36h44" stroke="#c9ae8b" stroke-width="4" stroke-linecap="round"/><path d="M13 24h38" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".6"/></svg>`;
  }
  return `<svg viewBox="0 0 64 48">${base}<path d="M11 36h30V16" fill="none" stroke="#c9ae8b" stroke-width="7" stroke-linecap="square"/><path d="M13 33h26" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".55"/></svg>`;
}

function notchArt(shape) {
  const outlines = {
    rect: "M2 3H118V33H80V20H40V33H2Z",
    rounded: "M2 3H118V33H80V24Q80 20 75 20H45Q40 20 40 24V33H2Z",
    arch: "M2 3H118V33H80V25A20 12 0 0 0 40 25V33H2Z",
    trapezoid: "M2 3H118V33H82L74 20H46L38 33H2Z",
  };
  return `<svg viewBox="0 0 120 36" aria-hidden="true">
    <path d="${outlines[shape] || outlines.rect}" fill="rgba(36, 92, 69, 0.1)" stroke="#245c45" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M2 3H118" stroke="#245c45" stroke-width="1" opacity=".35"/>
    <path d="M2 33h32M86 33h32" stroke="#245c45" stroke-width="1" stroke-linecap="round" opacity=".35"/>
  </svg>`;
}

function curveArt(type) {
  if (type === "none") {
    return `<svg viewBox="0 0 72 48" aria-hidden="true">
      <path d="M24 4 L8 44 H64 L48 4 Z" fill="none" stroke="#245c45" stroke-width="1.2" stroke-dasharray="4 3" opacity=".45"/>
      <path d="M36 4v40" stroke="#245c45" stroke-width=".8" stroke-dasharray="2 3" opacity=".22"/>
    </svg>`;
  }
  const paths = {
    flat: "M24 4 L8 44 H64 L48 4 Z",
    concave: "M24 4 C24 24 8 28 8 44 H64 C64 28 48 24 48 4 Z",
    convex: "M24 4 C14 12 8 26 8 44 H64 C64 26 58 12 48 4 Z",
  };
  return `<svg viewBox="0 0 72 48" aria-hidden="true">
    <path d="${paths[type]}" fill="rgba(36,92,69,.1)" stroke="#245c45" stroke-width="1.35" stroke-linejoin="round"/>
    <path d="M36 4v40" stroke="#245c45" stroke-width=".8" stroke-dasharray="2 3" opacity=".28"/>
  </svg>`;
}

/* ---------- 状态 ---------- */
let state = { ...DEFAULTS, trimStyles: { ...DEFAULTS.trimStyles } };
let activeTab = "upper";
let activeCaseIndex = 0;
let activeInstallKey = "base";
let previewApi = null;
let previewLoading = false;
let previewFailed = false;
let previewTimer = 0;
let toastTimer = 0;
let pendingOrder = null;
let lastOrder = null;
let installApi = null;
let installLoading = false;
let installSig = "";
let sheetOpen = false;
let lastFocused = null;
let sheetCleanup = null;
let miniInstallApi = null;
let miniInstallToken = 0;

function sanitizeState(input) {
  const next = { ...DEFAULTS, trimStyles: { ...DEFAULTS.trimStyles } };
  for (const key of Object.keys(DEFAULTS)) {
    if (key === "trimStyles") continue;
    const fallback = DEFAULTS[key];
    const value = input?.[key];
    if (typeof fallback === "number") {
      const number = Number(value);
      if (Number.isFinite(number)) next[key] = number;
    } else if (typeof value === "string") {
      next[key] = value;
    }
  }
  if (!STYLES.some((style) => style.id === next.styleId)) next.styleId = DEFAULTS.styleId;
  if (!CURVES.some((curve) => curve.id === next.surfaceType)) next.surfaceType = DEFAULTS.surfaceType;
  if (!["middle", "top", "lower", "lowest"].includes(next.surfaceStart)) next.surfaceStart = DEFAULTS.surfaceStart;
  const legacy = input?.trimStyle;
  for (const position of TRIM_POSITIONS) {
    const value = input?.trimStyles?.[position.key] ?? legacy;
    next.trimStyles[position.key] = TRIMS.some((trim) => trim.id === value)
      ? value
      : DEFAULTS.trimStyles[position.key];
  }
  return next;
}

// 中间那条装饰条只负责上竖与下方罩体之间的接缝。
// 无侧面时没有接缝；起点在顶部时接缝就是烟道顶边，所以这条要一起去掉。
function hasMiddleEdge(config = state) {
  return config?.surfaceType !== "none" && config?.surfaceStart !== "top";
}

function activeTrimPositions(config = state) {
  return hasMiddleEdge(config)
    ? TRIM_POSITIONS
    : TRIM_POSITIONS.filter((position) => position.key !== "start");
}

function normalizeState() {
  state.hoodWidth = clamp(state.hoodWidth, DIMS.hoodWidth.min, DIMS.hoodWidth.max);
  state.hoodDepth = clamp(state.hoodDepth, DIMS.hoodDepth.min, DIMS.hoodDepth.max);
  state.rearHeight = clamp(state.rearHeight, DIMS.rearHeight.min, DIMS.rearHeight.max);
  state.frontHeight = clamp(state.frontHeight, DIMS.frontHeight.min, DIMS.frontHeight.max);
  state.chimneyWidth = clamp(state.chimneyWidth, DIMS.chimneyWidth.min, DIMS.chimneyWidth.max);
  state.chimneyDepth = clamp(state.chimneyDepth, DIMS.chimneyDepth.min, DIMS.chimneyDepth.max);
  state.chimneyHeight = clamp(state.chimneyHeight, DIMS.chimneyHeight.min, DIMS.chimneyHeight.max);
  state.shimHeight = clamp(state.shimHeight, 0, 60);
  state.frontHeight = Math.min(state.frontHeight, state.rearHeight);
  state.chimneyWidth = Math.min(state.chimneyWidth, state.hoodWidth - 40);
  state.chimneyDepth = Math.min(state.chimneyDepth, state.hoodDepth - 30);
  state.notchWidth = clamp(state.notchWidth ?? 420, DIMS.notchWidth.min, Math.min(DIMS.notchWidth.max, state.hoodWidth + 20 - 60));
  state.notchHeight = clamp(state.notchHeight ?? 80, DIMS.notchHeight.min, Math.min(DIMS.notchHeight.max, state.frontHeight - 24));
  state.notchOffset = clamp(state.notchOffset ?? 0, -200, 200);
  if (!NOTCH_SHAPES.some((item) => item.id === state.notchShape)) state.notchShape = "arch";
  state.notchEnabled = state.notchEnabled !== false;
  const allowed = allowedStarts(state.surfaceType).map((item) => item.id);
  if (!allowed.includes(state.surfaceStart)) state.surfaceStart = allowed[0];
}

const currentStyle = () => STYLES.find((style) => style.id === state.styleId) || STYLES[0];
const trimFor = (key) => TRIMS.find((trim) => trim.id === (state.trimStyles?.[key] || "none")) || TRIMS[0];
function priceInfo() {
  const details = activeTrimPositions().map((position) => {
    const trim = trimFor(position.key);
    return { ...position, styleId: trim.id, styleName: trim.name, price: trim.price };
  });
  const trim = details.reduce((sum, item) => sum + item.price, 0);
  return { base: CONFIG.basePrice, trim, total: CONFIG.basePrice + trim, details };
}
function trimSummaryShort(config = state) {
  const styles = config.trimStyles || {};
  return activeTrimPositions(config).map((position) => {
    const trim = TRIMS.find((item) => item.id === styles[position.key]) || TRIMS[0];
    return trim.name;
  }).join(" / ");
}

function applyPreset(style) {
  state.styleId = style.id;
  state.surfaceType = style.curve;
  state.surfaceStart = style.start;
  if (style.dims) Object.assign(state, style.dims);
  state.trimStyles = { ...(style.trims || {
    top: style.trim, start: style.trim, hoodTop: style.trim, hoodBottom: style.trim,
  }) };
  if (style.notch) {
    state.notchEnabled = style.notch.enabled !== false;
    if (style.notch.shape) state.notchShape = style.notch.shape;
    if (Number.isFinite(Number(style.notch.width))) state.notchWidth = Number(style.notch.width);
    if (Number.isFinite(Number(style.notch.height))) state.notchHeight = Number(style.notch.height);
    if (Number.isFinite(Number(style.notch.offset))) state.notchOffset = Number(style.notch.offset);
  }
  normalizeState();
  syncUI();
  setCustomizeTab("upper");
}

/* ---------- 首页案例 ---------- */
function startWithStyle(style) {
  applyPreset(style);
  go("customize");
}

function currentCaseIndex() {
  const track = $("#caseTrack");
  if (!track) return activeCaseIndex;
  return clamp(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)), 0, HOME_CASES.length - 1);
}

function startWithActiveCase() {
  const index = currentCaseIndex();
  updateCaseProgress(index);
  const item = HOME_CASES[index] || HOME_CASES[0];
  const style = STYLES.find((entry) => entry.id === item.styleId) || STYLES[0];
  startWithStyle(style);
}

let caseModelTimer = 0;

function setCaseModel(index) {
  const thumb = $("#case3d img");
  const item = HOME_CASES[clamp(index, 0, HOME_CASES.length - 1)];
  if (!thumb || !item) return;
  const src = item.model || HOME_3D_IMAGE || item.image;
  if (thumb.dataset.target === src) return;
  thumb.dataset.target = src;
  clearTimeout(caseModelTimer);
  thumb.classList.add("is-swapping");
  caseModelTimer = window.setTimeout(() => {
    thumb.src = src;
    thumb.classList.remove("is-swapping");
  }, 140);
}

function updateCaseProgress(index) {
  activeCaseIndex = clamp(index, 0, HOME_CASES.length - 1);
  $$("#caseProgress button").forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === activeCaseIndex);
    const fill = button.querySelector(".case-fill");
    if (fill) fill.style.transform = "scaleX(0)";
  });
  setCaseModel(activeCaseIndex);
}

function snapToCase(index) {
  const track = $("#caseTrack");
  if (!track) return;
  const target = clamp(index, 0, HOME_CASES.length - 1);
  track.scrollTo({ left: target * track.clientWidth, behavior: "smooth" });
  updateCaseProgress(target);
}

/* ---------- 首页自动轮播 ---------- */
const CASE_INTERVAL = 5000;
let caseAutoRaf = 0;
let caseAutoStart = 0;
let caseAutoElapsed = 0;
let caseAutoPaused = false;

function paintCaseFill(progress) {
  const button = $$("#caseProgress button")[activeCaseIndex];
  const fill = button?.querySelector(".case-fill");
  if (fill) fill.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
}

function stopCaseAuto() {
  if (caseAutoRaf) cancelAnimationFrame(caseAutoRaf);
  caseAutoRaf = 0;
}

function restartCaseAuto() {
  stopCaseAuto();
  if (currentRoute() !== "home" || document.hidden) return;
  caseAutoElapsed = 0;
  caseAutoStart = performance.now();
  caseAutoPaused = false;
  paintCaseFill(0);
  const tick = (now) => {
    if (caseAutoPaused) {
      caseAutoStart = now - caseAutoElapsed;
      caseAutoRaf = requestAnimationFrame(tick);
      return;
    }
    caseAutoElapsed = now - caseAutoStart;
    const progress = Math.min(1, caseAutoElapsed / CASE_INTERVAL);
    paintCaseFill(progress);
    if (progress >= 1) {
      const next = (activeCaseIndex + 1) % HOME_CASES.length;
      snapToCase(next);
      caseAutoElapsed = 0;
      caseAutoStart = now;
    }
    caseAutoRaf = requestAnimationFrame(tick);
  };
  caseAutoRaf = requestAnimationFrame(tick);
}

function pauseCaseAuto() {
  caseAutoPaused = true;
}

function bindCaseEvents() {
  const track = $("#caseTrack");
  if (!track) return;
  track.addEventListener("scroll", () => {
    const index = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    updateCaseProgress(index);
  }, { passive: true });
  const syncCaseAfterSwipe = () => window.setTimeout(() => {
    updateCaseProgress(currentCaseIndex());
    restartCaseAuto();
  }, 300);
  track.addEventListener("touchstart", pauseCaseAuto, { passive: true });
  track.addEventListener("touchend", syncCaseAfterSwipe, { passive: true });

  // 桌面端：按住鼠标左右拖动也能切换（触屏仍走原生滚动）
  let dragging = false;
  let moved = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  track.addEventListener("pointerdown", (event) => {
    pauseCaseAuto();
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragging = true;
    moved = false;
    dragStartX = event.clientX;
    dragStartScroll = track.scrollLeft;
    track.classList.add("is-dragging");
  });
  window.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - dragStartX;
    if (Math.abs(dx) > 5) moved = true;
    track.scrollLeft = dragStartScroll - dx;
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("is-dragging");
    if (moved) snapToCase(currentCaseIndex());
    restartCaseAuto();
  };
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);
  window.addEventListener("blur", endDrag);

  $("#caseProgress")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-case-index]");
    if (!button) return;
    snapToCase(Number(button.dataset.caseIndex));
    restartCaseAuto();
  });
  $("#homeStart")?.addEventListener("click", startWithActiveCase);
  $("#case3d")?.addEventListener("click", startWithActiveCase);
  $("#homeOrders")?.addEventListener("click", () => go("orders"));
}

function renderHomeCases() {
  const track = $("#caseTrack");
  const progress = $("#caseProgress");
  if (!track || !progress) return;
  track.innerHTML = HOME_CASES.map((item, index) => {
    const style = STYLES.find((entry) => entry.id === item.styleId) || STYLES[0];
    return `<article class="case-slide" data-index="${index}">
      <img class="case-image ${item.fit === "cover" ? "is-cover" : ""}" src="${esc(item.image)}" alt="${esc(item.name)}烟机罩案例" draggable="false" />
      <div class="case-shade"></div>
      <div class="case-meta">
        <h2 class="case-name">${esc(item.name)}</h2>
        <p class="case-spec">${esc(style.desc)} · ${esc(style.tone)}色</p>
      </div>
    </article>`;
  }).join("");
  progress.innerHTML = HOME_CASES.map((item, index) =>
    `<button type="button" data-case-index="${index}" aria-label="查看案例 ${index + 1}"><span class="case-fill"></span></button>`
  ).join("");
  const thumb = $("#case3d img");
  if (thumb) {
    const first = HOME_CASES[0];
    thumb.src = first.model || HOME_3D_IMAGE || first.image;
    thumb.dataset.target = thumb.getAttribute("src");
  }
  bindCaseEvents();
  updateCaseProgress(0);
}

/* ---------- 定制表单 ---------- */
function dimRow(key) {
  const dim = DIMS[key];
  return `<div class="dim-row" data-dim="${key}">
    <div class="dim-label"><b>${dim.label}</b>${dim.hint ? `<span>${dim.hint}</span>` : ""}</div>
    <div class="stepper">
      <button type="button" data-step="-${dim.step}" aria-label="减少${dim.label}">−</button>
      <input type="number" inputmode="numeric" min="${dim.min}" max="${dim.max}" step="1" value="${state[key]}" aria-label="${dim.label}" />
      <span class="unit">mm</span>
      <button type="button" data-step="${dim.step}" aria-label="增加${dim.label}">+</button>
    </div>
  </div>`;
}

function renderDims() {
  $("#chimneyDims").innerHTML = ["chimneyWidth", "chimneyDepth", "chimneyHeight"].map(dimRow).join("");
  $("#hoodDims").innerHTML = ["hoodWidth", "hoodDepth", "rearHeight", "frontHeight"].map(dimRow).join("");
}

function renderNotchOptions() {
  const root = $("#notchOptions");
  if (!root) return;
  root.innerHTML = NOTCH_SHAPES.map((shape) =>
    `<button class="notch-option" type="button" data-notch="${shape.id}">${notchArt(shape.id)}<b>${shape.label}</b></button>`
  ).join("");
}

function renderNotchDims() {
  const root = $("#notchDims");
  if (!root) return;
  root.innerHTML = ["notchWidth", "notchHeight"].map(dimRow).join("");
}

function renderCurveOptions() {
  $("#curveOptions").innerHTML = CURVES.map((curve) => `
    <button class="curve-option" type="button" data-curve="${curve.id}">
      ${curveArt(curve.id)}<b>${curve.label}</b>
    </button>
  `).join("");
}

function renderStartOptions() {
  $("#startOptions").innerHTML = allowedStarts(state.surfaceType)
    .map((option) => `<button type="button" data-start="${option.id}">${option.label}</button>`)
    .join("");
}

function renderTrimList() {
  const list = $("#trimList");
  if (!list) return;
  list.innerHTML = activeTrimPositions().map((position) => {
    const trim = trimFor(position.key);
    return `<button class="trim-row" type="button" data-trim-position="${position.key}">
      <span class="trim-row-icon">${trimArt(trim.id)}</span>
      <span class="trim-row-main"><b class="trim-row-name">${position.name}</b><span class="trim-row-hint">${position.hint}</span></span>
      <span class="trim-row-current">${trim.name}</span>
      <span class="trim-row-price">${trim.price ? fmt(trim.price) : "免费"}</span>
      <svg class="trim-row-chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m8 5 5 5-5 5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>`;
  }).join("");
}

function openTrimPicker(key) {
  const position = TRIM_POSITIONS.find((item) => item.key === key);
  if (!position) return;
  const price = priceInfo();
  const body = `<div class="trim-picker-grid">${TRIMS.map((trim) => `
    <button class="trim-picker-card ${state.trimStyles?.[key] === trim.id ? "is-active" : ""}" type="button" data-pick-trim="${key}" data-trim-style="${trim.id}">
      <span class="trim-picker-art">${trimArt(trim.id)}</span>
      <span class="trim-picker-copy"><b>${trim.name}</b><span>${trim.desc}</span><em>${trim.price ? fmt(trim.price) : "免费"}</em></span>
    </button>`).join("")}</div>
    <div class="trim-total"><span>装饰条合计</span><b id="pickerTrimTotal">${fmt(price.trim)}</b></div>
    <p class="sheet-note">只更换「${position.name}」，其他位置不受影响；模型会实时更新。</p>`;
  openSheet({
    title: `选择${position.name}`,
    body,
    backdrop: "light",
    actions: [{ label: "完成", kind: "primary", onClick: closeSheet }],
  });
}

function setDim(key, value, round = true) {
  const dim = DIMS[key];
  let next = clamp(value, dim.min, dim.max);
  if (round) next = Math.round(next / dim.step) * dim.step;
  state[key] = next;
  if (key.startsWith("notch")) state.notchEnabled = true;
  normalizeState();
  syncUI({ activeInput: null });
  markDirty();
}

function markDirty() {
  // 暂不做自动保存；保存能力后续再加。
}

function syncUI({ activeInput = null, writeInputs = true } = {}) {
  normalizeState();
  if (writeInputs) {
    $$(".dim-row").forEach((row) => {
      const input = row.querySelector("input");
      if (input && input !== activeInput) input.value = state[row.dataset.dim];
    });
  }

  const shimValue = $("#shimValue");
  if (shimValue) shimValue.textContent = state.shimHeight;

  $$("#curveOptions .curve-option").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.curve === state.surfaceType);
  });
  $$("#notchOptions .notch-option").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.notch === state.notchShape);
  });
  if ($("#notchHint")) $("#notchHint").hidden = state.notchEnabled !== false;
  const noSide = state.surfaceType === "none";
  if ($("#startLabel")) $("#startLabel").hidden = noSide;
  if ($("#startOptions")) $("#startOptions").hidden = noSide;
  const startOptions = allowedStarts(state.surfaceType);
  const signature = startOptions.map((item) => `${item.id}:${item.label}`).join(",");
  const currentSignature = $$("#startOptions button").map((button) => `${button.dataset.start}:${button.textContent}`).join(",");
  if (signature !== currentSignature) {
    renderStartOptions();
  }
  $$("#startOptions button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.start === state.surfaceStart);
  });
  if ($("#startHint")) {
    const convex = state.surfaceType === "convex";
    $("#startHint").hidden = !convex;
    $("#startHint").textContent = convex ? "位置越靠下，向外鼓出的位置越靠近下横。" : "";
  }

  renderTrimList();

  const width = state.hoodWidth + 20;
  const totalHeight = state.rearHeight + state.chimneyHeight + state.shimHeight;
  if ($("#specWidth")) $("#specWidth").textContent = String(width);
  if ($("#specHeight")) $("#specHeight").textContent = String(totalHeight);
  if ($("#specShim")) $("#specShim").textContent = String(state.shimHeight);

  const price = priceInfo();
  if ($("#totalPrice")) $("#totalPrice").textContent = fmt(price.total);
  if ($("#breakdown")) $("#breakdown").textContent = price.trim ? `主体 ${fmt(price.base)} + 装饰 ${fmt(price.trim)}` : `主体 ${fmt(price.base)} · 无装饰`;
  if ($("#installPrice")) $("#installPrice").textContent = fmt(price.total);
  if ($("#installPriceBtn")) $("#installPriceBtn").textContent = fmt(price.total);
  if ($("#checkoutPrice")) $("#checkoutPrice").textContent = fmt(price.total);

  schedulePreview();
}

function schedulePreview() {
  if (previewFailed) {
    const fallback = $("#previewFallback");
    if (fallback) fallback.innerHTML = hoodArt(currentStyle(), { transparent: true });
    return;
  }
  clearTimeout(previewTimer);
  previewTimer = window.setTimeout(() => {
    if (previewApi) previewApi.update({ ...state });
  }, 70);
}

async function ensurePreview() {
  if (previewApi || previewLoading) return;
  previewLoading = true;
  try {
    const module = await import("./preview.js");
    previewApi = module.createPreview($("#preview3d"), { ...state });
  } catch (error) {
    previewFailed = true;
    const fallback = $("#previewFallback");
    if (fallback) fallback.innerHTML = hoodArt(currentStyle(), { transparent: true });
    $(".view--customize")?.classList.add("is-fallback");
  } finally {
    previewLoading = false;
  }
}

/* ---------- 路由 ---------- */
const ROUTES = ["home", "orders", "order", "customize", "install"];
function currentRoute() {
  const route = location.hash.replace(/^#\/?/, "");
  return ROUTES.includes(route) ? route : "home";
}
function go(route, { replace = false } = {}) {
  const hash = route === "home" ? "#/" : `#/${route}`;
  if (location.hash === hash) {
    renderRoute();
    return;
  }
  if (replace) {
    history.replaceState(null, "", hash);
    renderRoute();
  } else {
    location.hash = hash;
  }
}
function backTarget() {
  return ({ orders: "home", order: "orders", customize: "home", install: "customize" })[currentRoute()] || "home";
}

function renderRoute() {
  const route = currentRoute();
  $$(".view").forEach((view) => view.classList.toggle("is-active", view.dataset.view === route));
  closeSheet();
  if (route === "home") restartCaseAuto();
  else stopCaseAuto();
  if (route === "orders") {
    renderOrdersPage();
  }
  if (route === "order") {
    renderOrderDetail();
  }
  if (route === "customize") {
    ensurePreview();
    syncUI();
  }
  if (route === "install") {
    updateInstallPrice();
    renderInstallTabs();
    setInstallStep(activeInstallKey, true);
  }
  window.scrollTo(0, 0);
}

/* ---------- Tab ---------- */
function setCustomizeTab(tab) {
  activeTab = tab;
  $$("#customizeTabs button").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.tab === tab)));
  $$(".custom-panel").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.panel === tab));
  const panels = $(".custom-panels");
  if (panels) panels.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- 安装 ---------- */
const STEP_MARKS = ["①", "②", "③", "④", "⑤"];
const stepMark = (index) => STEP_MARKS[index] || String(index + 1);

const INSTALL_STEPS = {
  base: {
    name: "主体拼接",
    title: "主体按顺序拼装",
    desc: "有垫高先贴垫板，再装侧板、顶板、正面。",
  },
  curve: {
    name: "曲面装饰",
    title: "曲面压到接缝上",
    desc: "对准上竖与下横的接缝，从上往下压合。",
  },
  trim: {
    name: "装饰条",
    title: "切角后再贴装饰条",
    desc: "两端切 45° 海棠角，贴回罩体压紧 30 秒。",
  },
  paint: {
    name: "刷漆",
    title: "刷成可可蛋奶色",
    desc: "薄涂两遍，间隔 30 分钟，阴干 24 小时。",
  },
};

function installStepsFor(config = {}) {
  const styles = config.trimStyles || {
    top: config.trimStyle || "none",
    start: config.trimStyle || "none",
    hoodTop: config.trimStyle || "none",
    hoodBottom: config.trimStyle || "none",
  };
  const hasCurve = config.surfaceType !== "flat" && config.surfaceType !== "none";
  const hasTrim = activeTrimPositions(config).some(({ key }) => (styles[key] || "none") !== "none");
  // 没有对应部件的步骤直接省略，序号按剩余步骤重新排。
  return ["base", "curve", "trim", "paint"]
    .filter((key) => (key !== "curve" || hasCurve) && (key !== "trim" || hasTrim))
    .map((key) => ({ key, ...INSTALL_STEPS[key] }));
}

function installSteps() {
  return installStepsFor(state);
}

function renderInstallTabs() {
  const nav = $("#installTabs");
  const steps = installSteps();
  if (nav) {
    nav.innerHTML = steps.map((step, index) => `
      <button role="tab" aria-selected="false" data-key="${step.key}" type="button">
        <span>${stepMark(index)}</span>${step.name}
      </button>
    `).join("");
  }
  if (!steps.some((step) => step.key === activeInstallKey)) activeInstallKey = steps[0].key;
  return steps;
}

function installStateSignature() {
  return JSON.stringify({
    hoodWidth: state.hoodWidth,
    hoodDepth: state.hoodDepth,
    rearHeight: state.rearHeight,
    frontHeight: state.frontHeight,
    chimneyWidth: state.chimneyWidth,
    chimneyDepth: state.chimneyDepth,
    chimneyHeight: state.chimneyHeight,
    shimHeight: state.shimHeight,
    surfaceType: state.surfaceType,
    surfaceStart: state.surfaceStart,
    styleId: state.styleId,
    trimStyles: state.trimStyles,
  });
}

function updateInstallPrice() {
  const total = priceInfo().total;
  if ($("#installPrice")) $("#installPrice").textContent = fmt(total);
  if ($("#installPriceBtn")) $("#installPriceBtn").textContent = fmt(total);
}

function ensureInstallScene(animate = true) {
  const signature = installStateSignature();
  if (installApi) {
    if (installSig === signature) {
      installApi.setStep(activeInstallKey, { animate });
      return;
    }
    installApi.dispose();
    installApi = null;
  }
  if (installLoading) return;
  const stage = $("#installStage");
  if (!stage) return;

  installLoading = true;
  import("./install3d.js")
    .then(({ createInstallScene }) => {
      if (!installApi) {
        installApi = createInstallScene(stage, { ...state, trimStyles: { ...state.trimStyles } });
        installSig = installStateSignature();
      }
      installApi.setStep(activeInstallKey, { animate: currentRoute() === "install" });
    })
    .catch((error) => {
      console.warn("3D 安装演示加载失败", error);
      stage.classList.add("is-fallback");
      stage.textContent = "当前设备暂不支持 3D 演示";
    })
    .finally(() => {
      installLoading = false;
    });
}

function setInstallStep(key, animate = true) {
  const steps = installSteps();
  const info = steps.find((step) => step.key === key) || steps[0];
  if (!info) return;
  activeInstallKey = info.key;

  $$("#installTabs button").forEach((button) => {
    button.setAttribute("aria-selected", String(button.dataset.key === info.key));
  });

  if ($("#installTitle")) $("#installTitle").textContent = info.title;
  if ($("#installDesc")) $("#installDesc").textContent = info.desc;
  const copy = $("#installCopy");
  if (copy) {
    copy.classList.remove("is-swap");
    void copy.offsetWidth;
    copy.classList.add("is-swap");
  }
  $("#installStage")?.setAttribute("aria-label", `${info.name}，三维安装演示`);

  ensureInstallScene(animate);
}

/* ---------- 收货信息 ---------- */
function sumRow(label, value) {
  return `<div class="sum-row"><span>${label}</span><b>${esc(value)}</b></div>`;
}

function renderCheckoutSummary() {
  const summary = $("#orderSummary");
  if (!summary) return;
  const style = currentStyle();
  const price = priceInfo();
  const start = startLabelFor(state.surfaceType, state.surfaceStart);
  const curveLabel = state.surfaceType === "none"
    ? "无侧面"
    : state.surfaceType === "flat"
      ? `不弯曲 · ${start}`
      : `${state.surfaceType === "convex" ? "向外弯曲" : "向内弯曲"} · ${start}`;
  summary.innerHTML = [
    sumRow("款式", `${style.name} · ${style.tone}`),
    sumRow("下横", `${state.hoodWidth} × ${state.hoodDepth}mm`),
    sumRow("侧高", `靠墙 ${state.rearHeight} / 前侧 ${state.frontHeight}mm`),
    sumRow("上竖", `${state.chimneyWidth} × ${state.chimneyDepth} × ${state.chimneyHeight}mm`),
    sumRow("侧面", curveLabel),
    sumRow("装饰条", trimSummaryShort(state)),
    sumRow("垫高", `${state.shimHeight}mm`),
    sumRow("主体", fmt(CONFIG.basePrice)),
    sumRow("装饰", fmt(price.trim)),
    `<div class="sum-row"><span>运费</span><b class="sum-ship"><s>¥30</s><em>¥0</em></b></div>`,
  ].join("");
}

function renderCheckout() {
  renderCheckoutSummary();
  const price = priceInfo();
  if ($("#checkoutPrice")) $("#checkoutPrice").textContent = fmt(price.total);
  const saved = readStored(STORAGE.customer, null);
  if (saved) {
    const fields = { coName: "name", coPhone: "phone", coRegion: "region", coAddress: "address" };
    for (const [id, key] of Object.entries(fields)) {
      const input = $(`#${id}`);
      if (input && !input.value) input.value = saved[key] || "";
    }
  }
  if ($("#formError")) $("#formError").textContent = "";
  $$(".field").forEach((field) => field.classList.remove("is-invalid"));
}

function getCustomer() {
  return {
    name: $("#coName").value.trim(),
    phone: $("#coPhone").value.trim(),
    region: $("#coRegion").value.trim(),
    address: $("#coAddress").value.trim(),
    note: $("#coNote")?.value.trim() || "",
  };
}

/* ---------- 订单查询 ---------- */
let orderSearchToken = 0;
let orderResultsCache = [];
let activeOrder = null;

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 11);
}

function formatOrderDate(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) return "";
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

function orderStatus(order) {
  if (order.submitted) return { text: "已提交", className: "is-ok" };
  if (order.status === "awaiting_payment") return { text: "待支付", className: "is-wait" };
  return { text: "处理中", className: "is-wait" };
}

function orderSpec(order) {
  const config = order.config || {};
  if (!config.hoodWidth) return "";
  return `下横 ${config.hoodWidth}×${config.hoodDepth} · 上竖 ${config.chimneyWidth}×${config.chimneyDepth}×${config.chimneyHeight}`;
}

function orderResultHtml(order) {
  const status = orderStatus(order);
  const style = [order.style?.name, order.style?.tone].filter(Boolean).join(" · ");
  const meta = [formatOrderDate(order.createdAt), style, fmt(order.price?.total ?? 0)].filter(Boolean).join(" · ");
  const spec = orderSpec(order);
  return `<article class="order-result" role="button" tabindex="0" data-order-id="${esc(order.id || "")}">
    <div class="order-result-head"><b>${esc(order.id || "—")}</b><span class="order-status ${status.className}">${status.text}</span></div>
    <div class="order-result-meta">${esc(meta)}</div>
    ${spec ? `<div class="order-result-spec">${esc(spec)}</div>` : ""}
  </article>`;
}

function renderOrderResults(orders = [], message = "") {
  orderResultsCache = orders;
  $(".orders-page")?.classList.toggle("has-results", !message && orders.length > 0);
  const root = $("#orderResults");
  if (!root) return;
  if (message) {
    root.innerHTML = `<p class="orders-empty">${esc(message)}</p>`;
    return;
  }
  if (!orders.length) {
    root.innerHTML = '<p class="orders-empty">没有查到订单，换个手机号试试。</p>';
    return;
  }
  root.innerHTML = orders.map(orderResultHtml).join("");
}

function openOrderDetail(order) {
  if (!order) return;
  activeOrder = order;
  go("order");
}

async function fetchOrdersByPhone(phone) {
  if (!CONFIG.orderEndpoint) return [];
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 4000);
  try {
    const url = new URL(CONFIG.orderEndpoint, location.href);
    url.searchParams.set("phone", phone);
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) return [];
    const data = await response.json();
    if (!Array.isArray(data.orders)) return [];
    return data.orders.filter((order) => {
      const remotePhone = normalizePhone(order.customer?.phone);
      return !remotePhone || remotePhone === phone;
    });
  } catch {
    return [];
  } finally {
    window.clearTimeout(timer);
  }
}

async function searchOrders(value) {
  const phone = normalizePhone(value);
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    renderOrderResults([], "请输入 11 位手机号");
    return;
  }

  const token = ++orderSearchToken;
  renderOrderResults([], "查询中…");

  const local = readOrders().filter((order) => normalizePhone(order.customer?.phone) === phone);
  const remote = await fetchOrdersByPhone(phone);
  if (token !== orderSearchToken) return;

  const byId = new Map();
  remote.forEach((order) => {
    if (order?.id) byId.set(order.id, order);
  });
  local.forEach((order) => {
    if (order?.id) byId.set(order.id, { ...(byId.get(order.id) || {}), ...order });
  });
  const orders = Array.from(byId.values()).sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime() || 0;
    const timeB = new Date(b.createdAt || 0).getTime() || 0;
    return timeB - timeA;
  });
  renderOrderResults(orders);
}

function renderOrdersPage() {
  const phoneInput = $("#orderPhone");
  if (phoneInput && !phoneInput.value) {
    const saved = readStored(STORAGE.customer, null);
    if (saved?.phone) phoneInput.value = normalizePhone(saved.phone);
  }
}

function renderOrderDetail() {
  const root = $("#orderDetail");
  if (!root) return;
  if (!activeOrder) {
    go("orders", { replace: true });
    return;
  }
  const order = activeOrder;
  const config = order.config || {};
  const status = orderStatus(order);
  const style = [order.style?.name, order.style?.tone].filter(Boolean).join(" · ");
  const rows = [
    ["下单时间", formatOrderDate(order.createdAt)],
    ["款式", style],
    config.hoodWidth ? ["下横", `${config.hoodWidth} × ${config.hoodDepth}mm`] : null,
    config.rearHeight ? ["侧高", `靠墙 ${config.rearHeight} / 前侧 ${config.frontHeight}mm`] : null,
    config.chimneyWidth ? ["上竖", `${config.chimneyWidth} × ${config.chimneyDepth} × ${config.chimneyHeight}mm`] : null,
  ].filter(Boolean);

  root.innerHTML = `
    <section class="order-detail-card">
      <div class="order-detail-head">
        <b>${esc(order.id || "—")}</b>
        <span class="order-status ${status.className}">${status.text}</span>
      </div>
      ${rows.map(([label, value]) => `<div class="order-detail-row"><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join("")}
      <div class="order-detail-total"><span>合计</span><b>${fmt(order.price?.total ?? 0)}</b></div>
    </section>
    <section class="order-detail-service">
      <p class="order-detail-service-title">有问题？加客服微信</p>
      ${(CONFIG.serviceQrImage || CONFIG.qrImage) ? `<img class="order-detail-qr" src="${esc(CONFIG.serviceQrImage || CONFIG.qrImage)}" alt="客服微信二维码" />` : ""}
      <p class="order-detail-wechat">微信号 <b>${esc(CONFIG.wechatId)}</b></p>
    </section>
  `;
}

function openServiceSheet() {
  openSheet({
    title: "联系客服",
    backdrop: "light",
    body: `
      <div class="service-qr"><img src="${esc(CONFIG.serviceQrImage || CONFIG.qrImage)}" alt="客服微信二维码" /></div>
      <p class="service-wechat">微信号 <b>${esc(CONFIG.wechatId)}</b></p>
      <p class="sheet-note">扫码添加，发送订单号。</p>
    `,
    actions: [
      { label: "复制微信号", kind: "primary", onClick: () => copyText(CONFIG.wechatId) },
      { label: "关闭", kind: "text", onClick: closeSheet },
    ],
  });
}

function orderInstallConfig(order) {
  const config = order?.config || {};
  // 旧订单只有单一 trimStyle，四个位置都按它还原；新订单直接用 trimStyles。
  const legacyTrim = config.trimStyle;
  const fallbackTrims = legacyTrim
    ? { top: legacyTrim, start: legacyTrim, hoodTop: legacyTrim, hoodBottom: legacyTrim }
    : DEFAULTS.trimStyles;
  return {
    ...DEFAULTS,
    ...config,
    trimStyles: { ...fallbackTrims, ...(config.trimStyles || {}) },
  };
}

function validateCustomer(customer) {
  const problems = [];
  const mark = (selector) => $(selector)?.closest(".field")?.classList.add("is-invalid");
  $$(".field").forEach((field) => field.classList.remove("is-invalid"));
  if (customer.name.length < 2) { mark("#coName"); problems.push("请填写收货人姓名"); }
  if (!/^1[3-9]\d{9}$/.test(customer.phone)) { mark("#coPhone"); problems.push("请填写 11 位手机号"); }
  if (!customer.region) { mark("#coRegion"); problems.push("请填写所在地区"); }
  if (customer.address.length < 5) { mark("#coAddress"); problems.push("请填写详细地址"); }
  return problems;
}

function makeOrderId() {
  const now = new Date();
  const date = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `YYJ${date}-${Math.floor(10000 + Math.random() * 90000)}`;
}

function createOrder(customer) {
  const style = currentStyle();
  const price = priceInfo();
  return {
    id: makeOrderId(),
    createdAt: new Date().toISOString(),
    status: "awaiting_payment",
    source: "h5",
    style: { id: style.id, name: style.name, tone: style.tone },
    config: { ...state, trimStyles: { ...state.trimStyles } },
    price: { base: price.base, trim: price.trim, total: price.total, trimDetails: price.details },
    customer: { ...customer },
  };
}

function readOrders() {
  const orders = readStored(STORAGE.orders, []);
  return Array.isArray(orders) ? orders : [];
}
function saveLocalOrder(order) {
  const orders = readOrders();
  const index = orders.findIndex((item) => item.id === order.id);
  if (index >= 0) orders[index] = order;
  else orders.unshift(order);
  writeStored(STORAGE.orders, orders.slice(0, 80));
}
function readQueue() {
  const queue = readStored(STORAGE.pending, []);
  return Array.isArray(queue) ? queue : [];
}
function queueOrder(order) {
  const queue = readQueue().filter((item) => item.id !== order.id);
  queue.unshift(order);
  writeStored(STORAGE.pending, queue.slice(0, 20));
}
function removeQueued(id) {
  writeStored(STORAGE.pending, readQueue().filter((item) => item.id !== id));
}
function markLocalSynced(id) {
  const orders = readOrders();
  const index = orders.findIndex((item) => item.id === id);
  if (index >= 0) {
    orders[index].synced = true;
    writeStored(STORAGE.orders, orders);
  }
}

async function postOrder(order) {
  if (!CONFIG.orderEndpoint) return false;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 4200);
  try {
    const response = await fetch(CONFIG.orderEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
      signal: controller.signal,
      keepalive: true,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function submitOrder(order) {
  order.submittedAt = new Date().toISOString();
  saveLocalOrder(order);
  const sent = await postOrder(order);
  order.synced = sent;
  if (sent) {
    removeQueued(order.id);
    markLocalSynced(order.id);
  } else {
    queueOrder(order);
  }
  saveLocalOrder(order);
  writeStored(STORAGE.lastOrder, order);
  return order;
}

async function flushPending() {
  if (!CONFIG.orderEndpoint) return;
  const queue = readQueue();
  for (const order of queue.slice(0, 4)) {
    const sent = await postOrder(order);
    if (sent) {
      removeQueued(order.id);
      markLocalSynced(order.id);
    }
  }
}

/* ---------- 下单半屏 ---------- */
let orderFlow = null;

function qrFallbackMarkup() {
  return `
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="112" height="112" rx="14" fill="#fff" stroke="#e6ddcf" stroke-width="1.4" />
      <rect x="16" y="16" width="26" height="26" rx="5" stroke="#2f5d46" stroke-width="4" />
      <rect x="78" y="16" width="26" height="26" rx="5" stroke="#2f5d46" stroke-width="4" />
      <rect x="16" y="78" width="26" height="26" rx="5" stroke="#2f5d46" stroke-width="4" />
      <path d="M54 20h10v10H54zm16 0h4v4h-4zM54 36h4v4h-4zm12 4h10v10H66zM54 54h14v4H54zm20 8h8v8h-8zM54 70h4v14h-4zm10 6h10v4H64zm14-14h6v6h-6zm6 10h10v10H84z" fill="#2f5d46" opacity=".28" />
      <circle cx="60" cy="60" r="12" fill="#2f5d46" />
      <path d="M55.5 57.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 2-1.3 3.7-3.1 4.3v2.2" stroke="#fff" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="60" cy="67" r="1.1" fill="#fff" />
    </svg>
    <span>收款码加载失败，请刷新重试</span>`;
}

function orderCheckoutHtml() {
  return `
    <p class="order-sealed-hint" id="orderSealedHint" hidden>订单已提交，资料仅供核对。</p>
    <form id="checkoutForm" class="order-step-form" novalidate>
      <div class="form-card">
        <label class="field"><span>收货人</span><input id="coName" autocomplete="name" placeholder="怎么称呼你" /></label>
        <label class="field"><span>手机号</span><input id="coPhone" inputmode="numeric" autocomplete="tel" placeholder="用于接收发货通知" /></label>
        <label class="field"><span>所在地区</span><input id="coRegion" autocomplete="address-level1" placeholder="省 / 市 / 区" /></label>
        <label class="field"><span>详细地址</span><textarea id="coAddress" rows="2" autocomplete="street-address" placeholder="街道、门牌号、小区楼栋"></textarea></label>
      </div>

      <div class="order-card">
        <div class="order-card-head"><h2>定制清单</h2><button type="button" id="editConfig" class="link-btn">修改</button></div>
        <div id="orderSummary"></div>
        <div class="order-total"><span>合计</span><b id="checkoutPrice">${fmt(priceInfo().total)}</b></div>
      </div>

      <p class="form-error" id="formError" role="alert"></p>
    </form>`;
}

function orderPayHtml() {
  return `
    <div class="order-step-pay">
      <div class="pay-card">
        <div class="pay-amount"><small>应付金额</small><b id="payAmount">${fmt(priceInfo().total)}</b></div>
        <div class="qr-wrap">
          <img id="payQr" alt="微信收款二维码" />
          <div id="payQrFallback" class="qr-fallback" hidden>${qrFallbackMarkup()}</div>
        </div>
        <p class="qr-hint">长按识别二维码支付</p>
        <div class="pay-order">订单编号 <b id="payOrderNo">—</b></div>
      </div>
    </div>`;
}

function orderServiceHtml() {
  const serviceQr = CONFIG.serviceQrImage || CONFIG.qrImage || "";
  return `
    <div class="order-step-service">
      <p class="order-step-kicker">添加客服设计师🎨</p>
      <div class="service-qr order-step-qr">
        ${serviceQr ? `<img id="orderServiceQr" src="${esc(serviceQr)}" alt="客服微信二维码" />` : ""}
        <p class="order-step-empty" id="orderServiceQrFallback" ${serviceQr ? "hidden" : ""}>客服二维码待配置</p>
      </div>
      <div class="copy-row"><span>客服微信</span><b>${esc(CONFIG.wechatId)}</b><button type="button" data-copy-value="${esc(CONFIG.wechatId)}">复制</button></div>
      <div class="order-service-note">
        <b>添加后请务必发送</b>
        <span>支付截图 <em>+</em> 手机号</span>
      </div>
      <p class="order-service-tip">客服核对手机号后安排制作和发货。</p>
    </div>`;
}

function orderSheetHtml() {
  return `
    <div class="order-flow">
      <nav class="order-steps" id="orderSteps" role="tablist" aria-label="下单步骤">
        <button type="button" role="tab" aria-selected="true" data-order-step="0">填写订单</button>
        <button type="button" role="tab" aria-selected="false" data-order-step="1">扫码支付</button>
        <button type="button" role="tab" aria-selected="false" data-order-step="2">添加客服</button>
      </nav>
      <section class="order-step" data-order-panel="0" role="tabpanel">${orderCheckoutHtml()}</section>
      <section class="order-step" data-order-panel="1" role="tabpanel" hidden>${orderPayHtml()}</section>
      <section class="order-step" data-order-panel="2" role="tabpanel" hidden>${orderServiceHtml()}</section>
    </div>`;
}

function openOrderSheet() {
  pendingOrder = null;
  try { sessionStorage.removeItem(STORAGE.pendingOrder); } catch { /* ignore */ }
  const flow = { step: 0, maxStep: 0, busy: false, sealed: false, order: null, actionButton: null };
  orderFlow = flow;

  openSheet({
    title: "下单限时免运费",
    backdrop: "light",
    sheetClass: "sheet--order",
    body: orderSheetHtml(),
    actions: [{ label: "确认订单，去支付", kind: "primary", onClick: () => handleOrderFlowAction() }],
    onClose: () => resetOrderFlow(flow),
  });

  flow.actionButton = $("#sheetActions .btn");

  $("#checkoutForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    confirmOrderStep();
  });
  $$("#checkoutForm input, #checkoutForm textarea").forEach((input) => {
    input.addEventListener("input", () => {
      input.closest(".field")?.classList.remove("is-invalid");
      if ($("#formError")) $("#formError").textContent = "";
    });
  });
  $("#editConfig")?.addEventListener("click", () => {
    if (orderFlow?.sealed) {
      toast("已提交，如需修改请添加客服");
      return;
    }
    closeSheet();
    go("customize");
  });
  $("#checkoutForm .form-card")?.addEventListener("click", () => {
    if (orderFlow?.sealed) toast("已提交，如需修改请添加客服");
  });
  $("#orderSteps")?.addEventListener("click", (event) => {
    if (!orderFlow || orderFlow.busy) return;
    const button = event.target.closest("[data-order-step]");
    if (!button) return;
    const flow = orderFlow;
    const index = Number(button.dataset.orderStep);
    if (index > flow.maxStep) {
      toast("请先完成当前步骤");
      return;
    }
    if (index === flow.step) return;
    if (index === 1 && flow.step === 0 && !flow.sealed) {
      confirmOrderStep();
      return;
    }
    setOrderStep(index);
  });
  const serviceQr = $("#orderServiceQr");
  if (serviceQr) {
    serviceQr.addEventListener("error", () => {
      serviceQr.hidden = true;
      const fallback = $("#orderServiceQrFallback");
      if (fallback) fallback.hidden = false;
    });
  }

  renderCheckout();
  setupQr();
  setOrderStep(0);
  const body = $("#sheetBody");
  if (body) body.scrollTop = 0;
}

function resetOrderFlow(flow) {
  if (orderFlow !== flow) return;
  if (!flow.busy) {
    pendingOrder = null;
    try { sessionStorage.removeItem(STORAGE.pendingOrder); } catch { /* ignore */ }
  }
  orderFlow = null;
}

function setOrderStep(step) {
  const flow = orderFlow;
  if (!flow || step < 0 || step > 2 || step > flow.maxStep) return;
  flow.step = step;

  $$("[data-order-panel]").forEach((panel) => {
    panel.hidden = Number(panel.dataset.orderPanel) !== step;
  });
  $$("#orderSteps [data-order-step]").forEach((button, index) => {
    const selected = index === step;
    button.setAttribute("aria-selected", String(selected));
    const locked = !selected && index > flow.maxStep;
    button.classList.toggle("is-locked", locked);
    button.setAttribute("aria-disabled", String(locked));
  });

  const labels = ["确认订单，去支付", "我付好了，去加客服", "已加客服，查看订单"];
  const action = flow.actionButton;
  if (action) {
    action.textContent = flow.busy ? "正在提交…" : labels[step];
    action.disabled = flow.busy;
  }

  if (step === 1) {
    const order = pendingOrder || flow.order;
    if ($("#payAmount")) $("#payAmount").textContent = fmt(order?.price?.total ?? priceInfo().total);
    if ($("#payOrderNo")) $("#payOrderNo").textContent = order?.id || "—";
    setupQr();
  }

  if (flow.sealed) {
    $$("#checkoutForm input, #checkoutForm textarea").forEach((input) => { input.readOnly = true; });
    $("#checkoutForm .form-card")?.classList.add("is-sealed");
    if ($("#editConfig")) {
      $("#editConfig").hidden = false;
      $("#editConfig").classList.add("is-disabled");
      $("#editConfig").setAttribute("aria-disabled", "true");
    }
    if ($("#orderSealedHint")) $("#orderSealedHint").hidden = false;
  }
  const body = $("#sheetBody");
  if (body) body.scrollTop = 0;
}

function handleOrderFlowAction() {
  const flow = orderFlow;
  if (!flow || flow.busy) return;
  if (flow.step === 0) {
    if (flow.sealed) setOrderStep(1);
    else confirmOrderStep();
  } else if (flow.step === 1) {
    if (flow.sealed) setOrderStep(2);
    else finishPaymentStep();
  } else {
    finishAddStep();
  }
}

function confirmOrderStep() {
  const flow = orderFlow;
  if (!flow) return;
  if (flow.sealed) {
    toast("已提交，如需修改请添加客服");
    return;
  }
  const customer = getCustomer();
  const problems = validateCustomer(customer);
  const errorNode = $("#formError");
  if (problems.length) {
    if (errorNode) errorNode.textContent = problems[0];
    $(".field.is-invalid")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (errorNode) errorNode.textContent = "";
  writeStored(STORAGE.customer, customer);
  if (pendingOrder) {
    pendingOrder.customer = { ...customer };
  } else {
    pendingOrder = createOrder(customer);
  }
  try { sessionStorage.setItem(STORAGE.pendingOrder, JSON.stringify(pendingOrder)); } catch { /* ignore */ }
  flow.maxStep = Math.max(flow.maxStep, 1);
  setOrderStep(1);
}

async function finishPaymentStep() {
  const flow = orderFlow;
  if (!flow || flow.busy) return;
  if (!pendingOrder) {
    toast("订单信息还没准备好");
    setOrderStep(0);
    return;
  }
  flow.busy = true;
  setOrderStep(1);
  const order = pendingOrder;
  order.submitted = true;
  try {
    lastOrder = await submitOrder(order);
  } catch {
    lastOrder = order;
    saveLocalOrder(order);
    queueOrder(order);
  }
  pendingOrder = null;
  try { sessionStorage.removeItem(STORAGE.pendingOrder); } catch { /* ignore */ }
  if (orderFlow !== flow) return;
  flow.order = lastOrder;
  flow.sealed = true;
  flow.maxStep = 2;
  flow.busy = false;
  setOrderStep(2);
}

function finishAddStep() {
  const flow = orderFlow;
  if (!flow?.order) {
    toast("订单还没提交");
    return;
  }
  activeOrder = flow.order;
  closeSheet();
  go("order");
}

function setupQr() {
  const img = $("#payQr");
  const fallback = $("#payQrFallback");
  if (!img) return;
  if (!CONFIG.qrImage) {
    img.hidden = true;
    if (fallback) fallback.hidden = false;
    return;
  }
  if (img.dataset.loaded === "1") return;
  img.onload = () => {
    img.dataset.loaded = "1";
    img.classList.add("is-loaded");
    img.hidden = false;
    if (fallback) fallback.hidden = true;
  };
  img.onerror = () => {
    img.hidden = true;
    if (fallback) fallback.hidden = false;
  };
  img.src = CONFIG.qrImage;
}

/* ---------- 弹层 / Toast ---------- */
function openSheet({ title, body = "", actions = [], backdrop = "dark", onClose = null, sheetClass = "" }) {
  if (sheetOpen) sheetCleanup?.();
  sheetCleanup = onClose;
  lastFocused = document.activeElement;
  const sheet = $(".sheet");
  if (sheet) {
    sheet.classList.remove("sheet--install", "sheet--order");
    if (sheetClass) sheet.classList.add(sheetClass);
  }
  $("#sheetTitle").textContent = title;
  $("#sheetBody").innerHTML = body;
  const actionsRoot = $("#sheetActions");
  actionsRoot.innerHTML = "";
  actions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `btn ${action.kind === "primary" ? "btn-primary" : action.kind === "danger" ? "btn-outline danger" : "btn-text"}`;
    button.textContent = action.label;
    button.addEventListener("click", () => action.onClick?.(button));
    actionsRoot.appendChild(button);
  });
  $("#sheetRoot").classList.toggle("is-light", backdrop === "light");
  $("#sheetRoot").hidden = false;
  document.body.classList.add("sheet-open");
  sheetOpen = true;
  window.setTimeout(() => $(".sheet-close")?.focus(), 60);
}

function closeSheet() {
  if (!sheetOpen) return;
  sheetOpen = false;
  const cleanup = sheetCleanup;
  sheetCleanup = null;
  if (cleanup) cleanup();
  $(".sheet")?.classList.remove("sheet--install", "sheet--order");
  $("#sheetRoot").hidden = true;
  $("#sheetRoot").classList.remove("is-light");
  document.body.classList.remove("sheet-open");
  if (lastFocused?.focus) lastFocused.focus();
}

function disposeMiniInstall() {
  miniInstallToken++;
  miniInstallApi?.dispose();
  miniInstallApi = null;
}

function openInstallGuide(config = state) {
  disposeMiniInstall();
  const steps = installStepsFor(config);
  if (!steps.length) return;
  let replayCurrent = () => {};

  openSheet({
    title: "安装说明",
    backdrop: "light",
    sheetClass: "sheet--install",
    onClose: disposeMiniInstall,
    body: `
      <div class="mini-install">
        <nav class="mini-install-tabs" id="miniInstallTabs" role="tablist" aria-label="安装步骤"></nav>
        <div class="mini-install-stage" id="miniInstallStage" aria-label="安装步骤三维演示"></div>
        <div class="mini-install-copy">
          <b id="miniInstallTitle"></b>
          <p id="miniInstallDesc"></p>
        </div>
      </div>
    `,
    actions: [
      { label: "重新播放", kind: "primary", onClick: () => replayCurrent() },
    ],
  });

  const nav = $("#miniInstallTabs");
  const stage = $("#miniInstallStage");
  if (!nav || !stage) return;

  nav.innerHTML = steps
    .map((step, index) => `<button role="tab" aria-selected="false" data-key="${step.key}" type="button"><span class="mini-install-step">${stepMark(index)}</span>${step.name}</button>`)
    .join("");

  let currentKey = steps[0].key;
  const apply = (key, animate) => {
    const info = steps.find((step) => step.key === key) || steps[0];
    currentKey = info.key;
    nav.querySelectorAll("button").forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.key === info.key));
    });
    if ($("#miniInstallTitle")) $("#miniInstallTitle").textContent = info.title;
    if ($("#miniInstallDesc")) $("#miniInstallDesc").textContent = info.desc;
    miniInstallApi?.setStep(info.key, { animate });
  };

  replayCurrent = () => apply(currentKey, true);
  apply(currentKey, false);
  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-key]");
    if (button) apply(button.dataset.key, true);
  });

  const token = ++miniInstallToken;
  import("./install3d.js")
    .then(({ createInstallScene }) => {
      if (token !== miniInstallToken || !sheetOpen || !stage) return;
      try {
        miniInstallApi = createInstallScene(
          stage,
          { ...config, trimStyles: { ...(config.trimStyles || {}) } },
          { compact: true }
        );
        miniInstallApi.setStep(currentKey, { animate: true });
      } catch (error) {
        console.warn("半屏安装演示初始化失败", error);
        stage.classList.add("is-fallback");
        stage.textContent = "当前设备暂不支持 3D 演示";
      }
    })
    .catch((error) => {
      console.warn("半屏安装演示加载失败", error);
      stage.classList.add("is-fallback");
      stage.textContent = "当前设备暂不支持 3D 演示";
    });
}

function toast(message) {
  const node = $("#toast");
  if (!node) return;
  node.textContent = message;
  node.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => node.classList.remove("is-show"), 2400);
}

async function copyText(text, message = "已复制") {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
    return;
  } catch { /* fall through */ }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try { document.execCommand("copy"); toast(message); } catch { toast("复制失败，请手动选择"); }
  textarea.remove();
}

function openHelp(kind) {
  const art = (svg) => `<div class="sheet-help-art">${svg}</div>`;
  const measureArt = art(`<svg viewBox="0 0 320 116">
    <path d="M26 16v82" stroke="#c9b79d" stroke-width="1.6" stroke-dasharray="4 4"/>
    <path d="M20 96h280" stroke="#ddd2c2" stroke-width="1.2"/>
    <path d="M58 96V38h206v58" fill="#f5ecdf" stroke="#c9b79d" stroke-width="1.3" stroke-linejoin="round"/>
    <path d="M58 62h206" stroke="#e4d7c5" stroke-width="1"/>
    <path d="M68 30h186" stroke="#245c45" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M68 25v10m186-10v10" stroke="#245c45" stroke-width="1.2" stroke-linecap="round"/>
    <text x="161" y="22" text-anchor="middle" font-size="8" fill="#245c45">宽</text>
    <path d="M286 38v58" stroke="#245c45" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M281 38h10m-10 58h10" stroke="#245c45" stroke-width="1.2" stroke-linecap="round"/>
    <text x="300" y="70" font-size="8" fill="#245c45">深</text>
  </svg>`);
  const contents = {
    measure: {
      title: "量尺寸之前，先看三件事",
      body: `${measureArt}<ul class="sheet-list">
        <li>量油烟机本体，不量旧罩子或吊柜。</li>
        <li>宽度量最外沿；深度从墙面量到最外沿。</li>
        <li>高度从下横顶面量到烟道顶；靠墙侧和前侧分别量。</li>
      </ul><p class="sheet-note">拿不准就把正面和侧面照片发给客服，我们帮你核。</p>`,
    },
    chimney: {
      title: "上竖怎么量",
      body: `<p>上竖是烟道那一段。量三个数据：</p><ul class="sheet-list">
        <li><b>宽：</b>烟道左右最外沿的距离。</li>
        <li><b>深：</b>从墙面到烟道前外沿。</li>
        <li><b>高：</b>从下横顶面到烟道顶部。</li>
      </ul><p class="sheet-note">外罩会自动加 5mm 安装间隙，不用自己留。</p>`,
    },
    hood: {
      title: "下横怎么量",
      body: `<p>下横是集烟罩这一圈。量四个数据：</p><ul class="sheet-list">
        <li><b>宽 / 深：</b>油烟机本体的最外沿。</li>
        <li><b>靠墙侧高：</b>贴墙那一侧的高度。</li>
        <li><b>前侧高：</b>朝外这一侧的高度，通常比靠墙侧低。</li>
      </ul><p class="sheet-note">前侧高至少比靠墙侧低 30mm，页面会自动帮你限制。</p>`,
    },
    shim: {
      title: "垫高",
      body: `${art(`<svg viewBox="0 0 320 132">
        <path d="M30 12v108" stroke="#ddd2c2" stroke-width="1.2" stroke-dasharray="4 4"/>
        <rect x="58" y="14" width="204" height="60" rx="5" fill="#f4e8d8" stroke="#c9b79d" stroke-width="1.3"/>
        <rect x="74" y="74" width="172" height="16" rx="3" fill="#d8be9e" stroke="#b89d7a" stroke-width="1.2"/>
        <rect x="70" y="90" width="180" height="30" rx="3" fill="#e7e3db" stroke="#b7b1a6" stroke-width="1.2"/>
        <text x="160" y="48" text-anchor="middle" font-size="9" fill="#7a6248">装饰罩</text>
        <text x="160" y="86" text-anchor="middle" font-size="9" font-weight="600" fill="#7a5a35">垫高</text>
        <text x="160" y="110" text-anchor="middle" font-size="9" fill="#777a72">油烟机</text>
        <path d="M286 72V44" stroke="#245c45" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M280 50l6-8 6 8" fill="none" stroke="#245c45" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="298" y="62" font-size="8" fill="#245c45">抬高</text>
      </svg>`)}<p>油烟机位置偏低时，加垫高把装饰罩整体抬高，和吊柜、墙面齐平。</p><p class="sheet-note">5mm 一档，最高 60mm。</p>`,
    },
    install: {
      title: "安装小贴士",
      body: `<ul class="sheet-list">
        <li>先在地面把主体拼好，再整体套上去。</li>
        <li>曲面和装饰条最后贴，胶水未干前不要搬动。</li>
        <li>502 胶点涂即可，不要整条挤满，避免溢胶。</li>
        <li>刷漆薄涂两遍，每遍间隔 30 分钟，阴干 24 小时。</li>
      </ul><p class="sheet-note">需要视频？加微信 ${esc(CONFIG.wechatId)}，发你完整安装视频。</p>`,
    },
  };
  const content = contents[kind] || contents.measure;
  openSheet({ title: content.title, body: content.body, actions: [{ label: "知道了", kind: "primary" }] });
}

/* ---------- 事件 ---------- */
function bindEvents() {
  $$("[data-back]").forEach((button) => button.addEventListener("click", () => go(backTarget())));
  $$("[data-help]").forEach((button) => button.addEventListener("click", () => openHelp(button.dataset.help)));

  $$("#customizeTabs button").forEach((button) => {
    button.addEventListener("click", () => {
      const tab = button.dataset.tab;
      setCustomizeTab(tab);
      previewApi?.highlightPart(tab);
      previewApi?.focusView(tab === "decor" ? "curve" : tab);
    });
  });

  for (const container of [$("#chimneyDims"), $("#hoodDims"), $("#notchDims")]) {
    if (!container) continue;
    container.addEventListener("click", (event) => {
      const stepButton = event.target.closest("[data-step]");
      if (!stepButton) return;
      const row = stepButton.closest(".dim-row");
      const key = row?.dataset.dim;
      if (!key) return;
      setDim(key, Number(state[key]) + Number(stepButton.dataset.step), false);
    });
    container.addEventListener("input", (event) => {
      if (!event.target.matches("input")) return;
      const row = event.target.closest(".dim-row");
      const key = row?.dataset.dim;
      if (!key) return;
      const value = Number(event.target.value);
      if (!Number.isFinite(value)) return;
      const dim = DIMS[key];
      state[key] = clamp(value, dim.min, dim.max);
      normalizeState();
      syncUI({ activeInput: event.target, writeInputs: true });
      markDirty();
    });
    container.addEventListener("change", (event) => {
      if (!event.target.matches("input")) return;
      const row = event.target.closest(".dim-row");
      const key = row?.dataset.dim;
      if (!key) return;
      setDim(key, Number(event.target.value), false);
    });
    container.addEventListener("click", (event) => {
      const row = event.target.closest(".dim-row");
      if (!row) return;
      const view = DIM_VIEW[row.dataset.dim];
      if (view) previewApi?.focusView(view);
    });
  }

  $(".shim-row")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-shim-step]");
    if (!button) return;
    state.shimHeight = clamp(Number(state.shimHeight) + Number(button.dataset.shimStep), 0, 60);
    syncUI({ writeInputs: true });
    markDirty();
  });
  $(".shim-row")?.addEventListener("click", () => previewApi?.focusView("shim"));

  $("#notchOptions")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-notch]");
    if (!button) return;
    state.notchShape = button.dataset.notch;
    state.notchEnabled = true;
    syncUI();
    markDirty();
  });

  $("#curveOptions")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-curve]");
    if (!button) return;
    state.surfaceType = button.dataset.curve;
    syncUI();
    markDirty();
  });
  $("#startOptions")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-start]");
    if (!button) return;
    state.surfaceStart = button.dataset.start;
    syncUI();
    markDirty();
  });
  $("#trimList")?.addEventListener("click", (event) => {
    const row = event.target.closest("[data-trim-position]");
    if (!row) return;
    openTrimPicker(row.dataset.trimPosition);
  });
  $("#sheetBody")?.addEventListener("click", (event) => {
    const card = event.target.closest("[data-pick-trim]");
    if (!card) return;
    const key = card.dataset.pickTrim;
    const styleId = card.dataset.trimStyle;
    if (!TRIM_POSITIONS.some((position) => position.key === key)) return;
    if (!TRIMS.some((trim) => trim.id === styleId)) return;
    state.trimStyles = { ...state.trimStyles, [key]: styleId };
    syncUI({ writeInputs: true });
    markDirty();
    $$("#sheetBody .trim-picker-card").forEach((card) => {
      card.classList.toggle("is-active", card.dataset.pickTrim === key && card.dataset.trimStyle === styleId);
    });
    const pickerTotal = $("#pickerTrimTotal");
    if (pickerTotal) pickerTotal.textContent = fmt(priceInfo().trim);
  });

  $$('[data-action="clear"]').forEach((button) => {
    button.addEventListener("click", () => {
      openSheet({
        title: "重置当前定制？",
        body: "<p>尺寸和装饰会恢复默认。</p>",
        actions: [
          {
            label: "重置", kind: "danger", onClick: () => {
              Object.assign(state, DEFAULTS, { trimStyles: { ...DEFAULTS.trimStyles } });
              normalizeState();
              syncUI({ writeInputs: true });
              setCustomizeTab("upper");
              closeSheet();
              toast("已恢复默认方案");
            },
          },
          { label: "取消", kind: "text", onClick: closeSheet },
        ],
      });
    });
  });

  $("#nextBtn")?.addEventListener("click", () => openOrderSheet());
  $("#installGuideBtn")?.addEventListener("click", () => openInstallGuide());
  $("#orderInstallBtn")?.addEventListener("click", () => {
    if (activeOrder) openInstallGuide(orderInstallConfig(activeOrder));
  });

  $("#orderSearchForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    searchOrders($("#orderPhone")?.value);
  });
  $("#orderPhone")?.addEventListener("input", (event) => {
    event.target.value = normalizePhone(event.target.value);
  });
  $("#orderResults")?.addEventListener("click", (event) => {
    const card = event.target.closest("[data-order-id]");
    if (!card) return;
    openOrderDetail(orderResultsCache.find((order) => order.id === card.dataset.orderId));
  });
  $("#orderResults")?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-order-id]");
    if (!card) return;
    event.preventDefault();
    openOrderDetail(orderResultsCache.find((order) => order.id === card.dataset.orderId));
  });
  $("#ordersBottomContact")?.addEventListener("click", openServiceSheet);
  $("#installBack")?.addEventListener("click", () => go("customize"));
  $("#installNext")?.addEventListener("click", () => openOrderSheet());
  $("#installTabs")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-key]");
    if (!button) return;
    setInstallStep(button.dataset.key, true);
  });
  $("#replayBtn")?.addEventListener("click", () => setInstallStep(activeInstallKey, true));

  $("#sheetRoot")?.addEventListener("click", (event) => {
    if (event.target.closest("[data-sheet-close]")) closeSheet();
    const copyButton = event.target.closest("[data-copy-value]");
    if (copyButton) copyText(copyButton.dataset.copyValue);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sheetOpen) closeSheet();
    if (event.key === "Tab" && sheetOpen) {
      const focusables = $$("button, [href], input, textarea, [tabindex]:not([tabindex='-1'])", $("#sheetRoot"));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  window.addEventListener("hashchange", renderRoute);
  window.addEventListener("online", flushPending);
  window.addEventListener("pageshow", flushPending);
}

/* ---------- 初始化 ---------- */
async function init() {
  await loadSiteContent();
  state = { ...DEFAULTS, trimStyles: { ...DEFAULTS.trimStyles } };
  normalizeState();

  renderHomeCases();
  renderDims();
  renderCurveOptions();
  renderStartOptions();
  renderTrimList();
  renderNotchOptions();
  renderNotchDims();

  bindEvents();
  syncUI({ writeInputs: true });
  renderRoute();
  flushPending();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopCaseAuto();
    else if (currentRoute() === "home") restartCaseAuto();
  });
}

init();
