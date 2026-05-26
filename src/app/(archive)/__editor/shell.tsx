"use client";

import {
  Box,
  ChevronDown,
  Clipboard,
  CopyCheck,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Layers,
  Maximize2,
  Minimize2,
  Monitor,
  MoveHorizontal,
  MoveVertical,
  MousePointer2,
  PanelRightClose,
  PanelRightOpen,
  PaintBucket,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  Undo2,
  type LucideIcon,
  Redo2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type StyleValueChangeOptions = {
  undo?: "push" | "skip";
  commit?: "preview" | "commit" | "cancel";
  transactionId?: string;
};

type StyleValueChange = (value: string, options?: StyleValueChangeOptions) => void;
type EditorValueChange = (value: string, options?: StyleValueChangeOptions) => void;

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

const viewportSizes: Record<ViewportName, { width: number; icon: LucideIcon; label: string }> = {
  desktop: { width: 1440, icon: Monitor, label: "Desktop" },
  tablet: { width: 834, icon: Tablet, label: "Tablet" },
  mobile: { width: 390, icon: Smartphone, label: "Mobile" },
};

const lengthUnits = ["px", "%", "rem", "em", "vw", "vh", "vmin", "vmax", "ch"];
const textLengthUnits = ["px", "rem", "em", "%", "vw", "vh"];
const lineHeightUnits = ["", "px", "rem", "em", "%"];
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
    { property: "width", label: "Width", placeholder: "100%", unit: "px", units: lengthUnits },
    { property: "maxWidth", label: "Max width", placeholder: "720px", unit: "px", units: lengthUnits },
    { property: "height", label: "Height", placeholder: "auto", unit: "px", units: lengthUnits },
    { property: "gap", label: "Gap", placeholder: "16px", unit: "px", units: lengthUnits },
    { property: "alignItems", label: "Align", options: ["stretch", "flex-start", "center", "flex-end", "baseline"] },
    { property: "justifyContent", label: "Justify", options: ["flex-start", "center", "flex-end", "space-between", "space-around"] },
  ],
  spacing: [
    { property: "margin", label: "Margin", placeholder: "0px", unit: "px", units: lengthUnits },
    { property: "padding", label: "Padding", placeholder: "0px", unit: "px", units: lengthUnits },
  ],
  typography: [
    { property: "fontFamily", label: "Font", placeholder: "System font" },
    { property: "fontSize", label: "Size", placeholder: "16px", unit: "px", units: textLengthUnits },
    { property: "lineHeight", label: "Line height", placeholder: "1.4", unit: "", units: lineHeightUnits, step: 0.05, min: 0 },
    { property: "letterSpacing", label: "Tracking", placeholder: "0px", unit: "px", units: textLengthUnits, step: 0.1 },
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

const groupMeta: Record<FieldGroupName | "content", { label: string; icon: LucideIcon }> = {
  layout: { label: "Layout", icon: Box },
  spacing: { label: "Space", icon: SlidersHorizontal },
  typography: { label: "Type", icon: Type },
  appearance: { label: "Paint", icon: PaintBucket },
  content: { label: "Asset", icon: ImageIcon },
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

function previewSourceLabel(iframeSrc: string) {
  if (iframeSrc.startsWith("/__mirror")) {
    return {
      label: "Mirror fallback",
      variant: "outline" as const,
      path: iframeSrc.replace(/^\/__mirror/, "") || "/",
    };
  }

  const path = iframeSrc.split("?")[0] || "/";
  return {
    label: "Native route",
    variant: "secondary" as const,
    path,
  };
}

function shortRouteLabel(route: MirrorRoute) {
  return route.label === route.path ? route.path : `${route.label} (${route.path})`;
}

function collectionItemLabel(route: MirrorRoute) {
  return route.collection?.itemLabel || route.label || route.path;
}

const numericCssPattern = /^\s*(-?(?:\d+|\d*\.\d+))(?:\s*([a-z%]+))?\s*$/i;
const unitlessSelectValue = "__unitless__";

function parseNumericCssValue(value: string) {
  const match = value.match(numericCssPattern);
  if (!match) return null;
  const numberText = match[1];
  const numberValue = Number(numberText);
  if (!Number.isFinite(numberValue)) return null;
  return {
    numberText,
    numberValue,
    unit: match[2] ?? "",
  };
}

function clampNumber(value: number, min?: number, max?: number) {
  if (typeof min === "number" && value < min) return min;
  if (typeof max === "number" && value > max) return max;
  return value;
}

function formatCssNumber(value: number) {
  return Number(value.toFixed(2)).toString();
}

function unitLabel(unit: string) {
  return unit || "unitless";
}

function normalizeCssUnit(unit: string, supportedUnits: string[]) {
  const normalized = unit.toLowerCase();
  if (supportedUnits.includes(normalized)) return normalized;
  return null;
}

function cssNumericValue(numberValue: number, unit: string) {
  return `${formatCssNumber(numberValue)}${unit}`;
}

function toCssPropertyName(property: string) {
  return property.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase());
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

function colorInputText(value: string) {
  return cssColorToHex(value) ?? value;
}

function isValidCssDeclaration(property: string, value: string) {
  if (!value.trim()) return true;
  if (typeof window === "undefined" || !window.CSS?.supports) return true;
  return window.CSS.supports(toCssPropertyName(property), value.trim());
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

function expandCssBoxValue(value: string) {
  const parts = splitCssBoxValue(value);
  if (parts.length === 0 || parts.length > 4) return null;
  if (parts.some((part) => !parseNumericCssValue(part))) return null;

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
  const canUseNumericControl = typeof config.unit === "string" && (!value || Boolean(parseNumericCssValue(value)));
  const canUseBoxControl =
    (config.property === "margin" || config.property === "padding") &&
    typeof config.unit === "string" &&
    (!value || Boolean(expandCssBoxValue(value)));

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
  disabled,
  onChange,
}: {
  id: string;
  property: string;
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  onChange: StyleValueChange;
}) {
  const transactionIdRef = useRef(`css:${id}`);
  const [draftValue, setDraftValue] = useState(value);
  const invalid = Boolean(draftValue.trim()) && !isValidCssDeclaration(property, draftValue);
  const presets = ["unset", "inherit", "initial", "auto"];

  useEffect(() => {
    // Keep the local draft input in sync when selection changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <ChevronDown className="size-3.5" />
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
  const transactionIdRef = useRef(`color:${id}`);
  const [open, setOpen] = useState(false);
  const [draftValue, setDraftValue] = useState(colorInputText(value));
  const pickerValue = cssColorToHex(value) ?? cssColorToHex(placeholder) ?? "#000000";
  const swatchColor = value && isValidCssColor(value) ? value : "transparent";
  const invalid = Boolean(draftValue.trim()) && !isValidCssColor(draftValue);

  useEffect(() => {
    // Keep the local draft input in sync when selection changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftValue(colorInputText(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;

    function closeIfOutside(event: PointerEvent | FocusEvent) {
      const root = colorControlRef.current;
      const target = event.target instanceof Node ? event.target : null;
      if (!root || !target || root.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", closeIfOutside, true);
    document.addEventListener("focusin", closeIfOutside, true);
    return () => {
      document.removeEventListener("pointerdown", closeIfOutside, true);
      document.removeEventListener("focusin", closeIfOutside, true);
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
      {open ? (
        <div className={styles.colorPopover}>
          <div className={styles.colorPickerRow}>
            <input
              type="color"
              className={styles.nativeColorPicker}
              disabled={disabled}
              value={pickerValue}
              aria-label={`${label} color`}
              onChange={(event) => commitPickerColor(event.target.value)}
            />
            <div className={styles.colorPickerMeta}>
              <span>{label}</span>
              <span>{pickerValue}</span>
            </div>
          </div>
          <div className={styles.colorPresetGrid} aria-label={`${label} color presets`}>
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
        </div>
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
  step: number;
  min?: number;
  max?: number;
  disabled: boolean;
  unitConversionDisabled: boolean;
  onConvertUnit?: (conversion: NumericUnitConversion) => string | null;
  onChange: StyleValueChange;
}) {
  const [expanded, setExpanded] = useState(false);
  const expandedValue = expandCssBoxValue(value) ?? ["", "", "", ""];
  const expandedPlaceholder = expandCssBoxValue(placeholder) ?? [placeholder, placeholder, placeholder, placeholder];
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
            step={step}
            min={min}
            max={max}
            leadingIcon={<MoveHorizontal aria-hidden="true" />}
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
            step={step}
            min={min}
            max={max}
            leadingIcon={<MoveVertical aria-hidden="true" />}
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
          {expanded ? <Minimize2 /> : <Maximize2 />}
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
  const unit = parsedValue?.unit ?? parsedPlaceholder?.unit ?? defaultUnit;
  const displayNumber = focused || dragging ? draftNumber : parsedValue?.numberText ?? "";
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
  const draftHasUnsupportedUnit = Boolean(parsedDraft?.unit && normalizeCssUnit(parsedDraft.unit, supportedUnits) === null);
  const invalid = Boolean(draftNumber.trim()) && (!parsedDraft || draftHasUnsupportedUnit);

  useEffect(() => {
    if (!focused && !dragging) {
      // Keep the local draft input in sync when selection changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftNumber(parsedValue?.numberText ?? "");
    }
  }, [dragging, focused, parsedValue?.numberText]);

  function commitNumber(nextValue: number, nextUnit = unit, options?: StyleValueChangeOptions) {
    const clamped = clampNumber(nextValue, min, max);
    const nextText = formatCssNumber(clamped);
    setDraftNumber(nextText);
    onChange(`${nextText}${nextUnit}`, options);
    return `${nextText}${nextUnit}`;
  }

  function updateByStep(direction: 1 | -1, multiplier = 1) {
    const baseValue = Number(draftNumber || parsedValue?.numberText || 0);
    commitNumber(baseValue + direction * step * multiplier, unit, {
      commit: "preview",
      transactionId: transactionIdRef.current,
    });
  }

  function commitParsedInput(
    parsed: NonNullable<ReturnType<typeof parseNumericCssValue>>,
    mode: StyleValueChangeOptions["commit"] = "preview",
  ) {
    const typedUnit = parsed.unit ? normalizeCssUnit(parsed.unit, supportedUnits) : unit;
    if (parsed.unit && typedUnit === null) {
      setDraftNumber(`${parsed.numberText}${parsed.unit}`);
      return;
    }

    const clamped = clampNumber(parsed.numberValue, min, max);
    const nextNumberText = formatCssNumber(clamped);
    setDraftNumber(nextNumberText);
    onChange(`${nextNumberText}${typedUnit}`, {
      commit: mode,
      transactionId: transactionIdRef.current,
    });
  }

  function handleInputChange(nextValue: string) {
    skipNextBlurCommitRef.current = false;
    const parsedInput = parseNumericCssValue(nextValue);

    if (parsedInput) {
      commitParsedInput(parsedInput);
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

    const baseValue = Number(draftNumber || parsedValue?.numberText || parsedPlaceholder?.numberText || 0);
    const convertedValue = Number.isFinite(baseValue)
      ? onConvertUnit?.({
          property,
          value: cssNumericValue(baseValue, unit),
          nextUnit: selectedUnit,
        })
      : null;

    const parsedConvertedValue = convertedValue ? parseNumericCssValue(convertedValue) : null;
    if (parsedConvertedValue) {
      const clamped = clampNumber(parsedConvertedValue.numberValue, min, max);
      const nextNumberText = formatCssNumber(clamped);
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
    setDraftNumber(parsedValue?.numberText ?? "");
    window.requestAnimationFrame(() => input.select());
  }

  function handleBlur() {
    setFocused(false);
    if (skipNextBlurCommitRef.current) {
      skipNextBlurCommitRef.current = false;
      setDraftNumber(parsedValue?.numberText ?? draftNumber);
      return;
    }
    if (!draftNumber.trim()) {
      onChange("", {
        commit: "commit",
        transactionId: transactionIdRef.current,
      });
      return;
    }
    const parsedDraft = parseNumericCssValue(draftNumber);
    const unsupportedUnit = Boolean(parsedDraft?.unit && normalizeCssUnit(parsedDraft.unit, supportedUnits) === null);
    if (parsedDraft) {
      if (unsupportedUnit) {
        onChange(value, {
          commit: "cancel",
          transactionId: transactionIdRef.current,
        });
        setDraftNumber(parsedValue?.numberText ?? "");
        return;
      }
      commitParsedInput(parsedDraft, "commit");
      return;
    }
    onChange(value, {
      commit: "cancel",
      transactionId: transactionIdRef.current,
    });
    setDraftNumber(parsedValue?.numberText ?? "");
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("input, button, select, option")) return;

    skipNextBlurCommitRef.current = false;
    const startValue = Number(draftNumber || parsedValue?.numberText || 0);
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
    drag.lastValue = commitNumber(drag.startValue + steps * step * multiplier, unit, {
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
        inputMode="decimal"
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
            setDraftNumber(parsedValue?.numberText ?? "");
            event.currentTarget.blur();
            return;
          }
          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
          event.preventDefault();
          updateByStep(event.key === "ArrowUp" ? 1 : -1, event.shiftKey ? 10 : event.altKey ? 0.1 : 1);
        }}
        onChange={(event) => handleInputChange(event.target.value)}
      />
      <InputGroupAddon align="inline-end" className={styles.numericValueAddon}>
        {supportedUnits.length > 1 ? (
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
                {unitLabel(supportedUnit)}
              </option>
            ))}
          </select>
        ) : unit ? (
          <InputGroupText className={styles.numericUnit}>{unit}</InputGroupText>
        ) : null}
      </InputGroupAddon>
      </InputGroup>
      {invalid ? (
        <span className={styles.fieldError} id={`${id}-error`}>
          Use a number with {supportedUnits.map(unitLabel).join(", ")}
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
  const selectedValue = value || "__unset__";

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
    /* eslint-disable react-hooks/set-state-in-effect */
    setDraftValue(value);
    setPreviewFailed(false);
    /* eslint-enable react-hooks/set-state-in-effect */
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
          <ImageIcon />
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
            <Eye />
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
            <RotateCcw />
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
          variant={active ? "default" : "outline"}
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
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.inspectorSection}>
      <div className={styles.inspectorSectionHeader}>
        <div className={styles.inspectorSectionIcon} aria-hidden="true">
          <Icon />
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
  const [undoStack, setUndoStack] = useState<EditorHistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<EditorHistorySnapshot[]>([]);
  const [expandedPatchIds, setExpandedPatchIds] = useState<Set<string>>(() => new Set());
  const [systemFontFamilies, setSystemFontFamilies] = useState<string[]>([]);
  const [fontAccessState, setFontAccessState] = useState<FontAccessState>("idle");
  const fieldTransactionSnapshotsRef = useRef<Map<string, EditorHistorySnapshot>>(new Map());

  const iframeSrc = useMemo(() => canvasPath(route), [route]);
  const viewportWidth = viewportSizes[viewport].width;
  const previewSource = useMemo(() => previewSourceLabel(iframeSrc), [iframeSrc]);
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
  const currentCollectionIndex = collectionRoutes.findIndex((candidate) => candidate.path === route);

  function snapshotEditorState(): EditorHistorySnapshot {
    return {
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
    setPatches(snapshot.patches);
    persistPatches(snapshot.patches);
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
      setPatches(readDrafts(route));
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

      const nextSelections = message.selections?.length ? message.selections : [message.selection];
      const primarySelection = nextSelections[0];
      const nextBaseStyles = commonComputedStyles(nextSelections);
      const selectedPatches = nextSelections
        .map((candidate) => patches.find((patch) => sameTarget(patch.target, candidate.target)))
        .filter(Boolean);
      setSidebarOpen(true);
      setSelection(primarySelection);
      setSelections(nextSelections);
      setBaseStyles(nextBaseStyles);
      setStyleValues(nextBaseStyles);
      setTextValue(nextSelections.length === 1 ? primarySelection.text : "");
      setImageValue(nextSelections.length === 1 ? primarySelection.imageSrc : "");

      setHidden(nextSelections.length > 0 && selectedPatches.length === nextSelections.length && selectedPatches.every((patch) => elementActionValue(patch, "hide")));
      setDeleted(nextSelections.length > 0 && selectedPatches.length === nextSelections.length && selectedPatches.every((patch) => elementActionValue(patch, "delete")));
      setNotes(nextSelections.length === 1 ? selectedPatches[0]?.notes ?? "" : "");
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Preview iframe undo/redo messages intentionally read the current editor state listed below.
  }, [patches, undoStack, redoStack, selection, selections, baseStyles, styleValues, textValue, imageValue, hidden, deleted, notes]);

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

  function postPreviewPatch(nextStyleValues = styleValues, forcedStyles: Record<string, string> = {}) {
    if (selections.length === 0) return;

    for (const selected of selections) {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: "editor:apply-preview",
          patch: {
            target: selected.target,
            styles: previewStylesPayload(nextStyleValues, forcedStyles),
            text: selections.length === 1 && textValue !== selected.text ? textValue : undefined,
            imageSrc: selections.length === 1 && imageValue !== selected.imageSrc ? imageValue : undefined,
            hidden,
            deleted,
          },
        },
        window.location.origin,
      );
    }
  }

  function previewStyle(property: string, value: string) {
    postPreviewPatch(styleValues, { [property]: value });
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
    fieldTransactionSnapshotsRef.current.clear();
    setRoute(normalized);
    setPatches(readDrafts(normalized));
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
      persistPatches(nextPatches);
      return nextPatches;
    });
  }

  function changesForDraft({
    nextStyleValues = styleValues,
    nextTextValue = textValue,
    nextImageValue = imageValue,
    nextHidden = hidden,
    nextDeleted = deleted,
    nextNotes = notes,
    nextViewport = viewport,
  }: {
    nextStyleValues?: Record<string, string>;
    nextTextValue?: string;
    nextImageValue?: string;
    nextHidden?: boolean;
    nextDeleted?: boolean;
    nextNotes?: string;
    nextViewport?: ViewportName;
  }) {
    if (selections.length === 0) return null;

    const changedProperties = changedStyleProperties(baseStyles, nextStyleValues);

    return selections.map((selected) => {
      const changes: EditorChange[] = [
        ...changedProperties.map<StyleChange>((property) => ({
          kind: "style",
          property,
          before: selected.computedStyles[property] ?? "",
          after: nextStyleValues[property] ?? "",
          viewport: nextViewport,
        })),
        ...(selections.length === 1 && nextTextValue !== selected.text
          ? [
              {
                kind: "content",
                field: "text",
                before: selected.text,
                after: nextTextValue,
              } satisfies ContentChange,
            ]
          : []),
        ...(selections.length === 1 && nextImageValue !== selected.imageSrc
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
        notes: selections.length === 1 ? nextNotes : "",
        target: selected.target,
      };
    });
  }

  function commitDraft(overrides: Parameters<typeof changesForDraft>[0] = {}) {
    const drafts = changesForDraft(overrides);
    if (!drafts) return;

    updatePatches((current) => {
      let nextPatches = current;

      for (const draft of drafts) {
        if (draft.changes.length === 0 && !draft.notes.trim()) {
          nextPatches = nextPatches.filter((patch) => !sameTarget(patch.target, draft.target));
          continue;
        }

        const existing = nextPatches.find((patch) => sameTarget(patch.target, draft.target));
        nextPatches = upsertPatch(nextPatches, {
          id: existing?.id ?? `${draft.target.route}:${draft.target.selector}`,
          route,
          target: draft.target,
          changes: draft.changes,
          notes: draft.notes,
          timestamp: new Date().toISOString(),
        });
      }

      return nextPatches;
    });
  }

  function setViewportAndCommit(nextViewport: ViewportName) {
    setViewport(nextViewport);
  }

  function updateStyle(property: string, value: string, options?: StyleValueChangeOptions) {
    const nextStyleValues = { ...styleValues, [property]: value };
    const mode = options?.commit ?? "commit";

    if (mode === "cancel") {
      cancelFieldTransaction(options?.transactionId);
      return;
    }

    if (styleValues[property] === value && mode !== "commit") return;

    if (mode === "preview") {
      beginFieldTransaction(options?.transactionId);
      if (styleValues[property] !== value) setStyleValues(nextStyleValues);
      return;
    }

    const transactionCommitted = commitFieldTransaction(options?.transactionId);
    if (!transactionCommitted && options?.undo !== "skip" && styleValues[property] !== value) pushUndoSnapshot();
    setStyleValues(nextStyleValues);
    commitDraft({ nextStyleValues });
  }

  function updateText(value: string, options?: StyleValueChangeOptions) {
    const mode = options?.commit ?? "commit";

    if (mode === "cancel") {
      cancelFieldTransaction(options?.transactionId);
      return;
    }

    if (textValue === value && mode !== "commit") return;

    if (mode === "preview") {
      beginFieldTransaction(options?.transactionId);
      if (textValue !== value) setTextValue(value);
      return;
    }

    const transactionCommitted = commitFieldTransaction(options?.transactionId);
    if (!transactionCommitted && options?.undo !== "skip" && textValue !== value) pushUndoSnapshot();
    setTextValue(value);
    commitDraft({ nextTextValue: value });
  }

  function updateImage(value: string, options?: StyleValueChangeOptions) {
    const mode = options?.commit ?? "commit";

    if (mode === "cancel") {
      cancelFieldTransaction(options?.transactionId);
      return;
    }

    if (imageValue === value && mode !== "commit") return;

    if (mode === "preview") {
      beginFieldTransaction(options?.transactionId);
      if (imageValue !== value) setImageValue(value);
      return;
    }

    const transactionCommitted = commitFieldTransaction(options?.transactionId);
    if (!transactionCommitted && options?.undo !== "skip" && imageValue !== value) pushUndoSnapshot();
    setImageValue(value);
    commitDraft({ nextImageValue: value });
  }

  function updateHidden(value: boolean) {
    if (hidden === value) return;
    pushUndoSnapshot();
    setHidden(value);
    commitDraft({ nextHidden: value });
  }

  function updateDeleted(value: boolean) {
    if (deleted === value) return;
    pushUndoSnapshot();
    setDeleted(value);
    commitDraft({ nextDeleted: value });
  }

  function updateNotes(value: string, options?: StyleValueChangeOptions) {
    const mode = options?.commit ?? "commit";

    if (mode === "cancel") {
      cancelFieldTransaction(options?.transactionId);
      return;
    }

    if (notes === value && mode !== "commit") return;

    if (mode === "preview") {
      beginFieldTransaction(options?.transactionId);
      if (notes !== value) setNotes(value);
      return;
    }

    const transactionCommitted = commitFieldTransaction(options?.transactionId);
    if (!transactionCommitted && options?.undo !== "skip" && notes !== value) pushUndoSnapshot();
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
    setStyleValues(baseStyles);
    setTextValue(selections.length === 1 ? selections[0].text : "");
    setImageValue(selections.length === 1 ? selections[0].imageSrc : "");
    setHidden(false);
    setDeleted(false);
    updatePatches((current) => current.filter((patch) => !selections.some((selected) => sameTarget(patch.target, selected.target))));
    toast.success("Selection reset");
  }

  function resetAllPreviews() {
    if (patches.length === 0) {
      toast.info("No draft changes to reset");
      return;
    }

    pushUndoSnapshot();
    setPatches([]);
    persistPatches([]);
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
    toast.success("All draft changes reset");
  }

  function deletePatch(patch: EditorPatch) {
    pushUndoSnapshot();

    const nextPatches = patches.filter((candidate) => !sameTarget(candidate.target, patch.target));
    setPatches(nextPatches);
    setExpandedPatchIds((current) => {
      const next = new Set(current);
      next.delete(patch.id);
      return next;
    });
    persistPatches(nextPatches);
    iframeRef.current?.contentWindow?.postMessage(
      { type: "editor:clear-preview", target: patch.target },
      window.location.origin,
    );
    reapplyPreviewPatches(nextPatches);

    if (sameTarget(selection?.target, patch.target)) {
      setStyleValues(baseStyles);
      setTextValue(selection?.text ?? "");
      setImageValue(selection?.imageSrc ?? "");
      setHidden(false);
      setDeleted(false);
      setNotes("");
    }

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

  return (
    <TooltipProvider>
      <div className={styles.editor} data-visual-editor-shell="">
        <header className={styles.topbar}>
          <div className={styles.brandMark}>
            <Layers className="size-4" />
            <span>Ripe Visual Editor</span>
          </div>

          <div className={styles.routeCluster}>
            <Select value={route} onValueChange={setRouteAndUrl}>
              <SelectTrigger className="min-w-[260px] max-w-[420px]" aria-label="Route">
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
              <Search data-icon="inline-start" />
              <span className={styles.routeSearchLabel}>Routes</span>
            </Button>
          </div>

          <div className={styles.statusCluster}>
            <Badge variant={previewSource.variant}>{previewSource.label}</Badge>
            <Badge variant="outline">{previewSource.path}</Badge>
            <Badge variant="outline">{viewportSizes[viewport].label}</Badge>
            {currentRoute?.collection && collectionRoutes.length > 1 ? (
              <div className={styles.collectionSwitcher}>
                <Badge variant="secondary" className={styles.collectionBadge}>
                  {currentRoute.collection.label}
                </Badge>
                <Select value={route} onValueChange={setRouteAndUrl}>
                  <SelectTrigger
                    className={styles.collectionSelectTrigger}
                    size="sm"
                    aria-label={`Switch ${currentRoute.collection.label} page`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {collectionRoutes.map((candidate) => (
                        <SelectItem value={candidate.path} key={candidate.path}>
                          {collectionItemLabel(candidate)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Badge variant="outline" className={styles.collectionCount}>
                  {currentCollectionIndex + 1}/{collectionRoutes.length}
                </Badge>
              </div>
            ) : null}
          </div>

          <div className={styles.toolbarActions}>
            <ToolbarButton
              label="Undo"
              disabled={undoStack.length === 0}
              onClick={undoEditorChange}
            >
              <Undo2 />
            </ToolbarButton>
            <ToolbarButton
              label="Redo"
              disabled={redoStack.length === 0}
              onClick={redoEditorChange}
            >
              <Redo2 />
            </ToolbarButton>

            <ToolbarButton
              label={selectorEnabled ? "Disable element selector" : "Enable element selector"}
              active={selectorEnabled}
              onClick={() => setSelectorEnabled((enabled) => !enabled)}
            >
              <MousePointer2 />
            </ToolbarButton>

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
                const Icon = viewportSizes[name].icon;
                return (
                  <Tooltip key={name}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem value={name} aria-label={viewportSizes[name].label}>
                        <Icon />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={8}>{viewportSizes[name].label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </ToggleGroup>

            <ToolbarButton
              label={sidebarOpen ? "Close inspector" : "Open inspector"}
              active={sidebarOpen}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <PanelRightClose /> : <PanelRightOpen />}
            </ToolbarButton>
          </div>
        </header>

        <ResizablePanelGroup orientation="horizontal" className={styles.workspace}>
          <ResizablePanel minSize="280px" className={styles.previewPanel}>
            <main className={styles.stage}>
              <div className={styles.canvasChrome} style={{ width: `min(100%, ${viewportWidth}px)` }}>
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
                defaultSize="360px"
                minSize="300px"
                maxSize="520px"
                groupResizeBehavior="preserve-pixel-size"
              >
                <aside className={styles.inspector} aria-label="Visual editor inspector">
                  <div className={styles.inspectorHeader}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-muted-foreground" />
                        <h2 className="truncate text-sm font-medium">Visual edits</h2>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {route} · {patches.length} drafted
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ToolbarButton label="Reset all changes" disabled={patches.length === 0} onClick={resetAllPreviews}>
                        <RotateCcw />
                      </ToolbarButton>
                      <ToolbarButton label="Reset selected" disabled={!selection} onClick={resetSelectedPreview}>
                        <RotateCcw />
                      </ToolbarButton>
                      <ToolbarButton
                        label="Copy handoff"
                        disabled={patches.length === 0}
                        onClick={copyStyles}
                        active={copyState === "copied"}
                      >
                        {copyState === "copied" ? <CopyCheck /> : <Clipboard />}
                      </ToolbarButton>
                    </div>
                  </div>
                  <Separator />

                  <ScrollArea className={styles.inspectorScroll}>
                    <div className={styles.inspectorBody}>
                      <section className={styles.selectionCard} aria-live="polite">
                        <div className={styles.selectionIcon}>
                          <MousePointer2 className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            {selection ? selections.length > 1 ? "Multiple elements" : selection.target.tag : "No element selected"}
                          </p>
                          <p className="mt-1 truncate text-sm font-medium">{selectionLabel}</p>
                        </div>
                      </section>

                      <section className={styles.elementActions} aria-label="Element actions">
                        <Button
                          type="button"
                          variant={hidden ? "secondary" : "outline"}
                          disabled={!selection || deleted}
                          onClick={() => updateHidden(!hidden)}
                        >
                          {hidden ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
                          {hidden ? "Show element" : "Hide element"}
                        </Button>
                        <Button
                          type="button"
                          variant={deleted ? "secondary" : "outline"}
                          disabled={!selection}
                          onClick={() => updateDeleted(!deleted)}
                        >
                          <Trash2 data-icon="inline-start" />
                          {deleted ? "Restore element" : "Delete element"}
                        </Button>
                      </section>

                      {(Object.keys(fieldGroups) as FieldGroupName[]).map((group) => {
                        const visibleFields = fieldGroups[group].filter((field) => fieldVisibleForSelections(field, selections));
                        if (visibleFields.length === 0) return null;

                        return (
                          <InspectorSection
                            key={group}
                            icon={groupMeta[group].icon}
                            title={groupMeta[group].label}
                          >
                            <FieldGroup className={group === "spacing" ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}>
                              {visibleFields.map((field) => (
                                <StyleField
                                  config={field}
                                  key={field.property}
                                  disabled={!selection}
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

                      <InspectorSection icon={groupMeta.content.icon} title="Content">
                        <FieldGroup>
                          <Field data-disabled={!selection ? true : undefined}>
                            <FieldLabel htmlFor="editor-content-text" className="text-xs text-muted-foreground">Text</FieldLabel>
                            <SmartTextarea
                              id="editor-content-text"
                              label="Selected text"
                              disabled={!selection || !canEditTextContent}
                              value={textValue}
                              placeholder={selections.length > 1 ? "Text editing is single-selection only" : "Edit selected text"}
                              onChange={updateText}
                            />
                          </Field>
                          <Field data-disabled={!selection ? true : undefined}>
                            <FieldLabel htmlFor="editor-content-image-src" className="text-xs text-muted-foreground">Image src</FieldLabel>
                            <AssetSourceInput
                              id="editor-content-image-src"
                              disabled={!selection || !canEditImageContent}
                              value={imageValue}
                              onChange={updateImage}
                            />
                          </Field>
                        </FieldGroup>
                      </InspectorSection>

                      <Separator />

                      <FieldGroup>
                        <Field data-disabled={!selection ? true : undefined}>
                          <FieldLabel htmlFor="editor-handoff-note" className="text-xs text-muted-foreground">Handoff note</FieldLabel>
                          <SmartTextarea
                            id="editor-handoff-note"
                            label="Handoff note"
                            disabled={!selection || selections.length > 1}
                            value={notes}
                            placeholder={selections.length > 1 ? "Notes are single-selection only" : "Add reviewer context for this target"}
                            onChange={updateNotes}
                          />
                        </Field>
                      </FieldGroup>

                      <section className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-medium">Draft patches</h3>
                          <Badge variant={patches.length ? "secondary" : "outline"}>{patches.length}</Badge>
                        </div>
                        <div className={styles.patchList}>
                          {patches.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No local drafts for this route.</p>
                          ) : (
                            patches.map((patch) => {
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
                                      <ChevronDown />
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
                                        <Trash2 />
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
                                              <span aria-hidden="true">→</span>
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
                            })
                          )}
                        </div>
                        <Button type="button" onClick={copyStyles} disabled={patches.length === 0}>
                          {copyState === "copied" ? <CopyCheck data-icon="inline-start" /> : <Clipboard data-icon="inline-start" />}
                          {copyState === "copied" ? "Copied handoff" : "Copy handoff"}
                        </Button>
                      </section>
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
