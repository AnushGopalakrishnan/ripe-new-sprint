import type { ComponentType, ReactNode } from "react";
import type { DialConfig, ResolvedValues } from "dialkit";
import CareersOpenRoles from "@/components/careers-open-roles";
import { DirectionalRoleItem } from "@/components/directional-role-item";
import { HomeFeed } from "@/components/home-feed";
import { PublicNavigation } from "@/components/public-navigation";
import { TeamPageClient } from "@/components/team-page-client";
import { WorkJournalSection } from "@/components/work-journal-section";
import { PlayerSpecimen } from "@/components/component-system/player-specimen";
import { CommentSpecimen } from "@/components/component-system/comment-specimen";
import {
  CaseStudyDisclosureSpecimen,
  CaseStudyCarouselButtonSpecimen,
  CaseStudyAllProjectsLinkSpecimen,
  CaseStudyMediaSpecimen,
  CaseStudyRelatedProjectCardSpecimen,
  CaseStudyRelatedProjectsSpecimen,
  CareersTrustLogosSpecimen,
  CareersBenefitCardsSpecimen,
  CareersBenefitsSpecimen,
  CareersFounderCardSpecimen,
  CareersFilmstripCardSpecimen,
  CareersPillarCardSpecimen,
  CaseStudyFactSpecimen,
  CaseStudyInformationVariantsSpecimen,
  CommentTriggerSpecimen,
  CommentsToggleSpecimen,
  CopyEmailSpecimen,
  FeedAwardsCardSpecimen,
  FeedCopyCardSpecimen,
  FeedMediaCardSpecimen,
  FeedLogosCardSpecimen,
  FeedNewsCardSpecimen,
  FeedOverlayLinkSpecimen,
  FeedPillSpecimen,
  FeedServicesCardSpecimen,
  FeedSimpleCardSpecimen,
  FeedSoundsCardSpecimen,
  FeedTimeCardSpecimen,
  NavigationDismissButtonSpecimen,
  ContactCtaSpecimen,
  NavigationLogoLinkSpecimen,
  NavigationMenuButtonSpecimen,
  NavigationMenuLinkSpecimen,
  NavigationShowreelButtonSpecimen,
  PlayerFullscreenControlSpecimen,
  PlayerControlsSpecimen,
  PlayerPlayControlSpecimen,
  PlayerTimelineSpecimen,
  PlayerVolumeControlSpecimen,
  ProfileLinkSpecimen,
  TeamMemberCardSpecimen,
  WorkJournalCardSpecimen,
  WorkJournalFilterButtonSpecimen,
  WorkJournalFilterGroupSpecimen,
  WorkJournalMobileCategoriesSpecimen,
  WorkJournalMobileCloseSpecimen,
  WorkJournalViewToggleSpecimen,
} from "@/components/component-system/atomic-specimens";
import { specimenNav, specimenRoles, specimenSocials, specimenTeamMember, specimenWork } from "@/components/component-system/fixtures";

export const publicComponentIds = [
  "navigation-logo-link",
  "navigation-menu-button",
  "navigation-dismiss-control",
  "navigation-menu-link",
  "navigation-showreel-button",
  "contact-cta",
  "journal-filter-button",
  "journal-view-toggle",
  "journal-mobile-categories-button",
  "journal-mobile-close-button",
  "feed-pill",
  "feed-overlay-link",
  "case-study-disclosure-button",
  "case-study-carousel-button",
  "case-study-all-projects-link",
  "comment-trigger",
  "comments-toggle",
  "player-play-control",
  "player-timeline",
  "player-volume-control",
  "player-fullscreen-control",
  "copy-email-cta",
  "profile-link",
  "journal-filter-group",
  "case-study-fact",
  "case-study-information",
  "comment-note",
  "player-controls",
  "directional-role",
  "careers-trust-logos",
  "work-journal-card",
  "case-study-related-project-card",
  "team-member-card",
  "careers-pillar-card",
  "careers-founder-card",
  "careers-benefit-card",
  "careers-filmstrip-card",
  "feed-simple-card",
  "feed-media-card",
  "feed-news-card",
  "feed-copy-card",
  "feed-time-card",
  "feed-logos-card",
  "feed-awards-card",
  "feed-sounds-card",
  "feed-services-card",
  "public-navigation",
  "work-journal",
  "home-feed",
  "team-directory",
  "long-form-player",
  "case-study-media",
  "case-study-related-projects",
  "careers-open-roles",
  "careers-benefits",
] as const;

