import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Subtle radial light that follows the cursor, blending into the dark
 * background like light grazing glass. Hidden on touch devices.
 */
export function CursorSpotlight() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const sx = useSpring(x, { stiffness: 160, damping: 22, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 160, damping: 22, mass: 0.4 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5]"
      animate={{ opacity: visible ? 1 : 0 }}
    >
      <motion.div
        className="absolute h-[520px] w-[520px] rounded-full"
        style={{
          x: sx,
          y: sy,
          translateX: "-50%",
          translateY: "-50%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.06) 0%, rgba(59,130,246,0.025) 38%, transparent 68%)",
        }}
      />
    </motion.div>
  );
}
