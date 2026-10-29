"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

const LABELS = ["No", "Nope 😜", "Try again!", "Not allowed 🙈", "Only Yes works here 💕"];
const EDGE = 12; // px gap from the screen edges
const AVOID_PAD = 24; // px gap around the Yes button
const NEAR_PX = 90; // desktop: dodge when the cursor gets this close

type Pos = { x: number; y: number };
type Size = { w: number; h: number };

/** Reads the safe-area insets exposed as CSS variables in globals.css. */
function safeInsets() {
  const css = getComputedStyle(document.documentElement);
  const read = (v: string) => parseFloat(css.getPropertyValue(v)) || 0;
  return { t: read("--sat"), r: read("--sar"), b: read("--sab"), l: read("--sal") };
}

function viewport() {
  const vv = window.visualViewport;
  return { w: vv?.width ?? window.innerWidth, h: vv?.height ?? window.innerHeight };
}

/**
 * The "No" button that can never be pressed.
 *
 * - It has NO onClick at all.
 * - pointerdown / touchstart call preventDefault() and make it jump away instantly.
 * - On desktop it also jumps when the cursor comes near or enters it.
 * - Keyboard: it jumps on focus, and Enter/Space are swallowed.
 *
 * Before the first dodge it sits in the normal layout next to "Yes". After that it
 * lives in a position:fixed portal (so no transformed ancestor can trap it) and
 * springs to random spots inside the visible viewport, never over the Yes button.
 */
