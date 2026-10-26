import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

// Deterministic pseudo-random so SSR and client render identically.
function rand(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: rand(i * 3 + 1) * 100,
  top: rand(i * 3 + 2) * 100,
  size: 1.5 + rand(i * 3 + 3) * 3,
  delay: rand(i * 3 + 4) * 8,
  duration: 7 + rand(i * 3 + 5) * 8,
}));

/**
 * The calm "medical AI laboratory" behind everything: faint grid,
 * drifting glass panels, soft spheres and tiny data particles.
 */
export function FloatingScene() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const yFar = useTransform(scrollY, [0, 1200], [0, -70]);
  const yNear = useTransform(scrollY, [0, 1200], [0, -160]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="ambient-grid absolute inset-0" />
      <div className="ambient-glow absolute inset-0" />

      {/* Soft ambient spheres */}
      <motion.div
        className="absolute -left-32 top-[12%] h-[420px] w-[420px] rounded-full blur-3xl"
        style={{
          y: yFar,
          background: "radial-gradient(circle at 35% 30%, rgba(59,130,246,0.10), rgba(59,130,246,0.03) 60%, transparent)",
        }}
        animate={reduced ? {} : { y: [0, -24, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-40 top-[55%] h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          y: yFar,
          background: "radial-gradient(circle at 40% 30%, rgba(37,99,235,0.10), transparent 65%)",
        }}
        animate={reduced ? {} : { y: [0, 30, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating glass panels — only on very wide screens, kept at the
          edges so they never sit behind content cards */}
      <motion.div
        className="glass-soft absolute left-[2%] top-[24%] hidden h-40 w-56 rounded-3xl 2xl:block"
        style={{ y: yNear }}
        animate={reduced ? {} : { y: [0, -16, 0], rotate: [0, 1.5, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="glass-soft absolute right-[2%] top-[16%] hidden h-32 w-48 rounded-3xl 2xl:block"
        style={{ y: yFar }}
        animate={reduced ? {} : { y: [0, 18, 0], rotate: [0, -2, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="glass-soft absolute bottom-[10%] left-[3%] hidden h-28 w-64 rounded-3xl 2xl:block"
        style={{ y: yNear }}
        animate={reduced ? {} : { y: [0, -12, 0], rotate: [0, -1.2, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Small glass spheres — pushed to the outer edges so they never
          sit behind the upload card or content columns */}
      {[
        { left: "6%", top: "74%", size: 54, d: 10 },
        { left: "94%", top: "26%", size: 34, d: 12 },
        { left: "92%", top: "72%", size: 22, d: 9 },
      ].map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            background: "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9), rgba(219,234,254,0.4) 55%, transparent)",
            border: "1px solid rgba(37,99,235,0.10)",
            boxShadow: "0 10px 30px rgba(37,99,235,0.12)",
          }}
          animate={reduced ? {} : { y: [0, -s.size / 2.4, 0] }}
          transition={{ duration: s.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Data particles */}
      {PARTICLES.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-bright"
          style={{
            left: `${p.left.toFixed(1)}%`,
            top: `${p.top.toFixed(1)}%`,
            width: `${p.size.toFixed(1)}px`,
            height: `${p.size.toFixed(1)}px`,
            opacity: 0.18,
          }}
          animate={reduced ? {} : { y: [0, -26, 0], opacity: [0.08, 0.3, 0.08] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
        />
      ))}

      {/* Soft blue glow pooling toward the bottom */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 120% 80% at 50% 110%, rgba(59,130,246,0.08), transparent 60%)" }}
      />
    </div>
  );
}
