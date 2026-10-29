import confetti from "canvas-confetti";

const ROMANTIC = ["#f43f75", "#e11d5c", "#fb7199", "#fda4bc", "#f6c453", "#ffd700"];

// Created lazily: shapeFromPath needs a browser canvas.
let heartShape: confetti.Shape | null = null;
function heart() {
  heartShape ??= confetti.shapeFromPath({
    path: "M167 72c19-38 37-56 75-56 42 0 76 33 76 75 0 76-76 151-151 227C91 242 15 167 15 91c0-42 34-75 76-75 38 0 57 18 76 56z",
  });
  return heartShape;
}

const isSmall = () => window.innerWidth < 640;

/** A small heart burst from an element's position (used for right quiz answers). */
export function heartBurst(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  confetti({
    particleCount: isSmall() ? 18 : 30,
    spread: 70,
    startVelocity: 28,
    scalar: 1.1,
    ticks: 90,
    shapes: [heart()],
    colors: ROMANTIC,
    origin: {
      x: (r.left + r.width / 2) / window.innerWidth,
      y: (r.top + r.height / 2) / window.innerHeight,
    },
    disableForReducedMotion: true,
  });
}

/**
 * The big "YES" celebration: a double side cannon, then a few seconds of
 * fireworks. Returns a cleanup function that stops everything.
 */
export function celebrate(durationMs = 4000) {
  const small = isSmall();
  const base: confetti.Options = {
    colors: ROMANTIC,
    shapes: [heart(), "circle", "square"],
    scalar: small ? 1 : 1.2,
    disableForReducedMotion: true,
    zIndex: 60,
  };

  // Cannons from both sides.
  const count = small ? 90 : 160;
  confetti({ ...base, particleCount: count, angle: 60, spread: 70, startVelocity: 60, origin: { x: 0, y: 0.8 } });
  confetti({ ...base, particleCount: count, angle: 120, spread: 70, startVelocity: 60, origin: { x: 1, y: 0.8 } });

  // Fireworks: random bursts in the upper half of the screen.
  const end = Date.now() + durationMs;
  const interval = window.setInterval(() => {
    if (Date.now() > end) {
      window.clearInterval(interval);
      return;
    }
    confetti({
      ...base,
      particleCount: small ? 30 : 50,
      spread: 360,
      startVelocity: 25,
      ticks: 70,
      gravity: 0.8,
      origin: { x: 0.15 + Math.random() * 0.7, y: 0.15 + Math.random() * 0.35 },
    });
  }, 380);

  return () => {
    window.clearInterval(interval);
    confetti.reset();
  };
}
