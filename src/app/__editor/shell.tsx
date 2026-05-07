"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Select from "@radix-ui/react-select";
import * as Separator from "@radix-ui/react-separator";
import * as Tabs from "@radix-ui/react-tabs";
import * as Tooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";
import {
  Box,
  Check,
  ChevronDown,
  Clipboard,
  CopyCheck,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Monitor,
  MousePointer2,
  PanelRightClose,
  PanelRightOpen,
  PaintBucket,
  RotateCcw,
  SlidersHorizontal,
  Smartphone,
  Tablet,
  Type,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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

const viewportSizes: Record<ViewportName, { width: number; icon: LucideIcon }> = {
  desktop: { width: 1440, icon: Monitor },
  tablet: { width: 834, icon: Tablet },
  mobile: { width: 390, icon: Smartphone },
};

const fieldGroups: Record<FieldGroupName, FieldConfig[]> = {
  layout: [
    { property: "display", label: "Display", options: ["block", "flex", "grid", "inline-flex", "none"] },
    { property: "position", label: "Position", options: ["static", "relative", "absolute", "fixed", "sticky"] },
    { property: "width", label: "Width" },
    { property: "maxWidth", label: "Max width" },
    { property: "height", label: "Height" },
    { property: "gap", label: "Gap" },
    { property: "alignItems", label: "Align", options: ["stretch", "flex-start", "center", "flex-end", "baseline"] },
    { property: "justifyContent", label: "Justify", options: ["flex-start", "center", "flex-end", "space-between", "space-around"] },
  ],
  spacing: [
    { property: "margin", label: "Margin" },
    { property: "padding", label: "Padding" },
  ],
  typography: [
    { property: "fontSize", label: "Size" },
    { property: "lineHeight", label: "Line height" },
    { property: "letterSpacing", label: "Tracking" },
    { property: "fontWeight", label: "Weight", options: ["300", "400", "500", "600", "700", "800"] },
    { property: "textAlign", label: "Align", options: ["left", "center", "right", "justify"] },
    { property: "color", label: "Color" },
  ],
  appearance: [
    { property: "backgroundColor", label: "Background" },
    { property: "borderRadius", label: "Radius" },
    { property: "opacity", label: "Opacity" },
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
  if (normalized === "/case-studies" || normalized === "/case-studies-new" || normalized === "/case-studies-new-copy") {
    return withEditorQuery("/case-studies");
  }
  if (normalized.startsWith("/case-studies/tags/") || normalized.startsWith("/case-studies-tags/")) {
    const canonical = normalized.replace(/^\/case-studies-tags\//, "/case-studies/tags/");
    return withEditorQuery(canonical);
  }
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

function Field({
  config,
  value,
  onChange,
}: {
  config: FieldConfig;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{config.label}</span>
      {config.options ? (
        <OptionSelect value={value} options={config.options} onChange={onChange} />
      ) : (
        <input
          value={value}
          placeholder={config.placeholder ?? "value"}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

function OptionSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const selectedValue = value || "__unset__";

  return (
    <Select.Root
      value={selectedValue}
      onValueChange={(nextValue) => onChange(nextValue === "__unset__" ? "" : nextValue)}
    >
      <Select.Trigger className={styles.fieldSelect} aria-label="Value">
        <Select.Value />
        <Select.Icon>
          <ChevronDown size={15} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className={styles.selectContent} position="popper" sideOffset={6}>
          <Select.Viewport className={styles.selectViewport}>
            <Select.Item className={styles.selectItem} value="__unset__">
              <Select.ItemText>Unset</Select.ItemText>
              <Select.ItemIndicator>
                <Check size={14} />
              </Select.ItemIndicator>
            </Select.Item>
            {options.map((option) => (
              <Select.Item className={styles.selectItem} value={option} key={option}>
                <Select.ItemText>{option}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={14} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function IconButton({
  label,
  children,
  active,
  onClick,
}: {
  label: string;
  children: ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          className={clsx(styles.iconButton, active && styles.activeIconButton)}
          aria-label={label}
          onClick={onClick}
        >
          {children}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className={styles.tooltip} sideOffset={8}>
          {label}
          <Tooltip.Arrow className={styles.tooltipArrow} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export function EditorShell({ initialPath, routes }: EditorShellProps) {
  const normalizedInitialPath = normalizePath(initialPath);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [route, setRoute] = useState(normalizedInitialPath);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewport, setViewport] = useState<ViewportName>("desktop");
  const [selection, setSelection] = useState<SelectionMetadata | null>(null);
  const [baseStyles, setBaseStyles] = useState<Record<string, string>>({});
  const [styleValues, setStyleValues] = useState<Record<string, string>>({});
  const [textValue, setTextValue] = useState("");
  const [imageValue, setImageValue] = useState("");
  const [hidden, setHidden] = useState(false);
  const [notes, setNotes] = useState("");
  const [patches, setPatches] = useState<EditorPatch[]>(() => readDrafts(normalizedInitialPath));
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const iframeSrc = useMemo(() => canvasPath(route), [route]);
  const viewportWidth = viewportSizes[viewport].width;

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
    try {
      window.localStorage.setItem(storageKey(route), JSON.stringify(patches));
    } catch {}
  }, [patches, route]);

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

    setPatches((current) => {
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
    if (!selection) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "editor:clear-preview", target: selection.target },
      window.location.origin,
    );
    setStyleValues(baseStyles);
    setTextValue(selection.text);
    setImageValue(selection.imageSrc);
    setHidden(false);
    setPatches((current) => current.filter((patch) => !sameTarget(patch.target, selection.target)));
  }

  async function copyStyles() {
    const spec = createClipboardSpec(patches);
    await navigator.clipboard.writeText(formatClipboardSpec(spec));
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1400);
  }

  return (
    <Tooltip.Provider>
      <div className={clsx(styles.editor, sidebarOpen && styles.editorPanelOpen)}>
        <header className={styles.topbar}>
          <div className={styles.brandMark}>
            <Layers size={17} />
            <span>Ripe Visual Editor</span>
          </div>
          <div className={styles.routeCluster}>
            <Select.Root value={route} onValueChange={setRouteAndUrl}>
              <Select.Trigger className={styles.routeSelect} aria-label="Route">
                <Select.Value />
                <Select.Icon>
                  <ChevronDown size={16} />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className={styles.selectContent} position="popper" sideOffset={8}>
                  <Select.Viewport className={styles.selectViewport}>
                    {routes.map((candidate) => (
                      <Select.Item className={styles.selectItem} value={candidate.path} key={candidate.path}>
                        <Select.ItemText>{candidate.label}</Select.ItemText>
                        <Select.ItemIndicator>
                          <Check size={14} />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
            <span className={styles.targetCrumb}>
              {selection ? `${selection.target.tag} · ${selection.target.selector}` : "Canvas ready"}
            </span>
          </div>

          <div className={styles.toolbarActions}>
            <div className={styles.segmented}>
              {(Object.keys(viewportSizes) as ViewportName[]).map((name) => {
                const Icon = viewportSizes[name].icon;
                return (
                  <IconButton
                    label={name}
                    key={name}
                    active={viewport === name}
                    onClick={() => setViewportAndCommit(name)}
                  >
                    <Icon size={17} />
                  </IconButton>
                );
              })}
            </div>
            <IconButton label={sidebarOpen ? "Close panel" : "Open panel"} onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
            </IconButton>
          </div>
        </header>

        <main className={styles.stage}>
          <div className={styles.canvasChrome} style={{ width: `min(100%, ${viewportWidth}px)` }}>
            <iframe
              ref={iframeRef}
              key={iframeSrc}
              className={styles.canvas}
              title="Mirrored site editor canvas"
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

        <Dialog.Root open={sidebarOpen} onOpenChange={setSidebarOpen} modal={false}>
          <Dialog.Portal>
            <Dialog.Content className={styles.sidebar} aria-describedby={undefined}>
              <div className={styles.sidebarHeader}>
                <div>
                  <Dialog.Title className={styles.sidebarTitle}>Visual edits</Dialog.Title>
                  <p className={styles.sidebarMeta}>{route} · {patches.length} drafted</p>
                </div>
                <div className={styles.sidebarHeaderActions}>
                  <IconButton label="Reset selected" onClick={resetSelectedPreview}>
                    <RotateCcw size={17} />
                  </IconButton>
                  <IconButton label="Copy styles" onClick={copyStyles}>
                    <Clipboard size={17} />
                  </IconButton>
                </div>
              </div>
              <Separator.Root className={styles.separator} />

              <ScrollArea.Root className={styles.scrollRoot}>
                <ScrollArea.Viewport className={styles.scrollViewport}>
                  <div className={styles.selectionCard}>
                    <div className={styles.selectionIcon}>
                      <MousePointer2 size={16} />
                    </div>
                    <div className={styles.selectionText}>
                      <span>{selection ? selection.target.tag : "No element selected"}</span>
                      <strong>
                        {selection
                          ? selection.target.textSnippet || selection.target.selector
                          : "Awaiting target"}
                      </strong>
                    </div>
                  </div>

                  <Tabs.Root defaultValue="layout" className={styles.tabs}>
                    <Tabs.List className={styles.tabList}>
                      {(Object.keys(fieldGroups) as FieldGroupName[]).map((group) => {
                        const Icon = groupMeta[group].icon;
                        return (
                        <Tabs.Trigger value={group} className={styles.tab} key={group} aria-label={group}>
                          <Icon size={14} />
                          <span>{groupMeta[group].label}</span>
                        </Tabs.Trigger>
                        );
                      })}
                      <Tabs.Trigger value="content" className={styles.tab} aria-label="content">
                        <ImageIcon size={14} />
                        <span>Asset</span>
                      </Tabs.Trigger>
                    </Tabs.List>

                    {Object.entries(fieldGroups).map(([group, fields]) => (
                      <Tabs.Content value={group} className={styles.tabPanel} key={group}>
                        {fields.map((field) => (
                          <Field
                            config={field}
                            key={field.property}
                            value={styleValues[field.property] ?? ""}
                            onChange={(value) => updateStyle(field.property, value)}
                          />
                        ))}
                      </Tabs.Content>
                    ))}

                    <Tabs.Content value="content" className={styles.tabPanel}>
                      <label className={styles.field}>
                        <span>Text</span>
                        <textarea value={textValue} onChange={(event) => updateText(event.target.value)} />
                      </label>
                      <label className={styles.field}>
                        <span>Image src</span>
                        <input value={imageValue} onChange={(event) => updateImage(event.target.value)} />
                      </label>
                      <button
                        type="button"
                        className={clsx(styles.visibilityButton, hidden && styles.visibilityActive)}
                        onClick={() => updateHidden(!hidden)}
                      >
                        {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                        Visibility
                      </button>
                    </Tabs.Content>
                  </Tabs.Root>

                  <Separator.Root className={styles.separator} />

                  <label className={styles.field}>
                    <span>Note</span>
                    <textarea value={notes} onChange={(event) => updateNotes(event.target.value)} />
                  </label>

                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <button type="button" className={styles.patchButton}>
                        Draft patches
                        <span>{patches.length}</span>
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content className={styles.popover} side="left" sideOffset={12}>
                        {patches.length === 0 ? (
                          <p>No drafts</p>
                        ) : (
                          patches.map((patch) => (
                            <div className={styles.patchRow} key={patch.id}>
                              <strong>{patch.target.tag}</strong>
                              <span>{patch.changes.length} changes</span>
                            </div>
                          ))
                        )}
                        <Popover.Arrow className={styles.popoverArrow} />
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>

                  <button
                    type="button"
                    className={styles.copyButton}
                    onClick={copyStyles}
                    disabled={patches.length === 0}
                  >
                    {copyState === "copied" ? <CopyCheck size={16} /> : <Clipboard size={16} />}
                    {copyState === "copied" ? "Copied" : "Copy styles"}
                  </button>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar className={styles.scrollbar} orientation="vertical">
                  <ScrollArea.Thumb className={styles.scrollThumb} />
                </ScrollArea.Scrollbar>
              </ScrollArea.Root>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </Tooltip.Provider>
  );
}