export type PublicComponentId = (typeof publicComponentIds)[number];
export type PublicComponentCategory = "Atoms" | "Molecules" | "Cards" | "Compositions";

export type PublicComponentSpecimenProps = { variant?: string };
export type PublicComponentControlSchema = { config: DialConfig; render: (values: unknown, variant?: string) => ReactNode };
export type PublicComponentSourcePath = `src/components/${string}.tsx` | `src/app/(site)/${string}.tsx`;
export type PublicComponentDefinition = {
  id: PublicComponentId;
  name: string;
  category: PublicComponentCategory;
  description: string;
  sourcePath: PublicComponentSourcePath;
  variants: readonly string[];
  Specimen: ComponentType<PublicComponentSpecimenProps>;
  controls: PublicComponentControlSchema;
  surfaceAlignment: "center" | "stretch";
};

function defineControls<T extends DialConfig>(config: T, render: (values: ResolvedValues<T>, variant?: string) => ReactNode): PublicComponentControlSchema {
  return { config, render: render as (values: unknown, variant?: string) => ReactNode };
}

const surfaceControls = () => ({
  Surface: {
    viewport: { type: "select" as const, options: ["Full", "Desktop", "Tablet", "Mobile"], default: "Full" },
    canvasBackground: { type: "color" as const, default: "#faf9f7" },
    canvasTheme: { type: "select" as const, options: ["Light", "Dark"], default: "Light" },
  },
});

function surfaceOnly(Specimen: ComponentType<PublicComponentSpecimenProps>) {
  return defineControls({ ...surfaceControls() }, (_values, variant) => <Specimen variant={variant} />);
}

const NavigationSpecimen = ({ variant }: PublicComponentSpecimenProps) => {
  const initialState = variant === "open" || variant === "closing" || variant === "showreel" ? variant : "closed";
  const tone = variant === "light tone" ? "light" : "dark";
  return <div data-nav-tone={tone} style={{ minHeight: "100dvh", background: tone === "light" ? "#171717" : "#d7e1cf" }}><PublicNavigation contactEmail="hello@ripe.studio" initialState={initialState} navLinks={specimenNav} socialLinks={specimenSocials} navigationShowreel={{ title: "Ripe Showreel", video: { kind: "video", src: "/feed-media/polestar.mp4", alt: "Ripe showreel" } }} /></div>;
};
const WorkSpecimen = ({ variant }: PublicComponentSpecimenProps) => <WorkJournalSection filters={["Strategy", "Identity", "Motion", "Web Design"]} initialFilters={variant === "filtered" ? ["Strategy"] : undefined} items={specimenWork} layout={variant === "alternating" ? "alternating" : "standard"} initialViewMode={variant === "list" ? "list" : "grid"} />;
const HomeFeedSpecimen = ({ variant }: PublicComponentSpecimenProps) => <div style={{ maxWidth: variant === "responsive" ? 760 : undefined, margin: "0 auto" }}><HomeFeed /></div>;
const RoleSpecimen = ({ variant }: PublicComponentSpecimenProps) => <div role="list" className="jobs-list w-dyn-items"><DirectionalRoleItem initialEntryDirection={variant as "top" | "right" | "bottom" | "left"} role={specimenRoles[0]} /></div>;
const CareersSpecimen = ({ variant }: PublicComponentSpecimenProps) => <CareersOpenRoles roles={variant === "empty" ? [] : specimenRoles} />;
const TeamDirectorySpecimen = () => <TeamPageClient members={[specimenTeamMember]} roles={specimenRoles} />;

