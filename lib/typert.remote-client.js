/* Client-face Typert remote manifest for dsh-usage-kimi-cn (hand-written).
   The schema is a minimal strict codec: the host already zod-validated its
   result, so the client only enforces the strict codec contract shape. */

const windowDetailSchema = {
  parse(value) {
    if (!value || typeof value !== "object") return null;
    return {
      label: typeof value.label === "string" ? value.label : "Window",
      duration: typeof value.duration === "number" ? value.duration : null,
      timeUnit: typeof value.timeUnit === "string" ? value.timeUnit : null,
      limit: typeof value.limit === "string" ? value.limit : null,
      remaining: typeof value.remaining === "string" ? value.remaining : null,
      percent: typeof value.percent === "number" ? value.percent : null,
      resetTime: typeof value.resetTime === "string" ? value.resetTime : null
    };
  }
};

const overallDetailSchema = {
  parse(value) {
    if (value === null || value === undefined) return null;
    if (typeof value !== "object") return null;
    return {
      limit: typeof value.limit === "string" ? value.limit : null,
      remaining: typeof value.remaining === "string" ? value.remaining : null,
      percent: typeof value.percent === "number" ? value.percent : null,
      resetTime: typeof value.resetTime === "string" ? value.resetTime : null
    };
  }
};

const kimiSnapshot$schema = {
          parse(value) {
            if (!value || typeof value !== "object") {
              throw new TypeError("expected a kimi usage snapshot object");
            }
            return {
              overall: overallDetailSchema.parse(value.overall),
              windows: Array.isArray(value.windows)
                ? value.windows.map((w) => windowDetailSchema.parse(w)).filter(Boolean)
                : [],
              membership: typeof value.membership === "string" ? value.membership : null
            };
          }
};

export const TYPERT_REMOTE = {
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
        schema: kimiSnapshot$schema,
        create: () => kimiSnapshot$schema
      },
      sourceLocation: { file: "lib/index.js", line: 1, column: 1 }
    }
  ]
};

export default TYPERT_REMOTE;
