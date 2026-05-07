export type ViewportName = "desktop" | "tablet" | "mobile";

export type MirrorRoute = {
  path: string;
  label: string;
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

export type EditorChange = StyleChange | ContentChange;

export type EditorPatch = {
  id: string;
  route: string;
  target: ElementTarget;
  changes: EditorChange[];
  notes: string;
  timestamp: string;
};

export type ClipboardSpec = {
  generatedAt: string;
  patches: EditorPatch[];
};

export type SelectionMetadata = {
  route: string;
  target: ElementTarget;
  text: string;
  imageSrc: string;
  computedStyles: Record<string, string>;
};

export type EditorMessage =
  | { type: "editor:hover"; target: ElementTarget | null }
  | { type: "editor:select"; selection: SelectionMetadata }
  | {
      type: "editor:apply-preview";
      patch: {
        target: ElementTarget;
        styles?: Record<string, string>;
        text?: string;
        imageSrc?: string;
        hidden?: boolean;
      };
    }
  | { type: "editor:clear-preview"; target?: ElementTarget }
  | { type: "editor:request-dom" }
  | { type: "editor:set-enabled"; enabled: boolean };
