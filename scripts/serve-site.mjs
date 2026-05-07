import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { lookup } from "node:dns/promises";

const rootDir = path.resolve("site");
const host = "127.0.0.1";
const port = Number(process.env.PORT || "3000");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function resolvePath(requestPath) {
  const pathname = decodeURIComponent(new URL(requestPath, `http://${host}`).pathname);
  const clean = pathname.replace(/^\/+/, "");

  if (!clean) return path.join(rootDir, "index.html");
  if (path.extname(clean)) return path.join(rootDir, clean);
  return path.join(rootDir, clean, "index.html");
}

const server = http.createServer(async (req, res) => {
  try {
    const filePath = resolvePath(req.url || "/");
    const body = await fs.readFile(filePath);
    const type = mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "content-type": type });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, host, async () => {
  await lookup(host);
  console.log(`http://${host}:${port}`);
});
