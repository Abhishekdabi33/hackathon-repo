import React, { useState, useEffect } from 'react'
import { 
  Bot, 
  Cpu, 
  Send, 
  Sparkles, 
  Activity, 
  Users, 
  Code2, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react'

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello team! The hackathon AI backend is initialized and ready. Try sending a query below!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState({ online: false, gpu: 'Detecting...' })

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetch(`${API_URL}/api/v1/health`)
      .then(res => res.json())
      .then(data => {
        setApiStatus({
          online: data.status === 'healthy',
          gpu: data.hardware ? data.hardware.device : 'CPU'
        })
      })
      .catch(() => {
        setApiStatus({ online: false, gpu: 'Offline' })
      })
  }, [])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/v1/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || 'No response returned from backend.' 
      }])
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error connecting to backend (${API_URL}). Ensure FastAPI is running on port 8000.` 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0b0f19', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Navigation */}
      <header style={{ borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>Hackathon AI Workspace</h1>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Modular 4-Member Architecture</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: '9999px', backgroundColor: apiStatus.online ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${apiStatus.online ? '#22c55e40' : '#ef444440'}` }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: apiStatus.online ? '#22c55e' : '#ef4444' }}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: apiStatus.online ? '#4ade80' : '#f87171' }}>
              Backend: {apiStatus.online ? 'Online' : 'Offline'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', borderRadius: '9999px', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid #6366f140' }}>
            <Cpu size={14} color="#818cf8" />
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#a5b4fc' }}>
              GPU: {apiStatus.gpu}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        
        {/* Left Column: AI Interactive Playground */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={18} color="#818cf8" />
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Interactive AI Assistant & Playground</h2>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>FastAPI + PyTorch Pipeline</span>
          </div>

          {/* Chat Messages Container */}
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '380px', maxHeight: '500px' }}>
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' 
                }}
              >
                <div style={{ 
                  maxWidth: '80%', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '10px', 
                  backgroundColor: m.role === 'user' ? '#4f46e5' : '#1e293b',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                <Activity size={16} className="animate-spin" /> Generating response from model...
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} style={{ padding: '1rem', borderTop: '1px solid #1e293b', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or test model prompt..." 
              style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0b0f19', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', backgroundColor: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}
            >
              <Send size={16} /> Send
            </button>
          </form>
        </div>

        {/* Right Column: Team Roles & Quick Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 4-Person Team Roles Card */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Users size={18} color="#a855f7" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Team Member Allocation</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: '#1e293b' }}>
                <strong style={{ color: '#818cf8' }}>Member 1: Tech Lead</strong>
                <div style={{ color: '#94a3b8' }}>Full-Stack Integration, DevOps, Pitch</div>
              </div>
              <div style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: '#1e293b' }}>
                <strong style={{ color: '#38bdf8' }}>Member 2: Frontend Lead</strong>
                <div style={{ color: '#94a3b8' }}>UI/UX, Components, Responsive Design</div>
              </div>
              <div style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: '#1e293b' }}>
                <strong style={{ color: '#4ade80' }}>Member 3: Backend Lead</strong>
                <div style={{ color: '#94a3b8' }}>FastAPI, Database, Logic & Security</div>
              </div>
              <div style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', backgroundColor: '#1e293b' }}>
                <strong style={{ color: '#fb923c' }}>Member 4: AI & Data Specialist</strong>
                <div style={{ color: '#94a3b8' }}>Fine-Tuning, Ollama, Colab, Prompts</div>
              </div>
            </div>
          </div>

          {/* Quick Action Guides */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 600 }}>Quick Developer Links</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
              <li>
                <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ExternalLink size={14} /> FastAPI Swagger Docs
                </a>
              </li>
              <li>
                <span style={{ color: '#94a3b8' }}>Branching: <code>feat/&lt;name&gt;</code> &rarr; <code>dev</code></span>
              </li>
              <li>
                <span style={{ color: '#94a3b8' }}>Setup: <code>.\setup_workspace.bat</code></span>
              </li>
            </ul>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e293b', padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
        Built for Hackathon Excellence &bull; Fast, Modular & Team-Optimized
      </footer>

    </div>
  )
}
