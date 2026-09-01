import type { ComponentType, ReactNode } from "react";
import type { DialConfig, ResolvedValues } from "dialkit";
import CareersOpenRoles from "@/components/careers-open-roles";
import detailStyles from "@/app/(site)/detail-page.module.css";
import { CaseStudyFact, CaseStudyInformation } from "@/components/case-study-information";
import { DirectionalRoleItem } from "@/components/directional-role-item";
import { HomeFeed } from "@/components/home-feed";
import { PublicNavigation } from "@/components/public-navigation";
import { WorkJournalSection } from "@/components/work-journal-section";
import { PlayerSpecimen } from "@/components/component-system/player-specimen";
import { CommentSpecimen } from "@/components/component-system/comment-specimen";
import {
  specimenNav,
  specimenRoles,
  specimenSocials,
  specimenWork,
} from "@/components/component-system/fixtures";

export const publicComponentIds = [
  "public-navigation",
  "work-journal",
  "home-feed",
  "case-study-information",
  "comment-note",
  "long-form-player",
  "directional-role",
  "careers-open-roles",
] as const;

export type PublicComponentId = (typeof publicComponentIds)[number];
export type PublicComponentCategory = "Global" | "Collections" | "Case studies" | "Media" | "People";

export type PublicComponentControlSchema = {
  config: DialConfig;
  render: (values: unknown) => ReactNode;
};

export type PublicComponentDefinition = {
  id: PublicComponentId;
  name: string;
  category: PublicComponentCategory;
  description: string;
  sourcePath: `src/components/${string}.tsx`;
  variants: readonly string[];
  Specimen: ComponentType;
  controls?: PublicComponentControlSchema;
};

function defineControls<T extends DialConfig>(
  config: T,
  render: (values: ResolvedValues<T>) => ReactNode,
): PublicComponentControlSchema {
  return { config, render: render as (values: unknown) => ReactNode };
}

const surfaceControls = () => ({
  Surface: {
    viewport: { type: "select" as const, options: ["Full", "Desktop", "Tablet", "Mobile"], default: "Full" },
    canvasBackground: { type: "color" as const, default: "#ffffff" },
    canvasTheme: { type: "select" as const, options: ["Light", "Dark"], default: "Light" },
  },
});

const NavigationSpecimen = () => (
  <PublicNavigation
    contactEmail="hello@ripe.studio"
    navLinks={specimenNav}
    socialLinks={specimenSocials}
    navigationShowreel={{
      title: "Ripe Showreel",
      video: { kind: "video", src: "/feed-media/polestar.mp4", alt: "Ripe showreel" },
    }}
  />
);
const WorkSpecimen = () => (
  <WorkJournalSection
    filters={["Strategy", "Identity", "Motion", "Web Design"]}
    items={specimenWork}
    layout="alternating"
    initialViewMode="grid"
  />
);
const HomeFeedSpecimen = () => <HomeFeed />;
const CaseStudyInformationSpecimen = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: 32, maxWidth: 900 }}>
    <div>
      <CaseStudyFact label="Brand" styles={detailStyles}>Example brand</CaseStudyFact>
      <CaseStudyFact label="Services" styles={detailStyles}>Example service 01, Example service 02</CaseStudyFact>
      <CaseStudyFact label="Industry" styles={detailStyles}>Example industry</CaseStudyFact>
      <CaseStudyFact label="Year" styles={detailStyles}>Example year</CaseStudyFact>
    </div>
    <CaseStudyInformation
      styles={detailStyles}
      paragraphs={[
        "A shared language gives a project enough structure to remain recognizable while leaving room for people, content and context to change it.",
        "This specimen deliberately contains enough copy to demonstrate the measured ten-line collapsed state and the production See More interaction. The same component is rendered by both case-study detail variants.",
        "The system stays useful because the documented behavior is not a visual copy. It is the production implementation.",
      ]}
    />
    <CaseStudyInformation
      styles={detailStyles}
      paragraphs={["Short project information stays fully visible and does not render a disclosure control."]}
    />
  </div>
);
const RoleSpecimen = () => (
  <div role="list" className="jobs-list w-dyn-items">
    {specimenRoles.map((role) => (
      <DirectionalRoleItem key={role.title} role={role} />
    ))}
  </div>
);
const CareersSpecimen = () => <CareersOpenRoles roles={specimenRoles} />;

