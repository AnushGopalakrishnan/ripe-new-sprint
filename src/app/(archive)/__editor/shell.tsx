"use client";

import {
  BoxIcon,
  ChevronDownIcon,
  ClipboardIcon,
  ComputerIcon,
  CopyCheckIcon,
  CursorPointer02Icon,
  Delete02Icon,
  EyeIcon,
  EyeOffIcon,
  File01Icon,
  HorizontalResizeIcon,
  Image01Icon,
  Layers01Icon,
  Maximize02Icon,
  Minimize02Icon,
  PaintBucketIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  Redo03Icon,
  RotateLeft01Icon,
  Search01Icon,
  SlidersHorizontalIcon,
  SmartPhone01Icon,
  Tablet01Icon,
  TextIcon,
  Undo03Icon,
  VerticalResizeIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Badge } from "@/components/editor-ui/badge";
import { Button } from "@/components/editor-ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/editor-ui/command";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/editor-ui/field";
import { Input } from "@/components/editor-ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/editor-ui/input-group";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/editor-ui/resizable";
import { ScrollArea } from "@/components/editor-ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/editor-ui/select";
import { Separator } from "@/components/editor-ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/editor-ui/sheet";
import { Textarea } from "@/components/editor-ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/editor-ui/tabs";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/editor-ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/editor-ui/tooltip";
import { Toaster } from "@/components/editor-ui/sonner";
import { createClipboardSpec, formatClipboardSpec } from "@/lib/editor/clipboard";
import type {
  ContentChange,
  ElementChange,
  EditorChange,
  EditorPatch,
  ElementTarget,
  MirrorRoute,
  SelectionMetadata,
  StyleChange,
  ViewportName,
} from "@/lib/editor/types";
import styles from "./shell.module.css";

type EditorShellProps = {
  initialPath: string;
  routes: MirrorRoute[];
};

type FieldConfig = {
  property: string;
  label: string;
  placeholder?: string;
  options?: string[];
  unit?: string;
  units?: string[];
  keywords?: string[];
  step?: number;
  min?: number;
  max?: number;
};

type FontAccessState = "idle" | "loading" | "loaded" | "unavailable" | "denied";

type FontOption = {
  family: string;
  source: "fallback" | "system";
};

type NumericUnitConversion = {
  property: string;
  value: string;
  nextUnit: string;
};

type EditorHistorySnapshot = {
  patches: EditorPatch[];
  selection: SelectionMetadata | null;
  selections: SelectionMetadata[];
  baseStyles: Record<string, string>;
  styleValues: Record<string, string>;
  textValue: string;
  imageValue: string;
  hidden: boolean;
  deleted: boolean;
  notes: string;
};

type EditorRuntimeState = EditorHistorySnapshot & {
  route: string;
  viewport: ViewportName;
};

type EditorDraftInput = {
  changes: EditorChange[];
  notes: string;
  target: ElementTarget;
};

type PreviewDraftPayload = {
  target: ElementTarget;
  styles: Record<string, string>;
  text?: string;
  imageSrc?: string;
  hidden?: boolean;
  deleted?: boolean;
};

type ApplyEditorPatchesResponse = {
  ok?: boolean;
  applied?: number;
  appliedPatchIds?: string[];
  files?: string[];
  mode?: "override" | "source";
  unsupported?: Array<{ selector: string; changes: string[] }>;
  file?: string;
  message?: string;
};

type ApplyEditorMode = "override" | "source";

type StyleValueChangeOptions = {
  undo?: "push" | "skip";
  commit?: "preview" | "commit" | "cancel";
  transactionId?: string;
};

type StyleValueChange = (value: string, options?: StyleValueChangeOptions) => void;
type EditorValueChange = (value: string, options?: StyleValueChangeOptions) => void;
type EditorIconType = IconSvgElement;

type LocalFontData = {
  family: string;
  fullName?: string;
  postscriptName?: string;
  style?: string;
};

declare global {
  interface Window {
    queryLocalFonts?: () => Promise<LocalFontData[]>;
  }
}

type FieldGroupName = "layout" | "spacing" | "typography" | "appearance";

function EditorIcon({
  icon,
  strokeWidth = 1.8,
  ...props
}: Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon"> & { icon: EditorIconType }) {
  return <HugeiconsIcon icon={icon} strokeWidth={strokeWidth} {...props} />;
}

const viewportSizes: Record<ViewportName, { width: number; icon: EditorIconType; label: string }> = {
  desktop: { width: 1440, icon: ComputerIcon, label: "Desktop" },
  tablet: { width: 834, icon: Tablet01Icon, label: "Tablet" },
  mobile: { width: 390, icon: SmartPhone01Icon, label: "Mobile" },
};

const lengthUnits = ["px", "%", "rem", "em", "vw", "vh", "vmin", "vmax", "ch"];
const textLengthUnits = ["px", "rem", "em", "%", "vw", "vh"];
const lineHeightUnits = ["", "px", "rem", "em", "%"];
const sizeKeywords = ["auto", "min-content", "max-content", "fit-content"];
const maxSizeKeywords = ["none", "min-content", "max-content", "fit-content"];
const marginKeywords = ["auto"];
const genericFontFamilies = new Set(["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui"]);
const textOnlyStyleProperties = new Set(["fontFamily", "fontSize", "lineHeight", "letterSpacing", "fontWeight", "textAlign", "color"]);
const nonTextTargetTags = new Set(["img", "picture", "video", "source", "canvas", "svg", "path"]);
const fallbackFontFamilies = [
  "Graphik",
  "Plantin MT Pro",
  "Arial",
  "Helvetica Neue",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Menlo",
  "Monaco",
  "system-ui",
  "sans-serif",
  "serif",
  "monospace",
];
const fallbackFontOptions = fallbackFontFamilies.map<FontOption>((family) => ({ family, source: "fallback" }));
const colorPresets = [
  "#000000",
  "#ffffff",
  "#f5f5f5",
  "#d9d9d9",
  "#7c3aed",
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#ef4444",
  "#facc15",
  "#ec4899",
  "#0f172a",
];

const fieldGroups: Record<FieldGroupName, FieldConfig[]> = {
  layout: [
    { property: "display", label: "Display", options: ["block", "flex", "grid", "inline-flex", "none"] },
    { property: "position", label: "Position", options: ["static", "relative", "absolute", "fixed", "sticky"] },
    { property: "width", label: "Width", placeholder: "100%", unit: "px", units: lengthUnits, keywords: sizeKeywords },
    { property: "maxWidth", label: "Max width", placeholder: "720px", unit: "px", units: lengthUnits, keywords: maxSizeKeywords },
    { property: "height", label: "Height", placeholder: "auto", unit: "px", units: lengthUnits, keywords: sizeKeywords },
    { property: "gap", label: "Gap", placeholder: "16px", unit: "px", units: lengthUnits },
    { property: "alignItems", label: "Align", options: ["normal", "stretch", "flex-start", "center", "flex-end", "baseline"] },
    { property: "justifyContent", label: "Justify", options: ["normal", "flex-start", "center", "flex-end", "space-between", "space-around"] },
  ],
  spacing: [
    { property: "margin", label: "Margin", placeholder: "0px", unit: "px", units: lengthUnits, keywords: marginKeywords },
    { property: "padding", label: "Padding", placeholder: "0px", unit: "px", units: lengthUnits },
  ],
  typography: [
    { property: "fontFamily", label: "Font", placeholder: "System font" },
    { property: "fontSize", label: "Size", placeholder: "16px", unit: "px", units: textLengthUnits },
    { property: "lineHeight", label: "Line height", placeholder: "1.4", unit: "", units: lineHeightUnits, step: 0.05, min: 0 },
    { property: "letterSpacing", label: "Tracking", placeholder: "0px", unit: "px", units: textLengthUnits, step: 0.01 },
    { property: "fontWeight", label: "Weight", options: ["300", "400", "500", "600", "700", "800"] },
    { property: "textAlign", label: "Align", options: ["left", "center", "right", "justify"] },
    { property: "color", label: "Color", placeholder: "#111111" },
  ],
  appearance: [
    { property: "backgroundColor", label: "Background", placeholder: "#ffffff" },
    { property: "borderRadius", label: "Radius", placeholder: "8px", unit: "px", units: textLengthUnits },
    { property: "opacity", label: "Opacity", placeholder: "1", unit: "", step: 0.05, min: 0, max: 1 },
  ],
};

const advancedStyleProperties = new Set(["display", "position", "gap", "alignItems", "justifyContent", "opacity"]);

const groupMeta: Record<FieldGroupName | "content", { label: string; icon: EditorIconType }> = {
  layout: { label: "Layout", icon: BoxIcon },
  spacing: { label: "Space", icon: SlidersHorizontalIcon },
  typography: { label: "Type", icon: TextIcon },
  appearance: { label: "Paint", icon: PaintBucketIcon },
  content: { label: "Asset", icon: Image01Icon },
};

