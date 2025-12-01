import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import * as z from "zod";
// Import schema directly from source - zod and zod/mini schemas are compatible in Zod v4
import { ConfigFileSchema } from "../src/config/config.js";

// Generate JSON Schema from the source schema
// Note: zod/mini schemas work with zod's toJSONSchema in Zod v4
const generatedSchema = z.toJSONSchema(ConfigFileSchema, {
  reused: "ref",
});

// Add JSON Schema meta properties (override Zod's default $schema with draft-07 for broader compatibility)
const jsonSchema = {
  ...generatedSchema,
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://raw.githubusercontent.com/dyoshikawa/rulesync/main/schemas/rulesync.schema.json",
  title: "Rulesync Configuration",
  description: "Configuration file for Rulesync CLI tool",
};

// Ensure output directory exists
const outputPath = join(process.cwd(), "schemas/rulesync.schema.json");
const outputDir = dirname(outputPath);
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Write schema file
writeFileSync(outputPath, JSON.stringify(jsonSchema, null, 2) + "\n");

// oxlint-disable-next-line no-console
console.log(`JSON Schema generated: ${outputPath}`);