export default function DodgingNoButton({ avoidRef }: { avoidRef: RefObject<HTMLElement | null> }) {
  const [pos, setPos] = useState<Pos | null>(null); // null = still in the normal layout
  const [from, setFrom] = useState<Pos>({ x: 0, y: 0 }); // where the fixed button starts
  const [labelIndex, setLabelIndex] = useState(0);
  const [placeholder, setPlaceholder] = useState<Size | null>(null);

  const btnRef = useRef<HTMLButtonElement>(null);
  const posRef = useRef<Pos | null>(null);
  const lastDodge = useRef(0);

  /** Choose a fresh random spot that is fully on screen and away from Yes and the finger. */
  const pickSpot = useCallback(
    (size: Size, current: Pos, pointer?: Pos): Pos => {
      const vp = viewport();
      const ins = safeInsets();
      // Labels change width; plan for the widest so it never pokes off screen.
      const w = Math.max(size.w, 200);
      const h = size.h;
      const minX = ins.l + EDGE;
      const maxX = Math.max(minX, vp.w - ins.r - w - EDGE);
      const minY = ins.t + 40; // below the progress hearts
      const maxY = Math.max(minY, vp.h - ins.b - h - 76); // above the music button

      const yes = avoidRef.current?.getBoundingClientRect();
      const overlapsYes = (x: number, y: number) =>
        !!yes &&
        x < yes.right + AVOID_PAD &&
        x + w > yes.left - AVOID_PAD &&
        y < yes.bottom + AVOID_PAD &&
        y + h > yes.top - AVOID_PAD;

      for (let i = 0; i < 50; i++) {
        const x = minX + Math.random() * (maxX - minX);
        const y = minY + Math.random() * (maxY - minY);
        if (overlapsYes(x, y)) continue;
        if (Math.hypot(x - current.x, y - current.y) < 90) continue; // make the jump obvious
        if (pointer && Math.hypot(x + w / 2 - pointer.x, y + h / 2 - pointer.y) < 140) continue;
        return { x, y };
      }
      // Fallback: the corner farthest from the Yes button.
      const yesMidY = yes ? yes.top + yes.height / 2 : vp.h / 2;
      return { x: current.x < vp.w / 2 ? maxX : minX, y: yesMidY < vp.h / 2 ? maxY : minY };
    },
    [avoidRef],
  );

  const dodge = useCallback(
    (pointer?: Pos) => {
      const now = performance.now();
      if (now - lastDodge.current < 120) return; // avoid jitter from bursts of events
      lastDodge.current = now;

      const el = btnRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const size = { w: rect.width, h: rect.height };
      const current = posRef.current ?? { x: rect.left, y: rect.top };

      if (!posRef.current) {
        // First dodge: freeze a placeholder in the layout and lift the button into a fixed portal.
        setPlaceholder(size);
        setFrom(current);
      }
      const next = pickSpot(size, current, pointer);
      posRef.current = next;
      setPos(next);
      setLabelIndex((i) => (i % (LABELS.length - 1)) + 1);
      navigator.vibrate?.(8);
    },
    [pickSpot],
  );

  // touchstart must be a non-passive native listener for preventDefault() to work.
  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const t = e.touches[0];
      dodge(t ? { x: t.clientX, y: t.clientY } : undefined);
    };
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    return () => el.removeEventListener("touchstart", onTouchStart);
  }, [dodge, pos === null]); // re-attach when the button moves into the portal

  // Desktop: run away as soon as the mouse gets close.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !btnRef.current) return;
      const r = btnRef.current.getBoundingClientRect();
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
      if (Math.hypot(dx, dy) < NEAR_PX) dodge({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [dodge]);

  // The new label can be wider than planned: measure the real size and nudge it back inside.
  useLayoutEffect(() => {
    const el = btnRef.current;
    if (!pos || !el) return;
    const vp = viewport();
    const ins = safeInsets();
    const maxX = vp.w - ins.r - el.offsetWidth - EDGE;
    const maxY = vp.h - ins.b - el.offsetHeight - EDGE;
    const x = Math.max(ins.l + EDGE, Math.min(pos.x, maxX));
    const y = Math.max(ins.t + EDGE, Math.min(pos.y, maxY));
    if (x !== pos.x || y !== pos.y) {
      posRef.current = { x, y };
      setPos({ x, y });
    }
  }, [pos, labelIndex]);

  // Keep it on screen if the phone rotates or the browser bars resize the viewport.
  useEffect(() => {
    const onResize = () => {
      const el = btnRef.current;
      if (!posRef.current || !el) return;
      const r = el.getBoundingClientRect();
      const next = pickSpot({ w: r.width, h: r.height }, posRef.current);
      posRef.current = next;
      setPos(next);
    };
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, [pickSpot]);

  // Shared props. Note: deliberately NO onClick handler anywhere.
  const buttonProps = {
    ref: btnRef,
    type: "button" as const,
    "aria-label": "No (this button is shy)",
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      dodge({ x: e.clientX, y: e.clientY });
    },
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") dodge({ x: e.clientX, y: e.clientY });
    },
    onFocus: () => dodge(),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        dodge();
      }
    },
    onKeyUp: (e: React.KeyboardEvent) => e.preventDefault(), // Space "clicks" on keyup
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
    className:
      "min-h-12 whitespace-nowrap rounded-full bg-white/85 px-7 text-lg font-semibold text-plum-800 shadow-md ring-1 ring-plum-700/15 select-none touch-none",
  };

  return (
    <>
      {pos === null ? (
        <button {...buttonProps}>{LABELS[0]}</button>
      ) : (
        // Holds the original spot so "Yes" doesn't shift when No leaves.
        <span aria-hidden className="inline-block" style={{ width: placeholder?.w, height: placeholder?.h }} />
      )}

      {pos !== null &&
        createPortal(
          <motion.button
            {...buttonProps}
            initial={{ x: from.x, y: from.y }}
            animate={{ x: pos.x, y: pos.y }}
            transition={{ type: "spring", stiffness: 520, damping: 22, mass: 0.6 }}
            style={{ position: "fixed", left: 0, top: 0, zIndex: 55 }}
          >
            {LABELS[labelIndex]}
          </motion.button>,
          document.body,
        )}
    </>
  );
}
