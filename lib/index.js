/**
 * dsh-usage-kimi-cn
 *
 * Human-facing `/usage-kimi-cn` command for the Kimi (Moonshot AI) Coding
 * Plan subscription, plus a browser composer readout (bottom-right tool row)
 * fed by a Typert remote service.
 *
 * The KIMI_CODING_API_KEY credential is resolved through the harness credentials
 * seam on the HOST (kept server-side; never inlined into the browser), the
 * official Coding Plan usage endpoint `GET https://api.kimi.com/coding/v1/usages`
 * is queried, and the overall quota plus per-window usage are rendered inline.
 *
 * NOTE: Use the Kimi Code console API key (sk-kimi-xxx), NOT the Moonshot
 * open-platform key (sk-xxx). The readout only renders while the selected
 * model provider is `kimi-coding` (the provider id registered by dsh-llm-kimi-cn).
 */

import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import {
  API_KEY_REF,
  PLATFORM_URL,
  fetchUsage,
  formatPercent,
  formatUsage,
  fetchUsageSnapshot,
  computeUsedPercent,
  windowLabel,
  membershipLabel
} from "./logic.js";

const name = "dsh-usage-kimi-cn";
const inject = ["commands", "credentials"];

/**
 * Host-side remote service exposing the latest usage snapshot to the browser.
 *
 * Mounted as a Typert remote service; the `./typert` manifest registers the
 * `kimiUsage/snapshot` endpoint, and the client mounts it via `ctx.remote`.
 */
class KimiUsageGateway extends TypertRemoteService {
  static inject = ["credentials"];

  constructor(ctx) {
    super(ctx, "kimiUsage");
  }

  /** Latest normalized usage snapshot; throws on credential/network/API failure. */
  async snapshot() {
    return fetchUsageSnapshot(this.ctx.credentials);
  }
}

/** Register the `/usage-kimi-cn` command and mount the browser remote gateway. */
async function apply(ctx) {
  await ctx.plugin(KimiUsageGateway);
  ctx.commands.register({
    name: "usage-kimi-cn",
    description: "Show Kimi (Moonshot AI) Coding Plan subscription quota usage",
    handler: async () => {
      try {
        const result = await fetchUsage(ctx);
        if (!result.ok) return { kind: "error", text: `Kimi usage: ${result.error}` };
        return {
          kind: "success",
          text: `Kimi (kimi-coding) Coding Plan usage\n\n${formatUsage(result.data)}\n\nKimi Code platform: ${PLATFORM_URL}`
        };
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        return { kind: "error", text: `Kimi usage failed: ${detail}` };
      }
    }
  });
}

// fetchUsage / formatUsage / fetchUsageSnapshot are re-exported for
// standalone smoke tests; the loader only consumes the Cordis plugin contract
// ({ name, inject, apply }).
export {
  apply,
  inject,
  name,
  fetchUsage,
  formatPercent,
  formatUsage,
  fetchUsageSnapshot,
  computeUsedPercent,
  windowLabel,
  membershipLabel,
  KimiUsageGateway,
  API_KEY_REF
};
