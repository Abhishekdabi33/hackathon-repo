import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { analyzeReport } from "@/lib/ai-functions";
import { DemoReportsBar } from "@/components/medai/DemoReportsBar";
import { fetchClinicalSamples } from "@/lib/ai-functions";
import type { ClinicalSample } from "@/types/report";
import { fileToReportInput, type ReportInput } from "@/lib/file-reader";
import { SAMPLE_REPORT_NAME, SAMPLE_REPORT_TEXT } from "@/lib/sample-report";
import { setCurrentReport } from "@/lib/current-report";
import { takePendingFile, setPendingFile } from "@/lib/pending-file";
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
  const [samples, setSamples] = useState<ClinicalSample[]>([]);
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
    fetchClinicalSamples().then((data) => {
      if (data && data.length > 0) setSamples(data);
    });
  }, []);

  useEffect(() => {
    // A file handed over from the dashboard starts the flow immediately.
    const pending = takePendingFile();
    if (pending) {
      void (async () => {
        try {
          await pick(pending);
          const input = await fileToReportInput(pending);
          run(input, pending.name);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not read that report.");
          setPhase("error");
        }
      })();
    }
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

  const handleTextSubmit = (text: string, mode: "analyze" | "ask") => {
    const fname = mode === "analyze" ? "Pasted_Clinical_Report.txt" : "Clinical_Inquiry.txt";
    const f = new File([text], fname, { type: "text/plain" });
    pick(f);
    void (async () => {
      const input = await fileToReportInput(f);
      run(input, fname);
    })();
  };

  return (
    <main className="relative mx-auto min-h-dvh max-w-4xl px-6 pb-10 pt-32">
      <Link
        to="/"
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>

      {/* Upload & prompt stage */}
      {phase === "upload" && (
        <Reveal>
          <UploadCard
            file={file}
            onPick={pick}
            onRemove={() => {
              fileRef.current = null;
              setFile(null);
            }}
            onAnalyze={analyzePicked}
            onSample={() => run({ reportText: SAMPLE_REPORT_TEXT }, SAMPLE_REPORT_NAME)}
            onTextSubmit={handleTextSubmit}
          />
          {samples.length > 0 && (
            <div className="mt-6">
              <DemoReportsBar
                samples={samples}
                onSelect={(sample) => run({ reportText: sample.content }, sample.filename)}
              />
            </div>
          )}
        </Reveal>
      )}

      {/* In-progress analysis animation */}
      {(phase === "analyzing" || phase === "revealing") && (
        <AnalysisStages
          onComplete={() => {
            if (analysis) setPhase("done");
          }}
        />
      )}

      {/* Done: Results Dashboard */}
      {phase === "done" && analysis && (
        <>
          <div className="mb-6 flex justify-start">
            <button
              onClick={() => {
                setPhase("upload");
                setFile(null);
                setAnalysis(null);
                fileRef.current = null;
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-bright"
            >
              <ArrowLeft className="h-4 w-4" /> Analyze another report
            </button>
          </div>
          <ResultsDashboard analysis={analysis} fileName={fileName} />
          <DisclaimerFooter />
        </>
      )}

      {/* Error state */}
      {phase === "error" && (
        <Reveal>
          <GlassCard className="flex flex-col items-center gap-4 p-8 text-center sm:p-10" tilt={false}>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-alert/15 text-alert">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Could not complete analysis</h2>
            <p className="max-w-md text-sm text-muted-foreground">{error}</p>
            <div className="flex gap-3 pt-2">
              <PressButton
                onClick={() => {
                  setPhase("upload");
                  setError("");
                }}
              >
                Try again
              </PressButton>
            </div>
          </GlassCard>
        </Reveal>
      )}
    </main>
  );
}
