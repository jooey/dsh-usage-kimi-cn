window.__ModuleLoader__.load({
id: "dsh-usage-kimi-cn",
factory: (require) => {
var module = { exports: {} };
var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

let React = require("react");

/* Client-face Typert remote manifest (hand-written, no build step). */
const kimiUsageSnapshotResult$schema = {
  parse(value) {
    if (!value || typeof value !== "object") {
      throw new TypeError("expected a kimi usage snapshot object");
    }
    const parseWindow = (w) => {
      if (!w || typeof w !== "object") return null;
      return {
        label: typeof w.label === "string" ? w.label : "Window",
        duration: typeof w.duration === "number" ? w.duration : null,
        timeUnit: typeof w.timeUnit === "string" ? w.timeUnit : null,
        limit: typeof w.limit === "string" ? w.limit : null,
        remaining: typeof w.remaining === "string" ? w.remaining : null,
        percent: typeof w.percent === "number" ? w.percent : null,
        resetTime: typeof w.resetTime === "string" ? w.resetTime : null
      };
    };
    const parseOverall = (o) => {
      if (o === null || o === undefined) return null;
      if (typeof o !== "object") return null;
      return {
        limit: typeof o.limit === "string" ? o.limit : null,
        remaining: typeof o.remaining === "string" ? o.remaining : null,
        percent: typeof o.percent === "number" ? o.percent : null,
        resetTime: typeof o.resetTime === "string" ? o.resetTime : null
      };
    };
    return {
      overall: parseOverall(value.overall),
      windows: Array.isArray(value.windows)
        ? value.windows.map(parseWindow).filter(Boolean)
        : [],
      membership: typeof value.membership === "string" ? value.membership : null
    };
  }
};

/** Kimi Code platform URL (kept in sync with lib/logic.js). */
const PLATFORM_URL = "https://www.kimi.com/code";
/** Provider id registered by dsh-llm-kimi-cn. */
const KIMI_CN_PROVIDER = "kimi-coding";

/** Upper bound for the chip at wide row widths (the original fixed cap). */
const CHIP_MAX_WIDTH = 360;
/** Below this measured width the text is useless — keep the icon only. */
const CHIP_TEXT_MIN_WIDTH = 80;

/** One-time injected keyframes for the overflow marquee effect. */
const MARQUEE_STYLE_ID = "kimi-usage-marquee-style";

/** Marquee: on hover, when the content overflows, slide it left and loop. */
function ensureMarqueeStyle() {
  if (typeof document === "undefined" || document.getElementById(MARQUEE_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = MARQUEE_STYLE_ID;
  style.textContent = [
    "@keyframes kimiUsageMarquee {",
    "  0%, 10% { transform: translateX(0); }",
    "  90%, 100% { transform: translateX(var(--marquee-shift, -100%)); }",
    "}",
    ".kimi-usage-marquee:hover .kimi-usage-marquee-track {",
    "  animation: kimiUsageMarquee 9s linear infinite;",
    "}"
  ].join("\n");
  document.head.appendChild(style);
}

/**
 * Fit the chip to the space the composer row actually leaves over.
 *
 * The shell renders this chip as a direct item of the `.trailing` group, which
 * is `flex:none` (it hugs its content and never shrinks), while the left
 * `.tools` group (attach / "Full access" / plan) does shrink. A fixed
 * `max-width` therefore either overlaps the left group when the page narrows
 * or needlessly truncates the text when it doesn't. Instead, measure the real
 * layout — the row's inner width minus the left tools and the trailing group's
 * other items — and cap the chip at exactly the remainder.
 */
function fitChipWidth(chip, onCap) {
  const slotWrapper = chip.closest("[data-slot]");
  const trailing = slotWrapper ? slotWrapper.parentElement : null;
  const row = trailing ? trailing.parentElement : null;
  if (!trailing || !row) return null;
  const tools = row.firstElementChild !== trailing ? row.firstElementChild : null;

  const fit = () => {
    if (!chip.isConnected) return;
    const cs = getComputedStyle(row);
    const inner = row.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    const gap = parseFloat(cs.gap) || 0;
    const toolsWidth = tools ? tools.scrollWidth : 0;
    const othersWidth = trailing.scrollWidth - chip.offsetWidth;
    const target = inner - gap - toolsWidth - othersWidth;
    onCap(Math.max(0, Math.min(CHIP_MAX_WIDTH, target - 14))); /* FIT_SAFETY: headroom for the new display:contents composer row, prevents wrap */
  };

  fit();
  const observer = new ResizeObserver(fit);
  observer.observe(row);
  observer.observe(trailing);
  return () => observer.disconnect();
}

const TYPERT_REMOTE = {
  package: "dsh-usage-kimi-cn",
  descriptors: [
    {
      id: "dsh-usage-kimi-cn#kimiUsage/snapshot",
      service: "kimiUsage",
      namespace: "kimiUsage",
      method: "snapshot",
      invocation: { kind: "direct" },
      parameters: [],
      result: {
        mode: "strict",
        typeSymbol: "dsh-usage-kimi-cn/types#KimiUsageSnapshot",
        schema: kimiUsageSnapshotResult$schema
      },
      sourceLocation: { file: "lib/index.js", line: 1, column: 1 }
    }
  ]
};

/** Format one percent value for the compact composer readout. */
function formatPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "n/a";
  return n.toFixed(1) + "%";
}

/** Format an ISO reset timestamp into a short "Xd Yh Ym" countdown string. */
function formatRemainsShort(isoString) {
  if (typeof isoString !== "string") return null;
  const ts = Date.parse(isoString);
  if (!Number.isFinite(ts)) return null;
  const diffMs = ts - Date.now();
  if (diffMs <= 0) return null;
  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(days + "d");
  if (hours > 0 || days > 0) parts.push(hours + "h");
  parts.push(minutes + "m");
  return parts.join(" ");
}

/** Kimi official favicon (https://www.kimi.com/favicon-light.ico) embedded as a data URI.
    The icon is a black rounded square with a white K — self-contained, so it
    renders correctly on both light and dark themes without any theme-tinting. */
const KIMI_ICON_DATA_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAD4klEQVR42rVXTUhjVxT+7n3PJDZDg9iGUatSpchIN22dLqzTLoqLSqCLge5cCYIMghs74NYgCu4VXJYgoghuhFYEIQkS40IhUArdKP0huAjYajTv3ffNwvveJJrEOPM8cODx3n33+8757j33XOCtCQASj29SYwEAzFsfHQBPAbwA8BzAJ1XGPNRsAH8DOACQAvBvOYFyawLwE4DfAfCR/A+NYd5OSQBAXLOlzoQCYPnktp6T+jmuMT3JX90C9jFqQUiDEJJ6bpfIKxf8S62RU5aBx3EhWJaNvwB8YQB4DWBYDzL8W+w360wEniD02Q+AGYTzf96VnAAiAK4A4FAzcmoxFzfMHxapEBRmMyMvf+HTOfLjn/9hoPs7/V26eFkJ4JmmK2rFQrJ+rELc/gEgIVs+RfDzl6Btw4y2Idj/ozvAxXtmAvigZsWQEsFgEEII2LaNUqlUFZwkhBBobm6+eZYSVBYs2QQBAREwoc7/Q+kkWSYPASCMeinv7+/n3t4ej46OODc3d0cOKSUBsKOjg6urq8xms8xkMkymUvz6+VdE04d88s0Uwy9eM9Dz/dtdUYlXm8DQ0BCVUiTJra0tD1QI4YF3dXVxZ2eH5TYzM0MpDQrR0JqpTWBwcJCXl5dUSnF9fd0jYBgGAbCzs5PpdJokaVkWLcvi5ORkZQ0Qhnb5bgSKxSJJcmNjgwBomiYBsLu7m8lkkiTpOA4ty+LU1FSFNA164wTciXt6ephKpUiStm2zVCp5kbsS+U5gc3OTANjb28v9/X1P72KxyImJiXeJ/GEEEokE29vbeXBw4Gl+cXHB8fHx9wG/n8DV1RVJMpfLMZPJeOAkubS0dGdL+k6gVCpVbDF3WyqleHZ2xtnZWYbD4ceTwCWglKJt2yTJ6+vrClLb29vs6+vz/vV1EboEHMchSc7Pz3N4eJjZbNbbBSR5cnLC0dFR/zPgRus4DuPxuFeEotEoV1ZW7sizvLzMtrY2/3fB7u6up7FbjABwbGyM+Xy+Yn2cnp5yYWGBoVCokeO8sVK8trZW9SwAwIGBAa8kuySOj4/Z0tJyL4G69wD3OJZSIhQKVfbvjuONOTw8RCwWw+LiIs7Pz733jZipmVRtRgqFAlKpFCKRCHK5XNUGxXEcSClRKBQwPT2NRCKBkZERtLa2wrbthhq3PIBotY+GYSAQCEBKCcuyYFlWze5ICAEhhJcZ0zShlLqvmzoDgN/8bMcNw2ikILnt+a9SE/B6pFqRNWpKKS8LdcyVfRcAPgKQLru18JHdxUhrbADAt3otsF577oO7c+c1pnc3BIAYgD/vuyO8J7ijMWIu9htHhoGr/U+ARgAAAABJRU5ErkJggg==";

function KimiIcon(props) {
  return React.createElement("img", Object.assign({
    src: KIMI_ICON_DATA_URI,
    width: 14,
    height: 14,
    alt: "Kimi"
  }, props, {
    style: Object.assign({ flex: "none", borderRadius: "3px", display: "block" }, props.style)
  }));
}

/** Outer gate: never mount the hook-using chip unless a model directory store is available. */
function KimiUsageChip(props) {
  if (!props.directory) return null;
  return React.createElement(KimiBalanceChip, props);
}

/**
 * Composer bottom-right readout. Mounts only while the session's selected
 * provider is `kimi-coding`; any other provider renders null so the readout
 * disappears. While visible it shows:
 *
 *   [K] Overall 26.0% · 5h Session 15.0%
 *
 * Refreshed every 60 seconds, and links to the Kimi Code platform on click.
 * When the content is wider than the chip, hovering scrolls it marquee-style
 * so the tail stays readable; the full text is always in the title tooltip.
 */
function KimiBalanceChip(props) {
  const directory = props.directory;
  const snapshot = props.snapshot;

  const state = React.useSyncExternalStore(
    (fn) => directory.subscribe(fn),
    () => directory.getSnapshot()
  );
  const isKimiCn = !!(state && state.current && state.current.provider === KIMI_CN_PROVIDER);

  const [data, setData] = React.useState(null);
  const [failed, setFailed] = React.useState(false);
  const chipRef = React.useRef(null);
  const [chipCap, setChipCap] = React.useState(CHIP_MAX_WIDTH);

  // Measure the row once the chip mounts and re-fit on every layout change.
  React.useLayoutEffect(() => {
    if (!isKimiCn) return;
    const chip = chipRef.current;
    if (!chip) return;
    return fitChipWidth(chip, setChipCap);
  }, [isKimiCn]);

  React.useEffect(() => {
    if (!isKimiCn) return;
    let alive = true;
    const load = async () => {
      try {
        const result = await snapshot();
        if (!alive) return;
        if (result && result.ok) {
          setData(result.value);
          setFailed(false);
        } else {
          setData(null);
          setFailed(true);
        }
      } catch {
        if (alive) {
          setData(null);
          setFailed(true);
        }
      }
    };
    load();
    const timer = setInterval(load, 60000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [snapshot, isKimiCn]);

  // Measure overflow whenever content or layout changes: sets --marquee-shift
  // to the exact overflow distance so hovering scrolls the tail into view.
  // The ResizeObserver on the clip box re-arms the marquee IMMEDIATELY when
  // the window is resized; the 5s interval only backstops text changes.
  React.useEffect(() => {
    if (!isKimiCn) return;
    const measure = () => {
      const el = chipRef.current;
      if (!el || !el.isConnected) return;
      // The track takes its natural (max-content) width and is animated inside
      // the stationary clip wrapper (the span that follows the icon).
      // Overflow = track wider than the clip wrapper.
      const clip = el.querySelector(".kimi-usage-marquee-clip");
      const track = el.querySelector(".kimi-usage-marquee-track");
      if (!clip || !track) return;
      const trackWidth = track.getBoundingClientRect().width;
      const over = trackWidth - clip.clientWidth > 2;
      el.style.setProperty("--marquee-shift", over ? `-${trackWidth - clip.clientWidth + 8}px` : "0px");
    };
    measure();
    const el = chipRef.current;
    const clip = el ? el.querySelector(".kimi-usage-marquee-clip") : null;
    const observer = clip ? new ResizeObserver(measure) : null;
    if (observer && clip) observer.observe(clip);
    const timer = setInterval(measure, 5000);
    return () => {
      if (observer) observer.disconnect();
      clearInterval(timer);
    };
  }, [data, chipCap, isKimiCn]);

  ensureMarqueeStyle();

  if (!isKimiCn) return null;

  // Build display segments: rolling (5h window) first, then weekly (top-level usage).
  // The API's limits[0] (duration=300min) is the 5h rolling window; the top-level
  // `usage` object is the weekly quota (its reset lands on the weekly boundary).
  const segments = [];
  if (data) {
    for (const win of (data.windows || [])) {
      if (win.percent !== null) {
        segments.push({ key: "rolling", label: "Rolling", percent: win.percent, resetTime: win.resetTime });
      }
    }
    if (data.overall && data.overall.percent !== null) {
      segments.push({ key: "weekly", label: "Weekly", percent: data.overall.percent, resetTime: data.overall.resetTime });
    }
  }

  const titleText = failed
    ? "Kimi Coding Plan usage unavailable"
    : data && data.membership
      ? `Kimi (${data.membership}) Coding Plan usage · open Kimi Code`
      : "Kimi Coding Plan usage · open Kimi Code";

  return React.createElement(
    "a",
    {
      ref: chipRef,
      href: PLATFORM_URL,
      target: "_blank",
      rel: "noreferrer noopener",
      title: titleText,
      className: "kimi-usage-marquee",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        height: "100%",
        fontSize: "12px",
        fontWeight: 500,
        lineHeight: 1,
        color: "var(--dsw-alias-label-tertiary)",
        textDecoration: "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        minWidth: "0",
        maxWidth: chipCap + "px",
        overflow: "hidden"
      }
    },
    React.createElement(KimiIcon, {
      style: { flex: "none", color: "var(--dsw-alias-label-tertiary)" }
    }),
    React.createElement("span", {
      key: "clip",
      className: "kimi-usage-marquee-clip",
      style: {
        // The stationary clip box: sits AFTER the icon in the flex row, so the
        // scrolling track can never travel under the icon — the marquee is
        // physically confined to this wrapper's box.
        display: chipCap < CHIP_TEXT_MIN_WIDTH ? "none" : "inline-flex",
        alignItems: "center",
        minWidth: "0",
        overflow: "hidden",
        flex: "0 1 auto",
        whiteSpace: "nowrap"
      }
    },
    React.createElement("span", {
      key: "track",
      className: "kimi-usage-marquee-track",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        whiteSpace: "nowrap",
        // Natural width, never shrinks: the track may exceed the clip wrapper
        // and gets clipped there. The marquee animation translates THIS element
        // while the clip box stays put.
        flex: "0 0 auto",
        width: "max-content"
      }
    },
    segments.length > 0
      ? segments.map((seg, idx) => {
          const tail = seg.resetTime ? formatRemainsShort(seg.resetTime) : null;
          return [
            idx > 0 ? React.createElement("span", { key: "sep-" + idx, style: { opacity: 0.4 } }, "·") : null,
            React.createElement("span", {
              key: seg.key,
              style: { whiteSpace: "nowrap" }
            }, seg.label, " ", formatPercent(seg.percent), tail ? " (" + tail + ")" : "")
          ];
        }).flat().filter(Boolean)
      : React.createElement("span", {
          key: "loading",
          style: { opacity: 0.6 }
        }, failed ? "usage n/a" : "loading…")))
  );
}

/**
 * Client body: mount the remote capability, then register the composer readout
 * through a scoped injection that exposes the session's model directory so the
 * chip can subscribe to the currently selected provider and hide itself for
 * non-Kimi models.
 */
async function apply(ctx) {
  await ctx.remote.$mount(TYPERT_REMOTE);
  // ctx.get() reads the mounted namespace service without requiring a declared
  // inject edge, which would deadlock a self-mounting plugin.
  const kimiUsage = ctx.get("remote.kimiUsage");

  ctx.slots.inject("conversation.input.right", () => ctx.slots.register({
    name: "conversation.input.right",
    id: "kimi-cn-usage",
    order: 0,
    inject: (sessionId) => {
      let directory = null;
      try {
        directory = ctx.modelDirectories.directoryFor(sessionId).store;
      } catch {
        directory = null;
      }
      return {
        directory,
        snapshot: () => kimiUsage.snapshot()
      };
    }
  }, KimiUsageChip));
}

const inject = ["slots", "remote", "remote.session", "modelDirectories"];

exports.apply = apply;
exports.inject = inject;
return module.exports;
}
});
