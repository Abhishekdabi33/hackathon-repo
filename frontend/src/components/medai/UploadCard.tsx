import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  UploadCloud,
  X,
  Sparkles,
  SendHorizontal,
  Paperclip,
  RotateCcw,
  MessageCircle,
  HelpCircle,
  FileCheck,
  Stethoscope,
} from "lucide-react";
import { GlassCard } from "./GlassCard";
import { PressButton } from "./PressButton";
import { cn } from "@/lib/utils";

export type PickedFile = { name: string; type: string; size: number };

type UploadCardProps = {
  file: PickedFile | null;
  busy?: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
  onAnalyze: () => void;
  onSample: () => void;
  onTextSubmit?: (text: string, mode: "analyze" | "ask") => void;
};

const SAMPLE_CBC = `COMPLETE BLOOD COUNT (CBC)
Hemoglobin: 10.8 g/dL (Reference: 12.0 - 17.5 g/dL) [LOW]
RBC Count: 3.7 million/mcL (Reference: 4.0 - 6.0 million/mcL) [LOW]
WBC Count: 12,800 /mcL (Reference: 4,000 - 11,000 /mcL) [HIGH]
Platelets: 185,000 /mcL (Reference: 150,000 - 450,000 /mcL) [NORMAL]
Fasting Glucose: 138 mg/dL (Reference: 70 - 99 mg/dL) [HIGH]`;

const SAMPLE_LIPID = `LIPID PROFILE
Total Cholesterol: 245 mg/dL (Reference: 100 - 199 mg/dL) [HIGH]
Triglycerides: 218 mg/dL (Reference: 50 - 149 mg/dL) [HIGH]
HDL Cholesterol: 38 mg/dL (Reference: > 40 mg/dL) [LOW]
LDL Cholesterol: 163 mg/dL (Reference: 50 - 99 mg/dL) [HIGH]`;

