import { describe, expect, it } from "vitest";
import {
  createPrismaEnvDiagnostic,
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
  it("requires an explicit driver in development", () => {
    expect(() =>
      resolvePrismaConnectionConfig({
        NODE_ENV: "development",
        DATABASE_URL: "postgresql://localhost:5433/vision_total_ar",
      }),
    ).toThrow("DATABASE_DRIVER is required in development");
  });

  it("keeps the production default compatible when no driver is set", () => {
    expect(
      resolvePrismaConnectionConfig({
        NODE_ENV: "production",
        DATABASE_URL: "postgresql://neon.example/vision_total_ar",
      }),
    ).toEqual({
      driver: "neon",
      connectionString: "postgresql://neon.example/vision_total_ar",
    });
  });

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

  it("rejects stale Prisma Postgres URLs before adapter initialization", () => {
    expect(() =>
      resolvePrismaConnectionConfig({
        DATABASE_DRIVER: "neon",
        DATABASE_URL: "postgresql://user:password@db.prisma.io:5432/postgres",
      }),
    ).toThrow("db.prisma.io");
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

describe("createPrismaEnvDiagnostic", () => {
  it("reports safe metadata without credential-bearing URLs", () => {
    const diagnostic = createPrismaEnvDiagnostic({
      DATABASE_DRIVER: "pg",
      DATABASE_URL:
        "postgresql://vision_ar:super-secret@localhost:5433/vision_total_ar?sslmode=disable",
    });
    const serialized = JSON.stringify(diagnostic);

    expect(diagnostic.valid).toBe(true);
    expect(diagnostic.databaseUrl).toMatchObject({
      host: "localhost",
      isLocal: true,
      port: "5433",
      protocol: "postgresql:",
    });
    expect(serialized).not.toContain("super-secret");
    expect(serialized).not.toContain("vision_ar:super-secret");
    expect(serialized).not.toContain("sslmode=disable");
  });

  it("marks missing development drivers as invalid", () => {
    const diagnostic = createPrismaEnvDiagnostic({
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://localhost:5433/vision_total_ar",
    });

    expect(diagnostic.valid).toBe(false);
    expect(diagnostic.messages.join("\n")).toContain("DATABASE_DRIVER is required");
  });

  it("flags stale Prisma Postgres URL hosts without exposing full URLs", () => {
    const diagnostic = createPrismaEnvDiagnostic({
      DATABASE_DRIVER: "neon",
      DATABASE_URL: "postgresql://user:secret@db.prisma.io:5432/postgres",
    });
    const serialized = JSON.stringify(diagnostic);

    expect(diagnostic.valid).toBe(false);
    expect(diagnostic.databaseUrl.host).toBe("db.prisma.io");
    expect(serialized).not.toContain("user:secret");
  });
});
