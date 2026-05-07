import { describe, expect, it, vi, beforeEach } from "vitest";
import { getTodayUtc, getQuotaStatus, incrementQuota, SEARCH_COST, VIDEOS_COST } from "./youtube-quota";

// ── Prisma mock ────────────────────────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    quotaUsage: {
      findUnique: vi.fn(),
    },
    $executeRaw: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
const mockFindUnique = prisma.quotaUsage.findUnique as ReturnType<typeof vi.fn>;
const mockExecuteRaw = prisma.$executeRaw as ReturnType<typeof vi.fn>;

// ── Environment defaults ───────────────────────────────────────────────────────
beforeEach(() => {
  vi.resetAllMocks();
  delete process.env.YOUTUBE_QUOTA_BUDGET;
  delete process.env.YOUTUBE_QUOTA_WARNING;
});

// ── getTodayUtc ────────────────────────────────────────────────────────────────
describe("getTodayUtc", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(getTodayUtc()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns the current UTC date", () => {
    const expected = new Date().toISOString().slice(0, 10);
    expect(getTodayUtc()).toBe(expected);
  });
});

// ── exported cost constants ───────────────────────────────────────────────────
describe("cost constants", () => {
  it("SEARCH_COST is 100", () => {
    expect(SEARCH_COST).toBe(100);
  });

  it("VIDEOS_COST is 1", () => {
    expect(VIDEOS_COST).toBe(1);
  });
});

// ── getQuotaStatus ─────────────────────────────────────────────────────────────
describe("getQuotaStatus", () => {
  it("returns used=0 when no row exists for today", async () => {
    mockFindUnique.mockResolvedValue(null);
    const status = await getQuotaStatus();
    expect(status.used).toBe(0);
    expect(status.exhausted).toBe(false);
    expect(status.nearWarning).toBe(false);
  });

  it("reflects the stored unit count", async () => {
    mockFindUnique.mockResolvedValue({ id: "x", date: getTodayUtc(), units: 5000, updatedAt: new Date() });
    const status = await getQuotaStatus();
    expect(status.used).toBe(5000);
  });

  it("sets exhausted when used >= budget (default 9000)", async () => {
    mockFindUnique.mockResolvedValue({ id: "x", date: getTodayUtc(), units: 9000, updatedAt: new Date() });
    const status = await getQuotaStatus();
    expect(status.exhausted).toBe(true);
    expect(status.nearWarning).toBe(true);
  });

  it("sets exhausted when used > budget", async () => {
    mockFindUnique.mockResolvedValue({ id: "x", date: getTodayUtc(), units: 9500, updatedAt: new Date() });
    const status = await getQuotaStatus();
    expect(status.exhausted).toBe(true);
  });

  it("sets nearWarning but not exhausted when used >= warning (default 7500) but < budget", async () => {
    mockFindUnique.mockResolvedValue({ id: "x", date: getTodayUtc(), units: 7500, updatedAt: new Date() });
    const status = await getQuotaStatus();
    expect(status.nearWarning).toBe(true);
    expect(status.exhausted).toBe(false);
  });

  it("respects YOUTUBE_QUOTA_BUDGET env override", async () => {
    process.env.YOUTUBE_QUOTA_BUDGET = "5000";
    mockFindUnique.mockResolvedValue({ id: "x", date: getTodayUtc(), units: 5000, updatedAt: new Date() });
    const status = await getQuotaStatus();
    expect(status.budget).toBe(5000);
    expect(status.exhausted).toBe(true);
  });

  it("respects YOUTUBE_QUOTA_WARNING env override", async () => {
    process.env.YOUTUBE_QUOTA_WARNING = "3000";
    mockFindUnique.mockResolvedValue({ id: "x", date: getTodayUtc(), units: 3000, updatedAt: new Date() });
    const status = await getQuotaStatus();
    expect(status.warning).toBe(3000);
    expect(status.nearWarning).toBe(true);
  });

  it("includes budget and warning values in the returned object", async () => {
    mockFindUnique.mockResolvedValue(null);
    const status = await getQuotaStatus();
    expect(status.budget).toBe(9000);
    expect(status.warning).toBe(7500);
  });
});

// ── incrementQuota ─────────────────────────────────────────────────────────────
describe("incrementQuota", () => {
  it("calls $executeRaw with the correct units value", async () => {
    mockExecuteRaw.mockResolvedValue(1);
    await incrementQuota(100);
    expect(mockExecuteRaw).toHaveBeenCalledOnce();
    // The tagged template literal passes args as an array; verify the unit
    // value appears in the call arguments.
    const callArgs = mockExecuteRaw.mock.calls[0];
    expect(callArgs.some((arg: unknown) => arg === 100)).toBe(true);
  });

  it("does not throw when $executeRaw resolves", async () => {
    mockExecuteRaw.mockResolvedValue(1);
    await expect(incrementQuota(1)).resolves.toBeUndefined();
  });
});
