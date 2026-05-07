import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createPrismaEnvDiagnostic } from "@/lib/prisma-client";

function readDotEnv(path: string) {
  if (!existsSync(path)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        const key = line.slice(0, separatorIndex);
        const value = line
          .slice(separatorIndex + 1)
          .trim()
          .replace(/^['"]|['"]$/g, "");

        return [key, value];
      }),
  );
}

function formatUrlMetadata(
  name: string,
  metadata: ReturnType<typeof createPrismaEnvDiagnostic>["databaseUrl"],
) {
  if (!metadata.configured) {
    return `${name}: unset`;
  }

  return [
    `${name}: set`,
    `protocol=${metadata.protocol ?? "unknown"}`,
    `host=${metadata.host ?? "unknown"}`,
    `port=${metadata.port ?? "default"}`,
    `local=${metadata.isLocal ? "yes" : "no"}`,
    `legacyPrismaPostgres=${metadata.isLegacyPrismaPostgres ? "yes" : "no"}`,
  ].join(" ");
}

const dotEnv = readDotEnv(resolve(process.cwd(), ".env"));
const diagnostic = createPrismaEnvDiagnostic({
  ...process.env,
  ...dotEnv,
});

console.log("Vision AR env doctor");
console.log(
  `DATABASE_DRIVER: ${
    diagnostic.driverExplicit ? diagnostic.driver : "missing"
  }`,
);
console.log(formatUrlMetadata("DATABASE_URL", diagnostic.databaseUrl));
console.log(formatUrlMetadata("PRISMA_DIRECT_TCP_URL", diagnostic.directUrl));

if (diagnostic.selected) {
  console.log(
    `Selected Prisma runtime: driver=${diagnostic.selected.driver} source=${diagnostic.selected.source} host=${diagnostic.selected.host}`,
  );
}

if (diagnostic.messages.length) {
  console.log("Messages:");
  for (const message of diagnostic.messages) {
    console.log(`- ${message}`);
  }
}

if (!diagnostic.valid) {
  process.exitCode = 1;
}
