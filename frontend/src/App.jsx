import React, { useState, useEffect } from 'react';
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
  FileCode
} from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <span>Gemma & Hermes Agent Platform</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  SKILL.md Standard
                </span>
              </h1>
              <p className="text-xs text-slate-400">Open-Weight LLMs • Autonomous Harness • Progressive Disclosure</p>
            </div>
          </div>

          {/* System Status Pill */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => { fetchHealth(); fetchSkills(); }} 
              disabled={loadingHealth}
              className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loadingHealth ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-700 bg-slate-800/80">
              <span className={`w-2 h-2 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{health?.status === 'healthy' ? 'Backend Online' : 'Connecting...'}</span>
              {health?.cuda_available && (
                <span className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-cyan-500/30">
                  GPU ACCELERATED
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Nav Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex space-x-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('agent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === 'agent'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Hermes Agent Console</span>
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === 'skills'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Agent Skills Hub (SKILL.md)</span>
            <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full border border-slate-700">
              {skills.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('stack')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === 'stack'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Hackathon Tech Stack</span>
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === 'team'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>4-Person Team Roles</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: HERMES AGENT CONSOLE */}
        {activeTab === 'agent' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2 mb-2">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  <span>Hermes Autonomous Agent Execution Loop</span>
                </h2>
                <p className="text-sm text-slate-400 mb-6">
                  Orchestrates multi-step reasoning, tool invocation, and on-demand Agent Skill execution.
                </p>

                <form onSubmit={handleRunAgent} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Agent Goal / Query
                    </label>
                    <textarea
                      rows={3}
                      value={agentPrompt}
                      onChange={(e) => setAgentPrompt(e.target.value)}
                      placeholder="e.g. Check system GPU and use the data-analyst skill..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={runningAgent}
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
                    >
                      {runningAgent ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Agent Reasoning...</span>
                        </>
                      ) : (
                        <>
                          <span>Run Agent Loop</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span>Quick Test:</span>
                      <button 
                        type="button" 
                        onClick={() => setAgentPrompt("Calculate 250 * 18.5 and check system telemetry")} 
                        className="text-cyan-400 hover:underline"
                      >
                        Math + Telemetry
                      </button>
                      <span>•</span>
                      <button 
                        type="button" 
                        onClick={() => setAgentPrompt("Use api-integrator skill to format an endpoint")} 
                        className="text-cyan-400 hover:underline"
                      >
                        API Skill
                      </button>
                    </div>
                  </div>
                </form>

                {/* Reasoning Trace Steps */}
                {agentResponse && (
                  <div className="mt-6 border-t border-slate-800/80 pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Reasoning Steps & Tool Traces
                      </span>
                      <span className="text-xs text-emerald-400 font-mono">
                        Latency: {agentResponse.duration_ms || 0} ms
                      </span>
                    </div>

                    {agentResponse.steps?.map((s, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                        <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Thought: {s.thought}</span>
                        </div>
                        {s.action && (
                          <div className="p-2 bg-slate-900 rounded-lg text-slate-300 font-mono flex items-center justify-between">
                            <span>Action: <strong className="text-amber-400">{s.action}</strong></span>
                            <span className="text-slate-500">Input: {s.action_input}</span>
                          </div>
                        )}
                        {s.observation && (
                          <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-emerald-300 font-mono">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Observation:</span>
                            {s.observation}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Final Answer */}
                    <div className="p-4 bg-gradient-to-br from-blue-950/40 to-slate-950 border border-blue-900/40 rounded-xl">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-2">
                        Final Agent Output (Gemma Engine)
                      </span>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {agentResponse.final_answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar: Telemetry & Active Skills */}
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-semibold text-white flex items-center space-x-2 mb-4">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <span>Hardware & GPU Status</span>
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Device</span>
                    <p className="text-sm font-semibold text-white">
                      {health?.gpu?.device_name || 'NVIDIA Quadro P2000'}
                    </p>
                    <span className="text-xs text-emerald-400">CUDA 12.4 Enabled</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Compute Backend</span>
                    <p className="text-sm font-semibold text-cyan-400">PyTorch 2.6.0+cu124</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-semibold text-white flex items-center space-x-2 mb-4">
                  <Wrench className="w-5 h-5 text-purple-400" />
                  <span>Loaded Agent Skills</span>
                </h3>
                <div className="space-y-2">
                  {skills.map((s) => (
                    <div 
                      key={s.name}
                      onClick={() => { setSelectedSkill(s); fetchSkillDetail(s.name); setActiveTab('skills'); }}
                      className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800/60 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-cyan-300">{s.name}</span>
                      <span className="text-[10px] text-slate-500">v{s.version}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AGENT SKILLS HUB (SKILL.md) */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <span>Discovered Skills ({skills.length})</span>
              </h3>
              <p className="text-xs text-slate-400">
                Adhering to the Agent Skill Open Standard. Metadata is indexed at startup; operational instructions load on-demand.
              </p>

              <div className="space-y-3">
                {skills.map((s) => (
                  <div
                    key={s.name}
                    onClick={() => fetchSkillDetail(s.name)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedSkill?.name === s.name
                        ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-white font-mono">{s.name}</h4>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                        v{s.version}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{s.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {s.tags?.map((tag) => (
                        <span key={tag} className="text-[10px] bg-slate-950 text-cyan-400 px-2 py-0.5 rounded-full border border-slate-800">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 2 cols: Inspect SKILL.md */}
            <div className="lg:col-span-2">
              {selectedSkill ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
                        <span>{selectedSkill.name}</span>
                        <span className="text-xs text-slate-400 font-normal">/ SKILL.md</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">{selectedSkill.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        setAgentPrompt(`Please use the ${selectedSkill.name} skill for our task.`);
                        setActiveTab('agent');
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 transition-all flex items-center space-x-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Test in Agent</span>
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Operational Instructions Body (Markdown)
                    </h4>
                    <pre className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[450px] overflow-y-auto">
                      {selectedSkill.instructions || 'Loading instructions...'}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
                  Select a skill on the left to inspect its operational instructions.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: HACKATHON TECH STACK OVERVIEW */}
        {activeTab === 'stack' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-400" />
                <span>Hackathon Core Architecture & Resources</span>
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Integrated workflow matching the hackathon tracks (Google Gemma, Hermes Agent & Agent Skills).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 bg-slate-950 border border-blue-500/30 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mb-3">
                  01
                </div>
                <h3 className="font-semibold text-white">Google Gemma Models</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Official Google open-weight models (Gemma 2, Gemma 4) accessed via Google AI Studio, Gemini API, or open-weight inference endpoints.
                </p>
              </div>

              <div className="p-5 bg-slate-950 border border-purple-500/30 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-3">
                  02
                </div>
                <h3 className="font-semibold text-white">Hermes Agent Harness</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Autonomous agent harness developed by Nous Research for long-running workflows, tool invocation, and persistent memory loops.
                </p>
              </div>

              <div className="p-5 bg-slate-950 border border-cyan-500/30 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-3">
                  03
                </div>
                <h3 className="font-semibold text-white">Agent Skills (SKILL.md)</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Open standard format using YAML frontmatter and progressive disclosure to provide procedural operational playbooks without context bloat.
                </p>
              </div>

              <div className="p-5 bg-slate-950 border border-emerald-500/30 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-3">
                  04
                </div>
                <h3 className="font-semibold text-white">GPU Hardware Stack</h3>
                <p className="text-xs text-slate-400 mt-2">
                  NVIDIA Quadro P2000 (CUDA 12.4) running local inference + cloud Colab T4/A100 scaling for training larger open-weight models.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 4-PERSON TEAM ROLES */}
        {activeTab === 'team' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>4-Person Hackathon Team Division</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 bg-slate-950 border border-blue-500/30 rounded-xl">
                <span className="text-[11px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">@gunwantjawle-ux</span>
                <h3 className="font-semibold text-white mt-2">Frontend & UI/UX Lead</h3>
                <p className="text-xs text-cyan-400 font-mono mt-0.5 mb-3">Branch: feature/frontend</p>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>React 19 + Tailwind dashboard</li>
                  <li>Agent reasoning UI components</li>
                  <li>SKILL.md visual inspector & polish</li>
                </ul>
              </div>

              <div className="p-5 bg-slate-950 border border-emerald-500/30 rounded-xl">
                <span className="text-[11px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">@sarthakchambhare16-wdym</span>
                <h3 className="font-semibold text-white mt-2">Backend & API Systems Lead</h3>
                <p className="text-xs text-emerald-400 font-mono mt-0.5 mb-3">Branch: feature/backend</p>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>FastAPI routing & schemas</li>
                  <li>Hermes Agent endpoint wiring</li>
                  <li>SKILL.md progressive loader & API</li>
                </ul>
              </div>

              <div className="p-5 bg-slate-950 border border-purple-500/30 rounded-xl">
                <span className="text-[11px] font-mono bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">@vedxnt-b</span>
                <h3 className="font-semibold text-white mt-2">AI Engine & Agent Skills Lead</h3>
                <p className="text-xs text-purple-400 font-mono mt-0.5 mb-3">Branch: feature/ai-agent</p>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>Gemma API client & prompt tuning</li>
                  <li>Authoring custom SKILL.md playbooks</li>
                  <li>Hermes Agent tool integration & logic</li>
                </ul>
              </div>

              <div className="p-5 bg-slate-950 border border-amber-500/30 rounded-xl">
                <span className="text-[11px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">@Abhishekdabi33</span>
                <h3 className="font-semibold text-white mt-2">Team Lead, Architecture & Demo</h3>
                <p className="text-xs text-amber-400 font-mono mt-0.5 mb-3">Branch: feature/pitch-demo</p>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>End-to-end architecture & GitHub sync</li>
                  <li>Pitch deck & problem statement</li>
                  <li>3-minute demo recording & QA</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
