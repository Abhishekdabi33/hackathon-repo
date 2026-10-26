import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import type { Finding } from "@/types/report";

export type ExplainTarget = Pick<Finding, "term" | "deepDive" | "explanation">;

export function ExplainDialog({ target, onClose }: { target: ExplainTarget | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {target && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-foreground/25 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: 40, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="glass-strong relative w-full max-w-md rounded-4xl p-7"
          >
            <button
              onClick={onClose}
              aria-label="Close explanation"
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ice/80">
              <span className="h-1.5 w-1.5 rounded-full bg-ice" />
              Hitho explains
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">{target.term}</h3>

            {target.deepDive ? (
              <div className="mt-5 space-y-4">
                <Section title="What it means" body={target.deepDive.meaning} />
                <Section title="Why it matters" body={target.deepDive.whyItMatters} />
                <Section title="Your result" body={target.deepDive.yourResult ?? "Not stated in this report."} />
                <Section title="Typical reference range" body={target.deepDive.typicalRange ?? "Not stated in this report."} />
              </div>
            ) : (
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{target.explanation}</p>
            )}

            <p className="mt-6 border-t border-border pt-4 text-[11px] text-muted-foreground/70">
              Educational explanation only — not medical advice.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{title}</p>
      <p className="mt-1 text-[15px] leading-relaxed text-foreground/90">{body}</p>
    </div>
  );
}
