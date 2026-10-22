import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Square, 
  Plus, 
  MessageSquare, 
  Sliders, 
  Cpu, 
  Zap, 
  Activity, 
  Database, 
  Terminal, 
  Wrench, 
  FileCode, 
  Layers, 
  Users, 
  RefreshCw, 
  Copy, 
  Check, 
  Search, 
  PanelRight, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  Trash2, 
  Settings, 
  X, 
  Menu, 
  ArrowUp,
  CornerDownLeft,
  ShieldCheck,
  Code2,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

export default function App() {
  // Navigation & Workspace State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextPanelOpen, setContextPanelOpen] = useState(false);
  const [contextTab, setContextTab] = useState('device'); // 'device' | 'skills' | 'project'
  
  // Chat Conversation State (Modern Conversational Format)
  const [messages, setMessages] = useState([]);
  const [promptInput, setPromptInput] = useState('');
  const [runningAgent, setRunningAgent] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Backend Telemetry & Skills State
  const [health, setHealth] = useState(null);
  const [deviceConfig, setDeviceConfig] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [activeSkillFilter, setActiveSkillFilter] = useState('all');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, runningAgent]);

  // Fetch Health & Device Environment
  const fetchHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
        if (data.device_config) setDeviceConfig(data.device_config);
      } else {
        setHealth({ status: 'offline', error: 'Backend unreachable' });
      }

      try {
        const devRes = await fetch('/api/system/device');
        if (devRes.ok) {
          const devData = await devRes.json();
          setDeviceConfig(devData);
        }
      } catch (e) {
        // Fallback handled via health endpoint
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

  // Send message to Hermes Agent ReAct loop
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || promptInput;
    if (!text.trim() || runningAgent) return;

    const userMsgId = Date.now().toString();
    const newUserMsg = {
      id: userMsgId,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update conversation with user's message
    setMessages((prev) => [...prev, newUserMsg]);
    setPromptInput('');
    setRunningAgent(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), max_steps: 3 })
      });

      const data = await res.json();
      const assistantMsgId = (Date.now() + 1).toString();
      
      const newAssistantMsg = {
        id: assistantMsgId,
        role: 'assistant',
        content: data.final_answer || 'Execution complete.',
        steps: data.steps || [],
        duration_ms: data.duration_ms || 0,
        status: data.status || 'success',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, newAssistantMsg]);
      // Auto-expand reasoning trace for new message
      setExpandedTraceId(assistantMsgId);
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Agent connection error: ${err.message}. Please check if FastAPI backend is running on port 8000.`,
        status: 'error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setRunningAgent(false);
      // Auto-refresh telemetry
      fetchHealth();
    }
  };

  // Keyboard shortcut handler
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewChat = () => {
    setMessages([]);
    setPromptInput('');
  };

  // Suggested Prompts for Empty State
  const suggestedPrompts = [
    {
      title: "Database & Telemetry Analysis",
      description: "Analyze system database statistics and verify real GPU status.",
      prompt: "Analyze our database statistics and check GPU status.",
      icon: Database,
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/25 text-blue-300"
    },
    {
      title: "API Skill Integration",
      description: "Use the api-integrator skill to generate and format a REST endpoint schema.",
      prompt: "Use api-integrator skill to format an endpoint",
      icon: Code2,
      color: "from-violet-500/20 to-purple-500/10 border-violet-500/25 text-violet-300"
    },
    {
      title: "Hardware & Compute Check",
      description: "Calculate 250 * 18.5 and check PyTorch CUDA tensor acceleration.",
      prompt: "Calculate 250 * 18.5 and check system telemetry",
      icon: Cpu,
      color: "from-cyan-500/20 to-teal-500/10 border-cyan-500/25 text-cyan-300"
    },
    {
      title: "Data Analyst Workflow",
      description: "Inspect the data-analyst skill and execute an automated workflow.",
      prompt: "Use data-analyst skill to summarize sample metrics",
      icon: Activity,
      color: "from-emerald-500/20 to-green-500/10 border-emerald-500/25 text-emerald-300"
    }
  ];

  // Filter skills by search
  const filteredSkills = skills.filter((s) => {
    const q = skillSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q) || s.tags?.some(t => t.toLowerCase().includes(q));
  });

  const gpuInfo = deviceConfig?.gpu || (health?.gpu && typeof health.gpu === 'object' ? health.gpu : null);
  const cpuInfo = deviceConfig?.cpu || null;
  const ramInfo = deviceConfig?.ram || null;
  const storageInfo = deviceConfig?.storage || null;
  const modelInfo = deviceConfig?.model || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#07080e] text-[#f3f4f8] font-sans antialiased selection:bg-indigo-500/30 selection:text-white">
      
      {/* ==================================================================== */}
      {/* 1. LEFT SIDEBAR (ChatGPT / Claude Style)                             */}
      {/* ==================================================================== */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64 sm:w-72' : 'w-0'
        } transition-all duration-300 ease-in-out shrink-0 h-full sidebar-glass flex flex-col justify-between overflow-hidden relative z-40`}
      >
        <div className="flex flex-col h-full p-3.5 space-y-4">
          
          {/* Logo & Product Brand */}
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                <Bot className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-sm text-white tracking-tight flex items-center space-x-1.5">
                  <span>Hermes Agent</span>
                  <span className="text-[10px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded-full">
                    v2.0
                  </span>
                </span>
                <p className="text-[11px] text-zinc-400">Google Gemma ReAct</p>
              </div>
            </div>
            
            <button 
              onClick={() => setSidebarOpen(false)}
              className="sm:hidden text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* "+ New Agent Session" Button */}
          <button
            onClick={handleNewChat}
            className="w-full button-spring flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.16] text-xs font-medium text-zinc-200 hover:text-white shadow-sm group"
          >
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-indigo-400 transition-transform duration-200 group-hover:rotate-90" />
              <span>New Agent Session</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">⌘K</span>
          </button>

          {/* Recent Sessions List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-2 block mb-2">
              Conversations
            </span>
            
            <button
              onClick={() => {}}
              className="w-full text-left px-2.5 py-2 rounded-xl text-xs bg-white/[0.07] text-white border border-white/[0.08] flex items-center space-x-2.5 truncate font-medium"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">
                {messages.length > 0 ? messages[0].content.slice(0, 28) + '...' : 'Current Agent Session'}
              </span>
            </button>

            <button
              onClick={() => handleSendMessage("Analyze our database statistics and check GPU status.")}
              className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] flex items-center space-x-2.5 truncate transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">Database & Telemetry Audit</span>
            </button>

            <button
              onClick={() => handleSendMessage("Use api-integrator skill to format an endpoint")}
              className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] flex items-center space-x-2.5 truncate transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">API Schema Generator</span>
            </button>

            {/* Context Panel Shortcut Links */}
            <div className="pt-4 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-2 block mb-2">
                Workspace Tools
              </span>

              <button
                onClick={() => { setContextTab('skills'); setContextPanelOpen(true); }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/[0.03] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <FileCode className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-300" />
                  <span>Agent Skills Hub</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-400">
                  {skills.length}
                </span>
              </button>

              <button
                onClick={() => { setContextTab('device'); setContextPanelOpen(true); }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/[0.03] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center space-x-2.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300" />
                  <span>Device & Hardware</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </button>

              <button
                onClick={() => { setContextTab('project'); setContextPanelOpen(true); }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/[0.03] flex items-center space-x-2.5 transition-colors group"
              >
                <Users className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300" />
                <span>Team & Pods (2 Pods)</span>
              </button>
            </div>
          </div>

          {/* User Profile Card at Bottom */}
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                V
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-semibold text-white block truncate">@vedxnt-b</span>
                <span className="text-[10px] text-zinc-400 block truncate">Pod 1 • Frontend Lead</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="System Online" />
          </div>

        </div>
      </aside>

      {/* ==================================================================== */}
      {/* 2. MAIN CONVERSATIONAL AREA (ChatGPT / Claude / Gemini Style)        */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden bg-gradient-to-b from-[#07080e] via-[#090b13] to-[#05060a]">
        
        {/* Soft Ambient Aurora Gradient Background Blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-b from-indigo-600/[0.08] via-violet-600/[0.04] to-transparent blur-[140px] pointer-events-none z-0" />

        {/* Top Navbar */}
        <header className="h-14 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 relative z-10 shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="button-spring text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08]"
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Model Identity Pill */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/[0.035] border border-white/[0.08] shadow-sm">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-xs font-medium text-white tracking-tight">
                Google Gemma 2
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.06] px-1.5 py-0.2 rounded-full">
                Hermes ReAct
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-2">
            {/* Live GPU Badge */}
            {health?.cuda_available && (
              <span className="hidden sm:inline-flex items-center space-x-1.5 bg-emerald-500/[0.1] text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[10px] font-mono">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>RTX 2050 CUDA 12.6</span>
              </span>
            )}

            {/* Context Workspace Panel Toggle Button */}
            <button
              onClick={() => setContextPanelOpen(!contextPanelOpen)}
              className={`button-spring px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-2 border transition-all ${
                contextPanelOpen
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                  : 'bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08] border-white/[0.08]'
              }`}
              title="Toggle Workspace Inspector"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Workspace Specs</span>
            </button>
          </div>
        </header>

        {/* ================================================================== */}
        {/* CENTER CONVERSATION FEED                                           */}
        {/* ================================================================== */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 relative z-10">
          <div className="max-w-3xl mx-auto w-full">

            {/* A. EMPTY STATE: Large elegant Hermes Visual + Suggestions Grid */}
            {messages.length === 0 && (
              <div className="animate-ios-fade-in flex flex-col items-center justify-center pt-8 pb-12 text-center space-y-8">
                
                {/* Hermes AI Animated Emblem */}
                <div className="relative group">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-0.5 shadow-[0_0_50px_rgba(99,102,241,0.35)] transition-transform duration-500 group-hover:scale-105">
                    <div className="w-full h-full rounded-[22px] bg-[#0b0d18] flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-indigo-400 drop-shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
                    </div>
                  </div>
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-500 opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                </div>

                {/* Hero Greeting Typography */}
                <div className="space-y-2 max-w-lg">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                    How can Hermes help you today?
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                    Autonomous ReAct execution harness powered by Google Gemma open-weight models and progressive Agent Skills.
                  </p>
                </div>

                {/* Suggested Prompts Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full pt-2 text-left">
                  {suggestedPrompts.map((card, idx) => {
                    const IconComponent = card.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSendMessage(card.prompt)}
                        className={`card-3d-subtle p-4 rounded-2xl bg-gradient-to-b ${card.color} border hover:border-white/[0.22] cursor-pointer space-y-2 transition-all duration-200 shadow-sm group`}
                      >
                        <div className="flex items-center justify-between">
                          <IconComponent className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white" />
                        </div>
                        <h3 className="text-xs font-semibold text-white tracking-tight">{card.title}</h3>
                        <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">{card.description}</p>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* B. ACTIVE CONVERSATION: Messages Stream */}
            {messages.length > 0 && (
              <div className="space-y-6 pb-28">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`animate-ios-fade-in flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
                  >
                    
                    {/* Role Header */}
                    <div className="flex items-center space-x-2 px-1 text-[11px] text-zinc-400 font-medium">
                      {msg.role === 'user' ? (
                        <>
                          <span>You</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-zinc-500">{msg.timestamp}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center">
                            <Bot className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-zinc-200 font-semibold">Hermes Agent</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-zinc-500">{msg.timestamp}</span>
                        </>
                      )}
                    </div>

                    {/* User Bubble */}
                    {msg.role === 'user' && (
                      <div className="max-w-xl rounded-2xl bg-indigo-600/20 border border-indigo-500/30 px-4 py-3 text-sm text-zinc-100 leading-relaxed shadow-sm">
                        {msg.content}
                      </div>
                    )}

                    {/* Assistant Response Container */}
                    {msg.role === 'assistant' && (
                      <div className="w-full max-w-3xl space-y-3">
                        
                        {/* Expandable ReAct Execution Trace Accordion */}
                        {msg.steps && msg.steps.length > 0 && (
                          <div className="rounded-2xl bg-white/[0.025] border border-white/[0.07] overflow-hidden transition-all duration-200">
                            <button
                              onClick={() => setExpandedTraceId(expandedTraceId === msg.id ? null : msg.id)}
                              className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-zinc-300 hover:text-white bg-white/[0.015] hover:bg-white/[0.03] transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                                <span className="font-medium">
                                  Autonomous ReAct Execution ({msg.steps.length} {msg.steps.length === 1 ? 'step' : 'steps'})
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-mono text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                                  {msg.duration_ms} ms
                                </span>
                                {expandedTraceId === msg.id ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                                )}
                              </div>
                            </button>

                            {/* Accordion Body: Step Pipeline */}
                            {expandedTraceId === msg.id && (
                              <div className="p-4 border-t border-white/[0.06] space-y-3 animate-ios-fade-in bg-black/40">
                                {msg.steps.map((s, sIdx) => (
                                  <div key={sIdx} className="space-y-2 text-xs">
                                    {/* Thought */}
                                    <div className="flex items-start space-x-2 text-zinc-300">
                                      <span className="w-5 h-5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                                        {sIdx + 1}
                                      </span>
                                      <p className="leading-relaxed">
                                        <strong className="text-indigo-400 font-semibold">Thought:</strong> {s.thought}
                                      </p>
                                    </div>

                                    {/* Tool Call / Action */}
                                    {s.action && (
                                      <div className="ml-7 p-2 bg-black/60 rounded-xl border border-white/[0.07] text-[11px] font-mono flex flex-wrap items-center justify-between gap-2">
                                        <span>Action: <strong className="text-amber-300">{s.action}</strong></span>
                                        <span className="text-zinc-500 text-[10px]">Input: {s.action_input}</span>
                                      </div>
                                    )}

                                    {/* Observation */}
                                    {s.observation && (
                                      <div className="ml-7 p-2.5 bg-black/80 rounded-xl border border-emerald-500/25 text-emerald-300 text-[11px] font-mono whitespace-pre-wrap leading-relaxed">
                                        <span className="text-zinc-500 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Observation:</span>
                                        {s.observation}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Final Answer Text Body */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.035] border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.4)] space-y-3">
                          <p className="text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed font-normal">
                            {msg.content}
                          </p>

                          {/* Assistant Action Buttons Toolbar */}
                          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs">
                            <span className="text-[10px] text-zinc-500 font-mono">
                              Google Gemma • Hermes Engine
                            </span>
                            
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => handleCopy(msg.id, msg.content)}
                                className="button-spring px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] flex items-center space-x-1.5 text-[11px]"
                                title="Copy Response"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleSendMessage(messages[messages.length - 2]?.content || "Retry")}
                                className="button-spring p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06]"
                                title="Regenerate"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                ))}

                {/* Live Thinking / Reasoning State */}
                {runningAgent && (
                  <div className="animate-ios-fade-in flex items-start space-x-3 max-w-xl">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                      <Bot className="w-4 h-4 text-white animate-spin" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2 flex-1">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>Hermes is reasoning, discovering tools & executing loop...</span>
                      </div>
                      <div className="skeleton-shimmer h-8 rounded-xl border border-white/[0.06]" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

          </div>
        </div>

        {/* ================================================================== */}
        {/* 3. FLOATING COMPOSER (ChatGPT / Gemini / Claude Style)             */}
        {/* ================================================================== */}
        <div className="relative z-20 max-w-3xl mx-auto w-full px-4 pb-4">
          <div className="ai-composer-glass rounded-3xl p-3 sm:p-3.5 shadow-2xl transition-all duration-200 focus-within:border-indigo-500/40 focus-within:ring-4 focus-within:ring-indigo-500/10">
            
            {/* Multiline Prompt Textarea */}
            <textarea
              ref={textareaRef}
              rows={2}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Hermes anything, run tools, or execute skills... (Enter to send)"
              className="w-full bg-transparent text-sm text-[#f3f4f8] placeholder-zinc-500 focus:outline-none resize-none leading-relaxed font-normal px-2 pt-1"
            />

            {/* Composer Toolbar (Skills Selector, Hardware Chip, Send Button) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06] mt-1">
              
              <div className="flex items-center space-x-2 text-xs">
                {/* Skill Quick Selector Pill */}
                <button
                  type="button"
                  onClick={() => { setContextTab('skills'); setContextPanelOpen(true); }}
                  className="button-spring px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white flex items-center space-x-1.5 text-[11px]"
                >
                  <Wrench className="w-3 h-3 text-purple-400" />
                  <span>Skills ({skills.length})</span>
                </button>

                {/* GPU Acceleration Status Chip */}
                {health?.cuda_available && (
                  <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>CUDA Active</span>
                  </span>
                )}
              </div>

              {/* Action Buttons & Send CTA */}
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline text-[10px] text-zinc-500 font-mono">
                  Shift+Enter for newline
                </span>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={runningAgent || !promptInput.trim()}
                  className="button-spring w-9 h-9 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.45)] disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                  title="Send message (Enter)"
                >
                  {runningAgent ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <ArrowUp className="w-4.5 h-4.5 text-white" />
                  )}
                </button>
              </div>

            </div>

          </div>
          
          <p className="text-center text-[10px] text-zinc-500 pt-2 font-mono">
            Hermes ReAct Engine v2.0 • Google Gemma Open-Weights • Pod 1: @vedxnt-b & @piyushmatodepatil
          </p>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 4. RIGHT CONTEXT PANEL (Expandable AI Workspace Drawer)               */}
      {/* ==================================================================== */}
      <div 
        className={`${
          contextPanelOpen ? 'w-full sm:w-96' : 'w-0'
        } transition-all duration-300 ease-in-out shrink-0 h-full context-drawer-glass flex flex-col justify-between overflow-hidden relative z-40`}
      >
        <div className="flex flex-col h-full p-4 space-y-4">
          
          {/* Drawer Header & Tab Selector */}
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center space-x-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]">
              <button
                onClick={() => setContextTab('device')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  contextTab === 'device'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Device Specs
              </button>
              <button
                onClick={() => setContextTab('skills')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  contextTab === 'skills'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Skills ({skills.length})
              </button>
              <button
                onClick={() => setContextTab('project')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  contextTab === 'project'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Team & Pods
              </button>
            </div>

            <button
              onClick={() => setContextPanelOpen(false)}
              className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06]"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 text-xs">
            
            {/* TAB 1: DEVICE SPECS & TELEMETRY */}
            {contextTab === 'device' && (
              <div className="space-y-4 animate-ios-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white tracking-tight flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>Host Compute Environment</span>
                  </span>
                  <button
                    onClick={() => fetchHealth()}
                    disabled={loadingHealth}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                    title="Refresh Telemetry"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin text-white' : ''}`} />
                  </button>
                </div>

                {/* GPU Card */}
                <div className="p-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.07] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">GPU Device</span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      CUDA 12.6
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {gpuInfo?.device_name || 'NVIDIA GeForce RTX 2050'}
                  </p>
                  
                  {/* VRAM Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                      <span>Available VRAM:</span>
                      <span className="text-cyan-300">{gpuInfo?.available_vram_mb || 4095.5} MB</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden p-0.5">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                        style={{ width: `${Math.max(4, Math.min(100, ((gpuInfo?.allocated_vram_mb || 0) / (gpuInfo?.max_vram_mb || 4095.5)) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* CPU & Memory Card */}
                <div className="p-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.07] space-y-2.5">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block">Processor & Memory</span>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.06]">
                      <span className="text-zinc-500 block text-[9px] uppercase">CPU Cores</span>
                      <span className="font-semibold text-white font-mono">{cpuInfo?.cores || 12} Logical</span>
                    </div>
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.06]">
                      <span className="text-zinc-500 block text-[9px] uppercase">RAM Total</span>
                      <span className="font-semibold text-emerald-400 font-mono">{ramInfo?.total_gb || 7.73} GB</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-black/40 rounded-xl border border-white/[0.06] space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                      <span>RAM Utilization:</span>
                      <span className="text-emerald-400">{ramInfo?.percent_used || 90}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400" 
                        style={{ width: `${ramInfo?.percent_used || 90}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Software Stack */}
                <div className="p-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.07] space-y-2 text-[11px]">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block">Software Environment</span>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400">OS:</span>
                    <span className="font-mono text-zinc-200">{deviceConfig?.os || 'Windows 11'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400">Python:</span>
                    <span className="font-mono text-zinc-200">{health?.python_version || '3.13.14'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400">PyTorch:</span>
                    <span className="font-mono text-zinc-200">{health?.torch_version || '2.14.1+cu126'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">Model Engine:</span>
                    <span className="font-medium text-indigo-300">Gemma 2B / 9B</span>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: AGENT SKILLS HUB (SKILL.md) */}
            {contextTab === 'skills' && (
              <div className="space-y-4 animate-ios-fade-in">
                <div className="space-y-2">
                  <span className="font-semibold text-white tracking-tight flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <span>Agent Skills ({skills.length})</span>
                  </span>
                  
                  {/* Skill Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Search skills..."
                      className="w-full bg-white/[0.035] border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/40"
                    />
                  </div>
                </div>

                {/* Skills List */}
                <div className="space-y-2">
                  {filteredSkills.map((s) => (
                    <div
                      key={s.name}
                      onClick={() => fetchSkillDetail(s.name)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedSkill?.name === s.name
                          ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                          : 'bg-white/[0.025] border-white/[0.06] hover:bg-white/[0.05] text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-semibold text-xs text-white">{s.name}</span>
                        <span className="text-[9px] font-mono bg-white/[0.06] px-1.5 py-0.2 rounded-full text-zinc-400">
                          v{s.version}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{s.description}</p>
                    </div>
                  ))}
                </div>

                {/* Selected Skill Preview */}
                {selectedSkill && (
                  <div className="p-3.5 rounded-2xl bg-black/60 border border-white/[0.08] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-xs text-white">{selectedSkill.name}/SKILL.md</span>
                      <button
                        onClick={() => {
                          setPromptInput(`Please execute the ${selectedSkill.name} skill for our task.`);
                          setContextPanelOpen(false);
                        }}
                        className="button-spring text-[10px] px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                      >
                        Use in Chat
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono text-zinc-300 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed p-2 bg-black/80 rounded-xl border border-white/[0.06]">
                      {selectedSkill.instructions || 'Loading instructions...'}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TEAM & PODS */}
            {contextTab === 'project' && (
              <div className="space-y-4 animate-ios-fade-in">
                <span className="font-semibold text-white tracking-tight flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>4-Person Hackathon Engineering Pods</span>
                </span>

                {/* Pod 1 */}
                <div className="p-3.5 rounded-2xl bg-blue-500/[0.05] border border-blue-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-blue-400">Pod 1: Frontend Squad</span>
                    <span className="text-[9px] font-mono bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">
                      feature/frontend
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="text-zinc-200">@vedxnt-b <span className="text-zinc-500">(Lead)</span></div>
                    <div className="text-zinc-200">@piyushmatodepatil <span className="text-zinc-500">(UI/UX)</span></div>
                  </div>
                </div>

                {/* Pod 2 */}
                <div className="p-3.5 rounded-2xl bg-purple-500/[0.05] border border-purple-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-purple-400">Pod 2: Backend & AI Engine</span>
                    <span className="text-[9px] font-mono bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">
                      feature/backend-ai
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="text-zinc-200">@gunwantjawle-ux <span className="text-zinc-500">(Systems)</span></div>
                    <div className="text-zinc-200">@Abhishekdabi33 <span className="text-zinc-500">(AI Engine)</span></div>
                  </div>
                </div>

                {/* Hackathon Core Stack */}
                <div className="p-3.5 rounded-2xl bg-white/[0.025] border border-white/[0.07] space-y-2 text-[11px]">
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider block">Hackathon Core Stack</span>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400">Model Engine:</span>
                    <span className="text-zinc-200">Google Gemma 2 (2B / 9B)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400">Agent Harness:</span>
                    <span className="text-zinc-200">Nous Hermes ReAct Loop</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-zinc-400">Agent Skills:</span>
                    <span className="text-zinc-200">SKILL.md Open Standard</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">GPU Acceleration:</span>
                    <span className="text-emerald-400">RTX 2050 (4GB) + Kaggle T4</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
