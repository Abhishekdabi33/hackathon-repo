"use client";

import React from "react";
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  Layers, 
  Activity, 
  ChevronRight,
  Database,
  Radio,
  ExternalLink
} from "lucide-react";
import { CinematicFooter } from "@/components/ui/motion-footer";
import WorkspaceSpotlight from "./WorkspaceSpotlight";

interface LandingPageProps {
  onLaunchApp?: () => void;
}

export function LandingPage({ onLaunchApp }: LandingPageProps) {
  return (
    <div className="relative w-full min-h-screen bg-[#070709] text-white selection:bg-white/20 overflow-x-hidden font-sans">
      {/* Global Cursor Spotlight Glow over all Landing UI */}
      <WorkspaceSpotlight className="fixed inset-0 pointer-events-none z-40" />

      
      {/* 1. FIXED GLASS HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-[#070709]/80 backdrop-blur-xl px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3B0A6B] to-[#09090b] border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.15)]">
            <Bot className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-sm tracking-widest text-white uppercase font-mono">
            HERMES <span className="text-zinc-500 font-light">2.0</span>
          </span>
        </div>

        {/* Center navigation */}
        <nav className="hidden md:flex items-center space-x-1 p-1 rounded-full bg-white/[0.03] border border-white/10 text-xs">
          <a href="#features" className="px-3.5 py-1.5 rounded-full text-zinc-400 hover:text-white transition-colors">
            Features
          </a>
          <a href="#architecture" className="px-3.5 py-1.5 rounded-full text-zinc-400 hover:text-white transition-colors">
            Architecture
          </a>
          <a href="#telemetry" className="px-3.5 py-1.5 rounded-full text-zinc-400 hover:text-white transition-colors">
            Telemetry
          </a>
          <a href="#footer" className="px-3.5 py-1.5 rounded-full text-zinc-400 hover:text-white transition-colors">
            Ecosystem
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center space-x-3">
          <a 
            href="https://github.com/Abhishekdabi33/hackathon-repo" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex items-center space-x-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-all"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
          <button
            onClick={onLaunchApp}
            className="px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all shadow-[0_0_16px_rgba(255,255,255,0.25)] flex items-center space-x-1.5"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. MAIN SCROLLABLE CONTENT (Curtain layer before footer) */}
      <main className="relative z-10 bg-[#070709] border-b border-white/10 pb-24 shadow-2xl">
        
        {/* Ambient Top Glow & Grid */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06)_0%,rgba(59,10,107,0.12)_45%,transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* HERO SECTION */}
        <section className="relative pt-36 md:pt-44 pb-20 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white text-[11px] font-mono tracking-widest uppercase mb-8 shadow-sm">
            <Sparkles className="w-3 h-3 text-white" />
            <span>Next-Generation Cognitive AI System</span>
          </div>

          {/* High-Impact Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
            Intelligent AI Companion. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-500">
              Built for the Future.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Powered by local Google Gemma 2 reasoning, an interactive cursor-tracking 3D companion, and low-latency hardware orchestration for modern developers.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all shadow-[0_0_24px_rgba(255,255,255,0.25)] flex items-center justify-center space-x-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/[0.04] text-white border border-white/10 hover:border-white/20 font-medium text-sm transition-all flex items-center justify-center space-x-2"
            >
              <span>Explore Architecture</span>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </a>
          </div>

          {/* LIVE METRICS TICKER BAR */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mt-20 p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md spotlight-card">
            <div className="p-4 text-left border-r border-white/5 last:border-none">
              <span className="block text-[10px] font-mono uppercase text-zinc-500">Model Engine</span>
              <span className="text-base font-bold text-white font-mono">Gemma 2 (2B/9B)</span>
            </div>
            <div className="p-4 text-left border-r border-white/5 last:border-none">
              <span className="block text-[10px] font-mono uppercase text-zinc-500">Acceleration</span>
              <span className="text-base font-bold text-white font-mono">CUDA 12.6 RTX</span>
            </div>
            <div className="p-4 text-left border-r border-white/5 last:border-none">
              <span className="block text-[10px] font-mono uppercase text-zinc-500">Inference Latency</span>
              <span className="text-base font-bold text-white font-mono">&lt; 42ms TTFT</span>
            </div>
            <div className="p-4 text-left">
              <span className="block text-[10px] font-mono uppercase text-zinc-500">Data Privacy</span>
              <span className="text-base font-bold text-white font-mono">100% Local Run</span>
            </div>
          </div>
        </section>

        {/* 3. FEATURE HIGHLIGHT SECTION WITH CURATED ASSETS */}
        <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block mb-2">
              Capabilities &amp; Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Engineered with Precision Glassmorphism
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="group spotlight-card rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)] overflow-hidden relative">
              <div className="h-44 w-full rounded-2xl overflow-hidden mb-6 relative">
                <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80" 
                  alt="Autonomous ReAct Reasoning"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white flex items-center space-x-1.5">
                  <Terminal className="w-3 h-3 text-white" />
                  <span>ReAct Logic Core</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Autonomous Multi-Step Reasoning</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Self-directing cognitive loops execute tasks, execute Python scripts, and reflect iteratively without user intervention.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group spotlight-card rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)] overflow-hidden relative">
              <div className="h-44 w-full rounded-2xl overflow-hidden mb-6 relative">
                <img 
                  src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80" 
                  alt="3D Cursor Follow Companion"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white flex items-center space-x-1.5">
                  <Bot className="w-3 h-3 text-white" />
                  <span>3D Interactive Companion</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Hermes 3D Avatar &amp; Gaze Tracking</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Mathematical cursor-following kinematics and intelligent multi-state feedback during reasoning, voice input, and code synthesis.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group spotlight-card rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_10px_30px_rgba(255,255,255,0.05)] overflow-hidden relative">
              <div className="h-44 w-full rounded-2xl overflow-hidden mb-6 relative">
                <img 
                  src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80" 
                  alt="Hardware Telemetry"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white flex items-center space-x-1.5">
                  <Activity className="w-3 h-3 text-white" />
                  <span>Telemetry HUD</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Live CUDA Hardware Telemetry</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Real-time monitoring of VRAM allocation, GPU core temperature, processor loads, and agent memory graphs directly on your device.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 4. ARCHITECTURE OVERVIEW */}
        <section id="architecture" className="py-16 px-6 max-w-5xl mx-auto">
          <div className="p-8 md:p-12 spotlight-card rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-2xl space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block">
                Open Modular Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Extensible Agent Skills Hub &amp; Multi-Pod Swarm
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Hermes provides full support for custom authoring via <code className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs">SKILL.md</code> definitions, multi-model fallback, and decentralized engineering pods.
              </p>
              <div className="pt-4 flex flex-wrap gap-3">
                <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white font-mono">
                  FastAPI Backend
                </span>
                <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white font-mono">
                  React 19 + Vite
                </span>
                <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white font-mono">
                  Tailwind CSS + shadcn
                </span>
                <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-white font-mono">
                  GSAP Motion Engine
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SCROLL INVITATION HINT */}
        <div className="text-center pt-16">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-zinc-500 mb-3">
            Scroll down to reveal ecosystem footer
          </p>
          <div className="w-[1px] h-12 bg-gradient-to-b from-zinc-500 to-transparent mx-auto" />
        </div>

      </main>

      {/* 5. CINEMATIC GSAP MOTION FOOTER (Revealed underneath main on scroll) */}
      <div id="footer">
        <CinematicFooter onGetStarted={onLaunchApp} />
      </div>

    </div>
  );
}
