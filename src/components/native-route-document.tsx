import parse from "html-react-parser";
import type { NativeMirrorDocument } from "@/lib/native-mirror";
import { NativeRouteRuntime } from "@/components/native-route-runtime";

type NativeRouteDocumentProps = {
  document: NativeMirrorDocument;
  executeScripts?: boolean;
  webflowRuntime?: boolean;
};

export function NativeRouteDocument({
  document,
  executeScripts,
  webflowRuntime,
}: NativeRouteDocumentProps) {
  return (
    <>
      <NativeRouteRuntime
        bodyAttributes={document.bodyAttributes}
        executeScripts={executeScripts}
        htmlAttributes={document.htmlAttributes}
        sourceRoute={document.sourceRoute}
        webflowRuntime={webflowRuntime}
      />
      {parse(document.headMarkup)}
      {parse(document.bodyMarkup)}
    </>
  );
}
