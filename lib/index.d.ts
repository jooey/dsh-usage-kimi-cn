/**
 * dsh-usage-kimi-cn host face type declaration.
 *
 * The loader consumes the Cordis plugin contract ({ name, inject, apply }).
 * Core logic re-exports are safe to import in tooling; the dependency-free
 * sources also live in ./logic (see lib/logic.js for exact behavior).
 */

import type { Context } from "@deepseek-ai/cordis";
import type { CredentialRef } from "@deepseek-ai/dsh-credentials";

export const name: string;
export const inject: string[];
export const API_KEY_REF: string;
export const PLATFORM_URL: string;
export const USAGE_URL: string;

export interface FetchUsageResult {
  ok: boolean;
  data?: {
    usage?: { limit?: string; remaining?: string; resetTime?: string };
    limits?: Array<{
      window?: { duration?: number; timeUnit?: string };
      detail?: { limit?: string; remaining?: string; resetTime?: string };
    }>;
    user?: { membership?: { level?: string } };
  };
  error?: string;
}

export interface KimiWindowDetail {
  label: string;
  duration: number | null;
  timeUnit: string | null;
  limit: string | null;
  remaining: string | null;
  percent: number | null;
  resetTime: string | null;
}

export interface KimiOverallDetail {
  limit: string | null;
  remaining: string | null;
  percent: number | null;
  resetTime: string | null;
}

export interface KimiUsageSnapshot {
  overall: KimiOverallDetail | null;
  windows: KimiWindowDetail[];
  membership: string | null;
}

export declare function apply(ctx: Context): Promise<void>;
export declare function fetchUsage(ctx: Context): Promise<FetchUsageResult>;
export declare function formatPercent(value: unknown): string;
export declare function formatUsage(data: unknown): string;
export declare function computeUsedPercent(limit: unknown, remaining: unknown): number | null;
export declare function windowLabel(duration: unknown, timeUnit: unknown): string;
export declare function membershipLabel(level: unknown): string | null;
export declare function fetchUsageSnapshot(credentials: {
  resolve(ref: CredentialRef): Promise<{ value: string; source?: string } | undefined>;
}): Promise<KimiUsageSnapshot>;

export declare class KimiUsageGateway {
  static inject: string[];
  constructor(ctx: Context);
  snapshot(): Promise<KimiUsageSnapshot>;
}
