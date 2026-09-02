"use client";

import { useEffect, useRef, useState } from "react";
import detailStyles from "@/app/(site)/detail-page.module.css";
import paddedDetailStyles from "@/app/(site)/case-studies-padded/[slug]/detail-page-padded.module.css";
import { CaseStudyCommentsToggle, CaseStudyCommentTrigger } from "@/components/case-study-comment-note";
import { CaseStudyCarouselButton } from "@/components/case-study-actions";
import { CaseStudyDisclosureButton, CaseStudyFact, CaseStudyInformation } from "@/components/case-study-information";
import { CaseStudyMedia } from "@/components/case-study-media";
import { CaseStudyAllProjectsLink, CaseStudyRelatedProjectCard, CaseStudyRelatedProjects } from "@/components/case-study-related";
import {
  CaseStudyPlayerFullscreenControl,
  CaseStudyPlayerPlayControl,
  CaseStudyPlayerControls,
  CaseStudyPlayerTimeline,
  CaseStudyPlayerVolumeControl,
} from "@/components/case-study-long-form-player";
import { CopyEmailCta } from "@/components/copy-email-cta";
import { ContactCta } from "@/components/contact-cta";
import { CareersTrustLogos } from "@/components/careers-trust-logos";
import { CareersBenefitCard, CareersBenefits, CareersFilmstripCard, CareersFounderCard } from "@/components/careers-cards";
import { CareersPillarsGrid } from "@/components/careers-pillars-grid";
import careersPageStyles from "@/app/(site)/careers/page.module.css";
import careersMosaicStyles from "@/app/(site)/careers/careers-mosaic.module.css";
import careersTypeStyles from "@/styles/careers-typography.module.css";
import homeFeedStyles from "@/components/home-feed.module.css";
import {
  HomeFeedAwardsCard,
  HomeFeedCopyCard,
  HomeFeedMediaCard,
  HomeFeedLogosCard,
  HomeFeedNewsCard,
  HomeFeedPill,
  HomeFeedServicesCard,
  HomeFeedSimpleCard,
  HomeFeedSoundsCard,
  HomeFeedTimeCard,
} from "@/components/home-feed";
import {
  NavigationDismissButton,
  NavigationLogoLink,
  NavigationMenuButton,
  NavigationMenuLink,
  NavigationShowreelButton,
} from "@/components/public-navigation";
import navStyles from "@/components/public-navigation.module.css";
import { ProfileLink } from "@/components/profile-link";
import { TeamMemberCard } from "@/components/team-page-client";
import teamStyles from "@/components/team-page-client.module.css";
import {
  WorkJournalCard,
  WorkJournalFilterButton,
  WorkJournalFilterGroup,
  WorkJournalMobileCategoriesButton,
  WorkJournalMobileCloseButton,
  WorkJournalViewToggle,
} from "@/components/work-journal-section";
import { specimenNav, specimenTeamMember, specimenWork } from "@/components/component-system/fixtures";

