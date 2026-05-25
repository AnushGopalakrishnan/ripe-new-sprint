import type * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "hls-video": React.DetailedHTMLProps<React.VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
    }
  }
}

export {};