const navigationControls = defineControls({ ...surfaceControls(), Content: { contactEmail: { type: "text", default: "hello@ripe.studio" }, showreelTitle: { type: "text", default: "Ripe Showreel" }, primaryLinks: [specimenNav.length, 1, specimenNav.length, 1] }, Props: { menuBackground: { type: "color", default: "#f1ebe2" } } }, ({ Content, Props }, variant) => {
  const initialState = variant === "open" || variant === "closing" || variant === "showreel" ? variant : "closed";
  const tone = variant === "light tone" ? "light" : "dark";
  return <div data-nav-tone={tone} style={{ minHeight: "100dvh", background: tone === "light" ? "#171717" : "#d7e1cf" }}><PublicNavigation contactEmail={Content.contactEmail} initialState={initialState} navLinks={specimenNav.slice(0, Content.primaryLinks)} panelBackgroundColor={Props.menuBackground} socialLinks={specimenSocials} navigationShowreel={{ title: Content.showreelTitle, video: { kind: "video", src: "/feed-media/polestar.mp4", alt: "Ripe showreel" } }} /></div>;
});
const workControls = defineControls({ ...surfaceControls(), Props: { layout: { type: "select", options: ["alternating", "standard"], default: "alternating" }, initialView: { type: "select", options: ["grid", "list"], default: "grid" }, items: [specimenWork.length, 1, specimenWork.length, 1], filters: [4, 1, 4, 1] } }, ({ Props }, variant) => <WorkJournalSection key={`${Props.layout}-${Props.initialView}-${variant}`} filters={["Strategy", "Identity", "Motion", "Web Design"].slice(0, Props.filters)} initialFilters={variant === "filtered" ? ["Strategy"] : undefined} items={specimenWork.slice(0, Props.items)} layout={variant === "alternating" ? "alternating" : Props.layout as "standard" | "alternating"} initialViewMode={variant === "list" ? "list" : Props.initialView as "grid" | "list"} />);
const playerControls = defineControls({ ...surfaceControls(), Props: { preload: { type: "select", options: ["metadata", "auto"], default: "metadata" }, showPoster: true } }, ({ Props }, variant) => <PlayerSpecimen preload={Props.preload as "auto" | "metadata"} showPoster={Props.showPoster} variant={variant} />);
const careersControls = defineControls({ ...surfaceControls(), Props: { roles: [specimenRoles.length, 0, specimenRoles.length, 1] } }, ({ Props }, variant) => <CareersOpenRoles roles={variant === "empty" ? [] : specimenRoles.slice(0, Props.roles)} />);

type EntryInput = Omit<PublicComponentDefinition, "controls" | "surfaceAlignment"> & {
  controls?: PublicComponentControlSchema;
  surfaceAlignment?: PublicComponentDefinition["surfaceAlignment"];
};
const entry = (definition: EntryInput): PublicComponentDefinition => ({
  ...definition,
  controls: definition.controls ?? surfaceOnly(definition.Specimen),
  surfaceAlignment: definition.surfaceAlignment ?? (definition.category === "Atoms" ? "center" : "stretch"),
});

