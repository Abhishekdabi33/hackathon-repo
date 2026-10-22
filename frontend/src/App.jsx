import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Activity, 
  Zap, 
  Users, 
  CheckCircle2, 
  Terminal, 
  Sparkles, 
  Server, 
  Database,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Bot,
  Layers,
  Wrench,
  Code2,
  FileCode,
  Sliders,
  ChevronRight,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

// Apple-inspired Subtle 3D Tilt Component with Dynamic Specular Glare
function TiltCard({ children, className = '', maxTilt = 2.5, glare = true, ...props }) {
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, opacity: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentX = (x / rect.width) * 2 - 1; // -1 to 1
    const percentY = (y / rect.height) * 2 - 1; // -1 to 1

    setTransform({
      rotateX: -percentY * maxTilt,
      rotateY: percentX * maxTilt,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      opacity: 0.14,
    });
  };

  const handleMouseLeave = () => {
    setTransform({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      opacity: 0,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1200px) rotateX(${transform.rotateX.toFixed(2)}deg) rotateY(${transform.rotateY.toFixed(2)}deg)`,
        transition: transform.opacity === 0 ? 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.08s ease-out',
      }}
      className={`relative preserve-3d ${className}`}
      {...props}
    >
      {glare && (
        <div
          className="glass-glare"
          style={{
            background: `radial-gradient(circle 380px at ${transform.glareX}% ${transform.glareY}%, rgba(255, 255, 255, 0.16), transparent 70%)`,
            opacity: transform.opacity,
          }}
        />
      )}
      {children}
    </div>
  );
}

export default function App() {
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [activeTab, setActiveTab] = useState('agent');
  
  // Agent State
  const [agentPrompt, setAgentPrompt] = useState('Analyze our database statistics and check GPU status.');
  const [agentResponse, setAgentResponse] = useState(null);
  const [runningAgent, setRunningAgent] = useState(false);

  // Skills State
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch System Health
  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      } else {
        setHealth({ status: 'offline', error: 'Backend unreachable' });
      }
    } catch (err) {
      setHealth({ status: 'offline', error: err.message });
    } finally {
      setLoadingHealth(false);
    }
  };

  // Fetch Discovered Skills
  const fetchSkills = async () => {
    setLoadingSkills(true);
    try {
      const res = await fetch('/api/skills');
      if (res.ok) {
        const data = await res.json();
        setSkills(data.skills || []);
        if (data.skills?.length > 0 && !selectedSkill) {
          fetchSkillDetail(data.skills[0].name);
        }
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
    } finally {
      setLoadingSkills(false);
    }
  };

  // Fetch Full SKILL.md Detail (Progressive Disclosure)
  const fetchSkillDetail = async (skillName) => {
    try {
      const res = await fetch(`/api/skills/${skillName}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedSkill(data);
      }
    } catch (err) {
      console.error('Error fetching skill detail:', err);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchSkills();
  }, []);

  // Run Hermes Agent
  const handleRunAgent = async (e) => {
    e.preventDefault();
    if (!agentPrompt.trim() || runningAgent) return;
    
    setRunningAgent(true);
    setAgentResponse(null);
    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: agentPrompt, max_steps: 3 })
      });
      const data = await res.json();
      setAgentResponse(data);
    } catch (err) {
      setAgentResponse({ status: 'error', detail: err.message });
    } finally {
      setRunningAgent(false);
    }
  };

  const handleCopyInstructions = () => {
    if (selectedSkill?.instructions) {
      navigator.clipboard.writeText(selectedSkill.instructions);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] relative selection:bg-blue-500/30 selection:text-white">
      {/* Ambient 3D Stage Background: Perspective Grid + Apple Glow Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-grid-plane absolute inset-0 opacity-40" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-blue-600/[0.09] to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] bg-indigo-500/[0.04] blur-[160px] rounded-full" />
        <div className="absolute bottom-10 -left-20 w-[450px] h-[450px] bg-cyan-500/[0.035] blur-[150px] rounded-full" />
      </div>

      {/* Floating Apple-style Navigation Header with 3D Depth Shadow */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/65 border-b border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Platform Info with 3D Bevel */}
          <div className="flex items-center space-x-3.5 group cursor-default">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-b from-white/[0.15] to-white/[0.02] border border-white/[0.14] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:border-white/30">
              <Bot className="w-4.5 h-4.5 text-white/95 transition-transform duration-300 group-hover:rotate-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-semibold text-white tracking-tight">
                  Gemma & Hermes Agent
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-white/80 border border-white/[0.09] shadow-sm tracking-wide transition-colors group-hover:border-white/25">
                  SKILL.md v2.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-normal tracking-tight">
                Autonomous ReAct Harness • Progressive Disclosure Engine
              </p>
            </div>
          </div>

          {/* Dynamic Island Telemetry Pill */}
          <div className="flex items-center space-x-2.5">
            <button 
              onClick={() => { fetchHealth(); fetchSkills(); }} 
              disabled={loadingHealth}
              className="button-spring w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white rounded-full hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08]"
              title="Refresh System Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 transition-transform ${loadingHealth ? 'animate-spin text-white' : ''}`} />
            </button>

            <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full text-xs font-medium border border-white/[0.09] bg-white/[0.035] backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all hover:border-white/[0.18]">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${health?.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${health?.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </span>
              <span className="text-zinc-200 text-[11px] font-medium tracking-tight">
                {health?.status === 'healthy' ? 'System Online' : 'Connecting...'}
              </span>
              
              {health?.cuda_available && (
                <span className="bg-emerald-500/[0.12] text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-mono font-medium tracking-wider uppercase transition-transform hover:scale-105 shadow-sm">
                  GPU ACCELERATED
                </span>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Segmented Control Bar (Apple Floating 3D Pill Dock) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7">
        <div className="inline-flex p-1 bg-white/[0.035] border border-white/[0.08] backdrop-blur-2xl rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] max-w-full overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('agent')}
            className={`button-spring px-4 py-2 rounded-xl text-xs font-medium flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'agent'
                ? 'bg-white/[0.13] text-white border border-white/[0.16] shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Hermes Agent Console</span>
          </button>
          
          <button
            onClick={() => setActiveTab('skills')}
            className={`button-spring px-4 py-2 rounded-xl text-xs font-medium flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'skills'
                ? 'bg-white/[0.13] text-white border border-white/[0.16] shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Agent Skills Hub (SKILL.md)</span>
            <span className="bg-white/[0.08] text-zinc-300 text-[10px] px-1.5 py-0.5 rounded-full border border-white/[0.06] font-mono">
              {skills.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('stack')}
            className={`button-spring px-4 py-2 rounded-xl text-xs font-medium flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'stack'
                ? 'bg-white/[0.13] text-white border border-white/[0.16] shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Hackathon Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`button-spring px-4 py-2 rounded-xl text-xs font-medium flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'team'
                ? 'bg-white/[0.13] text-white border border-white/[0.16] shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>4-Person Team Roles</span>
          </button>
        </div>
      </div>

      {/* Main Content Area with 3D Stage Perspective */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 perspective-1200">
        
        {/* ==================================================================== */}
        {/* TAB 1: HERMES AGENT 3D WORKSPACE CONSOLE */}
        {/* ==================================================================== */}
        {activeTab === 'agent' && (
          <div key="agent-tab" className="animate-ios-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: Main Interactive Agent Loop (3D Tiltable Glass Workspace) */}
            <div className="lg:col-span-2 space-y-6">
              <TiltCard className="glass-panel-3d apple-specular rounded-3xl p-6 sm:p-8" maxTilt={2.2}>
                
                {/* Header info floating at Depth Layer MD */}
                <div className="depth-layer-md flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-400 drop-shadow-[0_2px_8px_rgba(96,165,250,0.5)]" />
                      <span>Hermes Autonomous Agent Execution Loop</span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Multi-step ReAct reasoning loop with dynamic tool discovery and progressive skill loading.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/[0.1] text-blue-300 border border-blue-500/25 shadow-sm">
                    Gemma 2B / 9B
                  </span>
                </div>

                {/* Form Input Container with 3D Inset Surface */}
                <form onSubmit={handleRunAgent} className="space-y-4 depth-layer-sm">
                  <div className="rounded-2xl border border-white/[0.08] bg-black/50 backdrop-blur-xl p-4 transition-all duration-300 focus-within:border-white/25 focus-within:ring-4 focus-within:ring-blue-500/15 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.06)]">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                      Agent Goal / Query
                    </label>
                    <textarea
                      rows={3}
                      value={agentPrompt}
                      onChange={(e) => setAgentPrompt(e.target.value)}
                      placeholder="e.g. Check system GPU and use the data-analyst skill..."
                      className="w-full bg-transparent text-sm text-[#f5f5f7] placeholder-zinc-500 focus:outline-none resize-none leading-relaxed font-normal"
                    />

                    {/* Quick Test Chips & Submit Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-[11px] text-zinc-500">Presets:</span>
                        <button 
                          type="button" 
                          onClick={() => setAgentPrompt("Calculate 250 * 18.5 and check system telemetry")} 
                          className="button-spring px-2.5 py-1 rounded-full text-[11px] text-zinc-300 bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.09] hover:text-white shadow-sm"
                        >
                          Math + Telemetry
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setAgentPrompt("Use api-integrator skill to format an endpoint")} 
                          className="button-spring px-2.5 py-1 rounded-full text-[11px] text-zinc-300 bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.09] hover:text-white shadow-sm"
                        >
                          API Integrator
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={runningAgent || !agentPrompt.trim()}
                        className="button-spring group inline-flex items-center space-x-2 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium px-4 py-2 rounded-xl text-xs shadow-[0_4px_20px_rgba(0,113,227,0.45),inset_0_1px_0_rgba(255,255,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {runningAgent ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Reasoning...</span>
                          </>
                        ) : (
                          <>
                            <span>Run Agent Loop</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Loading / Active State when Agent is thinking */}
                {runningAgent && (
                  <div className="mt-7 border-t border-white/[0.06] pt-6 space-y-3 animate-ios-fade-in depth-layer-sm">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Hermes ReAct Loop Active...</span>
                    </div>
                    <div className="skeleton-shimmer h-14 rounded-2xl border border-white/[0.06]" />
                    <div className="skeleton-shimmer h-12 rounded-2xl border border-white/[0.06] opacity-75" />
                  </div>
                )}

                {/* Reasoning Trace Steps (ReAct Loop) */}
                {agentResponse && !runningAgent && (
                  <div className="mt-7 border-t border-white/[0.06] pt-6 space-y-4 animate-ios-fade-in depth-layer-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300 tracking-tight flex items-center space-x-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-400" />
                        <span>Execution Trace & Tool Calls</span>
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06] shadow-sm">
                        Latency: {agentResponse.duration_ms || 0} ms
                      </span>
                    </div>

                    {/* Steps Timeline with Staggered 3D Floating Entrance */}
                    <div className="space-y-3">
                      {agentResponse.steps?.map((s, idx) => (
                        <div 
                          key={idx} 
                          className="animate-step-slide card-3d-subtle rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.15] p-4 text-xs space-y-2.5 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.3)] transition-all duration-200"
                          style={{ animationDelay: `${idx * 80}ms` }}
                        >
                          {/* Thought */}
                          <div className="flex items-start space-x-2 text-zinc-200">
                            <div className="w-5 h-5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                              <Zap className="w-3 h-3" />
                            </div>
                            <span className="leading-relaxed font-medium">
                              <span className="text-blue-400 font-semibold">Thought:</span> {s.thought}
                            </span>
                          </div>

                          {/* Action */}
                          {s.action && (
                            <div className="p-2.5 bg-black/45 rounded-xl border border-white/[0.06] text-zinc-300 font-mono text-[11px] flex flex-wrap items-center justify-between gap-2 shadow-inner">
                              <span>Action: <strong className="text-amber-300 font-semibold">{s.action}</strong></span>
                              <span className="text-zinc-500">Input: {s.action_input}</span>
                            </div>
                          )}

                          {/* Observation */}
                          {s.observation && (
                            <div className="p-3 bg-black/65 border border-emerald-500/20 rounded-xl text-emerald-300 font-mono text-[11px] leading-relaxed shadow-inner">
                              <span className="text-zinc-400 block text-[9px] uppercase font-bold tracking-wider mb-1">Observation:</span>
                              {s.observation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Final Output (Apple Intelligence Style Card with 3D Depth & Volumetric Underglow) */}
                    <div className="card-3d-subtle p-5 sm:p-6 bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/[0.14] rounded-2xl shadow-[0_20px_50px_-15px_rgba(0,113,227,0.22),0_10px_25px_-5px_rgba(0,0,0,0.6)] space-y-2.5">
                      <div className="flex items-center space-x-1.5 text-blue-400">
                        <Sparkles className="w-3.5 h-3.5 drop-shadow-[0_2px_6px_rgba(96,165,250,0.4)]" />
                        <span className="text-[11px] font-semibold uppercase tracking-wider">
                          Final Agent Answer (Gemma Engine)
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed font-normal">
                        {agentResponse.final_answer}
                      </p>
                    </div>

                  </div>
                )}

              </TiltCard>
            </div>

            {/* Right Col: Telemetry & Loaded Skills (Floating 3D Stack) */}
            <div className="space-y-6">
              
              {/* Hardware Status Card with 3D Tilt */}
              <TiltCard className="glass-panel-3d apple-specular rounded-3xl p-6" maxTilt={3.0}>
                <div className="depth-layer-sm">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center space-x-2 mb-4">
                    <Cpu className="w-4 h-4 text-blue-400 drop-shadow-[0_2px_6px_rgba(96,165,250,0.4)]" />
                    <span>Hardware & Compute</span>
                  </h3>
                  
                  <div className="space-y-3 text-xs">
                    <div className="card-3d-subtle p-3.5 bg-black/45 border border-white/[0.07] rounded-2xl transition-colors hover:border-white/[0.16] shadow-sm">
                      <span className="text-[11px] text-zinc-400 block mb-1">Active GPU Device</span>
                      <p className="text-sm font-medium text-white tracking-tight">
                        {health?.gpu?.device_name || 'NVIDIA GeForce RTX 2050'}
                      </p>
                      <span className="text-[10px] text-emerald-400 font-medium tracking-wide">
                        {health?.cuda_available ? 'CUDA 12.6 Acceleration Enabled' : 'CPU Mode'}
                      </span>
                    </div>

                    <div className="card-3d-subtle p-3.5 bg-black/45 border border-white/[0.07] rounded-2xl transition-colors hover:border-white/[0.16] shadow-sm">
                      <span className="text-[11px] text-zinc-400 block mb-1">PyTorch Compute Backend</span>
                      <p className="text-xs font-mono font-medium text-zinc-200">
                        {health?.torch_version || '2.14.1+cu126'}
                      </p>
                    </div>
                  </div>
                </div>
              </TiltCard>

              {/* Loaded Skills Drawer Card */}
              <div className="glass-panel-3d apple-specular rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center space-x-2">
                    <Wrench className="w-4 h-4 text-purple-400 drop-shadow-[0_2px_6px_rgba(192,132,252,0.4)]" />
                    <span>Loaded Skills ({skills.length})</span>
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">Auto-Indexed</span>
                </div>

                <div className="space-y-2">
                  {skills.map((s) => (
                    <div 
                      key={s.name}
                      onClick={() => { setSelectedSkill(s); fetchSkillDetail(s.name); setActiveTab('skills'); }}
                      className="card-3d-subtle p-3 bg-white/[0.025] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.15] rounded-2xl cursor-pointer flex items-center justify-between text-xs group shadow-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <FileCode className="w-3.5 h-3.5 text-zinc-400 transition-colors group-hover:text-cyan-300" />
                        <span className="font-mono text-zinc-200 text-xs font-medium group-hover:text-white">{s.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white" />
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: AGENT SKILLS HUB (SKILL.md) */}
        {/* ==================================================================== */}
        {activeTab === 'skills' && (
          <div key="skills-tab" className="animate-ios-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 1 Col: Discovered Skills List */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight flex items-center space-x-2">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <span>Discovered Agent Skills ({skills.length})</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Agent Skills open standard with progressive disclosure. Instructions load on-demand.
                </p>
              </div>

              {/* Skeleton loading state */}
              {loadingSkills ? (
                <div className="space-y-2.5">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="skeleton-shimmer h-24 rounded-2xl border border-white/[0.06]" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {skills.map((s) => (
                    <div
                      key={s.name}
                      onClick={() => fetchSkillDetail(s.name)}
                      className={`card-3d-subtle p-4 rounded-2xl border cursor-pointer ${
                        selectedSkill?.name === s.name
                          ? 'bg-white/[0.09] border-white/[0.22] shadow-[0_16px_36px_-8px_rgba(0,0,0,0.6)] scale-[1.01]'
                          : 'bg-white/[0.025] border-white/[0.06] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-mono font-semibold text-white">{s.name}</h4>
                        <span className="text-[10px] bg-white/[0.06] px-2 py-0.5 rounded-full text-zinc-400 font-mono border border-white/[0.06]">
                          v{s.version}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">{s.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {s.tags?.map((tag) => (
                          <span key={tag} className="text-[10px] bg-black/40 text-zinc-300 px-2 py-0.5 rounded-full border border-white/[0.06] font-mono">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 2 Cols: SKILL.md Inspector with 3D Depth */}
            <div className="lg:col-span-2">
              {selectedSkill ? (
                <TiltCard className="glass-panel-3d apple-specular rounded-3xl p-6 sm:p-8 space-y-6" maxTilt={1.8}>
                  
                  {/* Top Bar floating */}
                  <div className="depth-layer-sm flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
                    <div>
                      <h3 className="text-base font-semibold text-white font-mono flex items-center space-x-2">
                        <span>{selectedSkill.name}</span>
                        <span className="text-xs text-zinc-500 font-normal">/ SKILL.md</span>
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 max-w-xl">{selectedSkill.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCopyInstructions}
                        className="button-spring px-3 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white flex items-center space-x-1.5 shadow-sm"
                        title="Copy Markdown"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400 animate-ios-fade-in" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setAgentPrompt(`Please use the ${selectedSkill.name} skill for our task.`);
                          setActiveTab('agent');
                        }}
                        className="button-spring px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-[0_4px_16px_rgba(0,113,227,0.4)] flex items-center space-x-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Test in Agent</span>
                      </button>
                    </div>
                  </div>

                  {/* Markdown Instructions */}
                  <div className="depth-layer-xs">
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2.5">
                      Operational Instructions Body (Markdown)
                    </h4>
                    <pre className="bg-black/65 border border-white/[0.08] rounded-2xl p-5 text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[480px] overflow-y-auto shadow-inner">
                      {selectedSkill.instructions || 'Loading instructions...'}
                    </pre>
                  </div>
                </TiltCard>
              ) : (
                <div className="glass-panel-3d rounded-3xl p-16 text-center text-zinc-500 text-xs">
                  Select a skill on the left to inspect its operational instructions.
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: HACKATHON TECH STACK OVERVIEW (3D FLOATING CARDS) */}
        {/* ==================================================================== */}
        {activeTab === 'stack' && (
          <div key="stack-tab" className="animate-ios-fade-in glass-panel-3d apple-specular rounded-3xl p-6 sm:p-8 space-y-8">
            <div className="depth-layer-sm">
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Hackathon Core Architecture & Resources</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Integrated workflow matching the hackathon tracks (Google Gemma, Hermes Agent & Agent Skills).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="card-3d-subtle p-6 bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.16] rounded-2xl space-y-3.5 backdrop-blur-xl group shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                <div className="depth-layer-md w-8 h-8 rounded-xl bg-blue-500/[0.12] text-blue-400 border border-blue-500/25 flex items-center justify-center font-mono text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-sm">
                  01
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight group-hover:text-blue-300 transition-colors">Google Gemma Models</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Official Google open-weight models accessed via Google AI Studio, Gemini API, or open-weight inference endpoints.
                </p>
              </div>

              <div className="card-3d-subtle p-6 bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.16] rounded-2xl space-y-3.5 backdrop-blur-xl group shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                <div className="depth-layer-md w-8 h-8 rounded-xl bg-purple-500/[0.12] text-purple-400 border border-purple-500/25 flex items-center justify-center font-mono text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-sm">
                  02
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight group-hover:text-purple-300 transition-colors">Hermes Agent Harness</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Autonomous agent harness developed by Nous Research for long-running workflows, tool invocation, and persistent memory loops.
                </p>
              </div>

              <div className="card-3d-subtle p-6 bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.16] rounded-2xl space-y-3.5 backdrop-blur-xl group shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                <div className="depth-layer-md w-8 h-8 rounded-xl bg-cyan-500/[0.12] text-cyan-400 border border-cyan-500/25 flex items-center justify-center font-mono text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-sm">
                  03
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight group-hover:text-cyan-300 transition-colors">Agent Skills (SKILL.md)</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Open standard format using YAML frontmatter and progressive disclosure to provide procedural operational playbooks without context bloat.
                </p>
              </div>

              <div className="card-3d-subtle p-6 bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.07] hover:border-white/[0.16] rounded-2xl space-y-3.5 backdrop-blur-xl group shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
                <div className="depth-layer-md w-8 h-8 rounded-xl bg-emerald-500/[0.12] text-emerald-400 border border-emerald-500/25 flex items-center justify-center font-mono text-xs font-bold transition-transform duration-300 group-hover:scale-110 shadow-sm">
                  04
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight group-hover:text-emerald-300 transition-colors">GPU Acceleration</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Local NVIDIA RTX 2050 (CUDA 12.6) acceleration + cloud Kaggle/Colab 2x T4 GPU scaling for larger open-weight models.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: 4-PERSON TEAM ROLES & SQUADS (3D POD PANELS) */}
        {/* ==================================================================== */}
        {activeTab === 'team' && (
          <div key="team-tab" className="animate-ios-fade-in glass-panel-3d apple-specular rounded-3xl p-6 sm:p-8 space-y-8">
            <div className="depth-layer-sm">
              <h2 className="text-base font-semibold text-white tracking-tight flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Team Engineering Squads & Ownership</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Divided into two focused cross-functional pairs: Frontend Squad and Backend & AI Engine Squad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* SQUAD 1: FRONTEND POD */}
              <div className="card-3d-subtle p-6 bg-white/[0.025] hover:bg-white/[0.04] border border-blue-500/25 rounded-2xl space-y-4 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between depth-layer-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">Pod 1 • Frontend & UI/UX</span>
                  <span className="text-[10px] font-mono bg-blue-500/[0.1] text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/25 shadow-sm">
                    Branch: feature/frontend
                  </span>
                </div>
                
                <h3 className="text-base font-semibold text-white tracking-tight">Frontend Engineering Squad</h3>
                
                <div className="flex flex-wrap gap-2 pt-1 depth-layer-xs">
                  <span className="text-xs font-mono bg-white/[0.04] text-zinc-200 px-3 py-1 rounded-xl border border-white/[0.08] transition-all hover:border-white/20 shadow-sm">
                    @vedxnt-b (Frontend Lead)
                  </span>
                  <span className="text-xs font-mono bg-white/[0.04] text-zinc-200 px-3 py-1 rounded-xl border border-white/[0.08] transition-all hover:border-white/20 shadow-sm">
                    @piyushmatodepatil (UI/UX Lead)
                  </span>
                </div>

                <div className="pt-2 text-xs text-zinc-400 space-y-2 leading-relaxed">
                  <p className="font-medium text-zinc-300">Deliverables & Responsibilities:</p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Build interactive React 19 + Tailwind CSS user interface</li>
                    <li>Real-time reasoning trace visualization (Thought ➔ Action ➔ Observation)</li>
                    <li>SKILL.md visual inspector with live raw YAML/Markdown view</li>
                    <li>Wire frontend API calls to backend (<code className="text-zinc-300">/api/agent/chat</code>, <code className="text-zinc-300">/api/skills</code>)</li>
                    <li>Ensure dark-mode responsiveness & high-impact visual design for judges</li>
                  </ul>
                </div>
              </div>

              {/* SQUAD 2: BACKEND & AI ENGINE POD */}
              <div className="card-3d-subtle p-6 bg-white/[0.025] hover:bg-white/[0.04] border border-purple-500/25 rounded-2xl space-y-4 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between depth-layer-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">Pod 2 • Backend & AI Engine</span>
                  <span className="text-[10px] font-mono bg-purple-500/[0.1] text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/25 shadow-sm">
                    Branch: feature/backend-ai
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white tracking-tight">Backend & AI Engine Squad</h3>

                <div className="flex flex-wrap gap-2 pt-1 depth-layer-xs">
                  <span className="text-xs font-mono bg-white/[0.04] text-zinc-200 px-3 py-1 rounded-xl border border-white/[0.08] transition-all hover:border-white/20 shadow-sm">
                    @gunwantjawle-ux (Backend Systems Lead)
                  </span>
                  <span className="text-xs font-mono bg-white/[0.04] text-zinc-200 px-3 py-1 rounded-xl border border-white/[0.08] transition-all hover:border-white/20 shadow-sm">
                    @Abhishekdabi33 (AI Engine & Project Lead)
                  </span>
                </div>

                <div className="pt-2 text-xs text-zinc-400 space-y-2 leading-relaxed">
                  <p className="font-medium text-zinc-300">Deliverables & Responsibilities:</p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Maintain FastAPI REST server routing, schemas & CORS</li>
                    <li>Autonomous Hermes Agent ReAct loop & tool execution engine</li>
                    <li>Google Gemma integration (Google AI Studio API + Kaggle 2x T4 GPUs)</li>
                    <li>Author domain-specific operational <code className="text-zinc-300">SKILL.md</code> playbooks in <code className="text-zinc-300">skills/</code></li>
                    <li>Overall repository sync, pitch deck & 3-minute demo video recording</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
