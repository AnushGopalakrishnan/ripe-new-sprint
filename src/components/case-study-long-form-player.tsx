"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import "hls-video-element";

type CaseStudyLongFormPlayerProps = {
  styles: Record<string, string>;
  mediaClassName: string;
  src: string;
  poster?: string;
  preload: "auto" | "metadata";
  videoRef: { current: HTMLVideoElement | null };
  onLoadedMetadata: () => void;
};

function formatPlayerTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";

  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(remaining)}` : `${pad(minutes)}:${pad(remaining)}`;
}

function clampUnit(value: number) {
  return Math.max(0, Math.min(1, value));
}

function isHlsSource(src: string) {
  return /\.m3u8(?:[?#]|$)/i.test(src);
}

function PlayIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 12V5.01109C6 4.05131 7.03685 3.4496 7.87017 3.92579L14 7.42855L20.1007 10.9147C20.9405 11.3945 20.9405 12.6054 20.1007 13.0853L14 16.5714L7.87017 20.0742C7.03685 20.5503 6 19.9486 6 18.9889V12Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PauseIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M16 5V19" stroke="currentColor" strokeWidth="3" strokeMiterlimit="10" />
      <path d="M8 5V19" stroke="currentColor" strokeWidth="3" strokeMiterlimit="10" />
    </svg>
  );
}

function VolumeUpIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 8.99998V15H7L12 20V3.99998L7 8.99998H3ZM16.5 12C16.5 10.23 15.48 8.70998 14 7.96998V16.02C15.48 15.29 16.5 13.77 16.5 12ZM14 3.22998V5.28998C16.89 6.14998 19 8.82998 19 12C19 15.17 16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12C21 7.71998 18.01 4.13998 14 3.22998Z"
        fill="currentColor"
      />
    </svg>
  );
}

function VolumeMuteIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M16.5 12C16.5 10.23 15.48 8.71 14 7.97V10.18L16.45 12.63C16.48 12.43 16.5 12.22 16.5 12ZM19 12C19 12.94 18.8 13.82 18.46 14.64L19.97 16.15C20.63 14.91 21 13.5 21 12C21 7.72 18.01 4.14 14 3.23V5.29C16.89 6.15 19 8.83 19 12ZM4.27 3L3 4.27L7.73 9H3V15H7L12 20V13.27L16.25 17.52C15.58 18.04 14.83 18.45 14 18.7V20.76C15.38 20.45 16.63 19.81 17.69 18.95L19.73 21L21 19.73L12 10.73L4.27 3ZM12 4L9.91 6.09L12 8.18V4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FullscreenIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="14" width="2" height="7" fill="currentColor" />
      <rect x="3" y="3" width="2" height="7" fill="currentColor" />
      <rect x="19" y="3" width="2" height="7" fill="currentColor" />
      <rect x="19" y="14" width="2" height="7" fill="currentColor" />
      <rect x="3" y="19" width="7" height="2" fill="currentColor" />
      <rect x="14" y="19" width="7" height="2" fill="currentColor" />
      <rect x="3" y="3" width="7" height="2" fill="currentColor" />
      <rect x="14" y="3" width="7" height="2" fill="currentColor" />
    </svg>
  );
}

function FullscreenExitIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="7" y="2" width="2" height="7" fill="currentColor" />
      <rect x="15" y="2" width="2" height="7" fill="currentColor" />
      <rect x="15" y="15" width="2" height="7" fill="currentColor" />
      <rect x="8" y="15" width="2" height="7" fill="currentColor" />
      <rect x="2" y="7" width="7" height="2" fill="currentColor" />
      <rect x="3" y="15" width="7" height="2" fill="currentColor" />
      <rect x="15" y="7" width="7" height="2" fill="currentColor" />
      <rect x="15" y="15" width="7" height="2" fill="currentColor" />
    </svg>
  );
}

export function CaseStudyLongFormPlayer({
  styles,
  mediaClassName,
  src,
  poster,
  preload,
  videoRef,
  onLoadedMetadata,
}: CaseStudyLongFormPlayerProps) {
  const playerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const hoverTimerRef = useRef<number | null>(null);
  const wasPlayingBeforeDragRef = useRef(false);
  const lastAudibleVolumeRef = useRef(1);
  const [status, setStatus] = useState<"idle" | "ready" | "loading" | "playing" | "paused">("idle");
  const [hover, setHover] = useState<"idle" | "active">("idle");
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [activated, setActivated] = useState(false);
  const [frameReady, setFrameReady] = useState(false);

  const progress = duration > 0 ? clampUnit(currentTime / duration) * 100 : 0;
  const effectiveMuted = muted || volume === 0;
  const volumePercent = Math.round(volume * 100);
  const shouldUseHlsElement = isHlsSource(src);

  const wakeControls = () => {
    setHover("active");
    if (hoverTimerRef.current !== null) window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = window.setTimeout(() => setHover("idle"), 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
    video.muted = effectiveMuted;
  }, [effectiveMuted, videoRef, volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime || 0);
      setDuration(Number.isFinite(video.duration) ? video.duration : 0);
      if (!video.paused && !video.ended && video.currentTime > 0) setStatus("playing");
    };
    const updateBuffered = () => {
      if (!video.duration || !video.buffered.length) {
        setBufferedPercent(0);
        return;
      }
      const end = video.buffered.end(video.buffered.length - 1);
      setBufferedPercent(clampUnit(end / video.duration) * 100);
    };

    const onLoaded = () => {
      updateTime();
      updateBuffered();
      setStatus((current) => (current === "idle" ? "ready" : current));
      onLoadedMetadata();
    };
    const onLoadedData = () => setFrameReady(true);
    const onPlay = () => {
      wakeControls();
      setActivated(true);
      setStatus("playing");
      setFrameReady(true);
    };
    const onPause = () => setStatus("paused");
    const onWaiting = () => setStatus("loading");
    const onPlaying = () => {
      setStatus("playing");
      setFrameReady(true);
    };
    const onError = () => setStatus("paused");
    const onCanPlay = () => {
      setFrameReady(true);
      if (!video.paused && !video.ended) setStatus("playing");
      else setStatus((current) => (current === "idle" ? "ready" : current));
    };
    const onEnded = () => {
      setCurrentTime(0);
      setActivated(false);
      setStatus("paused");
    };

    video.addEventListener("loadedmetadata", onLoaded);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("durationchange", updateTime);
    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("progress", updateBuffered);
    video.addEventListener("play", onPlay);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("error", onError);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("durationchange", updateTime);
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("progress", updateBuffered);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("error", onError);
      video.removeEventListener("ended", onEnded);
    };
  }, [onLoadedMetadata, videoRef]);

  useEffect(() => {
    setFrameReady(false);
  }, [src, poster]);

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement === playerRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current !== null) window.clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || typeof video.play !== "function") return;

    if (video.paused || video.ended) {
      setStatus("loading");
      void video.play().catch(() => setStatus("paused"));
    } else {
      video.pause();
    }
  };

  const seekToClientX = (clientX: number) => {
    const video = videoRef.current;
    const timeline = timelineRef.current;
    if (!video || !timeline || !video.duration) return;

    const rect = timeline.getBoundingClientRect();
    const next = clampUnit((clientX - rect.left) / rect.width) * video.duration;
    video.currentTime = next;
    setCurrentTime(next);
  };

  const onTimelinePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video?.duration) return;

    event.preventDefault();
    event.stopPropagation();
    wakeControls();
    wasPlayingBeforeDragRef.current = !video.paused && !video.ended;
    if (wasPlayingBeforeDragRef.current) video.pause();
    setDragging(true);
    seekToClientX(event.clientX);

    const onPointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      seekToClientX(moveEvent.clientX);
    };
    const onPointerUp = () => {
      setDragging(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      if (wasPlayingBeforeDragRef.current) void video.play().catch(() => setStatus("paused"));
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp, { passive: true, once: true });
  };

  const toggleFullscreen = () => {
    const player = playerRef.current;
    if (!player) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void player.requestFullscreen?.();
    }
  };

  const setPlayerVolume = (nextVolume: number) => {
    const next = clampUnit(nextVolume);
    setVolume(next);

    if (next > 0) {
      lastAudibleVolumeRef.current = next;
      setMuted(false);
    } else {
      setMuted(true);
    }
  };

  const toggleMute = () => {
    if (effectiveMuted) {
      if (volume === 0) setVolume(lastAudibleVolumeRef.current);
      setMuted(false);
    } else {
      setMuted(true);
    }
  };

  return (
    <div
      ref={playerRef}
      className={styles.detailLongFormPlayer}
      data-player-status={status}
      data-player-hover={hover}
      data-player-muted={effectiveMuted ? "true" : "false"}
      data-player-fullscreen={fullscreen ? "true" : "false"}
      data-player-activated={activated ? "true" : "false"}
      data-frame-ready={frameReady ? "true" : "false"}
      data-timeline-drag={dragging ? "true" : "false"}
      onPointerDown={wakeControls}
      onPointerEnter={wakeControls}
      onPointerLeave={() => {
        setHover("idle");
        if (hoverTimerRef.current !== null) window.clearTimeout(hoverTimerRef.current);
      }}
      onPointerMove={wakeControls}
    >
      {shouldUseHlsElement ? (
        <hls-video
          ref={(element) => {
            videoRef.current = element as HTMLVideoElement | null;
          }}
          className={mediaClassName}
          src={src}
          poster={poster}
          preload={preload}
          playsInline
          crossOrigin="anonymous"
          tabIndex={-1}
          suppressHydrationWarning
        />
      ) : (
        <video
          ref={(element) => {
            videoRef.current = element;
          }}
          className={mediaClassName}
          src={src}
          poster={poster}
          preload={preload}
          playsInline
          tabIndex={-1}
          suppressHydrationWarning
        />
      )}
      {poster ? <img className={styles.detailLongFormPoster} src={poster} alt="" aria-hidden="true" /> : null}
      <div className={styles.detailLongFormShade} aria-hidden="true" />
      <button
        className={styles.detailLongFormPlayPause}
        type="button"
        aria-label={status === "playing" ? "Pause video" : "Play video"}
        onClick={(event) => {
          event.stopPropagation();
          wakeControls();
          togglePlay();
        }}
      >
        <span className={styles.detailLongFormBigButton}>
          <PauseIcon className={styles.detailLongFormPauseIcon} />
          <PlayIcon className={styles.detailLongFormPlayIcon} />
        </span>
      </button>
      <div className={styles.detailLongFormLoading} aria-hidden="true">
        <span />
      </div>
      <div className={styles.detailLongFormInterface}>
        <div className={styles.detailLongFormInterfaceFade} />
        <div className={styles.detailLongFormInterfaceBottom}>
          <button
            className={styles.detailLongFormTogglePlay}
            type="button"
            aria-label={status === "playing" ? "Pause video" : "Play video"}
            onClick={(event) => {
              event.stopPropagation();
              wakeControls();
              togglePlay();
            }}
          >
            <PauseIcon className={styles.detailLongFormPauseIcon} />
            <PlayIcon className={styles.detailLongFormPlayIcon} />
          </button>
          <div className={styles.detailLongFormTime}>
            <p>{formatPlayerTime(currentTime)}</p>
            <p className={styles.detailLongFormTransparentText}>/</p>
            <p className={styles.detailLongFormTransparentText}>{formatPlayerTime(duration)}</p>
          </div>
          <div
            ref={timelineRef}
            className={styles.detailLongFormTimeline}
            role="slider"
            aria-label="Video timeline"
            aria-valuemin={0}
            aria-valuemax={Math.max(duration, 0)}
            aria-valuenow={Math.min(currentTime, duration || currentTime)}
            tabIndex={0}
            onPointerDown={onTimelinePointerDown}
            onKeyDown={(event) => {
              const video = videoRef.current;
              if (!video?.duration) return;
              const offset = event.key === "ArrowLeft" ? -5 : event.key === "ArrowRight" ? 5 : 0;
              if (!offset) return;
              event.preventDefault();
              const next = Math.max(0, Math.min(video.duration, video.currentTime + offset));
              video.currentTime = next;
              setCurrentTime(next);
            }}
          >
            <div className={styles.detailLongFormTimelineBar}>
              <div className={styles.detailLongFormTimelineBg} />
              <div
                className={styles.detailLongFormTimelineBuffered}
                style={{ transform: `translateX(${-100 + bufferedPercent}%)` }}
              />
              <div
                className={styles.detailLongFormTimelineProgress}
                style={{ transform: `translateX(${-100 + progress}%)` }}
              />
            </div>
            <div className={styles.detailLongFormTimelineHandle} style={{ left: `${progress}%` }} />
          </div>
          <div className={styles.detailLongFormInterfaceButtons}>
            <div
              className={styles.detailLongFormVolumeControl}
              onPointerDown={(event) => {
                event.stopPropagation();
                wakeControls();
              }}
              onPointerEnter={wakeControls}
              onFocus={wakeControls}
            >
              <div className={styles.detailLongFormVolumeSliderWrap}>
                <input
                  className={styles.detailLongFormVolumeSlider}
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={volumePercent}
                  aria-label="Video volume"
                  aria-valuetext={effectiveMuted ? "Muted" : `${volumePercent}%`}
                  style={{ "--player-volume": `${volumePercent}%` } as CSSProperties}
                  onChange={(event) => {
                    wakeControls();
                    setPlayerVolume(Number(event.currentTarget.value) / 100);
                  }}
                  onClick={(event) => event.stopPropagation()}
                />
              </div>
              <button
                className={styles.detailLongFormToggleMute}
                type="button"
                aria-label={effectiveMuted ? "Unmute video" : "Mute video"}
                aria-haspopup="true"
                onClick={(event) => {
                  event.stopPropagation();
                  wakeControls();
                  toggleMute();
                }}
              >
                <VolumeUpIcon className={styles.detailLongFormVolumeUpIcon} />
                <VolumeMuteIcon className={styles.detailLongFormVolumeMuteIcon} />
              </button>
            </div>
            <button
              className={styles.detailLongFormToggleFullscreen}
              type="button"
              aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              onClick={(event) => {
                event.stopPropagation();
                wakeControls();
                toggleFullscreen();
              }}
            >
              <FullscreenIcon className={styles.detailLongFormFullscreenIcon} />
              <FullscreenExitIcon className={styles.detailLongFormFullscreenExitIcon} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
