import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { AiCharacter } from "./AiCharacter";
import { cn } from "@/lib/utils";

export const ANALYSIS_STAGES = [
  "Reading report…",
  "Identifying medical terms…",
  "Extracting key findings…",
  "Organizing information…",
  "Preparing your summary…",
] as const;

const ORBIT_CHIPS = ["Hb", "RBC", "WBC", "LDL", "ALT", "CREA"] as const;

function OrbitChip({ label, index, hidden }: { label: string; index: number; hidden: boolean }) {
  const duration = 5 + (index % 3) * 1.6;
  return (
    <span
      aria-hidden
      className="glass absolute left-1/2 top-1/2 z-10 flex h-7 items-center rounded-full px-2.5 text-[10px] font-semibold tracking-wide text-ice shadow-[0_4px_16px_rgba(37,99,235,0.18)]"
      style={{
        width: "max-content",
        marginTop: -14,
        marginLeft: -18,
        ["--orbit-r" as string]: "128px",
        animation: hidden ? undefined : `float-orbit ${duration}s linear ${-index * (duration / 6)}s infinite`,
        opacity: hidden ? 0 : 0.9 - (index % 3) * 0.15,
      }}
    >
      {label}
    </span>
  );
}

/** Blue particle burst when the analysis lands. */
function Burst() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const dist = 120 + (i % 4) * 28;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-bright"
            style={{ marginLeft: -4, marginTop: -4 }}
            initial={{ x: 0, y: 0, opacity: 0.95, scale: 1 }}
            animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

export function AnalysisStages({ done }: { done: boolean }) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (done) return;
    const timer = setInterval(() => {
      setStage((s) => Math.min(s + 1, ANALYSIS_STAGES.length - 1));
    }, 2200);
    return () => clearInterval(timer);
  }, [done]);

  useEffect(() => {
    if (done) setStage(ANALYSIS_STAGES.length - 1);
  }, [done]);

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      {/* --- Orbital theater --- */}
      <div className="relative flex h-[340px] w-[340px] items-center justify-center">
        {/* Radiating pulse rings */}
        {!done &&
          !reduced &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute h-[210px] w-[210px] rounded-full border border-primary/25"
              animate={{ scale: [1, 1.85], opacity: [0.45, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
            />
          ))}

        {/* Counter-rotating orbit rings */}
        {!reduced && (
          <>
            <motion.span
              aria-hidden
              className="absolute h-[268px] w-[268px] rounded-full border border-dashed border-primary/20"
              animate={{ rotate: done ? 0 : 360 }}
              transition={{ duration: 14, repeat: done ? 0 : Infinity, ease: "linear" }}
            />
            <motion.span
              aria-hidden
              className="absolute h-[330px] w-[330px] rounded-full border border-primary/10"
              animate={{ rotate: done ? 0 : -360 }}
              transition={{ duration: 22, repeat: done ? 0 : Infinity, ease: "linear" }}
            />
          </>
        )}

        {/* Orbiting lab-value chips */}
        {ORBIT_CHIPS.map((label, i) => (
          <OrbitChip key={label} label={label} index={i} hidden={done} />
        ))}

        {/* The character itself */}
        <AiCharacter size={170} state={done ? "happy" : "thinking"} interactive={false} />

        {done && <Burst />}
      </div>

      <div className="flex flex-col items-center gap-4">
        <motion.h2
          key={done ? "done" : "analyzing"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("text-xl font-semibold tracking-tight", !done && "shimmer-text")}
        >
          {done ? "Analysis complete" : "Analyzing your report"}
        </motion.h2>

        {/* Stage checklist */}
        <div className="glass w-full max-w-xs rounded-2xl p-1.5">
          {ANALYSIS_STAGES.map((label, i) => {
            const complete = done || i < stage;
            const active = !done && i === stage;
            return (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition-colors duration-300",
                  active && "bg-paleblue",
                )}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {complete ? (
                    <motion.span
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 18 }}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </motion.span>
                  ) : active ? (
                    <motion.span
                      className="h-2.5 w-2.5 rounded-full bg-bright"
                      animate={{ scale: [1, 1.45, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full border border-primary/30" />
                  )}
                </span>
                <span
                  className={cn(
                    "transition-colors duration-300",
                    complete && "text-foreground/80",
                    active && "font-medium text-foreground",
                    !complete && !active && "text-muted-foreground/55",
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress rail with light streak */}
        <div className="relative h-1.5 w-64 overflow-hidden rounded-full bg-primary/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-bright"
            animate={{ width: done ? "100%" : `${((stage + 1) / ANALYSIS_STAGES.length) * 90}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 20 }}
          />
          {!done && !reduced && (
            <motion.div
              aria-hidden
              className="absolute top-0 h-full w-12 rounded-full bg-white/70 blur-[3px]"
              animate={{ x: [-48, 256] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
