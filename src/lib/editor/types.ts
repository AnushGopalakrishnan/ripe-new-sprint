export type ViewportName = "desktop" | "tablet" | "mobile";

export type MirrorRoute = {
  path: string;
  label: string;
  collection?: {
    key: string;
    label: string;
    itemLabel: string;
  };
};

export type ElementTarget = {
  route: string;
  tag: string;
  id?: string;
  dataAttrs: Record<string, string>;
  classes: string[];
  nthOfType: number;
  selector: string;
  textSnippet?: string;
};

export type StyleChange = {
  kind: "style";
  property: string;
  before: string;
  after: string;
  viewport: ViewportName;
};

export type ContentChange = {
  kind: "content";
  field: "text" | "imageSrc";
  before: string;
  after: string;
};

export type ElementChange = {
  kind: "element";
  action: "hide" | "delete";
  before: boolean;
  after: boolean;
};

export type EditorChange = StyleChange | ContentChange | ElementChange;

export type EditorPatch = {
  id: string;
  route: string;
  target: ElementTarget;
  changes: EditorChange[];
  notes: string;
  timestamp: string;
};

export type EditorComment = {
  id: string;
  route: string;
  target: ElementTarget;
  note: string;
  anchor: {
    x: number;
    y: number;
  };
  timestamp: string;
};

export type ClipboardSpec = {
  generatedAt: string;
  patches: EditorPatch[];
  comments?: EditorComment[];
};

export type SelectionMetadata = {
  route: string;
  target: ElementTarget;
  text: string;
  imageSrc: string;
  computedStyles: Record<string, string>;
  capabilities?: {
    canEditText?: boolean;
    canStyleText?: boolean;
    canEditImage?: boolean;
    isEditableControl?: boolean;
    selectorUnique?: boolean;
  };
};

export type EditorMessage =
  | { type: "editor:hover"; target: ElementTarget | null }
  | { type: "editor:select"; selection: SelectionMetadata; selections?: SelectionMetadata[] }
  | { type: "editor:comment-anchor"; selection: SelectionMetadata; anchor: { x: number; y: number } }
  | { type: "editor:comment-select"; id: string }
  | { type: "editor:undo" }
  | { type: "editor:redo" }
  | {
      type: "editor:apply-preview";
      patch: {
        target: ElementTarget;
        styles?: Record<string, string>;
        text?: string;
        imageSrc?: string;
        hidden?: boolean;
        deleted?: boolean;
      };
    }
  | { type: "editor:clear-preview"; target?: ElementTarget }
  | { type: "editor:request-dom" }
  | { type: "editor:set-enabled"; enabled: boolean }
  | { type: "editor:set-comment-mode"; enabled: boolean }
  | { type: "editor:set-comments"; comments: EditorComment[] };