const plainSurface = { minHeight: 96, padding: 24, position: "relative" as const };
const cardSurface = { maxWidth: 420, margin: "0 auto", padding: 20 };
const matrix = { alignItems: "start", display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", padding: 20 };
type SpecimenVariantProps = { variant?: string };

export function NavigationLogoLinkSpecimen({ variant }: SpecimenVariantProps) {
  return <div style={plainSurface}><NavigationLogoLink variant={variant === "panel" ? "panel" : "header"} /></div>;
}

export function NavigationMenuButtonSpecimen({ variant }: SpecimenVariantProps) {
  const [expanded, setExpanded] = useState(variant === "expanded");
  const tone = variant === "light tone" ? "light" : "dark";
  return <div data-tone={tone} style={{ ...plainSurface, background: tone === "light" ? "#171717" : "#fff", color: tone === "light" ? "#fff" : "#000" }}><NavigationMenuButton expanded={expanded} onClick={() => setExpanded((value) => !value)} /></div>;
}

export function NavigationDismissButtonSpecimen({ variant }: SpecimenVariantProps) {
  if (variant === "player") return <div className={navStyles.playerShell} style={{ minHeight: 120, width: "100%" }}><NavigationDismissButton onClick={() => undefined} variant="player" /></div>;
  if (variant === "backdrop") return <div className={navStyles.playerOverlay} style={{ display: "block", minHeight: 120, position: "relative" }}><NavigationDismissButton onClick={() => undefined} variant="backdrop" /></div>;
  return (
    <div style={{ ...plainSurface, background: "#f1ebe2" }}>
      <div className={navStyles.panel} data-open="true" style={{ clipPath: "none", height: 120, position: "relative" }}>
        <div className={navStyles.closeBar}><NavigationDismissButton onClick={() => undefined} /></div>
      </div>
    </div>
  );
}

export function NavigationMenuLinkSpecimen({ variant }: SpecimenVariantProps) {
  const secondary = variant === "secondary";
  const item = variant === "external" ? { label: "Instagram", href: "https://instagram.com" } : specimenNav[0];
  return <div style={{ ...plainSurface, background: "#f1ebe2" }}><ul className={secondary ? navStyles.secondaryList : navStyles.primaryList}><li><NavigationMenuLink item={item} /></li></ul></div>;
}

export function NavigationShowreelButtonSpecimen() {
  return <div className={navStyles.showreelColumn} style={{ ...plainSurface, minHeight: 300 }}><NavigationShowreelButton onClick={() => undefined} title="Ripe Showreel" /></div>;
}

export function ContactCtaSpecimen() {
  return <div style={plainSurface}><ContactCta /></div>;
}

export function WorkJournalFilterButtonSpecimen({ variant }: SpecimenVariantProps) {
  const [active, setActive] = useState(variant === "active");
  return <div style={plainSurface}><WorkJournalFilterButton active={active} label="Strategy" onClick={() => setActive((value) => !value)} /></div>;
}

export function WorkJournalFilterGroupSpecimen({ variant }: SpecimenVariantProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>(variant === "multiple active" ? ["Strategy", "Motion"] : ["Strategy"]);
  const filters = ["Strategy", "Identity", "Motion", "Web Design"];
  return <div style={{ ...plainSurface, maxWidth: variant === "mobile" ? 390 : undefined }}><WorkJournalFilterGroup activeFilters={activeFilters} filters={filters} onToggle={(filter) => setActiveFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter])} /></div>;
}

export function WorkJournalViewToggleSpecimen({ variant }: SpecimenVariantProps) {
  const [view, setView] = useState<"grid" | "list">(variant === "list" ? "list" : "grid");
  return <div style={plainSurface}><WorkJournalViewToggle buttonViewMode={variant === "preview" ? view : view === "grid" ? "list" : "grid"} onClick={() => setView((value) => value === "grid" ? "list" : "grid")} viewMode={view} /></div>;
}

export function WorkJournalMobileCategoriesSpecimen({ variant }: SpecimenVariantProps) {
  const [expanded, setExpanded] = useState(variant === "expanded");
  return <div style={plainSurface}><WorkJournalMobileCategoriesButton expanded={expanded} onClick={() => setExpanded((value) => !value)} /></div>;
}

export function WorkJournalMobileCloseSpecimen() {
  return <div style={plainSurface}><WorkJournalMobileCloseButton onClick={() => undefined} /></div>;
}

export function WorkJournalCardSpecimen({ variant }: SpecimenVariantProps) {
  const videoItem = { ...specimenWork[1], coverMedia: { kind: "video" as const, src: "/feed-media/polestar.mp4", poster: "/feed-media/polestar.jpg", alt: "Video card specimen" } };
  const isVideo = variant === "video";
  return <div data-view={variant === "list" ? "list" : "grid"} style={matrix}><WorkJournalCard hovered={variant === "hovered"} item={isVideo ? videoItem : specimenWork[0]} listLabelVisible={variant === "list"} /></div>;
}

