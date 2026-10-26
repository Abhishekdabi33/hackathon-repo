import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion, AnimatePresence } from "motion/react";

type ClickBurst = {
  id: number;
  x: number;
  y: number;
};

/**
 * Compact Light Blue Spotlight Glow (~160px).
 *
 * Requirements:
 * 1. Compact, restrained size (~160px) with clean, soft light-blue illumination.
 * 2. Unobtrusive: When hovering over buttons, it shrinks & softens so text stays crisp.
 * 3. Button Click Action: When clicking any button or interactive element, the spotlight
 *    DISAPPEARS instantly with an animated expanding shockwave burst!
 * 4. Fades back into view smoothly after the click action completes.
 */
export function CursorSpotlight() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const [isDisappeared, setIsDisappeared] = useState(false);
  const [bursts, setBursts] = useState<ClickBurst[]>([]);

  const burstIdRef = useRef(0);
  const restoreTimerRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();

  const x = useMotionValue(-500);
  const y = useMotionValue(-500);

  // High-precision spring physics for smooth, responsive cursor tracking
  const sx = useSpring(x, { stiffness: 280, damping: 28, mass: 0.25 });
  const sy = useSpring(y, { stiffness: 280, damping: 28, mass: 0.25 });

  useEffect(() => {
    // Only track cursor on mouse/fine pointer devices
    if (!window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);

      // Detect if hovering over a button or interactive element
      const target = e.target as HTMLElement | null;
      const clickable = target?.closest(
        "button, a, [role='button'], input[type='button'], input[type='submit'], .cursor-pointer"
      );
      setIsHoveringButton(!!clickable);
    };

    const onLeave = () => {
      setVisible(false);
      setIsHoveringButton(false);
    };

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const clickable = target?.closest(
        "button, a, [role='button'], input[type='button'], input[type='submit'], [data-clickable='true'], .cursor-pointer"
      );

      // When clicking any button or interactive element:
      // 1. Trigger the click shockwave animation
      // 2. Disappear the spotlight instantly
      if (clickable) {
        const id = ++burstIdRef.current;
        setBursts((prev) => [...prev.slice(-2), { id, x: e.clientX, y: e.clientY }]);

        // Instantly disappear the spotlight
        setIsDisappeared(true);

        // Remove burst ripple after animation finishes
        window.setTimeout(() => {
          setBursts((prev) => prev.filter((b) => b.id !== id));
        }, 600);

        // Gracefully restore the spotlight after the click interaction completes
        if (restoreTimerRef.current) window.clearTimeout(restoreTimerRef.current);
        restoreTimerRef.current = window.setTimeout(() => {
          setIsDisappeared(false);
        }, 550);
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onMouseDown, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onMouseDown);
      if (restoreTimerRef.current) window.clearTimeout(restoreTimerRef.current);
    };
  }, [x, y]);

  if (!enabled || reducedMotion) return null;

  // Active scale & opacity transitions
  const shouldShow = visible && !isDisappeared;
  const targetScale = isDisappeared ? 0 : isHoveringButton ? 0.75 : 1;
  const targetOpacity = isDisappeared ? 0 : isHoveringButton ? 0.45 : 0.85;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[4] overflow-hidden select-none"
    >
      {/* 1. Compact Light Blue Spotlight (160px diameter) */}
      <motion.div
        className="absolute h-[160px] w-[160px] rounded-full will-change-transform"
        animate={{
          opacity: shouldShow ? targetOpacity : 0,
          scale: targetScale,
        }}
        transition={{
          opacity: { duration: isDisappeared ? 0.12 : 0.3, ease: "easeOut" },
          scale: { type: "spring", stiffness: 360, damping: 25 },
        }}
        style={{
          x: sx,
          y: sy,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, rgba(96, 165, 250, 0.34) 0%, rgba(59, 130, 246, 0.16) 34%, rgba(219, 234, 254, 0.06) 58%, transparent 72%)",
          filter: "blur(12px)",
        }}
      />

      {/* 2. Button Click Shockwave / Burst Animation */}
      <AnimatePresence>
        {bursts.map((burst) => (
          <div
            key={burst.id}
            className="absolute pointer-events-none"
            style={{
              left: burst.x,
              top: burst.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Expanding shockwave ring */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0.9 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="h-[120px] w-[120px] rounded-full border-2 border-bright/60"
              style={{
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.4), inset 0 0 15px rgba(96, 165, 250, 0.3)",
              }}
            />

            {/* Core light blue flash particle that blooms and fades */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0.85 }}
              animate={{ scale: 1.6, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0 m-auto h-[60px] w-[60px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(147, 197, 253, 0.6) 0%, rgba(59, 130, 246, 0.25) 50%, transparent 75%)",
                filter: "blur(6px)",
              }}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