const navigationControls = defineControls(
  {
    ...surfaceControls(),
    Content: {
      contactEmail: { type: "text", default: "hello@ripe.studio" },
      showreelTitle: { type: "text", default: "Ripe Showreel" },
      primaryLinks: [specimenNav.length, 1, specimenNav.length, 1],
    },
    Props: {
      menuBackground: { type: "color", default: "#f1ebe2" },
    },
  },
  ({ Content, Props }) => (
    <PublicNavigation
      contactEmail={Content.contactEmail}
      navLinks={specimenNav.slice(0, Content.primaryLinks)}
      panelBackgroundColor={Props.menuBackground}
      socialLinks={specimenSocials}
      navigationShowreel={{
        title: Content.showreelTitle,
        video: { kind: "video", src: "/feed-media/polestar.mp4", alt: "Ripe showreel" },
      }}
    />
  ),
);

const workControls = defineControls(
  {
    ...surfaceControls(),
    Props: {
      layout: { type: "select", options: ["alternating", "standard"], default: "alternating" },
      initialView: { type: "select", options: ["grid", "list"], default: "grid" },
      items: [specimenWork.length, 1, specimenWork.length, 1],
      filters: [4, 1, 4, 1],
    },
  },
  ({ Props }) => (
    <WorkJournalSection
      key={`${Props.layout}-${Props.initialView}`}
      filters={["Strategy", "Identity", "Motion", "Web Design"].slice(0, Props.filters)}
      items={specimenWork.slice(0, Props.items)}
      layout={Props.layout as "standard" | "alternating"}
      initialViewMode={Props.initialView as "grid" | "list"}
    />
  ),
);

const informationControls = defineControls(
  {
    ...surfaceControls(),
    Content: {
      brand: { type: "text", default: "Example brand" },
      year: { type: "text", default: "Example year" },
      longCopy: true,
    },
  },
  ({ Content }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: 32, maxWidth: 900 }}>
      <div>
        <CaseStudyFact label="Brand" styles={detailStyles}>{Content.brand}</CaseStudyFact>
        <CaseStudyFact label="Services" styles={detailStyles}>Example service 01, Example service 02</CaseStudyFact>
        <CaseStudyFact label="Industry" styles={detailStyles}>Example industry</CaseStudyFact>
        <CaseStudyFact label="Year" styles={detailStyles}>{Content.year}</CaseStudyFact>
      </div>
      <CaseStudyInformation styles={detailStyles} paragraphs={Content.longCopy ? [
        "A shared language gives a project enough structure to remain recognizable while leaving room for people, content and context to change it.",
        "This specimen deliberately contains enough copy to demonstrate the measured ten-line collapsed state and the production See More interaction. The same component is rendered by both case-study detail variants.",
        "The system stays useful because the documented behavior is not a visual copy. It is the production implementation.",
      ] : ["Short project information stays fully visible and does not render a disclosure control."]} />
    </div>
  ),
);

const commentControls = defineControls(
  {
    ...surfaceControls(),
    Content: {
      author: { type: "text", default: "Ripe Studios" },
      body: { type: "text", default: "A shared production note component." },
    },
    Props: {
      defaultOpen: false,
      expandLeft: true,
      expandDown: true,
      x: [58, 0, 100, 1],
      y: [42, 0, 100, 1],
    },
  },
  ({ Content, Props }) => <CommentSpecimen key={String(Props.defaultOpen)} {...Content} {...Props} />,
);

const playerControls = defineControls(
  {
    ...surfaceControls(),
    Props: {
      preload: { type: "select", options: ["metadata", "auto"], default: "metadata" },
      showPoster: true,
    },
  },
  ({ Props }) => <PlayerSpecimen preload={Props.preload as "auto" | "metadata"} showPoster={Props.showPoster} />,
);

