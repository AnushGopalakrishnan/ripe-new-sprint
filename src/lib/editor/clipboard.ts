import type { ClipboardSpec, EditorComment, EditorPatch } from "@/lib/editor/types";

export function createClipboardSpec(patches: EditorPatch[], comments: EditorComment[] = []): ClipboardSpec {
  return {
    generatedAt: new Date().toISOString(),
    patches,
    comments: comments
      .filter((comment) => comment.note.trim().length > 0)
      .map((comment) => ({ ...comment, note: comment.note.trim() })),
  };
}

export function formatClipboardSpec(spec: ClipboardSpec): string {
  const routes = new Map<string, EditorPatch[]>();
  const commentRoutes = new Map<string, EditorComment[]>();

  for (const patch of spec.patches) {
    const routePatches = routes.get(patch.route) ?? [];
    routePatches.push(patch);
    routes.set(patch.route, routePatches);
  }

  for (const comment of spec.comments ?? []) {
    const routeComments = commentRoutes.get(comment.route) ?? [];
    routeComments.push(comment);
    commentRoutes.set(comment.route, routeComments);
  }

  const routeKeys = Array.from(new Set([...routes.keys(), ...commentRoutes.keys()]));

  const lines = [
    "# Visual edit handoff",
    "",
    `Generated: ${spec.generatedAt}`,
    `Routes: ${routeKeys.length}`,
    `Targets: ${spec.patches.length}`,
    `Comments: ${spec.comments?.length ?? 0}`,
    "",
  ];

  for (const route of routeKeys) {
    const patches = routes.get(route) ?? [];
    const comments = commentRoutes.get(route) ?? [];
    lines.push(`## ${route}`, "");
    lines.push(`${patches.length} target${patches.length === 1 ? "" : "s"} drafted`);
    lines.push(`${comments.length} comment${comments.length === 1 ? "" : "s"} anchored`, "");

    patches.forEach((patch, index) => {
      lines.push(`### ${index + 1}. ${patch.target.tag}`);
      lines.push(`Selector: \`${patch.target.selector}\``);
      if (patch.scope?.kind === "class") {
        lines.push(`Scope: class \`${patch.scope.selector}\` (${patch.scope.matchCount} element${patch.scope.matchCount === 1 ? "" : "s"} on page)`);
      } else if (patch.scope?.kind === "tag") {
        lines.push(`Scope: tag \`${patch.scope.selector}\` (${patch.scope.matchCount} element${patch.scope.matchCount === 1 ? "" : "s"} on page)`);
      } else {
        lines.push("Scope: selected element");
      }
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

    if (comments.length > 0) {
      lines.push("### Comments", "");
      comments.forEach((comment, index) => {
        lines.push(`#### C${index + 1}. ${comment.target.tag}`);
        lines.push(`Selector: \`${comment.target.selector}\``);
        lines.push(`Anchor: ${Math.round(comment.anchor.x * 100)}% ${Math.round(comment.anchor.y * 100)}%`);
        lines.push("Fingerprint:", "```json");
        lines.push(JSON.stringify(
          {
            id: comment.target.id,
            dataAttrs: comment.target.dataAttrs,
            classes: comment.target.classes,
            nthOfType: comment.target.nthOfType,
            textSnippet: comment.target.textSnippet,
          },
          null,
          2,
        ));
        lines.push("```");
        lines.push(`Comment: ${comment.note.trim()}`, "");
      });
    }
  }

  lines.push("```json", JSON.stringify(spec, null, 2), "```");

  return lines.join("\n");
}
