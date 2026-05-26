"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import type { JobPosting, TeamMember } from "@/types/content";
import styles from "@/components/team-page-client.module.css";

type TeamPageClientProps = {
  members: TeamMember[];
  roles: JobPosting[];
};

const PLACEHOLDER_IMAGE = "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg";
const GROUP_ORDER = ["Leadership", "Brand", "Motion", "Web", "Operations"];

function normalizeGroup(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return "Team";
  return trimmed
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function DirectionalRoleItem({ role }: { role: JobPosting }) {
  const tileRef = useRef<HTMLDivElement | null>(null);

  const getDirection = (event: MouseEvent<HTMLElement>, element: HTMLElement) => {
    const { left, top, width, height } = element.getBoundingClientRect();
    const x = event.clientX - left;
    const y = event.clientY - top;
    const distances = {
      top: y,
      right: width - x,
      bottom: height - y,
      left: x,
    };

    return (Object.entries(distances).reduce((a, b) => (a[1] < b[1] ? a : b))[0] ?? "top") as
      | "top"
      | "right"
      | "bottom"
      | "left";
  };

  const toTransform = (direction: "top" | "right" | "bottom" | "left") => {
    if (direction === "top") return "translateY(-100%)";
    if (direction === "bottom") return "translateY(100%)";
    if (direction === "left") return "translateX(-100%)";
    return "translateX(100%)";
  };

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    const tile = tileRef.current;
    if (!tile) return;

    const direction = getDirection(event, event.currentTarget);
    tile.style.transition = "none";
    tile.style.transform = toTransform(direction);
    void tile.offsetHeight;
    tile.style.transition = "";
    tile.style.transform = "translate(0%, 0%)";
  };

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    const tile = tileRef.current;
    if (!tile) return;

    const direction = getDirection(event, event.currentTarget);
    tile.style.transform = toTransform(direction);
  };

  return (
    <div
      data-directional-hover-item=""
      role="listitem"
      className={`directional-list__item w-dyn-item ${styles.directionalItem}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a href={role.externalUrl} target="_blank" rel="noreferrer" className="jobs_row-link w-inline-block">
        <div
          ref={tileRef}
          data-directional-hover-tile=""
          className={`directional-list__hover-tile-2 ${styles.directionalTile}`}
        />
        <div className="directional-list__border is--item" />
        <div className="directional-list__col-award">
          <p className="direcitonal-list__p">
            {role.title} - {role.location}
          </p>
        </div>
        <div className="directional-list__col-year">
          <p className="direcitonal-list__p">{role.contractType}</p>
        </div>
      </a>
    </div>
  );
}

export function TeamPageClient({ members, roles }: TeamPageClientProps) {
  const groupedMembers = useMemo(() => {
    const groupMap = new Map<string, TeamMember[]>();

    for (const member of members) {
      const group = normalizeGroup(member.group);
      const list = groupMap.get(group) ?? [];
      list.push(member);
      groupMap.set(group, list);
    }

    for (const [, list] of groupMap) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    const orderedGroups = GROUP_ORDER.filter((group) => groupMap.has(group));
    const dynamicGroups = [...groupMap.keys()]
      .filter((group) => !GROUP_ORDER.includes(group))
      .sort((a, b) => a.localeCompare(b));

    const grouped = [...orderedGroups, ...dynamicGroups].map((group) => ({
      group,
      members: groupMap.get(group) ?? [],
    }));

    if (grouped.length === 0) {
      return [{ group: "Team", members: [] }];
    }

    return grouped;
  }, [members]);

  const [activeByGroup, setActiveByGroup] = useState<Record<string, string | null>>({});
  const [tooltip, setTooltip] = useState("Copy");
  const [tooltipState, setTooltipState] = useState<"idle" | "visible" | "hiding">("idle");

  const copyEmail = async () => {
    const email = "careers@ripe.studio";
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = email;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    setTooltip("Copied to clipboard");

    if (window.matchMedia("(hover: none)").matches) {
      setTooltipState("visible");
      window.setTimeout(() => {
        setTooltipState("hiding");
        window.setTimeout(() => {
          setTooltipState("idle");
          setTooltip("Copy");
        }, 300);
      }, 1500);
    }
  };

  return (
    <>
      <section className="main">
        <section className="team_hero section u-align-left">
          <h1 className="heading u-maxwidth-800 u-size-32">
            These are the people behind Ripe, moments of insight from the designers, developers, and thinkers who give
            the studio its energy.
          </h1>
        </section>

        <section className="team_chart">
          {groupedMembers.map(({ group, members: groupMembers }) => {
            const activeSlug = activeByGroup[group] ?? null;
            const activeMember = groupMembers.find((member) => member.slug === activeSlug) ?? null;

            return (
              <div key={group} className="w-layout-vflex team-row">
                <div className="horizontal-rule" />
                <div
                  className={`w-layout-vflex team-group ${activeSlug ? styles.groupHovering : ""}`}
                  onMouseLeave={() => {
                    setActiveByGroup((prev) => ({ ...prev, [group]: null }));
                  }}
                >
                  <div className="team_group-title">{group}</div>
                  <div data-hover-img-wrap="true" className="team_img-wrap">
                    <img
                      src={activeMember?.avatar?.src || PLACEHOLDER_IMAGE}
                      loading="lazy"
                      data-hover-target="true"
                      alt=""
                      className={`team_member-image ${styles.teamMemberImage}`}
                    />
                  </div>
                  <div className="team-cms-wrap w-dyn-list">
                    <div role="list" className={`team-list w-dyn-items ${styles.teamList}`}>
                      {groupMembers.length > 0 ? (
                        groupMembers.map((member) => (
                          <div key={member.slug} role="listitem" className="collection-item-7 w-dyn-item">
                            <Link
                              data-team-card="true"
                              href={`/team/${member.slug}`}
                              className={`team-card_wrap-new w-inline-block ${styles.cardLink} ${
                                activeSlug === member.slug ? styles.cardActive : ""
                              }`}
                              onMouseEnter={() => {
                                setActiveByGroup((prev) => ({ ...prev, [group]: member.slug }));
                              }}
                            >
                              <div className="content-wrap u-flex-vertical u-align-left">
                                <img
                                  src={member.avatar?.src || PLACEHOLDER_IMAGE}
                                  loading="lazy"
                                  data-member-img="true"
                                  alt={member.name}
                                  sizes="100vw"
                                  className="team_image"
                                />
                                <div className="w-layout-hflex text-content">
                                  <div className="team-name-text">{member.name}</div>
                                  <div className="job_title-text">{member.role || "Team Member"}</div>
                                </div>
                              </div>
                              <div className="team_card-bg u-position-absolute u-absolute-cover" />
                              <div className="card-overlay" />
                            </Link>
                          </div>
                        ))
                      ) : (
                        <div className="w-dyn-empty">
                          <div>No team members found.</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="section" />
      </section>

      <div className="join_us-section">
        <section className="join_us-wrap">
          <div className="join_us">
            <div className="join_us_content">
              <div className="w-layout-vflex content-wrap u-justify-left">
                <h1 className="heading u-maxwidth-800 u-size-32 u-align-left">Join Us</h1>
                <div className="text u-text-primary">
                  All our roles are remote and flexible, keeping with our studio policy. Aliqua quis magna eu ipsum
                  consectetur. Esse cupidatat consectetur do sint esse aliquip.
                  <br />
                  <br />
                  If you don&apos;t see a open role here that fits you, but you still think you&apos;d be a good fit at Ripe,
                  feel free to drop a line at{" "}
                  <span
                    data-email="careers@ripe.studio"
                    data-tooltip={tooltip}
                    className={`copy-email ${
                      tooltipState === "visible" ? "tooltip-visible" : tooltipState === "hiding" ? "tooltip-hiding" : ""
                    }`}
                    onClick={copyEmail}
                    onMouseLeave={() => {
                      setTooltip("Copy");
                    }}
                  >
                    <span>careers@ripe.studio</span>
                  </span>
                  !
                  <br />
                  <br />
                  We&apos;re always on the lookout for talent, and if we find the right people, we will make it work for you!
                </div>
              </div>

              <div className="w-layout-vflex content-wrap u-justify-left u-width-full">
                <div className="w-layout-hflex content-wrap u-width-full u-align-top">
                  <h1 className="heading u-maxwidth-800 u-size-32 u-align-left">Open Roles</h1>
                </div>

                <div data-type="all" data-directional-hover="" className={`jobs-list-wrapper w-dyn-list ${styles.directionalWrap}`}>
                  <div role="list" className="jobs-list w-dyn-items">
                    {roles.map((role) => (
                      <DirectionalRoleItem key={`${role.title}-${role.location}-${role.contractType}`} role={role} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
