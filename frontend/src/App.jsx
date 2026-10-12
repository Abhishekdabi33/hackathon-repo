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
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [inputText, setInputText] = useState('Hackathon prototype running on local GPU acceleration!');
  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [activeTab, setActiveTab] = useState('demo');

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

  useEffect(() => {
    fetchHealth();
  }, []);

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    setPrediction(null);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_text: inputText })
      });
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      setPrediction({ status: 'error', detail: err.message });
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Hackathon AI Platform</h1>
              <p className="text-xs text-slate-400">Team Collaboration & Full-Stack Deep Learning</p>
            </div>
          </div>

          {/* System Status Pill */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={fetchHealth} 
              disabled={loadingHealth}
              className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800"
              title="Refresh Health"
            >
              <RefreshCw className={`w-4 h-4 ${loadingHealth ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-700 bg-slate-800/80">
              <span className={`w-2 h-2 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{health?.status === 'healthy' ? 'Backend Ready' : 'Connecting...'}</span>
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
            onClick={() => setActiveTab('demo')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'demo'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            AI Inference Console
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'team'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            4-Person Team Roles & Milestones
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'architecture'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            System Architecture
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'demo' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Inference Testing */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span>Real-Time Inference Playground</span>
                </h2>
                <p className="text-sm text-slate-400 mb-6">
                  Test backend AI predictions with low-latency GPU execution.
                </p>

                <form onSubmit={handlePredict} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Input Prompt / Data Payload
                    </label>
                    <textarea
                      rows={4}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Enter text to analyze..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={predicting}
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
                    >
                      {predicting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing on GPU...</span>
                        </>
                      ) : (
                        <>
                          <span>Execute Prediction</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <span className="text-xs text-slate-500">
                      Endpoint: <code className="text-slate-400">POST /api/predict</code>
                    </span>
                  </div>
                </form>

                {/* Prediction Output */}
                {prediction && (
                  <div className="mt-6 border-t border-slate-800/80 pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Inference Output
                      </span>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-slate-400">
                          Latency: <strong className="text-emerald-400">{prediction.latency_ms || 0} ms</strong>
                        </span>
                        <span className="text-slate-600">|</span>
                        <span className="text-slate-400">
                          Device: <strong className="text-cyan-400">{prediction.device_used?.toUpperCase() || 'CPU'}</strong>
                        </span>
                      </div>
                    </div>
                    <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-cyan-300 overflow-x-auto">
                      {JSON.stringify(prediction, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Live Hardware & Telemetry */}
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-semibold text-white flex items-center space-x-2 mb-4">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <span>Hardware Telemetry</span>
                </h3>

                <div className="space-y-4">
                  <div className="p-3 bg-slate-950/70 border border-slate-800/60 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">NVIDIA GPU</span>
                    <p className="text-sm font-semibold text-white">
                      {health?.gpu?.device_name || 'NVIDIA Quadro P2000 (Detected)'}
                    </p>
                    <div className="mt-2 text-xs text-slate-400 flex justify-between">
                      <span>VRAM Total:</span>
                      <span className="text-slate-200">{health?.gpu?.max_vram_mb || '4096'} MB</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800/60 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Compute Backend</span>
                    <p className="text-sm font-semibold text-cyan-400">
                      PyTorch CUDA 12.8 / 12.4
                    </p>
                    <div className="mt-2 text-xs text-slate-400 flex justify-between">
                      <span>Python Version:</span>
                      <span className="text-slate-200">{health?.python_version || '3.12 (uv)'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 border border-slate-800/60 rounded-xl">
                    <span className="text-xs text-slate-400 block mb-1">Local Server</span>
                    <p className="text-sm font-semibold text-emerald-400">FastAPI + Uvicorn</p>
                    <div className="mt-2 text-xs text-slate-400 flex justify-between">
                      <span>Port:</span>
                      <span className="text-slate-200">8000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>4-Person Hackathon Team Division</span>
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Optimal role division to maximize output and win judging criteria.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-5 bg-slate-950/70 border border-blue-500/30 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mb-3">
                    01
                  </div>
                  <h3 className="font-semibold text-white">Frontend Lead</h3>
                  <p className="text-xs text-cyan-400 font-mono mt-0.5 mb-3">Branch: feature/frontend</p>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                    <li>Build sleek UI in React + Tailwind</li>
                    <li>Connect API endpoints</li>
                    <li>Responsive mobile / desktop views</li>
                    <li>Polish UX and visual wow factor</li>
                  </ul>
                </div>

                <div className="p-5 bg-slate-950/70 border border-emerald-500/30 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-3">
                    02
                  </div>
                  <h3 className="font-semibold text-white">Backend & API Lead</h3>
                  <p className="text-xs text-emerald-400 font-mono mt-0.5 mb-3">Branch: feature/backend</p>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                    <li>FastAPI routing & schemas</li>
                    <li>Database / state management</li>
                    <li>Authentication & error handling</li>
                    <li>Dockerization & deployment</li>
                  </ul>
                </div>

                <div className="p-5 bg-slate-950/70 border border-purple-500/30 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-3">
                    03
                  </div>
                  <h3 className="font-semibold text-white">AI / ML Engineer</h3>
                  <p className="text-xs text-purple-400 font-mono mt-0.5 mb-3">Branch: feature/ai-model</p>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                    <li>Dataset preparation & cleaning</li>
                    <li>PyTorch training / fine-tuning</li>
                    <li>Cloud GPU scale (Colab / Kaggle)</li>
                    <li>Inference latency optimization</li>
                  </ul>
                </div>

                <div className="p-5 bg-slate-950/70 border border-amber-500/30 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-3">
                    04
                  </div>
                  <h3 className="font-semibold text-white">Product & Pitch Lead</h3>
                  <p className="text-xs text-amber-400 font-mono mt-0.5 mb-3">Branch: feature/docs-demo</p>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                    <li>Pitch deck & problem statement</li>
                    <li>3-minute demo video / live script</li>
                    <li>End-to-end testing with judges' mindset</li>
                    <li>README documentation & slides</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2 mb-4">
              <Server className="w-5 h-5 text-blue-400" />
              <span>Full-Stack Architecture & Repository Layout</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Frontend (`/frontend`)</h4>
                <p className="text-xs text-slate-400">
                  React 19 + Vite + Tailwind CSS + Lucide Icons. Proxies requests seamlessly to backend on port 8000.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="text-sm font-semibold text-emerald-400 mb-2">Backend (`/backend`)</h4>
                <p className="text-xs text-slate-400">
                  FastAPI + Pydantic v2. Auto-generated Swagger docs at <code className="text-slate-300">/docs</code>. Health checks & CUDA telemetry.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">AI Engine (`/ai_engine`)</h4>
                <p className="text-xs text-slate-400">
                  PyTorch training pipeline (`train.py`), inference engine (`inference.py`), and Google Colab cloud GPU runner.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
