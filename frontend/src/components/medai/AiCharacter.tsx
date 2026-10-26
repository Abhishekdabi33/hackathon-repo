import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type CharacterState = "idle" | "thinking" | "happy";

type AiCharacterProps = {
  size?: number;
  state?: CharacterState;
  interactive?: boolean;
  className?: string;
};

/**
 * Hitho companion — a soft white sphere with two dark oval eyes.
 * Eyes track the cursor with spring physics, it blinks, floats, and
 * reacts to hover, click, thinking and success states.
 */
export function AiCharacter({ size = 180, state = "idle", interactive = true, className }: AiCharacterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [blink, setBlink] = useState(false);
  const [clicked, setClicked] = useState(0);

  // Cursor tracking (normalized -1..1 from center)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const trackX = useSpring(rawX, { stiffness: 90, damping: 14, mass: 0.6 });
  const trackY = useSpring(rawY, { stiffness: 90, damping: 14, mass: 0.6 });
  const eyeX = useSpring(0, { stiffness: 120, damping: 15 });
  const eyeY = useSpring(0, { stiffness: 120, damping: 15 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)));
      rawX.set(nx);
      rawY.set(ny);
      eyeX.set(nx * Math.min(6, size * 0.04));
      eyeY.set(ny * Math.min(5, size * 0.035));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced, size, rawX, rawY, eyeX, eyeY]);

  // Natural blinking
  useEffect(() => {
    if (reduced) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
        schedule();
      }, 2200 + Math.random() * 3800);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [reduced]);

  const eyeSquish = state === "happy" ? 0.55 : blink ? 0.1 : 1;
  const thinking = state === "thinking";

  return (
    <div ref={ref} className={cn("relative select-none", className)} style={{ width: size, height: size }}>
      {/* Soft shadow beneath */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 rounded-full bg-bright/25 blur-md"
        style={{ width: size * 0.62, height: size * 0.09, bottom: -size * 0.1 }}
        animate={reduced ? {} : { scaleX: [1, 0.88, 1], opacity: [0.4, 0.28, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Under-glow on hover */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 rounded-full blur-xl"
        style={{
          width: size * 0.8,
          height: size * 0.3,
          bottom: -size * 0.06,
          background: "radial-gradient(ellipse, rgba(37,99,235,0.28), transparent 70%)",
        }}
        animate={{ opacity: hovered ? 0.9 : 0 }}
        transition={{ duration: 0.4 }}
      />

      <motion.div
        className="relative h-full w-full"
        style={{ x: trackX, y: trackY, perspective: 600 }}
        animate={reduced ? {} : { y: [0, -10, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        {...(reduced ? {} : { whileHover: { scale: 1.05 }, whileTap: { scale: 0.94 } })}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => setClicked((c) => c + 1)}
      >
        {/* Click ripple */}
        {clicked > 0 && (
          <motion.span
            key={clicked}
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full border"
            style={{ borderColor: "rgba(37,99,235,0.4)" }}
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}

        {/* Head */}
        <motion.div
          className="relative h-full w-full rounded-full"
          style={{
            transformStyle: "preserve-3d",
            background:
              "radial-gradient(circle at 32% 28%, #ffffff 0%, #fbfdff 45%, #e4efff 78%, #cfe1fa 100%)",
            boxShadow:
              "inset -10px -14px 28px rgba(147,173,214,0.35), inset 8px 10px 24px rgba(255,255,255,0.95), 0 24px 60px rgba(37,99,235,0.18)",
          }}
          animate={
            reduced
              ? {}
              : state === "thinking"
                ? { rotate: [0, 2.5, -2.5, 0] }
                : { rotate: 0 }
          }
          transition={state === "thinking" ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
        >
              {/* subtle depth extrusion ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: "0 1px 0 rgba(255,255,255,0.95) inset",
                }}
              />
              {/* Eyes */}
              <div className="absolute inset-0 flex items-center justify-center gap-[18%]">
                {[0, 1].map((i) => (
                  <motion.div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: size * 0.085,
                      height: size * 0.19,
                      x: eyeX,
                      y: eyeY,
                      background:
                        "radial-gradient(circle at 35% 25%, #334155 0%, #1e293b 55%, #111827 100%)",
                      boxShadow: "inset 0 1px 2px rgba(255,255,255,0.28)",
                    }}
                    animate={{ scaleY: eyeSquish }}
                    transition={{ duration: blink ? 0.12 : 0.25, ease: "easeInOut" }}
                  />
                ))}
              </div>
              {/* Thinking orbit particles */}
              {thinking && !reduced && (
                <div className="absolute inset-0">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="absolute left-1/2 top-1/2 rounded-full bg-ice/80"
                      style={{
                        width: size * 0.028,
                        height: size * 0.028,
                        marginTop: -size * 0.014,
                        marginLeft: -size * 0.014,
                        ["--orbit-r" as string]: `${size * 0.58}px`,
                        animation: `float-orbit ${3 + i * 0.7}s linear ${-i * 1.2}s infinite`,
                        opacity: 0.8 - i * 0.18,
                      }}
                    />
                  ))}
                </div>
              )}
        </motion.div>
      </motion.div>
    </div>
  );
}
