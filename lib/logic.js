/**
 * Dependency-free core logic for dsh-usage-kimi-cn.
 *
 * Kimi (Moonshot AI) Coding Plan reports a top-level overall quota and a list
 * of windowed limits. The endpoint is:
 *
 *   GET https://api.kimi.com/coding/v1/usages
 *
 * Response shape:
 *   {
 *     "usage": {
 *       "limit": "100",
 *       "remaining": "74",
 *       "resetTime": "2026-02-11T17:32:50.757941Z"
 *     },
 *     "limits": [
 *       {
 *         "window": { "duration": 300, "timeUnit": "TIME_UNIT_MINUTE" },
 *         "detail": {
 *           "limit": "100",
 *           "remaining": "85",
 *           "resetTime": "2026-02-07T12:32:50.757941Z"
 *         }
 *       }
 *     ],
 *     "user": {
 *       "membership": { "level": "LEVEL_INTERMEDIATE" }
 *     }
 *   }
 *
 * A window with duration=300 + TIME_UNIT_MINUTE maps to the 5-hour session
 * window. Membership levels: LEVEL_BASIC, LEVEL_INTERMEDIATE, LEVEL_PRO.
 *
 * NOTE: The Kimi Coding Plan API key is obtained from the Kimi Code console
 * (format `sk-kimi-xxx`), NOT from the Moonshot open-platform API key
 * (format `sk-xxx`). The two key types are not interchangeable.
 *
 * Everything here resolves only against Web/Node platform globals (fetch,
 * AbortSignal), so it can be imported from plain Node tooling and smoke tests
 * without the DSH packages.
 */

/** Official Kimi Coding Plan usage endpoint. */
export const USAGE_URL = "https://api.kimi.com/coding/v1/usages";
/** Kimi Code platform landing page (the readout's click target). */
export const PLATFORM_URL = "https://www.kimi.com/code";
/** Credential reference resolved through the harness credentials seam.
 *  Matches the key name used by dsh-llm-kimi-cn, so users who already
 *  have the LLM provider configured don't need to add anything new. */
export const API_KEY_REF = "KIMI_CODING_API_KEY";
/** Hard network ceiling so an unresponsive endpoint cannot hang a turn. */
export const TIMEOUT_MS = 20000;

/**
 * Resolve the Kimi API base URL. The official base URL is the default;
 * `KIMI_BASE_URL` overrides it for gateways/proxies.
 */
export function resolveBaseUrl() {
  const env = globalThis.process?.env?.KIMI_BASE_URL;
  if (typeof env === "string" && env.length > 0) return env.replace(/\/+$/, "");
  return "https://api.kimi.com";
}

/** Build the absolute usage endpoint URL for the current base URL. */
export function resolveUsageUrl() {
  return `${resolveBaseUrl()}/coding/v1/usages`;
}

/**
 * Map a window descriptor to a human-readable label.
 * duration=300 + TIME_UNIT_MINUTE → "5-hour session"
 * duration=1 + TIME_UNIT_WEEK    → "Weekly"
 * duration=1 + TIME_UNIT_MONTH   → "Monthly"
 * anything else                  → "Window (Xd Yh)"
 */
export function windowLabel(duration, timeUnit) {
  if (timeUnit === "TIME_UNIT_MINUTE") {
    // Any sub-day rolling window maps to the unified "Rolling" label.
    return "Rolling";
  }
  if (timeUnit === "TIME_UNIT_HOUR") {
    return "Rolling";
  }
  if (timeUnit === "TIME_UNIT_DAY") {
    if (duration === 1) return "Daily";
    return `${duration}d`;
  }
  if (timeUnit === "TIME_UNIT_WEEK") return "Weekly";
  if (timeUnit === "TIME_UNIT_MONTH") return "Monthly";
  return `Window (${duration} ${timeUnit ?? "?"})`;
}

/**
 * Map the membership level string to a human label.
 * LEVEL_BASIC → "Basic", LEVEL_INTERMEDIATE → "Intermediate", LEVEL_PRO → "Pro"
 */
