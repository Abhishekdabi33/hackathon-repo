import { useRef, useState, type ReactNode, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion, type MotionStyle } from "motion/react";
import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  intensity?: "soft" | "glass" | "strong";
  tilt?: boolean;
  style?: CSSProperties;
};

/**
 * iOS-style glass surface with a subtle 3D tilt, cursor-following sheen
 * and border brightening. All effects are restrained by design.
 */
export function GlassCard({ children, className, intensity = "glass", tilt = true, style }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const rx = useSpring(0, { stiffness: 180, damping: 18 });
  const ry = useSpring(0, { stiffness: 180, damping: 18 });
  const tx = useSpring(0, { stiffness: 180, damping: 18 });
  const ty = useSpring(0, { stiffness: 180, damping: 18 });
  const [sheen, setSheen] = useState({ x: 50, y: 50, on: false });

  const surface =
    intensity === "soft" ? "glass-soft" : intensity === "strong" ? "glass-strong" : "glass";

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || reduced || !tilt) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * 5);
    rx.set(-(py - 0.5) * 5);
    tx.set((px - 0.5) * 5);
    ty.set((py - 0.5) * 5);
    setSheen({ x: px * 100, y: py * 100, on: true });
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    tx.set(0);
    ty.set(0);
    setSheen((s) => ({ ...s, on: false }));
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "group/card relative overflow-hidden rounded-3xl",
        surface,
        "transition-colors duration-300 hover:border-primary/20",
        className,
      )}
      style={
        style
          ? ({ transformStyle: "preserve-3d", ...style } as MotionStyle)
          : { transformStyle: "preserve-3d" }
      }
    >
      {/* Cursor-following glass reflection */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: sheen.on ? 1 : 0.55,
          background: `radial-gradient(420px circle at ${sheen.x}% ${sheen.y}%, rgba(255,255,255,0.55), transparent 60%)`,
        }}
      />
      {/* Static sheen diagonal */}
      <div aria-hidden className="glass-sheen pointer-events-none absolute inset-0 opacity-60" />
      <motion.div
        className="relative h-full"
        {...(tilt && !reduced
          ? { style: { rotateX: rx, rotateY: ry, x: tx, y: ty, transformStyle: "preserve-3d" as const } }
          : {})}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
