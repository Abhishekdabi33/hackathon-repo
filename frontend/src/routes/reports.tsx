import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, FileText, Trash2, FolderOpen } from "lucide-react";
import { loadReports, clearReports, deleteReport } from "@/lib/history";
import { Search, ShieldAlert, CheckCircle } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setReports(loadReports());
    setLoaded(true);
  }, []);

  const selected = id ? reports.find((r) => r.id === id) : undefined;

  useEffect(() => {
    if (selected) setCurrentReport(selected.analysis, selected.fileName);
  }, [selected]);

  const filteredReports = reports.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const title = (r.analysis?.reportTitle || "").toLowerCase();
    const file = (r.fileName || "").toLowerCase();
    return title.includes(q) || file.includes(q);
  });


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
      <Reveal className="mb-8 text-center">
        <div className="mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-paleblue px-3 py-1 text-xs font-semibold text-primary">
          <span>{reports.length} Unique {reports.length === 1 ? "Report" : "Reports"} Saved</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your Report History</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Deduplicated diagnostic reports analyzed on this device, kept 100% privately in your browser.
        </p>
      </Reveal>

      {/* Search & Filter Bar */}
      {reports.length > 1 && (
        <Reveal delay={0.05} className="mb-6">
          <div className="relative mx-auto max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title or file name..."
              className="w-full rounded-full border border-border bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 shadow-xs"
            />
          </div>
        </Reveal>
      )}

      {loaded && reports.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-8 text-center">
          <div className="mx-auto w-fit opacity-90">
            <AiCharacter size={140} interactive={false} />
          </div>
          <h2 className="mt-6 text-lg font-semibold tracking-tight">No reports yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">Analyze your first report and it will appear here without duplicates.</p>
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
        <AnimatePresence mode="popLayout">
          {filteredReports.map((r, i) => {
            const abnormalCount = r.analysis?.abnormal_count || 0;
            return (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 240, damping: 24 }}
              >
                <GlassCard className="flex items-center gap-4 p-4 hover:border-primary/30 transition-all" tilt={false}>
                  <span className="glass-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-softblue/60 text-primary">
                    <FileText className="h-5 w-5" strokeWidth={1.6} />
                  </span>

                  <Link to="/reports" search={{ id: r.id }} className="min-w-0 flex-1 group">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors">
                        {r.analysis?.reportTitle || r.fileName}
                      </p>
                      {abnormalCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          <ShieldAlert className="h-2.5 w-2.5" />
                          {abnormalCount} flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle className="h-2.5 w-2.5" />
                          Normal
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      · <span className="font-mono text-[11px]">{r.fileName}</span>
                      {r.analysis?.values?.length ? ` · ${r.analysis.values.length} lab values` : ""}
                    </p>
                  </Link>

                  <button
                    type="button"
                    aria-label="Delete report"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const next = deleteReport(r.id);
                      setReports(next);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive hover:bg-red-50"
                    title="Delete report"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </GlassCard>
              </motion.div>
            );
          })}
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
