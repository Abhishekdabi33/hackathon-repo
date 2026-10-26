import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { analyzeReport } from "@/lib/ai-functions";
import { fileToReportInput, type ReportInput } from "@/lib/file-reader";
import { SAMPLE_REPORT_NAME, SAMPLE_REPORT_TEXT } from "@/lib/sample-report";
import { setCurrentReport } from "@/lib/current-report";
import { takePendingFile } from "@/lib/pending-file";
import { saveReport } from "@/lib/history";
import { UploadCard, type PickedFile } from "@/components/medai/UploadCard";
import { AnalysisStages } from "@/components/medai/AnalysisStages";
import { PressButton } from "@/components/medai/PressButton";
import { ResultsDashboard } from "@/components/medai/ResultsDashboard";
import { DisclaimerFooter } from "@/components/medai/DisclaimerFooter";
import { Reveal } from "@/components/medai/Reveal";
import { GlassCard } from "@/components/medai/GlassCard";
import type { Analysis } from "@/types/report";

type Phase = "upload" | "analyzing" | "revealing" | "done" | "error";

export const Route = createFileRoute("/analyze")({
  validateSearch: (search: Record<string, unknown>) => ({
    sample: search["sample"] === "1" || search["sample"] === "true" || search["sample"] === 1 || search["sample"] === true,
  }),
  head: () => ({
    meta: [
      { title: "Analyze a report — Samjho Health" },
      {
        name: "description",
        content: "Upload a PDF, JPG or PNG medical report and get a clear, structured AI summary.",
      },
      { property: "og:title", content: "Analyze a report — Samjho Health" },
      {
        property: "og:description",
        content: "Upload a PDF, JPG or PNG medical report and get a clear, structured AI summary.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyzePage,
});

function AnalyzePage() {
  const { sample } = Route.useSearch();
  const [phase, setPhase] = useState<Phase>("upload");
  const [file, setFile] = useState<PickedFile | null>(null);
  const fileRef = useRef<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const started = useRef(false);

  async function run(input: ReportInput, name: string) {
    setFileName(name);
    setPhase("analyzing");
    setError("");
    try {
      const result = await analyzeReport({ data: input });
      setAnalysis(result);
      setCurrentReport(result, name);
      saveReport({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        fileName: name,
        analysis: result,
      });
      setPhase("revealing");
      window.setTimeout(() => setPhase("done"), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while analyzing. Please try again.");
      setPhase("error");
    }
  }

  useEffect(() => {
    // A file handed over from the dashboard starts the flow immediately.
    const pending = takePendingFile();
    if (pending) void pick(pending);
  }, []);

  useEffect(() => {
    if (sample && !started.current) {
      started.current = true;
      run({ reportText: SAMPLE_REPORT_TEXT }, SAMPLE_REPORT_NAME);
    }
  }, [sample]);

  async function pick(f: File) {
    fileRef.current = f;
    setFile({ name: f.name, type: f.type || "Document", size: f.size });
    setError("");
    try {
      await fileToReportInput(f); // validate early so bad files fail fast
    } catch (err) {
      fileRef.current = null;
      setFile(null);
      setError(err instanceof Error ? err.message : "Could not read that file.");
      setPhase("error");
    }
  }

  async function analyzePicked() {
    const f = fileRef.current;
    if (!f) return;
    try {
      const input = await fileToReportInput(f);
      run(input, f.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that file.");
      setPhase("error");
    }
  }

  return (
    <main className="relative mx-auto min-h-dvh max-w-4xl px-6 pb-10 pt-32">
      <Link
        to="/"
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      {phase === "upload" && (
        <>
          <Reveal className="mb-10 text-center">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              What would you like to understand?
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Upload a lab report, scan or discharge summary. Hitho reads it and explains it in plain language.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <UploadCard
              file={file}
              onPick={pick}
              onRemove={() => {
                fileRef.current = null;
                setFile(null);
              }}
              onSample={() => run({ reportText: SAMPLE_REPORT_TEXT }, SAMPLE_REPORT_NAME)}
              onAnalyze={analyzePicked}
              busy={false}
            />
          </Reveal>
        </>
      )}

      {(phase === "analyzing" || phase === "revealing") && <AnalysisStages done={phase === "revealing"} />}

      {phase === "done" && analysis && <ResultsDashboard analysis={analysis} fileName={fileName} />}

      {phase === "error" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard intensity="strong" className="mx-auto max-w-lg p-8 text-center" tilt={false}>
            <span className="glass-soft mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
              <AlertTriangle className="h-5 w-5 text-caution" />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-tight">That didn't work</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{error}</p>
            <PressButton
              onClick={() => {
                setPhase("upload");
                setFile(null);
                setError("");
              }}
              className="mt-6 px-6 py-2.5 text-sm"
            >
              Try again
            </PressButton>
          </GlassCard>
        </motion.div>
      )}

      <DisclaimerFooter />
    </main>
  );
}
