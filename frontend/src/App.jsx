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
  FileCode,
  Upload,
  FileText,
  Download,
  Copy,
  Check,
  Plus,
  X,
  FileUp,
  Image as ImageIcon,
  Printer,
  FileDown,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// ==============================================================================
// RICH MARKDOWN & MULTIMODAL ARTIFACT RENDERER COMPONENT
// ==============================================================================
function MarkdownAnswerView({ content }) {
  if (!content) return null;

  const renderInlineStyles = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const renderFormattedText = (raw) => {
    const lines = raw.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer = [];

    lines.forEach((line, idx) => {
      // Code blocks ```
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.trim().replace('```', '') || 'code';
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          const fullCode = codeBuffer.join('\n');
          elements.push(
            <div key={`code-${idx}`} className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                <span className="font-mono uppercase text-cyan-400 font-semibold">{codeLanguage}</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(fullCode)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] transition-colors"
                >
                  Copy Code
                </button>
              </div>
              <pre className="p-3.5 text-xs text-slate-200 font-mono overflow-x-auto whitespace-pre leading-relaxed">
                {fullCode}
              </pre>
            </div>
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Check for standalone markdown images: ![alt](url)
      const imgMatch = line.match(/^!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)$/);
      if (imgMatch) {
        const alt = imgMatch[1];
        const src = imgMatch[2];
        elements.push(
          <div key={`img-${idx}`} className="my-4 rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 border-b border-cyan-900/50 text-xs">
              <span className="flex items-center space-x-2 text-cyan-300 font-semibold">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>AI Generated Visual Asset: {alt || 'Render'}</span>
              </span>
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                download="ai_visual_asset.png"
                className="flex items-center space-x-1.5 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-xs font-medium transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download High-Res</span>
              </a>
            </div>
            <div className="p-3 flex justify-center bg-slate-950/90">
              <img 
                src={src} 
                alt={alt} 
                className="max-h-96 w-auto rounded-lg object-contain shadow-xl hover:scale-[1.01] transition-transform" 
                loading="lazy"
              />
            </div>
          </div>
        );
        return;
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(<h3 key={idx} className="text-base font-bold text-cyan-300 mt-3.5 mb-1.5">{line.replace('### ', '')}</h3>);
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={idx} className="text-lg font-bold text-white border-b border-slate-800 pb-1 mt-4 mb-2">{line.replace('## ', '')}</h2>);
        return;
      }
      if (line.startsWith('# ')) {
        elements.push(<h1 key={idx} className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mt-4 mb-2">{line.replace('# ', '')}</h1>);
        return;
      }

      // Bullet points
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const bulletText = line.trim().substring(2);
        elements.push(
          <div key={idx} className="flex items-start space-x-2.5 my-1 text-slate-200">
            <span className="text-cyan-400 mt-1 text-xs">◆</span>
            <span>{renderInlineStyles(bulletText)}</span>
          </div>
        );
        return;
      }

      // Empty line spacer
      if (!line.trim()) {
        elements.push(<div key={idx} className="h-1.5" />);
        return;
      }

      // Standard text line
      elements.push(
        <p key={idx} className="text-sm text-slate-200 leading-relaxed my-1">
          {renderInlineStyles(line)}
        </p>
      );
    });

    return elements;
  };

  return <div className="space-y-1">{renderFormattedText(content)}</div>;
}

