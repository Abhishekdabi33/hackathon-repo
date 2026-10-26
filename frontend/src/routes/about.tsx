import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Eye, Lock, HeartHandshake, ArrowRight, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/medai/GlassCard";
import { Reveal } from "@/components/medai/Reveal";
import { AiCharacter } from "@/components/medai/AiCharacter";
import { DisclaimerFooter } from "@/components/medai/DisclaimerFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Samjho Health — calm, careful medical AI" },
      {
        name: "description",
        content: "Samjho Health explains medical reports in plain language. Learn how it works and how your data is treated.",
      },
      { property: "og:title", content: "About Samjho Health — calm, careful medical AI" },
      {
        property: "og:description",
        content: "Samjho Health explains medical reports in plain language. Learn how it works and how your data is treated.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

export default function AboutPage() {
  return (
    <main className="relative mx-auto min-h-dvh max-w-4xl px-6 pb-10 pt-32">
      <Reveal className="mb-14 text-center">
        <div className="mx-auto w-fit">
          <AiCharacter size={140} interactive={false} />
        </div>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">
          A calm companion for confusing paperwork
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Samjho Health exists for the moment a lab report lands in your inbox and every line looks like a
          different language. We believe understanding your own health should not require a medical degree.
        </p>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: <HeartHandshake className="h-5 w-5 text-ice" />,
            title: "Trust first",
            body: "We explain what a report says — we never diagnose, never speculate, never alarm.",
          },
          {
            icon: <Eye className="h-5 w-5 text-ice" />,
            title: "Radical clarity",
            body: "Every value comes with context: what it means, why it matters, and its typical range.",
          },
          {
            icon: <Sparkles className="h-5 w-5 text-ice" />,
            title: "Calm technology",
            body: "Soft light, patient motion and quiet surfaces. Health information should feel safe.",
          },
        ].map((v, i) => (
          <Reveal key={v.title} delay={i * 0.07}>
            <GlassCard className="h-full p-6" tilt={false}>
              <span className="glass-soft flex h-10 w-10 items-center justify-center rounded-2xl">{v.icon}</span>
              <h3 className="mt-4 text-base font-semibold tracking-tight">{v.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{v.body}</p>
            </GlassCard>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-14">
        <GlassCard intensity="strong" className="p-8" tilt={false}>
          <div className="flex items-center gap-2.5">
            <span className="glass-soft flex h-10 w-10 items-center justify-center rounded-2xl">
              <ShieldCheck className="h-5 w-5 text-ice" />
            </span>
            <h2 className="text-xl font-semibold tracking-tight">Privacy & safety</h2>
          </div>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium">
                <Lock className="h-4 w-4 text-muted-foreground" /> Handled securely
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                Your report is processed only to produce your summary. Documents are handled securely and
                responsibly, and your history stays in your own browser.
              </p>
            </div>
            <div>
              <p className="flex items-center gap-2 text-sm font-medium">
                <HeartHandshake className="h-4 w-4 text-muted-foreground" /> An information tool
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                Samjho Health is an AI information tool. It is not a diagnosis and not a substitute for professional
                medical advice — always bring your results to a qualified healthcare provider.
              </p>
            </div>
          </div>
        </GlassCard>
      </Reveal>

      <Reveal className="mt-14 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Put it to work on your paperwork</h2>
        <Link
          to="/analyze"
          search={{ sample: false }}
          className="group mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] hover:bg-bright active:scale-95"
        >
          Analyze a Report
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Reveal>

      <DisclaimerFooter />
    </main>
  );
}
