type ResolveVideoPosterInput = {
  poster?: string | null;
  src?: string | null;
  hlsUrl?: string | null;
};

function normalizeValue(value: string | null | undefined) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isMuxStreamHost(hostname: string) {
  return /(^|\.)stream\.mux\.com$/i.test(hostname);
}

function isCloudflareStreamHost(hostname: string) {
  return /(^|\.)cloudflarestream\.com$/i.test(hostname);
}

function appendToken(url: URL, token: string | null) {
  if (!token) return url;
  url.searchParams.set("token", token);
  return url;
}

function deriveMuxPoster(sourceUrl: URL) {
  if (!isMuxStreamHost(sourceUrl.hostname)) return undefined;

  const pathnameMatch = sourceUrl.pathname.match(/^\/([^/]+)\.m3u8$/i);
  const playbackId = pathnameMatch?.[1];
  if (!playbackId || !/^[A-Za-z0-9_-]+$/.test(playbackId)) return undefined;

  const posterUrl = new URL(`https://image.mux.com/${playbackId}/thumbnail.webp`);
  posterUrl.searchParams.set("width", "1600");
  posterUrl.searchParams.set("fit_mode", "preserve");
  return appendToken(posterUrl, sourceUrl.searchParams.get("token")).toString();
}

function deriveCloudflarePoster(sourceUrl: URL) {
  if (!isCloudflareStreamHost(sourceUrl.hostname)) return undefined;

  const segments = sourceUrl.pathname.split("/").filter(Boolean);
  if (segments.length < 3) return undefined;
  if (segments[1] !== "manifest") return undefined;
  if (!segments[2].toLowerCase().startsWith("video.m3u8")) return undefined;

  const videoIdOrToken = segments[0];
  if (!videoIdOrToken) return undefined;

  const posterUrl = new URL(sourceUrl.origin);
  posterUrl.pathname = `/${videoIdOrToken}/thumbnails/thumbnail.jpg`;
  posterUrl.searchParams.set("time", "2s");
  posterUrl.searchParams.set("height", "720");
  posterUrl.searchParams.set("fit", "clip");
  return appendToken(posterUrl, sourceUrl.searchParams.get("token")).toString();
}

function derivePosterFromSource(source: string | undefined) {
  if (!source) return undefined;
  const sourceUrl = toUrl(source);
  if (!sourceUrl) return undefined;

  return deriveMuxPoster(sourceUrl) ?? deriveCloudflarePoster(sourceUrl);
}

export function resolveVideoPoster({ poster, src, hlsUrl }: ResolveVideoPosterInput) {
  const customPoster = normalizeValue(poster);
  if (customPoster) return customPoster;

  return derivePosterFromSource(normalizeValue(hlsUrl)) ?? derivePosterFromSource(normalizeValue(src));
}
