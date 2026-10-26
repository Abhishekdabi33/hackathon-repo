import { useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PressLink } from "@/components/medai/PressLink";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import {
  UploadCloud,
  ScanSearch,
  Lightbulb,
  FileText,
  Tags,
  Sparkles,
  ListChecks,
  MessageCircle,
  BookOpenText,
  ShieldCheck,
  ArrowRight,
  Mic,
  Activity,
  HeartPulse,
} from "lucide-react";
import { AiCharacter } from "@/components/medai/AiCharacter";
import { HeroScene } from "@/components/medai/HeroScene";
import { GlassCard } from "@/components/medai/GlassCard";
import { Reveal } from "@/components/medai/Reveal";
import { DisclaimerFooter } from "@/components/medai/DisclaimerFooter";
import { TalkAgentDialog } from "@/components/medai/TalkAgentDialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Samjho Health — Understand your medical reports with AI" },
      {
        name: "description",
        content:
          "Upload a medical report and Samjho Health turns complex clinical information into a clear, structured, plain-language summary.",
      },
      { property: "og:title", content: "Samjho Health — Understand your medical reports with AI" },
      {
        property: "og:description",
        content: "Upload a medical report and let AI turn complex clinical information into a clear summary.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

export function LandingPage() {
  const reduced = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, 25]);
  const [talkOpen, setTalkOpen] = useState(false);

  return (
    <main className="relative">
      {/* Top Scroll Reading Progress Bar */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-bright to-softblue z-[60] origin-left pointer-events-none"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Voice Talk Agent Modal Window */}
      <TalkAgentDialog open={talkOpen} onClose={() => setTalkOpen(false)} />

      {/* ---------- Hero Section ---------- */}
      <section className="relative flex min-h-dvh flex-col items-center justify-center px-6 pb-16 pt-20 text-center sm:pb-20 sm:pt-24">
        <motion.div
          {...(reduced ? {} : { style: { y: heroY } })}
          className="flex flex-col items-center w-full max-w-4xl mx-auto"
        >
          {/* Interactive 3D Hero Diorama with Click-to-Talk Companion */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 70, damping: 16 }}
            className="w-full"
          >
            <HeroScene onAiClick={() => setTalkOpen(true)} />
          </motion.div>

          {/* Headline & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 80, damping: 16 }}
            className="mt-3 sm:mt-5 w-full"
          >
            <div className="glass mx-auto mb-3.5 flex w-fit items-center gap-2 rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Medical intelligence, made human
            </div>

            <h1 className="mx-auto max-w-3xl text-balance text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight text-foreground">
              Understand your medical reports{" "}
              <span className="bg-gradient-to-r from-primary to-bright bg-clip-text text-transparent">with AI</span>
            </h1>

            <p className="mx-auto mt-3 sm:mt-3.5 max-w-xl text-pretty text-sm sm:text-base leading-relaxed text-muted-foreground">
              Upload your medical report and let AI turn complex clinical information into a clear,
              structured summary with EvidenceTrace™ validation.
            </p>

            {/* Prominent CTA Buttons + Voice Talk Quick Trigger */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 relative z-30">
              <PressLink
                to="/dashboard"
                className="group relative z-30 flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.35)] transition-all hover:bg-bright hover:shadow-[0_12px_40px_rgba(37,99,235,0.45)] hover:scale-105 active:scale-95"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </PressLink>

              <button
                type="button"
                onClick={() => setTalkOpen(true)}
                className="flex items-center gap-2 rounded-full border border-primary/25 bg-white px-6 py-3.5 text-sm font-semibold text-primary shadow-sm hover:bg-paleblue hover:border-primary/45 hover:scale-105 active:scale-95 transition-all"
                title="Speak directly with Hitho AI"
              >
                <Mic className="h-4 w-4 text-primary animate-pulse" />
                <span>Talk with Hitho</span>
              </button>

              <PressLink
                to="/analyze"
                search={{ sample: true }}
                className="glass relative z-30 rounded-full px-6 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-paleblue hover:text-primary shadow-xs"
              >
                Explore Demo
              </PressLink>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Helper */}
        <motion.div
          className="mt-6 hidden sm:flex flex-col items-center gap-1 text-muted-foreground/50"
          animate={reduced ? {} : { y: [0, 4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          <span className="text-[9px] uppercase tracking-[0.2em] font-mono">Scroll to explore</span>
          <span className="h-5 w-px bg-gradient-to-b from-primary/30 to-transparent" />
        </motion.div>
      </section>

      {/* ---------- How it works (With Staggered Scroll Animations) ---------- */}
      <Section id="how-it-works">
        <SectionHeading
          eyebrow="How it works"
          title="Three calm steps"
          subtitle="From a confusing PDF to clarity, without leaving the page."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: <UploadCloud className="h-5 w-5 text-primary" />,
              title: "Upload",
              body: "Drop in a PDF, photo or scan of your report. Everything stays private between you and the AI.",
            },
            {
              icon: <ScanSearch className="h-5 w-5 text-primary" />,
              title: "Analyze",
              body: "EvidenceTrace™ extracts each test and validates values against gold-standard laboratory reference intervals.",
            },
            {
              icon: <Lightbulb className="h-5 w-5 text-primary" />,
              title: "Understand",
              body: "A plain-language summary, key findings, and prioritized doctor questions you can actually act on.",
            },
          ].map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 35, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
            >
              <GlassCard className="h-full p-7 transition-shadow hover:shadow-glass-card">
                <div className="glass-soft flex h-11 w-11 items-center justify-center rounded-2xl bg-softblue/60">{step.icon}</div>
                <div className="mt-5 font-mono text-[11px] text-muted-foreground/70">0{i + 1}</div>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ---------- AI Capabilities (Scroll Triggered 3D Cards) ---------- */}
      <Section>
        <SectionHeading
          eyebrow="AI capabilities"
          title="Built for comprehension"
          subtitle="Not a chatbot with a stethoscope — a structured medical report reader."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <FileText className="h-4 w-4 text-primary" />,
              title: "Multi-format OCR & PDF Parsing",
              desc: "Upload scanned prescriptions, lab PDFs, or high-res phone photos.",
            },
            {
              icon: <Tags className="h-4 w-4 text-primary" />,
              title: "Jargon Demystification",
              desc: "Cryptic terms like MCV, eGFR, and lymphocytosis decoded instantly.",
            },
            {
              icon: <ListChecks className="h-4 w-4 text-primary" />,
              title: "Deterministic Validation",
              desc: "Zero-hallucination EvidenceTrace™ verifies numbers against certified reference standards.",
            },
            {
              icon: <Sparkles className="h-4 w-4 text-primary" />,
              title: "Key Takeaways",
              desc: "A three-bullet plain-language summary you can read in thirty seconds.",
            },
            {
              icon: <MessageCircle className="h-4 w-4 text-primary" />,
              title: "Prioritized Doctor Questions",
              desc: "Empowering consultation checklists prepared for your next clinical visit.",
            },
            {
              icon: <BookOpenText className="h-4 w-4 text-primary" />,
              title: "Export Clinical Summary",
              desc: "One-click generation of a structured, printable brief for your physician.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <GlassCard intensity="soft" className="h-full p-6 transition-all hover:border-primary/30 hover:bg-white" tilt={false}>
                <span className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl bg-softblue/60">{f.icon}</span>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ---------- In Action Feature Spotlight ---------- */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <GlassCard intensity="strong" className="overflow-hidden p-8 sm:p-12 shadow-glass-card" tilt={false}>
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">In action</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Clear answers, zero panic
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  Instead of drowning in numbers or googling symptoms into a panic, Samjho Health gives you
                  a calm, structured overview. Flagged values come with certified context and doctor discussion points.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <PressLink
                    to="/dashboard"
                    className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-bright"
                  >
                    Get Started <ArrowRight className="h-3.5 w-3.5" />
                  </PressLink>
                  <PressLink
                    to="/analyze"
                    search={{ sample: true }}
                    className="glass rounded-full px-5 py-3 text-xs font-semibold text-foreground hover:bg-paleblue"
                  >
                    Explore Demo
                  </PressLink>
                </div>
              </div>

              {/* Mini report preview with scroll slide-in */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                className="glass-soft relative mx-auto w-full max-w-sm rounded-3xl p-5 border border-border shadow-sm"
              >
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                  <FileText className="h-3.5 w-3.5 text-primary" /> sample-lab-report.pdf
                </div>
                <div className="mt-4 space-y-2.5">
                  {[
                    ["Hemoglobin", "13.8 g/dL", "text-positive"],
                    ["LDL Cholesterol", "152 mg/dL", "text-alert"],
                    ["Fasting Glucose", "96 mg/dL", "text-positive"],
                    ["ALT", "54 U/L", "text-caution"],
                  ].map(([name, value, color]) => (
                    <div key={name} className="flex items-center justify-between rounded-xl bg-paleblue px-3.5 py-2">
                      <span className="text-[12px] font-medium text-muted-foreground">{name}</span>
                      <span className={`font-mono text-[12px] font-bold ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="glass mt-4 rounded-2xl p-3 text-[12px] leading-relaxed text-foreground/90 font-medium border border-border/80">
                  “Your cholesterol is slightly above the certified interval — worth discussing with your doctor, while blood count is healthy.”
                </div>
              </motion.div>
            </div>
          </GlassCard>
        </motion.div>
      </Section>

      {/* ---------- Final CTA with Click-to-Talk Companion ---------- */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-4xl px-6 py-16 text-center border border-border bg-white shadow-sm"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 90% at 50% 110%, rgba(37,99,235,0.08), transparent 70%)",
            }}
          />
          <div className="relative">
            <div className="mx-auto w-fit cursor-pointer" onClick={() => setTalkOpen(true)}>
              <AiCharacter size={115} onClick={() => setTalkOpen(true)} showTalkBadge={true} />
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Ready to understand your report?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Talk directly with Hitho or upload your report in thirty seconds.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <PressLink
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.3)] transition-all hover:bg-bright hover:scale-105"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </PressLink>

              <button
                type="button"
                onClick={() => setTalkOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white px-6 py-3.5 text-sm font-bold text-primary shadow-sm hover:bg-paleblue hover:scale-105 transition-all"
              >
                <Mic className="h-4 w-4 text-primary animate-pulse" />
                <span>Talk with Hitho</span>
              </button>
            </div>
          </div>
        </motion.div>
      </Section>

      <DisclaimerFooter />
    </main>
  );
}

function Section({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto max-w-5xl px-6 py-16"
    >
      {children}
    </motion.section>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-10 text-center"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}