export function FeedPillSpecimen({ variant }: SpecimenVariantProps) {
  return <div style={plainSurface}><HomeFeedPill action={variant === "label" ? undefined : "View"}>Case Study</HomeFeedPill></div>;
}

export function FeedSimpleCardSpecimen({ variant }: SpecimenVariantProps) {
  const size = variant === "medium" || variant === "square" ? variant : "small";
  return <div style={cardSurface}><HomeFeedSimpleCard action="View" href={variant === "interactive" ? "#feed-simple" : undefined} label="Case Study" size={size} title={`${size[0].toUpperCase()}${size.slice(1)}`} /></div>;
}
export function FeedMediaCardSpecimen({ variant }: SpecimenVariantProps) {
  const video = variant === "video" || variant === "poster-first";
  return <div className={homeFeedStyles.feed}><div style={cardSurface}>{video ? <HomeFeedMediaCard kind="video" href="#feed-video" label="Case Study" title="Video" src="/feed-media/polestar.mp4" poster="/feed-media/polestar.jpg" /> : <HomeFeedMediaCard kind="image" href="#feed-image" label="Case Study" position={variant === "positioned media" ? "35% 65%" : undefined} size={variant === "medium" ? "medium" : "square"} title="Image" src="/work-media/polaris.png" />}</div></div>;
}
export function FeedNewsCardSpecimen({ variant }: SpecimenVariantProps) { return <div style={cardSurface}><HomeFeedNewsCard href={variant === "static" ? undefined : "#feed-news"} label="Studio Thoughts" title="Example journal title" caption="Local specimen content" /></div>; }
export function FeedCopyCardSpecimen({ variant }: SpecimenVariantProps) { return <div style={cardSurface}><HomeFeedCopyCard href={variant === "interactive" ? "#feed-copy" : undefined} large={variant === "large"}>Local specimen content for the production copy card.</HomeFeedCopyCard></div>; }
export function FeedTimeCardSpecimen() { return <div style={cardSurface}><HomeFeedTimeCard /></div>; }
export function FeedLogosCardSpecimen() { return <div style={cardSurface}><HomeFeedLogosCard /></div>; }
export function FeedAwardsCardSpecimen() { return <div style={cardSurface}><HomeFeedAwardsCard /></div>; }
export function FeedSoundsCardSpecimen() { return <div style={cardSurface}><HomeFeedSoundsCard /></div>; }
export function FeedServicesCardSpecimen({ variant }: SpecimenVariantProps) { return <div style={cardSurface}><HomeFeedServicesCard word={variant} /></div>; }

export function CaseStudyFactSpecimen({ variant }: SpecimenVariantProps) {
  const facts: Record<string, [string, string]> = { brand: ["Brand", "Example brand"], services: ["Services", "Strategy, Identity"], industry: ["Industry", "Technology"], year: ["Year", "2026"] };
  const [label, value] = facts[variant ?? "brand"] ?? facts.brand;
  return <div style={{ ...plainSurface, maxWidth: 900 }}><CaseStudyFact label={label} styles={detailStyles}>{value}</CaseStudyFact></div>;
}

export function CaseStudyInformationVariantsSpecimen({ variant }: SpecimenVariantProps) {
  const paragraphs = variant === "short"
    ? ["A concise production information treatment."]
    : [
      "A shared language gives a project enough structure to remain recognizable while leaving room for people, content and context to change it.",
      "This specimen deliberately contains enough copy to demonstrate the measured ten-line collapsed state and the production See More interaction. The same component is rendered by both case-study detail variants.",
      "The system stays useful because the documented behavior is the production implementation.",
    ];
  return <div style={{ ...plainSurface, maxWidth: 560 }}><CaseStudyInformation defaultExpanded={variant === "expanded"} paragraphs={paragraphs} styles={detailStyles} /></div>;
}

