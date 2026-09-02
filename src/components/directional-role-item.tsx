"use client";

import { useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import styles from "@/components/team-page-client.module.css";
import type { JobPosting } from "@/types/content";

export type DirectionalRoleItemProps = {
  disableDirectionalTile?: boolean;
  initialEntryDirection?: EntryDirection;
  onItemEnter?: (element: HTMLDivElement) => void;
  role: JobPosting;
  titleElement?: "p" | "h4";
};

type DirectionalRoleLinkProps = DirectionalRoleItemProps & {
  tileRef?: React.Ref<HTMLDivElement>;
};

function DirectionalRoleLink({ role, tileRef, titleElement = "p" }: DirectionalRoleLinkProps) {
  const TitleElement = titleElement;
  return (
    <a href={role.externalUrl} target="_blank" rel="noreferrer" className="jobs_row-link w-inline-block">
      {tileRef ? <div ref={tileRef} data-directional-hover-tile="" className={`directional-list__hover-tile-2 ${styles.directionalTile}`} /> : null}
      <div className="directional-list__border is--item" />
      <div className="directional-list__col-award">
        <TitleElement className="direcitonal-list__p">{role.title} - {role.location}</TitleElement>
      </div>
      <div className="directional-list__col-year"><p className="direcitonal-list__p">{role.contractType}</p></div>
    </a>
  );
}

export type EntryDirection = "top" | "right" | "bottom" | "left";

function getDirection(event: MouseEvent<HTMLElement>, element: HTMLElement): EntryDirection {
  const { left, top, width, height } = element.getBoundingClientRect();
  const distances: Record<EntryDirection, number> = {
    top: event.clientY - top,
    right: width - (event.clientX - left),
    bottom: height - (event.clientY - top),
    left: event.clientX - left,
  };

  return Object.entries(distances).reduce((closest, candidate) =>
    closest[1] < candidate[1] ? closest : candidate,
  )[0] as EntryDirection;
}

function toTransform(direction: EntryDirection) {
  if (direction === "top") return "translateY(-100%)";
  if (direction === "bottom") return "translateY(100%)";
  if (direction === "left") return "translateX(-100%)";
  return "translateX(100%)";
}

export function DirectionalRoleItem({ disableDirectionalTile = false, initialEntryDirection, onItemEnter, role, titleElement = "p" }: DirectionalRoleItemProps) {
  const tileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const tile = tileRef.current;
    if (!tile || !initialEntryDirection) return;
    tile.style.transition = "none";
    tile.style.transform = toTransform(initialEntryDirection);
    const frame = window.requestAnimationFrame(() => {
      tile.style.transition = "";
      tile.style.transform = "translate(0%, 0%)";
    });
    return () => window.cancelAnimationFrame(frame);
  }, [initialEntryDirection]);

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    onItemEnter?.(event.currentTarget);
    if (disableDirectionalTile) return;
    const tile = tileRef.current;
    if (!tile) return;

    tile.style.transition = "none";
    tile.style.transform = toTransform(getDirection(event, event.currentTarget));
    void tile.offsetHeight;
    tile.style.transition = "";
    tile.style.transform = "translate(0%, 0%)";
  };

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    if (disableDirectionalTile) return;
    if (!tileRef.current) return;
    tileRef.current.style.transform = toTransform(getDirection(event, event.currentTarget));
  };

  return (
    <div
      data-directional-hover-item=""
      role="listitem"
      className={`directional-list__item w-dyn-item ${styles.directionalItem}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <DirectionalRoleLink role={role} tileRef={disableDirectionalTile ? undefined : tileRef} titleElement={titleElement} />
    </div>
  );
}
