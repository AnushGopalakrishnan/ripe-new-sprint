import { NextResponse, type NextRequest } from "next/server";

const routeAliases = new Map<string, string>([
  ["/", "/"],
  ["/case-studies", "/case-studies-new"],
  ["/writing", "/archive/writing-new-copy"],
  ["/team", "/archive/team-new"],
  ["/careers", "/archive/careers"],
  ["/services", "/archive/services"],
  ["/work", "/archive/work"],
]);

const mirroredPrefixes = [
  "/archive/",
  "/case-studies-new",
  "/case-studies-tags/",
  "/case-studies/",
  "/feed-posts/",
  "/job-listings/",
  "/team/",
  "/writing/",
];

function toVisualMirrorPath(routePath: string) {
  if (routePath === "/") {
    return "/visual-mirror";
  }

  return `/visual-mirror${routePath}`;
}

function shouldRewriteToMirror(pathname: string) {
  if (routeAliases.has(pathname)) {
    return true;
  }

  return mirroredPrefixes.some((prefix) => pathname.startsWith(prefix));
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

  if (shouldRewriteToMirror(url.pathname)) {
    const target = routeAliases.get(url.pathname) ?? url.pathname;
    url.pathname = toVisualMirrorPath(target);
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
    "/case-studies",
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