export function membershipLabel(level) {
  if (typeof level !== "string") return null;
  const m = /^LEVEL_(.+)$/.exec(level);
  if (m) {
    const s = m[1];
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  return level;
}

/**
 * Compute the used percentage from limit and remaining strings.
 * Returns null when either value is not a finite positive number.
 */
export function computeUsedPercent(limit, remaining) {
  const l = Number(limit);
  const r = Number(remaining);
  if (!Number.isFinite(l) || !Number.isFinite(r) || l <= 0) return null;
  const used = Math.max(0, l - r);
  return Math.min(100, (used / l) * 100);
}

/** Render one percent value as a string, tolerating absence. */
export function formatPercent(value) {
  if (value === null || value === undefined || value === "") return "n/a";
  const n = Number(value);
  if (!Number.isFinite(n)) return "n/a";
  return `${n.toFixed(1)}%`;
}

/** Normalize one window detail record for the wire. */
export function normalizeWindowDetail(detail) {
  if (!detail || typeof detail !== "object") return null;
  const limit = typeof detail.limit === "string" ? detail.limit : null;
  const remaining = typeof detail.remaining === "string" ? detail.remaining : null;
  const percent = computeUsedPercent(limit, remaining);
  return {
    limit,
    remaining,
    percent,
    resetTime: typeof detail.resetTime === "string" ? detail.resetTime : null
  };
}

/** Fetch and shape the raw Kimi Coding Plan usage payload without formatting it. */
export async function fetchUsage(ctx) {
  const credential = await ctx.credentials.resolve(API_KEY_REF);
  if (!credential || typeof credential.value !== "string" || credential.value.length === 0) {
    return {
      ok: false,
      error: `${API_KEY_REF} is not configured. Store it in ~/.dsh/.credentials.yaml or set it as the environment variable \`${API_KEY_REF}\`.`
    };
  }
  const response = await fetch(resolveUsageUrl(), {
    headers: {
      Authorization: `Bearer ${credential.value}`,
      Accept: "application/json"
    },
    // AbortSignal.timeout is available on the Node version dsh runs on.
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!response.ok) {
    return { ok: false, error: `Kimi Coding Plan API returned HTTP ${response.status}` };
  }
  let body;
  try {
    body = await response.json();
  } catch (error) {
    return {
      ok: false,
      error: `Kimi Coding Plan API returned a non-JSON response: ${error instanceof Error ? error.message : String(error)}`
    };
  }
  return { ok: true, data: body };
}

/** Render the Kimi Coding Plan usage payload as a human-readable text report. */
export function formatUsage(data) {
  if (!data || typeof data !== "object") return "No usage data returned.";
  const lines = [];

  // Membership level
  const level = membershipLabel(data.user?.membership?.level);
  if (level) lines.push(`Plan: ${level}`);

  // Per-window limits (rolling 5h window comes first)
  const limits = Array.isArray(data.limits) ? data.limits : [];
  for (const entry of limits) {
    if (!entry || typeof entry !== "object") continue;
    const win = entry.window ?? {};
    const label = windowLabel(win.duration, win.timeUnit);
    const det = entry.detail;
    if (!det || typeof det !== "object") {
      lines.push(`${label}: no data`);
      continue;
    }
    const pct = computeUsedPercent(det.limit, det.remaining);
    const pctStr = pct !== null ? `${formatPercent(pct)} used` : "n/a";
    const counts = (det.limit && det.remaining) ? ` · ${det.remaining}/${det.limit} remaining` : "";
    const reset = typeof det.resetTime === "string" ? ` · resets ${det.resetTime}` : "";
    lines.push(`${label}: ${pctStr}${counts}${reset}`);
  }

  // Weekly quota (top-level usage field; its reset lands on the weekly boundary)
  if (data.usage && typeof data.usage === "object") {
    const u = data.usage;
    const pct = computeUsedPercent(u.limit, u.remaining);
    const pctStr = pct !== null ? `(${formatPercent(pct)} used)` : "";
    const reset = typeof u.resetTime === "string" ? ` · resets ${u.resetTime}` : "";
    lines.push(`Weekly: ${u.remaining ?? "?"} / ${u.limit ?? "?"} ${pctStr}${reset}`);
  }

  return lines.length > 0 ? lines.join("\n") : "No usage data returned.";
}

/** Fetch and normalize the usage snapshot for the browser readout. */
export async function fetchUsageSnapshot(credentials) {
  const credential = await credentials.resolve(API_KEY_REF);
  if (!credential || typeof credential.value !== "string" || credential.value.length === 0) {
    throw new Error(`${API_KEY_REF} is not configured. Store it in ~/.dsh/.credentials.yaml or set it as the environment variable \`${API_KEY_REF}\`.`);
  }
  const response = await fetch(resolveUsageUrl(), {
    headers: {
      Authorization: `Bearer ${credential.value}`,
      Accept: "application/json"
    },
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!response.ok) {
    throw new Error(`Kimi Coding Plan API returned HTTP ${response.status}`);
  }
  let body;
  try {
    body = await response.json();
  } catch (error) {
    throw new Error(`Kimi Coding Plan API returned a non-JSON response: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Normalize overall usage
  const overall = normalizeWindowDetail(body?.usage);

  // Normalize per-window limits
  const windows = [];
  const limits = Array.isArray(body?.limits) ? body.limits : [];
  for (const entry of limits) {
    if (!entry || typeof entry !== "object") continue;
    const win = entry.window ?? {};
    const detail = normalizeWindowDetail(entry.detail);
    if (!detail) continue;
    windows.push({
      label: windowLabel(win.duration, win.timeUnit),
      duration: typeof win.duration === "number" ? win.duration : null,
      timeUnit: typeof win.timeUnit === "string" ? win.timeUnit : null,
      ...detail
    });
  }

  return {
    overall,
    windows,
    membership: membershipLabel(body?.user?.membership?.level) ?? null
  };
}
