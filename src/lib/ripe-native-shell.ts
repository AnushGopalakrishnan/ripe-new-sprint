import { cache } from "react";
import { loadNativeMirrorDocument, type NativeMirrorDocument } from "@/lib/native-mirror";
import { prepareStaticMirrorDocument } from "@/lib/static-mirror-document";

const shellSourceRoute = "/archive/work";
const mainMarker = '<section class="main">';
const footerMarker = '<section class="footer-wrap">';
const sectionMarker = "<section";
const sectionClose = "</section>";

export const getRipeNativeShellParts = cache(async () => {
  const document = prepareStaticMirrorDocument(await loadNativeMirrorDocument(shellSourceRoute));
  const mainStart = document.bodyMarkup.indexOf(mainMarker);
  const footerStart = document.bodyMarkup.indexOf(footerMarker);
  const footerEnd = footerStart === -1 ? -1 : document.bodyMarkup.indexOf(sectionClose, footerStart);

  if (mainStart === -1 || footerStart === -1 || footerEnd === -1) {
    return {
      navMarkup: "",
      footerMarkup: "",
    };
  }

  return {
    navMarkup: document.bodyMarkup.slice(0, mainStart),
    footerMarkup: document.bodyMarkup.slice(footerStart, footerEnd + sectionClose.length),
  };
});

export function getMirrorContentWithoutShell(document: NativeMirrorDocument) {
  const contentStart = document.bodyMarkup.indexOf(sectionMarker);
  const footerStart = document.bodyMarkup.indexOf(footerMarker);

  if (contentStart === -1) return document.bodyMarkup;

  return document.bodyMarkup.slice(
    contentStart,
    footerStart === -1 || footerStart <= contentStart ? undefined : footerStart,
  );
}
