import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SendHorizontal, Sparkles, MessageCircle, Bot, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AiCharacter } from "./AiCharacter";
import { chatWithHitho } from "@/lib/ai-functions";
import { getCurrentReport } from "@/lib/current-report";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What does my report mean?",
  "What should I pay attention to?",
  "Explain this result simply.",
  "What do these abbreviations mean?",
];

const SMART_FOLLOWUPS = [
  "What foods should I avoid with high BP?",
  "Explain medication precautions & side effects",
  "इसे आसान हिंदी में समझाओ (Hindi)",
  "What prioritized questions should I ask my doctor?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [hasReport, setHasReport] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setHasReport(!!getCurrentReport());
    check();
    const interval = setInterval(check, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending, open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;
    const history = [...messages, { role: "user" as const, content }];
    setMessages(history);
    setInput("");
    setPending(true);
    try {
      const report = getCurrentReport();
      const reply = await chatWithHitho({
        data: { history: history.slice(-12), reportContext: report ? JSON.stringify(report.analysis) : undefined },
      });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${message}` }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {/* Expanded chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.9, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 24, scale: 0.92, filter: "blur(6px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            style={{ transformOrigin: "bottom right" }}
            className="glass-strong fixed bottom-24 right-4 z-[90] flex h-[540px] max-h-[calc(100dvh-7rem)] w-[min(92vw,400px)] flex-col overflow-hidden rounded-4xl sm:right-6 border border-border bg-white shadow-glass-float"
          >
            <div className="flex items-center justify-between border-b border-border bg-white/90 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-sm">
                  <span className="flex gap-[2.5px]">
                    <span className="h-[8px] w-[3px] rounded-full bg-white" />
                    <span className="h-[8px] w-[3px] rounded-full bg-white" />
                  </span>
                </span>
                <div>
                  <p className="text-sm font-semibold tracking-tight text-foreground">Ask Hitho Companion</p>
                  <p className="text-[11px] text-muted-foreground">
                    {hasReport ? "Latest clinical report in context" : "Gemma 4 12B • Clinical Assistant"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-paleblue hover:text-foreground transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="space-y-2 pt-2">
                  <p className="px-1 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quick Suggestions
                  </p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="glass-soft block w-full rounded-2xl px-4 py-3 text-left text-[13px] font-medium text-foreground transition-colors hover:bg-paleblue hover:border-primary/30"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed",
                      m.role === "user"
                        ? "rounded-br-md bg-primary text-white shadow-sm font-medium"
                        : "rounded-bl-md bg-paleblue text-foreground border border-border/80 shadow-sm"
                    )}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-strong:bg-white/60 prose-strong:px-1 prose-strong:rounded">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Smart Follow-Up Chips */}
              {messages.length > 0 && !pending && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground w-full flex items-center gap-1 mb-1">
                    <Sparkles className="h-2.5 w-2.5 text-primary" /> Follow-up Suggestions:
                  </span>
                  {SMART_FOLLOWUPS.map((f, idx) => (
                    <button
                      key={idx}
                      onClick={() => send(f)}
                      className="rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-paleblue hover:text-primary transition-all shadow-xs"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}

              {pending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-paleblue px-4 py-3 border border-border/60">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-primary"
                        animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-border bg-white/90 p-3"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-paleblue/50 px-4 py-1.5 focus-within:border-primary focus-within:bg-white transition-all">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Hitho about your medical report…"
                  className="h-9 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || pending}
                  className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-all hover:bg-bright disabled:opacity-30"
                  aria-label="Send message"
                >
                  <SendHorizontal className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating launcher bubble */}
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="glass-strong fixed bottom-6 right-4 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-glass-float sm:right-6 border border-border"
        aria-label="Open chat assistant"
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-[0_4px_16px_rgba(37,99,235,0.35)]">
          <span className="flex gap-[3px]">
            <span className="h-[10px] w-[4px] rounded-full bg-white" />
            <span className="h-[10px] w-[4px] rounded-full bg-white" />
          </span>
        </span>
      </motion.button>
    </>
  );
}