export default function App() {
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [activeTab, setActiveTab] = useState('agent');
  
  // Agent State
  const [agentPrompt, setAgentPrompt] = useState('Analyze our database statistics and check GPU status.');
  const [agentResponse, setAgentResponse] = useState(null);
  const [runningAgent, setRunningAgent] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [copied, setCopied] = useState(false);

  // Skills State
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [loadingSkills, setLoadingSkills] = useState(false);

  // Custom Skill Modal State
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');
  const [newSkillInstructions, setNewSkillInstructions] = useState('');
  const [creatingSkill, setCreatingSkill] = useState(false);

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

  // Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      setAttachedFile({
        name: file.name,
        size: file.size,
        content: content
      });
    };
    reader.readAsText(file);
  };

  // Run Hermes Agent
  const handleRunAgent = async (e) => {
    e.preventDefault();
    setRunningAgent(true);
    setAgentResponse(null);
    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: agentPrompt, 
          max_steps: 3,
          file_name: attachedFile?.name,
          file_content: attachedFile?.content
        })
      });
      const data = await res.json();
      setAgentResponse(data);
    } catch (err) {
      setAgentResponse({ status: 'error', detail: err.message });
    } finally {
      setRunningAgent(false);
    }
  };

  // Copy to Clipboard
  const handleCopyAnswer = () => {
    if (!agentResponse?.final_answer) return;
    navigator.clipboard.writeText(agentResponse.final_answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Markdown Report
  const handleDownloadReport = () => {
    if (!agentResponse) return;
    const report = `# Hackathon AI Agent Report\n\n**Query:** ${agentResponse.query}\n**Model:** ${agentResponse.model_engine}\n**Execution Time:** ${agentResponse.duration_ms} ms\n\n## Agent Steps\n${agentResponse.steps?.map(s => `- **Thought:** ${s.thought}\n  - **Action:** ${s.action} (${s.action_input})\n  - **Observation:** ${s.observation}`).join('\n')}\n\n## Final Synthesis\n${agentResponse.final_answer}\n`;
    
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent_report_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download PDF Report via Styled Browser Print / Save
  const handleDownloadPDF = () => {
    if (!agentResponse) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups in your browser to export the PDF report.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Hackathon AI Agent Executive Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #0f172a; padding: 40px; max-width: 850px; margin: auto; }
          .header { border-bottom: 3px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; }
          .pill { display: inline-block; padding: 4px 10px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 11px; font-weight: 700; margin-right: 6px; }
          .meta-box { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px; }
          .step-card { background: #f8fafc; border-left: 4px solid #0284c7; border-radius: 0 8px 8px 0; padding: 12px 16px; margin-bottom: 12px; font-size: 13px; }
          .final-card { background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 20px; margin-top: 24px; }
          pre { background: #0f172a; color: #f8fafc; padding: 14px; border-radius: 8px; font-size: 12px; overflow-x: auto; }
          img { max-width: 100%; border-radius: 8px; margin: 12px 0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0 0 8px 0; font-size: 22px; color: #0f172a;">Autonomous AI Agent Executive Report</h1>
          <div>
            <span class="pill">Google Gemma</span>
            <span class="pill">Nous Hermes Agent</span>
            <span class="pill">SKILL.md Standard</span>
            <span class="pill">Kaggle 2x Tesla T4 Cloud GPU</span>
          </div>
        </div>

        <div class="meta-box">
          <div><strong>Query:</strong> ${agentResponse.query}</div>
          <div><strong>Model Engine:</strong> ${agentResponse.model_engine || 'gemma-kaggle-t4-cloud'}</div>
          <div><strong>Latency:</strong> ${agentResponse.duration_ms || 0} ms</div>
          <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
        </div>

        <h3 style="color: #334155; font-size: 15px; margin-top: 20px;">Reasoning Trace:</h3>
        ${(agentResponse.steps || []).map(s => `
          <div class="step-card">
            <div><strong>Thought:</strong> ${s.thought}</div>
            ${s.action ? `<div><strong>Action:</strong> ${s.action} (Input: ${s.action_input || 'None'})</div>` : ''}
            ${s.observation ? `<div><strong>Observation:</strong> ${s.observation}</div>` : ''}
          </div>
        `).join('')}

        <div class="final-card">
          <h3 style="margin-top: 0; color: #166534; font-size: 15px;">Final Agent Output:</h3>
          <div style="white-space: pre-wrap; font-size: 14px;">${agentResponse.final_answer.replace(/!\[(.*?)\]\((.*?)\)/g, '<br/><img src="$2" alt="$1" /><br/>')}</div>
        </div>

        <div style="margin-top: 30px; text-align: center;" class="no-print">
          <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">Save as PDF / Print</button>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Download JSON Telemetry
  const handleDownloadJSON = () => {
    if (!agentResponse) return;
    const blob = new Blob([JSON.stringify(agentResponse, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent_telemetry_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Create Custom Skill on the Fly
  const handleCreateSkillSubmit = async (e) => {
    e.preventDefault();
    if (!newSkillName || !newSkillDesc || !newSkillInstructions) return;
    setCreatingSkill(true);
    try {
      const res = await fetch('/api/skills/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSkillName,
          description: newSkillDesc,
          instructions: newSkillInstructions,
          tags: ['hackathon-custom']
        })
      });
      if (res.ok) {
        await fetchSkills();
        setShowSkillModal(false);
        setNewSkillName('');
        setNewSkillDesc('');
        setNewSkillInstructions('');
      }
    } catch (err) {
      console.error('Error creating skill:', err);
    } finally {
      setCreatingSkill(false);
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
                  Universal Hackathon Engine
                </span>
              </h1>
              <p className="text-xs text-slate-400">Google Gemma • Nous Hermes Agent • SKILL.md Standard</p>
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
            <span>Team Pods & Roles</span>
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
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-cyan-400" />
                    <span>Hermes Autonomous Agent Execution Loop</span>
                  </h2>
                </div>
                <p className="text-sm text-slate-400 mb-6">
                  Universal multi-modal agent loop. Upload documents, datasets, or code to reason with Google Gemma.
                </p>

                <form onSubmit={handleRunAgent} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Agent Goal / Instructions
                      </label>
                      {/* File Upload Trigger */}
                      <label className="cursor-pointer text-xs flex items-center space-x-1.5 text-cyan-400 hover:text-cyan-300 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Attach File (CSV, JSON, Code, Docs)</span>
                        <input
                          type="file"
                          accept=".csv,.json,.txt,.py,.js,.jsx,.md,.sql,.log"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <textarea
                      rows={3}
                      value={agentPrompt}
                      onChange={(e) => setAgentPrompt(e.target.value)}
                      placeholder="e.g. Ingest the attached file and use our data-analyst skill to summarize outliers..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />

                    {/* Attached File Preview Badge */}
                    {attachedFile && (
                      <div className="mt-2.5 flex items-center justify-between p-2.5 bg-cyan-950/30 border border-cyan-800/40 rounded-xl text-xs text-cyan-300">
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="font-mono font-medium truncate">{attachedFile.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({Math.round(attachedFile.size / 1024)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachedFile(null)}
                          className="text-slate-400 hover:text-red-400 p-1 transition-colors"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>Quick Prompts:</span>
                      <button 
                        type="button" 
                        onClick={() => setAgentPrompt("Generate an image of a futuristic AI hospital dashboard with glowing vitals in 8k cinematic lighting")} 
                        className="px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 hover:bg-cyan-900 transition-colors flex items-center space-x-1"
                      >
                        <ImageIcon className="w-3 h-3 text-cyan-400" />
                        <span>AI Image Gen</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setAgentPrompt("Draw a flowchart of our autonomous agent platform architecture and data flow")} 
                        className="px-2.5 py-1 rounded-lg bg-blue-950/70 border border-blue-800/60 text-blue-300 hover:bg-blue-900 transition-colors"
                      >
                        <span>Flowchart Diagram</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setAgentPrompt("Calculate 250 * 18.5 and check system GPU telemetry")} 
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors"
                      >
                        <span>Math + Telemetry</span>
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
                        Latency: {agentResponse.duration_ms || 0} ms • Engine: {agentResponse.model_engine || 'Gemma'}
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

                    {/* Final Answer Card with Multimodal Outputs & Rich Export Controls */}
                    <div className="p-6 bg-gradient-to-br from-blue-950/40 via-slate-950 to-slate-950 border border-blue-900/50 rounded-2xl space-y-4 shadow-2xl">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-900/40 pb-3">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                            Final Agent Output (Google Gemma + Hermes)
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={handleCopyAnswer}
                            className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center space-x-1.5 transition-colors"
                            title="Copy output text"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={handleDownloadPDF}
                            className="px-2.5 py-1 text-xs rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 flex items-center space-x-1.5 transition-colors"
                            title="Save / Print PDF Report"
                          >
                            <Printer className="w-3.5 h-3.5 text-rose-400" />
                            <span>Export PDF</span>
                          </button>
                          <button
                            onClick={handleDownloadReport}
                            className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center space-x-1.5 transition-colors"
                            title="Export Markdown Document"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-400" />
                            <span>Export .md</span>
                          </button>
                          <button
                            onClick={handleDownloadJSON}
                            className="px-2.5 py-1 text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center space-x-1.5 transition-colors"
                            title="Export JSON Telemetry & Steps"
                          >
                            <FileDown className="w-3.5 h-3.5 text-slate-400" />
                            <span>JSON</span>
                          </button>
                        </div>
                      </div>

                      {/* Render Formatted Markdown, Code Blocks, and AI Images */}
                      <div className="text-sm text-slate-200 leading-relaxed pt-1">
                        <MarkdownAnswerView content={agentResponse.final_answer} />
                      </div>
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
                    <span className="text-xs text-slate-400 block mb-1">Local Device</span>
                    <p className="text-sm font-semibold text-white">
                      {health?.gpu?.device_name || 'NVIDIA Quadro P2000'}
                    </p>
                    <span className="text-xs text-emerald-400">CUDA 12.4 Acceleration</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Cloud GPU Engine</span>
                    <p className="text-sm font-semibold text-cyan-400">Kaggle 2x Tesla T4 (32GB)</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                    <Wrench className="w-5 h-5 text-purple-400" />
                    <span>Active Skills ({skills.length})</span>
                  </h3>
                  <button
                    onClick={() => setShowSkillModal(true)}
                    className="p-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                    title="Add Custom Skill"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

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
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                  <FileCode className="w-5 h-5 text-cyan-400" />
                  <span>Discovered Skills ({skills.length})</span>
                </h3>
                <button
                  onClick={() => setShowSkillModal(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition-all flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Skill</span>
                </button>
              </div>
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
                <h3 className="font-semibold text-white">Cloud GPU Acceleration</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Kaggle 2x Tesla T4 GPUs (32 GB VRAM) for cloud execution + local CUDA 12.4 acceleration.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 4-PERSON TEAM ROLES & SQUADS */}
        {activeTab === 'team' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Team Engineering Squads & Ownership</span>
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Divided into two focused cross-functional pairs: Frontend Squad and Backend & AI Engine Squad.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SQUAD 1: FRONTEND POD */}
              <div className="p-6 bg-slate-950 border border-blue-500/30 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Pod 1 • Frontend & UI/UX</span>
                  <span className="text-[10px] font-mono bg-blue-500/10 text-cyan-300 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    Branch: feature/frontend
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Frontend Engineering Squad</h3>
                
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-xs font-mono bg-slate-900 text-blue-400 px-2.5 py-1 rounded-lg border border-slate-800">
                    @vedxnt-b (Frontend Lead)
                  </span>
                  <span className="text-xs font-mono bg-slate-900 text-blue-400 px-2.5 py-1 rounded-lg border border-slate-800">
                    @piyushmatodepatil (UI/UX Lead)
                  </span>
                </div>

                <div className="pt-2 text-xs text-slate-400 space-y-2">
                  <p className="font-semibold text-slate-300">Deliverables & Responsibilities:</p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Build interactive React 19 + Tailwind CSS user interface</li>
                    <li>Real-time reasoning trace visualization (Thought ➔ Action ➔ Observation)</li>
                    <li>SKILL.md visual inspector with live raw YAML/Markdown view</li>
                    <li>Wire frontend API calls to backend (<code className="text-slate-300">/api/agent/chat</code>, <code className="text-slate-300">/api/skills</code>)</li>
                    <li>Ensure dark-mode responsiveness & high-impact visual design for judges</li>
                  </ul>
                </div>
              </div>

              {/* SQUAD 2: BACKEND & AI ENGINE POD */}
              <div className="p-6 bg-slate-950 border border-purple-500/30 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Pod 2 • Backend & AI Engine</span>
                  <span className="text-[10px] font-mono bg-purple-500/10 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    Branch: feature/backend-ai
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Backend & AI Engine Squad</h3>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-xs font-mono bg-slate-900 text-purple-400 px-2.5 py-1 rounded-lg border border-slate-800">
                    @gunwantjawle-ux (Backend Systems Lead)
                  </span>
                  <span className="text-xs font-mono bg-slate-900 text-purple-400 px-2.5 py-1 rounded-lg border border-slate-800">
                    @Abhishekdabi33 (AI Engine & Project Lead)
                  </span>
                </div>

                <div className="pt-2 text-xs text-slate-400 space-y-2">
                  <p className="font-semibold text-slate-300">Deliverables & Responsibilities:</p>
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Maintain FastAPI REST server routing, schemas & CORS</li>
                    <li>Autonomous Hermes Agent ReAct loop & tool execution engine</li>
                    <li>Google Gemma integration (Google AI Studio API + Kaggle 2x T4 GPUs)</li>
                    <li>Author domain-specific operational <code className="text-slate-300">SKILL.md</code> playbooks in <code className="text-slate-300">skills/</code></li>
                    <li>Overall repository sync, pitch deck & 3-minute demo video recording</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE CUSTOM SKILL MODAL (Instant Hackathon Adaptation) */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Create Custom SKILL.md Playbook</h3>
              </div>
              <button 
                onClick={() => setShowSkillModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSkillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Skill Identifier Name</label>
                <input
                  type="text"
                  placeholder="e.g. hackathon-advisor"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Short Description (For Discovery)</label>
                <input
                  type="text"
                  placeholder="e.g. Specialized playbook for auditing Hackathon problem requirements."
                  value={newSkillDesc}
                  onChange={(e) => setNewSkillDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Operational Instructions (Markdown Body)</label>
                <textarea
                  rows={6}
                  placeholder="# Operational Instructions&#10;1. Step one...&#10;2. Step two..."
                  value={newSkillInstructions}
                  onChange={(e) => setNewSkillInstructions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSkill}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {creatingSkill ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save & Index Skill</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