const QUICK_QUESTIONS = [
  "What does an elevated LDL cholesterol level indicate?",
  "What is the difference between normal and critical hemoglobin?",
  "What lifestyle steps can help lower fasting blood sugar?",
  "What prioritized questions should I ask my doctor about fatigue?",
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadCard({
  file,
  busy,
  onPick,
  onRemove,
  onAnalyze,
  onSample,
  onTextSubmit,
}: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "text">("upload");
  const [dragging, setDragging] = useState(false);
  const [textInput, setTextInput] = useState("");

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(260, Math.max(90, el.scrollHeight))}px`;
    }
  }, [textInput]);

  const handleProcessText = (mode: "analyze" | "ask" = "analyze") => {
    const content = textInput.trim();
    if (!content) return;

    if (onTextSubmit) {
      onTextSubmit(content, mode);
    } else {
      // Default fallback: create virtual file and dispatch onPick
      const filename = mode === "analyze" ? "Pasted_Clinical_Report.txt" : "Clinical_Inquiry.txt";
      const virtualFile = new File([content], filename, { type: "text/plain" });
      onPick(virtualFile);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleProcessText("analyze");
    }
  };

  return (
    <div className="relative space-y-4">
      {/* Top Mode Segmented Switcher */}
      <div className="flex items-center justify-center">
        <div className="glass-soft flex items-center gap-1 rounded-full p-1.5 border border-border shadow-xs bg-white/80">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all",
              activeTab === "upload"
                ? "bg-primary text-white shadow-[0_2px_10px_rgba(37,99,235,0.25)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Upload Report File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={cn(
              "flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold transition-all",
              activeTab === "text"
                ? "bg-primary text-white shadow-[0_2px_10px_rgba(37,99,235,0.25)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Paste Report or Ask Question</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: FILE DRAG AND DROP ZONE */}
      {activeTab === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) onPick(f);
          }}
          className="relative"
        >
          <motion.div
            animate={dragging ? { scale: 1.015 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <GlassCard
              intensity={dragging ? "strong" : "glass"}
              className={cn(
                "flex flex-col items-center gap-5 px-8 py-10 text-center transition-shadow duration-300",
                dragging && "shadow-[0_0_80px_-10px_rgba(37,99,235,0.35)]"
              )}
            >
              {/* Floating document visual */}
              <motion.div
                animate={{ y: dragging ? -14 : [0, -8, 0] }}
                transition={
                  dragging
                    ? { type: "spring", stiffness: 200, damping: 12 }
                    : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
                }
                className="relative flex h-24 w-20 items-center justify-center"
              >
                <div
                  className="absolute inset-0 rounded-2xl border border-primary/15"
                  style={{
                    background: "linear-gradient(160deg, rgba(255,255,255,0.95), rgba(219,234,254,0.55))",
                    boxShadow: "0 20px 50px rgba(37,99,235,0.18), inset 0 1px 0 rgba(255,255,255,0.9)",
                  }}
                />
                <div className="absolute inset-x-3 top-3 space-y-1.5 opacity-50">
                  {[80, 60, 70, 45, 65].map((w, i) => (
                    <div key={i} className="h-[3px] rounded-full bg-primary" style={{ width: `${w}%` }} />
                  ))}
                </div>
                <FileText className="relative h-6 w-6 text-primary" strokeWidth={1.5} />
                {dragging && (
                  <motion.span
                    aria-hidden
                    className="absolute -inset-4 rounded-3xl border border-primary/40"
                    initial={{ opacity: 0.9, scale: 0.9 }}
                    animate={{ opacity: 0, scale: 1.35 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </motion.div>

              <div>
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  Drop your medical report here
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  PDF, Images, Video, Text or CSV — analyzed with 0ms deterministic validation
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <PressButton onClick={() => inputRef.current?.click()} className="px-6 py-3 text-sm">
                  <UploadCloud className="h-4 w-4" strokeWidth={2} />
                  Choose Report File
                </PressButton>

                <PressButton
                  variant="outline"
                  onClick={onSample}
                  className="px-5 py-3 text-sm font-semibold text-foreground hover:bg-paleblue"
                >
                  <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.8} />
                  Try Certified Sample
                </PressButton>
              </div>

              {/* Or switch to text prompt directly */}
              <div className="mt-2 text-xs text-muted-foreground">
                Don't have a file?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("text")}
                  className="font-semibold text-primary underline underline-offset-4 hover:text-bright"
                >
                  Paste report text or ask a question instead &rarr;
                </button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* VIEW 2: PASTE REPORT TEXT OR ASK ANY QUESTION PROMPT BOX */}
      {activeTab === "text" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
        >
          <GlassCard intensity="strong" className="p-6 sm:p-7 shadow-glass-card" tilt={false}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-softblue text-primary">
                  <FileCheck className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Paste Medical Report or Ask Health Questions
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Instant extraction against certified clinical reference standards
                  </p>
                </div>
              </div>

              {textInput && (
                <button
                  type="button"
                  onClick={() => setTextInput("")}
                  className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            {/* Auto-Resizing Textarea */}
            <div className="relative rounded-2xl border border-border bg-white p-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-xs">
              <textarea
                ref={textareaRef}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={4}
                placeholder="Paste laboratory results here (e.g. Hemoglobin 10.8 g/dL, Glucose 140 mg/dL, Platelets 185,000) or ask any question about your health..."
                className="w-full resize-none bg-transparent text-[13.5px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 outline-none font-sans"
              />

              {/* Bottom bar inside textarea */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-paleblue hover:text-primary transition-colors"
                    title="Attach file"
                  >
                    <Paperclip className="h-3.5 w-3.5 text-primary" />
                    <span>Attach File</span>
                  </button>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {textInput.length} characters
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleProcessText("ask")}
                    disabled={!textInput.trim() || busy}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-paleblue px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-softblue transition-all disabled:opacity-40"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Ask Question</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProcessText("analyze")}
                    disabled={!textInput.trim() || busy}
                    className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-bright transition-all disabled:opacity-40"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Analyze Report</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick-Fill Sample Pills */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" /> Quick Inspiration
                </span>
                <span className="text-[10px] text-muted-foreground">Click to populate</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setTextInput(SAMPLE_CBC)}
                  className="rounded-full border border-border/80 bg-paleblue/50 px-3 py-1 text-[11px] font-semibold text-foreground/80 hover:bg-paleblue hover:text-primary hover:border-primary/40 transition-all"
                >
                  🔬 Paste Complete Blood Count (CBC)
                </button>

                <button
                  type="button"
                  onClick={() => setTextInput(SAMPLE_LIPID)}
                  className="rounded-full border border-border/80 bg-paleblue/50 px-3 py-1 text-[11px] font-semibold text-foreground/80 hover:bg-paleblue hover:text-primary hover:border-primary/40 transition-all"
                >
                  🫀 Paste Lipid Panel
                </button>

                {QUICK_QUESTIONS.slice(0, 2).map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTextInput(q)}
                    className="rounded-full border border-border/80 bg-white px-3 py-1 text-[11px] font-medium text-muted-foreground hover:bg-paleblue hover:text-primary hover:border-primary/40 transition-all"
                  >
                    ❓ {q}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Hidden file input supporting PDF, Images, Text, and CSV */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,.json,.mp4,.mov,.webm,.avi,image/*,video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />

      {/* Uploaded file preview card */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="glass mt-4 flex items-center gap-4 rounded-2xl px-5 py-4 border border-primary/20 bg-white shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paleblue">
              <FileText className="h-5 w-5 text-primary" strokeWidth={1.6} />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {file.type || "Document"} · {formatSize(file.size)}
              </p>
            </div>
            <button
              onClick={onRemove}
              aria-label="Remove file"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <PressButton onClick={onAnalyze} disabled={busy} className="px-5 py-2 text-sm">
              {busy ? "Uploading…" : "Analyze Now"}
            </PressButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