export function CaseStudyDisclosureSpecimen({ variant }: SpecimenVariantProps) {
  const [expanded, setExpanded] = useState(variant === "expanded");
  return <div style={plainSurface}><CaseStudyDisclosureButton expanded={expanded} onToggle={() => setExpanded((value) => !value)} styles={detailStyles} /></div>;
}

export function CommentTriggerSpecimen({ variant }: SpecimenVariantProps) {
  const [active, setActive] = useState(variant === "open");
  const avatar = variant === "avatar" ? "/team-media/placeholder.svg" : undefined;
  return <div style={{ ...plainSurface, minHeight: 180 }}><CaseStudyCommentTrigger buttonProps={{ onClick: () => setActive((value) => !value) }} comment={{ author: "Ripe Studios", avatar, body: "A shared production note component." }} index={0} isActive={active} styles={detailStyles} /></div>;
}

export function CommentsToggleSpecimen({ variant }: SpecimenVariantProps) {
  const [visible, setVisible] = useState(variant === "hide");
  return <div style={{ ...plainSurface, minHeight: 180 }}><CaseStudyCommentsToggle commentsVisible={visible} onToggle={() => setVisible((value) => !value)} styles={detailStyles} /></div>;
}

export function CaseStudyCarouselButtonSpecimen({ variant }: SpecimenVariantProps) {
  const [direction, setDirection] = useState<"previous" | "next">(variant === "next" ? "next" : "previous");
  return <div style={plainSurface}><CaseStudyCarouselButton direction={direction} onClick={() => setDirection((value) => value === "previous" ? "next" : "previous")} styles={detailStyles} /></div>;
}

const relatedProject = { title: "Polaris", year: "2026", image: "/work-media/polaris.png", href: "/case-studies/polaris" as const };

export function CaseStudyAllProjectsLinkSpecimen({ variant }: SpecimenVariantProps) {
  const styles = variant === "padded detail" ? paddedDetailStyles : detailStyles;
  return <div className={styles.formaMoreHeader} style={plainSurface}><CaseStudyAllProjectsLink styles={styles} /></div>;
}

export function CaseStudyRelatedProjectCardSpecimen({ variant }: SpecimenVariantProps) {
  const styles = variant === "padded detail" ? paddedDetailStyles : detailStyles;
  return <div className={styles.formaProjectGrid} style={{ padding: 20 }}><CaseStudyRelatedProjectCard project={relatedProject} styles={styles} /></div>;
}

export function CaseStudyRelatedProjectsSpecimen({ variant }: SpecimenVariantProps) {
  const styles = variant === "padded detail" ? paddedDetailStyles : detailStyles;
  return <CaseStudyRelatedProjects projects={[relatedProject, { ...relatedProject, title: "Zetachain", href: "/case-studies/zetachain" }]} styles={styles} />;
}

export function CaseStudyMediaSpecimen({ variant }: SpecimenVariantProps) {
  const video = variant === "video" || variant === "long-form";
  return (
    <div style={{ height: 360 }}>
      <CaseStudyMedia
        commentsVisible={variant === "comments"}
        fitMode={variant === "contain" ? "contain" : "cover"}
        imageSizes="100vw"
        media={{
          src: video ? "/feed-media/polestar.mp4" : "/work-media/polaris.png",
          alt: "Case-study media specimen",
          kind: video ? "video" : "image",
          poster: video ? "/feed-media/polestar.jpg" : undefined,
          longForm: variant === "long-form" ? { enabled: true, hlsUrl: "/feed-media/polestar.mp4" } : undefined,
          comments: [{ id: "media-note", author: "Ripe", body: "Local specimen note.", x: 72, y: 24, createdAt: "2026-09-01" }],
        }}
        mediaClassName={detailStyles.formaSectionMedia}
        sectionId="component-system-media"
        styles={detailStyles}
      />
    </div>
  );
}

function PlayerControlSurface({ children, playing = false }: { children: React.ReactNode; playing?: boolean }) {
  return <div className={detailStyles.detailLongFormPlayer} data-player-status={playing ? "playing" : "paused"} data-player-muted="false" data-player-fullscreen="false" style={{ minHeight: 180, background: "#000" }}><div className={detailStyles.detailLongFormInterface}><div className={detailStyles.detailLongFormInterfaceBottom}>{children}</div></div></div>;
}

