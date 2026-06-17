import { readMirrorResource } from "@/lib/editor/mirror";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;

  try {
    const resource = await readMirrorResource(params.path ?? []);
    if (!resource) {
      return new Response("Not found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    return new Response(resource.body, {
      headers: {
        "content-type": resource.contentType,
        "cache-control": "no-store",
      },
    });
  } catch {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
