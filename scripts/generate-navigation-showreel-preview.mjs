import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const fallbackInput = path.join(root, "public/feed-media/polestar.mp4");
const output = path.join(root, process.env.NAV_SHOWREEL_GIF_OUTPUT || "public/nav-media/showreel-preview.gif");
const ffmpeg = process.env.FFMPEG_BIN || "ffmpeg";
const shouldForce = process.env.FORCE_NAV_SHOWREEL_GIF === "1";

function loadLocalEnv() {
  for (const file of [".env.local", ".env"]) {
    const envPath = path.join(root, file);
    if (!existsSync(envPath)) continue;

    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();
      if (!key || process.env[key] !== undefined) continue;
      if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

async function resolveSanityVideoSource() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-03-01";

  if (!projectId || !dataset) return null;

  const query = `(*[_type == "siteSettings"] | order(_updatedAt desc))[0].navigationShowreel.video{
    "src": coalesce(longFormHlsUrl, src, upload.asset->url, video.asset->url, image.asset->url)
  }.src`;
  const url = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`);
  url.searchParams.set("query", query);

  try {
    const response = await fetch(url, {
      headers: process.env.SANITY_API_READ_TOKEN
        ? { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` }
        : undefined,
    });

    if (!response.ok) {
      console.warn(`could not read CMS showreel video (${response.status})`);
      return null;
    }

    const payload = await response.json();
    return typeof payload.result === "string" && payload.result.trim() ? payload.result.trim() : null;
  } catch (error) {
    console.warn(`could not read CMS showreel video: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function resolveInput() {
  if (process.env.NAV_SHOWREEL_VIDEO_SOURCE) {
    const input = process.env.NAV_SHOWREEL_VIDEO_SOURCE.startsWith("http")
      ? process.env.NAV_SHOWREEL_VIDEO_SOURCE
      : path.join(root, process.env.NAV_SHOWREEL_VIDEO_SOURCE);
    return { input, source: "override" };
  }

  const sanityInput = await resolveSanityVideoSource();
  if (sanityInput) return { input: sanityInput, source: "cms" };

  return { input: fallbackInput, source: "fallback" };
}

function isRemoteSource(value) {
  return /^https?:\/\//i.test(value);
}

function isFresh(input) {
  if (shouldForce || !existsSync(output) || isRemoteSource(input) || !existsSync(input)) return false;
  return statSync(output).mtimeMs >= statSync(input).mtimeMs;
}

const { input, source } = await resolveInput();

if (isFresh(input)) {
  console.log("navigation showreel GIF is current");
  process.exit(0);
}

console.log(`generating navigation showreel GIF from ${source} source`);

if (!isRemoteSource(input) && !existsSync(input)) {
  if (existsSync(output)) {
    console.warn(`navigation showreel source missing, keeping existing GIF: ${path.relative(root, output)}`);
    process.exit(0);
  }

  console.error(`navigation showreel source missing: ${path.relative(root, input)}`);
  process.exit(1);
}

mkdirSync(path.dirname(output), { recursive: true });

const result = spawnSync(
  ffmpeg,
  [
    "-y",
    "-ss",
    process.env.NAV_SHOWREEL_GIF_START || "0",
    "-t",
    process.env.NAV_SHOWREEL_GIF_DURATION || "4",
    "-i",
    input,
    "-vf",
    `fps=${process.env.NAV_SHOWREEL_GIF_FPS || "12"},scale=${process.env.NAV_SHOWREEL_GIF_WIDTH || "520"}:-1:flags=lanczos`,
    output,
  ],
  { stdio: "inherit" },
);

if (result.error?.code === "ENOENT" && existsSync(output)) {
  console.warn("ffmpeg is unavailable, keeping existing navigation showreel GIF");
  process.exit(0);
}

if (result.status !== 0) {
  console.error("failed to generate navigation showreel GIF");
  process.exit(result.status || 1);
}
