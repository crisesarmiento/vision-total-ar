import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const skillRoot = path.join(root, ".agents", "skills");
const docsRoot = path.join(root, "docs", "skills");
const namePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const secretPatterns = [
  {
    name: "PostgreSQL connection string with credentials",
    pattern: /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@/i,
  },
  {
    name: "private key block",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/i,
  },
  {
    name: "OpenAI-style secret key",
    pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/,
  },
  {
    name: "Neon password token",
    pattern: /\bnpg_[A-Za-z0-9]{10,}\b/,
  },
  {
    name: "assignment of production database or API secret",
    pattern:
      /\b(?:PRODUCTION_DATABASE_URL|DATABASE_URL|LINEAR_API_KEY|VERCEL_TOKEN|GITHUB_TOKEN|GH_TOKEN|RESEND_API_KEY|YOUTUBE_API_KEY|UPLOADTHING_SECRET)\s*=\s*["']?[^"'\s]+/i,
  },
];

const errors = [];

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseFrontmatter(content, filePath) {
  if (!content.startsWith("---\n")) {
    errors.push(`${filePath}: missing YAML frontmatter`);
    return null;
  }

  const end = content.indexOf("\n---", 4);
  if (end === -1) {
    errors.push(`${filePath}: unterminated YAML frontmatter`);
    return null;
  }

  const raw = content.slice(4, end).trim();
  const fields = new Map();

  for (const line of raw.split("\n")) {
    const match = /^([A-Za-z0-9_-]+):\s*(.+)$/.exec(line.trim());
    if (!match) {
      errors.push(`${filePath}: unsupported frontmatter line "${line}"`);
      continue;
    }
    fields.set(match[1], match[2].replace(/^["']|["']$/g, "").trim());
  }

  return fields;
}

function scanForSecrets(content, filePath) {
  for (const { name, pattern } of secretPatterns) {
    if (pattern.test(content)) {
      errors.push(`${filePath}: possible secret detected (${name})`);
    }
  }
}

async function readMarkdownFiles(dir) {
  if (!(await exists(dir))) {
    return [];
  }

  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await readMarkdownFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(entryPath);
    }
  }

  return files;
}

async function validateSkill(skillName) {
  const skillDir = path.join(skillRoot, skillName);
  const skillPath = path.join(skillDir, "SKILL.md");

  if (!namePattern.test(skillName)) {
    errors.push(`${skillDir}: skill folder must be lowercase kebab-case`);
  }

  if (!(await exists(skillPath))) {
    errors.push(`${skillDir}: missing SKILL.md`);
    return;
  }

  const content = await readFile(skillPath, "utf8");
  const frontmatter = parseFrontmatter(content, skillPath);
  scanForSecrets(content, skillPath);

  if (!frontmatter) {
    return;
  }

  const declaredName = frontmatter.get("name");
  const description = frontmatter.get("description");

  if (!declaredName) {
    errors.push(`${skillPath}: missing frontmatter field "name"`);
  } else if (declaredName !== skillName) {
    errors.push(
      `${skillPath}: frontmatter name "${declaredName}" must match folder "${skillName}"`,
    );
  }

  if (!description) {
    errors.push(`${skillPath}: missing frontmatter field "description"`);
  } else if (description.length < 80) {
    errors.push(`${skillPath}: description must be specific enough to trigger`);
  }

  const body = content.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();
  if (body.length < 200) {
    errors.push(`${skillPath}: body is too short to guide useful behavior`);
  }
}

async function main() {
  if (!(await exists(skillRoot))) {
    errors.push(".agents/skills: directory does not exist");
  } else {
    const entries = await readdir(skillRoot, { withFileTypes: true });
    const skillDirs = entries.filter((entry) => entry.isDirectory());

    if (skillDirs.length === 0) {
      errors.push(".agents/skills: no skill folders found");
    }

    for (const entry of skillDirs) {
      await validateSkill(entry.name);
    }
  }

  for (const file of await readMarkdownFiles(docsRoot)) {
    scanForSecrets(await readFile(file, "utf8"), file);
  }

  if (errors.length > 0) {
    console.error("Skill validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Skill validation passed.");
}

await main();
