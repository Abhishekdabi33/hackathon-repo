import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";
import { FileText } from "lucide-react";
import { AiCharacter } from "./AiCharacter";

/**
 * Interactive 3D hero scene — a layered diorama the visitor can tilt
 * with the cursor. Glass report card behind, the Hitho companion at
 * center, and lab-value chips floating at different depths.
 */
export function HeroScene() {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-1, 1], [-7, 7]), { stiffness: 55, damping: 16 });
  const rotateX = useSpring(useTransform(my, [-1, 1], [5, -5]), { stiffness: 55, damping: 16 });

  return (
    <motion.div
      className="relative mx-auto h-[210px] w-full max-w-lg sm:h-[250px]"
      style={{ perspective: 1100 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", rotateX, rotateY }}
      >
        {/* Deep blue ambient glow at the back of the scene */}
        <div
          className="absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.20), transparent 70%)",
            transform: "translate(-50%, -50%) translateZ(-100px)",
          }}
        />

        {/* Glass report card — back layer, tilted away */}
        <div className="absolute left-1 top-[10%] hidden sm:block" style={{ transform: "translateZ(-60px)" }}>
          <motion.div
            className="glass w-40 rounded-2xl p-3.5 sm:w-48 shadow-sm"
            style={{ rotateY: 14, rotateX: -3 }}
            animate={reduced ? {} : { y: [0, -7, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              <FileText className="h-3 w-3 text-primary" /> lab-report.pdf
            </div>
            <div className="mt-2.5 space-y-1.5">
              {[
                ["Hemoglobin", "13.8", "text-positive"],
                ["Glucose", "96", "text-positive"],
                ["LDL", "152", "text-alert"],
              ].map(([name, value, color]) => (
                <div key={name} className="flex items-center justify-between rounded-lg bg-paleblue px-2 py-1">
                  <span className="text-[10px] text-muted-foreground">{name}</span>
                  <span className={`font-mono text-[10px] font-semibold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* The companion — front-center, closest to the viewer */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{ transform: "translate(-50%, -50%) translateZ(50px)" }}
        >
          <motion.div
            animate={reduced ? {} : { y: [0, -9, 0], rotate: [0, 1.2, -1.2, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <AiCharacter size={135} interactive={false} />
          </motion.div>
        </div>

        {/* Floating lab-value chips at different depths */}
        <div className="absolute right-[4%] top-[12%]" style={{ transform: "translateZ(80px)" }}>
          <motion.div
            className="glass rounded-2xl px-3 py-2 shadow-sm"
            animate={reduced ? {} : { y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          >
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-positive" /> Blood count normal
            </p>
            <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">Hb 13.8 g/dL</p>
          </motion.div>
        </div>

        <div className="absolute bottom-[8%] left-[8%] sm:left-[22%]" style={{ transform: "translateZ(95px)" }}>
          <motion.div
            className="glass rounded-2xl px-3 py-2 shadow-sm"
            animate={reduced ? {} : { y: [0, 7, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          >
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-alert" /> Review recommended
            </p>
            <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">LDL 152 mg/dL</p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
