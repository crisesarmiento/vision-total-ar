import { describe, expect, it } from "vitest";
import {
  getConnectionString,
  resolveDatabaseDriver,
  resolvePrismaConnectionConfig,
} from "./prisma-client";

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

describe("resolvePrismaConnectionConfig", () => {
  it("keeps neon direct URL precedence for remote runtime compatibility", () => {
    expect(
      resolvePrismaConnectionConfig({
        DATABASE_DRIVER: "neon",
        DATABASE_URL: "postgresql://pooled.example",
        PRISMA_DIRECT_TCP_URL: "postgresql://direct.example",
      }),
    ).toEqual({
      driver: "neon",
      connectionString: "postgresql://direct.example",
    });
  });

  it("uses DATABASE_URL first for local PostgreSQL runtime", () => {
    expect(
      resolvePrismaConnectionConfig({
        DATABASE_DRIVER: "pg",
        DATABASE_URL: "postgresql://localhost:5433/vision_total_ar",
        PRISMA_DIRECT_TCP_URL: "postgresql://remote.example",
      }),
    ).toEqual({
      driver: "pg",
      connectionString: "postgresql://localhost:5433/vision_total_ar",
    });
  });

  it("allows pg to fall back to PRISMA_DIRECT_TCP_URL", () => {
    expect(
      resolvePrismaConnectionConfig({
        DATABASE_DRIVER: "pg",
        PRISMA_DIRECT_TCP_URL: "postgresql://db:5432/vision_total_ar",
      }),
    ).toEqual({
      driver: "pg",
      connectionString: "postgresql://db:5432/vision_total_ar",
    });
  });

  it("treats blank URL values as unconfigured", () => {
    expect(
      resolvePrismaConnectionConfig({
        DATABASE_DRIVER: "neon",
        DATABASE_URL: "postgresql://fallback.example",
        PRISMA_DIRECT_TCP_URL: "",
      }),
    ).toEqual({
      driver: "neon",
      connectionString: "postgresql://fallback.example",
    });
  });

  it("throws when no runtime connection URL is configured", () => {
    expect(() =>
      resolvePrismaConnectionConfig({ DATABASE_DRIVER: "pg" }),
    ).toThrow(
      "Configurá PRISMA_DIRECT_TCP_URL o DATABASE_URL para inicializar Prisma.",
    );
  });

  it("keeps getConnectionString compatible for existing callers", () => {
    expect(
      getConnectionString({
        DATABASE_DRIVER: "pg",
        DATABASE_URL: "postgresql://localhost:5433/vision_total_ar",
      }),
    ).toBe("postgresql://localhost:5433/vision_total_ar");
  });
});