function normalizePath(path: string) {
  const clean = path.trim();
  if (!clean || clean === "/") return "/";
  return `/${clean.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

function canvasPath(path: string) {
  const normalized = normalizePath(path);

  const editorQuery = "__editor=1";
  const withEditorQuery = (route: string) =>
    route === "/" ? `/?${editorQuery}` : `${route}?${editorQuery}`;

  if (normalized === "/") return withEditorQuery("/");
  if (normalized === "/home-new-feed") return withEditorQuery("/home-new-feed");
  if (normalized === "/work-new") return withEditorQuery("/work-new");
  if (normalized === "/work-new-alternate") return withEditorQuery("/work-new-alternate");
  if (normalized === "/case-studies" || normalized === "/case-studies-new" || normalized === "/case-studies-new-copy") {
    return withEditorQuery("/case-studies");
  }
  if (normalized.startsWith("/case-studies/tags/") || normalized.startsWith("/case-studies-tags/")) {
    const canonical = normalized.replace(/^\/case-studies-tags\//, "/case-studies/tags/");
    return withEditorQuery(canonical);
  }
  if (/^\/case-studies\/[^/]+$/.test(normalized)) return withEditorQuery(normalized);
  if (normalized === "/writing" || normalized === "/archive/writing" || normalized === "/archive/writing-new-copy") {
    return withEditorQuery("/writing");
  }
  if (normalized.startsWith("/writing/")) return withEditorQuery(normalized);
  if (normalized === "/team" || normalized === "/archive/team" || normalized === "/archive/team-new") {
    return withEditorQuery("/team");
  }
  if (normalized.startsWith("/team/")) return withEditorQuery(normalized);
  if (normalized === "/services" || normalized === "/archive/services") return withEditorQuery("/services");
  if (normalized === "/careers" || normalized === "/archive/careers") return withEditorQuery("/careers");
  if (normalized === "/work" || normalized === "/archive/work") return withEditorQuery("/work");

  return normalized === "/" ? "/__mirror" : `/__mirror${normalized}`;
}

function storageKey(route: string) {
  return `ripe-editor:drafts:${route}`;
}

function readDrafts(route: string) {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(storageKey(route));
    return stored ? (JSON.parse(stored) as EditorPatch[]) : [];
  } catch {
    return [];
  }
}

function sameTarget(left?: ElementTarget, right?: ElementTarget) {
  return Boolean(left && right && left.selector === right.selector && left.route === right.route);
}

function changedStyleProperties(base: Record<string, string>, values: Record<string, string>) {
  return Object.entries(values)
    .filter(([property, value]) => value !== (base[property] ?? ""))
    .map(([property]) => property);
}

function upsertPatch(patches: EditorPatch[], patch: EditorPatch) {
  const index = patches.findIndex((candidate) => sameTarget(candidate.target, patch.target));
  if (index === -1) return [...patches, patch];
  return patches.map((candidate, candidateIndex) => (candidateIndex === index ? patch : candidate));
}

function previewPayloadForPatch(patch: EditorPatch) {
  const styles: Record<string, string> = {};
  let text: string | undefined;
  let imageSrc: string | undefined;
  let hidden: boolean | undefined;
  let deleted: boolean | undefined;

  for (const change of patch.changes) {
    if (change.kind === "style") {
      styles[change.property] = change.after;
    } else if (change.kind === "content") {
      if (change.field === "text") text = change.after;
      if (change.field === "imageSrc") imageSrc = change.after;
    } else if (change.action === "hide") {
      hidden = change.after;
    } else if (change.action === "delete") {
      deleted = change.after;
    }
  }

  return {
    target: patch.target,
    styles,
    text,
    imageSrc,
    hidden,
    deleted,
  };
}

function elementActionValue(patch: EditorPatch | undefined, action: ElementChange["action"]) {
  const change = patch?.changes.find((candidate): candidate is ElementChange => (
    candidate.kind === "element" && candidate.action === action
  ));
  return change?.after ?? false;
}

function patchedBaseStyles(selection: SelectionMetadata, patch: EditorPatch | undefined) {
  if (!patch) return selection.computedStyles;

  const styles = { ...selection.computedStyles };
  for (const change of patch.changes) {
    if (change.kind === "style") styles[change.property] = change.before;
  }
  return styles;
}

function patchedBaseContentValue(
  selection: SelectionMetadata,
  patch: EditorPatch | undefined,
  field: ContentChange["field"],
) {
  const change = patch?.changes.find((candidate): candidate is ContentChange => (
    candidate.kind === "content" && candidate.field === field
  ));
  if (change) return change.before;
  return field === "text" ? selection.text : selection.imageSrc;
}

function patchedBaseSelection(selection: SelectionMetadata, patch: EditorPatch | undefined): SelectionMetadata {
  return {
    ...selection,
    computedStyles: patchedBaseStyles(selection, patch),
    text: patchedBaseContentValue(selection, patch, "text"),
    imageSrc: patchedBaseContentValue(selection, patch, "imageSrc"),
  };
}

function patchedStyleValues(base: Record<string, string>, patch: EditorPatch | undefined) {
  if (!patch) return base;

  const styles = { ...base };
  for (const change of patch.changes) {
    if (change.kind === "style") styles[change.property] = change.after;
  }
  return styles;
}

function patchedContentValue(
  selection: SelectionMetadata,
  patch: EditorPatch | undefined,
  field: ContentChange["field"],
) {
  const change = patch?.changes.find((candidate): candidate is ContentChange => (
    candidate.kind === "content" && candidate.field === field
  ));
  if (change) return change.after;
  return field === "text" ? selection.text : selection.imageSrc;
}

function isTextCompatibleSelection(selection: SelectionMetadata) {
  return !nonTextTargetTags.has(selection.target.tag);
}

function isImageSelection(selection: SelectionMetadata) {
  return selection.target.tag === "img";
}

function commonComputedStyles(selections: SelectionMetadata[]) {
  const [firstSelection] = selections;
  if (!firstSelection) return {};

  const styles: Record<string, string> = {};
  for (const property of Object.keys(firstSelection.computedStyles)) {
    const firstValue = firstSelection.computedStyles[property] ?? "";
    styles[property] = selections.every((selection) => (selection.computedStyles[property] ?? "") === firstValue)
      ? firstValue
      : "";
  }
  return styles;
}

function fieldVisibleForSelections(field: FieldConfig, selections: SelectionMetadata[]) {
  if (selections.length === 0) return true;
  if (!textOnlyStyleProperties.has(field.property)) return true;
  return selections.every((selection) => selection.capabilities?.canEditText ?? isTextCompatibleSelection(selection));
}

const patchPropertyLabels: Record<string, string> = {
  alignItems: "Align",
  backgroundColor: "Background",
  borderRadius: "Radius",
  color: "Color",
  display: "Display",
  fontFamily: "Font",
  fontSize: "Size",
  fontWeight: "Weight",
  gap: "Gap",
  height: "Height",
  imageSrc: "Image",
  justifyContent: "Justify",
  letterSpacing: "Tracking",
  lineHeight: "Line height",
  margin: "Margin",
  maxWidth: "Max width",
  opacity: "Opacity",
  padding: "Padding",
  position: "Position",
  text: "Text",
  textAlign: "Text align",
  visibility: "Visibility",
  width: "Width",
};

function patchChangeLabel(change: EditorChange) {
  if (change.kind === "style") return patchPropertyLabels[change.property] ?? change.property;
  if (change.kind === "content") return patchPropertyLabels[change.field] ?? change.field;
  return change.action === "hide" ? "Hide" : "Delete";
}

function formatPatchBoolean(value: boolean) {
  return value ? "on" : "off";
}

function truncatePatchValue(value: string, maxLength = 76) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized || "empty";
  return `${normalized.slice(0, maxLength - 1)}...`;
}

function formatPatchValue(value: string | boolean) {
  if (typeof value === "boolean") return formatPatchBoolean(value);
  return `"${truncatePatchValue(value)}"`;
}

function formatPatchChange(change: EditorChange) {
  if (change.kind === "style") {
    return {
      label: patchChangeLabel(change),
      before: formatPatchValue(change.before),
      after: formatPatchValue(change.after),
      meta: change.viewport,
    };
  }

  if (change.kind === "content") {
    return {
      label: patchChangeLabel(change),
      before: formatPatchValue(change.before),
      after: formatPatchValue(change.after),
      meta: "content",
    };
  }

  return {
    label: patchChangeLabel(change),
    before: formatPatchBoolean(change.before),
    after: formatPatchBoolean(change.after),
    meta: "element",
  };
}

function summarizePatchChanges(changes: EditorChange[]) {
  if (changes.length === 0) return "Note only";
  const labels = Array.from(new Set(changes.map(patchChangeLabel)));
  const visibleLabels = labels.slice(0, 3).join(", ");
  const remainingCount = labels.length - 3;
  return remainingCount > 0 ? `${visibleLabels}, +${remainingCount} more` : visibleLabels;
}

function shortRouteLabel(route: MirrorRoute) {
  return route.label || route.path;
}

function collectionItemLabel(route: MirrorRoute) {
  return route.collection?.itemLabel || route.label || route.path;
}

const numericCssPattern = /^\s*(-?(?:\d+|\d*\.\d+))(?:\s*([a-z%]+|-))?\s*$/i;
const unitlessSelectValue = "__unitless__";

function parseNumericCssValue(value: string) {
  const match = value.match(numericCssPattern);
  if (!match) return null;
  const numberText = match[1];
  const numberValue = Number(numberText);
  if (!Number.isFinite(numberValue)) return null;
  const typedUnit = match[2] ?? "";
  const explicitUnitless = typedUnit === "-";
  return {
    explicitUnitless,
    numberText,
    numberValue,
    unit: explicitUnitless ? "" : typedUnit,
  };
}

function parseCompoundNumericUnitConversion(value: string, supportedUnits: string[]) {
  const match = value.trim().match(/^\s*(-?(?:\d+|\d*\.\d+))\s*([a-z%\s]+)\s*$/i);
  if (!match) return null;

  const numberText = match[1];
  const numberValue = Number(numberText);
  if (!Number.isFinite(numberValue)) return null;

  const unitText = match[2].replace(/\s+/g, "").toLowerCase();
  const targetUnits = supportedUnits.filter(Boolean);
  const sourceUnits = Array.from(new Set([...targetUnits, ...lengthUnits, ...textLengthUnits, ...lineHeightUnits]))
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);

  for (const sourceUnit of sourceUnits) {
    if (!unitText.startsWith(sourceUnit)) continue;
    const targetUnit = unitText.slice(sourceUnit.length);
    if (!targetUnit || targetUnit === sourceUnit || !targetUnits.includes(targetUnit)) continue;
    return {
      numberText,
      numberValue,
      sourceUnit,
      targetUnit,
    };
  }

  return null;
}

function normalizeCssKeywordValue(value: string, keywords: string[] = []) {
  const normalizedValue = value.trim().toLowerCase();
  if (!normalizedValue) return null;
  return keywords.find((keyword) => keyword.toLowerCase() === normalizedValue) ?? null;
}

function clampNumber(value: number, min?: number, max?: number) {
  if (typeof min === "number" && value < min) return min;
  if (typeof max === "number" && value > max) return max;
  return value;
}

function cssNumberPrecision(property?: string, unit?: string) {
  if (property === "letterSpacing") return 4;
  if (unit === "em" || unit === "rem") return 4;
  return 2;
}

function formatCssNumber(value: number, precision = 2) {
  return Number(value.toFixed(precision)).toString();
}

function formatNumericStyleNumber(value: number, property: string, unit: string) {
  return formatCssNumber(value, cssNumberPrecision(property, unit));
}

function shouldRoundDraggedNumericValue(property: string, unit: string) {
  if (property === "opacity") return false;
  if (!unit && property === "lineHeight") return false;
  return true;
}

function normalizeDraggedNumericValue(value: number, property: string, unit: string) {
  if (!shouldRoundDraggedNumericValue(property, unit)) return value;
  return Math.round(value);
}

function unitLabel(unit: string) {
  return unit || "unitless";
}

function unitSelectLabel(unit: string) {
  return unit || "-";
}

function normalizeCssUnit(unit: string, supportedUnits: string[]) {
  const normalized = unit.toLowerCase();
  if (supportedUnits.includes(normalized)) return normalized;
  return null;
}

function parsedNumericUnitIsSupported(
  parsed: NonNullable<ReturnType<typeof parseNumericCssValue>>,
  supportedUnits: string[],
) {
  if (parsed.explicitUnitless) return supportedUnits.includes("");
  if (parsed.unit) return normalizeCssUnit(parsed.unit, supportedUnits) !== null;
  return true;
}

function parsedNumericDraftText(parsed: NonNullable<ReturnType<typeof parseNumericCssValue>>) {
  return `${parsed.numberText}${parsed.explicitUnitless ? "-" : parsed.unit}`;
}

function cssNumericValue(numberValue: number, unit: string, property?: string) {
  return `${formatCssNumber(numberValue, cssNumberPrecision(property, unit))}${unit}`;
}

function toCssPropertyName(property: string) {
  return property.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase());
}

function toStylePropertyName(property: string) {
  return property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function percentageBasisPx(element: Element, property: string) {
  const ownerWindow = element.ownerDocument.defaultView;
  const cssProperty = toCssPropertyName(property);

  if (cssProperty === "font-size") {
    const parent = element.parentElement;
    const parentFontSize = parent ? Number.parseFloat(ownerWindow?.getComputedStyle(parent).fontSize ?? "") : NaN;
    if (Number.isFinite(parentFontSize) && parentFontSize > 0) return parentFontSize;
  }

  if (cssProperty === "line-height") {
    const fontSize = Number.parseFloat(ownerWindow?.getComputedStyle(element).fontSize ?? "");
    if (Number.isFinite(fontSize) && fontSize > 0) return fontSize;
  }

  if (cssProperty.includes("radius")) {
    const width = element.getBoundingClientRect().width;
    if (Number.isFinite(width) && width > 0) return width;
  }

  const parentWidth = element.parentElement?.getBoundingClientRect().width;
  if (parentWidth && Number.isFinite(parentWidth) && parentWidth > 0) return parentWidth;

  const viewportWidth = ownerWindow?.innerWidth;
  if (viewportWidth && Number.isFinite(viewportWidth) && viewportWidth > 0) return viewportWidth;

  return null;
}

function computedCssNumberPx(element: Element, property: string) {
  const ownerWindow = element.ownerDocument.defaultView;
  if (!ownerWindow) return null;

  const cssProperty = toCssPropertyName(property);
  const computedStyle = ownerWindow.getComputedStyle(element);
  const computedValue =
    cssProperty === "border-radius"
      ? computedStyle.getPropertyValue("border-top-left-radius")
      : computedStyle.getPropertyValue(cssProperty);
  const parsed = parseNumericCssValue(computedValue);
  if (!parsed) return null;

  if (parsed.unit === "%") {
    const basis = percentageBasisPx(element, property);
    return basis === null ? null : (parsed.numberValue / 100) * basis;
  }

  if (parsed.unit && parsed.unit !== "px") return null;
  return parsed.numberValue;
}

function measureCssValuePx(element: HTMLElement, property: string, value: string) {
  const cssProperty = toCssPropertyName(property);
  const previousValue = element.style.getPropertyValue(cssProperty);
  const previousPriority = element.style.getPropertyPriority(cssProperty);

  element.style.setProperty(cssProperty, value);

  try {
    return computedCssNumberPx(element, property);
  } finally {
    if (previousValue) {
      element.style.setProperty(cssProperty, previousValue, previousPriority);
    } else {
      element.style.removeProperty(cssProperty);
    }
  }
}

function convertCssUnitForElement(element: HTMLElement, property: string, value: string, nextUnit: string) {
  const parsedValue = parseNumericCssValue(value);
  if (!parsedValue) return null;

  const currentUnit = parsedValue.unit;
  if (currentUnit === nextUnit) return cssNumericValue(parsedValue.numberValue, nextUnit);
  if (parsedValue.numberValue === 0) return cssNumericValue(0, nextUnit);

  const currentPx = measureCssValuePx(element, property, cssNumericValue(parsedValue.numberValue, currentUnit));
  const oneNextUnitPx = measureCssValuePx(element, property, cssNumericValue(1, nextUnit));
  if (
    currentPx === null ||
    oneNextUnitPx === null ||
    !Number.isFinite(currentPx) ||
    !Number.isFinite(oneNextUnitPx) ||
    oneNextUnitPx === 0
  ) {
    return null;
  }

  return cssNumericValue(currentPx / oneNextUnitPx, nextUnit);
}

function cleanFontFamilyName(value: string) {
  return value.trim().replace(/^["']|["']$/g, "");
}

function firstFontFamily(value: string) {
  return cleanFontFamilyName(value.split(",")[0] ?? "");
}

function toCssFontFamily(family: string) {
  const cleanFamily = cleanFontFamilyName(family);
  if (!cleanFamily) return "";
  if (genericFontFamilies.has(cleanFamily.toLowerCase())) return cleanFamily;
  return `"${cleanFamily.replace(/"/g, '\\"')}"`;
}

function mergeFontOptions(systemFonts: string[]) {
  const seen = new Set<string>();
  const options: FontOption[] = [];

  for (const option of fallbackFontOptions) {
    const key = option.family.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    options.push(option);
  }

  for (const family of systemFonts) {
    const cleanFamily = cleanFontFamilyName(family);
    const key = cleanFamily.toLowerCase();
    if (!cleanFamily || seen.has(key)) continue;
    seen.add(key);
    options.push({ family: cleanFamily, source: "system" });
  }

  return options;
}

function isValidCssColor(value: string) {
  if (!value.trim()) return true;
  if (typeof window === "undefined" || !window.CSS?.supports) return true;
  return window.CSS.supports("color", value.trim());
}

function rgbChannelToHex(channel: string) {
  const value = Math.max(0, Math.min(255, Math.round(Number(channel))));
  return value.toString(16).padStart(2, "0");
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${rgbChannelToHex(String(red))}${rgbChannelToHex(String(green))}${rgbChannelToHex(String(blue))}`;
}

function cssColorToHex(value: string) {
  const cleanValue = value.trim();
  const hex = cleanValue.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const [, hexValue] = hex;
    if (hexValue.length === 3) {
      return `#${hexValue.split("").map((part) => part + part).join("")}`.toLowerCase();
    }
    return `#${hexValue.toLowerCase()}`;
  }

  const rgb = cleanValue.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+[\d.]+%?)?\s*\)$/i);
  if (!rgb) return null;
  return `#${rgbChannelToHex(rgb[1])}${rgbChannelToHex(rgb[2])}${rgbChannelToHex(rgb[3])}`;
}

function cssColorToRgba(value: string) {
  const cleanValue = value.trim();
  const hex = cleanValue.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const hexValue = hex[1].length === 3 ? hex[1].split("").map((part) => part + part).join("") : hex[1];
    return {
      red: Number.parseInt(hexValue.slice(0, 2), 16),
      green: Number.parseInt(hexValue.slice(2, 4), 16),
      blue: Number.parseInt(hexValue.slice(4, 6), 16),
      alpha: 1,
    };
  }

  const rgb = cleanValue.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/i);
  if (!rgb) return null;
  const alphaValue = rgb[4]?.endsWith("%") ? Number.parseFloat(rgb[4]) / 100 : Number.parseFloat(rgb[4] ?? "1");
  return {
    red: Math.max(0, Math.min(255, Math.round(Number(rgb[1])))),
    green: Math.max(0, Math.min(255, Math.round(Number(rgb[2])))),
    blue: Math.max(0, Math.min(255, Math.round(Number(rgb[3])))),
    alpha: Math.max(0, Math.min(1, Number.isFinite(alphaValue) ? alphaValue : 1)),
  };
}

function rgbToHsv(red: number, green: number, blue: number) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;

  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    hue *= 60;
  }

  if (hue < 0) hue += 360;

  return {
    hue: Math.round(hue),
    saturation: max === 0 ? 0 : Math.round((delta / max) * 100),
    value: Math.round(max * 100),
  };
}

function hsvToRgb(hue: number, saturation: number, value: number) {
  const s = saturation / 100;
  const v = value / 100;
  const chroma = v * s;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = v - chroma;
  let r = 0;
  let g = 0;
  let b = 0;

  if (hue < 60) [r, g, b] = [chroma, x, 0];
  else if (hue < 120) [r, g, b] = [x, chroma, 0];
  else if (hue < 180) [r, g, b] = [0, chroma, x];
  else if (hue < 240) [r, g, b] = [0, x, chroma];
  else if (hue < 300) [r, g, b] = [x, 0, chroma];
  else [r, g, b] = [chroma, 0, x];

  return {
    red: Math.round((r + m) * 255),
    green: Math.round((g + m) * 255),
    blue: Math.round((b + m) * 255),
  };
}

function rgbaToCssColor(hexValue: string, alphaPercent: number) {
  const rgba = cssColorToRgba(hexValue);
  if (!rgba) return hexValue;
  const alpha = Math.max(0, Math.min(100, alphaPercent)) / 100;
  if (alpha >= 0.995) return hexValue.toLowerCase();
  return `rgba(${rgba.red}, ${rgba.green}, ${rgba.blue}, ${formatCssNumber(alpha)})`;
}

function colorInputText(value: string) {
  return cssColorToHex(value) ?? value;
}

function isValidCssDeclaration(property: string, value: string) {
  if (!value.trim()) return true;
  if (typeof window === "undefined" || !window.CSS?.supports) return true;
  return window.CSS.supports(toCssPropertyName(property), value.trim());
}

function cssValuePresetsForProperty(property: string) {
  const cssProperty = toCssPropertyName(property);
  const presets = ["unset", "inherit", "initial"];

  if (cssProperty === "width" || cssProperty === "height" || cssProperty === "min-width" || cssProperty === "min-height") {
    return [...presets, ...sizeKeywords];
  }

  if (cssProperty === "max-width" || cssProperty === "max-height") {
    return [...presets, ...maxSizeKeywords];
  }

  if (cssProperty === "margin" || cssProperty.startsWith("margin-")) {
    return [...presets, ...marginKeywords];
  }

  return presets;
}

function isLikelyAssetSource(value: string) {
  const cleanValue = value.trim();
  return (
    !cleanValue ||
    cleanValue.startsWith("/") ||
    cleanValue.startsWith("./") ||
    cleanValue.startsWith("../") ||
    cleanValue.startsWith("data:image/") ||
    cleanValue.startsWith("blob:") ||
    /^https?:\/\//i.test(cleanValue)
  );
}

const boxSides = [
  { key: "top", label: "T", propertySuffix: "Top" },
  { key: "right", label: "R", propertySuffix: "Right" },
  { key: "bottom", label: "B", propertySuffix: "Bottom" },
  { key: "left", label: "L", propertySuffix: "Left" },
] as const;

function splitCssBoxValue(value: string) {
  return value.trim().split(/\s+/).filter(Boolean);
}

function expandCssBoxValue(value: string, keywords: string[] = []) {
  const parts = splitCssBoxValue(value);
  if (parts.length === 0 || parts.length > 4) return null;
  if (parts.some((part) => !parseNumericCssValue(part) && !normalizeCssKeywordValue(part, keywords))) return null;

  const [top, right = top, bottom = top, left = right] = parts;
  return [top, right, bottom, left];
}

function compactCssBoxValue(values: string[]) {
  const [top, right, bottom, left] = values;
  if (top === right && top === bottom && top === left) return top;
  if (top === bottom && right === left) return `${top} ${right}`;
  if (right === left) return `${top} ${right} ${bottom}`;
  return values.join(" ");
}

