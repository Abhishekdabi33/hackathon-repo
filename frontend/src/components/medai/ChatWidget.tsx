import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SendHorizontal } from "lucide-react";
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
            className="glass-strong fixed bottom-24 right-4 z-[90] flex h-[540px] max-h-[calc(100dvh-7rem)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-4xl sm:right-6"
          >
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_2px_10px_rgba(37,99,235,0.2)]">
                <span className="flex gap-[3px]">
                  <span className="h-[9px] w-[4px] rounded-full bg-foreground" />
                  <span className="h-[9px] w-[4px] rounded-full bg-foreground" />
                </span>
              </span>
              <div>
                <p className="text-sm font-semibold tracking-tight">Ask about your report</p>
                <p className="text-[11px] text-muted-foreground">
                  {hasReport ? "Hitho has your latest report in context" : "Upload a report for tailored answers"}
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="space-y-2 pt-2">
                  <p className="px-1 pb-1 text-xs text-muted-foreground">Try asking…</p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="glass-soft block w-full rounded-2xl px-4 py-3 text-left text-[13px] text-foreground/90 transition-colors hover:bg-paleblue"
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
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed",
                      m.role === "user"
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-paleblue text-foreground/95",
                    )}
                  >
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {pending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-paleblue px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-ice"
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
              className="border-t border-border p-3"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-white/60 px-4 py-1.5 focus-within:border-bright/40">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Hitho anything…"
                  className="h-9 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/60"
                />
                <button
                  type="submit"
                  disabled={pending || !input.trim()}
                  aria-label="Send message"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-90 disabled:opacity-30"
                >
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher — the character itself */}
      <motion.button
        layoutId="chat-launcher"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Hitho chat" : "Chat with Hitho"}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-5 right-5 z-[90] flex h-16 w-16 items-center justify-center rounded-full"
      >
        <motion.span
          className="glass-strong absolute inset-0 rounded-full"
          animate={{ boxShadow: ["0 0 0 0 rgba(37,99,235,0.15)", "0 0 0 12px rgba(37,99,235,0)"] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
        <AiCharacter size={44} interactive={false} className="pointer-events-none" />
        {hasReport && !open && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-positive" />
        )}
      </motion.button>
    </>
  );
}
