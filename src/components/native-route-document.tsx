import parse from "html-react-parser";
import type { NativeMirrorDocument } from "@/lib/native-mirror";
import { NativeRouteRuntime } from "@/components/native-route-runtime";

type NativeRouteDocumentProps = {
  document: NativeMirrorDocument;
};

export function NativeRouteDocument({ document }: NativeRouteDocumentProps) {
  return (
    <>
      <NativeRouteRuntime
        bodyAttributes={document.bodyAttributes}
        htmlAttributes={document.htmlAttributes}
        sourceRoute={document.sourceRoute}
      />
      {parse(document.headMarkup)}
      {parse(document.bodyMarkup)}
    </>
  );
}
