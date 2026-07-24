"use client";

import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import teamStyles from "@/components/team-page-client.module.css";
import type { JobPosting } from "@/types/content";

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
      className={`directional-list__item w-dyn-item ${teamStyles.directionalItem}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a href={role.externalUrl} target="_blank" rel="noreferrer" className="jobs_row-link w-inline-block">
        <div
          ref={tileRef}
          data-directional-hover-tile=""
          className={`directional-list__hover-tile-2 ${teamStyles.directionalTile}`}
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

export default function CareersOpenRoles({ roles }: { roles: JobPosting[] }) {
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
    <div className="join_us-section" style={{ background: "transparent" }}>
      <section className="join_us-wrap">
        <div className="join_us">
          <div className="join_us_content">
            <div className="w-layout-vflex content-wrap u-justify-left">
              <h1 className="heading u-maxwidth-800 u-size-32 u-align-left" data-careers-reveal>Join Us</h1>
              <div className="text u-text-primary" data-careers-reveal data-careers-reveal-delay="1">
                All our roles are remote and flexible, keeping with our studio policy.
                <br />
                Aliqua quis magna eu ipsum consectetur. Esse cupidatat consectetur do sint esse aliquip.
                <br />
                <br />
                If you don&apos;t see a open role here that fits you, but you still think you&apos;d be a good fit at
                Ripe, feel free to drop a line at{" "}
                <span
                  data-email="careers@ripe.studio"
                  data-tooltip={tooltip}
                  className={`copy-email ${teamStyles.copyEmail} ${
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
                We&apos;re always on the lookout for talent, and if we find the right people, we will make it work for
                you!
              </div>
            </div>

            <div className="w-layout-vflex content-wrap u-justify-left u-width-full">
              <div className="w-layout-hflex content-wrap u-width-full u-align-top">
                <h1 className="heading u-maxwidth-800 u-size-32 u-align-left" data-careers-reveal>Open Roles</h1>
              </div>

              <div data-type="all" data-directional-hover="" data-careers-reveal data-careers-reveal-delay="1" className={`jobs-list-wrapper w-dyn-list ${teamStyles.directionalWrap}`}>
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
  );
}
