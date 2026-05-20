"use client";

import {
  Box,
  Clipboard,
  CopyCheck,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Layers,
  Monitor,
  MousePointer2,
  PanelRightClose,
  PanelRightOpen,
  PaintBucket,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Smartphone,
  Tablet,
  Type,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/editor-ui/tabs";
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
};

type FieldGroupName = "layout" | "spacing" | "typography" | "appearance";

const viewportSizes: Record<ViewportName, { width: number; icon: LucideIcon; label: string }> = {
  desktop: { width: 1440, icon: Monitor, label: "Desktop" },
  tablet: { width: 834, icon: Tablet, label: "Tablet" },
  mobile: { width: 390, icon: Smartphone, label: "Mobile" },
};

const fieldGroups: Record<FieldGroupName, FieldConfig[]> = {
  layout: [
    { property: "display", label: "Display", options: ["block", "flex", "grid", "inline-flex", "none"] },
    { property: "position", label: "Position", options: ["static", "relative", "absolute", "fixed", "sticky"] },
    { property: "width", label: "Width", placeholder: "100%" },
    { property: "maxWidth", label: "Max width", placeholder: "720px" },
    { property: "height", label: "Height", placeholder: "auto" },
    { property: "gap", label: "Gap", placeholder: "16px" },
    { property: "alignItems", label: "Align", options: ["stretch", "flex-start", "center", "flex-end", "baseline"] },
    { property: "justifyContent", label: "Justify", options: ["flex-start", "center", "flex-end", "space-between", "space-around"] },
  ],
  spacing: [
    { property: "margin", label: "Margin", placeholder: "0 0 24px" },
    { property: "padding", label: "Padding", placeholder: "16px 24px" },
  ],
  typography: [
    { property: "fontSize", label: "Size", placeholder: "16px" },
    { property: "lineHeight", label: "Line height", placeholder: "1.4" },
    { property: "letterSpacing", label: "Tracking", placeholder: "0" },
    { property: "fontWeight", label: "Weight", options: ["300", "400", "500", "600", "700", "800"] },
    { property: "textAlign", label: "Align", options: ["left", "center", "right", "justify"] },
    { property: "color", label: "Color", placeholder: "#111111" },
  ],
  appearance: [
    { property: "backgroundColor", label: "Background", placeholder: "#ffffff" },
    { property: "borderRadius", label: "Radius", placeholder: "8px" },
    { property: "opacity", label: "Opacity", placeholder: "1" },
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

function changedStyles(
  base: Record<string, string>,
  values: Record<string, string>,
  viewport: ViewportName,
) {
  return Object.entries(values)
    .filter(([property, value]) => value !== (base[property] ?? ""))
    .map<StyleChange>(([property, value]) => ({
      kind: "style",
      property,
      before: base[property] ?? "",
      after: value,
      viewport,
    }));
}

function upsertPatch(patches: EditorPatch[], patch: EditorPatch) {
  const index = patches.findIndex((candidate) => sameTarget(candidate.target, patch.target));
  if (index === -1) return [...patches, patch];
  return patches.map((candidate, candidateIndex) => (candidateIndex === index ? patch : candidate));
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

function StyleField({
  config,
  value,
  disabled,
  onChange,
}: {
  config: FieldConfig;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const fieldId = `editor-style-${config.property}`;

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
      ) : (
        <Input
          id={fieldId}
          disabled={disabled}
          value={value}
          placeholder={config.placeholder ?? "value"}
          className={styles.valueInput}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
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

export function EditorShell({ initialPath, routes }: EditorShellProps) {
  const normalizedInitialPath = normalizePath(initialPath);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [route, setRoute] = useState(normalizedInitialPath);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [routesOpen, setRoutesOpen] = useState(false);
  const [viewport, setViewport] = useState<ViewportName>("desktop");
  const [selection, setSelection] = useState<SelectionMetadata | null>(null);
  const [baseStyles, setBaseStyles] = useState<Record<string, string>>({});
  const [styleValues, setStyleValues] = useState<Record<string, string>>({});
  const [textValue, setTextValue] = useState("");
  const [imageValue, setImageValue] = useState("");
  const [hidden, setHidden] = useState(false);
  const [notes, setNotes] = useState("");
  const [patches, setPatches] = useState<EditorPatch[]>([]);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const iframeSrc = useMemo(() => canvasPath(route), [route]);
  const viewportWidth = viewportSizes[viewport].width;
  const previewSource = useMemo(() => previewSourceLabel(iframeSrc), [iframeSrc]);
  const selectionLabel = selection
    ? selection.target.textSnippet || selection.target.selector
    : "Select an element in the preview";

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = Boolean(
        target?.closest("input, textarea, select, [contenteditable='true'], [contenteditable='']"),
      );
      if (event.key === "`" && !isTyping) {
        event.preventDefault();
        setSidebarOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const draftLoad = window.setTimeout(() => {
      setPatches(readDrafts(route));
    }, 0);
    return () => window.clearTimeout(draftLoad);
  }, [route]);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "editor:set-enabled", enabled: sidebarOpen },
      window.location.origin,
    );
  }, [sidebarOpen, iframeSrc]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const message = event.data as { type?: string; selection?: SelectionMetadata };
      if (message.type !== "editor:select" || !message.selection) return;

      setSidebarOpen(true);
      setSelection(message.selection);
      setBaseStyles(message.selection.computedStyles);
      setStyleValues(message.selection.computedStyles);
      setTextValue(message.selection.text);
      setImageValue(message.selection.imageSrc);
      setHidden(false);

      const existing = patches.find((patch) => sameTarget(patch.target, message.selection?.target));
      setNotes(existing?.notes ?? "");
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [patches]);

  useEffect(() => {
    if (!selection) return;

    const stylesPayload = Object.fromEntries(
      Object.entries(styleValues).filter(([property, value]) => value !== (baseStyles[property] ?? "")),
    );

    iframeRef.current?.contentWindow?.postMessage(
      {
        type: "editor:apply-preview",
        patch: {
          target: selection.target,
          styles: stylesPayload,
          text: textValue !== selection.text ? textValue : undefined,
          imageSrc: imageValue !== selection.imageSrc ? imageValue : undefined,
          hidden,
        },
      },
      window.location.origin,
    );
  }, [baseStyles, hidden, imageValue, selection, styleValues, textValue]);

  function setRouteAndUrl(nextRoute: string) {
    const normalized = normalizePath(nextRoute);
    setRoute(normalized);
    setPatches(readDrafts(normalized));
    setSelection(null);
    setBaseStyles({});
    setStyleValues({});
    setTextValue("");
    setImageValue("");
    setHidden(false);
    setNotes("");
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
    nextNotes = notes,
    nextViewport = viewport,
  }: {
    nextStyleValues?: Record<string, string>;
    nextTextValue?: string;
    nextImageValue?: string;
    nextHidden?: boolean;
    nextNotes?: string;
    nextViewport?: ViewportName;
  }) {
    if (!selection) return null;

    const changes: EditorChange[] = [
      ...changedStyles(baseStyles, nextStyleValues, nextViewport),
      ...(nextTextValue !== selection.text
        ? [
            {
              kind: "content",
              field: "text",
              before: selection.text,
              after: nextTextValue,
            } satisfies ContentChange,
          ]
        : []),
      ...(nextImageValue !== selection.imageSrc
        ? [
            {
              kind: "content",
              field: "imageSrc",
              before: selection.imageSrc,
              after: nextImageValue,
            } satisfies ContentChange,
          ]
        : []),
      ...(nextHidden
        ? [
            {
              kind: "style",
              property: "visibility",
              before: baseStyles.visibility ?? "",
              after: "hidden",
              viewport: nextViewport,
            } satisfies StyleChange,
          ]
        : []),
    ];

    return {
      changes,
      notes: nextNotes,
      target: selection.target,
    };
  }

  function commitDraft(overrides: Parameters<typeof changesForDraft>[0] = {}) {
    const draft = changesForDraft(overrides);
    if (!draft) return;

    updatePatches((current) => {
      if (draft.changes.length === 0 && !draft.notes.trim()) {
        return current.filter((patch) => !sameTarget(patch.target, draft.target));
      }

      const existing = current.find((patch) => sameTarget(patch.target, draft.target));
      return upsertPatch(current, {
        id: existing?.id ?? `${draft.target.route}:${draft.target.selector}`,
        route,
        target: draft.target,
        changes: draft.changes,
        notes: draft.notes,
        timestamp: new Date().toISOString(),
      });
    });
  }

  function setViewportAndCommit(nextViewport: ViewportName) {
    setViewport(nextViewport);
    commitDraft({ nextViewport });
  }

  function updateStyle(property: string, value: string) {
    const nextStyleValues = { ...styleValues, [property]: value };
    setStyleValues(nextStyleValues);
    commitDraft({ nextStyleValues });
  }

  function updateText(value: string) {
    setTextValue(value);
    commitDraft({ nextTextValue: value });
  }

  function updateImage(value: string) {
    setImageValue(value);
    commitDraft({ nextImageValue: value });
  }

  function updateHidden(value: boolean) {
    setHidden(value);
    commitDraft({ nextHidden: value });
  }

  function updateNotes(value: string) {
    setNotes(value);
    commitDraft({ nextNotes: value });
  }

  function resetSelectedPreview() {
    if (!selection) {
      toast.info("Select an element first");
      return;
    }
    iframeRef.current?.contentWindow?.postMessage(
      { type: "editor:clear-preview", target: selection.target },
      window.location.origin,
    );
    setStyleValues(baseStyles);
    setTextValue(selection.text);
    setImageValue(selection.imageSrc);
    setHidden(false);
    updatePatches((current) => current.filter((patch) => !sameTarget(patch.target, selection.target)));
    toast.success("Selection reset");
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
                  onLoad={() =>
                    iframeRef.current?.contentWindow?.postMessage(
                      { type: "editor:set-enabled", enabled: sidebarOpen },
                      window.location.origin,
                    )
                  }
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
                            {selection ? selection.target.tag : "No element selected"}
                          </p>
                          <p className="mt-1 truncate text-sm font-medium">{selectionLabel}</p>
                        </div>
                      </section>

                      <Tabs defaultValue="layout" className="flex flex-col gap-4">
                        <TabsList className="grid h-auto w-full grid-cols-5">
                          {(Object.keys(fieldGroups) as FieldGroupName[]).map((group) => {
                            const Icon = groupMeta[group].icon;
                            return (
                              <TabsTrigger value={group} key={group} aria-label={groupMeta[group].label}>
                                <Icon />
                                <span className="sr-only">{groupMeta[group].label}</span>
                              </TabsTrigger>
                            );
                          })}
                          <TabsTrigger value="content" aria-label="Content">
                            <ImageIcon />
                            <span className="sr-only">Content</span>
                          </TabsTrigger>
                        </TabsList>

                        {Object.entries(fieldGroups).map(([group, fields]) => (
                          <TabsContent value={group} key={group}>
                            <FieldGroup className="grid grid-cols-2 gap-3">
                              {fields.map((field) => (
                                <StyleField
                                  config={field}
                                  key={field.property}
                                  disabled={!selection}
                                  value={styleValues[field.property] ?? ""}
                                  onChange={(value) => updateStyle(field.property, value)}
                                />
                              ))}
                            </FieldGroup>
                          </TabsContent>
                        ))}

                        <TabsContent value="content">
                          <FieldGroup>
                            <Field data-disabled={!selection ? true : undefined}>
                              <FieldLabel htmlFor="editor-content-text" className="text-xs text-muted-foreground">Text</FieldLabel>
                              <Textarea
                                id="editor-content-text"
                                disabled={!selection}
                                value={textValue}
                                placeholder="Edit selected text"
                                className={styles.contentTextarea}
                                onChange={(event) => updateText(event.target.value)}
                              />
                            </Field>
                            <Field data-disabled={!selection ? true : undefined}>
                              <FieldLabel htmlFor="editor-content-image-src" className="text-xs text-muted-foreground">Image src</FieldLabel>
                              <Input
                                id="editor-content-image-src"
                                disabled={!selection}
                                value={imageValue}
                                placeholder="https://... or /asset.jpg"
                                className={styles.valueInput}
                                autoComplete="off"
                                spellCheck={false}
                                onChange={(event) => updateImage(event.target.value)}
                              />
                            </Field>
                            <Button
                              type="button"
                              variant={hidden ? "destructive" : "outline"}
                              disabled={!selection}
                              onClick={() => updateHidden(!hidden)}
                            >
                              {hidden ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
                              {hidden ? "Hidden in preview" : "Visible in preview"}
                            </Button>
                          </FieldGroup>
                        </TabsContent>
                      </Tabs>

                      <Separator />

                      <FieldGroup>
                        <Field data-disabled={!selection ? true : undefined}>
                          <FieldLabel htmlFor="editor-handoff-note" className="text-xs text-muted-foreground">Handoff note</FieldLabel>
                          <Textarea
                            id="editor-handoff-note"
                            disabled={!selection}
                            value={notes}
                            placeholder="Add reviewer context for this target"
                            className={styles.contentTextarea}
                            onChange={(event) => updateNotes(event.target.value)}
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
                            patches.map((patch) => (
                              <div className={styles.patchRow} key={patch.id}>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">{patch.target.tag}</p>
                                  <p className="truncate text-xs text-muted-foreground">{patch.target.selector}</p>
                                </div>
                                <Badge variant="outline">{patch.changes.length} changes</Badge>
                              </div>
                            ))
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
          <SheetContent side="left" className="w-[min(440px,calc(100vw-24px))] gap-0 p-0" showCloseButton>
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
