"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CareersOpenRolesSection } from "@/components/careers-open-roles";
import type { JobPosting, TeamMember } from "@/types/content";
import styles from "@/components/team-page-client.module.css";
import typeStyles from "@/styles/careers-typography.module.css";

export type TeamPageClientProps = {
  members: TeamMember[];
  roles: JobPosting[];
};

const PLACEHOLDER_IMAGE = "/team-media/placeholder.svg";
const GROUP_ORDER = ["Leadership", "Brand", "Motion", "Web", "Operations"];

export type TeamMemberCardProps = {
  active?: boolean;
  member: TeamMember;
  onActivate?: () => void;
};

export function TeamMemberCard({ active = false, member, onActivate }: TeamMemberCardProps) {
  return (
    <Link
      data-team-card="true"
      href={`/team/${member.slug}`}
      className={`team-card_wrap-new w-inline-block ${styles.cardLink} ${typeStyles.scope} ${active ? styles.cardActive : ""}`}
      onMouseEnter={onActivate}
      onFocus={onActivate}
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
          <div className={`team-name-text ${typeStyles.h3}`}>{member.name}</div>
          <div className={`job_title-text ${typeStyles.h4}`}>{member.role || "Team Member"}</div>
        </div>
      </div>
      <div className="team_card-bg u-position-absolute u-absolute-cover" />
      <div className="card-overlay" />
    </Link>
  );
}

function normalizeGroup(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return "Team";
  return trimmed
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
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
  return (
    <>
      <section className={`main ${typeStyles.scope}`}>
        <section className="team_hero section u-align-left">
          <h1 className={`heading u-maxwidth-800 u-size-32 ${typeStyles.h1}`}>
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
                  <div className={`team_group-title ${typeStyles.h2}`}>{group}</div>
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
                            <TeamMemberCard
                              active={activeSlug === member.slug}
                              member={member}
                              onActivate={() => {
                                setActiveByGroup((prev) => ({ ...prev, [group]: member.slug }));
                              }}
                            />
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

      <CareersOpenRolesSection roles={roles} />
    </>
  );
}
