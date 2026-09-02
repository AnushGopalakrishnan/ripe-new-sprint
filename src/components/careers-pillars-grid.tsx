"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

import { CareersPillarCard } from "@/components/careers-cards";

export type CareersPillar = {
  body: string;
  title: string;
};

export function CareersPillarsGrid({ pillars, styles }: { pillars: CareersPillar[]; styles: Record<string, string> }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isDrifting, setIsDrifting] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const driftEnableFrameRef = useRef<number | null>(null);
  const driftFrameRef = useRef<number | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const hoveredCardRectRef = useRef<DOMRect | null>(null);
  const isHoveringRef = useRef(false);
  const pendingDriftRef = useRef({ x: 0, y: 0 });
  const slideTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (driftEnableFrameRef.current !== null) window.cancelAnimationFrame(driftEnableFrameRef.current);
    if (driftFrameRef.current !== null) window.cancelAnimationFrame(driftFrameRef.current);
    if (slideTimerRef.current !== null) window.clearTimeout(slideTimerRef.current);
  }, []);

  const activatePillar = (index: number, cardRect: DOMRect) => {
    const isMovingBetweenCards = isHoveringRef.current;
    hoveredCardRectRef.current = cardRect;
    if (driftEnableFrameRef.current !== null) {
      window.cancelAnimationFrame(driftEnableFrameRef.current);
      driftEnableFrameRef.current = null;
    }
    setIsDrifting(false);
    setIsSliding(isMovingBetweenCards);
    setActiveIndex(index);
    setIsHovering(true);
    isHoveringRef.current = true;

    if (slideTimerRef.current !== null) {
      window.clearTimeout(slideTimerRef.current);
    }

    if (isMovingBetweenCards) {
      slideTimerRef.current = window.setTimeout(() => {
        setIsSliding(false);
        setIsDrifting(true);
        slideTimerRef.current = null;
      }, 840);
    } else {
      driftEnableFrameRef.current = window.requestAnimationFrame(() => {
        driftEnableFrameRef.current = window.requestAnimationFrame(() => {
          setIsDrifting(true);
          driftEnableFrameRef.current = null;
        });
      });
    }
  };

  const driftHighlight = (event: PointerEvent<HTMLDivElement>) => {
    const rect = hoveredCardRectRef.current ?? event.currentTarget.getBoundingClientRect();
    const x = Math.max(-6, Math.min(6, ((event.clientX - rect.left) / rect.width - 0.5) * 12));
    const y = Math.max(-6, Math.min(6, ((event.clientY - rect.top) / rect.height - 0.5) * 12));
    pendingDriftRef.current = { x, y };

    if (driftFrameRef.current === null) {
      driftFrameRef.current = window.requestAnimationFrame(() => {
        const drift = pendingDriftRef.current;
        gridRef.current?.style.setProperty("--pillar-drift-x", `${drift.x.toFixed(2)}px`);
        gridRef.current?.style.setProperty("--pillar-drift-y", `${drift.y.toFixed(2)}px`);
        driftFrameRef.current = null;
      });
    }
  };

  const leaveGrid = () => {
    if (driftEnableFrameRef.current !== null) {
      window.cancelAnimationFrame(driftEnableFrameRef.current);
      driftEnableFrameRef.current = null;
    }
    if (slideTimerRef.current !== null) {
      window.clearTimeout(slideTimerRef.current);
      slideTimerRef.current = null;
    }
    isHoveringRef.current = false;
    hoveredCardRectRef.current = null;
    setIsHovering(false);
    setIsDrifting(false);
    setIsSliding(false);
  };

  return (
    <div
      className={styles.pillarsGrid}
      data-active-pillar={activeIndex}
      data-pillars-drifting={isDrifting ? "true" : "false"}
      data-pillars-hovering={isHovering ? "true" : "false"}
      data-pillars-sliding={isSliding ? "true" : "false"}
      onPointerLeave={leaveGrid}
      ref={gridRef}
    >
      {pillars.map((pillar, index) => (
        <div
          className={styles.pillarCardSlot}
          key={`${pillar.title}-${index}`}
          onPointerEnter={(event) => activatePillar(index, event.currentTarget.getBoundingClientRect())}
          onPointerMove={driftHighlight}
        >
          <CareersPillarCard body={pillar.body} styles={styles} title={pillar.title} />
        </div>
      ))}
      <div aria-hidden="true" className={styles.pillarsActiveViewport}>
        <div className={styles.pillarsActiveLayer}>
          {pillars.map((pillar, index) => (
            <div className={styles.pillarCardSlot} key={`${pillar.title}-${index}-active`}>
              <CareersPillarCard activeLayer body={pillar.body} styles={styles} title={pillar.title} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