export function PlayerControlsSpecimen({ variant }: SpecimenVariantProps) {
  const [playing, setPlaying] = useState(variant === "playing");
  const [progress, setProgress] = useState(38);
  const [volume, setVolume] = useState(variant === "muted" ? 0 : 0.7);
  const [fullscreen, setFullscreen] = useState(variant === "fullscreen");
  return (
    <div className={detailStyles.detailLongFormPlayer} data-player-status={playing ? "playing" : "paused"} data-player-muted={volume === 0 ? "true" : "false"} data-player-fullscreen={fullscreen ? "true" : "false"} style={{ minHeight: 180, background: "#000" }}>
      <div className={detailStyles.detailLongFormInterface}>
        <CaseStudyPlayerControls
          bufferedPercent={72}
          currentTime={progress}
          duration={100}
          effectiveMuted={volume === 0}
          fullscreen={fullscreen}
          isPlaying={playing}
          onTimelineKeyDown={(event) => { if (event.key === "ArrowRight") setProgress((value) => Math.min(100, value + 5)); if (event.key === "ArrowLeft") setProgress((value) => Math.max(0, value - 5)); }}
          onTimelinePointerDown={() => setProgress((value) => value === 38 ? 68 : 38)}
          onToggleFullscreen={() => setFullscreen((value) => !value)}
          onToggleMute={() => setVolume((value) => value === 0 ? 0.7 : 0)}
          onTogglePlay={() => setPlaying((value) => !value)}
          onVolumeChange={setVolume}
          onWake={() => undefined}
          progress={progress}
          styles={detailStyles}
          volumePercent={Math.round(volume * 100)}
        />
      </div>
    </div>
  );
}

export function PlayerPlayControlSpecimen({ variant }: SpecimenVariantProps) {
  const [playing, setPlaying] = useState(variant === "pause");
  return <PlayerControlSurface playing={playing}><CaseStudyPlayerPlayControl compact={variant !== "center"} isPlaying={playing} onClick={() => setPlaying((value) => !value)} styles={detailStyles} /></PlayerControlSurface>;
}

export function PlayerTimelineSpecimen({ variant }: SpecimenVariantProps) {
  const [progress, setProgress] = useState(variant === "idle" ? 0 : variant === "dragging" ? 68 : 38);
  return <PlayerControlSurface><CaseStudyPlayerTimeline bufferedPercent={variant === "idle" ? 0 : 72} currentTime={progress} duration={100} onKeyDown={(event) => { if (event.key === "ArrowRight") setProgress((value) => Math.min(100, value + 5)); if (event.key === "ArrowLeft") setProgress((value) => Math.max(0, value - 5)); }} onPointerDown={() => setProgress((value) => value === 38 ? 68 : 38)} progress={progress} styles={detailStyles} /></PlayerControlSurface>;
}

export function PlayerVolumeControlSpecimen({ variant }: SpecimenVariantProps) {
  const [volume, setVolume] = useState(variant === "muted" ? 0 : 0.7);
  return <PlayerControlSurface><div className={detailStyles.detailLongFormInterfaceButtons}><CaseStudyPlayerVolumeControl effectiveMuted={volume === 0} onChange={setVolume} onToggleMute={() => setVolume((value) => value === 0 ? 0.7 : 0)} onWake={() => undefined} styles={detailStyles} volumePercent={Math.round(volume * 100)} /></div></PlayerControlSurface>;
}

export function PlayerFullscreenControlSpecimen({ variant }: SpecimenVariantProps) {
  const [fullscreen, setFullscreen] = useState(variant === "exit");
  return <PlayerControlSurface><div className={detailStyles.detailLongFormInterfaceButtons}><CaseStudyPlayerFullscreenControl fullscreen={fullscreen} onClick={() => setFullscreen((value) => !value)} styles={detailStyles} /></div></PlayerControlSurface>;
}