const roleControls = defineControls(
  {
    ...surfaceControls(),
    Content: {
      title: { type: "text", default: specimenRoles[0].title },
      location: { type: "text", default: specimenRoles[0].location },
      contractType: { type: "text", default: specimenRoles[0].contractType },
    },
  },
  ({ Content }) => <div role="list" className="jobs-list w-dyn-items"><DirectionalRoleItem role={{ ...specimenRoles[0], ...Content }} /></div>,
);

const careersControls = defineControls(
  { ...surfaceControls(), Props: { roles: [specimenRoles.length, 0, specimenRoles.length, 1] } },
  ({ Props }) => <CareersOpenRoles roles={specimenRoles.slice(0, Props.roles)} />,
);

const surfaceOnlyControls = defineControls({ ...surfaceControls() }, () => <HomeFeed />);

export const publicComponentRegistry: Record<PublicComponentId, PublicComponentDefinition> = {
  "public-navigation": {
    id: "public-navigation",
    name: "Public navigation",
    category: "Global",
    description: "Fixed wordmark, menu trigger, full-screen navigation and showreel player.",
    sourcePath: "src/components/public-navigation.tsx",
    variants: ["dark tone", "light tone", "open", "closing", "showreel"],
    Specimen: NavigationSpecimen,
    controls: navigationControls,
  },
  "work-journal": {
    id: "work-journal",
    name: "Work journal",
    category: "Collections",
    description: "CMS project collection with filters, grid/list switching and hover themes.",
    sourcePath: "src/components/work-journal-section.tsx",
    variants: ["grid", "list", "filtered", "alternating cards"],
    Specimen: WorkSpecimen,
    controls: workControls,
  },
  "home-feed": {
    id: "home-feed",
    name: "Home feed",
    category: "Collections",
    description: "The production feed and the card types it renders internally.",
    sourcePath: "src/components/home-feed.tsx",
    variants: ["simple", "image", "video", "news", "copy", "time", "logos", "awards", "sounds", "services"],
    Specimen: HomeFeedSpecimen,
    controls: surfaceOnlyControls,
  },
  "case-study-information": {
    id: "case-study-information",
    name: "Case-study information",
    category: "Case studies",
    description: "Shared project facts and measured ten-line information disclosure used by both detail-page variants.",
    sourcePath: "src/components/case-study-information.tsx",
    variants: ["facts", "collapsed", "expanded", "short copy"],
    Specimen: CaseStudyInformationSpecimen,
    controls: informationControls,
  },
  "comment-note": {
    id: "comment-note",
    name: "Placed comment note",
    category: "Media",
    description: "The shared edge-aware note surface used on commentable case-study media.",
    sourcePath: "src/components/case-study-comment-note.tsx",
    variants: ["closed", "open", "with avatar", "fallback avatar", "edge-aware"],
    Specimen: CommentSpecimen,
    controls: commentControls,
  },
  "long-form-player": {
    id: "long-form-player",
    name: "Long-form player",
    category: "Media",
    description: "The case-study video player with timeline, volume and fullscreen controls.",
    sourcePath: "src/components/case-study-long-form-player.tsx",
    variants: ["MP4", "HLS", "paused", "playing", "muted", "fullscreen"],
    Specimen: PlayerSpecimen,
    controls: playerControls,
  },
  "directional-role": {
    id: "directional-role",
    name: "Directional role row",
    category: "People",
    description: "Shared job row whose hover surface enters and exits from the pointer edge.",
    sourcePath: "src/components/directional-role-item.tsx",
    variants: ["top", "right", "bottom", "left"],
    Specimen: RoleSpecimen,
    controls: roleControls,
  },
  "careers-open-roles": {
    id: "careers-open-roles",
    name: "Careers open roles",
    category: "People",
    description: "Careers contact and open-role module using the shared role row.",
    sourcePath: "src/components/careers-open-roles.tsx",
    variants: ["roles", "email copied"],
    Specimen: CareersSpecimen,
    controls: careersControls,
  },
};

export const publicComponentDefinitions = publicComponentIds.map((id) => publicComponentRegistry[id]);
