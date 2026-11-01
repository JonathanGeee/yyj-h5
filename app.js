/* 烟罩实验室 H5
 * 所有价格、微信号、收款码和后台地址都集中在 CONFIG，改这里即可。
 */
const CONFIG = {
  basePrice: 700,
  trimPrices: { none: 0, single: 30, double: 50, corner: 40 },
  wechatId: "yanzhaolab",
  qrImage: "assets/wechat-qr.svg",
  orderEndpoint: location.hostname.endsWith("github.io")
    ? "https://yyj-h5-d5gaovp196680d93f-1258663924.ap-shanghai.app.tcloudbase.com/api/orders"
    : "/api/orders",
};

const STYLES = [
  {
    id: "cloud", name: "云朵弧", tone: "暖米", desc: "向内微凹 · 双眼皮",
    curve: "concave", start: "middle",
    dims: { hoodWidth: 900, hoodDepth: 500, rearHeight: 420, frontHeight: 280, chimneyWidth: 320, chimneyDepth: 300, chimneyHeight: 720 },
    trims: { top: "corner", start: "double", hoodTop: "single", hoodBottom: "single" },
  },
  {
    id: "tall", name: "高弧", tone: "暖米", desc: "高烟道 · 长弧",
    curve: "concave", start: "top",
    dims: { hoodWidth: 960, hoodDepth: 490, rearHeight: 400, frontHeight: 260, chimneyWidth: 360, chimneyDepth: 320, chimneyHeight: 820 },
    trims: { top: "corner", start: "single", hoodTop: "double", hoodBottom: "single" },
  },
  {
    id: "line", name: "直边梯形", tone: "暖米", desc: "直边梯形 · 单眼皮",
    curve: "flat", start: "middle",
    dims: { hoodWidth: 880, hoodDepth: 470, rearHeight: 380, frontHeight: 250, chimneyWidth: 420, chimneyDepth: 320, chimneyHeight: 620 },
    trims: { top: "corner", start: "single", hoodTop: "single", hoodBottom: "single" },
  },
  {
    id: "arch", name: "微拱门", tone: "暖米", desc: "向外微凸 · 单眼皮",
    curve: "convex", start: "middle",
    dims: { hoodWidth: 980, hoodDepth: 520, rearHeight: 300, frontHeight: 200, chimneyWidth: 460, chimneyDepth: 360, chimneyHeight: 560 },
    trims: { top: "none", start: "none", hoodTop: "single", hoodBottom: "single" },
  },
  {
    id: "retro", name: "海棠边", tone: "暖米", desc: "向内微凹 · 顶角条",
    curve: "concave", start: "top",
    dims: { hoodWidth: 880, hoodDepth: 470, rearHeight: 400, frontHeight: 270, chimneyWidth: 340, chimneyDepth: 300, chimneyHeight: 680 },
    trims: { top: "corner", start: "corner", hoodTop: "single", hoodBottom: "single" },
  },
  {
    id: "float", name: "悬浮边", tone: "暖米", desc: "方块 · 无装饰条",
    curve: "flat", start: "middle",
    dims: { hoodWidth: 1000, hoodDepth: 520, rearHeight: 360, frontHeight: 240, chimneyWidth: 640, chimneyDepth: 380, chimneyHeight: 760 },
    trims: { top: "none", start: "none", hoodTop: "none", hoodBottom: "none" },
  },
  {
    id: "crown", name: "方冠", tone: "暖米", desc: "方块 · 顶角条",
    curve: "flat", start: "middle",
    dims: { hoodWidth: 1020, hoodDepth: 520, rearHeight: 380, frontHeight: 250, chimneyWidth: 700, chimneyDepth: 400, chimneyHeight: 820 },
    trims: { top: "corner", start: "none", hoodTop: "double", hoodBottom: "single" },
  },
];

// 首页案例：替换 image 为 AI 实拍图即可；实拍图建议把 fit 改成 "cover"。
// name 是案例名；说明行由 STYLES 里的 desc（曲面 + 装饰条）和 tone（颜色）自动生成。
const HOME_CASES = [
  { styleId: "cloud", name: "云朵弧", image: "assets/styles/cloud.png", model: "assets/styles/cloud.png", fit: "contain" },
  { styleId: "tall", name: "高弧", image: "assets/styles/tall.png", model: "assets/styles/tall.png", fit: "contain" },
  { styleId: "line", name: "直边梯形", image: "assets/styles/line.png", model: "assets/styles/line.png", fit: "contain" },
  { styleId: "arch", name: "微拱门", image: "assets/styles/arch.png", model: "assets/styles/arch.png", fit: "contain" },
  { styleId: "retro", name: "海棠边", image: "assets/styles/retro.png", model: "assets/styles/retro.png", fit: "contain" },
  { styleId: "float", name: "悬浮边", image: "assets/styles/float.png", model: "assets/styles/float.png", fit: "contain" },
  { styleId: "crown", name: "方冠", image: "assets/styles/crown.png", model: "assets/styles/crown.png", fit: "contain" },
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
  frontHeight: { label: "前侧高", hint: "朝外这一侧", min: 120, max: 400, step: 10 },
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
];

