import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

export type DatabaseDriver = "neon" | "pg";

type PrismaEnv = {
  [key: string]: string | undefined;
  DATABASE_DRIVER?: string;
  DATABASE_URL?: string;
  NODE_ENV?: string;
  PRISMA_DIRECT_TCP_URL?: string;
};

type ConnectionUrlMetadata = {
  configured: boolean;
  host?: string;
  isLegacyPrismaPostgres?: boolean;
  isLocal?: boolean;
  port?: string;
  protocol?: string;
};

type PrismaConnectionConfig = {
  driver: DatabaseDriver;
  connectionString: string;
};

const LEGACY_PRISMA_POSTGRES_HOST = "db.prisma.io";

export function resolveDatabaseDriver(
  value = process.env.DATABASE_DRIVER,
): DatabaseDriver {
  if (!value || value === "neon") {
    return "neon";
  }

  if (value === "pg") {
    return "pg";
  }

  throw new Error(
    `Unsupported DATABASE_DRIVER "${value}". Use "neon" or "pg".`,
  );
}

function configuredValue(value: string | undefined) {
  return value?.trim() || undefined;
}

function inspectConnectionUrl(value: string | undefined): ConnectionUrlMetadata {
  const connectionString = configuredValue(value);

  if (!connectionString) {
    return {
      configured: false,
    };
  }

  try {
    const url = new URL(connectionString);
    const host = url.hostname;

    return {
      configured: true,
      host,
      isLegacyPrismaPostgres: host === LEGACY_PRISMA_POSTGRES_HOST,
      isLocal: host === "localhost" || host === "127.0.0.1" || host === "db",
      port: url.port || undefined,
      protocol: url.protocol,
    };
  } catch {
    return {
      configured: true,
      host: "<invalid-url>",
    };
  }
}

function validatePrismaConnectionConfig(
  env: PrismaEnv,
  config: PrismaConnectionConfig,
) {
  const explicitDriver = configuredValue(env.DATABASE_DRIVER);

  if (env.NODE_ENV === "development" && !explicitDriver) {
    throw new Error(
      "DATABASE_DRIVER is required in development. Use DATABASE_DRIVER=pg with local Docker PostgreSQL, or DATABASE_DRIVER=neon with Neon URLs.",
    );
  }

  const metadata = inspectConnectionUrl(config.connectionString);

  if (metadata.isLegacyPrismaPostgres) {
    throw new Error(
      "Prisma Postgres URLs on db.prisma.io are no longer valid for Vision AR local runtime. Use DATABASE_DRIVER=pg with the local PostgreSQL URL, or DATABASE_DRIVER=neon with Neon URLs.",
    );
  }
}

export function resolvePrismaConnectionConfig(env: PrismaEnv = process.env) {
  const driver = resolveDatabaseDriver(env.DATABASE_DRIVER);
  const connectionString =
    driver === "pg"
      ? configuredValue(env.DATABASE_URL) ??
        configuredValue(env.PRISMA_DIRECT_TCP_URL)
      : configuredValue(env.PRISMA_DIRECT_TCP_URL) ??
        configuredValue(env.DATABASE_URL);

  if (!connectionString) {
    throw new Error(
      "Configurá PRISMA_DIRECT_TCP_URL o DATABASE_URL para inicializar Prisma.",
    );
  }

  const config = {
    driver,
    connectionString,
  };

  validatePrismaConnectionConfig(env, config);

  return config;
}

export function createPrismaEnvDiagnostic(env: PrismaEnv = process.env) {
  const messages: string[] = [];
  const explicitDriver = configuredValue(env.DATABASE_DRIVER);
  const databaseUrl = inspectConnectionUrl(env.DATABASE_URL);
  const directUrl = inspectConnectionUrl(env.PRISMA_DIRECT_TCP_URL);
  let valid = true;
  let selected:
    | {
        driver: DatabaseDriver;
        host: string;
        source: "DATABASE_URL" | "PRISMA_DIRECT_TCP_URL";
      }
    | null = null;

  try {
    const config = resolvePrismaConnectionConfig(env);
    const metadata = inspectConnectionUrl(config.connectionString);
    selected = {
      driver: config.driver,
      host: metadata.host ?? "<unknown>",
      source:
        configuredValue(env.DATABASE_URL) === config.connectionString
          ? "DATABASE_URL"
          : "PRISMA_DIRECT_TCP_URL",
    };
  } catch (error) {
    valid = false;
    messages.push(
      error instanceof Error
        ? error.message
        : "No se pudo validar la configuración de Prisma.",
    );
  }

  if (databaseUrl.isLegacyPrismaPostgres || directUrl.isLegacyPrismaPostgres) {
    valid = false;
    messages.push(
      "Reemplazá las URLs db.prisma.io antiguas por PostgreSQL local o Neon.",
    );
  }

  return {
    databaseUrl,
    directUrl,
    driver: explicitDriver ?? null,
    driverExplicit: Boolean(explicitDriver),
    messages: Array.from(new Set(messages)),
    selected,
    valid,
  };
}

export function getConnectionString(env: PrismaEnv = process.env) {
  const connectionString =
    resolvePrismaConnectionConfig(env).connectionString;

  if (env === process.env) {
    process.env.DATABASE_URL = connectionString;
  }

  return connectionString;
}

export function createPrismaClient() {
  const { connectionString, driver } = resolvePrismaConnectionConfig();
  process.env.DATABASE_URL = connectionString;

  const adapter =
    driver === "pg"
      ? new PrismaPg(connectionString)
      : new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}
