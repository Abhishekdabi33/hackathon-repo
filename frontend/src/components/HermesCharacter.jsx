import React, { useState, useEffect, useRef } from 'react';

/**
 * HermesCharacter - A Living, Premium AI Agent Companion for Hermes
 * 
 * Visual Philosophy:
 * - Refined, minimal, futuristic entity matching the dark midnight/indigo/violet UI.
 * - Continuous organic transitions across all states (no abrupt sprite/geometry swaps).
 * - Prioritized Speaking State: Visually communicates live speech through conversational
 *   body nodding/cadence, organic eye micro-modulation, harmonic acoustic vocalizer waveform,
 *   and synchronized resonance glow.
 * 
 * States:
 * - 'idle'       : Peaceful spring float, serene resting gaze, natural blink cycle, soft aura.
 * - 'listening'  : Alert posture (+1.5px toward user), attentive eye dilation, electric cyan bloom.
 * - 'thinking'   : Inquisitive upward gaze glide, contemplative sway, luminous orbital halo.
 * - 'tool'       : Razor-sharp focus, high-energy telemetry ray, data flux.
 * - 'speaking'   : Conversational body cadence, warm eye engagement, undulating acoustic vocalizer ribbon, voice resonance ripples.
 */
export default function HermesCharacter({
  state = 'idle',
  size = 'hero',
  interactive = true,
  showStatusPill = false,
  className = ''
}) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPoked, setIsPoked] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Natural Blinking Cycle (every 3.8 to 5.5 seconds)
  useEffect(() => {
    let blinkTimer;
    let unblinkTimer;

    const scheduleBlink = () => {
      const delay = Math.random() * 2000 + 3800;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        unblinkTimer = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150);
      }, delay);
    };

    scheduleBlink();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(unblinkTimer);
    };
  }, []);

  // Subtle Gaze Tracking on Desktop Hero Size
  const handleMouseMove = (e) => {
    if (!interactive || size !== 'hero' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Smooth, restrained max 3px gaze offset
    const dx = Math.max(-3, Math.min(3, (e.clientX - centerX) / 30));
    const dy = Math.max(-2.5, Math.min(2.5, (e.clientY - centerY) / 30));
    setMouseOffset({ x: dx, y: dy });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // Click/Poke Interaction: Hermes acknowledges with a gentle bounce & speaking pulse
  const handlePoke = () => {
    if (!interactive) return;
    setIsPoked(true);
    setTimeout(() => setIsPoked(false), 1200);
  };

  // Effective State
  const activeState = isPoked ? 'speaking' : state;

  // Status Labels for Optional Floating Pill
  const statusLabels = {
    idle: 'Hermes Online',
    listening: 'Listening...',
    thinking: 'Reasoning & Planning...',
    tool: 'Invoking Agent Tools...',
    speaking: 'Speaking...'
  };

  // State Theme Configurations (Seamlessly Cohesive with Midnight/Indigo/Violet UI)
  const stateThemes = {
    idle: {
      aura: 'from-indigo-600/25 via-violet-600/15 to-transparent',
      led: '#38bdf8',
      eyeGrad: 'url(#eyeGradCyan)',
      filterGlow: 'url(#cyanGlow)',
      statusBadge: 'text-indigo-300 border-indigo-500/20 bg-indigo-500/10',
      gazeX: mouseOffset.x,
      gazeY: mouseOffset.y,
      eyeScale: 'scale(1)',
      bodyAnim: 'animate-hermes-float'
    },
    listening: {
      aura: 'from-cyan-500/30 via-indigo-600/20 to-transparent',
      led: '#22d3ee',
      eyeGrad: 'url(#eyeGradCyan)',
      filterGlow: 'url(#cyanGlow)',
      statusBadge: 'text-cyan-300 border-cyan-500/25 bg-cyan-500/10',
      gazeX: 0,
      gazeY: 1,
      eyeScale: 'scale(1.08)',
      bodyAnim: 'animate-hermes-float'
    },
    thinking: {
      aura: 'from-violet-500/35 via-indigo-600/25 to-transparent',
      led: '#c084fc',
      eyeGrad: 'url(#eyeGradViolet)',
      filterGlow: 'url(#violetGlow)',
      statusBadge: 'text-violet-300 border-violet-500/25 bg-violet-500/10',
      gazeX: 2.5,
      gazeY: -3,
      eyeScale: 'scale(0.98)',
      bodyAnim: 'animate-hermes-thinking-body'
    },
    tool: {
      aura: 'from-amber-500/30 via-indigo-600/25 to-transparent',
      led: '#fbbf24',
      eyeGrad: 'url(#eyeGradAmber)',
      filterGlow: 'url(#amberGlow)',
      statusBadge: 'text-amber-300 border-amber-500/25 bg-amber-500/10',
      gazeX: 0,
      gazeY: 0,
      eyeScale: 'scaleX(1.04) scaleY(0.93)',
      bodyAnim: 'animate-hermes-float'
    },
    speaking: {
      aura: 'from-indigo-500/40 via-sky-500/30 to-violet-500/20',
      led: '#38bdf8',
      eyeGrad: 'url(#eyeGradCyan)',
      filterGlow: 'url(#cyanGlow)',
      statusBadge: 'text-sky-300 border-sky-500/30 bg-sky-500/15',
      gazeX: 0,
      gazeY: 0.5,
      eyeScale: 'scale(1.03)',
      bodyAnim: 'animate-hermes-speech-body'
    }
  };

  const theme = stateThemes[activeState] || stateThemes.idle;

  // Sizing Styles
  const sizeStyles = {
    hero: {
      container: 'w-44 h-48 sm:w-48 sm:h-52',
      svgWidth: 190,
      svgHeight: 210,
      showAura: true,
      showShadow: true,
      showOrbits: true
    },
    md: {
      container: 'w-20 h-22 sm:w-22 sm:h-24',
      svgWidth: 90,
      svgHeight: 100,
      showAura: true,
      showShadow: false,
      showOrbits: false
    },
    sm: {
      container: 'w-9 h-9',
      svgWidth: 38,
      svgHeight: 40,
      showAura: false,
      showShadow: false,
      showOrbits: false
    }
  };

  const cfg = sizeStyles[size] || sizeStyles.hero;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handlePoke}
      className={`relative inline-flex flex-col items-center justify-center select-none ${cfg.container} ${interactive ? 'cursor-pointer' : ''} ${className}`}
      title={interactive ? "Hermes AI Companion - Click to interact" : "Hermes AI"}
    >
      {/* 1. Ambient Dynamic Lighting Halo */}
      {cfg.showAura && (
        <div 
          className={`absolute -inset-4 sm:-inset-6 rounded-full bg-gradient-to-tr ${theme.aura} blur-2xl transition-all duration-700 pointer-events-none opacity-80 ${activeState === 'speaking' ? 'animate-hermes-pulse' : ''}`} 
        />
      )}

      {/* 2. Character Model Body with Conversational Body Cadence */}
      <div 
        className={`relative w-full h-full flex items-center justify-center transition-all duration-500 ${theme.bodyAnim} ${isPoked ? 'scale-105 -translate-y-1' : ''}`}
      >
        
        {/* Luminous Orbital Ring: Thinking State */}
        {cfg.showOrbits && activeState === 'thinking' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500">
            <div 
              className="w-[125%] h-[58%] rounded-full border border-violet-400/30 animate-hermes-orbit-slow" 
              style={{ transform: 'rotateX(70deg)' }}
            >
              <div className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_#c084fc] -top-1 left-1/4 absolute" />
            </div>
          </div>
        )}

        {/* Counter-Rotating Dual Data Rings: Tool Execution */}
        {cfg.showOrbits && activeState === 'tool' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500">
            <div 
              className="w-[128%] h-[60%] rounded-full border border-amber-400/35 animate-hermes-orbit-fast" 
              style={{ transform: 'rotateX(68deg)' }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] -top-1 left-1/3 absolute" />
            </div>
            <div 
              className="w-[114%] h-[54%] rounded-full border border-cyan-400/25 animate-hermes-orbit-rev" 
              style={{ transform: 'rotateX(74deg) rotateY(20deg)' }}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] top-1/2 -right-1 absolute" />
            </div>
          </div>
        )}

        {/* Voice Resonance Waves in Speaking State */}
        {cfg.showAura && activeState === 'speaking' && (
          <div 
            className="absolute inset-3 rounded-full border border-indigo-400/20 animate-ping pointer-events-none" 
            style={{ animationDuration: '2.4s' }} 
          />
        )}

        {/* 3. High-Fidelity Vector AI Companion (ViewBox 0 0 200 220) */}
        <svg
          viewBox="0 0 200 220"
          className="w-full h-full drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Shell Body Gradient: Premium Dark Metallic Obsidian/Indigo */}
            <linearGradient id="hermesShellGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#1e2444" />
              <stop offset="45%" stopColor="#11162b" />
              <stop offset="100%" stopColor="#080a15" />
            </linearGradient>

            {/* Shell Specular Rim */}
            <linearGradient id="hermesShellStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(199, 210, 254, 0.4)" />
              <stop offset="50%" stopColor="rgba(99, 102, 241, 0.2)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.08)" />
            </linearGradient>

            {/* Visor Glass: Deep obsidian with interior bounce illumination */}
            <radialGradient id="hermesVisorGrad" cx="50%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#0e1226" />
              <stop offset="65%" stopColor="#070914" />
              <stop offset="100%" stopColor="#030408" />
            </radialGradient>

            <linearGradient id="visorRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.22)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0.12)" />
            </linearGradient>

            {/* Cyan Eye Gradient (Resting & Speaking) */}
            <linearGradient id="eyeGradCyan" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>

            {/* Violet Eye Gradient (Thinking) */}
            <linearGradient id="eyeGradViolet" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e9d5ff" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>

            {/* Amber Eye Gradient (Tool Execution) */}
            <linearGradient id="eyeGradAmber" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Neon Glow Filters */}
            <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="violetGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="amberGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* A. SIDE SENSOR EAR NODES */}
          <rect 
            x="20" 
            y="88" 
            width="14" 
            height="32" 
            rx="7" 
            fill="#12162a" 
            stroke="url(#hermesShellStroke)" 
            strokeWidth="1.5"
          />
          <circle 
            cx="27" 
            cy="104" 
            r="3" 
            fill={theme.led} 
            className="transition-colors duration-500"
            filter="url(#cyanGlow)" 
          />

          <rect 
            x="166" 
            y="88" 
            width="14" 
            height="32" 
            rx="7" 
            fill="#12162a" 
            stroke="url(#hermesShellStroke)" 
            strokeWidth="1.5"
          />
          <circle 
            cx="173" 
            cy="104" 
            r="3" 
            fill={theme.led} 
            className="transition-colors duration-500"
            filter="url(#cyanGlow)" 
          />

          {/* B. MAIN OUTER POD HELMET */}
          <rect
            x="30"
            y="28"
            width="140"
            height="152"
            rx="68"
            ry="66"
            fill="url(#hermesShellGrad)"
            stroke="url(#hermesShellStroke)"
            strokeWidth="2.2"
          />

          {/* Top Curved Specular Arc (Apple Glass Polish) */}
          <path
            d="M 58 44 Q 100 32 142 44 Q 100 38 58 44 Z"
            fill="white"
            fillOpacity="0.26"
          />

          {/* C. VISOR FACEPLATE */}
          <rect
            x="46"
            y="50"
            width="108"
            height="106"
            rx="50"
            ry="48"
            fill="url(#hermesVisorGrad)"
            stroke="url(#visorRimGrad)"
            strokeWidth="1.8"
          />

          {/* Visor Corner Glass Sheen */}
          <path
            d="M 56 70 Q 75 56 102 54 C 84 62 68 76 56 94 Z"
            fill="white"
            fillOpacity="0.1"
          />

          {/* Tool Execution: High-Precision Scanning Ray */}
          <line
            x1="52"
            y1="102"
            x2="148"
            y2="102"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeOpacity={activeState === 'tool' ? "0.85" : "0"}
            strokeDasharray="4 2"
            className="transition-opacity duration-300 animate-pulse"
            filter="url(#amberGlow)"
          />

          {/* D. EXPRESSIVE LIVING EYES (Continuous Geometry, Alive Across All States) */}
          <g 
            transform={`translate(${theme.gazeX}, ${theme.gazeY})`} 
            className="transition-transform duration-400 ease-out"
          >
            {/* Blinking & Gaze Modulator */}
            <g 
              className={`transition-transform duration-200 ${isBlinking ? 'scale-y-[0.08]' : ''} ${activeState === 'speaking' ? 'animate-hermes-speech-eyes' : ''}`}
              style={{ transformOrigin: '100px 98px' }}
            >
              
              {/* Left Eye */}
              <g 
                className="transition-transform duration-400"
                style={{ transformOrigin: '78px 97px', transform: theme.eyeScale }}
              >
                <rect
                  x="71"
                  y="85"
                  width="14"
                  height="25"
                  rx="7"
                  fill={theme.eyeGrad}
                  filter={theme.filterGlow}
                  className="transition-all duration-500"
                />
                {/* Left Pupil Specular Catchlight */}
                <circle
                  cx="79"
                  cy="90"
                  r="2"
                  fill="white"
                  fillOpacity="0.9"
                  className="transition-opacity duration-300"
                />
              </g>

              {/* Right Eye */}
              <g 
                className="transition-transform duration-400"
                style={{ transformOrigin: '122px 97px', transform: theme.eyeScale }}
              >
                <rect
                  x="115"
                  y="85"
                  width="14"
                  height="25"
                  rx="7"
                  fill={theme.eyeGrad}
                  filter={theme.filterGlow}
                  className="transition-all duration-500"
                />
                {/* Right Pupil Specular Catchlight */}
                <circle
                  cx="123"
                  cy="90"
                  r="2"
                  fill="white"
                  fillOpacity="0.9"
                  className="transition-opacity duration-300"
                />
              </g>

            </g>
          </g>

          {/* E. ACOUSTIC VOCALIZER & MOUTH (Sophisticated AI Vocal Expression) */}
          <g className="transition-all duration-400">
            
            {/* 1. SPEAKING STATE: Fluid Harmonic Acoustic Vocalizer Wave */}
            {activeState === 'speaking' && (
              <g className="transition-opacity duration-300">
                {/* Acoustic Vocal Glow Aperture */}
                <ellipse
                  cx="100"
                  cy="127"
                  rx="22"
                  ry="8"
                  fill="#38bdf8"
                  fillOpacity="0.16"
                  className="animate-hermes-vocal-glow"
                  filter="url(#cyanGlow)"
                />

                {/* Secondary Harmonic Wave */}
                <path
                  d="M 85 127 C 91 129.5, 96 124.5, 100 127 C 104 129.5, 109 124.5, 115 127"
                  stroke="rgba(129, 140, 248, 0.75)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                  className="animate-hermes-vocal-harmonic"
                />

                {/* Primary Voice Waveform Ribbon */}
                <path
                  d="M 81 127 C 87 123, 93 131, 100 127 C 107 123, 113 131, 119 127"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  className="animate-hermes-vocal-primary"
                  filter="url(#cyanGlow)"
                />

                {/* Symmetrical Acoustic Resonance Ticks */}
                <circle cx="76" cy="127" r="1.5" fill="#38bdf8" fillOpacity="0.6" className="animate-pulse" />
                <circle cx="124" cy="127" r="1.5" fill="#38bdf8" fillOpacity="0.6" className="animate-pulse" />
              </g>
            )}

            {/* 2. THINKING STATE: 3 Meditative Luminous Data Dots */}
            {activeState === 'thinking' && (
              <g className="transition-opacity duration-300" filter="url(#violetGlow)">
                <circle cx="92" cy="127" r="2" fill="#c084fc">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="127" r="2.2" fill="#c084fc">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" begin="0.25s" repeatCount="indefinite" />
                </circle>
                <circle cx="108" cy="127" r="2" fill="#c084fc">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" begin="0.5s" repeatCount="indefinite" />
                </circle>
              </g>
            )}

            {/* 3. TOOL EXECUTION: Data Activity Telemetry Thread */}
            {activeState === 'tool' && (
              <g className="transition-opacity duration-300" filter="url(#amberGlow)">
                <line 
                  x1="86" 
                  y1="127" 
                  x2="114" 
                  y2="127" 
                  stroke="#fbbf24" 
                  strokeWidth="2.2" 
                  strokeLinecap="round" 
                  className="animate-pulse" 
                />
              </g>
            )}

            {/* 4. LISTENING STATE: Receptive Attentive Curve */}
            {activeState === 'listening' && (
              <path
                d="M 91 126 Q 100 131 109 126"
                stroke="#38bdf8"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                filter="url(#cyanGlow)"
                className="transition-all duration-300"
              />
            )}

            {/* 5. IDLE STATE: Serene Resting Aperture */}
            {activeState === 'idle' && (
              <path
                d="M 93 126.5 Q 100 129 107 126.5"
                stroke="rgba(56, 189, 248, 0.5)"
                strokeWidth="1.8"
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-300"
              />
            )}

          </g>
        </svg>

      </div>

      {/* 4. Diffused Floating 3D Shadow on Floor Plane */}
      {cfg.showShadow && (
        <div 
          className="w-28 sm:w-32 h-3.5 mt-1 rounded-[100%] bg-black/60 blur-[6px] animate-hermes-shadow pointer-events-none transition-all duration-300" 
        />
      )}

      {/* 5. Clean Floating Status Badge */}
      {showStatusPill && (
        <div className={`mt-2.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide border transition-all duration-500 flex items-center space-x-1.5 shadow-sm ${theme.statusBadge}`}>
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: theme.led }} />
          <span>{statusLabels[activeState]}</span>
        </div>
      )}
    </div>
  );
}
