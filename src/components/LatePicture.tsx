"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { firstScroll } from "./ScrubSequence";

/* A still that nobody sees before the visitor scrolls waits for that scroll,
   so the first load carries the opening picture alone. The pinned scene keeps
   every still "in view", which is why the browser's own lazy loading cannot
   tell them apart. */
export function LatePicture({
  phoneSrc,
  src,
  alt,
  className,
  style,
}: {
  phoneSrc: string;
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let on = true;
    void firstScroll().then(() => on && setReady(true));
    return () => {
      on = false;
    };
  }, []);
  if (!ready) return null;
  return (
    <picture>
      <source media="(max-width: 820px)" srcSet={phoneSrc} />
      <img src={src} alt={alt} decoding="async" className={className} style={style} />
    </picture>
  );
}
