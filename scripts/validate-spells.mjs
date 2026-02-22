import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

import Ajv from "ajv";
import YAML from "yaml";

const ROOT_DIR = process.cwd();
const SPELLS_DIR = path.join(ROOT_DIR, "spells");
const SCHEMA_PATH = path.join(ROOT_DIR, "schemas", "spell.schema.json");
const SUPPORTED_EXTENSIONS = new Set([".json", ".yaml", ".yml"]);

async function collectSpellFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectSpellFiles(fullPath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

async function loadSchema(schemaPath) {
  const raw = await fs.readFile(schemaPath, "utf8");
  return JSON.parse(raw);
}

async function parseSpellFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".json") {
    return JSON.parse(raw);
  }

  return YAML.parse(raw);
}

function formatAjvError(error) {
  const location = error.instancePath || "/";
  const property = error.params?.missingProperty
    ? ` (missing: ${String(error.params.missingProperty)})`
    : "";

  return `${location} ${error.message ?? "validation error"}${property}`;
}

async function main() {
  const schema = await loadSchema(SCHEMA_PATH);
  const ajv = new Ajv({
    allErrors: true,
    strict: true,
    strictRequired: true
  });

  const validate = ajv.compile(schema);
  const files = await collectSpellFiles(SPELLS_DIR);

  if (files.length === 0) {
    throw new Error("No spell files found under /spells");
  }

  let failures = 0;

  for (const filePath of files) {
    const relativePath = path.relative(ROOT_DIR, filePath);

    try {
      const parsed = await parseSpellFile(filePath);
      const valid = validate(parsed);

      if (!valid) {
        failures += 1;
        console.error(`✗ ${relativePath}`);
        for (const error of validate.errors ?? []) {
          console.error(`  - ${formatAjvError(error)}`);
        }
        continue;
      }

      console.log(`✓ ${relativePath}`);
    } catch (error) {
      failures += 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`✗ ${relativePath}`);
      console.error(`  - ${message}`);
    }
  }

  if (failures > 0) {
    throw new Error(`Spell validation failed for ${failures} file(s).`);
  }

  console.log(`Validated ${files.length} spell file(s) using schemas/spell.schema.json`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
