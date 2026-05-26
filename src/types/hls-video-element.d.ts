import type * as React from "react";

type HlsVideoElementProps = React.DetailedHTMLProps<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  HTMLVideoElement
>;

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "hls-video": HlsVideoElementProps;
    }
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "hls-video": HlsVideoElementProps;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "hls-video": HlsVideoElementProps;
    }
  }
}

export {};
