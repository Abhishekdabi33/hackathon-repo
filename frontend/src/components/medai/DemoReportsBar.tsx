import { useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  Sparkles,
  Droplet,
  Heart,
  Stethoscope,
  Pill,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from "lucide-react";
import type { ClinicalSample } from "@/types/report";
import { cn } from "@/lib/utils";

type DemoReportsBarProps = {
  samples: ClinicalSample[];
  onSelect: (sample: ClinicalSample) => void;
  className?: string;
  compact?: boolean;
};

// Map each report to a relevant clinical icon and color theme
function getSampleIcon(sample: ClinicalSample) {
  const text = (sample.title + " " + sample.type + " " + sample.filename).toLowerCase();
  if (text.includes("blood") || text.includes("cbc") || text.includes("hematology")) {
    return {
      icon: Droplet,
      badge: "Hematology",
      badgeClass: "bg-red-50 text-red-600 border-red-200/60",
      accent: "text-red-600",
    };
  }
  if (text.includes("lipid") || text.includes("cholesterol") || text.includes("cardio")) {
    return {
      icon: Heart,
      badge: "Cardiovascular",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200/60",
      accent: "text-amber-600",
    };
  }
  if (text.includes("thyroid") || text.includes("tsh") || text.includes("endocrine")) {
    return {
      icon: Stethoscope,
      badge: "Endocrinology",
      badgeClass: "bg-blue-50 text-primary border-primary/20",
      accent: "text-primary",
    };
  }
  if (text.includes("prescription") || text.includes("medication") || text.includes("rx")) {
    return {
      icon: Pill,
      badge: "Prescription",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      accent: "text-emerald-600",
    };
  }
  return {
    icon: FileText,
    badge: "Diagnostic",
    badgeClass: "bg-paleblue text-primary border-primary/20",
    accent: "text-primary",
  };
}

export function DemoReportsBar({
  samples,
  onSelect,
  className,
  compact = false,
}: DemoReportsBarProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!samples || samples.length === 0) return null;

  const handleCardClick = (sample: ClinicalSample) => {
    setSelectedId(sample.id);
    onSelect(sample);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/90 bg-white/95 p-4 sm:p-5 shadow-[0_4px_24px_rgba(37,99,235,0.06)] backdrop-blur-md",
        className
      )}
    >
      {/* Animated Top Ambient Shimmer Bar */}
      <div className="absolute inset-x-0 top-0 h-[2.5px] overflow-hidden bg-gradient-to-r from-softblue via-primary/40 to-softblue">
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
            repeatDelay: 1,
          }}
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-bright to-transparent shadow-[0_0_8px_#3B82F6]"
        />
      </div>

      {/* Header with Live Radar Pulse */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {/* Animated radar beacon */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_6px_#2563EB]" />
          </span>

          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Activity className="h-3.5 w-3.5" />
            Demo Diagnostic Reports
          </span>

          <span className="rounded-full bg-paleblue px-2 py-0.5 text-[10px] font-semibold text-primary border border-primary/20">
            1-Click Analysis
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">Pre-loaded with certified clinical reference standards</span>
          <span className="sm:hidden">Pre-loaded standards</span>
        </div>
      </div>

      {/* Grid of Animated Demo Diagnostic Cards */}
      <div
        className={cn(
          "grid gap-3",
          compact
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        )}
      >
        {samples.map((sample, index) => {
          const { icon: Icon, badge, badgeClass, accent } = getSampleIcon(sample);
          const isSelected = selectedId === sample.id;

          return (
            <motion.button
              key={sample.id}
              type="button"
              onClick={() => handleCardClick(sample)}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: index * 0.08,
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{
                y: -4,
                scale: 1.025,
                transition: { type: "spring", stiffness: 380, damping: 16 },
              }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "group relative flex flex-col justify-between overflow-hidden rounded-xl border p-3.5 text-left transition-all duration-300",
                isSelected
                  ? "border-primary bg-paleblue ring-2 ring-primary/20 shadow-[0_8px_25px_-4px_rgba(37,99,235,0.25)]"
                  : "border-border/80 bg-paleblue/45 hover:border-primary/50 hover:bg-white hover:shadow-[0_10px_25px_-5px_rgba(37,99,235,0.18)]"
              )}
            >
              {/* Subtle hover gradient wash */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/15 transition-all duration-300"
              />

              <div>
                {/* Top Badge & Icon Row */}
                <div className="flex items-center justify-between gap-1">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg border bg-white shadow-2xs transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                      accent
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors",
                      badgeClass
                    )}
                  >
                    {badge}
                  </span>
                </div>

                {/* Title */}
                <h4 className="mt-2.5 text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                  <span className="truncate">{sample.title}</span>
                </h4>

                {/* Description */}
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
                  {sample.description}
                </p>
              </div>

              {/* Bottom 1-Click Scan Action Indicator */}
              <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] font-semibold text-primary">
                <span className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                  <span>Run 1-Click Scan</span>
                </span>

                <motion.span
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-softblue text-primary transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-white"
                >
                  <ArrowRight className="h-3 w-3" />
                </motion.span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
