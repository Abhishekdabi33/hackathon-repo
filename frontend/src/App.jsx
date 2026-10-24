import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
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
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  X, 
  Menu, 
  ArrowUp,
  RotateCcw,
  Code2,
  CheckCircle2,
  CircleDot,
  Volume2,
  VolumeX,
  Trash2,
  Share2,
  Paperclip,
  FileText,
  ExternalLink,
  PlusCircle,
  Download
} from 'lucide-react';
import HermesCharacter from './components/HermesCharacter';
import TiltCard from './components/TiltCard';
import WorkspaceSpotlight from './components/WorkspaceSpotlight';

export default function App() {
  // Navigation & Workspace State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextPanelOpen, setContextPanelOpen] = useState(false);
  const [contextTab, setContextTab] = useState('device'); // 'device' | 'skills' | 'project'
  
  // Chat Conversation State (Clean Conversational AI)
  const [messages, setMessages] = useState([]);
  const [promptInput, setPromptInput] = useState('');
  const [runningAgent, setRunningAgent] = useState(false);
  const [liveExecutionStage, setLiveExecutionStage] = useState(0);
  const [expandedTraceId, setExpandedTraceId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const speakingTimeoutRef = useRef(null);

  // 3D Parallax Scroll Handler
  const handleFeedScroll = (e) => {
    const top = e.currentTarget.scrollTop;
    setScrollOffset(top);
    // Smooth transition over the first 220px of scroll
    const prog = Math.min(1, Math.max(0, top / 220));
    setScrollProgress(prog);
  };

  // Dynamic Living Hermes AI State (idle | listening | thinking | tool | speaking)
  const getHermesState = () => {
    if (isSpeaking) return 'speaking';
    if (runningAgent) {
      if (liveExecutionStage === 1 || liveExecutionStage === 2) return 'thinking';
      if (liveExecutionStage === 3) return 'tool';
      if (liveExecutionStage === 4) return 'speaking';
      return 'thinking';
    }
    if (promptInput.trim().length > 0 || isInputFocused) return 'listening';
    return 'idle';
  };

  // Backend Telemetry & Skills State
  const [health, setHealth] = useState(null);
  const [deviceConfig, setDeviceConfig] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const mainCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [newSkillData, setNewSkillData] = useState({ name: '', description: '', instructions: '', tags: '' });
  const [savingSkill, setSavingSkill] = useState(false);

  // Speech read-aloud functionality
  const handleSpeakMessage = (msgId, text) => {
    if (!('speechSynthesis' in window)) return;
    
    if (speakingMessageId === msgId && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMessageId(msgId);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // Smooth live execution stages when agent is running
  useEffect(() => {
    let t1, t2, t3;
    if (runningAgent) {
      setLiveExecutionStage(1); // Analyzing request
      t1 = setTimeout(() => setLiveExecutionStage(2), 500);  // Discovering skills
      t2 = setTimeout(() => setLiveExecutionStage(3), 1100); // Calling tools
      t3 = setTimeout(() => setLiveExecutionStage(4), 1800); // Synthesizing response
    } else {
      setLiveExecutionStage(0);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [runningAgent]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, runningAgent, liveExecutionStage]);

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
        // Handled via health fallback
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
    // Handle File Upload to Backend
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setAttachedFile({
          name: data.filename,
          size: data.size_bytes,
          content: data.content
        });
      } else {
        alert(data.detail || 'Failed to upload file');
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('File upload error: ' + err.message);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Custom Skill Creation
  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!newSkillData.name.trim() || !newSkillData.instructions.trim()) return;
    setSavingSkill(true);
    try {
      const tagsArray = newSkillData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch('/api/skills/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSkillData.name.trim(),
          description: newSkillData.description.trim() || 'Custom agent skill',
          instructions: newSkillData.instructions.trim(),
          tags: tagsArray
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowSkillModal(false);
        setNewSkillData({ name: '', description: '', instructions: '', tags: '' });
        await fetchSkills();
        if (data.skill) setSelectedSkill(data.skill);
      } else {
        alert(data.detail || 'Failed to create skill');
      }
    } catch (err) {
      console.error('Skill creation error:', err);
      alert('Skill creation error: ' + err.message);
    } finally {
      setSavingSkill(false);
    }
  };

  // Send message to Hermes Agent ReAct loop
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || promptInput;
    if ((!text.trim() && !attachedFile) || runningAgent) return;

    const currentAttached = attachedFile;
    const userMsgId = Date.now().toString();
    const newUserMsg = {
      id: userMsgId,
      role: 'user',
      content: text.trim() || (currentAttached ? `Analyze attached file: ${currentAttached.name}` : ''),
      attachedFile: currentAttached ? { name: currentAttached.name, size: currentAttached.size } : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setPromptInput('');
    setAttachedFile(null);
    setRunningAgent(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim() || `Analyze the attached file: ${currentAttached?.name}`,
          file_name: currentAttached?.name || null,
          file_content: currentAttached?.content || null,
          max_steps: 3
        })
      });

      const data = await res.json();
      const assistantMsgId = (Date.now() + 1).toString();
      
      const newAssistantMsg = {
        id: assistantMsgId,
        role: 'assistant',
        content: data.final_answer || 'Task completed successfully.',
        steps: data.steps || [],
        duration_ms: data.duration_ms || 0,
        status: data.status || 'success',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, newAssistantMsg]);

      // Connect character animation: Switch Hermes to Speaking state
      setSpeakingMessageId(assistantMsgId);
      setIsSpeaking(true);
      if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = setTimeout(() => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      }, 3500);
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Agent execution failed: ${err.message}. Please check if the FastAPI backend is running on port 8000.`,
        status: 'error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setRunningAgent(false);
      fetchHealth();
    }
  };

  // Multimodal assistant output renderer (Images, Diagrams, Formatting)
  const renderAssistantContent = (text) => {
    if (!text) return null;
    const imgRegex = /!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = imgRegex.exec(text)) !== null) {
      const [fullMatch, alt, url] = match;
      const matchIndex = match.index;
      
      if (matchIndex > lastIndex) {
        parts.push({
          type: 'text',
          content: text.substring(lastIndex, matchIndex)
        });
      }

      parts.push({
        type: 'image',
        alt: alt || 'Generated Visual',
        url: url
      });

      lastIndex = matchIndex + fullMatch.length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex)
      });
    }

    if (parts.length === 0) {
      return (
        <p className="text-sm sm:text-base text-[#F5F5FA] whitespace-pre-wrap leading-relaxed font-normal">
          {text}
        </p>
      );
    }

    return (
      <div className="space-y-3.5">
        {parts.map((p, idx) => {
          if (p.type === 'text') {
            return (
              <p key={idx} className="text-sm sm:text-base text-[#F5F5FA] whitespace-pre-wrap leading-relaxed font-normal">
                {p.content}
              </p>
            );
          }
          if (p.type === 'image') {
            return (
              <div key={idx} className="rounded-2xl overflow-hidden border border-[#3B0A6B]/50 bg-[#080310] shadow-[0_8px_30px_rgba(0,0,0,0.6)] group transition-all hover:border-[#00E5FF]/60 hover:shadow-[0_0_25px_rgba(0,229,255,0.2)]">
                <div className="relative overflow-hidden bg-[#050505] flex items-center justify-center min-h-[220px]">
                  <img
                    src={p.url}
                    alt={p.alt}
                    loading="lazy"
                    className="w-full max-h-[460px] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="px-3.5 py-2.5 bg-[#080310] border-t border-[#3B0A6B]/30 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
                    <span className="text-[#F5F5FA] font-medium truncate">{p.alt}</span>
                  </div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-premium px-2 py-1 rounded-lg bg-[#3B0A6B]/30 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#3B0A6B]/40 hover:border-[#00E5FF]/50 flex items-center space-x-1 text-[11px] shrink-0"
                  >
                    <span>View Full Size</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

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

  // Cohesive Suggested Prompts for Empty State
  const suggestedPrompts = [
    {
      category: "SYSTEM TELEMETRY",
      title: "Hardware & CUDA Benchmark",
      description: "Verify RTX 2050 CUDA 12.6 tensor acceleration, memory allocations, and core load.",
      prompt: "Analyze our database statistics and check GPU status.",
      icon: Cpu
    },
    {
      category: "API ORCHESTRATION",
      title: "FastAPI Schema Integrator",
      description: "Generate compliant OpenAPI endpoint contracts with input validations using the skill.",
      prompt: "Use api-integrator skill to format an endpoint",
      icon: Code2
    },
    {
      category: "AGENT PLAYBOOK",
      title: "Data Analyst Workflow",
      description: "Inspect discovered SKILL.md files, summarize dataset metrics, and log observations.",
      prompt: "Use data-analyst skill to summarize sample metrics",
      icon: Activity
    },
    {
      category: "NEURAL HARNESS",
      title: "Multi-Step ReAct Planning",
      description: "Demonstrate thought-action-observation cycles across multiple tool calls.",
      prompt: "Calculate 250 * 18.5 and check PyTorch compute speed",
      icon: Zap
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#050505] text-[#F5F5FA] font-sans antialiased selection:bg-[#3B0A6B]/50 selection:text-[#00E5FF]">
      
      {/* ==================================================================== */}
      {/* 1. LEFT SIDEBAR                                                      */}
      {/* ==================================================================== */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64 sm:w-72' : 'w-0'
        } transition-all duration-300 ease-in-out shrink-0 h-full sidebar-glass flex flex-col justify-between overflow-hidden relative z-40 border-r border-[#3B0A6B]/30`}
      >
        <div className="flex flex-col h-full p-3.5 space-y-4">
          
          {/* Logo & Product Brand */}
          <div className="flex items-center justify-between px-2 pt-1.5 pb-2 border-b border-[#3B0A6B]/25">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3B0A6B] to-[#080310] border border-[#00E5FF]/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                <Bot className="w-4.5 h-4.5 text-[#00E5FF]" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-[#F5F5FA] flex items-center space-x-1.5">
                  <span>Hermes</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#3B0A6B]/40 text-[#00E5FF] border border-[#00E5FF]/25 font-mono">
                    2.0
                  </span>
                </span>
                <p className="text-[10px] text-[#858091] font-mono">Gemma ReAct Engine</p>
              </div>
            </div>
            
            <button 
              onClick={() => setSidebarOpen(false)}
              className="sm:hidden text-[#858091] hover:text-[#00E5FF] p-1 rounded-lg hover:bg-[#3B0A6B]/25 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* "+ New Agent Session" Button with white hover sheen */}
          <button
            onClick={handleNewChat}
            className="w-full btn-premium sheen-travel flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#3B0A6B]/40 via-[#220642]/30 to-[#080310] border border-[#3B0A6B]/50 hover:border-white/30 text-xs font-semibold text-[#F5F5FA] hover:text-white shadow-sm transition-all group"
          >
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-[#00E5FF] transition-transform duration-200 group-hover:rotate-90" />
              <span>New Agent Session</span>
            </div>
            <span className="text-[10px] text-[#858091] font-mono group-hover:text-[#00E5FF] transition-colors">⌘K</span>
          </button>

          {/* Sessions & Navigation */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#858091] px-2 block mb-2 font-mono">
              Conversations
            </span>
            
            <button
              onClick={() => {}}
              className="w-full text-left px-2.5 py-2 rounded-xl text-xs bg-[#3B0A6B]/40 text-[#F5F5FA] border border-[#00E5FF]/50 flex items-center space-x-2.5 truncate font-medium shadow-[0_0_15px_rgba(0,229,255,0.15)] relative overflow-hidden group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF] shrink-0" />
              <span className="truncate flex-1">
                {messages.length > 0 ? messages[0].content.slice(0, 26) + '...' : 'Current Agent Session'}
              </span>
            </button>

            <button
              onClick={() => handleSendMessage("Analyze our database statistics and check GPU status.")}
              className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-[#B8B3C7] hover:text-[#F5F5FA] hover:bg-white/[0.04] border border-transparent hover:border-white/10 flex items-center space-x-2.5 truncate transition-all group"
            >
              <Activity className="w-3.5 h-3.5 text-[#858091] group-hover:text-[#00E5FF] shrink-0 transition-colors" />
              <span className="truncate">Database & Telemetry Audit</span>
            </button>

            <button
              onClick={() => handleSendMessage("Use api-integrator skill to format an endpoint")}
              className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-[#B8B3C7] hover:text-[#F5F5FA] hover:bg-white/[0.04] border border-transparent hover:border-white/10 flex items-center space-x-2.5 truncate transition-all group"
            >
              <Code2 className="w-3.5 h-3.5 text-[#858091] group-hover:text-[#00E5FF] shrink-0 transition-colors" />
              <span className="truncate">API Schema Generator</span>
            </button>

            {/* Context Panel Shortcut Links */}
            <div className="pt-4 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#858091] px-2 block mb-2 font-mono">
                Workspace Tools
              </span>

              <button
                onClick={() => { setContextTab('skills'); setContextPanelOpen(true); }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-[#B8B3C7] hover:text-[#F5F5FA] hover:bg-white/[0.04] border border-transparent hover:border-white/10 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center space-x-2.5">
                  <FileCode className="w-3.5 h-3.5 text-[#00E5FF] group-hover:scale-110 transition-transform" />
                  <span>Agent Skills Hub</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#3B0A6B]/30 text-[#00E5FF] border border-[#3B0A6B]/40 group-hover:border-[#00E5FF]/40">
                  {skills.length}
                </span>
              </button>

              <button
                onClick={() => { setContextTab('device'); setContextPanelOpen(true); }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-[#B8B3C7] hover:text-[#F5F5FA] hover:bg-white/[0.04] border border-transparent hover:border-white/10 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center space-x-2.5">
                  <Cpu className="w-3.5 h-3.5 text-[#00E5FF] group-hover:scale-110 transition-transform" />
                  <span>Device Telemetry</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
              </button>

              <button
                onClick={() => { setContextTab('project'); setContextPanelOpen(true); }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-[#B8B3C7] hover:text-[#F5F5FA] hover:bg-white/[0.04] border border-transparent hover:border-white/10 flex items-center space-x-2.5 transition-all group"
              >
                <Users className="w-3.5 h-3.5 text-[#00E5FF] group-hover:scale-110 transition-transform" />
                <span>Team & Pods</span>
              </button>
            </div>
          </div>

          {/* User Profile Card at Bottom with White Hover Highlight */}
          <div className="p-2.5 rounded-2xl bg-[#080310] border border-[#3B0A6B]/40 hover:border-white/20 transition-all flex items-center justify-between shadow-sm group">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#3B0A6B] to-[#120324] border border-[#00E5FF]/30 flex items-center justify-center font-bold text-xs text-[#FFFFFF] shadow-sm group-hover:border-[#00E5FF]">
                V
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-medium text-[#F5F5FA] block truncate">@vedxnt-b</span>
                <span className="text-[10px] text-[#858091] block truncate font-mono">Pod 1 • Frontend Lead</span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] shrink-0" title="System Online" />
          </div>

        </div>
      </aside>

      {/* ==================================================================== */}
      {/* 2. MAIN CONVERSATIONAL CANVAS (The Visual Center)                     */}
      {/* ==================================================================== */}
      <div 
        ref={mainCanvasRef}
        className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden bg-[#050505]"
      >
        {/* Layered Cursor Spotlight: Soft White Core + Cyan Highlight + Amethyst Ambient Glow */}
        <WorkspaceSpotlight containerRef={mainCanvasRef} />
        
        {/* Royal Amethyst Ambient Illumination with 3D Parallax */}
        <div 
          style={{ transform: `translate(-50%, ${scrollOffset * 0.12}px)` }}
          className="absolute top-0 left-1/2 w-[760px] h-[360px] amethyst-ambient-aura pointer-events-none z-0 will-change-transform" 
        />

        {/* Top Minimal Navbar with Specular Line */}
        <header className="h-14 border-b border-[#3B0A6B]/30 bg-[#050505]/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 relative z-10 shrink-0 specular-line">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn-premium text-[#B8B3C7] hover:text-[#00E5FF] p-1.5 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/10"
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Hermes Dynamic Companion Badge in Top Bar */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#080310] border border-[#3B0A6B]/45 hover:border-white/20 transition-all shadow-[0_0_15px_rgba(59,10,107,0.3)]">
              <HermesCharacter size="sm" state={getHermesState()} interactive={false} />
              <div className="flex flex-col text-left">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-semibold text-[#F5F5FA] tracking-tight leading-none">
                    Hermes
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-status-breathe" />
                </div>
                <span className="text-[9px] font-mono text-[#00E5FF] uppercase leading-none pt-0.5 tracking-wider">
                  {getHermesState()}
                </span>
              </div>
            </div>

            {/* Model Identity Pill */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#3B0A6B]/20 border border-[#3B0A6B]/45 shadow-sm">
              <span className="text-xs font-medium text-[#F5F5FA] tracking-tight">
                Google Gemma 2
              </span>
              <span className="text-[9px] font-mono text-[#00E5FF] bg-[#3B0A6B]/40 border border-[#00E5FF]/20 px-1.5 py-0.2 rounded-full">
                ReAct Agent
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-2">
            {/* CUDA Status Pill */}
            {health?.cuda_available && (
              <span className="hidden sm:inline-flex items-center space-x-1.5 bg-[#3B0A6B]/25 text-[#00E5FF] border border-[#00E5FF]/30 px-2.5 py-1 rounded-full text-[10px] font-mono shadow-[0_0_12px_rgba(0,229,255,0.15)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
                <span>RTX 2050 CUDA 12.6</span>
              </span>
            )}

            {/* New Chat Clear Shortcut if in conversation */}
            {messages.length > 0 && (
              <button
                onClick={handleNewChat}
                className="btn-premium px-2.5 py-1.5 rounded-xl text-xs text-[#858091] hover:text-[#F5F5FA] hover:bg-white/[0.04] border border-transparent hover:border-white/10 flex items-center space-x-1.5"
                title="Reset conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {/* Context Workspace Panel Toggle Button */}
            <button
              onClick={() => setContextPanelOpen(!contextPanelOpen)}
              className={`btn-premium sheen-travel px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-2 border transition-all ${
                contextPanelOpen
                  ? 'bg-[#3B0A6B] text-[#FFFFFF] border-[#00E5FF]/60 shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                  : 'bg-[#080310] text-[#B8B3C7] hover:text-[#00E5FF] hover:border-white/20 border-[#3B0A6B]/35'
              }`}
              title="Toggle Workspace Inspector"
            >
              <Sliders className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span className="hidden sm:inline">Workspace Specs</span>
            </button>
          </div>
        </header>

        {/* ================================================================== */}
        {/* CENTER CONVERSATION FEED (with 3D Parallax Scroll Listener)        */}
        {/* ================================================================== */}
        <div 
          onScroll={handleFeedScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 relative z-10 scroll-smooth custom-scrollbar"
        >
          <div className="max-w-4xl mx-auto w-full">

            {/* A. POLISHED EMPTY STATE: Hermes AI Identity & Suggested Tasks */}
            {messages.length === 0 && (
              <div className="animate-slide-up flex flex-col items-center justify-center pt-8 pb-12 text-center space-y-7">
                
                {/* THE 3D LIVING HERMES AI CHARACTER (Centerpiece) */}
                <div className="flex flex-col items-center justify-center pt-2">
                  <HermesCharacter
                    size="hero"
                    state={getHermesState()}
                    interactive={true}
                    showStatusPill={true}
                    scrollProgress={scrollProgress}
                  />
                </div>

                {/* Hero Greeting Typography */}
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#3B0A6B]/25 border border-[#3B0A6B]/40 text-[#00E5FF] text-[10px] font-mono tracking-widest uppercase mb-1">
                    <Sparkles className="w-3 h-3 text-[#00E5FF]" />
                    <span>Neural Agent Workspace</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5FA] tracking-tight">
                    What can Hermes orchestrate for you?
                  </h2>
                  <p className="text-xs sm:text-sm text-[#B8B3C7] leading-relaxed font-normal">
                    Autonomous agent harness powered by Google Gemma open weights. Ready to explore playbooks, invoke dynamic tools, and evaluate observations.
                  </p>
                </div>

                {/* 3D Interactive Suggested Task Cards (USER → HERMES → RESULT) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full pt-2 text-left">
                  {suggestedPrompts.map((card, idx) => {
                    const IconComponent = card.icon;
                    return (
                      <TiltCard
                        key={idx}
                        onClick={() => handleSendMessage(card.prompt)}
                        className="p-4 rounded-2xl bg-[#080310] border border-[#3B0A6B]/40 cursor-pointer space-y-2.5 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-[#00E5FF] bg-[#3B0A6B]/30 px-2 py-0.5 rounded-md border border-[#3B0A6B]/40">
                            {card.category}
                          </span>
                          <div className="w-6 h-6 rounded-lg bg-[#3B0A6B]/35 text-[#00E5FF] flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-[#F5F5FA] tracking-tight group-hover:text-white flex items-center justify-between">
                            <span>{card.title}</span>
                            <ChevronRight className="w-3 h-3 text-[#858091] group-hover:text-[#00E5FF] group-hover:translate-x-0.5 transition-transform" />
                          </h3>
                          <p className="text-[11px] text-[#B8B3C7] leading-relaxed line-clamp-2 pt-1 font-normal">
                            {card.description}
                          </p>
                        </div>
                      </TiltCard>
                    );
                  })}
                </div>

              </div>
            )}

            {/* B. ACTIVE CONVERSATION: USER → HERMES WORKFLOW */}
            {messages.length > 0 && (
              <div className="space-y-8 pb-44">

                {/* SIGNATURE 3D NEURAL COMPANION CAPSULE (Architectural Floating Module) */}
                <div className="sticky top-0 z-30 mb-6 -mx-2 px-4 py-2.5 rounded-2xl bg-[#080310]/85 backdrop-blur-xl border border-[#3B0A6B]/40 hover:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(59,10,107,0.25)] flex items-center justify-between transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 flex items-center justify-center shrink-0">
                      <HermesCharacter 
                        size="companion" 
                        state={getHermesState()} 
                        interactive={true} 
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-[#F5F5FA] tracking-tight">Hermes Neural Assistant</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-status-breathe" />
                        <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-wider bg-[#3B0A6B]/40 px-2 py-0.5 rounded-full border border-[#00E5FF]/25">
                          {getHermesState()}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#858091] font-mono pt-0.5">
                        {runningAgent 
                          ? (liveExecutionStage === 1 ? 'Analyzing prompt intent...' : liveExecutionStage === 2 ? 'Discovering operational skills...' : liveExecutionStage === 3 ? 'Executing ReAct tool call...' : 'Synthesizing final answer...')
                          : 'Ready for instructions • Google Gemma 2 ReAct Engine'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {health?.cuda_available && (
                      <span className="hidden sm:inline-flex items-center space-x-1.5 bg-[#3B0A6B]/30 text-[#00E5FF] border border-[#00E5FF]/30 px-2.5 py-1 rounded-full text-[10px] font-mono">
                        <span className="w-1 h-1 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
                        <span>CUDA 12.6</span>
                      </span>
                    )}
                    <button
                      onClick={handleNewChat}
                      className="btn-premium px-2.5 py-1 rounded-lg text-xs text-[#858091] hover:text-[#F5F5FA] hover:bg-white/[0.04] border border-transparent hover:border-white/10 flex items-center space-x-1.5"
                      title="Start New Agent Session"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span className="hidden sm:inline">New Session</span>
                    </button>
                  </div>
                </div>
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`animate-slide-up flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
                  >
                    
                    {/* Role Header */}
                    <div className="flex items-center space-x-2 px-1 text-[11px] text-[#B8B3C7] font-medium">
                      {msg.role === 'user' ? (
                        <>
                          <span className="text-[#B8B3C7]">You</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-[#858091]">{msg.timestamp}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 flex items-center justify-center shrink-0">
                            <HermesCharacter 
                              size="sm" 
                              state={speakingMessageId === msg.id ? 'speaking' : 'idle'} 
                              interactive={false} 
                            />
                          </div>
                          <span className="text-[#F5F5FA] font-semibold">Hermes Agent</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-[#858091]">{msg.timestamp}</span>
                        </>
                      )}
                    </div>

                    {/* User Prompt Message Bubble (Royal Amethyst Surface with white hover sheen) */}
                    {msg.role === 'user' && (
                      <div className="max-w-xl rounded-2xl bg-[#3B0A6B]/25 border border-[#3B0A6B]/45 hover:border-white/20 transition-all px-4.5 py-3 text-sm text-[#F5F5FA] leading-relaxed shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
                        {msg.attachedFile && (
                          <div className="flex items-center space-x-2 px-2.5 py-1 mb-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs text-[#00E5FF] w-fit">
                            <FileText className="w-3.5 h-3.5 text-[#00E5FF]" />
                            <span className="font-mono text-[11px] truncate max-w-[200px]">{msg.attachedFile.name}</span>
                            <span className="text-[10px] text-[#B8B3C7] font-mono">({Math.round(msg.attachedFile.size / 1024)} KB)</span>
                          </div>
                        )}
                        {msg.content}
                      </div>
                    )}

                    {/* Hermes Assistant Response Area */}
                    {msg.role === 'assistant' && (
                      <div className="w-full max-w-4xl space-y-3.5">
                        
                        {/* Elegant Expandable Activity Stepper Element */}
                        {msg.steps && msg.steps.length > 0 && (
                          <div className="rounded-2xl bg-[#080310] border border-[#3B0A6B]/40 hover:border-white/15 overflow-hidden transition-all duration-200 shadow-sm">
                            
                            {/* Summary Activity Pill */}
                            <button
                              onClick={() => setExpandedTraceId(expandedTraceId === msg.id ? null : msg.id)}
                              className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-[#B8B3C7] hover:text-[#F5F5FA] bg-[#050505]/40 hover:bg-[#3B0A6B]/20 transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF]" />
                                <span className="font-medium text-[#F5F5FA]">
                                  Agent completed {msg.steps.length} {msg.steps.length === 1 ? 'activity' : 'activities'}
                                </span>
                                <span className="hidden sm:inline text-[#858091] text-[11px] font-mono">
                                  ({msg.steps.map(s => s.action ? s.action : 'reasoning').join(' ➔ ')})
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2 text-[11px]">
                                <span className="font-mono text-[#00E5FF] bg-[#3B0A6B]/30 px-2 py-0.5 rounded-full border border-[#3B0A6B]/40">
                                  {msg.duration_ms} ms
                                </span>
                                {expandedTraceId === msg.id ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-[#858091]" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-[#858091]" />
                                )}
                              </div>
                            </button>

                            {/* Expandable Activity Details */}
                            {expandedTraceId === msg.id && (
                              <div className="p-4 border-t border-[#3B0A6B]/30 space-y-3 animate-slide-up bg-[#050505] text-xs">
                                {msg.steps.map((s, sIdx) => (
                                  <div key={sIdx} className="space-y-2 p-3 rounded-xl bg-[#080310] border border-[#3B0A6B]/35 hover:border-white/15 transition-all">
                                    {/* Activity Header */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 rounded-md bg-[#3B0A6B] text-[#FFFFFF] border border-[#00E5FF]/40 flex items-center justify-center font-mono text-[10px] font-bold">
                                          {sIdx + 1}
                                        </div>
                                        <span className="font-semibold text-[#F5F5FA]">
                                          {s.action ? `Calling tool: ${s.action}` : 'Reasoning & Planning'}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-[#00E5FF] font-mono">Completed</span>
                                    </div>

                                    {/* Natural Language Thought */}
                                    <p className="text-[#B8B3C7] leading-relaxed text-[11px] pl-7">
                                      {s.thought}
                                    </p>

                                    {/* Action Input (if any) */}
                                    {s.action && (
                                      <div className="ml-7 p-2 bg-[#050505] rounded-lg border border-[#3B0A6B]/40 text-[11px] font-mono text-[#B8B3C7]">
                                        <span className="text-[#858091]">Input: </span>
                                        <span className="text-[#00E5FF]">{s.action_input}</span>
                                      </div>
                                    )}

                                    {/* Observation Output (if any) */}
                                    {s.observation && (
                                      <div className="ml-7 p-2.5 bg-[#050505] rounded-lg border border-[#00E5FF]/30 text-[#00E5FF] text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                                        <span className="text-[#858091] block text-[9px] uppercase font-bold tracking-wider mb-0.5">Observation:</span>
                                        {s.observation}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Spacious, Highly Readable Final Answer */}
                        <div className="space-y-3 pt-1">
                          {renderAssistantContent(msg.content)}

                          {/* Assistant Footer Action Toolbar with White Hover Highlights */}
                          <div className="flex items-center justify-between pt-2 text-xs border-t border-[#3B0A6B]/20">
                            <span className="text-[10px] text-[#858091] font-mono">
                              Google Gemma 2 • Hermes ReAct Harness
                            </span>
                            
                            <div className="flex items-center space-x-1.5">
                              {/* Voice Read Aloud Toggle */}
                              <button
                                onClick={() => handleSpeakMessage(msg.id, msg.content)}
                                className={`btn-premium px-2.5 py-1 rounded-lg border flex items-center space-x-1 text-[11px] transition-all ${
                                  speakingMessageId === msg.id && isSpeaking
                                    ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/60 shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                                    : 'bg-[#080310] hover:bg-white/[0.05] text-[#B8B3C7] hover:text-[#00E5FF] border-[#3B0A6B]/35 hover:border-white/20'
                                }`}
                                title={speakingMessageId === msg.id && isSpeaking ? "Stop Voice" : "Hear Hermes Speak"}
                              >
                                {speakingMessageId === msg.id && isSpeaking ? (
                                  <>
                                    <VolumeX className="w-3 h-3 text-[#00E5FF]" />
                                    <span>Mute</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3 h-3 text-[#00E5FF]" />
                                    <span>Speak</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleCopy(msg.id, msg.content)}
                                className="btn-premium px-2.5 py-1 rounded-lg bg-[#080310] hover:bg-white/[0.05] text-[#B8B3C7] hover:text-[#00E5FF] border border-[#3B0A6B]/35 hover:border-white/20 flex items-center space-x-1.5 text-[11px]"
                                title="Copy Response"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-[#00E5FF]" />
                                    <span className="text-[#00E5FF]">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-[#B8B3C7]" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleSendMessage(messages[messages.length - 2]?.content || "Retry")}
                                className="btn-premium p-1.5 rounded-lg bg-[#080310] hover:bg-white/[0.05] text-[#B8B3C7] hover:text-[#00E5FF] border border-[#3B0A6B]/35 hover:border-white/20"
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

                {/* VISUAL LIVE AGENT WORKFLOW IN PROGRESS */}
                {runningAgent && (
                  <div className="animate-slide-up flex items-start space-x-4 max-w-2xl pt-2">
                    {/* Live Reactive Hermes Character (MD size) */}
                    <div className="shrink-0 -mt-1">
                      <HermesCharacter
                        size="md"
                        state={getHermesState()}
                        interactive={false}
                      />
                    </div>
                    
                    {/* Progressive Agent Activity Stepper */}
                    <div className="p-4 rounded-2xl bg-[#080310] border border-[#3B0A6B]/45 shadow-[0_0_30px_rgba(59,10,107,0.35)] space-y-3 flex-1 text-xs card-interactive">
                      <div className="flex items-center space-x-2 text-[#00E5FF] font-medium">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-[#00E5FF]" />
                        <span>Hermes is executing agent workflow...</span>
                      </div>

                      {/* Live Workflow Steps Visualizer */}
                      <div className="space-y-2 pt-1 font-sans">
                        <div className={`flex items-center space-x-2.5 transition-opacity ${liveExecutionStage >= 1 ? 'opacity-100 text-[#F5F5FA]' : 'opacity-40 text-[#858091]'}`}>
                          {liveExecutionStage > 1 ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                          ) : (
                            <CircleDot className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse shrink-0" />
                          )}
                          <span>Analyzing your request & planning strategy</span>
                        </div>

                        <div className={`flex items-center space-x-2.5 transition-opacity ${liveExecutionStage >= 2 ? 'opacity-100 text-[#F5F5FA]' : 'opacity-40 text-[#858091]'}`}>
                          {liveExecutionStage > 2 ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                          ) : liveExecutionStage === 2 ? (
                            <CircleDot className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-[#858091] shrink-0" />
                          )}
                          <span>Discovering Agent Skills & operational playbooks</span>
                        </div>

                        <div className={`flex items-center space-x-2.5 transition-opacity ${liveExecutionStage >= 3 ? 'opacity-100 text-[#F5F5FA]' : 'opacity-40 text-[#858091]'}`}>
                          {liveExecutionStage > 3 ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                          ) : liveExecutionStage === 3 ? (
                            <CircleDot className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-[#858091] shrink-0" />
                          )}
                          <span>Executing tool calls & evaluating observations</span>
                        </div>

                        <div className={`flex items-center space-x-2.5 transition-opacity ${liveExecutionStage >= 4 ? 'opacity-100 text-[#F5F5FA]' : 'opacity-40 text-[#858091]'}`}>
                          {liveExecutionStage === 4 ? (
                            <CircleDot className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-[#858091] shrink-0" />
                          )}
                          <span>Processing & synthesizing final answer</span>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

          </div>
        </div>

        {/* ================================================================== */}
        {/* 3. FLOATING COMPOSER DOCK (Tactile White Highlights & Cyan CTA)     */}
        {/* ================================================================== */}
        <div className="relative z-20 max-w-4xl mx-auto w-full px-4 pb-4">
          <div className="ai-composer-glass rounded-3xl p-3 sm:p-3.5 shadow-2xl">
            
            {/* Attached File Indicator */}
            {attachedFile && (
              <div className="flex items-center justify-between px-3 py-1.5 mb-2 rounded-xl bg-[#3B0A6B]/30 border border-[#00E5FF]/40 text-xs animate-slide-up">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-[#00E5FF] shrink-0" />
                  <span className="text-[#F5F5FA] font-medium text-xs truncate max-w-[280px]">{attachedFile.name}</span>
                  <span className="text-[10px] text-[#00E5FF] font-mono">({Math.round(attachedFile.size / 1024)} KB ready)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 hover:bg-white/10 rounded-md text-[#858091] hover:text-[#F5F5FA] transition-all"
                  title="Remove attached file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Multiline Prompt Textarea */}
            <textarea
              ref={textareaRef}
              rows={2}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Hermes anything, run tools, or execute skills... (Enter to send)"
              className="w-full bg-transparent text-sm text-[#F5F5FA] placeholder-[#858091] focus:outline-none resize-none leading-relaxed font-normal px-2 pt-1"
            />

            {/* Composer Toolbar (Skills Selector, Hardware Chip, Electric Cyan Send Button) */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#3B0A6B]/35 mt-1">
              
              <div className="flex items-center space-x-2 text-xs">
                {/* Skill Quick Selector Pill */}
                <button
                  type="button"
                  onClick={() => { setContextTab('skills'); setContextPanelOpen(true); }}
                  className="btn-premium px-2.5 py-1 rounded-full bg-[#3B0A6B]/25 hover:bg-[#3B0A6B]/45 border border-[#3B0A6B]/40 text-[#00E5FF] hover:border-white/20 flex items-center space-x-1.5 text-[11px]"
                >
                  <Wrench className="w-3 h-3 text-[#00E5FF]" />
                  <span>Skills ({skills.length})</span>
                </button>

                {/* File Ingestion Button & Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.csv,.json,.py,.js,.jsx,.ts,.tsx,.html,.md,.log,.yaml,.yml"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile || runningAgent}
                  className="btn-premium px-2.5 py-1 rounded-full bg-[#3B0A6B]/25 hover:bg-[#3B0A6B]/45 border border-[#3B0A6B]/40 text-[#B8B3C7] hover:text-[#00E5FF] hover:border-white/20 flex items-center space-x-1.5 text-[11px]"
                  title="Upload CSV, JSON, Python, Code or Data for Hermes Agent analysis"
                >
                  {uploadingFile ? (
                    <RefreshCw className="w-3 h-3 text-[#00E5FF] animate-spin" />
                  ) : (
                    <Paperclip className="w-3 h-3 text-[#00E5FF]" />
                  )}
                  <span>{uploadingFile ? 'Uploading...' : 'Attach File'}</span>
                </button>

                {/* Status Pill */}
                {health?.cuda_available && (
                  <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] text-[#00E5FF] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
                    <span>CUDA Active</span>
                  </span>
                )}
              </div>

              {/* Action Buttons & Primary CTA (Electric Cyan Button with Jet Black Text) */}
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline text-[10px] text-[#858091] font-mono">
                  Shift+Enter for newline
                </span>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={runningAgent || (!promptInput.trim() && !attachedFile)}
                  className="btn-premium sheen-travel w-9 h-9 rounded-2xl bg-[#00E5FF] hover:bg-[#33ebff] text-[#050505] font-bold flex items-center justify-center shadow-[0_0_24px_rgba(0,229,255,0.5)] disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
                  title="Send message (Enter)"
                >
                  {runningAgent ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-[#050505]" />
                  ) : (
                    <ArrowUp className="w-4.5 h-4.5 text-[#050505]" />
                  )}
                </button>
              </div>

            </div>

          </div>
          
          <p className="text-center text-[10px] text-[#858091] pt-2 font-mono">
            Hermes ReAct Engine v2.0 • Google Gemma Open-Weights • Jet Black × Royal Amethyst × Electric Cyan
          </p>
        </div>

      </div>

      {/* ==================================================================== */}
      {/* 4. RIGHT CONTEXT PANEL                                               */}
      {/* ==================================================================== */}
      <div 
        className={`${
          contextPanelOpen ? 'w-full sm:w-96' : 'w-0'
        } transition-all duration-300 ease-in-out shrink-0 h-full context-drawer-glass flex flex-col justify-between overflow-hidden relative z-40 border-l border-[#3B0A6B]/30`}
      >
        <div className="flex flex-col h-full p-4 space-y-4">
          
          {/* Drawer Header & Tab Selector */}
          <div className="flex items-center justify-between border-b border-[#3B0A6B]/25 pb-3">
            <div className="flex items-center space-x-1 bg-[#050505] p-1 rounded-xl border border-[#3B0A6B]/30">
              <button
                onClick={() => setContextTab('device')}
                className={`btn-premium px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  contextTab === 'device'
                    ? 'bg-[#3B0A6B] text-[#FFFFFF] border border-[#00E5FF]/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                    : 'text-[#B8B3C7] hover:text-[#00E5FF] hover:border-white/10'
                }`}
              >
                Device Specs
              </button>
              <button
                onClick={() => setContextTab('skills')}
                className={`btn-premium px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  contextTab === 'skills'
                    ? 'bg-[#3B0A6B] text-[#FFFFFF] border border-[#00E5FF]/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                    : 'text-[#B8B3C7] hover:text-[#00E5FF] hover:border-white/10'
                }`}
              >
                Skills ({skills.length})
              </button>
              <button
                onClick={() => setContextTab('project')}
                className={`btn-premium px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  contextTab === 'project'
                    ? 'bg-[#3B0A6B] text-[#FFFFFF] border border-[#00E5FF]/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                    : 'text-[#B8B3C7] hover:text-[#00E5FF] hover:border-white/10'
                }`}
              >
                Team & Pods
              </button>
            </div>

            <button
              onClick={() => setContextPanelOpen(false)}
              className="btn-premium text-[#858091] hover:text-[#00E5FF] p-1.5 rounded-xl hover:bg-[#3B0A6B]/30 transition-colors border border-transparent hover:border-white/10"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 text-xs">
            
            {/* TAB 1: DEVICE SPECS & TELEMETRY */}
            {contextTab === 'device' && (
              <div className="space-y-4 animate-slide-up">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#F5F5FA] tracking-tight flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-[#00E5FF]" />
                    <span>Host Compute Environment</span>
                  </span>
                  <button
                    onClick={() => fetchHealth()}
                    disabled={loadingHealth}
                    className="btn-premium p-1.5 rounded-lg text-[#858091] hover:text-[#00E5FF] hover:bg-[#3B0A6B]/30 transition-colors border border-transparent hover:border-white/10"
                    title="Refresh Telemetry"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin text-[#00E5FF]' : ''}`} />
                  </button>
                </div>

                {/* GPU Card */}
                <div className="p-3.5 rounded-2xl bg-[#080310] border border-[#3B0A6B]/35 space-y-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] card-interactive">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-[#858091] tracking-wider font-mono">GPU Device</span>
                    <span className="text-[10px] font-mono text-[#00E5FF] bg-[#3B0A6B]/30 px-2 py-0.5 rounded-full border border-[#00E5FF]/30 shadow-[0_0_8px_rgba(0,229,255,0.2)]">
                      CUDA 12.6
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#F5F5FA]">
                    {gpuInfo?.device_name || 'NVIDIA GeForce RTX 2050'}
                  </p>
                  
                  {/* VRAM Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#B8B3C7] font-mono">
                      <span>Available VRAM:</span>
                      <span className="text-[#00E5FF] font-semibold">{gpuInfo?.available_vram_mb || 4095.5} MB</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#3B0A6B]/30 overflow-hidden border border-[#3B0A6B]/40">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#3B0A6B] to-[#00E5FF]"
                        style={{ width: `${Math.max(4, Math.min(100, ((gpuInfo?.allocated_vram_mb || 0) / (gpuInfo?.max_vram_mb || 4095.5)) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* CPU & Memory Card */}
                <div className="p-3.5 rounded-2xl bg-[#080310] border border-[#3B0A6B]/35 space-y-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] card-interactive">
                  <span className="text-[10px] uppercase font-semibold text-[#858091] tracking-wider block font-mono">Processor & Memory</span>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-[#050505] rounded-xl border border-[#3B0A6B]/30">
                      <span className="text-[#858091] block text-[9px] uppercase font-mono">CPU Cores</span>
                      <span className="font-semibold text-[#F5F5FA] font-mono">{cpuInfo?.cores || 12} Logical</span>
                    </div>
                    <div className="p-2.5 bg-[#050505] rounded-xl border border-[#3B0A6B]/30">
                      <span className="text-[#858091] block text-[9px] uppercase font-mono">RAM Total</span>
                      <span className="font-semibold text-[#00E5FF] font-mono">{ramInfo?.total_gb || 7.73} GB</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#050505] rounded-xl border border-[#3B0A6B]/30 space-y-1">
                    <div className="flex justify-between text-[10px] text-[#B8B3C7] font-mono">
                      <span>RAM Utilization:</span>
                      <span className="text-[#00E5FF] font-semibold">{ramInfo?.percent_used || 90}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#3B0A6B]/30 overflow-hidden border border-[#3B0A6B]/40">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#3B0A6B] to-[#00E5FF]" 
                        style={{ width: `${ramInfo?.percent_used || 90}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Software Stack */}
                <div className="p-3.5 rounded-2xl bg-[#080310] border border-[#3B0A6B]/35 space-y-2 text-[11px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] card-interactive">
                  <span className="text-[10px] uppercase font-semibold text-[#858091] tracking-wider block font-mono">Software Environment</span>
                  <div className="flex justify-between py-1 border-b border-[#3B0A6B]/20">
                    <span className="text-[#858091]">OS:</span>
                    <span className="font-mono text-[#F5F5FA]">{deviceConfig?.os || 'Windows 11'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#3B0A6B]/20">
                    <span className="text-[#858091]">Python:</span>
                    <span className="font-mono text-[#F5F5FA]">{health?.python_version || '3.13.14'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#3B0A6B]/20">
                    <span className="text-[#858091]">PyTorch:</span>
                    <span className="font-mono text-[#F5F5FA]">{health?.torch_version || '2.14.1+cu126'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#858091]">Model Engine:</span>
                    <span className="font-medium text-[#00E5FF]">Google Gemma 2 (2B/9B)</span>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: AGENT SKILLS HUB (SKILL.md) */}
            {contextTab === 'skills' && (
              <div className="space-y-4 animate-slide-up">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F5F5FA] tracking-tight flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-[#00E5FF]" />
                    <span>Agent Skills ({skills.length})</span>
                  </span>
                    <button
                      type="button"
                      onClick={() => setShowSkillModal(!showSkillModal)}
                      className="btn-premium px-2 py-0.5 rounded-lg bg-[#3B0A6B]/30 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#3B0A6B]/40 hover:border-[#00E5FF]/50 flex items-center space-x-1 text-[11px]"
                    >
                      <Plus className="w-3 h-3 text-[#00E5FF]" />
                      <span>New Skill</span>
                    </button>
                  </div>
                  
                  {/* Skill Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#858091] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Search skills..."
                      className="w-full bg-[#050505] border border-[#3B0A6B]/40 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#F5F5FA] placeholder-[#858091] focus:outline-none focus:border-[#00E5FF] focus:shadow-[0_0_12px_rgba(0,229,255,0.25)] transition-all hover:border-white/20"
                    />
                  </div>
                </div>

                  {/* Custom Skill Authoring Modal / Form */}
                  {showSkillModal && (
                    <form onSubmit={handleCreateSkill} className="p-3.5 rounded-2xl bg-[#080310] border border-[#00E5FF]/40 space-y-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.6)] animate-slide-up">
                      <div className="flex items-center justify-between border-b border-[#3B0A6B]/30 pb-1.5">
                        <span className="text-xs font-semibold text-[#F5F5FA] flex items-center space-x-1">
                          <PlusCircle className="w-3.5 h-3.5 text-[#00E5FF]" />
                          <span>Author New SKILL.md</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowSkillModal(false)}
                          className="text-[#858091] hover:text-[#F5F5FA]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] text-[#858091] uppercase font-bold block mb-1">Skill Name (Slug)</label>
                        <input
                          type="text"
                          required
                          value={newSkillData.name}
                          onChange={(e) => setNewSkillData({ ...newSkillData, name: e.target.value })}
                          placeholder="e.g. security-auditor"
                          className="w-full bg-[#050505] border border-[#3B0A6B]/40 rounded-lg px-2.5 py-1 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#00E5FF]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#858091] uppercase font-bold block mb-1">Description</label>
                        <input
                          type="text"
                          required
                          value={newSkillData.description}
                          onChange={(e) => setNewSkillData({ ...newSkillData, description: e.target.value })}
                          placeholder="Single sentence purpose for agent discovery"
                          className="w-full bg-[#050505] border border-[#3B0A6B]/40 rounded-lg px-2.5 py-1 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#00E5FF]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#858091] uppercase font-bold block mb-1">Tags (comma separated)</label>
                        <input
                          type="text"
                          value={newSkillData.tags}
                          onChange={(e) => setNewSkillData({ ...newSkillData, tags: e.target.value })}
                          placeholder="e.g. audit, security, python"
                          className="w-full bg-[#050505] border border-[#3B0A6B]/40 rounded-lg px-2.5 py-1 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#00E5FF]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#858091] uppercase font-bold block mb-1">Operational Instructions (Markdown)</label>
                        <textarea
                          rows={4}
                          required
                          value={newSkillData.instructions}
                          onChange={(e) => setNewSkillData({ ...newSkillData, instructions: e.target.value })}
                          placeholder={"## Instructions\n1. Analyze codebase vulnerability points...\n2. Return structured audit report..."}
                          className="w-full bg-[#050505] border border-[#3B0A6B]/40 rounded-lg px-2.5 py-1.5 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#00E5FF] resize-none font-mono"
                        />
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowSkillModal(false)}
                          className="btn-premium px-2.5 py-1 rounded-lg border border-[#3B0A6B]/40 text-[#B8B3C7] text-xs hover:bg-white/5"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingSkill}
                          className="btn-premium px-3 py-1 rounded-lg bg-[#00E5FF] hover:bg-[#33ebff] text-[#050505] font-semibold text-xs shadow-[0_0_12px_rgba(0,229,255,0.4)] disabled:opacity-50"
                        >
                          {savingSkill ? 'Deploying...' : 'Deploy Skill'}
                        </button>
                      </div>
                    </form>
                  )}

                {/* Skills List */}
                <div className="space-y-2">
                  {filteredSkills.map((s) => (
                    <div
                      key={s.name}
                      onClick={() => fetchSkillDetail(s.name)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all card-interactive ${
                        selectedSkill?.name === s.name
                          ? 'bg-[#3B0A6B]/40 border-[#00E5FF]/60 text-[#F5F5FA] shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                          : 'bg-[#080310] border-[#3B0A6B]/25 hover:border-white/20 hover:bg-[#3B0A6B]/20 text-[#B8B3C7]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-semibold text-xs text-[#F5F5FA]">{s.name}</span>
                        <span className="text-[9px] font-mono bg-[#3B0A6B]/30 border border-[#3B0A6B]/50 px-1.5 py-0.2 rounded-full text-[#00E5FF]">
                          v{s.version}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#B8B3C7] line-clamp-2 leading-relaxed">{s.description}</p>
                    </div>
                  ))}
                </div>

                {/* Selected Skill Preview */}
                {selectedSkill && (
                  <div className="p-3.5 rounded-2xl bg-[#080310] border border-[#3B0A6B]/40 space-y-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] card-interactive">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-xs text-[#F5F5FA]">{selectedSkill.name}/SKILL.md</span>
                      <button
                        onClick={() => {
                          setPromptInput(`Please execute the ${selectedSkill.name} skill for our task.`);
                          setContextPanelOpen(false);
                        }}
                        className="btn-premium sheen-travel text-[10px] px-2.5 py-1 rounded-lg bg-[#00E5FF] hover:bg-[#33ebff] text-[#050505] font-semibold shadow-[0_0_12px_rgba(0,229,255,0.3)] transition-all"
                      >
                        Use in Chat
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono text-[#F5F5FA] max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed p-2.5 bg-[#050505] rounded-xl border border-[#3B0A6B]/30 custom-scrollbar">
                      {selectedSkill.instructions || 'Loading instructions...'}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TEAM & PODS */}
            {contextTab === 'project' && (
              <div className="space-y-4 animate-slide-up">
                <span className="font-semibold text-[#F5F5FA] tracking-tight flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#00E5FF]" />
                  <span>4-Person Hackathon Engineering Pods</span>
                </span>

                {/* Pod 1 */}
                <div className="p-3.5 rounded-2xl bg-[#080310] border border-[#3B0A6B]/35 space-y-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] card-interactive">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#00E5FF] font-mono">Pod 1: Frontend Squad</span>
                    <span className="text-[9px] font-mono bg-[#3B0A6B]/30 text-[#00E5FF] px-2 py-0.5 rounded-full border border-[#00E5FF]/30 shadow-[0_0_8px_rgba(0,229,255,0.15)]">
                      feature/frontend
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="text-[#F5F5FA]">@vedxnt-b <span className="text-[#858091]">(Lead)</span></div>
                    <div className="text-[#F5F5FA]">@piyushmatodepatil <span className="text-[#858091]">(UI/UX)</span></div>
                  </div>
                </div>

                {/* Pod 2 */}
                <div className="p-3.5 rounded-2xl bg-[#080310] border border-[#3B0A6B]/35 space-y-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] card-interactive">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#00E5FF] font-mono">Pod 2: Backend & AI Engine</span>
                    <span className="text-[9px] font-mono bg-[#3B0A6B]/30 text-[#00E5FF] px-2 py-0.5 rounded-full border border-[#00E5FF]/30 shadow-[0_0_8px_rgba(0,229,255,0.15)]">
                      feature/backend-ai
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="text-[#F5F5FA]">@gunwantjawle-ux <span className="text-[#858091]">(Systems)</span></div>
                    <div className="text-[#F5F5FA]">@Abhishekdabi33 <span className="text-[#858091]">(AI Engine)</span></div>
                  </div>
                </div>

                {/* Hackathon Core Stack */}
                <div className="p-3.5 rounded-2xl bg-[#080310] border border-[#3B0A6B]/35 space-y-2 text-[11px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] card-interactive">
                  <span className="text-[10px] uppercase font-semibold text-[#858091] tracking-wider block font-mono">Hackathon Core Stack</span>
                  <div className="flex justify-between py-1 border-b border-[#3B0A6B]/20">
                    <span className="text-[#858091]">Model Engine:</span>
                    <span className="text-[#F5F5FA]">Google Gemma 2 (2B / 9B)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#3B0A6B]/20">
                    <span className="text-[#858091]">Agent Harness:</span>
                    <span className="text-[#F5F5FA]">Nous Hermes ReAct Loop</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#3B0A6B]/20">
                    <span className="text-[#858091]">Agent Skills:</span>
                    <span className="text-[#F5F5FA]">SKILL.md Open Standard</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#858091]">GPU Acceleration:</span>
                    <span className="text-[#00E5FF] font-semibold">RTX 2050 (4GB) + Kaggle T4</span>
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