export const publicComponentRegistry: Record<PublicComponentId, PublicComponentDefinition> = {
  "navigation-logo-link": entry({ id: "navigation-logo-link", name: "Navigation logo link", category: "Atoms", description: "Accessible home link wrapping the Ripe wordmark.", sourcePath: "src/components/public-navigation.tsx", variants: ["header", "panel"], Specimen: NavigationLogoLinkSpecimen }),
  "navigation-menu-button": entry({ id: "navigation-menu-button", name: "Navigation menu button", category: "Atoms", description: "The public navigation open control.", sourcePath: "src/components/public-navigation.tsx", variants: ["collapsed", "expanded", "light tone", "dark tone"], Specimen: NavigationMenuButtonSpecimen }),
  "navigation-dismiss-control": entry({ id: "navigation-dismiss-control", name: "Navigation dismissal control", category: "Atoms", description: "Shared dismissal control for the navigation panel, showreel player and backdrop.", sourcePath: "src/components/public-navigation.tsx", variants: ["panel", "player", "backdrop"], Specimen: NavigationDismissButtonSpecimen, surfaceAlignment: "stretch" }),
  "navigation-menu-link": entry({ id: "navigation-menu-link", name: "Navigation menu link", category: "Atoms", description: "Internal and external menu link behavior.", sourcePath: "src/components/public-navigation.tsx", variants: ["internal", "external", "primary", "secondary"], Specimen: NavigationMenuLinkSpecimen }),
  "navigation-showreel-button": entry({ id: "navigation-showreel-button", name: "Showreel button", category: "Atoms", description: "The navigation showreel preview trigger.", sourcePath: "src/components/public-navigation.tsx", variants: ["default"], Specimen: NavigationShowreelButtonSpecimen }),
  "contact-cta": entry({ id: "contact-cta", name: "Contact CTA", category: "Atoms", description: "The shared global mail call to action used by navigation, case studies and Careers.", sourcePath: "src/components/contact-cta.tsx", variants: ["default"], Specimen: ContactCtaSpecimen }),
  "journal-filter-button": entry({ id: "journal-filter-button", name: "Journal filter button", category: "Atoms", description: "A production Work Journal category toggle.", sourcePath: "src/components/work-journal-section.tsx", variants: ["inactive", "active"], Specimen: WorkJournalFilterButtonSpecimen }),
  "journal-view-toggle": entry({ id: "journal-view-toggle", name: "Journal view toggle", category: "Atoms", description: "The animated grid/list switcher.", sourcePath: "src/components/work-journal-section.tsx", variants: ["grid", "list", "preview"], Specimen: WorkJournalViewToggleSpecimen }),
  "journal-mobile-categories-button": entry({ id: "journal-mobile-categories-button", name: "Journal mobile categories", category: "Atoms", description: "The mobile filter-dialog trigger.", sourcePath: "src/components/work-journal-section.tsx", variants: ["closed", "expanded"], Specimen: WorkJournalMobileCategoriesSpecimen }),
  "journal-mobile-close-button": entry({ id: "journal-mobile-close-button", name: "Journal mobile close", category: "Atoms", description: "Dismissal control for the Work Journal mobile filter dialog.", sourcePath: "src/components/work-journal-section.tsx", variants: ["default"], Specimen: WorkJournalMobileCloseSpecimen }),
  "feed-pill": entry({ id: "feed-pill", name: "Feed pill", category: "Atoms", description: "Feed metadata label with optional action copy.", sourcePath: "src/components/home-feed.tsx", variants: ["label", "label with action"], Specimen: FeedPillSpecimen }),
  "feed-overlay-link": entry({ id: "feed-overlay-link", name: "Feed overlay link", category: "Atoms", description: "The accessible full-card interaction target used by interactive feed cards.", sourcePath: "src/components/home-feed.tsx", variants: ["link"], Specimen: FeedOverlayLinkSpecimen, surfaceAlignment: "stretch" }),
  "case-study-disclosure-button": entry({ id: "case-study-disclosure-button", name: "Information disclosure", category: "Atoms", description: "See More and See Less control for measured project information.", sourcePath: "src/components/case-study-information.tsx", variants: ["collapsed", "expanded"], Specimen: CaseStudyDisclosureSpecimen }),
  "case-study-carousel-button": entry({ id: "case-study-carousel-button", name: "Case-study carousel button", category: "Atoms", description: "Shared previous and next project-image control used by both detail variants.", sourcePath: "src/components/case-study-actions.tsx", variants: ["previous", "next"], Specimen: CaseStudyCarouselButtonSpecimen }),
  "case-study-all-projects-link": entry({ id: "case-study-all-projects-link", name: "All case studies link", category: "Atoms", description: "The shared link from related projects back to the case-study index.", sourcePath: "src/components/case-study-related.tsx", variants: ["standard", "padded detail"], Specimen: CaseStudyAllProjectsLinkSpecimen }),
  "comment-trigger": entry({ id: "comment-trigger", name: "Comment trigger", category: "Atoms", description: "Avatar and note trigger used inside placed comments.", sourcePath: "src/components/case-study-comment-note.tsx", variants: ["closed", "open", "avatar", "fallback"], Specimen: CommentTriggerSpecimen }),
  "comments-toggle": entry({ id: "comments-toggle", name: "Comments visibility toggle", category: "Atoms", description: "Fixed Show Comments and Hide Comments control shared by both case-study detail variants.", sourcePath: "src/components/case-study-comment-note.tsx", variants: ["show", "hide"], Specimen: CommentsToggleSpecimen, surfaceAlignment: "stretch" }),
  "player-play-control": entry({ id: "player-play-control", name: "Player play control", category: "Atoms", description: "Shared play/pause control used at the center and in the control bar.", sourcePath: "src/components/case-study-long-form-player.tsx", variants: ["play", "pause", "compact", "center"], Specimen: PlayerPlayControlSpecimen }),
  "player-timeline": entry({ id: "player-timeline", name: "Player timeline", category: "Atoms", description: "Keyboard and pointer seek control with buffered and played progress.", sourcePath: "src/components/case-study-long-form-player.tsx", variants: ["idle", "buffered", "dragging"], Specimen: PlayerTimelineSpecimen, surfaceAlignment: "stretch" }),
  "player-volume-control": entry({ id: "player-volume-control", name: "Player volume control", category: "Atoms", description: "Mute button and reachable vertical volume slider.", sourcePath: "src/components/case-study-long-form-player.tsx", variants: ["audible", "muted", "slider"], Specimen: PlayerVolumeControlSpecimen }),
  "player-fullscreen-control": entry({ id: "player-fullscreen-control", name: "Player fullscreen control", category: "Atoms", description: "Fullscreen enter and exit toggle.", sourcePath: "src/components/case-study-long-form-player.tsx", variants: ["enter", "exit"], Specimen: PlayerFullscreenControlSpecimen }),
  "copy-email-cta": entry({ id: "copy-email-cta", name: "Copy email CTA", category: "Atoms", description: "Shared keyboard-accessible clipboard action used by Careers and Team.", sourcePath: "src/components/copy-email-cta.tsx", variants: ["idle", "copied", "touch feedback"], Specimen: CopyEmailSpecimen }),
  "profile-link": entry({ id: "profile-link", name: "Profile link", category: "Atoms", description: "Shared internal, external and mail profile link used on team-member detail pages.", sourcePath: "src/components/profile-link.tsx", variants: ["internal", "external", "mailto"], Specimen: ProfileLinkSpecimen }),
  "journal-filter-group": entry({ id: "journal-filter-group", name: "Journal filter group", category: "Molecules", description: "A coordinated group of Work Journal category toggles.", sourcePath: "src/components/work-journal-section.tsx", variants: ["desktop", "mobile", "multiple active"], Specimen: WorkJournalFilterGroupSpecimen }),
  "case-study-fact": entry({ id: "case-study-fact", name: "Case-study fact row", category: "Molecules", description: "Label and value pair used for Brand, Services, Industry and Year.", sourcePath: "src/components/case-study-information.tsx", variants: ["brand", "services", "industry", "year"], Specimen: CaseStudyFactSpecimen }),
  "case-study-information": entry({ id: "case-study-information", name: "Case-study information", category: "Molecules", description: "Measured project information with ten-line disclosure behavior.", sourcePath: "src/components/case-study-information.tsx", variants: ["short", "collapsed", "expanded"], Specimen: CaseStudyInformationVariantsSpecimen }),
  "comment-note": entry({ id: "comment-note", name: "Placed comment note", category: "Molecules", description: "Edge-aware note surface used on commentable case-study media.", sourcePath: "src/components/case-study-comment-note.tsx", variants: ["closed", "open", "edge-aware"], Specimen: CommentSpecimen }),
  "player-controls": entry({ id: "player-controls", name: "Player controls", category: "Molecules", description: "The coordinated play, time, timeline, volume and fullscreen control bar.", sourcePath: "src/components/case-study-long-form-player.tsx", variants: ["paused", "playing", "muted", "fullscreen"], Specimen: PlayerControlsSpecimen }),
  "directional-role": entry({ id: "directional-role", name: "Directional role row", category: "Molecules", description: "Job link whose hover surface enters and exits from the pointer edge.", sourcePath: "src/components/directional-role-item.tsx", variants: ["top", "right", "bottom", "left"], Specimen: RoleSpecimen }),
  "careers-trust-logos": entry({ id: "careers-trust-logos", name: "Careers trust logos", category: "Molecules", description: "The staggered trust-logo stack used in the Careers introduction.", sourcePath: "src/components/careers-trust-logos.tsx", variants: ["entering", "visible", "four logos"], Specimen: CareersTrustLogosSpecimen }),
  "work-journal-card": entry({ id: "work-journal-card", name: "Work Journal card", category: "Cards", description: "Production project card shared by Work Journal grid and list states.", sourcePath: "src/components/work-journal-section.tsx", variants: ["image", "video", "grid", "list", "hovered"], Specimen: WorkJournalCardSpecimen }),
  "case-study-related-project-card": entry({ id: "case-study-related-project-card", name: "Related project card", category: "Cards", description: "Image, title and year card in the case-study related-project grid.", sourcePath: "src/components/case-study-related.tsx", variants: ["standard detail", "padded detail"], Specimen: CaseStudyRelatedProjectCardSpecimen }),
  "team-member-card": entry({ id: "team-member-card", name: "Team-member card", category: "Cards", description: "Profile link used by the grouped Team directory.", sourcePath: "src/components/team-page-client.tsx", variants: ["idle", "active", "image fallback"], Specimen: TeamMemberCardSpecimen }),
  "careers-pillar-card": entry({ id: "careers-pillar-card", name: "Careers pillar card", category: "Cards", description: "Icon, title and body card used for the studio pillars.", sourcePath: "src/components/careers-cards.tsx", variants: ["content"], Specimen: CareersPillarCardSpecimen }),
  "careers-founder-card": entry({ id: "careers-founder-card", name: "Careers founder card", category: "Cards", description: "Portrait, name and role card in the Careers people section.", sourcePath: "src/components/careers-cards.tsx", variants: ["CMS portrait", "fallback portrait"], Specimen: CareersFounderCardSpecimen }),
  "careers-benefit-card": entry({ id: "careers-benefit-card", name: "Careers benefit cards", category: "Cards", description: "The production benefit-card primitive shown across all nine content variants.", sourcePath: "src/components/careers-cards.tsx", variants: ["books", "referral", "headspace", "flexible", "offsite", "commission", "learning", "wework", "home office"], Specimen: CareersBenefitCardsSpecimen }),
  "careers-filmstrip-card": entry({ id: "careers-filmstrip-card", name: "Careers filmstrip card", category: "Cards", description: "Repeating image and video frame group used by the Careers hero filmstrip.", sourcePath: "src/components/careers-cards.tsx", variants: ["image", "video", "wide", "tall", "square"], Specimen: CareersFilmstripCardSpecimen }),
  "feed-simple-card": entry({ id: "feed-simple-card", name: "Feed simple card", category: "Cards", description: "Text-led feed card with optional overlay link.", sourcePath: "src/components/home-feed.tsx", variants: ["small", "medium", "square", "interactive"], Specimen: FeedSimpleCardSpecimen }),
  "feed-media-card": entry({ id: "feed-media-card", name: "Feed media card", category: "Cards", description: "Shared image- and video-led feed card with pill, title and overlay link.", sourcePath: "src/components/home-feed.tsx", variants: ["image", "video", "medium", "square", "positioned media", "poster-first"], Specimen: FeedMediaCardSpecimen }),
  "feed-news-card": entry({ id: "feed-news-card", name: "Feed news card", category: "Cards", description: "Green editorial feed card with caption and read action.", sourcePath: "src/components/home-feed.tsx", variants: ["interactive", "static"], Specimen: FeedNewsCardSpecimen }),
  "feed-copy-card": entry({ id: "feed-copy-card", name: "Feed copy card", category: "Cards", description: "Studio copy card in body and large-copy treatments.", sourcePath: "src/components/home-feed.tsx", variants: ["body", "large", "interactive"], Specimen: FeedCopyCardSpecimen }),
  "feed-time-card": entry({ id: "feed-time-card", name: "Feed time card", category: "Cards", description: "Live London studio time card.", sourcePath: "src/components/home-feed.tsx", variants: ["live time"], Specimen: FeedTimeCardSpecimen }),
  "feed-logos-card": entry({ id: "feed-logos-card", name: "Feed logos card", category: "Cards", description: "Looping client-name marquee card.", sourcePath: "src/components/home-feed.tsx", variants: ["marquee"], Specimen: FeedLogosCardSpecimen }),
  "feed-awards-card": entry({ id: "feed-awards-card", name: "Feed awards card", category: "Cards", description: "Recognition count card.", sourcePath: "src/components/home-feed.tsx", variants: ["count"], Specimen: FeedAwardsCardSpecimen }),
  "feed-sounds-card": entry({ id: "feed-sounds-card", name: "Feed sounds card", category: "Cards", description: "Studio playlist card.", sourcePath: "src/components/home-feed.tsx", variants: ["playlist"], Specimen: FeedSoundsCardSpecimen }),
  "feed-services-card": entry({ id: "feed-services-card", name: "Feed services card", category: "Cards", description: "Animated service-word typewriter card.", sourcePath: "src/components/home-feed.tsx", variants: ["strategy", "identity", "design", "motion"], Specimen: FeedServicesCardSpecimen }),
  "public-navigation": entry({ id: "public-navigation", name: "Public navigation", category: "Compositions", description: "Fixed wordmark, menu panel, links, contact CTA and showreel player.", sourcePath: "src/components/public-navigation.tsx", variants: ["dark tone", "light tone", "open", "closing", "showreel"], Specimen: NavigationSpecimen, controls: navigationControls }),
  "work-journal": entry({ id: "work-journal", name: "Work Journal", category: "Compositions", description: "Project collection composed from filters, view controls and project cards.", sourcePath: "src/components/work-journal-section.tsx", variants: ["grid", "list", "filtered", "alternating"], Specimen: WorkSpecimen, controls: workControls }),
  "home-feed": entry({ id: "home-feed", name: "Home Feed", category: "Compositions", description: "The production feed assembled from every registered feed card family.", sourcePath: "src/components/home-feed.tsx", variants: ["three-column", "responsive"], Specimen: HomeFeedSpecimen }),
  "team-directory": entry({ id: "team-directory", name: "Team directory", category: "Compositions", description: "Grouped team profiles with hover preview, contact CTA and open roles.", sourcePath: "src/components/team-page-client.tsx", variants: ["grouped profiles"], Specimen: TeamDirectorySpecimen }),
  "long-form-player": entry({ id: "long-form-player", name: "Long-form player", category: "Compositions", description: "Case-study player assembled from the registered media controls.", sourcePath: "src/components/case-study-long-form-player.tsx", variants: ["MP4", "paused", "playing", "muted", "fullscreen"], Specimen: PlayerSpecimen, controls: playerControls }),
  "case-study-media": entry({ id: "case-study-media", name: "Commentable case-study media", category: "Compositions", description: "Shared image, autoplay video or long-form player surface with positioned comments.", sourcePath: "src/components/case-study-media.tsx", variants: ["image", "video", "long-form", "cover", "contain", "comments"], Specimen: CaseStudyMediaSpecimen }),
  "case-study-related-projects": entry({ id: "case-study-related-projects", name: "Related case studies", category: "Compositions", description: "Related-project heading, index link and production card grid shared by both detail variants.", sourcePath: "src/components/case-study-related.tsx", variants: ["standard detail", "padded detail"], Specimen: CaseStudyRelatedProjectsSpecimen }),
  "careers-open-roles": entry({ id: "careers-open-roles", name: "Careers open roles", category: "Compositions", description: "Careers contact copy, copy-email CTA and directional role rows.", sourcePath: "src/components/careers-open-roles.tsx", variants: ["roles", "empty"], Specimen: CareersSpecimen, controls: careersControls }),
  "careers-benefits": entry({ id: "careers-benefits", name: "Careers benefits", category: "Compositions", description: "Three-column benefits composition assembled from the shared Careers benefit card.", sourcePath: "src/components/careers-cards.tsx", variants: ["desktop columns", "responsive stack"], Specimen: CareersBenefitsSpecimen }),
};

export const publicComponentDefinitions = publicComponentIds.map((id) => publicComponentRegistry[id]);
