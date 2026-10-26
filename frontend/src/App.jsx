import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  Bell, 
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
  Download,
  ImageIcon,
  FileUp,
  Monitor,
  CircleUserRound,
  Printer,
  Stethoscope,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import HermesCharacter from './components/HermesCharacter';
import TiltCard from './components/TiltCard';
import WorkspaceSpotlight from './components/WorkspaceSpotlight';
import CinematicBackground from './components/CinematicBackground';
import { LandingPage } from './components/LandingPage';




export default function App() {
  // Navigation & Workspace State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextPanelOpen, setContextPanelOpen] = useState(false);
  const [contextTab, setContextTab] = useState('device');
  const [currentView, setCurrentView] = useState('landing'); // 'app' | 'landing'
 // 'device' | 'skills' | 'project'
  
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
  const [clinicalSamples, setClinicalSamples] = useState([]);

  // Fetch Pre-Loaded Clinical Report Samples
  const fetchClinicalSamples = async () => {
    try {
      const res = await fetch('/api/clinical/samples');
      if (res.ok) {
        const data = await res.json();
        setClinicalSamples(data.samples || []);
      }
    } catch (err) {
      console.error('Error fetching clinical samples:', err);
    }
  };

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
    const cleanText = (text || '').replace(/[*#_`>|]/g, ' ').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.98;
    utterance.pitch = 1.0;
    try {
      const voices = window.speechSynthesis.getVoices();
      const isHindi = /kya|mera|meri|hai|dawa|dard|khoon|daktar|theek|parhez/i.test(cleanText);
      if (isHindi) {
        const hiVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi'));
        if (hiVoice) {
          utterance.voice = hiVoice;
          utterance.lang = 'hi-IN';
        }
      }
    } catch (e) {}
    
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
    fetchClinicalSamples();
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
          content: data.content,
          imageBase64: data.image_base64 || null
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
    // Print / Export Clinical Summary Brief
  const handlePrintSummary = async (msg) => {
    try {
      const res = await fetch('/api/clinical/export-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: "Patient",
          evidence_trace: msg.evidence_trace || [],
          explanation: msg.content || "",
          doctor_questions: msg.doctor_questions || []
        })
      });
      const data = await res.json();
      if (data.html_document) {
        const printWin = window.open('', '_blank');
        if (printWin) {
          printWin.document.write(data.html_document);
          printWin.document.close();
          printWin.focus();
          setTimeout(() => printWin.print(), 350);
        }
      }
    } catch (err) {
      console.error("Print summary error:", err);
    }
  };

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

  // Send message to Hermes Agent / Clinical Engine
  const handleSendMessage = async (textToSend, customAttached) => {
    const text = textToSend || promptInput;
    const currentAttached = customAttached || attachedFile;
    if ((!text.trim() && !currentAttached) || runningAgent) return;

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

    const assistantMsgId = (Date.now() + 1).toString();
    const initialAssistantMsg = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      evidence_trace: null,
      doctor_questions: [],
      abnormal_count: 0,
      model_used: 'Google Gemma 4 12B',
      steps: [],
      duration_ms: 0,
      status: 'streaming',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, initialAssistantMsg]);

    try {
      const isClinical = currentAttached?.content || 
        /report|blood|cbc|lipid|cholesterol|sugar|glucose|thyroid|tsh|creatinine|doctor|prescription|patient|lab|anemia|bp|pressure|pulse|kya|mera|meri|hai|dawa|dard|parhez/i.test(text);

      if (isClinical) {
        const startTime = Date.now();
        const res = await fetch('/api/clinical/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: text.trim() || "Analyze this medical report and explain findings",
            report_text: currentAttached?.content || text.trim(),
            file_name: currentAttached?.name || "medical_report.txt",
            image_base64: currentAttached?.imageBase64 || null
          })
        });

        if (!res.ok) throw new Error(`Stream error: ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.type === 'metadata') {
                  setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
                    ...m,
                    evidence_trace: parsed.evidence_trace || null,
                    doctor_questions: parsed.doctor_questions || [],
                    abnormal_count: parsed.abnormal_count || 0,
                    model_used: parsed.model_used || 'Google Gemma 4 12B'
                  } : m));
                } else if (parsed.type === 'token') {
                  accumulatedContent += parsed.token;
                  setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
                    ...m,
                    content: accumulatedContent
                  } : m));
                }
              } catch (e) {
                // Ignore partial JSON
              }
            }
          }
        }

        const elapsed = Date.now() - startTime;
        setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
          ...m,
          isStreaming: false,
          status: 'success',
          duration_ms: elapsed
        } : m));
      } else {
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
        setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
          ...m,
          content: data.explanation || data.final_answer || 'Analysis complete.',
          evidence_trace: data.evidence_trace || null,
          doctor_questions: data.doctor_questions || [],
          abnormal_count: data.abnormal_count || 0,
          model_used: data.model_used || 'Google Gemma 4 12B',
          isStreaming: false,
          status: data.status || 'success',
          duration_ms: data.latency_ms || 0
        } : m));
      }

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

  // Custom High-End Medical Markdown Component
  const MarkdownContent = ({ content }) => {
    return (
      <div className="medical-markdown-pro leading-relaxed text-zinc-200">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-lg sm:text-xl font-bold text-white mt-4 mb-2 flex items-center space-x-2 border-b border-white/10 pb-1.5" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-base sm:text-lg font-semibold text-white mt-4 mb-2 flex items-center space-x-2" {...props} />
            ),
            h3: ({ node, children, ...props }) => (
              <div className="mt-5 mb-2.5 pb-1.5 border-b border-white/10 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] shrink-0" />
                <h3 className="text-xs sm:text-sm font-bold text-[#00E5FF] tracking-wider uppercase font-mono" {...props}>
                  {children}
                </h3>
              </div>
            ),
            p: ({ node, ...props }) => (
              <p className="text-sm sm:text-[14.5px] text-zinc-200 leading-relaxed my-2 font-normal" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="space-y-2 my-2.5 pl-1 list-none" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="space-y-2 my-2.5 pl-4 list-decimal text-zinc-200 text-sm sm:text-base" {...props} />
            ),
            li: ({ node, children, ...props }) => (
              <li className="flex items-start space-x-2.5 text-sm sm:text-[14.5px] text-zinc-200 my-1" {...props}>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                <span className="flex-1 leading-relaxed">{children}</span>
              </li>
            ),
            strong: ({ node, children, ...props }) => (
              <strong className="font-semibold text-white bg-white/[0.08] px-1.5 py-0.5 rounded border border-white/15" {...props}>
                {children}
              </strong>
            ),
            em: ({ node, ...props }) => (
              <em className="text-zinc-300 italic" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="my-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed" {...props} />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-3 rounded-xl border border-white/10 bg-[#0c0c0e] shadow-lg">
                <table className="w-full text-left text-xs sm:text-sm border-collapse" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-white/[0.06] border-b border-white/10 text-zinc-400 font-mono text-[11px] uppercase tracking-wider" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th className="p-3 font-semibold text-zinc-200 border-r border-white/5 last:border-r-0" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="p-3 border-t border-white/5 border-r border-white/5 last:border-r-0 text-zinc-300" {...props} />
            ),
            code: ({ node, inline, ...props }) => (
              <code className="bg-white/10 text-[#00E5FF] font-mono text-xs px-1.5 py-0.5 rounded border border-white/10" {...props} />
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
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
      return <MarkdownContent content={text} />;
    }

    return (
      <div className="space-y-3.5">
        {parts.map((p, idx) => {
          if (p.type === 'text') {
            return <MarkdownContent key={idx} content={p.content} />;
          }
          if (p.type === 'image') {
            return (
              <div key={idx} className="rounded-2xl overflow-hidden border border-white/10 bg-[#09090b] shadow-[0_8px_30px_rgba(0,0,0,0.6)] group transition-all hover:border-white/20 hover:shadow-[0_0_25px_rgba(0,229,255,0.2)]">
                <div className="relative overflow-hidden bg-[#070709] flex items-center justify-center min-h-[220px]">
                  <img
                    src={p.url}
                    alt={p.alt}
                    loading="lazy"
                    className="w-full max-h-[460px] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="px-3.5 py-2.5 bg-[#09090b] border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
                    <span className="text-[#ffffff] font-medium truncate">{p.alt}</span>
                  </div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-premium px-2 py-1 rounded-lg bg-[#3B0A6B]/30 hover:bg-[#00E5FF]/20 text-[#ffffff] border border-white/10 hover:border-white/20 flex items-center space-x-1 text-[11px] shrink-0"
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
      category: "HEMATOLOGY & METABOLIC",
      title: "Rajesh Sharma CBC & Fasting Sugar",
      description: "Analyze hemoglobin (10.8 g/dL), fasting sugar (142 mg/dL), and HbA1c with EvidenceTrace verification.",
      prompt: "Analyze sample_blood_report.txt and extract EvidenceTrace matrix with doctor questions",
      icon: Activity
    },
    {
      category: "CARDIOVASCULAR RISK",
      title: "Dyslipidemia Lipid Profile",
      description: "Evaluate cholesterol (248 mg/dL), HDL (38 mg/dL), and LDL (164 mg/dL) against clinical cutoffs.",
      prompt: "Analyze sample_lipid_panel.csv for cardiovascular risk factors and clinical flags",
      icon: ShieldAlert
    },
    {
      category: "ENDOCRINOLOGY SCREEN",
      title: "Thyroid Profile (TSH & T4)",
      description: "Check elevated TSH (8.92 uIU/mL) and metabolic markers for primary hypothyroidism.",
      prompt: "Analyze sample_thyroid_panel.txt and generate physician consultation checklist",
      icon: Stethoscope
    },
    {
      category: "SYSTEM & GPU TELEMETRY",
      title: "Gemma 4 12B Hardware Status",
      description: "Verify local CUDA tensor acceleration and Kaggle Dual Tesla T4 GPU ngrok link.",
      prompt: "Analyze our database statistics and check GPU status.",
      icon: Cpu
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

  if (currentView === 'landing') {
    return <LandingPage onLaunchApp={() => setCurrentView('app')} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070709] text-[#FFFFFF] font-sans antialiased selection:bg-[#3B0A6B]/50 selection:text-[#ffffff]">
      {/* Global Interactive Cursor Spotlight Glow over all Dashboard UI */}
      <WorkspaceSpotlight className="fixed inset-0 pointer-events-none z-50" />
      
      {/* ==================================================================== */}
      {/* 1. LEFT SIDEBAR                                                      */}
      {/* ==================================================================== */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64 sm:w-72' : 'w-0'
        } transition-all duration-300 ease-in-out shrink-0 h-full sidebar-glass flex flex-col justify-between overflow-hidden relative z-40 border-r border-white/10`}
      >
        <div className="flex flex-col h-full p-3.5 space-y-4">
          
          {/* Logo & Product Brand */}
          <div className="flex items-center justify-between px-2 pt-1.5 pb-2 border-b border-white/10">
            <div className="flex items-center space-x-2.5 cursor-pointer hover:opacity-85 transition-opacity" onClick={() => setCurrentView('landing')} title="Return to Landing Page">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3B0A6B] to-[#09090b] border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                <Bot className="w-4.5 h-4.5 text-[#ffffff]" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-[#ffffff] flex items-center space-x-1.5">
                  <span>Hermes</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#3B0A6B]/40 text-[#ffffff] border border-white/20 font-mono">
                    2.0
                  </span>
                </span>
                <p className="text-[10px] text-[#71717a] font-mono">Gemma ReAct Engine</p>
              </div>
            </div>
            
            <button 
              onClick={() => setSidebarOpen(false)}
              className="sm:hidden text-[#71717a] hover:text-[#ffffff] p-1 rounded-lg hover:bg-[#3B0A6B]/25 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* "+ New Agent Session" Button with white hover sheen */}
          <button
            onClick={handleNewChat}
            className="w-full btn-premium sheen-travel flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#3B0A6B]/40 via-[#220642]/30 to-[#09090b] border border-white/10 hover:border-white/20 text-xs font-semibold text-[#ffffff] hover:text-white shadow-sm transition-all group"
          >
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-[#ffffff] transition-transform duration-200 group-hover:rotate-90" />
              <span>New Agent Session</span>
            </div>
            <span className="text-[10px] text-[#71717a] font-mono group-hover:text-[#ffffff] transition-colors">⌘K</span>
          </button>

          {/* Sessions & Navigation */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 pt-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717a] px-2 block mb-2 font-mono">
              Conversations
            </span>
            
            <button
              onClick={() => {}}
              className="w-full text-left px-2.5 py-2 rounded-xl text-xs bg-[#3B0A6B]/40 text-[#ffffff] border border-white/20 flex items-center space-x-2.5 truncate font-medium shadow-[0_0_15px_rgba(0,229,255,0.15)] relative overflow-hidden group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF] shrink-0" />
              <span className="truncate flex-1">
                {messages.length > 0 ? messages[0].content.slice(0, 26) + '...' : 'Current Agent Session'}
              </span>
            </button>

            <button
              onClick={() => handleSendMessage("Analyze our database statistics and check GPU status.")}
              className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-[#a1a1aa] hover:text-[#ffffff] hover:bg-white/[0.04] border border-transparent hover:border-white/10 flex items-center space-x-2.5 truncate transition-all group"
            >
              <Activity className="w-3.5 h-3.5 text-[#71717a] group-hover:text-[#ffffff] shrink-0 transition-colors" />
              <span className="truncate">Database & Telemetry Audit</span>
            </button>

            <button
              onClick={() => handleSendMessage("Use api-integrator skill to format an endpoint")}
              className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-[#a1a1aa] hover:text-[#ffffff] hover:bg-white/[0.04] border border-transparent hover:border-white/10 flex items-center space-x-2.5 truncate transition-all group"
            >
              <Code2 className="w-3.5 h-3.5 text-[#71717a] group-hover:text-[#ffffff] shrink-0 transition-colors" />
              <span className="truncate">API Schema Generator</span>
            </button>

            {/* Context Panel Shortcut Links */}
            <div className="pt-4 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717a] px-2 block mb-2 font-mono">
                Workspace Tools
              </span>

              <button
                onClick={() => { setContextTab('skills'); setContextPanelOpen(true); }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-[#a1a1aa] hover:text-[#ffffff] hover:bg-white/[0.04] border border-transparent hover:border-white/10 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center space-x-2.5">
                  <FileCode className="w-3.5 h-3.5 text-[#ffffff] group-hover:scale-110 transition-transform" />
                  <span>Agent Skills Hub</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#3B0A6B]/30 text-[#ffffff] border border-white/10 group-hover:border-white/20">
                  {skills.length}
                </span>
              </button>

              <button
                onClick={() => { setContextTab('device'); setContextPanelOpen(true); }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-[#a1a1aa] hover:text-[#ffffff] hover:bg-white/[0.04] border border-transparent hover:border-white/10 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center space-x-2.5">
                  <Cpu className="w-3.5 h-3.5 text-[#ffffff] group-hover:scale-110 transition-transform" />
                  <span>Device Telemetry</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
              </button>

              <button
                onClick={() => { setContextTab('project'); setContextPanelOpen(true); }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-[#a1a1aa] hover:text-[#ffffff] hover:bg-white/[0.04] border border-transparent hover:border-white/10 flex items-center space-x-2.5 transition-all group"
              >
                <Users className="w-3.5 h-3.5 text-[#ffffff] group-hover:scale-110 transition-transform" />
                <span>Team & Pods</span>
              </button>
            </div>
          </div>

          {/* User Profile Card at Bottom with White Hover Highlight */}
          <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between shadow-sm group">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#3B0A6B] to-[#120324] border border-white/20 flex items-center justify-center font-bold text-xs text-[#FFFFFF] shadow-sm group-hover:border-[#00E5FF]">
                V
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-medium text-[#ffffff] block truncate">@vedxnt-b</span>
                <span className="text-[10px] text-[#71717a] block truncate font-mono">Pod 1 • Frontend Lead</span>
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
        className="flex-1 flex flex-col h-full min-w-0 relative overflow-hidden bg-[#070709]"
      >
        
        {/* Cinematic Atmospheric Deep Obsidian Environment */}
        <CinematicBackground scrollOffset={scrollOffset} />

        {/* Top Minimal Navbar with Specular Line */}
        <header className="h-16 glass-nav flex items-center justify-between px-6 relative z-20 shrink-0 specular-line">
          {/* Left: Logo Icon (minimalist circle/dot graphic) with Brand Title in clean uppercase tracking */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn-premium text-[#a1a1aa] hover:text-white p-1.5 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/10"
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Minimalist Circle/Dot Graphic Logo */}
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/15 flex items-center justify-center relative shadow-[0_0_12px_rgba(255,255,255,0.12)]">
                <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-xs tracking-[0.25em] text-white uppercase">HERMES</span>
                <span className="text-[10px] text-[#a1a1aa] font-mono tracking-wider">• AI</span>
              </div>
            </div>

            {/* Subtle Companion Status Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-status-breathe" />
              <span className="text-[10px] font-mono text-[#a1a1aa] uppercase tracking-wider">
                {getHermesState()}
              </span>
            </div>
          </div>

          {/* Center: Navigation Pill Links (Home, The Feed, Analytics, Profile) in a rounded dark container */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-1 p-1 rounded-full bg-[#09090b]/80 border border-white/10 backdrop-blur-xl shadow-inner">
            <button
              onClick={() => { setCurrentView('app'); handleNewChat(); }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                currentView === 'app' 
                  ? 'text-white bg-white/[0.08] border border-white/15 shadow-sm' 
                  : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => setCurrentView('landing')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                currentView === 'landing' 
                  ? 'text-white bg-white/[0.08] border border-white/15 shadow-sm' 
                  : 'text-[#a1a1aa] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Landing Page
            </button>
            <button
              onClick={() => { setContextTab('skills'); setContextPanelOpen(true); }}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-all"
            >
              The Feed
            </button>
            <button
              onClick={() => { setContextTab('device'); setContextPanelOpen(true); }}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-all"
            >
              Analytics
            </button>
            <button
              onClick={() => { setContextTab('project'); setContextPanelOpen(true); }}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-all"
            >
              Profile
            </button>
          </nav>

          {/* Right: Search bar icon, Notifications bell, and solid white Get Started pill button */}
          <div className="flex items-center space-x-2.5">
            <button 
              onClick={() => {}}
              className="p-2 rounded-full text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/10 transition-all"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => {}}
              className="p-2 rounded-full text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/10 relative transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-1.5 h-1.5 rounded-full bg-white absolute top-1.5 right-1.5 shadow-[0_0_6px_#ffffff]" />
            </button>

            {/* Solid white Get Started pill button with dark text */}
            <button 
              onClick={() => setContextPanelOpen(true)}
              className="px-4 py-1.5 rounded-full bg-[#ffffff] text-[#000000] font-semibold text-xs hover:bg-zinc-200 transition-all shadow-[0_0_16px_rgba(255,255,255,0.15)] hover:shadow-[0_0_22px_rgba(255,255,255,0.3)]"
            >
              Get Started
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

                {/* 3D Interactive Suggested Task Cards (USER → HERMES → RESULT) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full pt-2 text-left">
                  {suggestedPrompts.map((card, idx) => {
                    const IconComponent = card.icon;
                    return (
                      <TiltCard
                        key={idx}
                        onClick={() => handleSendMessage(card.prompt)}
                        className="p-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.045] border border-white/10 hover:border-white/20 cursor-pointer space-y-2.5 transition-all shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono uppercase tracking-wider text-[#ffffff] bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/10">
                            {card.category}
                          </span>
                          <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/10 text-[#ffffff] flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-[#ffffff] tracking-tight group-hover:text-white flex items-center justify-between">
                            <span>{card.title}</span>
                            <ChevronRight className="w-3 h-3 text-[#71717a] group-hover:text-[#ffffff] group-hover:translate-x-0.5 transition-transform" />
                          </h3>
                          <p className="text-[11px] text-[#a1a1aa] leading-relaxed line-clamp-2 pt-1 font-normal">
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
                <div className="sticky top-0 z-30 mb-6 -mx-2 px-4 py-2.5 rounded-2xl bg-[#09090b]/85 backdrop-blur-xl border border-white/10 hover:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(59,10,107,0.25)] flex items-center justify-between transition-all">
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
                        <span className="text-xs font-bold text-[#ffffff] tracking-tight">Hermes Neural Assistant</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-status-breathe" />
                        <span className="text-[10px] font-mono text-[#ffffff] uppercase tracking-wider bg-[#3B0A6B]/40 px-2 py-0.5 rounded-full border border-white/20">
                          {getHermesState()}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#71717a] font-mono pt-0.5">
                        {runningAgent 
                          ? (liveExecutionStage === 1 ? 'Analyzing prompt intent...' : liveExecutionStage === 2 ? 'Discovering operational skills...' : liveExecutionStage === 3 ? 'Executing ReAct tool call...' : 'Synthesizing final answer...')
                          : 'Ready for instructions • Google Gemma 2 ReAct Engine'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {health?.cuda_available && (
                      <span className="hidden sm:inline-flex items-center space-x-1.5 bg-[#3B0A6B]/30 text-[#ffffff] border border-white/20 px-2.5 py-1 rounded-full text-[10px] font-mono">
                        <span className="w-1 h-1 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
                        <span>CUDA 12.6</span>
                      </span>
                    )}
                    <button
                      onClick={handleNewChat}
                      className="btn-premium px-2.5 py-1 rounded-lg text-xs text-[#71717a] hover:text-[#ffffff] hover:bg-white/[0.04] border border-transparent hover:border-white/10 flex items-center space-x-1.5"
                      title="Start New Agent Session"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#ffffff]" />
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
                    <div className="flex items-center space-x-2 px-1 text-[11px] text-[#a1a1aa] font-medium">
                      {msg.role === 'user' ? (
                        <>
                          <span className="text-[#a1a1aa]">You</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-[#71717a]">{msg.timestamp}</span>
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
                          <span className="text-[#ffffff] font-semibold">Hermes Agent</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-[#71717a]">{msg.timestamp}</span>
                        </>
                      )}
                    </div>

                    {/* User Prompt Message Bubble (Royal Amethyst Surface with white hover sheen) */}
                    {msg.role === 'user' && (
                      <div className="max-w-xl rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all px-4.5 py-3 text-sm text-white leading-relaxed shadow-sm">
                        {msg.attachedFile && (
                          <div className="flex items-center space-x-2 px-2.5 py-1 mb-2 rounded-lg bg-[#00E5FF]/10 border border-white/20 text-xs text-[#ffffff] w-fit">
                            <FileText className="w-3.5 h-3.5 text-[#ffffff]" />
                            <span className="font-mono text-[11px] truncate max-w-[200px]">{msg.attachedFile.name}</span>
                            <span className="text-[10px] text-[#a1a1aa] font-mono">({Math.round(msg.attachedFile.size / 1024)} KB)</span>
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
                          <div className="rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/15 overflow-hidden transition-all duration-200 shadow-sm">
                            
                            {/* Summary Activity Pill */}
                            <button
                              onClick={() => setExpandedTraceId(expandedTraceId === msg.id ? null : msg.id)}
                              className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-[#a1a1aa] hover:text-[#ffffff] bg-[#070709]/40 hover:bg-[#3B0A6B]/20 transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#ffffff]" />
                                <span className="font-medium text-[#ffffff]">
                                  Agent completed {msg.steps.length} {msg.steps.length === 1 ? 'activity' : 'activities'}
                                </span>
                                <span className="hidden sm:inline text-[#71717a] text-[11px] font-mono">
                                  ({msg.steps.map(s => s.action ? s.action : 'reasoning').join(' ➔ ')})
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2 text-[11px]">
                                <span className="font-mono text-[#ffffff] bg-[#3B0A6B]/30 px-2 py-0.5 rounded-full border border-white/10">
                                  {msg.duration_ms} ms
                                </span>
                                {expandedTraceId === msg.id ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-[#71717a]" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-[#71717a]" />
                                )}
                              </div>
                            </button>

                            {/* Expandable Activity Details */}
                            {expandedTraceId === msg.id && (
                              <div className="p-4 border-t border-white/10 space-y-3 animate-slide-up bg-[#070709] text-xs">
                                {msg.steps.map((s, sIdx) => (
                                  <div key={sIdx} className="space-y-2 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/15 transition-all">
                                    {/* Activity Header */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 rounded-md bg-[#3B0A6B] text-[#FFFFFF] border border-white/20 flex items-center justify-center font-mono text-[10px] font-bold">
                                          {sIdx + 1}
                                        </div>
                                        <span className="font-semibold text-[#ffffff]">
                                          {s.action ? `Calling tool: ${s.action}` : 'Reasoning & Planning'}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-[#ffffff] font-mono">Completed</span>
                                    </div>

                                    {/* Natural Language Thought */}
                                    <p className="text-[#a1a1aa] leading-relaxed text-[11px] pl-7">
                                      {s.thought}
                                    </p>

                                    {/* Action Input (if any) */}
                                    {s.action && (
                                      <div className="ml-7 p-2 bg-[#070709] rounded-lg border border-white/10 text-[11px] font-mono text-[#a1a1aa]">
                                        <span className="text-[#71717a]">Input: </span>
                                        <span className="text-[#ffffff]">{s.action_input}</span>
                                      </div>
                                    )}

                                    {/* Observation Output (if any) */}
                                    {s.observation && (
                                      <div className="ml-7 p-2.5 bg-[#070709] rounded-lg border border-white/20 text-[#ffffff] text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto custom-scrollbar">
                                        <span className="text-[#71717a] block text-[9px] uppercase font-bold tracking-wider mb-0.5">Observation:</span>
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
                          {/* EvidenceTrace Verification Table */}
                          {msg.evidence_trace && msg.evidence_trace.length > 0 && (
                            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3.5 my-3 shadow-sm">
                              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                                  </div>
                                  <div>
                                    <span className="font-semibold text-xs text-white">EvidenceTrace™ Test Validation Matrix</span>
                                    <p className="text-[10px] text-zinc-400 font-mono">0ms Deterministic Range Check against Clinical Standards</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                    {msg.abnormal_count} Abnormal
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-400 border border-white/10">
                                    {msg.evidence_trace.length} Total
                                  </span>
                                </div>
                              </div>

                              {/* Table */}
                              <div className="overflow-x-auto no-scrollbar">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="text-[10px] uppercase font-mono text-zinc-400 border-b border-white/10">
                                      <th className="pb-2 font-medium">Test Name</th>
                                      <th className="pb-2 font-medium">Result</th>
                                      <th className="pb-2 font-medium">Reference Interval</th>
                                      <th className="pb-2 font-medium">Status</th>
                                      <th className="pb-2 font-medium">Clinical Context</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/[0.06]">
                                    {msg.evidence_trace.map((item, idx) => {
                                      const isHigh = item.flag === 'HIGH' || item.flag === 'CRITICAL';
                                      const isLow = item.flag === 'LOW';
                                      const flagColor = isHigh 
                                        ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                                        : isLow 
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';

                                      return (
                                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                          <td className="py-2.5 font-medium text-white">{item.test_name}</td>
                                          <td className="py-2.5 font-bold font-mono text-white">
                                            {item.value} <span className="text-[10px] font-normal text-zinc-400">{item.unit}</span>
                                          </td>
                                          <td className="py-2.5 font-mono text-zinc-400 text-[11px]">{item.ref_range}</td>
                                          <td className="py-2.5">
                                            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${flagColor}`}>
                                              {item.flag}
                                            </span>
                                          </td>
                                          <td className="py-2.5 text-zinc-300 text-[11px] max-w-xs">{item.meaning || 'Within reference range'}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* Doctor Consultation Questions */}
                              {msg.doctor_questions && msg.doctor_questions.length > 0 && (
                                <div className="pt-3 border-t border-white/10 space-y-2">
                                  <div className="flex items-center space-x-2 text-xs font-semibold text-white">
                                    <Stethoscope className="w-3.5 h-3.5 text-[#00E5FF]" />
                                    <span>Prioritized Questions for Your Doctor</span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    {msg.doctor_questions.map((q, qIdx) => (
                                      <div key={qIdx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 text-[11px] text-zinc-300 leading-relaxed flex items-start space-x-2">
                                        <span className="font-mono text-[10px] text-[#00E5FF] shrink-0 font-bold">Q{qIdx + 1}</span>
                                        <span>{q}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Export Summary Button */}
                              <div className="pt-2 flex justify-end">
                                <button
                                  onClick={() => handlePrintSummary(msg)}
                                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/20 hover:border-white/30 text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-all"
                                  title="Print or save PDF report"
                                >
                                  <Printer className="w-3.5 h-3.5 text-white" />
                                  <span>Export Clinical Summary (PDF)</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {renderAssistantContent(msg.content)}

                          {/* Smart Follow-Up Action Chips */}
                          {!msg.isStreaming && msg.content && (
                            <div className="pt-2 pb-1 flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-[#71717a] font-mono flex items-center mr-1">
                                <Sparkles className="w-2.5 h-2.5 mr-1 text-[#00E5FF]" /> Follow-up:
                              </span>
                              {[
                                "What foods should I avoid with high BP?",
                                "Explain Hydrochlorothiazide 25mg side effects",
                                "इसे आसान हिंदी में समझाओ (Hindi)",
                                "What questions should I ask my doctor?"
                              ].map((chip, cIdx) => (
                                <button
                                  key={cIdx}
                                  onClick={() => handleSendMessage(chip)}
                                  disabled={runningAgent}
                                  className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 hover:border-[#00E5FF]/40 text-[11px] transition-all flex items-center space-x-1"
                                >
                                  <span>{chip}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Assistant Footer Action Toolbar with White Hover Highlights */}
                          <div className="flex items-center justify-between pt-2 text-xs border-t border-white/10">
                            <span className="text-[10px] text-[#71717a] font-mono">
                              {msg.model_used || 'Google Gemma 4 12B'} • LabLens EvidenceTrace™
                            </span>
                            
                            <div className="flex items-center space-x-1.5">
                              {/* Voice Read Aloud Toggle */}
                              <button
                                onClick={() => handleSpeakMessage(msg.id, msg.content)}
                                className={`btn-premium px-2.5 py-1 rounded-lg border flex items-center space-x-1 text-[11px] transition-all ${
                                  speakingMessageId === msg.id && isSpeaking
                                    ? 'bg-[#00E5FF]/20 text-[#ffffff] border-white/20 shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                                    : 'bg-[#09090b] hover:bg-white/[0.05] text-[#a1a1aa] hover:text-[#ffffff] border-white/10 hover:border-white/20'
                                }`}
                                title={speakingMessageId === msg.id && isSpeaking ? "Stop Voice" : "Hear Hermes Speak"}
                              >
                                {speakingMessageId === msg.id && isSpeaking ? (
                                  <>
                                    <VolumeX className="w-3 h-3 text-[#ffffff]" />
                                    <span>Mute</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3 h-3 text-[#ffffff]" />
                                    <span>Speak</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleCopy(msg.id, msg.content)}
                                className="btn-premium px-2.5 py-1 rounded-lg bg-[#09090b] hover:bg-white/[0.05] text-[#a1a1aa] hover:text-[#ffffff] border border-white/10 hover:border-white/20 flex items-center space-x-1.5 text-[11px]"
                                title="Copy Response"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-[#ffffff]" />
                                    <span className="text-[#ffffff]">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-[#a1a1aa]" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleSendMessage(messages[messages.length - 2]?.content || "Retry")}
                                className="btn-premium p-1.5 rounded-lg bg-[#09090b] hover:bg-white/[0.05] text-[#a1a1aa] hover:text-[#ffffff] border border-white/10 hover:border-white/20"
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
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 shadow-[0_0_30px_rgba(59,10,107,0.35)] space-y-3 flex-1 text-xs card-interactive spotlight-card">
                      <div className="flex items-center space-x-2 text-[#ffffff] font-medium">
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-[#ffffff]" />
                        <span>Hermes is executing agent workflow...</span>
                      </div>

                      {/* Live Workflow Steps Visualizer */}
                      <div className="space-y-2 pt-1 font-sans">
                        <div className={`flex items-center space-x-2.5 transition-opacity ${liveExecutionStage >= 1 ? 'opacity-100 text-[#ffffff]' : 'opacity-40 text-[#71717a]'}`}>
                          {liveExecutionStage > 1 ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#ffffff] shrink-0" />
                          ) : (
                            <CircleDot className="w-3.5 h-3.5 text-[#ffffff] animate-pulse shrink-0" />
                          )}
                          <span>Analyzing your request & planning strategy</span>
                        </div>

                        <div className={`flex items-center space-x-2.5 transition-opacity ${liveExecutionStage >= 2 ? 'opacity-100 text-[#ffffff]' : 'opacity-40 text-[#71717a]'}`}>
                          {liveExecutionStage > 2 ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#ffffff] shrink-0" />
                          ) : liveExecutionStage === 2 ? (
                            <CircleDot className="w-3.5 h-3.5 text-[#ffffff] animate-pulse shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-[#71717a] shrink-0" />
                          )}
                          <span>Discovering Agent Skills & operational playbooks</span>
                        </div>

                        <div className={`flex items-center space-x-2.5 transition-opacity ${liveExecutionStage >= 3 ? 'opacity-100 text-[#ffffff]' : 'opacity-40 text-[#71717a]'}`}>
                          {liveExecutionStage > 3 ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#ffffff] shrink-0" />
                          ) : liveExecutionStage === 3 ? (
                            <CircleDot className="w-3.5 h-3.5 text-[#ffffff] animate-pulse shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-[#71717a] shrink-0" />
                          )}
                          <span>Executing tool calls & evaluating observations</span>
                        </div>

                        <div className={`flex items-center space-x-2.5 transition-opacity ${liveExecutionStage >= 4 ? 'opacity-100 text-[#ffffff]' : 'opacity-40 text-[#71717a]'}`}>
                          {liveExecutionStage === 4 ? (
                            <CircleDot className="w-3.5 h-3.5 text-[#ffffff] animate-pulse shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border border-[#71717a] shrink-0" />
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
        {/* 3. CENTERED ROUNDED-FULL CHAT INPUT PILL CONTAINER                  */}
        {/* ================================================================== */}
        <div className="relative z-20 max-w-3xl mx-auto w-full px-4 pb-6">
          {/* Attached File Floating Indicator */}
          {attachedFile && (
            <div className="flex items-center justify-between px-3.5 py-1.5 mb-2 rounded-full bg-[#09090b]/90 border border-white/15 text-xs animate-slide-up w-fit mx-auto shadow-sm">
              <div className="flex items-center space-x-2 truncate">
                <FileText className="w-3.5 h-3.5 text-white shrink-0" />
                <span className="text-white font-medium text-xs truncate max-w-[240px]">{attachedFile.name}</span>
                <span className="text-[10px] text-[#a1a1aa] font-mono">({Math.round(attachedFile.size / 1024)} KB ready)</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="p-1 hover:bg-white/10 rounded-full text-[#a1a1aa] hover:text-white ml-2 transition-all"
                title="Remove attached file"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Pre-Loaded Clinical Report Samples */}
          {clinicalSamples && clinicalSamples.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2 px-1 text-xs">
              <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider shrink-0 flex items-center space-x-1">
                <Activity className="w-3 h-3 text-[#00E5FF]" />
                <span>Demo Reports:</span>
              </span>
              {clinicalSamples.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  disabled={runningAgent}
                  onClick={() => {
                    const sampleObj = {
                      name: sample.filename,
                      size: sample.content.length,
                      content: sample.content
                    };
                    setAttachedFile(sampleObj);
                    handleSendMessage(`Analyze ${sample.title} and extract EvidenceTrace validation matrix.`, sampleObj);
                  }}
                  className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.09] text-white/80 hover:text-white border border-white/10 hover:border-white/25 shrink-0 transition-all text-[11px] flex items-center space-x-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]/70" />
                  <span>{sample.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Rounded Pill Shape Chat Input Box */}
          <div className="rounded-full bg-[#09090b]/85 backdrop-blur-2xl border border-white/10 hover:border-white/20 focus-within:border-white/30 p-1.5 sm:p-2 flex items-center justify-between shadow-[0_16px_40px_-10px_rgba(0,0,0,0.85)] transition-all">
            
            {/* Paperclip File Upload Action Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.mp4,.mov,.webm,.avi,.txt,.csv,.json,.md,.yaml,.yml"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile || runningAgent}
              className="w-9 h-9 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-[#a1a1aa] hover:text-white flex items-center justify-center transition-all shrink-0 ml-1"
              title="Attach document or dataset"
            >
              {uploadingFile ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Paperclip className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Prompt Input Field */}
            <input
              type="text"
              ref={textareaRef}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything or type a prompt..."
              className="flex-1 bg-transparent text-sm text-white placeholder-[#a1a1aa] focus:outline-none px-3 font-normal"
            />

            {/* Glowing Action Button on the Right */}
            <button
              onClick={() => handleSendMessage()}
              disabled={runningAgent || (!promptInput.trim() && !attachedFile)}
              className="w-10 h-10 rounded-full bg-[#ffffff] hover:bg-zinc-200 text-[#000000] font-bold flex items-center justify-center shadow-[0_0_16px_rgba(255,255,255,0.18)] hover:shadow-[0_0_24px_rgba(255,255,255,0.35)] disabled:opacity-25 disabled:cursor-not-allowed disabled:shadow-none shrink-0 transition-all"
              title="Send message (Enter)"
            >
              {runningAgent ? (
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
              ) : (
                <ArrowUp className="w-4 h-4 text-black stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-[#a1a1aa] pb-2 font-mono">
          Hermes ReAct Engine v2.0 • Google Gemma Open-Weights • Deep Obsidian Glass
        </p>
      </div>

      {/* ==================================================================== */}
      {/* 4. RIGHT CONTEXT PANEL                                               */}
      {/* ==================================================================== */}
      <div 
        className={`${
          contextPanelOpen ? 'w-full sm:w-96' : 'w-0'
        } transition-all duration-300 ease-in-out shrink-0 h-full context-drawer-glass flex flex-col justify-between overflow-hidden relative z-40 border-l border-white/10`}
      >
        <div className="flex flex-col h-full p-4 space-y-4">
          
          {/* Drawer Header & Tab Selector */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-1 bg-[#070709] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setContextTab('device')}
                className={`btn-premium px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  contextTab === 'device'
                    ? 'bg-[#3B0A6B] text-[#FFFFFF] border border-white/20 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                    : 'text-[#a1a1aa] hover:text-[#ffffff] hover:border-white/10'
                }`}
              >
                Device Specs
              </button>
              <button
                onClick={() => setContextTab('skills')}
                className={`btn-premium px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  contextTab === 'skills'
                    ? 'bg-[#3B0A6B] text-[#FFFFFF] border border-white/20 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                    : 'text-[#a1a1aa] hover:text-[#ffffff] hover:border-white/10'
                }`}
              >
                Skills ({skills.length})
              </button>
              <button
                onClick={() => setContextTab('project')}
                className={`btn-premium px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  contextTab === 'project'
                    ? 'bg-[#3B0A6B] text-[#FFFFFF] border border-white/20 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                    : 'text-[#a1a1aa] hover:text-[#ffffff] hover:border-white/10'
                }`}
              >
                Team & Pods
              </button>
            </div>

            <button
              onClick={() => setContextPanelOpen(false)}
              className="btn-premium text-[#71717a] hover:text-[#ffffff] p-1.5 rounded-xl hover:bg-[#3B0A6B]/30 transition-colors border border-transparent hover:border-white/10"
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
                  <span className="font-semibold text-[#ffffff] tracking-tight flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-[#ffffff]" />
                    <span>Host Compute Environment</span>
                  </span>
                  <button
                    onClick={() => fetchHealth()}
                    disabled={loadingHealth}
                    className="btn-premium p-1.5 rounded-lg text-[#71717a] hover:text-[#ffffff] hover:bg-[#3B0A6B]/30 transition-colors border border-transparent hover:border-white/10"
                    title="Refresh Telemetry"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin text-[#ffffff]' : ''}`} />
                  </button>
                </div>

                {/* GPU Card */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] card-interactive spotlight-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold text-[#71717a] tracking-wider font-mono">GPU Device</span>
                    <span className="text-[10px] font-mono text-[#ffffff] bg-[#3B0A6B]/30 px-2 py-0.5 rounded-full border border-white/20 shadow-[0_0_8px_rgba(0,229,255,0.2)]">
                      CUDA 12.6
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#ffffff]">
                    {gpuInfo?.device_name || 'NVIDIA GeForce RTX 2050'}
                  </p>
                  
                  {/* VRAM Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#a1a1aa] font-mono">
                      <span>Available VRAM:</span>
                      <span className="text-[#ffffff] font-semibold">{gpuInfo?.available_vram_mb || 4095.5} MB</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#3B0A6B]/30 overflow-hidden border border-white/10">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#3B0A6B] to-[#00E5FF]"
                        style={{ width: `${Math.max(4, Math.min(100, ((gpuInfo?.allocated_vram_mb || 0) / (gpuInfo?.max_vram_mb || 4095.5)) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* CPU & Memory Card */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] card-interactive spotlight-card">
                  <span className="text-[10px] uppercase font-semibold text-[#71717a] tracking-wider block font-mono">Processor & Memory</span>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-[#070709] rounded-xl border border-white/10">
                      <span className="text-[#71717a] block text-[9px] uppercase font-mono">CPU Cores</span>
                      <span className="font-semibold text-[#ffffff] font-mono">{cpuInfo?.cores || 12} Logical</span>
                    </div>
                    <div className="p-2.5 bg-[#070709] rounded-xl border border-white/10">
                      <span className="text-[#71717a] block text-[9px] uppercase font-mono">RAM Total</span>
                      <span className="font-semibold text-[#ffffff] font-mono">{ramInfo?.total_gb || 7.73} GB</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#070709] rounded-xl border border-white/10 space-y-1">
                    <div className="flex justify-between text-[10px] text-[#a1a1aa] font-mono">
                      <span>RAM Utilization:</span>
                      <span className="text-[#ffffff] font-semibold">{ramInfo?.percent_used || 90}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#3B0A6B]/30 overflow-hidden border border-white/10">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#3B0A6B] to-[#00E5FF]" 
                        style={{ width: `${ramInfo?.percent_used || 90}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Software Stack */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-[11px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] card-interactive spotlight-card">
                  <span className="text-[10px] uppercase font-semibold text-[#71717a] tracking-wider block font-mono">Software Environment</span>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-[#71717a]">OS:</span>
                    <span className="font-mono text-[#ffffff]">{deviceConfig?.os || 'Windows 11'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-[#71717a]">Python:</span>
                    <span className="font-mono text-[#ffffff]">{health?.python_version || '3.13.14'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-[#71717a]">PyTorch:</span>
                    <span className="font-mono text-[#ffffff]">{health?.torch_version || '2.14.1+cu126'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#71717a]">Model Engine:</span>
                    <span className="font-medium text-[#ffffff]">Google Gemma 2 (2B/9B)</span>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: AGENT SKILLS HUB (SKILL.md) */}
            {contextTab === 'skills' && (
              <div className="space-y-4 animate-slide-up">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#ffffff] tracking-tight flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-[#ffffff]" />
                    <span>Agent Skills ({skills.length})</span>
                  </span>
                    <button
                      type="button"
                      onClick={() => setShowSkillModal(!showSkillModal)}
                      className="btn-premium px-2 py-0.5 rounded-lg bg-[#3B0A6B]/30 hover:bg-[#00E5FF]/20 text-[#ffffff] border border-white/10 hover:border-white/20 flex items-center space-x-1 text-[11px]"
                    >
                      <Plus className="w-3 h-3 text-[#ffffff]" />
                      <span>New Skill</span>
                    </button>
                  </div>
                  
                  {/* Skill Search Input */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => setSkillSearch(e.target.value)}
                      placeholder="Search skills..."
                      className="w-full bg-[#070709] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#ffffff] placeholder-[#71717a] focus:outline-none focus:border-[#00E5FF] focus:shadow-[0_0_12px_rgba(0,229,255,0.25)] transition-all hover:border-white/20"
                    />
                  </div>
                </div>

                  {/* Custom Skill Authoring Modal / Form */}
                  {showSkillModal && (
                    <form onSubmit={handleCreateSkill} className="p-3.5 rounded-2xl bg-[#09090b] border border-white/20 space-y-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.6)] animate-slide-up">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                        <span className="text-xs font-semibold text-[#ffffff] flex items-center space-x-1">
                          <PlusCircle className="w-3.5 h-3.5 text-[#ffffff]" />
                          <span>Author New SKILL.md</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowSkillModal(false)}
                          className="text-[#71717a] hover:text-[#ffffff]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] text-[#71717a] uppercase font-bold block mb-1">Skill Name (Slug)</label>
                        <input
                          type="text"
                          required
                          value={newSkillData.name}
                          onChange={(e) => setNewSkillData({ ...newSkillData, name: e.target.value })}
                          placeholder="e.g. security-auditor"
                          className="w-full bg-[#070709] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-[#ffffff] focus:outline-none focus:border-[#00E5FF]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#71717a] uppercase font-bold block mb-1">Description</label>
                        <input
                          type="text"
                          required
                          value={newSkillData.description}
                          onChange={(e) => setNewSkillData({ ...newSkillData, description: e.target.value })}
                          placeholder="Single sentence purpose for agent discovery"
                          className="w-full bg-[#070709] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-[#ffffff] focus:outline-none focus:border-[#00E5FF]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#71717a] uppercase font-bold block mb-1">Tags (comma separated)</label>
                        <input
                          type="text"
                          value={newSkillData.tags}
                          onChange={(e) => setNewSkillData({ ...newSkillData, tags: e.target.value })}
                          placeholder="e.g. audit, security, python"
                          className="w-full bg-[#070709] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-[#ffffff] focus:outline-none focus:border-[#00E5FF]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#71717a] uppercase font-bold block mb-1">Operational Instructions (Markdown)</label>
                        <textarea
                          rows={4}
                          required
                          value={newSkillData.instructions}
                          onChange={(e) => setNewSkillData({ ...newSkillData, instructions: e.target.value })}
                          placeholder={"## Instructions\n1. Analyze codebase vulnerability points...\n2. Return structured audit report..."}
                          className="w-full bg-[#070709] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-[#ffffff] focus:outline-none focus:border-[#00E5FF] resize-none font-mono"
                        />
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowSkillModal(false)}
                          className="btn-premium px-2.5 py-1 rounded-lg border border-white/10 text-[#a1a1aa] text-xs hover:bg-white/5"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingSkill}
                          className="btn-premium px-3 py-1 rounded-lg bg-[#00E5FF] hover:bg-[#33ebff] text-[#070709] font-semibold text-xs shadow-[0_0_12px_rgba(0,229,255,0.4)] disabled:opacity-50"
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
                      className={`p-3 rounded-xl border cursor-pointer transition-all card-interactive spotlight-card ${
                        selectedSkill?.name === s.name
                          ? 'bg-[#3B0A6B]/40 border-white/20 text-[#ffffff] shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                          : 'bg-[#09090b] border-white/10 hover:border-white/20 hover:bg-[#3B0A6B]/20 text-[#a1a1aa]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-semibold text-xs text-[#ffffff]">{s.name}</span>
                        <span className="text-[9px] font-mono bg-[#3B0A6B]/30 border border-white/10 px-1.5 py-0.2 rounded-full text-[#ffffff]">
                          v{s.version}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#a1a1aa] line-clamp-2 leading-relaxed">{s.description}</p>
                    </div>
                  ))}
                </div>

                {/* Selected Skill Preview */}
                {selectedSkill && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] card-interactive spotlight-card">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-xs text-[#ffffff]">{selectedSkill.name}/SKILL.md</span>
                      <button
                        onClick={() => {
                          setPromptInput(`Please execute the ${selectedSkill.name} skill for our task.`);
                          setContextPanelOpen(false);
                        }}
                        className="btn-premium sheen-travel text-[10px] px-2.5 py-1 rounded-lg bg-[#00E5FF] hover:bg-[#33ebff] text-[#070709] font-semibold shadow-[0_0_12px_rgba(0,229,255,0.3)] transition-all"
                      >
                        Use in Chat
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono text-[#ffffff] max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed p-2.5 bg-[#070709] rounded-xl border border-white/10 custom-scrollbar">
                      {selectedSkill.instructions || 'Loading instructions...'}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TEAM & PODS */}
            {contextTab === 'project' && (
              <div className="space-y-4 animate-slide-up">
                <span className="font-semibold text-[#ffffff] tracking-tight flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#ffffff]" />
                  <span>4-Person Hackathon Engineering Pods</span>
                </span>

                {/* Pod 1 */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] card-interactive spotlight-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#ffffff] font-mono">Pod 1: Frontend Squad</span>
                    <span className="text-[9px] font-mono bg-[#3B0A6B]/30 text-[#ffffff] px-2 py-0.5 rounded-full border border-white/20 shadow-[0_0_8px_rgba(0,229,255,0.15)]">
                      feature/frontend
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="text-[#ffffff]">@vedxnt-b <span className="text-[#71717a]">(Lead)</span></div>
                    <div className="text-[#ffffff]">@piyushmatodepatil <span className="text-[#71717a]">(UI/UX)</span></div>
                  </div>
                </div>

                {/* Pod 2 */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] card-interactive spotlight-card">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#ffffff] font-mono">Pod 2: Backend & AI Engine</span>
                    <span className="text-[9px] font-mono bg-[#3B0A6B]/30 text-[#ffffff] px-2 py-0.5 rounded-full border border-white/20 shadow-[0_0_8px_rgba(0,229,255,0.15)]">
                      feature/backend-ai
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono">
                    <div className="text-[#ffffff]">@gunwantjawle-ux <span className="text-[#71717a]">(Systems)</span></div>
                    <div className="text-[#ffffff]">@Abhishekdabi33 <span className="text-[#71717a]">(AI Engine)</span></div>
                  </div>
                </div>

                {/* Hackathon Core Stack */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-[11px] shadow-[0_4px_20px_rgba(0,0,0,0.5)] card-interactive spotlight-card">
                  <span className="text-[10px] uppercase font-semibold text-[#71717a] tracking-wider block font-mono">Hackathon Core Stack</span>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-[#71717a]">Model Engine:</span>
                    <span className="text-[#ffffff]">Google Gemma 2 (2B / 9B)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-[#71717a]">Agent Harness:</span>
                    <span className="text-[#ffffff]">Nous Hermes ReAct Loop</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-[#71717a]">Agent Skills:</span>
                    <span className="text-[#ffffff]">SKILL.md Open Standard</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#71717a]">GPU Acceleration:</span>
                    <span className="text-[#ffffff] font-semibold">RTX 2050 (4GB) + Kaggle T4</span>
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