function allowedStarts(type) {
  if (type === "convex") {
    return [{ id: "middle", label: "中间" }, { id: "lower", label: "中间偏下" }];
  }
  if (type === "flat") {
    return [{ id: "middle", label: "中间" }, { id: "top", label: "顶部" }];
  }
  return [{ id: "middle", label: "中间" }, { id: "top", label: "上面" }];
}

function startLabelFor(type = state.surfaceType, value = state.surfaceStart) {
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

function curveArt(type) {
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
  if (!["middle", "top", "lower"].includes(next.surfaceStart)) next.surfaceStart = DEFAULTS.surfaceStart;
  const legacy = input?.trimStyle;
  for (const position of TRIM_POSITIONS) {
    const value = input?.trimStyles?.[position.key] ?? legacy;
    next.trimStyles[position.key] = TRIMS.some((trim) => trim.id === value)
      ? value
      : DEFAULTS.trimStyles[position.key];
  }
  return next;
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
  state.frontHeight = Math.min(state.frontHeight, state.rearHeight - 30);
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
  const details = TRIM_POSITIONS.map((position) => {
    const trim = trimFor(position.key);
    return { ...position, styleId: trim.id, styleName: trim.name, price: trim.price };
  });
  const trim = details.reduce((sum, item) => sum + item.price, 0);
  return { base: CONFIG.basePrice, trim, total: CONFIG.basePrice + trim, details };
}
function trimSummaryShort(styles = state.trimStyles) {
  return TRIM_POSITIONS.map((position) => {
    const trim = TRIMS.find((item) => item.id === styles?.[position.key]) || TRIMS[0];
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
      <img class="case-image ${item.fit === "cover" ? "is-cover" : ""}" src="${esc(item.image)}" alt="${esc(item.name)}烟机罩案例" ${index ? 'loading="lazy"' : ""} draggable="false" />
      <div class="case-shade"></div>
      <div class="case-meta">
        <p class="case-kicker">定制 PVC 烟机罩</p>
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
    `<button class="notch-option" type="button" data-notch="${shape.id}">${shape.label}</button>`
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
  list.innerHTML = TRIM_POSITIONS.map((position) => {
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
  const startOptions = allowedStarts(state.surfaceType);
  const signature = startOptions.map((item) => `${item.id}:${item.label}`).join(",");
  const currentSignature = $$("#startOptions button").map((button) => `${button.dataset.start}:${button.textContent}`).join(",");
  if (signature !== currentSignature) {
    renderStartOptions();
  }
  $$("#startOptions button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.start === state.surfaceStart);
  });

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
  if ($("#checkoutPriceBtn")) $("#checkoutPriceBtn").textContent = fmt(price.total);

  if (currentRoute() === "checkout") renderCheckoutSummary();
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
const ROUTES = ["home", "orders", "order", "customize", "install", "checkout", "pay", "done"];
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
  return ({ orders: "home", order: "orders", customize: "home", install: "customize", checkout: "customize", pay: "checkout", done: "home" })[currentRoute()] || "home";
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
  if (route === "checkout") {
    renderCheckout();
  }
  if (route === "pay") {
    renderPay();
  }
  if (route === "done") {
    renderDone();
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
const INSTALL_STEPS = {
  base: {
    name: "主体拼接",
    title: "先围三面，再上正面板",
    desc: "左右侧板先立，有垫高时垫板贴到内侧面；顶板从上往下压住，最后正面板从前往后盖上。上竖同样先立两侧，再上正面板。",
  },
  curve: {
    name: "曲面装饰",
    title: "把 3 块曲面装饰压到接缝上",
    desc: "对准上竖与下横的接缝，从上往下压合，左右对称后再上胶固定。",
  },
  trim: {
    name: "装饰条",
    title: "切出海棠角，再装装饰条",
    desc: "先用美工刀在两端切出 45° 海棠角；切好后直接贴回罩体，再逐段压紧 30 秒。",
  },
  paint: {
    name: "刷漆",
    title: "刷成可可蛋奶色",
    desc: "从基础白薄涂两遍，间隔 30 分钟，阴干 24 小时。",
  },
};

function hasSurfaceCurve() {
  return state.surfaceType !== "flat";
}

function hasAnyTrim() {
  const styles = state.trimStyles || {};
  return TRIM_POSITIONS.some(({ key }) => (styles[key] || "none") !== "none");
}

function installStepsFor(config) {
  const keys = ["base"];
  if (config.surfaceType !== "flat") keys.push("curve");
  const styles = config.trimStyles || {};
  if (TRIM_POSITIONS.some(({ key }) => (styles[key] || "none") !== "none")) keys.push("trim");
  keys.push("paint");
  return keys.map((key) => ({ key, ...INSTALL_STEPS[key] }));
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
        <span>${String(index + 1).padStart(2, "0")}</span>${step.name}
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
  const curveLabel = state.surfaceType === "flat"
    ? `不弯曲 · ${start}`
    : `${state.surfaceType === "convex" ? "向外弯曲" : "向内弯曲"} · ${start}`;
  summary.innerHTML = [
    sumRow("款式", `${style.name} · ${style.tone}`),
    sumRow("下横", `${state.hoodWidth} × ${state.hoodDepth}mm`),
    sumRow("侧高", `靠墙 ${state.rearHeight} / 前侧 ${state.frontHeight}mm`),
    sumRow("上竖", `${state.chimneyWidth} × ${state.chimneyDepth} × ${state.chimneyHeight}mm`),
    sumRow("曲面", curveLabel),
    sumRow("装饰条", trimSummaryShort(state.trimStyles)),
    sumRow("垫高", `${state.shimHeight}mm`),
    sumRow("主体", fmt(CONFIG.basePrice)),
    sumRow("装饰", fmt(price.trim)),
  ].join("");
}

function renderCheckout() {
  renderCheckoutSummary();
  const price = priceInfo();
  if ($("#checkoutPrice")) $("#checkoutPrice").textContent = fmt(price.total);
  if ($("#checkoutPriceBtn")) $("#checkoutPriceBtn").textContent = fmt(price.total);
  const saved = readStored(STORAGE.customer, null);
  if (saved) {
    const fields = { coName: "name", coPhone: "phone", coRegion: "region", coAddress: "address" };
    for (const [id, key] of Object.entries(fields)) {
      const input = $(`#${id}`);
      if (input && !input.value) input.value = saved[key] || "";
    }
  }
  $("#formError").textContent = "";
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
      ${CONFIG.qrImage ? `<img class="order-detail-qr" src="${esc(CONFIG.qrImage)}" alt="客服微信二维码" />` : ""}
      <p class="order-detail-wechat">微信号 <b>${esc(CONFIG.wechatId)}</b></p>
    </section>
  `;
}

function openServiceSheet() {
  openSheet({
    title: "联系客服",
    backdrop: "light",
    body: `
      <div class="service-qr"><img src="${esc(CONFIG.qrImage)}" alt="客服微信二维码" /></div>
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
  return {
    ...DEFAULTS,
    ...config,
    trimStyles: { ...DEFAULTS.trimStyles, ...(config.trimStyles || {}) },
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

/* ---------- 支付与完成 ---------- */
function renderPay() {
  if (!pendingOrder) {
    pendingOrder = (() => {
      try { return JSON.parse(sessionStorage.getItem(STORAGE.pendingOrder) || "null"); } catch { return null; }
    })();
  }
  if (!pendingOrder) {
    const previous = readStored(STORAGE.lastOrder, null);
    if (previous?.submitted) {
      lastOrder = previous;
      go("done", { replace: true });
      return;
    }
    const saved = readStored(STORAGE.customer, null);
    if (saved) {
      pendingOrder = createOrder(saved);
      try { sessionStorage.setItem(STORAGE.pendingOrder, JSON.stringify(pendingOrder)); } catch { /* ignore */ }
    } else {
      go("checkout", { replace: true });
      toast("先填一下收货信息");
      return;
    }
  }
  if ($("#payAmount")) $("#payAmount").textContent = fmt(pendingOrder.price?.total ?? priceInfo().total);
  if ($("#payOrderNo")) $("#payOrderNo").textContent = pendingOrder.id || "—";
  setupQr();
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

function openPaymentSheet() {
  if (!pendingOrder) {
    toast("订单信息还没准备好");
    return;
  }
  const orderId = pendingOrder.id;
  openSheet({
    title: "还差一步",
    body: `
      <p>添加好友并发送<b>订单号和付款截图</b>，即可安排优先发货。</p>
      <div class="copy-row"><span>订单号</span><b>${esc(orderId)}</b><button type="button" data-copy-value="${esc(orderId)}">复制</button></div>
      <div class="copy-row"><span>微信号</span><b>${esc(CONFIG.wechatId)}</b><button type="button" data-copy-value="${esc(CONFIG.wechatId)}">复制</button></div>
      <p class="sheet-note">发送后客服会核对订单，并确认制作与发货排期。</p>
    `,
    actions: [
      { label: "好的，去添加", kind: "primary", onClick: (button) => confirmPayment(button) },
      { label: "我还没付", kind: "text", onClick: closeSheet },
    ],
  });
}

async function confirmPayment(button) {
  if (!pendingOrder) return;
  if (pendingOrder.submitted) {
    closeSheet();
    go("done");
    return;
  }
  button.disabled = true;
  button.textContent = "正在提交…";
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
  closeSheet();
  go("done");
}

function renderDone() {
  if (!lastOrder) lastOrder = readStored(STORAGE.lastOrder, null);
  if ($("#doneOrderNo")) $("#doneOrderNo").textContent = lastOrder?.id || "—";
  if ($("#doneWechat")) $("#doneWechat").textContent = CONFIG.wechatId;
}

function orderMessage(order) {
  if (!order) return "";
  const config = order.config || {};
  const style = order.style || {};
  const customer = order.customer || {};
  const curveType = config.surfaceType || "concave";
  const start = startLabelFor(curveType, config.surfaceStart);
  const curve = curveType === "flat"
    ? `不弯曲 · ${start}`
    : `${curveType === "convex" ? "向外弯曲" : "向内弯曲"} · ${start}`;
  const trimLines = Array.isArray(order.price?.trimDetails)
    ? order.price.trimDetails.map((item) => `装饰条·${item.name}：${item.styleName}${item.price ? ` ${fmt(item.price)}` : " 免费"}`)
    : [`装饰条：${order.price?.trimName || "无"}`];
  return [
    `订单号：${order.id}`,
    `款式：${style.name || ""} · ${style.tone || ""}`,
    `下横：${config.hoodWidth} × ${config.hoodDepth}mm`,
    `侧高：靠墙 ${config.rearHeight} / 前侧 ${config.frontHeight}mm`,
    `上竖：${config.chimneyWidth} × ${config.chimneyDepth} × ${config.chimneyHeight}mm`,
    `曲面：${curve}`,
    ...trimLines,
    `垫高：${config.shimHeight}mm`,
    `合计：${fmt(order.price?.total || 0)}`,
    `收货：${customer.name || ""} ${customer.phone || ""} ${customer.region || ""} ${customer.address || ""}`,
    customer.note ? `备注：${customer.note}` : "",
  ].filter(Boolean).join("\n");
}

/* ---------- 弹层 / Toast ---------- */
function openSheet({ title, body = "", actions = [], backdrop = "dark", onClose = null }) {
  if (sheetOpen) sheetCleanup?.();
  sheetCleanup = onClose;
  lastFocused = document.activeElement;
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

  openSheet({
    title: "安装说明",
    backdrop: "light",
    onClose: disposeMiniInstall,
    body: `
      <div class="mini-install">
        <nav class="mini-install-tabs" id="miniInstallTabs" role="tablist" aria-label="安装步骤"></nav>
        <div class="mini-install-stage" id="miniInstallStage" aria-label="安装步骤三维演示"></div>
        <div class="mini-install-copy">
          <b id="miniInstallTitle"></b>
          <p id="miniInstallDesc"></p>
        </div>
        <button class="mini-install-replay" id="miniInstallReplay" type="button">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 9a6 6 0 1 1 1.4 5.4M4 4v5h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          重新播放
        </button>
      </div>
    `,
  });

  const nav = $("#miniInstallTabs");
  const stage = $("#miniInstallStage");
  if (!nav || !stage) return;

  nav.innerHTML = steps
    .map((step) => `<button role="tab" aria-selected="false" data-key="${step.key}" type="button">${step.name}</button>`)
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

  apply(currentKey, false);
  nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-key]");
    if (button) apply(button.dataset.key, true);
  });
  $("#miniInstallReplay")?.addEventListener("click", () => apply(currentKey, true));

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
      title: "垫高是什么？",
      body: `${art(`<svg viewBox="0 0 320 110">
        <path d="M40 14v82" stroke="#ddd2c2" stroke-width="1.2" stroke-dasharray="4 4"/>
        <path d="M58 44h204v8H58z" fill="#f2e2cb" stroke="#c9b79d" stroke-width="1.2"/>
        <rect x="74" y="52" width="14" height="10" fill="#e6d2b7" stroke="#c9b79d" stroke-width="1"/>
        <rect x="232" y="52" width="14" height="10" fill="#e6d2b7" stroke="#c9b79d" stroke-width="1"/>
        <path d="M74 62h172v30H74z" fill="#faf5ec" stroke="#c9b79d" stroke-width="1.2"/>
        <path d="M286 82V46" stroke="#245c45" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M280 52l6-8 6 8" fill="none" stroke="#245c45" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="286" y="96" font-size="9" fill="#245c45" text-anchor="middle">垫高</text>
      </svg>`)}<p>如果油烟机顶面偏低、上方空出一截，垫高会把整个装饰罩一起抬高，让外罩和吊柜、墙面更贴合。</p><ul class="sheet-list">
        <li>5mm 一档，最多 60mm。</li>
        <li>外罩总高度会跟着一起变，比例不会失调。</li>
        <li>垫板藏在罩体内部，外观上看不出来。</li>
      </ul><p class="sheet-note">拿不准要不要垫？把吊柜到油烟机的照片发给客服，我们帮你看。</p>`,
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

  $("#nextBtn")?.addEventListener("click", () => go("checkout"));
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
  $("#installNext")?.addEventListener("click", () => go("checkout"));
  $("#installTabs")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-key]");
    if (!button) return;
    setInstallStep(button.dataset.key, true);
  });
  $("#replayBtn")?.addEventListener("click", () => setInstallStep(activeInstallKey, true));

  $("#editConfig")?.addEventListener("click", () => go("customize"));

  $("#checkoutForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const customer = getCustomer();
    const problems = validateCustomer(customer);
    const errorNode = $("#formError");
    if (problems.length) {
      errorNode.textContent = problems[0];
      const firstInvalid = $(".field.is-invalid");
      firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    errorNode.textContent = "";
    writeStored(STORAGE.customer, customer);
    pendingOrder = createOrder(customer);
    try { sessionStorage.setItem(STORAGE.pendingOrder, JSON.stringify(pendingOrder)); } catch { /* ignore */ }
    go("pay");
  });
  $$("#checkoutForm input, #checkoutForm textarea").forEach((input) => {
    input.addEventListener("input", () => {
      input.closest(".field")?.classList.remove("is-invalid");
      $("#formError").textContent = "";
    });
  });

  $("#payDone")?.addEventListener("click", openPaymentSheet);
  $("#doneHome")?.addEventListener("click", () => {
    Object.assign(state, DEFAULTS);
    normalizeState();
    syncUI({ writeInputs: true });
    go("home");
  });
  $("#copyOrderBtn")?.addEventListener("click", () => {
    if (!lastOrder) {
      toast("订单信息还没准备好");
      return;
    }
    copyText(orderMessage(lastOrder), "订单信息已复制，去微信粘贴发送");
  });
  $$("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = $(`#${button.dataset.copyTarget}`);
      if (target) copyText(target.textContent.trim());
    });
  });

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

  const renderId = new URLSearchParams(location.search).get("render");
  if (renderId) {
    const style = STYLES.find((item) => item.id === renderId);
    if (style) {
      const host = document.createElement("div");
      host.style.cssText = "position:fixed;left:-9999px;top:0;width:868px;height:496px;background:#fff";
      document.body.appendChild(host);
      import("./preview.js").then(({ createPreview }) => {
        const preset = {
          ...DEFAULTS,
          ...style.dims,
          styleId: style.id,
          surfaceType: style.curve,
          surfaceStart: style.start,
          trimStyles: { ...style.trims },
          shimHeight: 0,
        };
        const dirParam = new URLSearchParams(location.search).get("dir");
        const dir = dirParam ? dirParam.split(",").map(Number) : null;
        const api = createPreview(host, preset, dir && dir.length === 3 ? { direction: dir } : {});
        setTimeout(() => { window.__renderPng = api.snapshot(); }, 900);
      });
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopCaseAuto();
    else if (currentRoute() === "home") restartCaseAuto();
  });
}

init();
