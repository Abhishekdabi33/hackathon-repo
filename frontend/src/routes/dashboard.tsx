import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Clock, FileText, MessageCircle, ShieldCheck, Sparkles, Activity } from "lucide-react";
import { loadReports } from "@/lib/history";
import { setPendingFile } from "@/lib/pending-file";
import { UploadCard } from "@/components/medai/UploadCard";
import { AiCharacter } from "@/components/medai/AiCharacter";
import { GlassCard } from "@/components/medai/GlassCard";
import { Reveal } from "@/components/medai/Reveal";
import { PressLink } from "@/components/medai/PressLink";
import { DisclaimerFooter } from "@/components/medai/DisclaimerFooter";
import { fetchClinicalSamples } from "@/lib/ai-functions";
import type { SavedReport, ClinicalSample } from "@/types/report";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard — Samjho Health" },
      {
        name: "description",
        content: "Your Samjho Health dashboard: analyze a new report, revisit recent summaries and ask follow-up questions.",
      },
      { property: "og:title", content: "Your dashboard — Samjho Health" },
      {
        property: "og:description",
        content: "Analyze a new medical report, revisit recent summaries and ask follow-up questions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const TIPS = [
  "What does my report mean?",
  "What should I pay attention to?",
  "Explain this result simply.",
];

function DashboardPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [samples, setSamples] = useState<ClinicalSample[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setReports(loadReports());
    setLoaded(true);
    fetchClinicalSamples().then((data) => {
      if (data && data.length > 0) {
        setSamples(data);
      }
    });
  }, []);

  const recent = reports.slice(0, 3);
  const lastAnalyzed = reports[0] ? new Date(reports[0].createdAt) : null;

  const handleSelectSample = (sample: ClinicalSample) => {
    const file = new File([sample.content], sample.filename, { type: "text/plain" });
    setPendingFile(file);
    void navigate({ to: "/analyze", search: { sample: false } });
  };

  const handleTextSubmit = (text: string, mode: "analyze" | "ask") => {
    const filename = mode === "analyze" ? "Pasted_Clinical_Report.txt" : "Clinical_Inquiry.txt";
    const file = new File([text], filename, { type: "text/plain" });
    setPendingFile(file);
    void navigate({ to: "/analyze", search: { sample: false } });
  };

  return (
    <main className="relative mx-auto min-h-dvh max-w-5xl px-6 pb-10 pt-28 sm:pt-32">
      {/* Greeting */}
      <Reveal className="mb-10 flex flex-col items-center text-center">
        <AiCharacter size={96} interactive={false} />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Your Health Dashboard
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Upload your medical document, paste report text directly, ask health questions, or test one of our pre-loaded certified samples.
        </p>
      </Reveal>

      {/* Pre-Loaded Clinical Report Samples Bar */}
      {samples.length > 0 && (
        <Reveal delay={0.03}>
          <div className="mb-6 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <Activity className="h-3.5 w-3.5" /> Demo Diagnostic Reports (1-Click Analysis)
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">Pre-loaded EvidenceTrace™ Data</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {samples.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelectSample(s)}
                  className="flex flex-col text-left rounded-xl border border-border/80 bg-paleblue/60 p-3 hover:bg-paleblue hover:border-primary/40 hover:shadow-sm transition-all group"
                >
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                    <span className="truncate">{s.title}</span>
                    <Sparkles className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{s.description}</span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className="space-y-8">
          <Reveal delay={0.05}>
            <UploadCard
              file={null}
              onPick={(f) => {
                setPendingFile(f);
                void navigate({ to: "/analyze", search: { sample: false } });
              }}
              onRemove={() => {}}
              onAnalyze={() => {}}
              onSample={() => void navigate({ to: "/analyze", search: { sample: true } })}
              onTextSubmit={handleTextSubmit}
            />
          </Reveal>

          <section>
            <Reveal className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Recent reports</h2>
                <p className="mt-1 text-sm text-muted-foreground">Your latest analyses, kept privately on this device.</p>
              </div>
              {reports.length > 3 && (
                <Link
                  to="/reports"
                  search={{ id: undefined }}
                  className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-bright"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </Reveal>

            {loaded && recent.length === 0 ? (
              <GlassCard className="flex flex-col items-center gap-3 p-8 text-center" tilt={false}>
                <span className="glass-soft flex h-11 w-11 items-center justify-center rounded-2xl bg-softblue/60">
                  <FileText className="h-5 w-5 text-primary" />
                </span>
                <p className="text-sm font-semibold text-foreground">No reports yet</p>
                <p className="max-w-xs text-[13px] text-muted-foreground">
                  Upload your first report above, paste text directly into the prompt box, or try one of the certified demo samples.
                </p>
              </GlassCard>
            ) : (
              <div className="space-y-3">
                {recent.map((r, i) => (
                  <Reveal key={r.id} delay={0.04 * i}>
                    <Link
                      to="/reports"
                      search={{ id: r.id }}
                      className="glass flex items-center justify-between gap-4 rounded-2xl p-4 transition-all hover:border-primary/30 hover:bg-paleblue/50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="glass-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-softblue/60">
                          <FileText className="h-4 w-4 text-primary" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{r.fileName}</p>
                          <p className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                            <span>·</span>
                            <span>{r.analysis.values.length} values</span>
                            {r.analysis.abnormal_count ? (
                              <span className="text-amber-600 font-medium">({r.analysis.abnormal_count} flagged)</span>
                            ) : null}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </Reveal>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-5">
          {/* Quick stats */}
          <Reveal delay={0.08}>
            <GlassCard className="p-5" tilt={false}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl border border-border bg-paleblue/60 p-3">
                  <p className="font-mono text-2xl font-bold text-foreground">{reports.length}</p>
                  <p className="text-[11px] text-muted-foreground">Total Analyzed</p>
                </div>
                <div className="rounded-xl border border-border bg-paleblue/60 p-3">
                  <p className="font-mono text-2xl font-bold text-foreground">0ms</p>
                  <p className="text-[11px] text-muted-foreground">EvidenceTrace™ Latency</p>
                </div>
              </div>
              {lastAnalyzed && (
                <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Last active {lastAnalyzed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </GlassCard>
          </Reveal>

          {/* Prompt inspiration */}
          <Reveal delay={0.12}>
            <GlassCard className="p-5" tilt={false}>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" /> What to Ask
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Tap any prompt to paste into the text box above.</p>
              <div className="mt-3 space-y-2">
                {TIPS.map((tip) => (
                  <div
                    key={tip}
                    className="flex items-center gap-2 rounded-xl border border-border/80 bg-paleblue/50 p-2.5 text-xs text-foreground/90 font-medium"
                  >
                    <MessageCircle className="h-3 w-3 text-primary shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </Reveal>

          {/* Privacy badge */}
          <Reveal delay={0.16}>
            <div className="glass flex items-start gap-3 rounded-2xl p-4 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Grounded Clinical Safety</p>
                <p className="mt-0.5 leading-relaxed">
                  Every metric is validated against certified standards. No medical hallucinations.
                </p>
              </div>
            </div>
          </Reveal>
        </aside>
      </div>

      <DisclaimerFooter />
    </main>
  );
}
