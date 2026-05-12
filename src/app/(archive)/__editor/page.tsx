import { getMirrorRoutes } from "@/lib/editor/mirror";
import { EditorShell } from "./shell";

type EditorPageProps = {
  searchParams: Promise<{ path?: string }> | { path?: string };
};

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const [{ path }, routes] = await Promise.all([
    Promise.resolve(searchParams),
    getMirrorRoutes(),
  ]);

  return <EditorShell initialPath={path || "/"} routes={routes} />;
}
