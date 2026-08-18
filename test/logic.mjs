// Standalone smoke test for the dsh-usage-kimi-cn plugin core logic
// (imports lib/logic.js, which is dependency-free).
// Runs WITHOUT DSH: provides a fake ctx.credentials backed by a key from the
// real credentials file OR a `KIMI_CODING_API_KEY` environment variable, calls
// fetchUsage + formatUsage, and prints the result.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url)); // .../dsh-usage-kimi-cn/test
const pluginDir = dirname(here); // .../dsh-usage-kimi-cn
const {
  fetchUsage,
  fetchUsageSnapshot,
  formatPercent,
  formatUsage,
  computeUsedPercent,
  windowLabel,
  membershipLabel
} = await import(pathToFileURL(join(pluginDir, "lib", "logic.js")).href);

// Resolve the key with the same priority the plugin uses at runtime:
//   1. KIMI_CODING_API_KEY env var (universal — works in any Node.js context)
//   2. ~/.dsh/.credentials.yaml (DSH convention)
const home = process.env.USERPROFILE || process.env.HOME || process.env.HOMEPATH;
if (!home) {
  console.error("Cannot determine the home directory; set USERPROFILE or HOME.");
  process.exit(1);
}

let key = process.env.KIMI_CODING_API_KEY;
let keySource = key ? "env" : null;
if (!key) {
  const credentialsPath = join(home, ".dsh", ".credentials.yaml");
  try {
    const text = readFileSync(credentialsPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = /^KIMI_CODING_API_KEY\s*:\s*(.+)$/.exec(line.trim());
      if (m) { key = m[1].trim(); keySource = "credentials.yaml"; }
    }
  } catch {
    /* ignore */
  }
}
if (!key) {
  console.error("FAILED: KIMI_CODING_API_KEY is not configured. Set it via one of:");
  console.error("  (1) export KIMI_CODING_API_KEY=<key>   (sk-kimi-xxx from Kimi Code console)");
  console.error("  (2) ~/.dsh/.credentials.yaml → KIMI_CODING_API_KEY: <key>");
  process.exit(1);
}
console.log(`key resolved from: ${keySource}`);

const ctx = {
  credentials: {
    async resolve(ref) {
      return ref === "KIMI_CODING_API_KEY" && key ? { value: key, source: keySource } : undefined;
    }
  }
};

const result = await fetchUsage(ctx);
if (!result.ok) {
  console.error("FAILED:", result.error);
  process.exit(1);
}
console.log("OK fetchUsage.");
console.log("--- raw ---");
console.log(JSON.stringify(result.data, null, 2));
console.log("--- formatted (/usage-kimi-cn output) ---");
console.log(formatUsage(result.data));
console.log("--- normalized snapshot ---");
const snapshot = await fetchUsageSnapshot(ctx.credentials);
console.log(JSON.stringify(snapshot, null, 2));
console.log("--- helpers ---");
console.log("computeUsedPercent('100','26'):", computeUsedPercent("100", "26"));
console.log("computeUsedPercent('0','0'):", computeUsedPercent("0", "0"));
console.log("formatPercent(26):", formatPercent(26));
console.log("windowLabel(300,'TIME_UNIT_MINUTE'):", windowLabel(300, "TIME_UNIT_MINUTE"));
console.log("windowLabel(1,'TIME_UNIT_WEEK'):", windowLabel(1, "TIME_UNIT_WEEK"));
console.log("membershipLabel('LEVEL_INTERMEDIATE'):", membershipLabel("LEVEL_INTERMEDIATE"));
console.log("membershipLabel('LEVEL_PRO'):", membershipLabel("LEVEL_PRO"));