export function CopyEmailSpecimen({ variant }: SpecimenVariantProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (variant !== "copied" && variant !== "touch feedback") return;
    containerRef.current?.querySelector<HTMLElement>('[role="button"]')?.click();
  }, [variant]);
  return <div ref={containerRef} style={plainSurface}><CopyEmailCta className={teamStyles.copyEmail} email="careers@ripe.studio" /></div>;
}

export function CareersTrustLogosSpecimen({ variant }: SpecimenVariantProps) {
  return <div style={plainSurface}><CareersTrustLogos logos={["/logos/trust-logo-1.svg", "/logos/trust-logo-2.svg", "/logos/trust-logo-3.svg", "/logos/trust-logo-4.svg"]} reveal={variant === "entering" ? "entering" : "visible"} styles={careersPageStyles} /></div>;
}

export function CareersPillarCardSpecimen() {
  return (
    <CareersPillarsGrid
      pillars={[
        { title: "Collective Progression", body: "Local specimen content for the production Careers pillar card." },
        { title: "Strategic Craft", body: "Local specimen content for the production Careers pillar card." },
        { title: "Human Ambition", body: "Local specimen content for the production Careers pillar card." },
      ]}
      styles={careersPageStyles}
    />
  );
}

export function CareersFounderCardSpecimen({ variant }: SpecimenVariantProps) {
  const photo = variant === "fallback portrait" ? "/team-media/placeholder.svg" : specimenTeamMember.avatar?.src ?? "/team-media/placeholder.svg";
  return <div style={{ maxWidth: 420, padding: 20 }}><CareersFounderCard name="Example founder" photo={photo} role="Example role" styles={careersPageStyles} /></div>;
}

export function CareersBenefitCardsSpecimen({ variant }: SpecimenVariantProps) {
  const selected = (variant === "home office" ? "home-office" : variant ?? "books") as "books" | "referral" | "headspace" | "flexible" | "offsite" | "commission" | "learning" | "wework" | "home-office";
  return <div className={`${careersMosaicStyles.wrap} ${careersTypeStyles.scope}`} style={{ padding: 20 }}><CareersBenefitCard styles={careersMosaicStyles} variant={selected}><h3 className={careersTypeStyles.benefitCardMain}>{selected.replace("-", " ")}</h3></CareersBenefitCard></div>;
}

export function CareersBenefitsSpecimen({ variant }: SpecimenVariantProps) {
  return <div style={{ maxWidth: variant === "responsive stack" ? 640 : undefined, margin: "0 auto", padding: 20 }}><CareersBenefits styles={careersMosaicStyles} /></div>;
}

export function CareersFilmstripCardSpecimen({ variant }: SpecimenVariantProps) {
  const video = variant === "video";
  const className = variant === "tall" ? "frameTall" : variant === "square" ? "frameSquare" : "frameWide";
  return <div style={{ padding: 20 }}><CareersFilmstripCard copy={0} items={[video ? { kind: "video", className, src: "/careers-media/filmstrip-motion.mp4", alt: "Filmstrip motion specimen" } : { kind: "image", className, src: "/careers-media/filmstrip-1.jpeg", alt: "Filmstrip specimen" }]} styles={careersPageStyles} /></div>;
}

export function ProfileLinkSpecimen({ variant }: SpecimenVariantProps) {
  const external = variant === "external";
  const href = variant === "mailto" ? "mailto:hello@ripe.studio" : external ? "https://instagram.com" : "#profile-link";
  return <div style={plainSurface}><ProfileLink external={external} href={href}>Profile link</ProfileLink></div>;
}

export function TeamMemberCardSpecimen({ variant }: SpecimenVariantProps) {
  const member = variant === "image fallback" ? { ...specimenTeamMember, avatar: undefined } : specimenTeamMember;
  return <div style={cardSurface}><TeamMemberCard active={variant === "active"} member={member} /></div>;
}