function StyleField({
  config,
  value,
  disabled,
  fontOptions,
  fontAccessState,
  unitConversionDisabled,
  onLoadSystemFonts,
  onPreviewStyle,
  onRestorePreview,
  onConvertUnit,
  onChange,
}: {
  config: FieldConfig;
  value: string;
  disabled: boolean;
  fontOptions?: FontOption[];
  fontAccessState?: FontAccessState;
  unitConversionDisabled?: boolean;
  onLoadSystemFonts?: () => void;
  onPreviewStyle?: (property: string, value: string) => void;
  onRestorePreview?: () => void;
  onConvertUnit?: (conversion: NumericUnitConversion) => string | null;
  onChange: StyleValueChange;
}) {
  const fieldId = `editor-style-${config.property}`;
  const configKeywords = config.keywords ?? [];
  const valueIsKeyword = Boolean(normalizeCssKeywordValue(value, configKeywords));
  const canUseNumericControl =
    typeof config.unit === "string" && (!value || Boolean(parseNumericCssValue(value)) || valueIsKeyword);
  const canUseBoxControl =
    (config.property === "margin" || config.property === "padding") &&
    typeof config.unit === "string" &&
    (!value || Boolean(expandCssBoxValue(value, configKeywords)));

  return (
    <Field className="gap-1.5" data-disabled={disabled ? true : undefined}>
      <FieldLabel htmlFor={fieldId} className="text-xs text-muted-foreground">{config.label}</FieldLabel>
      {config.options ? (
        <OptionSelect
          id={fieldId}
          disabled={disabled}
          value={value}
          options={config.options}
          onChange={onChange}
        />
      ) : config.property === "fontFamily" ? (
        <FontFamilyInput
          id={fieldId}
          disabled={disabled}
          value={value}
          fontOptions={fontOptions ?? fallbackFontOptions}
          fontAccessState={fontAccessState ?? "idle"}
          onLoadSystemFonts={onLoadSystemFonts ?? (() => {})}
          onPreview={(fontFamily) => onPreviewStyle?.("fontFamily", fontFamily)}
          onRestorePreview={onRestorePreview ?? (() => {})}
          onChange={onChange}
        />
      ) : config.property === "color" || config.property === "backgroundColor" ? (
        <ColorStyleInput
          id={fieldId}
          label={config.label}
          disabled={disabled}
          value={value}
          placeholder={config.placeholder ?? "#000000"}
          onChange={onChange}
        />
      ) : canUseBoxControl ? (
        <BoxSpacingInput
          id={fieldId}
          property={config.property}
          label={config.label}
          disabled={disabled}
          value={value}
          placeholder={config.placeholder ?? "0px"}
          defaultUnit={config.unit ?? "px"}
          units={config.units ?? [config.unit ?? "px"]}
          keywords={configKeywords}
          step={config.step ?? 1}
          min={config.min}
          max={config.max}
          unitConversionDisabled={unitConversionDisabled ?? false}
          onConvertUnit={onConvertUnit}
          onChange={onChange}
        />
      ) : canUseNumericControl ? (
        <NumericStyleInput
          id={fieldId}
          property={config.property}
          label={config.label}
          disabled={disabled}
          value={value}
          placeholder={config.placeholder ?? "value"}
          defaultUnit={config.unit ?? ""}
          units={config.units ?? [config.unit ?? ""]}
          keywords={configKeywords}
          step={config.step ?? 1}
          min={config.min}
          max={config.max}
          unitConversionDisabled={unitConversionDisabled ?? false}
          onConvertUnit={onConvertUnit}
          onChange={onChange}
        />
      ) : (
        <CssValueInput
          id={fieldId}
          property={config.property}
          label={config.label}
          disabled={disabled}
          value={value}
          placeholder={config.placeholder ?? "value"}
          presets={cssValuePresetsForProperty(config.property)}
          onChange={onChange}
        />
      )}
    </Field>
  );
}

