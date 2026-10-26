import type { ReactNode } from "react";
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
} from "lucide-react";
import { AiCharacter } from "@/components/medai/AiCharacter";
import { HeroScene } from "@/components/medai/HeroScene";
import { GlassCard } from "@/components/medai/GlassCard";
import { Reveal } from "@/components/medai/Reveal";
import { DisclaimerFooter } from "@/components/medai/DisclaimerFooter";

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
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, 140]);
  const heroOpacity = useTransform(scrollY, [0, 480], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 700], [1, 0.88]);

  return (
    <main className="relative">
      {/* ---------- Hero ---------- */}
      <section className="relative flex min-h-dvh flex-col items-center justify-center px-6 pb-32 pt-28 text-center sm:pb-24">
        <motion.div
          {...(reduced ? {} : { style: { y: heroY, opacity: heroOpacity, scale: heroScale } })}
          className="flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 70, damping: 16 }}
            className="w-full"
          >
            <HeroScene />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 80, damping: 16 }}
            className="mt-10"
          >
            <div className="glass mx-auto mb-6 flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ice/90">
              <span className="h-1.5 w-1.5 rounded-full bg-ice" />
              Medical intelligence, made human
            </div>
            <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              Understand your medical reports{" "}
              <span className="bg-gradient-to-r from-primary to-bright bg-clip-text text-transparent">with AI</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Upload your medical report and let AI turn complex clinical information into a clear,
              structured summary.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <PressLink
                to="/dashboard"
                className="group flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_40px_rgba(37,99,235,0.25)] transition-colors hover:bg-bright"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </PressLink>
              <PressLink
                to="/analyze"
                search={{ sample: true }}
                className="glass rounded-full px-7 py-3.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-paleblue"
              >
                Explore Demo
              </PressLink>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 flex flex-col items-center gap-2 text-muted-foreground/60"
          animate={reduced ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        >
          <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <span className="h-8 w-px bg-gradient-to-b from-primary/30 to-transparent" />
        </motion.div>
      </section>

      {/* ---------- How it works ---------- */}
      <Section id="how-it-works">
        <SectionHeading
          eyebrow="How it works"
          title="Three calm steps"
          subtitle="From a confusing PDF to clarity, without leaving the page."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: <UploadCloud className="h-5 w-5 text-ice" />,
              title: "Upload",
              body: "Drop in a PDF, photo or scan of your report. Everything stays between you and the AI.",
            },
            {
              icon: <ScanSearch className="h-5 w-5 text-ice" />,
              title: "Analyze",
              body: "Hitho reads every value, finding and abbreviation — then organizes what matters.",
            },
            {
              icon: <Lightbulb className="h-5 w-5 text-ice" />,
              title: "Understand",
              body: "A plain-language summary, key findings and lab values you can actually act on.",
            },
          ].map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <GlassCard className="h-full p-7">
                <div className="glass-soft flex h-11 w-11 items-center justify-center rounded-2xl">{step.icon}</div>
                <div className="mt-5 font-mono text-[11px] text-muted-foreground/70">0{i + 1}</div>
                <h3 className="mt-1 text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------- AI Capabilities ---------- */}
      <Section>
        <SectionHeading
          eyebrow="AI capabilities"
          title="Built for comprehension"
          subtitle="Not a chatbot with a stethoscope — a structured medical report reader."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: <FileText className="h-4 w-4 text-ice" />, title: "Report summarization", body: "The whole report, condensed into a few honest sentences." },
            { icon: <BookOpenText className="h-4 w-4 text-ice" />, title: "Terminology explained", body: "Every complex term unpacked in language anyone can follow." },
            { icon: <ListChecks className="h-4 w-4 text-ice" />, title: "Key finding extraction", body: "The observations that matter, ranked by importance." },
            { icon: <Tags className="h-4 w-4 text-ice" />, title: "Lab value organization", body: "Values, units and reference ranges side by side." },
            { icon: <MessageCircle className="h-4 w-4 text-ice" />, title: "Question answering", body: "Ask follow-up questions about your own results." },
            { icon: <Sparkles className="h-4 w-4 text-ice" />, title: "Plain-language tone", body: "Calm, clear and reassuring — never alarmist." },
          ].map((cap, i) => (
            <Reveal key={cap.title} delay={(i % 3) * 0.06} y={18}>
              <GlassCard intensity="soft" className="h-full p-5" tilt={false}>
                <div className="flex items-center gap-3">
                  <span className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl">{cap.icon}</span>
                  <h3 className="text-[15px] font-semibold tracking-tight">{cap.title}</h3>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{cap.body}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------- Interactive demo ---------- */}
      <Section>
        <Reveal>
          <GlassCard intensity="strong" className="overflow-hidden" tilt={false}>
            <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ice/80">Interactive demo</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Explore a real sample report
                </h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Curious what an analysis looks like? Walk through a complete blood count and metabolic
                  panel — summarized, explained and organized exactly like your own report would be.
                </p>
                <PressLink
                  to="/analyze"
                  search={{ sample: true }}
                  className="group mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-bright"
                >
                  Explore Demo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </PressLink>
              </div>
              {/* Mini report preview */}
              <div className="glass-soft relative mx-auto w-full max-w-sm rounded-3xl p-5">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 text-ice" /> sample-lab-report.pdf
                </div>
                <div className="mt-4 space-y-2.5">
                  {[
                    ["Hemoglobin", "13.8 g/dL", "text-positive"],
                    ["LDL Cholesterol", "152 mg/dL", "text-alert"],
                    ["Fasting Glucose", "96 mg/dL", "text-positive"],
                    ["ALT", "54 U/L", "text-caution"],
                  ].map(([name, value, color]) => (
                    <div key={name} className="flex items-center justify-between rounded-xl bg-paleblue px-3.5 py-2.5">
                      <span className="text-[13px] text-muted-foreground">{name}</span>
                      <span className={`font-mono text-[13px] font-semibold ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="glass mt-4 rounded-2xl p-3.5 text-[12px] leading-relaxed text-foreground/85">
                  “Your cholesterol is above the recommended range — worth discussing with your doctor,
                  while your blood count looks healthy.”
                </div>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </Section>

      {/* ---------- Privacy ---------- */}
      <Section>
        <Reveal>
          <div className="glass flex flex-col items-center gap-4 rounded-4xl px-8 py-12 text-center sm:flex-row sm:text-left">
            <span className="glass-soft flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
              <ShieldCheck className="h-6 w-6 text-ice" />
            </span>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Your health data deserves care</h3>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Medical documents are deeply personal. Samjho Health processes your report to produce your summary —
                reports are handled securely and are never shared. We believe AI in healthcare should be
                transparent about exactly that.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ---------- Final CTA ---------- */}
      <Section>
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl px-6 py-20 text-center">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 70% 90% at 50% 110%, rgba(59,130,246,0.12), transparent 70%)",
              }}
            />
            <div className="relative">
              <div className="mx-auto w-fit">
                <AiCharacter size={120} />
              </div>
              <h2 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to understand your report?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                It takes about thirty seconds. Your future self will thank you.
              </p>
              <PressLink
                to="/dashboard"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-[0_10px_40px_rgba(37,99,235,0.28)] transition-colors hover:bg-bright"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </PressLink>
            </div>
          </div>
        </Reveal>
      </Section>

      <DisclaimerFooter />
    </main>
  );
}

function Section({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <section id={id} className="relative mx-auto max-w-5xl px-6 py-20">
      {children}
    </section>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <Reveal className="mb-10 text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ice/80">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">{subtitle}</p>
    </Reveal>
  );
}
