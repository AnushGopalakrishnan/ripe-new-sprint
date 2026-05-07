import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

async function loadEnvFile(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

const rootDir = path.resolve(".");
await loadEnvFile(path.join(rootDir, ".env"));
await loadEnvFile(path.join(rootDir, ".env.local"));
const inputPath =
  process.env.SANITY_IMPORT_FILE ||
  path.join(rootDir, ".context", "sanity", "import.ndjson");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-03-01";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required.");
}

if (!token) {
  throw new Error("SANITY_API_WRITE_TOKEN is required.");
}

function batch(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function commitBatch(docsBatch) {
  const response = await fetch(
    `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mutations: docsBatch.map((doc) => ({
          createOrReplace: doc,
        })),
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Sanity mutation failed: ${response.status} ${await response.text()}`
    );
  }

  return response.json();
}

async function main() {
  const content = await fs.readFile(inputPath, "utf8");
  const docs = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  const chunks = batch(docs, 50);
  for (const [index, docsBatch] of chunks.entries()) {
    await commitBatch(docsBatch);
    console.log(
      `[sanity-import] committed batch ${index + 1}/${chunks.length} (${docsBatch.length} docs)`
    );
  }

  console.log(
    `[sanity-import] imported ${docs.length} documents into ${projectId}/${dataset}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
