import { describe, expect, it } from "vitest";
import { resolveDatabaseDriver } from "./prisma-client";

describe("resolveDatabaseDriver", () => {
  it("defaults to neon for production compatibility", () => {
    expect(resolveDatabaseDriver(undefined)).toBe("neon");
  });

  it("supports the local PostgreSQL adapter", () => {
    expect(resolveDatabaseDriver("pg")).toBe("pg");
  });

  it("rejects unknown drivers", () => {
    expect(() => resolveDatabaseDriver("sqlite")).toThrow(
      'Unsupported DATABASE_DRIVER "sqlite"',
    );
  });
});
