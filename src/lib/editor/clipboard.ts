import type { ClipboardSpec, EditorPatch } from "@/lib/editor/types";

export function createClipboardSpec(patches: EditorPatch[]): ClipboardSpec {
  return {
    generatedAt: new Date().toISOString(),
    patches,
  };
}

export function formatClipboardSpec(spec: ClipboardSpec): string {
  const routes = new Map<string, EditorPatch[]>();

  for (const patch of spec.patches) {
    const routePatches = routes.get(patch.route) ?? [];
    routePatches.push(patch);
    routes.set(patch.route, routePatches);
  }

  const lines = [
    "# Visual edit handoff",
    "",
    `Generated: ${spec.generatedAt}`,
    `Routes: ${routes.size}`,
    `Targets: ${spec.patches.length}`,
    "",
  ];

  for (const [route, patches] of routes.entries()) {
    lines.push(`## ${route}`, "");
    lines.push(`${patches.length} target${patches.length === 1 ? "" : "s"} drafted`, "");

    patches.forEach((patch, index) => {
      lines.push(`### ${index + 1}. ${patch.target.tag}`);
      lines.push(`Selector: \`${patch.target.selector}\``);
      lines.push("Fingerprint:", "```json");
      lines.push(JSON.stringify(
        {
          id: patch.target.id,
          dataAttrs: patch.target.dataAttrs,
          classes: patch.target.classes,
          nthOfType: patch.target.nthOfType,
          textSnippet: patch.target.textSnippet,
        },
        null,
        2,
      ));
      lines.push("```");

      if (patch.notes.trim()) {
        lines.push(`Notes: ${patch.notes.trim()}`);
      }

      lines.push("Changes:");
      if (patch.changes.length === 0) {
        lines.push("- No style/content changes; note only.");
      }
      for (const change of patch.changes) {
        if (change.kind === "style") {
          lines.push(
            `- ${change.viewport}: ${change.property}: ${JSON.stringify(
              change.before,
            )} -> ${JSON.stringify(change.after)}`,
          );
        } else if (change.kind === "content") {
          lines.push(
            `- ${change.field}: ${JSON.stringify(change.before)} -> ${JSON.stringify(
              change.after,
            )}`,
          );
        } else {
          lines.push(`- ${change.action}: ${change.before ? "on" : "off"} -> ${change.after ? "on" : "off"}`);
        }
      }
      lines.push("");
    });
  }

  lines.push("```json", JSON.stringify(spec, null, 2), "```");

  return lines.join("\n");
}
