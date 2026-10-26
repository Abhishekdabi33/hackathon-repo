import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Activity,
  HeartPulse,
  MessageCircle,
  BookOpenText,
  CircleHelp,
  Printer,
  Volume2,
  VolumeX,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { GlassCard } from "./GlassCard";
import { Reveal } from "./Reveal";
import { ExplainDialog, type ExplainTarget } from "./ExplainDialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { statusLabel, type Analysis, type EvidenceTraceItem } from "@/types/report";
import { exportClinicalSummary } from "@/lib/ai-functions";
import { cn } from "@/lib/utils";

const statusStyles = {
  normal: "text-positive",
  attention: "text-caution",
  outside_range: "text-alert",
} as const;

const statusBg = {
  normal: "bg-positive",
  attention: "bg-caution",
  outside_range: "bg-alert",
} as const;

export function ResultsDashboard({ analysis, fileName }: { analysis: Analysis; fileName?: string }) {
  const [explainTarget, setExplainTarget] = useState<ExplainTarget | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const abnormalCount = analysis.abnormal_count ?? 
    (analysis.evidence_trace?.filter((e) => e.is_abnormal).length || 0);

  // Audio Readout using browser SpeechSynthesis with Hindi & English voice detection
  const handleToggleSpeak = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = (analysis.summary || "").replace(/[*#_`>|]/g, " ").replace(/\n+/g, ". ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.98;
    utterance.pitch = 1.0;

    try {
      const voices = window.speechSynthesis.getVoices();
      const isHindi = /kya|mera|meri|hai|dawa|dard|khoon|daktar|theek|parhez/i.test(cleanText);
      if (isHindi) {
        const hiVoice = voices.find((v) => v.lang.includes("hi") || v.name.includes("Hindi"));
        if (hiVoice) {
          utterance.voice = hiVoice;
          utterance.lang = "hi-IN";
        }
      }
    } catch (e) {}

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 90, damping: 18 }}
      className="mx-auto w-full max-w-5xl"
    >
      {/* Header with Title and Model / Latency Badges */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Report Analyzed</p>
            <span className="rounded-full bg-softblue/60 px-2 py-0.5 text-[10px] font-mono font-medium text-primary">
              {analysis.model_used || "Google Gemma 4 12B • EvidenceTrace™"}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Your Report, Simplified
          </h1>
          {fileName && <p className="mt-1.5 text-sm text-muted-foreground">{fileName}</p>}
        </div>

        {/* Action Buttons: Export Summary PDF & Audio Readout */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleToggleSpeak}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition-all",
              isSpeaking
                ? "bg-primary text-white shadow-[0_4px_16px_rgba(37,99,235,0.3)] animate-pulse"
                : "border border-border bg-white text-foreground hover:bg-paleblue hover:text-primary"
            )}
            title="Read summary aloud"
          >
            {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-primary" />}
            <span>{isSpeaking ? "Stop Audio" : "Read Aloud"}</span>
          </button>

          <button
            type="button"
            onClick={() => exportClinicalSummary(analysis, "Patient")}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(37,99,235,0.25)] transition-all hover:bg-bright"
            title="Export clean clinical brief"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Export Summary (PDF)</span>
          </button>
        </div>
      </div>

      {/* Abnormal Count Alert Banner */}
      <Reveal>
        <div
          className={cn(
            "mb-6 flex items-center justify-between gap-3 rounded-2xl border p-4 transition-all shadow-sm",
            abnormalCount > 0
              ? "border-amber-200 bg-amber-50/70 text-amber-900"
              : "border-emerald-200 bg-emerald-50/70 text-emerald-900"
          )}
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl",
                abnormalCount > 0 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
              )}
            >
              {abnormalCount > 0 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                {abnormalCount > 0
                  ? `${abnormalCount} Parameter${abnormalCount > 1 ? "s" : ""} Outside Standard Clinical Range`
                  : "All Certified Physiological Parameters Within Normal Limits"}
              </p>
              <p className="text-xs opacity-80">
                {abnormalCount > 0
                  ? "EvidenceTrace™ flagged items requiring review with your treating physician."
                  : "Deterministic range verification shows stable laboratory readings."}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] font-semibold uppercase tracking-wider opacity-70">
            EvidenceTrace™ 0ms Verified
          </span>
        </div>
      </Reveal>

      {/* AI Summary Card */}
      <Reveal>
        <GlassCard intensity="strong" className="p-7 sm:p-9 shadow-glass-card" tilt={false}>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Clinical AI Summary
          </div>
          <div className="mt-4 max-w-3xl leading-relaxed text-foreground/95">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h2 className="mb-3 mt-5 flex items-center gap-2 border-b border-border/80 pb-2 text-base font-bold uppercase tracking-wider text-primary">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {children}
                  </h2>
                ),
                h2: ({ children }) => (
                  <h3 className="mb-2 mt-4 flex items-center gap-2 border-b border-border/60 pb-1.5 text-sm font-bold uppercase tracking-wide text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-softblue" />
                    {children}
                  </h3>
                ),
                h3: ({ children }) => (
                  <h4 className="mb-2 mt-3 text-sm font-semibold text-foreground">
                    {children}
                  </h4>
                ),
                strong: ({ children }) => (
                  <strong className="rounded-md bg-paleblue px-1.5 py-0.5 font-semibold text-primary border border-primary/20">
                    {children}
                  </strong>
                ),
                p: ({ children }) => (
                  <p className="mb-3 text-[15px] sm:text-base leading-relaxed text-foreground/90">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-4 space-y-2 pl-1">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-4 list-decimal space-y-2 pl-5 text-sm text-foreground/90">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2 text-sm text-foreground/90 leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{children}</span>
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-3 rounded-2xl border-l-4 border-primary bg-paleblue/50 px-4 py-3 text-sm italic text-foreground/80">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {analysis.summary}
            </ReactMarkdown>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" /> Educational summary grounded by certified clinical reference intervals. Please review all findings with a healthcare professional.
          </p>
        </GlassCard>
      </Reveal>

      {/* EvidenceTrace™ Deterministic Validation Matrix Table */}
      {analysis.evidence_trace && analysis.evidence_trace.length > 0 && (
        <section className="mt-12">
          <SectionHeader
            icon={<FileSpreadsheet className="h-4 w-4 text-primary" />}
            title="EvidenceTrace™ Validation Matrix"
            sub="Certified laboratory ranges & deterministic verification"
          />
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-glass-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-paleblue/70 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3.5">Test Name</th>
                      <th className="px-4 py-3.5">Observed Value</th>
                      <th className="px-4 py-3.5">Reference Range</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Clinical Significance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {analysis.evidence_trace.map((item, idx) => {
                      const isAbnormal = item.is_abnormal || item.status !== "NORMAL";
                      return (
                        <tr
                          key={item.test_name + idx}
                          className={cn(
                            "transition-colors",
                            isAbnormal ? "bg-amber-50/30 hover:bg-amber-50/50" : "hover:bg-paleblue/40"
                          )}
                        >
                          <td className="px-5 py-3.5 font-semibold text-foreground">
                            {item.test_name}
                          </td>
                          <td className="px-4 py-3.5 font-mono font-semibold text-foreground">
                            {item.measured_value} {item.unit}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-muted-foreground">
                            {item.stated_range || "Standard range"}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                                item.status === "NORMAL"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : item.status === "CRITICAL"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              )}
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  item.status === "NORMAL" ? "bg-emerald-500" : item.status === "CRITICAL" ? "bg-rose-500" : "bg-amber-500"
                                )}
                              />
                              {item.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground leading-relaxed max-w-xs">
                            {item.clinical_significance}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Prioritized Questions for Your Doctor */}
      {analysis.doctor_questions && analysis.doctor_questions.length > 0 && (
        <section className="mt-12">
          <SectionHeader
            icon={<Stethoscope className="h-4 w-4 text-primary" />}
            title="Prioritized Questions for Your Doctor"
            sub="Empowering patient-physician consultations"
          />
          <Reveal>
            <div className="grid gap-3 sm:grid-cols-2">
              {analysis.doctor_questions.map((q, qIdx) => (
                <GlassCard key={qIdx} intensity="soft" className="p-5 flex items-start gap-3.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white shadow-sm">
                    Q{qIdx + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/90 font-medium pt-0.5">
                    {q}
                  </p>
                </GlassCard>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* Key findings */}
      <section className="mt-12">
        <SectionHeader icon={<HeartPulse className="h-4 w-4 text-primary" />} title="Key Findings" />
        <div className="grid gap-4 sm:grid-cols-2">
          {(analysis.findings ?? []).map((finding, i) => (
            <Reveal key={finding.term + i} delay={0.05 * i}>
              <GlassCard className="h-full p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">{finding.term}</h3>
                  <span
                    className={cn(
                      "flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-paleblue px-2.5 py-1 text-[11px] font-medium",
                      statusStyles[finding.importance]
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", statusBg[finding.importance])} />
                    {statusLabel(finding.importance)}
                  </span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{finding.explanation}</p>
                <div className="mt-4 flex items-center justify-between">
                  {finding.value ? (
                    <span className="rounded-lg bg-paleblue px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                      {finding.value}
                    </span>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={() => setExplainTarget(finding)}
                    className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-paleblue active:scale-95"
                  >
                    <CircleHelp className="h-3.5 w-3.5" /> Explain
                  </button>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Medical values */}
      {(analysis.values ?? []).length > 0 && (
        <section className="mt-12">
          <SectionHeader icon={<Activity className="h-4 w-4 text-primary" />} title="Medical Values" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(analysis.values ?? []).map((v, i) => (
              <Reveal key={v.name + i} delay={0.03 * i} y={18}>
                <GlassCard intensity="soft" className="p-5" tilt={false}>
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-muted-foreground">{v.name}</p>
                    <span
                      className={cn(
                        "flex items-center gap-1.5 text-[11px] font-medium",
                        statusStyles[v.status]
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", statusBg[v.status])} />
                      {statusLabel(v.status)}
                    </span>
                  </div>
                  <p className="mt-2.5 font-mono text-2xl font-bold tracking-tight text-foreground">
                    {v.value}
                    {v.unit && <span className="ml-1.5 text-sm font-normal text-muted-foreground">{v.unit}</span>}
                  </p>
                  {v.reference && (
                    <p className="mt-1.5 text-[11px] text-muted-foreground/80">Reference: {v.reference}</p>
                  )}
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Abbreviations */}
      {(analysis.abbreviations ?? []).length > 0 && (
        <section className="mt-12">
          <SectionHeader icon={<BookOpenText className="h-4 w-4 text-primary" />} title="Abbreviations, Decoded" />
          <Reveal>
            <div className="flex flex-wrap gap-2">
              {(analysis.abbreviations ?? []).map((a, i) => (
                <span
                  key={a.abbr + i}
                  className="glass-soft rounded-full px-4 py-2 text-xs text-muted-foreground"
                >
                  <span className="font-mono font-bold text-foreground">{a.abbr}</span>
                  <span className="mx-2 text-foreground/20">·</span>
                  {a.meaning}
                </span>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      <ExplainDialog target={explainTarget} onClose={() => setExplainTarget(null)} />
    </motion.div>
  );
}

function SectionHeader({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <span className="glass-soft flex h-8 w-8 items-center justify-center rounded-full bg-softblue/50">
          {icon}
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </div>
      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <MessageCircle className="h-3 w-3 text-primary" /> Grounded in clinical evidence
      </span>
    </div>
  );
}
