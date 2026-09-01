"use client";

import { useRef } from "react";
import detailStyles from "@/app/(site)/detail-page.module.css";
import { CaseStudyLongFormPlayer } from "@/components/case-study-long-form-player";

export type PlayerSpecimenProps = {
  preload?: "auto" | "metadata";
  showPoster?: boolean;
};

export function PlayerSpecimen({ preload = "metadata", showPoster = true }: PlayerSpecimenProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  return (
    <div className={detailStyles.formaMediaWrap} style={{ aspectRatio: "16 / 9", background: "#000" }}>
      <CaseStudyLongFormPlayer
        styles={detailStyles}
        mediaClassName={detailStyles.formaMedia}
        src="/feed-media/polestar.mp4"
        poster={showPoster ? "/feed-media/polestar.jpg" : undefined}
        preload={preload}
        videoRef={videoRef}
        onLoadedMetadata={() => undefined}
      />
    </div>
  );
}
