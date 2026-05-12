import type { NativeMirrorDocument } from "@/lib/native-mirror";

const nativeScriptTemplatePattern = /<template\b(?=[^>]*data-ripe-native-script)[\s\S]*?<\/template>/gi;
const webflowDataAttributePattern =
  /\sdata-wf-[^\s=]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi;

function stripNativeScriptTemplates(markup: string) {
  return markup.replace(nativeScriptTemplatePattern, "");
}

function stripWebflowAttributes(attributes: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(attributes).filter(([name]) => !name.startsWith("data-wf-")),
  );
}

function stripWebflowDataAttributes(markup: string) {
  return markup.replace(webflowDataAttributePattern, "");
}

export function prepareStaticMirrorDocument(document: NativeMirrorDocument): NativeMirrorDocument {
  return {
    ...document,
    bodyAttributes: stripWebflowAttributes(document.bodyAttributes),
    bodyMarkup: stripWebflowDataAttributes(stripNativeScriptTemplates(document.bodyMarkup)),
    headMarkup: stripWebflowDataAttributes(stripNativeScriptTemplates(document.headMarkup)),
    htmlAttributes: stripWebflowAttributes(document.htmlAttributes),
  };
}