function CssValueInput({
  id,
  property,
  label,
  value,
  placeholder,
  presets,
  disabled,
  onChange,
}: {
  id: string;
  property: string;
  label: string;
  value: string;
  placeholder: string;
  presets: string[];
  disabled: boolean;
  onChange: StyleValueChange;
}) {
  const transactionIdRef = useRef(`css:${id}`);
  const [draftValue, setDraftValue] = useState(value);
  const invalid = Boolean(draftValue.trim()) && !isValidCssDeclaration(property, draftValue);

  useEffect(() => {
    // Keep the local draft input in sync when selection changes.
    setDraftValue(value);
  }, [value]);

  function commitValue(nextValue: string) {
    setDraftValue(nextValue);
    if (isValidCssDeclaration(property, nextValue)) {
      onChange(nextValue.trim(), {
        commit: "preview",
        transactionId: transactionIdRef.current,
      });
    }
  }

  return (
    <div className={styles.cssValueControl}>
      <Input
        id={id}
        disabled={disabled}
        value={draftValue}
        placeholder={placeholder}
        className={styles.cssValueInput}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        aria-label={`${label} CSS value`}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={() => {
          if (isValidCssDeclaration(property, draftValue)) {
            onChange(draftValue.trim(), {
              commit: "commit",
              transactionId: transactionIdRef.current,
            });
          } else {
            onChange(value, {
              commit: "cancel",
              transactionId: transactionIdRef.current,
            });
            setDraftValue(value);
          }
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== "Escape") return;
          event.preventDefault();
          if (event.key === "Escape") {
            onChange(value, {
              commit: "cancel",
              transactionId: transactionIdRef.current,
            });
            setDraftValue(value);
            event.currentTarget.blur();
            return;
          }
          if (isValidCssDeclaration(property, draftValue)) {
            onChange(draftValue.trim(), {
              commit: "commit",
              transactionId: transactionIdRef.current,
            });
            event.currentTarget.blur();
          }
        }}
        onChange={(event) => commitValue(event.target.value)}
      />
      {invalid ? (
        <span className={styles.fieldError} id={`${id}-error`}>
          Unsupported {label.toLowerCase()} value
        </span>
      ) : null}
      <div className={styles.cssValuePresets} aria-label={`${label} CSS presets`}>
        {presets.map((preset) => (
          <button
            type="button"
            disabled={disabled}
            className={styles.cssValuePreset}
            key={preset}
            onClick={() => {
              setDraftValue(preset);
              onChange(preset);
            }}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}

function FontFamilyInput({
  id,
  value,
  disabled,
  fontOptions,
  fontAccessState,
  onLoadSystemFonts,
  onPreview,
  onRestorePreview,
  onChange,
}: {
  id: string;
  value: string;
  disabled: boolean;
  fontOptions: FontOption[];
  fontAccessState: FontAccessState;
  onLoadSystemFonts: () => void;
  onPreview: (fontFamily: string) => void;
  onRestorePreview: () => void;
  onChange: StyleValueChange;
}) {
  const [open, setOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const selectedFamily = firstFontFamily(value);
  const displayFamily = selectedFamily || "Unset";

  const closeFontList = useCallback(() => {
    setOpen(false);
    onRestorePreview();
  }, [onRestorePreview]);

  function openFontList() {
    if (disabled) return;
    if (open) {
      closeFontList();
      return;
    }
    setOpen(true);
    if (fontAccessState === "idle") onLoadSystemFonts();
  }

  function focusFontOption(index: number) {
    const menu = fontMenuRef.current;
    if (!menu) return;
    const options = Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="option"]'));
    options[index]?.focus();
  }

  function selectFont(family: string) {
    onChange(toCssFontFamily(family));
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function closeIfOutside(event: PointerEvent | FocusEvent) {
      const root = switcherRef.current;
      const target = event.target instanceof Node ? event.target : null;
      if (!root || !target || root.contains(target)) return;
      closeFontList();
    }

    document.addEventListener("pointerdown", closeIfOutside, true);
    document.addEventListener("focusin", closeIfOutside, true);
    return () => {
      document.removeEventListener("pointerdown", closeIfOutside, true);
      document.removeEventListener("focusin", closeIfOutside, true);
    };
  }, [open, closeFontList]);

  return (
    <div className={styles.fontSwitcher} ref={switcherRef}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        className={styles.fontSwitcherTrigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={openFontList}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            closeFontList();
            return;
          }
          if (event.key !== "ArrowDown" && event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          if (!open) {
            setOpen(true);
            if (fontAccessState === "idle") onLoadSystemFonts();
            window.requestAnimationFrame(() => focusFontOption(0));
            return;
          }
          focusFontOption(0);
        }}
      >
        <span className={styles.fontSwitcherValue} style={{ fontFamily: value || undefined }}>
          {displayFamily}
        </span>
        <EditorIcon icon={ChevronDownIcon} className="size-3.5" />
      </button>
      {open ? (
        <div
          className={styles.fontMenu}
          ref={fontMenuRef}
          role="listbox"
          aria-label="Fonts"
          onMouseLeave={onRestorePreview}
          onKeyDown={(event) => {
            const options = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]'));
            const currentIndex = options.findIndex((option) => option === document.activeElement);
            if (event.key === "Escape") {
              event.preventDefault();
              closeFontList();
              return;
            }
            if (event.key === "Home") {
              event.preventDefault();
              options[0]?.focus();
              return;
            }
            if (event.key === "End") {
              event.preventDefault();
              options.at(-1)?.focus();
              return;
            }
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
            event.preventDefault();
            const direction = event.key === "ArrowDown" ? 1 : -1;
            const nextIndex = currentIndex === -1
              ? 0
              : (currentIndex + direction + options.length) % options.length;
            options[nextIndex]?.focus();
          }}
        >
          <div className={styles.fontMenuStatus}>
            {fontAccessState === "loading"
              ? "Loading system fonts..."
              : fontAccessState === "loaded"
                ? "System fonts"
                : fontAccessState === "denied"
                  ? "System font access denied. Showing fallback fonts."
                  : fontAccessState === "unavailable"
                    ? "System font access is not supported in this browser. Showing fallback fonts."
                    : "Click a font to apply. Hover to preview."}
          </div>
          <button
            type="button"
            className={styles.fontOption}
            role="option"
            aria-selected={!value}
            onMouseEnter={() => onPreview("")}
            onFocus={() => onPreview("")}
            onClick={() => selectFont("")}
          >
            <span className={styles.fontOptionName}>Unset</span>
            <span className={styles.fontOptionMeta}>default</span>
          </button>
          {fontOptions.map((option) => {
            const cssFontFamily = toCssFontFamily(option.family);
            const selected = cleanFontFamilyName(selectedFamily).toLowerCase() === option.family.toLowerCase();
            return (
              <button
                type="button"
                className={styles.fontOption}
                role="option"
                aria-selected={selected}
                key={`${option.source}-${option.family}`}
                style={{ fontFamily: cssFontFamily }}
                onMouseEnter={() => onPreview(cssFontFamily)}
                onFocus={() => onPreview(cssFontFamily)}
                onClick={() => selectFont(option.family)}
              >
                <span className={styles.fontOptionName}>{option.family}</span>
                <span className={styles.fontOptionMeta}>{option.source}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ColorStyleInput({
  id,
  label,
  value,
  placeholder,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  onChange: StyleValueChange;
}) {
  const colorControlRef = useRef<HTMLDivElement>(null);
  const colorPopoverRef = useRef<HTMLDivElement>(null);
  const saturationRef = useRef<HTMLDivElement>(null);
  const transactionIdRef = useRef(`color:${id}`);
  const [open, setOpen] = useState(false);
  const [draftValue, setDraftValue] = useState(colorInputText(value));
  const [popoverPosition, setPopoverPosition] = useState<React.CSSProperties>({});
  const pickerRgba = cssColorToRgba(value) ?? cssColorToRgba(placeholder) ?? { red: 0, green: 0, blue: 0, alpha: 1 };
  const pickerValue = rgbToHex(pickerRgba.red, pickerRgba.green, pickerRgba.blue);
  const pickerHsv = rgbToHsv(pickerRgba.red, pickerRgba.green, pickerRgba.blue);
  const alphaPercent = Math.round(pickerRgba.alpha * 100);
  const pureHueRgb = hsvToRgb(pickerHsv.hue, 100, 100);
  const pureHue = rgbToHex(pureHueRgb.red, pureHueRgb.green, pureHueRgb.blue);
  const swatchColor = value && isValidCssColor(value) ? value : "transparent";
  const invalid = Boolean(draftValue.trim()) && !isValidCssColor(draftValue);

  useEffect(() => {
    // Keep the local draft input in sync when selection changes.
    setDraftValue(colorInputText(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;

    function closeIfOutside(event: PointerEvent | FocusEvent) {
      const root = colorControlRef.current;
      const popover = colorPopoverRef.current;
      const target = event.target instanceof Node ? event.target : null;
      if (!root || !target || root.contains(target) || popover?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", closeIfOutside, true);
    document.addEventListener("focusin", closeIfOutside, true);
    return () => {
      document.removeEventListener("pointerdown", closeIfOutside, true);
      document.removeEventListener("focusin", closeIfOutside, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function updatePopoverPosition() {
      const rect = colorControlRef.current?.getBoundingClientRect();
      if (!rect) return;

      const viewportPadding = 12;
      const popoverWidth = Math.min(328, window.innerWidth - viewportPadding * 2);
      const estimatedHeight = Math.min(470, window.innerHeight - viewportPadding * 2);
      const left = Math.min(
        Math.max(viewportPadding, rect.right - popoverWidth),
        window.innerWidth - popoverWidth - viewportPadding,
      );
      const preferredTop = rect.bottom + 8;
      const top =
        preferredTop + estimatedHeight > window.innerHeight - viewportPadding
          ? Math.max(viewportPadding, rect.top - estimatedHeight - 8)
          : preferredTop;

      setPopoverPosition({
        left,
        maxHeight: `calc(100vh - ${Math.max(viewportPadding, top)}px - ${viewportPadding}px)`,
        top,
        width: popoverWidth,
      });
    }

    updatePopoverPosition();
    window.addEventListener("resize", updatePopoverPosition);
    window.addEventListener("scroll", updatePopoverPosition, true);
    return () => {
      window.removeEventListener("resize", updatePopoverPosition);
      window.removeEventListener("scroll", updatePopoverPosition, true);
    };
  }, [open]);

  function commitColor(nextValue: string) {
    setDraftValue(nextValue);
    if (!nextValue.trim() || isValidCssColor(nextValue)) {
      onChange(nextValue.trim(), {
        commit: "preview",
        transactionId: transactionIdRef.current,
      });
    }
  }

  function commitPickerColor(nextValue: string) {
    setDraftValue(nextValue);
    onChange(nextValue);
  }

  function commitHsvColor(nextHsv: { hue: number; saturation: number; value: number }, nextAlphaPercent = alphaPercent) {
    const nextRgb = hsvToRgb(nextHsv.hue, nextHsv.saturation, nextHsv.value);
    const nextHex = rgbToHex(nextRgb.red, nextRgb.green, nextRgb.blue);
    commitPickerColor(rgbaToCssColor(nextHex, nextAlphaPercent));
  }

  function updateSaturationFromPointer(event: React.PointerEvent<HTMLDivElement>) {
    const rect = saturationRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    commitHsvColor({
      hue: pickerHsv.hue,
      saturation: Math.round((x / rect.width) * 100),
      value: Math.round(100 - (y / rect.height) * 100),
    });
  }

  async function sampleScreenColor() {
    type EyeDropperConstructor = new () => { open: () => Promise<{ sRGBHex: string }> };
    const EyeDropper = (window as Window & { EyeDropper?: EyeDropperConstructor }).EyeDropper;
    if (!EyeDropper) return;
    const result = await new EyeDropper().open().catch(() => null);
    if (result?.sRGBHex) commitPickerColor(result.sRGBHex);
  }

  return (
    <div
      className={styles.colorControl}
      ref={colorControlRef}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        setOpen(false);
      }}
    >
      <button
        type="button"
        disabled={disabled}
        className={styles.colorSwatchButton}
        aria-label={`Open ${label} color picker`}
        aria-expanded={open}
        onClick={() => setOpen((nextOpen) => !nextOpen)}
      >
        <span className={styles.colorSwatch} style={{ backgroundColor: swatchColor }} />
      </button>
      <Input
        id={id}
        disabled={disabled}
        value={draftValue}
        placeholder={placeholder}
        className={styles.colorTextInput}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={() => {
          if (!draftValue.trim()) {
            onChange("", {
              commit: "commit",
              transactionId: transactionIdRef.current,
            });
          } else if (isValidCssColor(draftValue)) {
            onChange(draftValue.trim(), {
              commit: "commit",
              transactionId: transactionIdRef.current,
            });
          } else {
            onChange(value, {
              commit: "cancel",
              transactionId: transactionIdRef.current,
            });
            setDraftValue(colorInputText(value));
          }
        }}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== "Escape") return;
          event.preventDefault();
          if (event.key === "Escape") {
            onChange(value, {
              commit: "cancel",
              transactionId: transactionIdRef.current,
            });
            setDraftValue(colorInputText(value));
            event.currentTarget.blur();
            return;
          }
          if (!draftValue.trim() || isValidCssColor(draftValue)) {
            onChange(draftValue.trim(), {
              commit: "commit",
              transactionId: transactionIdRef.current,
            });
            event.currentTarget.blur();
          }
        }}
        onChange={(event) => commitColor(event.target.value)}
      />
      {invalid ? (
        <span className={styles.fieldError} id={`${id}-error`}>
          Unsupported color value
        </span>
      ) : null}
      {open && typeof document !== "undefined" ? createPortal(
        <div
          className={`${styles.editorOverlay} ${styles.colorPopover}`}
          ref={colorPopoverRef}
          style={popoverPosition}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            setOpen(false);
          }}
        >
          <div className={styles.colorPopoverHeader}>
            <div className={styles.colorPopoverTabs} aria-label={`${label} color source`}>
              <button type="button" aria-pressed="true">Custom</button>
              <button type="button">Libraries</button>
            </div>
            <button type="button" className={styles.colorPopoverIconButton} aria-label={`Close ${label} color picker`} onClick={() => setOpen(false)}>
              ×
            </button>
          </div>

          <div
            ref={saturationRef}
            className={styles.colorSpectrum}
            style={{ "--picker-hue": pureHue } as React.CSSProperties}
            role="slider"
            aria-label={`${label} saturation and brightness`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pickerHsv.value}
            aria-valuetext={`${pickerHsv.saturation}% saturation, ${pickerHsv.value}% brightness`}
            tabIndex={0}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              updateSaturationFromPointer(event);
            }}
            onPointerMove={(event) => {
              if (event.buttons !== 1) return;
              updateSaturationFromPointer(event);
            }}
          >
            <span
              className={styles.colorSpectrumHandle}
              style={{
                left: `${pickerHsv.saturation}%`,
                top: `${100 - pickerHsv.value}%`,
                backgroundColor: pickerValue,
              }}
            />
          </div>

          <div className={styles.figmaColorControls}>
            <button
              type="button"
              className={styles.eyedropperButton}
              aria-label={`Sample ${label} from screen`}
              onClick={sampleScreenColor}
              disabled={disabled || typeof window === "undefined" || !("EyeDropper" in window)}
            >
              <EditorIcon icon={EyeIcon} />
            </button>
            <div className={styles.figmaColorSliders}>
              <label className={styles.colorSliderLabel}>
                <span>Hue</span>
                <input
                  type="range"
                  min="0"
                  max="359"
                  value={pickerHsv.hue}
                  className={styles.hueSlider}
                  aria-label={`${label} hue`}
                  onChange={(event) => {
                    commitHsvColor({ ...pickerHsv, hue: Number(event.target.value) });
                  }}
                />
              </label>
              <label className={styles.colorSliderLabel}>
                <span>Alpha</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={alphaPercent}
                  className={styles.alphaSlider}
                  style={{ "--picker-color": pickerValue } as React.CSSProperties}
                  aria-label={`${label} opacity`}
                  onChange={(event) => {
                    commitPickerColor(rgbaToCssColor(pickerValue, Number(event.target.value)));
                  }}
                />
              </label>
            </div>
          </div>

          <div className={styles.colorValueRow}>
            <label>
              <span>Hex</span>
              <input
                aria-label={`${label} hex value`}
                value={pickerValue.slice(1).toUpperCase()}
                onChange={(event) => {
                  const nextHex = event.target.value.replace(/[^0-9a-f]/gi, "").slice(0, 6);
                  if (nextHex.length === 6) commitPickerColor(rgbaToCssColor(`#${nextHex}`, alphaPercent));
                }}
              />
            </label>
            <label>
              <span>Opacity</span>
              <input
                aria-label={`${label} opacity value`}
                type="number"
                min="0"
                max="100"
                value={alphaPercent}
                onChange={(event) => {
                  commitPickerColor(rgbaToCssColor(pickerValue, Number(event.target.value)));
                }}
              />
            </label>
          </div>

          <div className={styles.colorPageSwatchesHeader}>
            <span>On this page</span>
            <EditorIcon icon={ChevronDownIcon} />
          </div>

          <div className={styles.colorPresetGrid} aria-label={`${label} page colors`}>
            {colorPresets.map((preset) => (
              <button
                type="button"
                className={styles.colorPreset}
                style={{ backgroundColor: preset }}
                aria-label={`Set ${label} to ${preset}`}
                aria-pressed={pickerValue.toLowerCase() === preset}
                key={preset}
                onClick={() => commitPickerColor(preset)}
              />
            ))}
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}

function BoxSpacingInput({
  id,
  property,
  label,
  value,
  placeholder,
  defaultUnit,
  units,
  keywords,
  step,
  min,
  max,
  disabled,
  unitConversionDisabled,
  onConvertUnit,
  onChange,
}: {
  id: string;
  property: string;
  label: string;
  value: string;
  placeholder: string;
  defaultUnit: string;
  units: string[];
  keywords: string[];
  step: number;
  min?: number;
  max?: number;
  disabled: boolean;
  unitConversionDisabled: boolean;
  onConvertUnit?: (conversion: NumericUnitConversion) => string | null;
  onChange: StyleValueChange;
}) {
  const [expanded, setExpanded] = useState(false);
  const expandedValue = expandCssBoxValue(value, keywords) ?? ["", "", "", ""];
  const expandedPlaceholder = expandCssBoxValue(placeholder, keywords) ?? [placeholder, placeholder, placeholder, placeholder];
  const verticalValue = expandedValue[0] === expandedValue[2] ? expandedValue[0] : "";
  const horizontalValue = expandedValue[1] === expandedValue[3] ? expandedValue[1] : "";
  const verticalPlaceholder =
    expandedPlaceholder[0] === expandedPlaceholder[2] ? expandedPlaceholder[0] : expandedPlaceholder[0] || placeholder;
  const horizontalPlaceholder =
    expandedPlaceholder[1] === expandedPlaceholder[3] ? expandedPlaceholder[1] : expandedPlaceholder[1] || placeholder;

  function updateSide(index: number, nextValue: string, options?: StyleValueChangeOptions) {
    const nextValues = [...expandedValue];
    nextValues[index] = nextValue;

    if (nextValues.every((sideValue) => !sideValue.trim())) {
      onChange("", options);
      return;
    }

    const normalizedValues = nextValues.map((sideValue, sideIndex) => {
      if (sideValue.trim()) return sideValue;
      return expandedPlaceholder[sideIndex] || `0${defaultUnit}`;
    });

    onChange(compactCssBoxValue(normalizedValues), options);
  }

  function updatePair(indexes: number[], nextValue: string, options?: StyleValueChangeOptions) {
    const nextValues = [...expandedValue];
    for (const index of indexes) nextValues[index] = nextValue;

    if (nextValues.every((sideValue) => !sideValue.trim())) {
      onChange("", options);
      return;
    }

    const normalizedValues = nextValues.map((sideValue, sideIndex) => {
      if (sideValue.trim()) return sideValue;
      return expandedPlaceholder[sideIndex] || `0${defaultUnit}`;
    });

    onChange(compactCssBoxValue(normalizedValues), options);
  }

  return (
    <div className={styles.boxSpacingInput} id={id}>
      <div className={styles.boxSpacingRow}>
        <div className={styles.boxSpacingPairs}>
          <NumericStyleInput
            id={`${id}-horizontal`}
            property={`${property}Left`}
            label={`${label} horizontal`}
            disabled={disabled}
            value={horizontalValue}
            placeholder={horizontalPlaceholder}
            defaultUnit={defaultUnit}
            units={units}
            keywords={keywords}
            step={step}
            min={min}
            max={max}
            leadingIcon={<EditorIcon icon={HorizontalResizeIcon} aria-hidden="true" />}
            unitConversionDisabled={unitConversionDisabled}
            onConvertUnit={onConvertUnit}
            onChange={(nextValue, options) => updatePair([1, 3], nextValue, options)}
          />
          <NumericStyleInput
            id={`${id}-vertical`}
            property={`${property}Top`}
            label={`${label} vertical`}
            disabled={disabled}
            value={verticalValue}
            placeholder={verticalPlaceholder}
            defaultUnit={defaultUnit}
            units={units}
            keywords={keywords}
            step={step}
            min={min}
            max={max}
            leadingIcon={<EditorIcon icon={VerticalResizeIcon} aria-hidden="true" />}
            unitConversionDisabled={unitConversionDisabled}
            onConvertUnit={onConvertUnit}
            onChange={(nextValue, options) => updatePair([0, 2], nextValue, options)}
          />
        </div>
        <button
          type="button"
          className={styles.boxSpacingToggle}
          disabled={disabled}
          aria-label={expanded ? `Collapse ${label} sides` : `Expand ${label} sides`}
          aria-expanded={expanded}
          onClick={() => setExpanded((nextExpanded) => !nextExpanded)}
        >
          <EditorIcon icon={expanded ? Minimize02Icon : Maximize02Icon} />
        </button>
      </div>
      {expanded ? (
        <div className={styles.boxSpacingExpandedGrid}>
          {boxSides.map((side, index) => (
            <div className={styles.boxSpacingSide} data-side={side.key} key={side.key}>
              <NumericStyleInput
                id={`${id}-${side.key}`}
                property={`${property}${side.propertySuffix}`}
                label={`${label} ${side.key}`}
                disabled={disabled}
                value={expandedValue[index] ?? ""}
                placeholder={expandedPlaceholder[index] ?? placeholder}
                defaultUnit={defaultUnit}
                units={units}
                keywords={keywords}
                step={step}
                min={min}
                max={max}
                leadingIcon={<span className={styles.boxSpacingSideLabel}>{side.label}</span>}
                unitConversionDisabled={unitConversionDisabled}
                onConvertUnit={onConvertUnit}
                onChange={(nextValue, options) => updateSide(index, nextValue, options)}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NumericStyleInput({
  id,
  property,
  label,
  value,
  placeholder,
  defaultUnit,
  units,
  keywords = [],
  step,
  min,
  max,
  disabled,
  leadingIcon,
  unitConversionDisabled,
  onConvertUnit,
  onChange,
}: {
  id: string;
  property: string;
  label: string;
  value: string;
  placeholder: string;
  defaultUnit: string;
  units: string[];
  keywords?: string[];
  step: number;
  min?: number;
  max?: number;
  disabled: boolean;
  leadingIcon?: React.ReactNode;
  unitConversionDisabled: boolean;
  onConvertUnit?: (conversion: NumericUnitConversion) => string | null;
  onChange: StyleValueChange;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const transactionIdRef = useRef(`numeric:${id}`);
  const [draftNumber, setDraftNumber] = useState("");
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const skipNextBlurCommitRef = useRef(false);
  const parsedValue = parseNumericCssValue(value);
  const parsedPlaceholder = parseNumericCssValue(placeholder);
  const supportedUnits = units.length > 0 ? units : [defaultUnit];
  const supportedKeywords = keywords.filter((keyword) => isValidCssDeclaration(property, keyword));
  const valueKeyword = normalizeCssKeywordValue(value, supportedKeywords);
  const unit = parsedValue?.unit ?? parsedPlaceholder?.unit ?? defaultUnit;
  const displayNumber = focused || dragging ? draftNumber : valueKeyword ?? parsedValue?.numberText ?? "";
  const displayIsKeyword = Boolean(normalizeCssKeywordValue(displayNumber, supportedKeywords));
  const dragRef = useRef<{
    pointerId: number;
    startY: number;
    startValue: number;
    lastSteps: number;
    active: boolean;
    undoCaptured: boolean;
    lastValue: string;
  } | null>(null);
  const parsedDraft = parseNumericCssValue(draftNumber);
  const draftKeyword = normalizeCssKeywordValue(draftNumber, supportedKeywords);
  const draftHasUnsupportedUnit = Boolean(parsedDraft && !parsedNumericUnitIsSupported(parsedDraft, supportedUnits));
  const invalid = Boolean(draftNumber.trim()) && !draftKeyword && (!parsedDraft || draftHasUnsupportedUnit);

  useEffect(() => {
    if (!focused && !dragging) {
      // Keep the local draft input in sync when selection changes.
      setDraftNumber(valueKeyword ?? parsedValue?.numberText ?? "");
    }
  }, [dragging, focused, parsedValue?.numberText, valueKeyword]);

  function commitNumber(nextValue: number, nextUnit = unit, options?: StyleValueChangeOptions) {
    const clamped = clampNumber(nextValue, min, max);
    const nextText = formatNumericStyleNumber(clamped, property, nextUnit);
    setDraftNumber(nextText);
    onChange(`${nextText}${nextUnit}`, options);
    return `${nextText}${nextUnit}`;
  }

  function commitKeyword(keyword: string, mode: StyleValueChangeOptions["commit"] = "preview") {
    setDraftNumber(keyword);
    onChange(keyword, {
      commit: mode,
      transactionId: transactionIdRef.current,
    });
  }

  function currentNumericBaseValue() {
    const parsedDraftValue = parseNumericCssValue(draftNumber);
    const nextValue = parsedDraftValue?.numberValue ?? parsedValue?.numberValue ?? parsedPlaceholder?.numberValue ?? 0;
    return Number.isFinite(nextValue) ? nextValue : 0;
  }

  function updateByStep(direction: 1 | -1, multiplier = 1) {
    const baseValue = currentNumericBaseValue();
    commitNumber(baseValue + direction * step * multiplier, unit, {
      commit: "preview",
      transactionId: transactionIdRef.current,
    });
  }

  function commitParsedInput(
    parsed: NonNullable<ReturnType<typeof parseNumericCssValue>>,
    mode: StyleValueChangeOptions["commit"] = "preview",
    options: { preserveDraftText?: string } = {},
  ) {
    const typedUnit = parsed.explicitUnitless
      ? supportedUnits.includes("")
        ? ""
        : null
      : parsed.unit
        ? normalizeCssUnit(parsed.unit, supportedUnits)
        : unit;
    if ((parsed.explicitUnitless || parsed.unit) && typedUnit === null) {
      setDraftNumber(parsedNumericDraftText(parsed));
      return;
    }
    const nextUnit = typedUnit ?? unit;

    const clamped = clampNumber(parsed.numberValue, min, max);
    const wasClamped = clamped !== parsed.numberValue;
    const nextNumberText =
      mode === "preview" && options.preserveDraftText && !wasClamped
        ? parsed.numberText
        : formatNumericStyleNumber(clamped, property, nextUnit);
    setDraftNumber(
      mode === "preview" && options.preserveDraftText && !wasClamped
        ? options.preserveDraftText
        : nextNumberText,
    );
    onChange(`${nextNumberText}${nextUnit}`, {
      commit: mode,
      transactionId: transactionIdRef.current,
    });
  }

  function commitCompoundUnitConversion(
    parsed: NonNullable<ReturnType<typeof parseCompoundNumericUnitConversion>>,
    mode: StyleValueChangeOptions["commit"] = "preview",
  ) {
    if (unitConversionDisabled) return false;
    const convertedValue = onConvertUnit?.({
      property,
      value: cssNumericValue(parsed.numberValue, parsed.sourceUnit, property),
      nextUnit: parsed.targetUnit,
    });
    const parsedConvertedValue = convertedValue ? parseNumericCssValue(convertedValue) : null;
    if (!parsedConvertedValue || !parsedNumericUnitIsSupported(parsedConvertedValue, supportedUnits)) return false;

    const clamped = clampNumber(parsedConvertedValue.numberValue, min, max);
    const nextNumberText = formatNumericStyleNumber(clamped, property, parsedConvertedValue.unit);
    setDraftNumber(nextNumberText);
    onChange(`${nextNumberText}${parsedConvertedValue.unit}`, {
      commit: mode,
      transactionId: transactionIdRef.current,
    });
    return true;
  }

  function handleInputChange(nextValue: string) {
    skipNextBlurCommitRef.current = false;
    const keyword = normalizeCssKeywordValue(nextValue, supportedKeywords);
    if (keyword) {
      commitKeyword(keyword);
      return;
    }

    const parsedCompoundInput = parseCompoundNumericUnitConversion(nextValue, supportedUnits);
    if (parsedCompoundInput && commitCompoundUnitConversion(parsedCompoundInput, "preview")) {
      return;
    }

    const parsedInput = parseNumericCssValue(nextValue);

    if (parsedInput) {
      commitParsedInput(parsedInput, "preview", { preserveDraftText: nextValue });
      return;
    }

    setDraftNumber(nextValue);

    if (!nextValue.trim()) {
      onChange("", {
        commit: "preview",
        transactionId: transactionIdRef.current,
      });
      return;
    }
  }

  function updateUnit(nextUnit: string) {
    const selectedUnit = nextUnit === unitlessSelectValue ? "" : nextUnit;
    if (selectedUnit === unit || unitConversionDisabled) return;

    const baseValue = currentNumericBaseValue();
    const convertedValue = Number.isFinite(baseValue)
      ? onConvertUnit?.({
          property,
          value: cssNumericValue(baseValue, unit, property),
          nextUnit: selectedUnit,
        })
      : null;

    const parsedConvertedValue = convertedValue ? parseNumericCssValue(convertedValue) : null;
    if (parsedConvertedValue) {
      const clamped = clampNumber(parsedConvertedValue.numberValue, min, max);
      const nextNumberText = formatNumericStyleNumber(clamped, property, parsedConvertedValue.unit);
      setDraftNumber(nextNumberText);
      onChange(`${nextNumberText}${parsedConvertedValue.unit}`);
      return;
    }

    if (Number.isFinite(baseValue)) {
      commitNumber(baseValue, selectedUnit);
    }
  }

  function handleFocus(event: React.FocusEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    setFocused(true);
    setDraftNumber(valueKeyword ?? parsedValue?.numberText ?? "");
    window.requestAnimationFrame(() => input.select());
  }

  function handleBlur() {
    setFocused(false);
    if (skipNextBlurCommitRef.current) {
      skipNextBlurCommitRef.current = false;
      setDraftNumber(valueKeyword ?? parsedValue?.numberText ?? draftNumber);
      return;
    }
    if (!draftNumber.trim()) {
      onChange("", {
        commit: "commit",
        transactionId: transactionIdRef.current,
      });
      return;
    }
    const keyword = normalizeCssKeywordValue(draftNumber, supportedKeywords);
    if (keyword) {
      commitKeyword(keyword, "commit");
      return;
    }
    const parsedCompoundDraft = parseCompoundNumericUnitConversion(draftNumber, supportedUnits);
    if (parsedCompoundDraft && commitCompoundUnitConversion(parsedCompoundDraft, "commit")) {
      return;
    }
    const parsedDraft = parseNumericCssValue(draftNumber);
    const unsupportedUnit = Boolean(parsedDraft && !parsedNumericUnitIsSupported(parsedDraft, supportedUnits));
    if (parsedDraft) {
      if (unsupportedUnit) {
        onChange(value, {
          commit: "cancel",
          transactionId: transactionIdRef.current,
        });
        setDraftNumber(valueKeyword ?? parsedValue?.numberText ?? "");
        return;
      }
      commitParsedInput(parsedDraft, "commit");
      return;
    }
    onChange(value, {
      commit: "cancel",
      transactionId: transactionIdRef.current,
    });
    setDraftNumber(valueKeyword ?? parsedValue?.numberText ?? "");
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("input, button, select, option")) return;

    skipNextBlurCommitRef.current = false;
    const startValue = currentNumericBaseValue();
    const startUnit = unit;
    dragRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startValue,
      lastSteps: 0,
      active: false,
      undoCaptured: false,
      lastValue: cssNumericValue(startValue, startUnit),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaY = drag.startY - event.clientY;
    if (!drag.active && Math.abs(deltaY) < 4) return;

    drag.active = true;
    setDragging(true);
    event.preventDefault();

    const multiplier = event.shiftKey ? 10 : event.altKey ? 0.1 : 1;
    const steps = Math.trunc(deltaY / 4);
    if (steps === drag.lastSteps) return;
    drag.lastSteps = steps;
    drag.undoCaptured = true;
    const nextDraggedValue = normalizeDraggedNumericValue(
      drag.startValue + steps * step * multiplier,
      property,
      unit,
    );
    drag.lastValue = commitNumber(nextDraggedValue, unit, {
      commit: "preview",
      transactionId: transactionIdRef.current,
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
    if (drag.undoCaptured) skipNextBlurCommitRef.current = true;
    if (drag.undoCaptured) {
      onChange(drag.lastValue, {
        commit: "commit",
        transactionId: transactionIdRef.current,
      });
    }

    inputRef.current?.focus();
    inputRef.current?.select();
  }

  return (
    <div className={styles.numericControl}>
      <InputGroup
      className={styles.numericValueGroup}
      data-dragging={dragging ? true : undefined}
      data-disabled={disabled ? true : undefined}
      data-invalid={invalid ? true : undefined}
      title="Drag up or down to adjust. Hold Shift for larger steps or Option for finer steps."
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <InputGroupAddon align="inline-start" className={styles.numericLeadingIcon}>
        {leadingIcon ?? <span className={styles.numericDragHandle} aria-hidden="true" />}
      </InputGroupAddon>
      <InputGroupInput
        ref={inputRef}
        id={id}
        disabled={disabled}
        value={displayNumber}
        placeholder={parseNumericCssValue(placeholder)?.numberText ?? placeholder}
        className={styles.numericValueInput}
        inputMode={supportedKeywords.length > 0 ? "text" : "decimal"}
        autoComplete="off"
        spellCheck={false}
        aria-label={`${label} value`}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
            return;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            onChange(value, {
              commit: "cancel",
              transactionId: transactionIdRef.current,
            });
            setDraftNumber(valueKeyword ?? parsedValue?.numberText ?? "");
            event.currentTarget.blur();
            return;
          }
          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
          event.preventDefault();
          updateByStep(event.key === "ArrowUp" ? 1 : -1, event.shiftKey ? 10 : event.altKey ? 0.1 : 1);
        }}
        onChange={(event) => handleInputChange(event.target.value)}
      />
      {!displayIsKeyword ? (
      <InputGroupAddon align="inline-end" className={styles.numericValueAddon}>
        {supportedUnits.length > 1 ? (
          <span
            className={styles.numericUnitSelectWrap}
            style={{ "--numeric-unit-ch": unitSelectLabel(unit).length } as React.CSSProperties}
          >
            <select
              disabled={disabled || unitConversionDisabled}
              className={styles.numericUnitSelect}
              aria-label={`${label} unit`}
              title={unitConversionDisabled ? "Unit conversion is single-selection only" : undefined}
              value={unit || unitlessSelectValue}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onChange={(event) => updateUnit(event.target.value)}
            >
              {supportedUnits.map((supportedUnit) => (
                <option value={supportedUnit || unitlessSelectValue} key={supportedUnit || unitlessSelectValue}>
                  {unitSelectLabel(supportedUnit)}
                </option>
              ))}
            </select>
            <span className={styles.numericUnitSelectLabel} data-unit-label={label} aria-hidden="true">
              {unitSelectLabel(unit)}
            </span>
          </span>
        ) : unit ? (
          <InputGroupText className={styles.numericUnit}>{unit}</InputGroupText>
        ) : null}
      </InputGroupAddon>
      ) : null}
      </InputGroup>
      {invalid ? (
        <span className={styles.fieldError} id={`${id}-error`}>
          Use a number with {supportedUnits.map(unitLabel).join(", ")}
          {supportedKeywords.length > 0 ? ` or ${supportedKeywords.join(", ")}` : ""}
        </span>
      ) : null}
    </div>
  );
}

function OptionSelect({
  id,
  value,
  options,
  disabled,
  onChange,
}: {
  id: string;
  value: string;
  options: string[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const selectedValue = value && options.includes(value) ? value : "__unset__";

  return (
    <Select
      disabled={disabled}
      value={selectedValue}
      onValueChange={(nextValue) => onChange(nextValue === "__unset__" ? "" : nextValue)}
    >
      <SelectTrigger id={id} className={styles.valueSelectTrigger} size="sm" aria-label="Style value">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          <SelectItem value="__unset__">Unset</SelectItem>
          {options.map((option) => (
            <SelectItem value={option} key={option}>
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function AssetSourceInput({
  id,
  value,
  disabled,
  onChange,
}: {
  id: string;
  value: string;
  disabled: boolean;
  onChange: EditorValueChange;
}) {
  const transactionIdRef = useRef(`asset:${id}`);
  const [draftValue, setDraftValue] = useState(value);
  const [previewFailed, setPreviewFailed] = useState(false);
  const invalid = Boolean(draftValue.trim()) && !isLikelyAssetSource(draftValue);
  const canPreview = Boolean(value.trim()) && isLikelyAssetSource(value);
  const canActOnSource = canPreview && !invalid;

  useEffect(() => {
    // Keep the local draft input in sync when selection changes.
    setDraftValue(value);
    setPreviewFailed(false);
  }, [value]);

  function commitValue(nextValue: string) {
    setDraftValue(nextValue);
    if (isLikelyAssetSource(nextValue)) {
      onChange(nextValue.trim(), {
        commit: "preview",
        transactionId: transactionIdRef.current,
      });
    }
  }

  return (
    <div className={styles.assetSourceControl}>
      <div className={styles.assetPreview} aria-hidden="true">
        {canPreview && !previewFailed ? (
          <img src={value} alt="" onError={() => setPreviewFailed(true)} />
        ) : (
          <EditorIcon icon={Image01Icon} />
        )}
      </div>
      <InputGroup className={styles.assetSourceGroup} data-invalid={invalid ? true : undefined}>
        <InputGroupInput
          id={id}
          disabled={disabled}
          value={draftValue}
          placeholder="https://... or /asset.jpg"
          className={styles.assetSourceInput}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          aria-label="Image source"
          onFocus={(event) => event.currentTarget.select()}
          onBlur={() => {
            if (isLikelyAssetSource(draftValue)) {
              onChange(draftValue.trim(), {
                commit: "commit",
                transactionId: transactionIdRef.current,
              });
            } else {
              onChange(value, {
                commit: "cancel",
                transactionId: transactionIdRef.current,
              });
              setDraftValue(value);
            }
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== "Escape") return;
            event.preventDefault();
            if (event.key === "Escape") {
              onChange(value, {
                commit: "cancel",
                transactionId: transactionIdRef.current,
              });
              setDraftValue(value);
              event.currentTarget.blur();
              return;
            }
            if (isLikelyAssetSource(draftValue)) {
              onChange(draftValue.trim(), {
                commit: "commit",
                transactionId: transactionIdRef.current,
              });
              event.currentTarget.blur();
            }
          }}
          onChange={(event) => commitValue(event.target.value)}
        />
        <InputGroupAddon align="inline-end" className={styles.assetSourceActions}>
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            disabled={disabled || !canActOnSource}
            aria-label="Open image source"
            onClick={() => {
              if (canActOnSource) window.open(value, "_blank", "noopener,noreferrer");
            }}
          >
            <EditorIcon icon={EyeIcon} />
          </InputGroupButton>
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            disabled={disabled || !canActOnSource}
            aria-label="Clear image source"
            onClick={() => {
              setDraftValue("");
              onChange("");
            }}
          >
            <EditorIcon icon={RotateLeft01Icon} />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {invalid ? (
        <span className={styles.fieldError} id={`${id}-error`}>
          Use a relative path, data image, blob URL, or http URL
        </span>
      ) : null}
    </div>
  );
}

function SmartTextarea({
  id,
  label,
  value,
  placeholder,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  onChange: EditorValueChange;
}) {
  const transactionIdRef = useRef(`textarea:${id}`);
  const lineCount = value.length ? value.split(/\r\n|\r|\n/).length : 0;
  const describedBy = `${id}-meta`;

  return (
    <div className={styles.smartTextareaControl}>
      <Textarea
        id={id}
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        className={styles.smartTextarea}
        aria-describedby={describedBy}
        spellCheck
        onBlur={(event) => {
          onChange(event.currentTarget.value, {
            commit: "commit",
            transactionId: transactionIdRef.current,
          });
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onChange(value, {
              commit: "cancel",
              transactionId: transactionIdRef.current,
            });
            event.currentTarget.blur();
          }
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            onChange(event.currentTarget.value, {
              commit: "commit",
              transactionId: transactionIdRef.current,
            });
            event.currentTarget.blur();
          }
        }}
        onChange={(event) => onChange(event.target.value, {
          commit: "preview",
          transactionId: transactionIdRef.current,
        })}
      />
      <div className={styles.smartTextareaMeta} id={describedBy}>
        <span>{value.length} chars</span>
        <span>{lineCount} lines</span>
        <span>{label}</span>
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  children,
  active,
  disabled,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={active ? "secondary" : "outline"}
          size="icon"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>{label}</TooltipContent>
    </Tooltip>
  );
}

function InspectorSection({
  icon,
  title,
  description,
  children,
}: {
  icon: EditorIconType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.inspectorSection}>
      <div className={styles.inspectorSectionHeader}>
        <div className={styles.inspectorSectionIcon} aria-hidden="true">
          <EditorIcon icon={icon} />
        </div>
        <div className="min-w-0">
          <h3 className={styles.inspectorSectionTitle}>{title}</h3>
          {description ? <p className={styles.inspectorSectionDescription}>{description}</p> : null}
        </div>
      </div>
      <div className={styles.inspectorSectionBody}>{children}</div>
    </section>
  );
}

export function EditorShell({ initialPath, routes }: EditorShellProps) {
  const normalizedInitialPath = normalizePath(initialPath);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [route, setRoute] = useState(normalizedInitialPath);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectorEnabled, setSelectorEnabled] = useState(true);
  const [routesOpen, setRoutesOpen] = useState(false);
  const [viewport, setViewport] = useState<ViewportName>("desktop");
  const [selection, setSelection] = useState<SelectionMetadata | null>(null);
  const [selections, setSelections] = useState<SelectionMetadata[]>([]);
  const [baseStyles, setBaseStyles] = useState<Record<string, string>>({});
  const [styleValues, setStyleValues] = useState<Record<string, string>>({});
  const [textValue, setTextValue] = useState("");
  const [imageValue, setImageValue] = useState("");
  const [hidden, setHidden] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [notes, setNotes] = useState("");
  const [patches, setPatches] = useState<EditorPatch[]>([]);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [sourceApplyState, setSourceApplyState] = useState<"idle" | "applying" | "applied">("idle");
  const [overrideApplyState, setOverrideApplyState] = useState<"idle" | "applying" | "applied">("idle");
  const [inspectorTab, setInspectorTab] = useState("style");
  const [undoStack, setUndoStack] = useState<EditorHistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<EditorHistorySnapshot[]>([]);
  const [expandedPatchIds, setExpandedPatchIds] = useState<Set<string>>(() => new Set());
  const [systemFontFamilies, setSystemFontFamilies] = useState<string[]>([]);
  const [fontAccessState, setFontAccessState] = useState<FontAccessState>("idle");
  const fieldTransactionSnapshotsRef = useRef<Map<string, EditorHistorySnapshot>>(new Map());
  const pendingStylePropertiesRef = useRef<Set<string>>(new Set());
  const previewDraftPayloadsRef = useRef<Map<string, PreviewDraftPayload>>(new Map());
  const latestEditorStateRef = useRef<EditorRuntimeState>({
    route,
    viewport,
    patches,
    selection,
    selections,
    baseStyles,
    styleValues,
    textValue,
    imageValue,
    hidden,
    deleted,
    notes,
  });

  const iframeSrc = useMemo(() => canvasPath(route), [route]);
  const viewportWidth = viewportSizes[viewport].width;
  const fontOptions = useMemo(() => mergeFontOptions(systemFontFamilies), [systemFontFamilies]);
  const selectionLabel = selection
    ? selections.length > 1
      ? `${selections.length} elements selected`
      : selection.target.textSnippet || selection.target.selector
    : "Select an element in the preview";
  const canEditContent = selections.length === 1;
  const canEditTextContent = canEditContent && Boolean(selections[0]?.capabilities?.canEditText ?? isTextCompatibleSelection(selections[0]));
  const canEditImageContent = canEditContent && Boolean(selections[0]?.capabilities?.canEditImage ?? isImageSelection(selections[0]));

  const routeOptions = useMemo(() => {
    if (routes.some((candidate) => candidate.path === route)) return routes;
    return [{ path: route, label: route }, ...routes];
  }, [route, routes]);
  const currentRoute = routeOptions.find((candidate) => candidate.path === route);
  const currentCollectionKey = currentRoute?.collection?.key;
  const collectionRoutes = useMemo(() => {
    if (!currentCollectionKey) return [];
    return routeOptions.filter((candidate) => candidate.collection?.key === currentCollectionKey);
  }, [currentCollectionKey, routeOptions]);
  const selectedHasDraft = selection
    ? patches.some((patch) => selections.some((candidate) => sameTarget(candidate.target, patch.target)))
    : false;
  const styleGroupOrder: FieldGroupName[] = ["typography", "appearance", "spacing", "layout"];
  const visibleStyleGroups = styleGroupOrder
    .map((group) => ({
      group,
      fields: fieldGroups[group].filter(
        (field) => fieldVisibleForSelections(field, selections) && !advancedStyleProperties.has(field.property),
      ),
    }))
    .filter(({ fields }) => fields.length > 0);
  const advancedStyleFields = (Object.keys(fieldGroups) as FieldGroupName[]).flatMap((group) =>
    fieldGroups[group].filter(
      (field) => fieldVisibleForSelections(field, selections) && advancedStyleProperties.has(field.property),
    ),
  );

  function syncLatestEditorState(partial: Partial<EditorRuntimeState>) {
    latestEditorStateRef.current = {
      ...latestEditorStateRef.current,
      ...partial,
    };
  }

  useLayoutEffect(() => {
    syncLatestEditorState({
      route,
      viewport,
      patches,
      selection,
      selections,
      baseStyles,
      styleValues,
      textValue,
      imageValue,
      hidden,
      deleted,
      notes,
    });
  }, [route, viewport, patches, selection, selections, baseStyles, styleValues, textValue, imageValue, hidden, deleted, notes]);

  function snapshotEditorState(): EditorHistorySnapshot {
    const current = latestEditorStateRef.current;
    return {
      patches: current.patches,
      selection: current.selection,
      selections: current.selections,
      baseStyles: current.baseStyles,
      styleValues: current.styleValues,
      textValue: current.textValue,
      imageValue: current.imageValue,
      hidden: current.hidden,
      deleted: current.deleted,
      notes: current.notes,
    };
  }

  function pushUndoSnapshot(snapshot = snapshotEditorState()) {
    setUndoStack((current) => [...current.slice(-79), snapshot]);
    setRedoStack([]);
  }

  function beginFieldTransaction(transactionId?: string) {
    if (!transactionId || fieldTransactionSnapshotsRef.current.has(transactionId)) return;
    fieldTransactionSnapshotsRef.current.set(transactionId, snapshotEditorState());
  }

  function commitFieldTransaction(transactionId?: string) {
    if (!transactionId) return false;
    const snapshot = fieldTransactionSnapshotsRef.current.get(transactionId);
    if (!snapshot) return false;
    pushUndoSnapshot(snapshot);
    fieldTransactionSnapshotsRef.current.delete(transactionId);
    return true;
  }

  function cancelFieldTransaction(transactionId?: string) {
    if (!transactionId) return false;
    const snapshot = fieldTransactionSnapshotsRef.current.get(transactionId);
    if (!snapshot) return false;
    fieldTransactionSnapshotsRef.current.delete(transactionId);
    applyHistorySnapshot(snapshot);
    return true;
  }

  function reapplyPreviewPatches(nextPatches: EditorPatch[]) {
    const previewWindow = iframeRef.current?.contentWindow;
    if (!previewWindow) return;

    previewWindow.postMessage({ type: "editor:clear-preview" }, window.location.origin);
    for (const patch of nextPatches) {
      previewWindow.postMessage(
        {
          type: "editor:apply-preview",
          patch: previewPayloadForPatch(patch),
        },
        window.location.origin,
      );
    }
  }

  function applyHistorySnapshot(snapshot: EditorHistorySnapshot) {
    syncLatestEditorState(snapshot);
    setPatches(snapshot.patches);
    persistPatches(snapshot.patches, latestEditorStateRef.current.route);
    setSelection(snapshot.selection);
    setSelections(snapshot.selections);
    setBaseStyles(snapshot.baseStyles);
    setStyleValues(snapshot.styleValues);
    setTextValue(snapshot.textValue);
    setImageValue(snapshot.imageValue);
    setHidden(snapshot.hidden);
    setDeleted(snapshot.deleted);
    setNotes(snapshot.notes);
    reapplyPreviewPatches(snapshot.patches);
  }

  function undoEditorChange() {
    const previous = undoStack.at(-1);
    if (!previous) return;
    setRedoStack((currentRedoStack) => [...currentRedoStack.slice(-79), snapshotEditorState()]);
    setUndoStack((currentUndoStack) => currentUndoStack.slice(0, -1));
    applyHistorySnapshot(previous);
  }

  function redoEditorChange() {
    const next = redoStack.at(-1);
    if (!next) return;
    setUndoStack((currentUndoStack) => [...currentUndoStack.slice(-79), snapshotEditorState()]);
    setRedoStack((currentRedoStack) => currentRedoStack.slice(0, -1));
    applyHistorySnapshot(next);
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = Boolean(
        target?.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']"),
      );
      if (event.key === "`" && !isTyping) {
        event.preventDefault();
        setSidebarOpen((open) => !open);
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
        if (event.shiftKey) redoEditorChange();
        else undoEditorChange();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "y") {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
        redoEditorChange();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Undo/redo handlers intentionally read the current editor state listed below.
  }, [undoStack, redoStack, patches, selection, selections, baseStyles, styleValues, textValue, imageValue, hidden, deleted, notes]);

  useEffect(() => {
    const draftLoad = window.setTimeout(() => {
      const nextPatches = readDrafts(route);
      syncLatestEditorState({ patches: nextPatches });
      setPatches(nextPatches);
    }, 0);
    return () => window.clearTimeout(draftLoad);
  }, [route]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "editor:set-enabled", enabled: selectorEnabled },
      window.location.origin,
    );
  }, [selectorEnabled, iframeSrc]);

  useEffect(() => {
    if (selections.length === 0) return;

    const stylesPayload = Object.fromEntries(
      Object.entries(styleValues).filter(([property, value]) => value !== (baseStyles[property] ?? "")),
    );

    for (const selected of selections) {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: "editor:apply-preview",
          patch: {
            target: selected.target,
            styles: stylesPayload,
            text: selections.length === 1 && textValue !== selected.text ? textValue : undefined,
            imageSrc: selections.length === 1 && imageValue !== selected.imageSrc ? imageValue : undefined,
            hidden,
            deleted,
          },
        },
        window.location.origin,
      );
    }
  }, [baseStyles, deleted, hidden, imageValue, selections, styleValues, textValue]);

  async function loadSystemFonts() {
    if (fontAccessState === "loading" || fontAccessState === "loaded") return;

    if (typeof window.queryLocalFonts !== "function") {
      setFontAccessState("unavailable");
      return;
    }

    setFontAccessState("loading");
    try {
      const localFonts = await window.queryLocalFonts();
      const families = Array.from(new Set(localFonts.map((font) => cleanFontFamilyName(font.family)).filter(Boolean)))
        .sort((left, right) => left.localeCompare(right));
      setSystemFontFamilies(families);
      setFontAccessState("loaded");
    } catch {
      setFontAccessState("denied");
    }
  }

  function previewStylesPayload(nextStyleValues = styleValues, forcedStyles: Record<string, string> = {}) {
    return {
      ...Object.fromEntries(
        Object.entries(nextStyleValues).filter(([property, value]) => value !== (baseStyles[property] ?? "")),
      ),
      ...forcedStyles,
    };
  }

  function postPreviewPatch(
    nextStyleValues = styleValues,
    forcedStyles: Record<string, string> = {},
    options: { persistable?: boolean } = {},
  ) {
    if (selections.length === 0) return;

    for (const selected of selections) {
      const payload: PreviewDraftPayload = {
        target: selected.target,
        styles: previewStylesPayload(nextStyleValues, forcedStyles),
        text: selections.length === 1 && textValue !== selected.text ? textValue : undefined,
        imageSrc: selections.length === 1 && imageValue !== selected.imageSrc ? imageValue : undefined,
        hidden,
        deleted,
      };
      if (options.persistable !== false) {
        previewDraftPayloadsRef.current.set(previewDraftKey(selected.target), payload);
      }
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: "editor:apply-preview",
          patch: payload,
        },
        window.location.origin,
      );
    }
  }

  function previewStyle(property: string, value: string) {
    postPreviewPatch(styleValues, { [property]: value }, { persistable: false });
  }

  function restorePreview() {
    if (selections.length === 0) return;
    for (const selected of selections) {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "editor:clear-preview", target: selected.target },
        window.location.origin,
      );
    }
    postPreviewPatch();
  }

  function convertSelectedUnit({ property, value, nextUnit }: NumericUnitConversion) {
    if (!selection || selections.length !== 1) return null;

    const previewDocument = iframeRef.current?.contentDocument;
    if (!previewDocument) return null;

    try {
      const target = previewDocument.querySelector(selection.target.selector);
      const previewWindow = previewDocument.defaultView;
      if (!previewWindow || !(target instanceof previewWindow.HTMLElement)) return null;
      return convertCssUnitForElement(target, property, value, nextUnit);
    } catch {
      return null;
    }
  }

  function setRouteAndUrl(nextRoute: string) {
    const normalized = normalizePath(nextRoute);
    flushPendingDrafts();
    fieldTransactionSnapshotsRef.current.clear();
    pendingStylePropertiesRef.current.clear();
    clearPreviewDraftPayloads();
    const nextPatches = readDrafts(normalized);
    syncLatestEditorState({
      route: normalized,
      patches: nextPatches,
      selection: null,
      selections: [],
      baseStyles: {},
      styleValues: {},
      textValue: "",
      imageValue: "",
      hidden: false,
      deleted: false,
      notes: "",
    });
    setRoute(normalized);
    setPatches(nextPatches);
    setSelection(null);
    setSelections([]);
    setBaseStyles({});
    setStyleValues({});
    setTextValue("");
    setImageValue("");
    setHidden(false);
    setDeleted(false);
    setNotes("");
    setUndoStack([]);
    setRedoStack([]);
    const params = new URLSearchParams({ path: normalized });
    window.history.replaceState(null, "", `/__editor?${params.toString()}`);
  }

  function persistPatches(nextPatches: EditorPatch[], nextRoute = route) {
    try {
      window.localStorage.setItem(storageKey(nextRoute), JSON.stringify(nextPatches));
    } catch {}
  }

  function updatePatches(updater: (current: EditorPatch[]) => EditorPatch[]) {
    setPatches((current) => {
      const nextPatches = updater(current);
      syncLatestEditorState({ patches: nextPatches });
      persistPatches(nextPatches, latestEditorStateRef.current.route);
      return nextPatches;
    });
  }

  function draftMatchesPatch(patch: EditorPatch, draft: EditorDraftInput) {
    return patch.notes === draft.notes && JSON.stringify(patch.changes) === JSON.stringify(draft.changes);
  }

  function applyDraftsToPatchList(current: EditorPatch[], drafts: EditorDraftInput[], draftRoute = latestEditorStateRef.current.route) {
    let nextPatches = current;

    for (const draft of drafts) {
      const existing = nextPatches.find((patch) => sameTarget(patch.target, draft.target));

      if (draft.changes.length === 0 && !draft.notes.trim()) {
        if (existing) nextPatches = nextPatches.filter((patch) => !sameTarget(patch.target, draft.target));
        continue;
      }

      if (existing && draftMatchesPatch(existing, draft)) continue;

      nextPatches = upsertPatch(nextPatches, {
        id: existing?.id ?? `${draft.target.route}:${draft.target.selector}`,
        route: draftRoute,
        target: draft.target,
        changes: draft.changes,
        notes: draft.notes,
        timestamp: new Date().toISOString(),
      });
    }

    return nextPatches;
  }

  function commitPendingFieldTransactions() {
    const firstSnapshot = fieldTransactionSnapshotsRef.current.values().next().value;
    if (!firstSnapshot) return;
    pushUndoSnapshot(firstSnapshot);
    fieldTransactionSnapshotsRef.current.clear();
  }

  function previewDraftKey(target: ElementTarget) {
    return `${target.route}:${target.selector}`;
  }

  function clearPreviewDraftPayloads(targets = latestEditorStateRef.current.selections.map((selected) => selected.target)) {
    for (const target of targets) {
      previewDraftPayloadsRef.current.delete(previewDraftKey(target));
    }
  }

  function cachePreviewDraftPayload({
    nextStyleValues = latestEditorStateRef.current.styleValues,
    nextTextValue = latestEditorStateRef.current.textValue,
    nextImageValue = latestEditorStateRef.current.imageValue,
    nextHidden = latestEditorStateRef.current.hidden,
    nextDeleted = latestEditorStateRef.current.deleted,
  }: {
    nextStyleValues?: Record<string, string>;
    nextTextValue?: string;
    nextImageValue?: string;
    nextHidden?: boolean;
    nextDeleted?: boolean;
  } = {}) {
    const current = latestEditorStateRef.current;
    if (current.selections.length === 0) return;

    const stylesPayload = Object.fromEntries(
      Object.entries(nextStyleValues).filter(([property, value]) => value !== (current.baseStyles[property] ?? "")),
    );

    for (const selected of current.selections) {
      previewDraftPayloadsRef.current.set(previewDraftKey(selected.target), {
        target: selected.target,
        styles: stylesPayload,
        text: current.selections.length === 1 && nextTextValue !== selected.text ? nextTextValue : undefined,
        imageSrc: current.selections.length === 1 && nextImageValue !== selected.imageSrc ? nextImageValue : undefined,
        hidden: nextHidden,
        deleted: nextDeleted,
      });
    }
  }

  function previewPayloadDrafts() {
    const current = latestEditorStateRef.current;
    if (current.selections.length === 0) return null;

    const drafts = current.selections.map<EditorDraftInput>((selected) => {
      const payload = previewDraftPayloadsRef.current.get(previewDraftKey(selected.target));
      const changes: EditorChange[] = [];

      if (payload) {
        for (const [property, after] of Object.entries(payload.styles)) {
          const before = selected.computedStyles[property] ?? "";
          if (after === before) continue;
          changes.push({
            kind: "style",
            property,
            before,
            after,
            viewport: current.viewport,
          });
        }

        if (current.selections.length === 1 && payload.text !== undefined && payload.text !== selected.text) {
          changes.push({
            kind: "content",
            field: "text",
            before: selected.text,
            after: payload.text,
          });
        }

        if (current.selections.length === 1 && payload.imageSrc !== undefined && payload.imageSrc !== selected.imageSrc) {
          changes.push({
            kind: "content",
            field: "imageSrc",
            before: selected.imageSrc,
            after: payload.imageSrc,
          });
        }

        if (payload.hidden) {
          changes.push({
            kind: "element",
            action: "hide",
            before: false,
            after: true,
          });
        }

        if (payload.deleted) {
          changes.push({
            kind: "element",
            action: "delete",
            before: false,
            after: true,
          });
        }
      }

      return {
        changes,
        notes: current.selections.length === 1 ? current.notes : "",
        target: selected.target,
      };
    });

    return drafts.some((draft) => draft.changes.length > 0 || draft.notes.trim()) ? drafts : null;
  }

  function livePreviewDraftsFromDom() {
    const current = latestEditorStateRef.current;
    if (current.selections.length === 0) return null;

    const previewDocument = iframeRef.current?.contentDocument;
    const previewWindow = previewDocument?.defaultView;
    if (!previewDocument || !previewWindow) return null;

    const stateChangedProperties = changedStyleProperties(current.baseStyles, current.styleValues);
    const touchedProperties = pendingStylePropertiesRef.current.size > 0
      ? Array.from(pendingStylePropertiesRef.current)
      : stateChangedProperties;

    return current.selections.map<EditorDraftInput>((selected) => {
      let element: Element | null = null;
      try {
        element = previewDocument.querySelector(selected.target.selector);
      } catch {}
      if (!element) {
        return {
          changes: [],
          notes: current.selections.length === 1 ? current.notes : "",
          target: selected.target,
        };
      }

      const computed = previewWindow.getComputedStyle(element);
      const inlinePreviewProperties = Array.from((element as HTMLElement).style)
        .map(toStylePropertyName)
        .filter((property) => Object.prototype.hasOwnProperty.call(selected.computedStyles, property));
      const draftProperties = touchedProperties.length > 0 ? touchedProperties : inlinePreviewProperties;
      const changes: EditorChange[] = draftProperties
        .map<StyleChange | null>((property) => {
          const before = selected.computedStyles[property] ?? "";
          const after = computed[property as keyof CSSStyleDeclaration] as string || "";
          if (after === before) return null;
          return {
            kind: "style",
            property,
            before,
            after,
            viewport: current.viewport,
          };
        })
        .filter((change): change is StyleChange => Boolean(change));

      const editableImage =
        element instanceof previewWindow.HTMLImageElement
          ? element
          : element.querySelector("img");
      const nextTextValue = selected.capabilities?.canEditText ? (element.textContent || "").trim() : selected.text;
      const nextImageValue =
        editableImage instanceof previewWindow.HTMLImageElement
          ? editableImage.currentSrc || editableImage.src
          : selected.imageSrc;

      if (current.selections.length === 1 && nextTextValue !== selected.text) {
        changes.push({
          kind: "content",
          field: "text",
          before: selected.text,
          after: nextTextValue,
        });
      }

      if (current.selections.length === 1 && nextImageValue !== selected.imageSrc) {
        changes.push({
          kind: "content",
          field: "imageSrc",
          before: selected.imageSrc,
          after: nextImageValue,
        });
      }

      return {
        changes,
        notes: current.selections.length === 1 ? current.notes : "",
        target: selected.target,
      };
    });
  }

  function flushPendingDrafts(currentPatches = latestEditorStateRef.current.patches) {
    const drafts = previewPayloadDrafts() ?? livePreviewDraftsFromDom() ?? changesForDraft();
    if (!drafts) return currentPatches;

    const nextPatches = applyDraftsToPatchList(currentPatches, drafts);
    if (nextPatches === currentPatches) return currentPatches;

    commitPendingFieldTransactions();
    syncLatestEditorState({ patches: nextPatches });
    setPatches(nextPatches);
    persistPatches(nextPatches, latestEditorStateRef.current.route);
    return nextPatches;
  }

  function changesForDraft(overrides: {
    nextStyleValues?: Record<string, string>;
    nextTextValue?: string;
    nextImageValue?: string;
    nextHidden?: boolean;
    nextDeleted?: boolean;
    nextNotes?: string;
    nextViewport?: ViewportName;
  } = {}) {
    const current = latestEditorStateRef.current;
    const draftSelections = current.selections;
    const draftBaseStyles = current.baseStyles;
    const nextStyleValues = overrides.nextStyleValues ?? current.styleValues;
    const nextTextValue = overrides.nextTextValue ?? current.textValue;
    const nextImageValue = overrides.nextImageValue ?? current.imageValue;
    const nextHidden = overrides.nextHidden ?? current.hidden;
    const nextDeleted = overrides.nextDeleted ?? current.deleted;
    const nextNotes = overrides.nextNotes ?? current.notes;
    const nextViewport = overrides.nextViewport ?? current.viewport;

    if (draftSelections.length === 0) return null;

    const changedProperties = changedStyleProperties(draftBaseStyles, nextStyleValues);

    return draftSelections.map((selected) => {
      const changes: EditorChange[] = [
        ...changedProperties.map<StyleChange>((property) => ({
          kind: "style",
          property,
          before: selected.computedStyles[property] ?? "",
          after: nextStyleValues[property] ?? "",
          viewport: nextViewport,
        })),
        ...(draftSelections.length === 1 && nextTextValue !== selected.text
          ? [
              {
                kind: "content",
                field: "text",
                before: selected.text,
                after: nextTextValue,
              } satisfies ContentChange,
            ]
          : []),
        ...(draftSelections.length === 1 && nextImageValue !== selected.imageSrc
          ? [
              {
                kind: "content",
                field: "imageSrc",
                before: selected.imageSrc,
                after: nextImageValue,
              } satisfies ContentChange,
            ]
          : []),
        ...(nextHidden
          ? [
              {
                kind: "element",
                action: "hide",
                before: false,
                after: true,
              } satisfies ElementChange,
            ]
          : []),
        ...(nextDeleted
          ? [
              {
                kind: "element",
                action: "delete",
                before: false,
                after: true,
              } satisfies ElementChange,
            ]
          : []),
      ];

      return {
        changes,
        notes: draftSelections.length === 1 ? nextNotes : "",
        target: selected.target,
      };
    });
  }

  function commitDraft(overrides: Parameters<typeof changesForDraft>[0] = {}) {
    const drafts = changesForDraft(overrides);
    if (!drafts) return;

    updatePatches((current) => applyDraftsToPatchList(current, drafts));
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const message = event.data as { type?: string; selection?: SelectionMetadata; selections?: SelectionMetadata[] };
      if (message.type === "editor:undo") {
        undoEditorChange();
        return;
      }
      if (message.type === "editor:redo") {
        redoEditorChange();
        return;
      }
      if (message.type !== "editor:select" || !message.selection) return;

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.dispatchEvent(new Event("change", { bubbles: true }));
        document.activeElement.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
        document.activeElement.blur();
      }

      const nextSelections = message.selections?.length ? message.selections : [message.selection];
      const primarySelection = nextSelections[0];
      const currentRoute = latestEditorStateRef.current.route;
      const currentPatches = readDrafts(currentRoute);
      const selectablePatches = flushPendingDrafts(currentPatches.length > 0 ? currentPatches : latestEditorStateRef.current.patches);
      clearPreviewDraftPayloads();
      pendingStylePropertiesRef.current.clear();
      const patchesBySelector = new Map(
        nextSelections.map((candidate) => [
          candidate.target.selector,
          selectablePatches.find((patch) => sameTarget(patch.target, candidate.target)),
        ]),
      );
      const patchedBaseSelections = nextSelections.map((candidate) =>
        patchedBaseSelection(candidate, patchesBySelector.get(candidate.target.selector)),
      );
      const patchedValueSelections = patchedBaseSelections.map((candidate) => ({
        ...candidate,
        computedStyles: patchedStyleValues(candidate.computedStyles, patchesBySelector.get(candidate.target.selector)),
      }));
      const nextBaseStyles = commonComputedStyles(patchedBaseSelections);
      const nextStyleValues = commonComputedStyles(patchedValueSelections);
      const selectedPatches = nextSelections
        .map((candidate) => patchesBySelector.get(candidate.target.selector))
        .filter(Boolean);
      const primaryPatch = patchesBySelector.get(primarySelection.target.selector);
      const primaryBaseSelection = patchedBaseSelections[0];
      const nextTextValue = nextSelections.length === 1 ? patchedContentValue(primaryBaseSelection, primaryPatch, "text") : "";
      const nextImageValue = nextSelections.length === 1 ? patchedContentValue(primaryBaseSelection, primaryPatch, "imageSrc") : "";
      const nextHidden =
        nextSelections.length > 0 && selectedPatches.length === nextSelections.length && selectedPatches.every((patch) => elementActionValue(patch, "hide"));
      const nextDeleted =
        nextSelections.length > 0 && selectedPatches.length === nextSelections.length && selectedPatches.every((patch) => elementActionValue(patch, "delete"));
      const nextNotes = nextSelections.length === 1 ? primaryPatch?.notes ?? "" : "";
      syncLatestEditorState({
        patches: selectablePatches,
        selection: primaryBaseSelection,
        selections: patchedBaseSelections,
        baseStyles: nextBaseStyles,
        styleValues: nextStyleValues,
        textValue: nextTextValue,
        imageValue: nextImageValue,
        hidden: nextHidden,
        deleted: nextDeleted,
        notes: nextNotes,
      });
      setSidebarOpen(true);
      setSelection(primaryBaseSelection);
      setSelections(patchedBaseSelections);
      setBaseStyles(nextBaseStyles);
      setStyleValues(nextStyleValues);
      setTextValue(nextTextValue);
      setImageValue(nextImageValue);

      setHidden(nextHidden);
      setDeleted(nextDeleted);
      setNotes(nextNotes);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Preview iframe undo/redo messages intentionally read the current editor state listed below.
  }, [patches, undoStack, redoStack, selection, selections, baseStyles, styleValues, textValue, imageValue, hidden, deleted, notes]);

  function setViewportAndCommit(nextViewport: ViewportName) {
    syncLatestEditorState({ viewport: nextViewport });
    setViewport(nextViewport);
  }

  function updateStyle(property: string, value: string, options?: StyleValueChangeOptions) {
    const currentStyleValues = latestEditorStateRef.current.styleValues;
    const nextStyleValues = { ...currentStyleValues, [property]: value };
    const mode = options?.commit ?? "commit";

    if (mode === "cancel") {
      cancelFieldTransaction(options?.transactionId);
      return;
    }

    if (currentStyleValues[property] === value && mode !== "commit") return;
    if (currentStyleValues[property] !== value) pendingStylePropertiesRef.current.add(property);

    if (mode === "preview") {
      beginFieldTransaction(options?.transactionId);
      if (currentStyleValues[property] !== value) {
        syncLatestEditorState({ styleValues: nextStyleValues });
        cachePreviewDraftPayload({ nextStyleValues });
        setStyleValues(nextStyleValues);
        commitDraft({ nextStyleValues });
      }
      return;
    }

    const transactionCommitted = commitFieldTransaction(options?.transactionId);
    if (!transactionCommitted && options?.undo !== "skip" && currentStyleValues[property] !== value) pushUndoSnapshot();
    syncLatestEditorState({ styleValues: nextStyleValues });
    cachePreviewDraftPayload({ nextStyleValues });
    setStyleValues(nextStyleValues);
    commitDraft({ nextStyleValues });
  }

  function updateText(value: string, options?: StyleValueChangeOptions) {
    const currentTextValue = latestEditorStateRef.current.textValue;
    const mode = options?.commit ?? "commit";

    if (mode === "cancel") {
      cancelFieldTransaction(options?.transactionId);
      return;
    }

    if (currentTextValue === value && mode !== "commit") return;

    if (mode === "preview") {
      beginFieldTransaction(options?.transactionId);
      if (currentTextValue !== value) {
        syncLatestEditorState({ textValue: value });
        cachePreviewDraftPayload({ nextTextValue: value });
        setTextValue(value);
        commitDraft({ nextTextValue: value });
      }
      return;
    }

    const transactionCommitted = commitFieldTransaction(options?.transactionId);
    if (!transactionCommitted && options?.undo !== "skip" && currentTextValue !== value) pushUndoSnapshot();
    syncLatestEditorState({ textValue: value });
    cachePreviewDraftPayload({ nextTextValue: value });
    setTextValue(value);
    commitDraft({ nextTextValue: value });
  }

  function updateImage(value: string, options?: StyleValueChangeOptions) {
    const currentImageValue = latestEditorStateRef.current.imageValue;
    const mode = options?.commit ?? "commit";

    if (mode === "cancel") {
      cancelFieldTransaction(options?.transactionId);
      return;
    }

    if (currentImageValue === value && mode !== "commit") return;

    if (mode === "preview") {
      beginFieldTransaction(options?.transactionId);
      if (currentImageValue !== value) {
        syncLatestEditorState({ imageValue: value });
        cachePreviewDraftPayload({ nextImageValue: value });
        setImageValue(value);
        commitDraft({ nextImageValue: value });
      }
      return;
    }

    const transactionCommitted = commitFieldTransaction(options?.transactionId);
    if (!transactionCommitted && options?.undo !== "skip" && currentImageValue !== value) pushUndoSnapshot();
    syncLatestEditorState({ imageValue: value });
    cachePreviewDraftPayload({ nextImageValue: value });
    setImageValue(value);
    commitDraft({ nextImageValue: value });
  }

  function updateHidden(value: boolean) {
    if (latestEditorStateRef.current.hidden === value) return;
    pushUndoSnapshot();
    syncLatestEditorState({ hidden: value });
    cachePreviewDraftPayload({ nextHidden: value });
    setHidden(value);
    commitDraft({ nextHidden: value });
  }

  function updateDeleted(value: boolean) {
    if (latestEditorStateRef.current.deleted === value) return;
    pushUndoSnapshot();
    syncLatestEditorState({ deleted: value });
    cachePreviewDraftPayload({ nextDeleted: value });
    setDeleted(value);
    commitDraft({ nextDeleted: value });
  }

  function updateNotes(value: string, options?: StyleValueChangeOptions) {
    const currentNotes = latestEditorStateRef.current.notes;
    const mode = options?.commit ?? "commit";

    if (mode === "cancel") {
      cancelFieldTransaction(options?.transactionId);
      return;
    }

    if (currentNotes === value && mode !== "commit") return;

    if (mode === "preview") {
      beginFieldTransaction(options?.transactionId);
      if (currentNotes !== value) {
        syncLatestEditorState({ notes: value });
        setNotes(value);
        commitDraft({ nextNotes: value });
      }
      return;
    }

    const transactionCommitted = commitFieldTransaction(options?.transactionId);
    if (!transactionCommitted && options?.undo !== "skip" && currentNotes !== value) pushUndoSnapshot();
    syncLatestEditorState({ notes: value });
    setNotes(value);
    commitDraft({ nextNotes: value });
  }

  function resetSelectedPreview() {
    if (selections.length === 0) {
      toast.info("Select an element first");
      return;
    }
    pushUndoSnapshot();
    for (const selected of selections) {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "editor:clear-preview", target: selected.target },
        window.location.origin,
      );
    }
    syncLatestEditorState({
      styleValues: baseStyles,
      textValue: selections.length === 1 ? selections[0].text : "",
      imageValue: selections.length === 1 ? selections[0].imageSrc : "",
      hidden: false,
      deleted: false,
    });
    setStyleValues(baseStyles);
    setTextValue(selections.length === 1 ? selections[0].text : "");
    setImageValue(selections.length === 1 ? selections[0].imageSrc : "");
    setHidden(false);
    setDeleted(false);
    updatePatches((current) => current.filter((patch) => !selections.some((selected) => sameTarget(patch.target, selected.target))));
    pendingStylePropertiesRef.current.clear();
    clearPreviewDraftPayloads();
    toast.success("Selection reset");
  }

  function resetAllPreviews() {
    if (patches.length === 0) {
      toast.info("No draft changes to reset");
      return;
    }

    pushUndoSnapshot();
    syncLatestEditorState({
      patches: [],
      styleValues: baseStyles,
      textValue: selection && selections.length === 1 ? selection.text : "",
      imageValue: selection && selections.length === 1 ? selection.imageSrc : "",
      hidden: false,
      deleted: false,
      notes: "",
    });
    setPatches([]);
    persistPatches([], latestEditorStateRef.current.route);
    iframeRef.current?.contentWindow?.postMessage(
      { type: "editor:clear-preview" },
      window.location.origin,
    );

    if (selection) {
      setStyleValues(baseStyles);
      setTextValue(selections.length === 1 ? selection.text : "");
      setImageValue(selections.length === 1 ? selection.imageSrc : "");
    }
    setHidden(false);
    setDeleted(false);
    setNotes("");
    pendingStylePropertiesRef.current.clear();
    clearPreviewDraftPayloads();
    toast.success("All draft changes reset");
  }

  function deletePatch(patch: EditorPatch) {
    pushUndoSnapshot();

    const nextPatches = patches.filter((candidate) => !sameTarget(candidate.target, patch.target));
    syncLatestEditorState({ patches: nextPatches });
    setPatches(nextPatches);
    setExpandedPatchIds((current) => {
      const next = new Set(current);
      next.delete(patch.id);
      return next;
    });
    persistPatches(nextPatches, latestEditorStateRef.current.route);
    iframeRef.current?.contentWindow?.postMessage(
      { type: "editor:clear-preview", target: patch.target },
      window.location.origin,
    );
    reapplyPreviewPatches(nextPatches);

    if (sameTarget(selection?.target, patch.target)) {
      syncLatestEditorState({
        styleValues: baseStyles,
        textValue: selection?.text ?? "",
        imageValue: selection?.imageSrc ?? "",
        hidden: false,
        deleted: false,
        notes: "",
      });
      setStyleValues(baseStyles);
      setTextValue(selection?.text ?? "");
      setImageValue(selection?.imageSrc ?? "");
      setHidden(false);
      setDeleted(false);
      setNotes("");
    }
    pendingStylePropertiesRef.current.clear();
    clearPreviewDraftPayloads([patch.target]);

    toast.success("Draft patch deleted");
  }

  function togglePatchExpanded(patchId: string) {
    setExpandedPatchIds((current) => {
      const next = new Set(current);
      if (next.has(patchId)) next.delete(patchId);
      else next.add(patchId);
      return next;
    });
  }

  function toggleAllPatchesExpanded() {
    setExpandedPatchIds((current) => {
      if (patches.length > 0 && patches.every((patch) => current.has(patch.id))) {
        return new Set();
      }
      return new Set(patches.map((patch) => patch.id));
    });
  }

  async function copyStyles() {
    if (patches.length === 0) {
      toast.info("No draft changes to copy");
      return;
    }

    try {
      const spec = createClipboardSpec(patches);
      await navigator.clipboard.writeText(formatClipboardSpec(spec));
      setCopyState("copied");
      toast.success("Handoff copied");
      window.setTimeout(() => setCopyState("idle"), 1400);
    } catch {
      toast.error("Clipboard copy failed");
    }
  }

  async function applyEditorPatches(mode: ApplyEditorMode) {
    const applying = mode === "source" ? sourceApplyState === "applying" : overrideApplyState === "applying";
    if (patches.length === 0 || applying) return;

    const setApplyState = mode === "source" ? setSourceApplyState : setOverrideApplyState;
    setApplyState("applying");
    try {
      const response = await fetch("/api/editor/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, patches }),
      });
      const result = (await response.json().catch(() => ({}))) as ApplyEditorPatchesResponse;

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Patch request failed");
      }

      setApplyState("applied");
      const unsupportedCount = result.unsupported?.reduce((total, item) => total + item.changes.length, 0) ?? 0;
      if (mode === "source" && result.appliedPatchIds && result.appliedPatchIds.length > 0) {
        const appliedIds = new Set(result.appliedPatchIds);
        const nextPatches = patches.filter((patch) => !appliedIds.has(patch.id));
        setPatches(nextPatches);
        persistPatches(nextPatches);
        iframeRef.current?.contentWindow?.postMessage(
          { type: "editor:clear-preview" },
          window.location.origin,
        );
        iframeRef.current?.contentWindow?.location.reload();
      }

      if (unsupportedCount > 0) {
        toast.warning(
          mode === "source"
            ? `Applied ${result.applied ?? 0} source target${result.applied === 1 ? "" : "s"}; ${unsupportedCount} change${unsupportedCount === 1 ? "" : "s"} still need override or handoff.`
            : `Patched ${result.applied ?? 0} target${result.applied === 1 ? "" : "s"}; ${unsupportedCount} non-CSS change${unsupportedCount === 1 ? "" : "s"} still need handoff.`,
        );
      } else {
        toast.success(
          mode === "source"
            ? `Applied ${result.applied ?? 0} source target${result.applied === 1 ? "" : "s"}${result.files?.length ? ` in ${result.files.length} file${result.files.length === 1 ? "" : "s"}` : ""}`
            : `Patched ${result.applied ?? 0} target${result.applied === 1 ? "" : "s"} to ${result.file ?? "CSS"}`,
        );
      }
      window.setTimeout(() => setApplyState("idle"), 1600);
    } catch (error) {
      setApplyState("idle");
      toast.error(error instanceof Error ? error.message : "Patch request failed");
    }
  }

  function applyPatchesToSource() {
    void applyEditorPatches("source");
  }

  function applyPatchOverrides() {
    void applyEditorPatches("override");
  }

  return (
    <TooltipProvider>
      <div className={styles.editor} data-visual-editor-shell="">
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <div className={styles.brandMark}>
              <EditorIcon icon={Layers01Icon} />
              <span>Ripe Editor</span>
            </div>

            <div className={styles.routeCluster}>
              <div className={styles.routePrimaryRow}>
                <Select value={route} onValueChange={setRouteAndUrl}>
                  <SelectTrigger className={styles.routeSelectTrigger} aria-label="Route">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {routeOptions.map((candidate) => (
                        <SelectItem value={candidate.path} key={candidate.path}>
                          {shortRouteLabel(candidate)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  className={styles.routeSearchButton}
                  aria-label="Routes"
                  onClick={() => setRoutesOpen(true)}
                >
                  <EditorIcon icon={Search01Icon} data-icon="inline-start" />
                  <span className={styles.routeSearchLabel}>Routes</span>
                </Button>
              </div>
            </div>
          </div>

          <div className={styles.topbarCenter}>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              spacing={0}
              value={viewport}
              onValueChange={(value) => {
                if (value) setViewportAndCommit(value as ViewportName);
              }}
              aria-label="Viewport"
            >
              {(Object.keys(viewportSizes) as ViewportName[]).map((name) => {
                const icon = viewportSizes[name].icon;
                return (
                  <Tooltip key={name}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem value={name} aria-label={viewportSizes[name].label}>
                        <EditorIcon icon={icon} />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>{viewportSizes[name].label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </ToggleGroup>
          </div>

          <div className={styles.topbarRight}>
            <ToolbarButton
              label="Undo"
              disabled={undoStack.length === 0}
              onClick={undoEditorChange}
            >
              <EditorIcon icon={Undo03Icon} />
            </ToolbarButton>
            <ToolbarButton
              label="Redo"
              disabled={redoStack.length === 0}
              onClick={redoEditorChange}
            >
              <EditorIcon icon={Redo03Icon} />
            </ToolbarButton>

            <ToolbarButton
              label={selectorEnabled ? "Disable element selector" : "Enable element selector"}
              active={selectorEnabled}
              onClick={() => setSelectorEnabled((enabled) => !enabled)}
            >
              <EditorIcon icon={CursorPointer02Icon} />
            </ToolbarButton>

            <ToolbarButton
              label={sidebarOpen ? "Close inspector" : "Open inspector"}
              active={sidebarOpen}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <EditorIcon icon={sidebarOpen ? PanelRightCloseIcon : PanelRightOpenIcon} />
            </ToolbarButton>
          </div>
        </header>

        <ResizablePanelGroup orientation="horizontal" className={styles.workspace}>
          <ResizablePanel minSize="280px" className={styles.previewPanel}>
            <main className={styles.stage}>
              <div className={styles.canvasChrome} style={{ "--canvas-width": `${viewportWidth}px` } as React.CSSProperties}>
                <iframe
                  ref={iframeRef}
                  key={iframeSrc}
                  className={styles.canvas}
                  title="Ripe site editor preview"
                  src={iframeSrc}
                  onLoad={() => {
                    iframeRef.current?.contentWindow?.postMessage(
                      { type: "editor:set-enabled", enabled: selectorEnabled },
                      window.location.origin,
                    );
                    reapplyPreviewPatches(patches);
                  }}
                />
              </div>
            </main>
          </ResizablePanel>

          {sidebarOpen ? (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel
                className={styles.inspectorPanel}
                defaultSize="320px"
                minSize="280px"
                maxSize="440px"
                groupResizeBehavior="preserve-pixel-size"
              >
                <aside className={styles.inspector} aria-label="Visual editor inspector">
                  <div className={styles.inspectorHeader}>
                    <div className={styles.inspectorHeaderTitle}>
                      <div className="flex items-center gap-2">
                        <EditorIcon icon={File01Icon} />
                        <h2 className="truncate text-sm font-medium">Visual edits</h2>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {route} · {patches.length} drafted
                      </p>
                    </div>
                    <Badge variant={patches.length > 0 ? "secondary" : "outline"}>
                      {patches.length} {patches.length === 1 ? "draft" : "drafts"}
                    </Badge>
                  </div>
                  <Separator />

                  <ScrollArea className={styles.inspectorScroll}>
                    <div className={styles.inspectorBody}>
                      {!selection ? (
                        <section className={styles.emptyState} aria-live="polite">
                          <div className={styles.emptyStateIcon}>
                            <EditorIcon icon={CursorPointer02Icon} />
                          </div>
                          <div className={styles.emptyStateCopy}>
                            <p>No element selected</p>
                            <h3>Select an element in the preview</h3>
                            <span>Turn on the selector, then click text, media, or layout in the canvas to edit it here.</span>
                          </div>
                          <Button
                            type="button"
                            variant={selectorEnabled ? "secondary" : "outline"}
                            onClick={() => setSelectorEnabled(true)}
                          >
                            <EditorIcon icon={CursorPointer02Icon} data-icon="inline-start" />
                            {selectorEnabled ? "Selector enabled" : "Enable selector"}
                          </Button>
                        </section>
                      ) : (
                        <>
                          <section className={`${styles.selectionCard} ${styles.targetHeader}`} aria-live="polite">
                            <div className={styles.selectionIcon}>
                              <EditorIcon icon={CursorPointer02Icon} />
                            </div>
                            <div className={styles.targetMeta}>
                              <div className={styles.targetKickerRow}>
                                <p className={styles.targetKicker}>
                                  {selections.length > 1 ? "Multiple elements" : selection.target.tag}
                                </p>
                                <Badge variant={selectedHasDraft ? "secondary" : "outline"}>
                                  {selectedHasDraft ? "Drafted" : "Clean"}
                                </Badge>
                              </div>
                              <p className={styles.targetLabel}>{selectionLabel}</p>
                              <p className={styles.targetSelector}>{selection.target.selector}</p>
                            </div>
                            <div className={styles.targetActions} aria-label="Selection actions">
                              <ToolbarButton
                                label="Reset selected"
                                disabled={!selectedHasDraft}
                                onClick={resetSelectedPreview}
                              >
                                <EditorIcon icon={RotateLeft01Icon} />
                              </ToolbarButton>
                              <ToolbarButton
                                label={hidden ? "Show element" : "Hide element"}
                                active={hidden}
                                disabled={deleted}
                                onClick={() => updateHidden(!hidden)}
                              >
                                <EditorIcon icon={hidden ? EyeOffIcon : EyeIcon} />
                              </ToolbarButton>
                              <ToolbarButton
                                label={deleted ? "Restore element" : "Delete element"}
                                active={deleted}
                                onClick={() => updateDeleted(!deleted)}
                              >
                                <EditorIcon icon={Delete02Icon} />
                              </ToolbarButton>
                            </div>
                          </section>

                          <Tabs value={inspectorTab} onValueChange={setInspectorTab} className={styles.inspectorTabs}>
                            <TabsList className={styles.inspectorTabsList}>
                              <TabsTrigger value="style">Style</TabsTrigger>
                              <TabsTrigger value="content">Content</TabsTrigger>
                              <TabsTrigger value="review">Review</TabsTrigger>
                            </TabsList>

                            <TabsContent value="style" className={styles.inspectorTabPanel}>
                              {visibleStyleGroups.map(({ group, fields }) => {
                                return (
                                  <InspectorSection
                                    key={group}
                                    icon={groupMeta[group].icon}
                                    title={groupMeta[group].label}
                                  >
                                    <FieldGroup className={group === "spacing" ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}>
                                      {fields.map((field) => (
                                        <StyleField
                                          config={field}
                                          key={field.property}
                                          disabled={false}
                                          value={styleValues[field.property] ?? ""}
                                          fontOptions={fontOptions}
                                          fontAccessState={fontAccessState}
                                          unitConversionDisabled={selections.length > 1}
                                          onLoadSystemFonts={loadSystemFonts}
                                          onPreviewStyle={previewStyle}
                                          onRestorePreview={restorePreview}
                                          onConvertUnit={convertSelectedUnit}
                                          onChange={(value, options) => updateStyle(field.property, value, options)}
                                        />
                                      ))}
                                    </FieldGroup>
                                  </InspectorSection>
                                );
                              })}
                              {advancedStyleFields.length > 0 ? (
                                <details className={styles.advancedStyleDisclosure}>
                                  <summary>
                                    <span>Advanced layout</span>
                                    <EditorIcon icon={ChevronDownIcon} aria-hidden="true" />
                                  </summary>
                                  <FieldGroup className={`${styles.advancedStyleGrid} grid grid-cols-2 gap-3`}>
                                    {advancedStyleFields.map((field) => (
                                      <StyleField
                                        config={field}
                                        key={field.property}
                                        disabled={false}
                                        value={styleValues[field.property] ?? ""}
                                        fontOptions={fontOptions}
                                        fontAccessState={fontAccessState}
                                        unitConversionDisabled={selections.length > 1}
                                        onLoadSystemFonts={loadSystemFonts}
                                        onPreviewStyle={previewStyle}
                                        onRestorePreview={restorePreview}
                                        onConvertUnit={convertSelectedUnit}
                                        onChange={(value, options) => updateStyle(field.property, value, options)}
                                      />
                                    ))}
                                  </FieldGroup>
                                </details>
                              ) : null}
                            </TabsContent>

                            <TabsContent value="content" className={styles.inspectorTabPanel}>
                              <InspectorSection icon={groupMeta.content.icon} title="Content">
                                <FieldGroup>
                                  {canEditTextContent ? (
                                    <Field>
                                      <FieldLabel htmlFor="editor-content-text" className="text-xs text-muted-foreground">Text</FieldLabel>
                                      <SmartTextarea
                                        id="editor-content-text"
                                        label="Selected text"
                                        disabled={false}
                                        value={textValue}
                                        placeholder="Edit selected text"
                                        onChange={updateText}
                                      />
                                    </Field>
                                  ) : null}
                                  {canEditImageContent ? (
                                    <Field>
                                      <FieldLabel htmlFor="editor-content-image-src" className="text-xs text-muted-foreground">Image src</FieldLabel>
                                      <AssetSourceInput
                                        id="editor-content-image-src"
                                        disabled={false}
                                        value={imageValue}
                                        onChange={updateImage}
                                      />
                                    </Field>
                                  ) : null}
                                  {!canEditTextContent && !canEditImageContent ? (
                                    <p className={styles.contentEmptyState}>No editable text or image source for this selection.</p>
                                  ) : null}
                                </FieldGroup>
                              </InspectorSection>
                            </TabsContent>

                            <TabsContent value="review" className={styles.inspectorTabPanel}>
                              <section className={styles.reviewPanel}>
                                <FieldGroup>
                                  <Field data-disabled={selections.length > 1 ? true : undefined}>
                                    <FieldLabel htmlFor="editor-handoff-note" className="text-xs text-muted-foreground">Handoff note</FieldLabel>
                                    <SmartTextarea
                                      id="editor-handoff-note"
                                      label="Handoff note"
                                      disabled={selections.length > 1}
                                      value={notes}
                                      placeholder={selections.length > 1 ? "Notes are single-selection only" : "Add reviewer context for this target"}
                                      onChange={updateNotes}
                                    />
                                  </Field>
                                </FieldGroup>

                                <div className={styles.reviewActions}>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={patches.length === 0}
                                    onClick={copyStyles}
                                  >
                                    <EditorIcon icon={copyState === "copied" ? CopyCheckIcon : ClipboardIcon} data-icon="inline-start" />
                                    {copyState === "copied" ? "Copied handoff" : "Copy handoff"}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={patches.length === 0 || sourceApplyState === "applying" || overrideApplyState === "applying"}
                                    onClick={applyPatchesToSource}
                                  >
                                    <EditorIcon icon={sourceApplyState === "applied" ? CopyCheckIcon : File01Icon} data-icon="inline-start" />
                                    {sourceApplyState === "applying" ? "Applying..." : sourceApplyState === "applied" ? "Applied source" : "Apply source"}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={patches.length === 0 || sourceApplyState === "applying" || overrideApplyState === "applying"}
                                    onClick={applyPatchOverrides}
                                  >
                                    <EditorIcon icon={overrideApplyState === "applied" ? CopyCheckIcon : File01Icon} data-icon="inline-start" />
                                    {overrideApplyState === "applying" ? "Writing..." : overrideApplyState === "applied" ? "Wrote CSS" : "CSS patch"}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={patches.length === 0}
                                    onClick={resetAllPreviews}
                                  >
                                    <EditorIcon icon={RotateLeft01Icon} data-icon="inline-start" />
                                    Reset all
                                  </Button>
                                </div>

                                <section className={styles.reviewDrafts}>
                                  <div className={styles.reviewDraftsHeader}>
                                    <div>
                                      <h3>Draft patches</h3>
                                      <p>{patches.length === 0 ? "No changes staged for handoff." : `${patches.length} target${patches.length === 1 ? "" : "s"} ready to review.`}</p>
                                    </div>
                                    <div className={styles.reviewDraftsControls}>
                                      <Badge variant={patches.length > 0 ? "secondary" : "outline"}>{patches.length}</Badge>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={patches.length === 0}
                                        onClick={toggleAllPatchesExpanded}
                                      >
                                        {patches.length > 0 && patches.every((patch) => expandedPatchIds.has(patch.id)) ? "Collapse all" : "Expand all"}
                                      </Button>
                                    </div>
                                  </div>

                                  {patches.length === 0 ? (
                                    <div className={styles.reviewEmptyState}>
                                      <div className={styles.emptyStateIcon}>
                                        <EditorIcon icon={File01Icon} />
                                      </div>
                                      <p>Style or content edits will appear here as draft patches.</p>
                                    </div>
                                  ) : (
                                    <div className={styles.patchList}>
                                      {patches.map((patch) => {
                                        const expanded = expandedPatchIds.has(patch.id);
                                        const formattedChanges = patch.changes.map(formatPatchChange);
                                        const detailsId = `patch-details-${patch.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
                                        return (
                                          <div
                                            className={styles.patchRow}
                                            data-expanded={expanded ? true : undefined}
                                            data-patch-row=""
                                            key={patch.id}
                                            tabIndex={0}
                                            aria-expanded={expanded}
                                            aria-controls={detailsId}
                                            onClick={() => togglePatchExpanded(patch.id)}
                                            onKeyDown={(event) => {
                                              if (event.key !== "Enter" && event.key !== " ") return;
                                              event.preventDefault();
                                              togglePatchExpanded(patch.id);
                                            }}
                                          >
                                            <div className={styles.patchRowTop}>
                                              <div className={styles.patchChevron} aria-hidden="true">
                                                <EditorIcon icon={ChevronDownIcon} />
                                              </div>
                                              <div className={styles.patchMeta}>
                                                <div className={styles.patchTitleRow}>
                                                  <p className="truncate text-sm font-medium">{patch.target.tag}</p>
                                                  <span className={styles.patchSummary}>{summarizePatchChanges(patch.changes)}</span>
                                                </div>
                                                <p className={styles.patchSelector}>{patch.target.selector}</p>
                                              </div>
                                              <div className={styles.patchActions}>
                                                <Badge variant="outline">{patch.changes.length} changes</Badge>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  className={styles.patchDeleteButton}
                                                  aria-label={`Delete draft patch for ${patch.target.tag}`}
                                                  onClick={(event) => {
                                                    event.stopPropagation();
                                                    deletePatch(patch);
                                                  }}
                                                >
                                                  <EditorIcon icon={Delete02Icon} />
                                                </Button>
                                              </div>
                                            </div>
                                            {expanded ? (
                                              <div className={styles.patchDetails} id={detailsId}>
                                                {formattedChanges.length === 0 ? (
                                                  <p className={styles.patchDetailEmpty}>No style/content changes; note only.</p>
                                                ) : (
                                                  formattedChanges.map((change, index) => (
                                                    <div className={styles.patchDetailRow} key={`${change.label}-${index}`}>
                                                      <div className={styles.patchDetailHeading}>
                                                        <span>{change.label}</span>
                                                        <Badge variant="outline">{change.meta}</Badge>
                                                      </div>
                                                      <div className={styles.patchDetailValues}>
                                                        <code title={change.before}>{change.before}</code>
                                                        <span aria-hidden="true">-&gt;</span>
                                                        <code title={change.after}>{change.after}</code>
                                                      </div>
                                                    </div>
                                                  ))
                                                )}
                                                {patch.notes.trim() ? (
                                                  <div className={styles.patchDetailRow}>
                                                    <div className={styles.patchDetailHeading}>
                                                      <span>Note</span>
                                                      <Badge variant="outline">handoff</Badge>
                                                    </div>
                                                    <p className={styles.patchDetailNote}>{truncatePatchValue(patch.notes, 140)}</p>
                                                  </div>
                                                ) : null}
                                              </div>
                                            ) : null}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </section>
                              </section>
                            </TabsContent>
                          </Tabs>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </aside>
              </ResizablePanel>
            </>
          ) : null}
        </ResizablePanelGroup>

        <Sheet open={routesOpen} onOpenChange={setRoutesOpen}>
          <SheetContent
            side="left"
            className={`${styles.editorOverlay} w-[min(440px,calc(100vw-24px))] gap-0 p-0`}
            showCloseButton
          >
            <SheetHeader>
              <SheetTitle>Routes</SheetTitle>
              <SheetDescription>Switch the preview without leaving the editor.</SheetDescription>
            </SheetHeader>
            <Command className="rounded-none border-t">
              <CommandInput placeholder="Search routes..." />
              <CommandList>
                <CommandEmpty>No routes found.</CommandEmpty>
                {currentRoute?.collection && collectionRoutes.length > 1 ? (
                  <>
                    <CommandGroup heading={`${currentRoute.collection.label} pages`}>
                      {collectionRoutes.map((candidate) => (
                        <CommandItem
                          key={`collection-${candidate.path}`}
                          value={`${collectionItemLabel(candidate)} ${candidate.path}`}
                          data-checked={candidate.path === route}
                          onSelect={() => {
                            setRouteAndUrl(candidate.path);
                            setRoutesOpen(false);
                          }}
                        >
                          <span className="truncate">{collectionItemLabel(candidate)}</span>
                          {candidate.path === route ? <Badge variant="secondary">Current</Badge> : null}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    <CommandSeparator />
                  </>
                ) : null}
                <CommandGroup heading="Available routes">
                  {routeOptions.map((candidate) => (
                    <CommandItem
                      key={candidate.path}
                      value={shortRouteLabel(candidate)}
                      data-checked={candidate.path === route}
                      onSelect={() => {
                        setRouteAndUrl(candidate.path);
                        setRoutesOpen(false);
                      }}
                    >
                      <span className="truncate">{shortRouteLabel(candidate)}</span>
                      {candidate.path === route ? <Badge variant="secondary">Current</Badge> : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </SheetContent>
        </Sheet>

        <Toaster richColors position="bottom-right" />
      </div>
    </TooltipProvider>
  );
}
