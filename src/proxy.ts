import { NextResponse, type NextRequest } from "next/server";

const legacyRedirects = new Map<string, string>([
  ["/case-studies-new", "/case-studies"],
  ["/case-studies-new-copy", "/case-studies"],
  ["/archive/writing", "/writing"],
  ["/archive/writing-new-copy", "/writing"],
  ["/archive/team", "/team"],
  ["/archive/team-new", "/team"],
  ["/archive/services", "/services"],
  ["/archive/careers", "/careers"],
  ["/archive/work", "/work"],
]);

function toVisualMirrorPath(routePath: string) {
  if (routePath === "/") {
    return "/visual-mirror";
  }

  return `/visual-mirror${routePath}`;
}

function legacyRedirectTarget(pathname: string) {
  if (legacyRedirects.has(pathname)) {
    return legacyRedirects.get(pathname) ?? null;
  }

  const caseStudyTagMatch = pathname.match(/^\/case-studies-tags\/(.+)$/);
  if (caseStudyTagMatch) {
    return `/case-studies/tags/${caseStudyTagMatch[1]}`;
  }

  return null;
}

function shouldRewriteToMirror(pathname: string) {
  return pathname.startsWith("/feed-posts/") || pathname.startsWith("/job-listings/");
}

function shouldServeExportAsset(pathname: string) {
  return /^(?:\/css\/|\/fonts\/|\/images\/|\/js\/|\/vendor\/)/.test(pathname);
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  if (url.pathname === "/__editor" || url.pathname.startsWith("/__editor/")) {
    url.pathname = url.pathname.replace(/^\/__editor/, "/visual-editor");
    return NextResponse.rewrite(url);
  }

  if (url.pathname === "/__mirror" || url.pathname.startsWith("/__mirror/")) {
    url.pathname = url.pathname.replace(/^\/__mirror/, "/visual-mirror");
    return NextResponse.rewrite(url);
  }

  if (shouldServeExportAsset(url.pathname)) {
    url.pathname = `/visual-mirror${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  const redirectTarget = legacyRedirectTarget(url.pathname);
  if (redirectTarget) {
    url.pathname = redirectTarget;
    return NextResponse.redirect(url, 308);
  }

  if (shouldRewriteToMirror(url.pathname)) {
    url.pathname = toVisualMirrorPath(url.pathname);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/__editor/:path*",
    "/__mirror/:path*",
    "/archive/:path*",
    "/css/:path*",
    "/fonts/:path*",
    "/images/:path*",
    "/js/:path*",
    "/vendor/:path*",
    "/case-studies",
    "/case-studies/tags/:path*",
    "/case-studies-new",
    "/case-studies-new/:path*",
    "/case-studies-new-copy",
    "/case-studies-new-copy/:path*",
    "/case-studies-tags/:path*",
    "/case-studies/:path*",
    "/feed-posts/:path*",
    "/job-listings/:path*",
    "/team",
    "/team/:path*",
    "/writing",
    "/writing/:path*",
    "/careers",
    "/services",
    "/work",
  ],
};
