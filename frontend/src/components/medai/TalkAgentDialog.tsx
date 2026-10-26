import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  MessageCircle,
  RotateCcw,
  Stethoscope,
  SendHorizontal,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AiCharacter } from "./AiCharacter";
import { chatWithHitho } from "@/lib/ai-functions";
import { getCurrentReport } from "@/lib/current-report";
import { cn } from "@/lib/utils";

type TalkAgentProps = {
  open: boolean;
  onClose: () => void;
};

type VoiceState = "idle" | "listening" | "thinking" | "speaking";

const QUICK_TALK_PROMPTS = [
  "Explain my hemoglobin and iron levels",
  "What does an elevated LDL cholesterol mean?",
  "Is my fasting glucose in a healthy range?",
  "What prioritized questions should I ask my doctor?",
];

export function TalkAgentDialog({ open, onClose }: TalkAgentProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [liveSpeech, setLiveSpeech] = useState("");
  const [response, setResponse] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [history, setHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  const recognitionRef = useRef<any>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setVoiceState("listening");
        setLiveSpeech("");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const text = final || interim;
        setLiveSpeech(text);
        if (final) {
          setTranscript(final);
          handleAskQuestion(final);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        if (voiceState === "listening") {
          setVoiceState("idle");
        }
      };

      recognition.onend = () => {
        if (voiceState === "listening" && !transcript) {
          setVoiceState("idle");
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Cancel speaking when closed
  useEffect(() => {
    if (!open) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setVoiceState("idle");
      setLiveSpeech("");
    }
  }, [open]);

  // Start Voice Listening
  const startListening = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setResponse("");
    setLiveSpeech("");
    setTranscript("");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 200);
        } catch {}
      }
    } else {
      // Fallback for browsers without speech recognition
      setLiveSpeech("Listening not supported on this browser. You can type or tap a quick prompt below!");
      setVoiceState("idle");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setVoiceState("idle");
  };

  // Speak Answer aloud with speech synthesis
  const speakText = (text: string) => {
    if (!window.speechSynthesis || isMuted) return;

    window.speechSynthesis.cancel();
    const cleanText = (text || "").replace(/[*#_`>|]/g, " ").replace(/\n+/g, ". ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
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
    } catch {}

    utterance.onstart = () => {
      setVoiceState("speaking");
    };
    utterance.onend = () => {
      setVoiceState("idle");
    };
    utterance.onerror = () => {
      setVoiceState("idle");
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Handle Question Query
  const handleAskQuestion = async (queryText: string) => {
    const q = queryText.trim();
    if (!q) return;

    stopListening();
    setVoiceState("thinking");
    setTranscript(q);

    const report = getCurrentReport();
    const reportContext = report ? JSON.stringify(report.analysis) : undefined;
    const newHistory = [...history, { role: "user" as const, content: q }];
    setHistory(newHistory);

    try {
      const reply = await chatWithHitho({
        data: {
          history: newHistory.slice(-8),
          reportContext,
        },
      });

      setResponse(reply);
      setHistory((prev) => [...prev, { role: "assistant", content: reply }]);
      speakText(reply);
    } catch (err) {
      const fallbackMsg = "I couldn't process that query right now. Please check if the local server is running or try again.";
      setResponse(fallbackMsg);
      setVoiceState("idle");
    }
  };

  // Determine character animated state
  const getAiState = () => {
    if (voiceState === "thinking") return "thinking";
    if (voiceState === "listening" || voiceState === "speaking") return "happy";
    return "idle";
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="glass-strong relative z-10 w-full max-w-xl overflow-hidden rounded-4xl border border-white/80 bg-white/95 p-6 sm:p-8 shadow-glass-float"
        >
          {/* Top Bar with Badge, Audio Mute, and Close */}
          <div className="flex items-center justify-between pb-4 border-b border-border/80">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
                <Stethoscope className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Voice Talk Assistant
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Gemma 4 12B • Clinical Grounding
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsMuted((m) => !m);
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors",
                  isMuted ? "bg-amber-50 text-amber-700" : "bg-white text-muted-foreground hover:text-foreground"
                )}
                title={isMuted ? "Audio muted" : "Mute audio"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-muted-foreground hover:bg-paleblue hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Central Interactive Companion Visualizer */}
          <div className="relative my-6 flex flex-col items-center text-center">
            {/* Animated Halo on Listening / Speaking */}
            <div className="relative flex items-center justify-center">
              {voiceState === "listening" && (
                <motion.div
                  className="absolute -inset-6 rounded-full border-2 border-primary/40 bg-primary/10"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.2, 0.8] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {voiceState === "speaking" && (
                <motion.div
                  className="absolute -inset-5 rounded-full border border-primary/30 bg-softblue/30"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.3, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              <AiCharacter size={140} state={getAiState()} interactive={false} />
            </div>

            {/* State Label & Voice Waveform */}
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    voiceState === "listening"
                      ? "bg-rose-500 animate-ping"
                      : voiceState === "thinking"
                      ? "bg-amber-500 animate-pulse"
                      : voiceState === "speaking"
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-primary"
                  )}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {voiceState === "listening"
                    ? "Listening to you..."
                    : voiceState === "thinking"
                    ? "Reasoning with Gemma..."
                    : voiceState === "speaking"
                    ? "Hitho is Speaking"
                    : "Tap Microphone to Speak"}
                </span>
              </div>

              {/* Acoustic equalizer wavebars during speaking */}
              {voiceState === "speaking" && (
                <div className="flex items-center gap-1 h-4">
                  {[12, 24, 18, 30, 16, 22, 14].map((h, idx) => (
                    <motion.span
                      key={idx}
                      className="w-1 rounded-full bg-primary"
                      animate={{ height: [6, h, 6] }}
                      transition={{ duration: 0.6 + idx * 0.08, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Live speech transcription */}
            {(liveSpeech || transcript) && (
              <div className="mt-3 max-w-md rounded-2xl bg-paleblue/70 border border-primary/15 px-4 py-2 text-xs font-semibold text-primary">
                "{liveSpeech || transcript}"
              </div>
            )}
          </div>

          {/* AI Response Display Area */}
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="my-3 max-h-56 overflow-y-auto rounded-2xl border border-border bg-paleblue/40 p-4 text-xs leading-relaxed text-foreground shadow-inner"
            >
              <div className="prose prose-sm max-w-none text-foreground prose-strong:text-foreground prose-strong:bg-white/70 prose-strong:px-1 prose-strong:rounded">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {response}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}

          {/* Controls: Microphone Button + Quick Prompts */}
          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              {voiceState === "listening" ? (
                <button
                  type="button"
                  onClick={stopListening}
                  className="flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-xs font-bold text-white shadow-[0_4px_20px_rgba(225,29,72,0.35)] hover:bg-rose-700 transition-all active:scale-95 animate-pulse"
                >
                  <MicOff className="h-4 w-4" />
                  <span>Stop Listening</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startListening}
                  className="flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-xs font-bold text-white shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:bg-bright hover:shadow-[0_8px_30px_rgba(37,99,235,0.45)] transition-all hover:scale-105 active:scale-95"
                >
                  <Mic className="h-4 w-4" />
                  <span>Tap to Speak</span>
                </button>
              )}
            </div>

            {/* Quick Inspiration Prompts */}
            <div className="w-full pt-2 border-t border-border/60">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center mb-2 flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" /> Or Ask Immediately:
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {QUICK_TALK_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAskQuestion(p)}
                    className="rounded-full border border-border bg-white px-3 py-1 text-[11px] font-medium text-muted-foreground hover:bg-paleblue hover:text-primary hover:border-primary/40 transition-all shadow-xs"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
