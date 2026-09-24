/* Host-face Typert manifest for dsh-usage-kimi-cn (hand-written). */
import z from "zod";

const windowDetailSchema = z.object({
  label: z.string(),
  duration: z.number().nullable(),
  timeUnit: z.string().nullable(),
  limit: z.string().nullable(),
  remaining: z.string().nullable(),
  percent: z.number().nullable(),
  resetTime: z.string().nullable()
});

const kimiUsageSnapshotResult$schema = z.object({
  overall: z.object({
    limit: z.string().nullable(),
    remaining: z.string().nullable(),
    percent: z.number().nullable(),
    resetTime: z.string().nullable()
  }).nullable(),
  windows: z.array(windowDetailSchema),
  membership: z.string().nullable()
});

export const TYPERT = {
  package: "dsh-usage-kimi-cn",
  face: "host",
  schemas: [],
  invocations: [
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
        schema: kimiUsageSnapshotResult$schema,
        create: () => kimiUsageSnapshotResult$schema
      },
      sourceLocation: { file: "lib/index.js", line: 1, column: 1 }
    }
  ],
  model: {
    services: [],
    events: [],
    objects: []
  }
};

export default TYPERT;
