import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, UploadCloud, X, Sparkles } from "lucide-react";
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
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadCard({ file, busy, onPick, onRemove, onAnalyze, onSample }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
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
            "flex flex-col items-center gap-5 px-8 py-12 text-center transition-shadow duration-300",
            dragging && "shadow-[0_0_80px_-10px_rgba(37,99,235,0.35)]",
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
            <FileText className="relative h-6 w-6 text-ice" strokeWidth={1.5} />
            {dragging && (
              <motion.span
                aria-hidden
                className="absolute -inset-4 rounded-3xl border border-ice/40"
                initial={{ opacity: 0.9, scale: 0.9 }}
                animate={{ opacity: 0, scale: 1.35 }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </motion.div>

          <div>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Drop your medical report here</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">PDF, Image, Text or CSV — analyzed with 0ms deterministic validation</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <PressButton onClick={() => inputRef.current?.click()} className="px-6 py-3 text-sm">
              <UploadCloud className="h-4 w-4" strokeWidth={2} />
              Choose Report
            </PressButton>
            <PressButton
              variant="outline"
              onClick={onSample}
              className="px-5 py-3 text-sm font-medium text-foreground hover:bg-paleblue"
            >
              <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.8} />
              Try Sample Report
            </PressButton>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,.json,image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
              e.target.value = "";
            }}
          />
        </GlassCard>
      </motion.div>

      {/* Uploaded file card */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="glass mt-4 flex items-center gap-4 rounded-2xl px-5 py-4"
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
            <PressButton
              onClick={onAnalyze}
              disabled={busy}
              className="px-5 py-2 text-sm"
            >
              {busy ? "Uploading…" : "Analyze"}
            </PressButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
