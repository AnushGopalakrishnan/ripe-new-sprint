import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function getTargetTriple() {
  const parts = [process.platform, process.arch];

  if (process.platform === "linux") {
    let family = null;
    try {
      const detectLibc = require("detect-libc");
      family = typeof detectLibc.familySync === "function" ? detectLibc.familySync() : null;
    } catch {
      family = null;
    }

    if (family && String(family).toLowerCase().includes("musl")) {
      parts.push("musl");
    } else if (process.arch === "arm") {
      parts.push("gnueabihf");
    } else {
      parts.push("gnu");
    }
  } else if (process.platform === "win32") {
    parts.push("msvc");
  }

  return parts.join("-");
}

function safeReadDir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function collectLightningCssDirs(nodeModulesDir) {
  const dirs = new Set();
  const rootDir = path.join(nodeModulesDir, "lightningcss");
  if (fs.existsSync(path.join(rootDir, "node", "index.js"))) {
    dirs.add(rootDir);
  }

  const pnpmStoreDir = path.join(nodeModulesDir, ".pnpm");
  for (const entry of safeReadDir(pnpmStoreDir)) {
    if (!entry.isDirectory()) continue;
    if (!entry.name.startsWith("lightningcss@")) continue;
    const pnpmLightningDir = path.join(pnpmStoreDir, entry.name, "node_modules", "lightningcss");
    if (fs.existsSync(path.join(pnpmLightningDir, "node", "index.js"))) {
      dirs.add(pnpmLightningDir);
    }
  }

  return Array.from(dirs);
}

function findSourceBinary(nodeModulesDir, targetTriple, binaryName) {
  const direct = path.join(nodeModulesDir, `lightningcss-${targetTriple}`, binaryName);
  if (fs.existsSync(direct)) return direct;

  const pnpmStoreDir = path.join(nodeModulesDir, ".pnpm");
  for (const entry of safeReadDir(pnpmStoreDir)) {
    if (!entry.isDirectory()) continue;
    if (!entry.name.startsWith(`lightningcss-${targetTriple}@`)) continue;
    const candidate = path.join(
      pnpmStoreDir,
      entry.name,
      "node_modules",
      `lightningcss-${targetTriple}`,
      binaryName,
    );
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

function main() {
  const nodeModulesDir = path.join(process.cwd(), "node_modules");
  if (!fs.existsSync(nodeModulesDir)) {
    console.log("[fix-lightningcss-native] node_modules missing, skipping");
    return;
  }

  const targetTriple = getTargetTriple();
  const binaryName = `lightningcss.${targetTriple}.node`;
  const sourceBinary = findSourceBinary(nodeModulesDir, targetTriple, binaryName);

  if (!sourceBinary) {
    console.log(`[fix-lightningcss-native] source binary ${binaryName} not found, skipping`);
    return;
  }

  const lightningCssDirs = collectLightningCssDirs(nodeModulesDir);
  if (lightningCssDirs.length === 0) {
    console.log("[fix-lightningcss-native] no lightningcss package dirs found, skipping");
    return;
  }

  let copied = 0;
  for (const lightningCssDir of lightningCssDirs) {
    const destinationBinary = path.join(lightningCssDir, binaryName);
    if (destinationBinary === sourceBinary) continue;
    if (fs.existsSync(destinationBinary)) continue;

    fs.copyFileSync(sourceBinary, destinationBinary);
    copied += 1;
  }

  if (copied > 0) {
    console.log(`[fix-lightningcss-native] copied ${binaryName} into ${copied} lightningcss package path(s)`);
  } else {
    console.log("[fix-lightningcss-native] all lightningcss package paths already have native binary");
  }
}

main();
