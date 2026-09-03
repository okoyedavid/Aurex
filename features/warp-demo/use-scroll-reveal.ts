"use client";

import { useEffect, type RefObject } from "react";

export function useScrollReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;

    let cleanup: () => void = () => undefined;
    let cancelled = false;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion) {
          gsap.set(element.querySelectorAll("[data-reveal]"), { clearProps: "all" });
          return;
        }

        const context = gsap.context(() => {
          gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((item) => {
            gsap.fromTo(
              item,
              { autoAlpha: 0, y: 28 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.72,
                ease: "power3.out",
                scrollTrigger: { trigger: item, start: "top 88%", once: true },
              },
            );
          });
          gsap.utils.toArray<SVGPathElement>("[data-draw]").forEach((path) => {
            const length = path.getTotalLength();
            gsap.fromTo(
              path,
              { strokeDasharray: length, strokeDashoffset: length },
              {
                strokeDashoffset: 0,
                duration: 1.1,
                ease: "power2.inOut",
                scrollTrigger: { trigger: path, start: "top 88%", once: true },
              },
            );
          });
        }, element);
        cleanup = () => context.revert();
      },
    );

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [root]);
}
