"use client";

import { useEffect, useRef } from "react";

export function WalkthroughVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className="aspect-video size-full object-cover"
      controls
      muted
      playsInline
      preload="metadata"
      src="/aurex%20dashboard%20walkthrough.mp4"
    >
      Your browser does not support embedded video.
    </video>
  );
}
