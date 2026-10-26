import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * Premium Light Blue Spotlight Glow.
 * Restrained size (~320px) with soft radial falloff and light blue tint.
 * Glides smoothly across the UI behind cards and content with zero friction.
 */
export function CursorSpotlight() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  const x = useMotionValue(-500);
  const y = useMotionValue(-500);

  // High-precision spring physics for smooth, natural cursor tracking
  const sx = useSpring(x, { stiffness: 220, damping: 25, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 220, damping: 25, mass: 0.35 });

  useEffect(() => {
    // Only track mouse on pointer-fine devices
    if (!window.matchMedia("(pointer: fine)").matches) {
      setEnabled(true);
      return;
    }

    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };

    const onLeave = () => {
      setVisible(false);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y]);

  if (!enabled || reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[4] overflow-hidden select-none"
    >
      {/* Light Blue Spotlight Glow — restrained 320px diameter */}
      <motion.div
        className="absolute h-[320px] w-[320px] rounded-full will-change-transform"
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          x: sx,
          y: sy,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, rgba(96, 165, 250, 0.24) 0%, rgba(59, 130, 246, 0.12) 36%, rgba(219, 234, 254, 0.05) 58%, transparent 72%)",
          filter: "blur(20px)",
        }}
      />
    </div>
  );
}
