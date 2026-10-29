"use client";

import { useEffect } from "react";

/**
 * A trail of little hearts following the mouse.
 * Desktop only: does nothing on touch devices or with reduced motion.
 * Hearts are plain DOM nodes animated with the Web Animations API and removed
 * when done, so React never re-renders on mouse move.
 */
export default function HeartCursor() {
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduced) return;

    let last = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const now = performance.now();
      if (now - last < 45) return; // throttle: ~22 hearts per second max
      last = now;

      const heart = document.createElement("span");
      heart.textContent = "♥";
      heart.setAttribute("aria-hidden", "true");
      Object.assign(heart.style, {
        position: "fixed",
        left: `${e.clientX - 6}px`,
        top: `${e.clientY - 8}px`,
        color: Math.random() > 0.5 ? "#f43f75" : "#fb7199",
        fontSize: `${10 + Math.random() * 8}px`,
        pointerEvents: "none",
        zIndex: "9999",
      });
      document.body.appendChild(heart);

      const drift = (Math.random() - 0.5) * 30;
      heart
        .animate(
          [
            { transform: "translate(0,0) scale(1)", opacity: 0.9 },
            { transform: `translate(${drift}px, 28px) scale(0.3)`, opacity: 0 },
          ],
          { duration: 800, easing: "ease-out" },
        )
        .finished.then(() => heart.remove())
        .catch(() => heart.remove());
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return null;
}
