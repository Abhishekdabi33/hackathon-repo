import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, FileText, Trash2, FolderOpen } from "lucide-react";
import { loadReports, clearReports } from "@/lib/history";
import { setCurrentReport } from "@/lib/current-report";
import { ResultsDashboard } from "@/components/medai/ResultsDashboard";
import { AiCharacter } from "@/components/medai/AiCharacter";
import { DisclaimerFooter } from "@/components/medai/DisclaimerFooter";
import { GlassCard } from "@/components/medai/GlassCard";
import { Reveal } from "@/components/medai/Reveal";
import type { SavedReport } from "@/types/report";

export const Route = createFileRoute("/reports")({
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search["id"] === "string" ? search["id"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Report history — Samjho Health" },
      { name: "description", content: "Browse the medical reports you have analyzed with Samjho Health." },
      { property: "og:title", content: "Report history — Samjho Health" },
      { property: "og:description", content: "Browse the medical reports you have analyzed with Samjho Health." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { id } = Route.useSearch();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setReports(loadReports());
    setLoaded(true);
  }, []);

  const selected = id ? reports.find((r) => r.id === id) : undefined;

  useEffect(() => {
    if (selected) setCurrentReport(selected.analysis, selected.fileName);
  }, [selected]);

  if (selected) {
    return (
      <main className="relative mx-auto min-h-dvh max-w-5xl px-6 pb-10 pt-32">
        <Link
          to="/reports"
          search={{ id: undefined }}
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All reports
        </Link>
        <ResultsDashboard analysis={selected.analysis} fileName={selected.fileName} />
        <DisclaimerFooter />
      </main>
    );
  }

  return (
    <main className="relative mx-auto min-h-dvh max-w-4xl px-6 pb-10 pt-32">
      <Reveal className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your report history</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Reports analyzed on this device, kept privately in your browser.
        </p>
      </Reveal>

      {loaded && reports.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-8 text-center">
          <div className="mx-auto w-fit opacity-90">
            <AiCharacter size={140} interactive={false} />
          </div>
          <h2 className="mt-6 text-lg font-semibold tracking-tight">No reports yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Analyze your first report and it will appear here.</p>
          <Link
            to="/analyze"
            search={{ sample: false }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] hover:bg-bright active:scale-95"
          >
            <FolderOpen className="h-4 w-4" /> Analyze a Report
          </Link>
        </motion.div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {reports.map((r, i) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 200, damping: 24 }}
            >
              <GlassCard className="flex items-center gap-4 p-4" tilt={false}>
                <span className="glass-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                  <FileText className="h-5 w-5 text-ice" strokeWidth={1.6} />
                </span>
                <Link to="/reports" search={{ id: r.id }} className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium">{r.analysis.reportTitle}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    · {r.fileName}
                  </p>
                </Link>
                <button
                  aria-label="Delete report"
                  onClick={() => {
                    const next = reports.filter((x) => x.id !== r.id);
                    setReports(next);
                    try {
                      window.localStorage.setItem("medai:reports", JSON.stringify(next));
                    } catch {
                      // ignore
                    }
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-alert/40 hover:text-alert"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {reports.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              clearReports();
              setReports([]);
            }}
            className="text-xs text-muted-foreground/70 underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Clear all history
          </button>
        </div>
      )}

      <DisclaimerFooter />
    </main>
  );
}
