import React, { useState, useEffect, useRef } from 'react';

/**
 * HermesCharacter - The Interactive Living AI Avatar for Hermes
 * 
 * States:
 * - 'idle'       : Gentle floating, soft breathing aura, natural eye blinking, subtle gaze wander.
 * - 'listening'  : Attentive wide eyes, brightened ambient cyan glow, receptive posture.
 * - 'thinking'   : Inquisitive eye gaze, orbital particle ring rotating, gentle pulsing.
 * - 'tool'       : Energetic status, high-tech scanning line, rapid particle flux.
 * - 'speaking'   : Expressive happy crescent eyes, animated multi-bar vocalizer soundwave, voice pulse waves.
 * 
 * Sizes:
 * - 'hero' (empty state, ~180px)
 * - 'md'   (live activity stepper / banner, ~80px)
 * - 'sm'   (header / message avatar, ~36px)
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

  // Natural Blinking Timer (every 3.2 to 5 seconds)
  useEffect(() => {
    let blinkTimer;
    let unblinkTimer;

    const scheduleBlink = () => {
      const delay = Math.random() * 2000 + 3000;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        unblinkTimer = setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 160);
      }, delay);
    };

    scheduleBlink();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(unblinkTimer);
    };
  }, []);

  // Subtle Mouse Tracking on Hero Size
  const handleMouseMove = (e) => {
    if (!interactive || size !== 'hero' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Max 4px gaze offset
    const dx = Math.max(-4, Math.min(4, (e.clientX - centerX) / 25));
    const dy = Math.max(-3, Math.min(3, (e.clientY - centerY) / 25));
    setMouseOffset({ x: dx, y: dy });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // Click / Poke interaction: Hermes winks and bounces
  const handlePoke = () => {
    if (!interactive) return;
    setIsPoked(true);
    setTimeout(() => setIsPoked(false), 900);
  };

  // State configurations
  const currentState = isPoked ? 'speaking' : state;

  // Status text for optional floating pill
  const statusLabels = {
    idle: 'Hermes Online',
    listening: 'Listening...',
    thinking: 'Thinking & Planning...',
    tool: 'Executing Agent Tool...',
    speaking: 'Speaking...'
  };

  // State theme colors
  const stateThemes = {
    idle: {
      aura: 'from-indigo-600/25 via-violet-600/15 to-transparent',
      led: '#38bdf8',
      eyes: 'url(#eyeGradCyan)',
      filterGlow: 'url(#cyanGlow)',
      statusBadge: 'text-indigo-300 border-indigo-500/20 bg-indigo-500/10'
    },
    listening: {
      aura: 'from-cyan-500/30 via-indigo-600/20 to-transparent',
      led: '#22d3ee',
      eyes: 'url(#eyeGradCyan)',
      filterGlow: 'url(#cyanGlow)',
      statusBadge: 'text-cyan-300 border-cyan-500/25 bg-cyan-500/10'
    },
    thinking: {
      aura: 'from-violet-500/35 via-indigo-600/25 to-transparent',
      led: '#c084fc',
      eyes: 'url(#eyeGradViolet)',
      filterGlow: 'url(#violetGlow)',
      statusBadge: 'text-violet-300 border-violet-500/25 bg-violet-500/10'
    },
    tool: {
      aura: 'from-amber-500/30 via-indigo-600/25 to-transparent',
      led: '#fbbf24',
      eyes: 'url(#eyeGradAmber)',
      filterGlow: 'url(#amberGlow)',
      statusBadge: 'text-amber-300 border-amber-500/25 bg-amber-500/10'
    },
    speaking: {
      aura: 'from-indigo-500/40 via-sky-500/30 to-violet-500/20',
      led: '#38bdf8',
      eyes: 'url(#eyeGradCyan)',
      filterGlow: 'url(#cyanGlow)',
      statusBadge: 'text-sky-300 border-sky-500/30 bg-sky-500/15'
    }
  };

  const theme = stateThemes[currentState] || stateThemes.idle;

  // Sizing styles
  const sizeStyles = {
    hero: {
      container: 'w-44 h-48 sm:w-48 sm:h-52',
      svgWidth: 190,
      svgHeight: 210,
      floatClass: 'animate-hermes-float',
      showAura: true,
      showShadow: true,
      showOrbits: true
    },
    md: {
      container: 'w-20 h-22 sm:w-22 sm:h-24',
      svgWidth: 90,
      svgHeight: 100,
      floatClass: 'animate-hermes-float',
      showAura: true,
      showShadow: false,
      showOrbits: false
    },
    sm: {
      container: 'w-9 h-9',
      svgWidth: 38,
      svgHeight: 40,
      floatClass: '',
      showAura: false,
      showShadow: false,
      showOrbits: false
    }
  };

  const cfg = sizeStyles[size] || sizeStyles.hero;

  // Eye gaze coordinates based on state & mouse tracking
  let gazeX = mouseOffset.x;
  let gazeY = mouseOffset.y;

  if (currentState === 'thinking') {
    gazeX = 4;
    gazeY = -4;
  } else if (currentState === 'listening') {
    gazeX = 0;
    gazeY = 1;
  }

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handlePoke}
      className={`relative inline-flex flex-col items-center justify-center select-none ${cfg.container} ${interactive ? 'cursor-pointer' : ''} ${className}`}
      title={interactive ? "Hermes AI - Click to interact" : "Hermes AI"}
    >
      {/* 1. Ambient Background Aura (Soft 3D Light) */}
      {cfg.showAura && (
        <div 
          className={`absolute -inset-4 sm:-inset-6 rounded-full bg-gradient-to-tr ${theme.aura} blur-2xl transition-all duration-700 pointer-events-none opacity-80 ${currentState !== 'idle' ? 'animate-hermes-pulse' : ''}`} 
        />
      )}

      {/* 2. Character SVG Model Container (with Apple-style spring float) */}
      <div className={`relative w-full h-full flex items-center justify-center ${cfg.floatClass} transition-transform duration-300 ${isPoked ? 'scale-110 -translate-y-2' : ''}`}>
        
        {/* Orbital Ring 1: Thinking & Tool States */}
        {cfg.showOrbits && (currentState === 'thinking' || currentState === 'tool') && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-[130%] h-[60%] rounded-full border border-indigo-400/30 ${currentState === 'tool' ? 'animate-hermes-orbit-fast border-amber-400/40' : 'animate-hermes-orbit-slow'}`} style={{ transform: 'rotateX(70deg)' }}>
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] -top-1 left-1/4 absolute" />
              {currentState === 'tool' && (
                <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] -bottom-1 right-1/4 absolute" />
              )}
            </div>
          </div>
        )}

        {/* Orbital Ring 2: Tool Execution Counter-Rotation */}
        {cfg.showOrbits && currentState === 'tool' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[115%] h-[55%] rounded-full border border-cyan-400/25 animate-hermes-orbit-rev" style={{ transform: 'rotateX(75deg) rotateY(25deg)' }}>
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] top-1/2 -right-1 absolute" />
            </div>
          </div>
        )}

        {/* Speaking Voice Ripple Waves */}
        {cfg.showAura && currentState === 'speaking' && (
          <div className="absolute inset-2 rounded-full border-2 border-indigo-400/25 animate-ping pointer-events-none" style={{ animationDuration: '2.2s' }} />
        )}

        {/* 3. The Vector Character Model (ViewBox 0 0 200 220) */}
        <svg
          viewBox="0 0 200 220"
          className="w-full h-full drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Shell Body Gradient: Futuristic dark midnight glass/ceramic */}
            <linearGradient id="hermesShellGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#1e2444" />
              <stop offset="45%" stopColor="#11162b" />
              <stop offset="100%" stopColor="#080a15" />
            </linearGradient>

            {/* Shell Outer Border Highlight */}
            <linearGradient id="hermesShellStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(199, 210, 254, 0.45)" />
              <stop offset="50%" stopColor="rgba(99, 102, 241, 0.2)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.08)" />
            </linearGradient>

            {/* Visor Glass Gradient: Deep obsidian with interior light bounce */}
            <radialGradient id="hermesVisorGrad" cx="50%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#0e1226" />
              <stop offset="65%" stopColor="#070914" />
              <stop offset="100%" stopColor="#030408" />
            </radialGradient>

            {/* Visor Bevel Highlight */}
            <linearGradient id="visorRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.22)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0.12)" />
            </linearGradient>

            {/* Cyan Eye Gradient */}
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

            {/* Eye Glow Filters */}
            <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="violetGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="amberGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* A. SIDE SENSOR EAR PODS (Cute Aerodynamic Audio Nodes) */}
          {/* Left Ear */}
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

          {/* Right Ear */}
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

          {/* B. MAIN OUTER POD HELMET (Capsule shape inspired by the reference) */}
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

          {/* Top Specular Arc Highlight (Apple-like 3D curved glass reflection) */}
          <path
            d="M 58 44 Q 100 32 142 44 Q 100 38 58 44 Z"
            fill="white"
            fillOpacity="0.28"
          />

          {/* C. VISOR FACEPLATE (Oval/capsule window with depth) */}
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

          {/* Tool Execution: Futuristic Scanning Laser Ray */}
          {currentState === 'tool' && (
            <line
              x1="52"
              y1="102"
              x2="148"
              y2="102"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeOpacity="0.8"
              strokeDasharray="4 2"
              className="animate-pulse"
              filter="url(#amberGlow)"
            />
          )}

          {/* D. EXPRESSIVE EYES (Inspired by reference pill-eye simplicity, upgraded to AI) */}
          <g transform={`translate(${gazeX}, ${gazeY})`} className="transition-transform duration-200">
            
            {/* 1. SPEAKING STATE: Cheerful Happy Curved Eyes (^ ^) */}
            {currentState === 'speaking' ? (
              <g className="transition-all duration-300">
                {/* Left Happy Crescent Eye */}
                <path
                  d="M 68 98 Q 78 85 88 98"
                  stroke={theme.eyes}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  fill="none"
                  filter={theme.filterGlow}
                />
                {/* Right Happy Crescent Eye */}
                <path
                  d="M 112 98 Q 122 85 132 98"
                  stroke={theme.eyes}
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  fill="none"
                  filter={theme.filterGlow}
                />
              </g>
            ) : (
              /* 2. IDLE / LISTENING / THINKING / TOOL: Expressive Pill Eyes */
              <g className={`transition-transform duration-150 ${isBlinking ? 'scale-y-[0.08]' : 'scale-y-100'}`} style={{ transformOrigin: '100px 98px' }}>
                
                {/* Left Eye Pill */}
                <rect
                  x="71"
                  y={currentState === 'listening' ? "83" : "85"}
                  width="14"
                  height={currentState === 'listening' ? "28" : "25"}
                  rx="7"
                  fill={theme.eyes}
                  filter={theme.filterGlow}
                />
                {/* Left Pupil Specular Catchlight */}
                <circle
                  cx="79"
                  cy={currentState === 'listening' ? "88" : "90"}
                  r="2"
                  fill="white"
                  fillOpacity="0.9"
                />

                {/* Right Eye Pill */}
                <rect
                  x="115"
                  y={currentState === 'listening' ? "83" : "85"}
                  width="14"
                  height={currentState === 'listening' ? "28" : "25"}
                  rx="7"
                  fill={theme.eyes}
                  filter={theme.filterGlow}
                />
                {/* Right Pupil Specular Catchlight */}
                <circle
                  cx="123"
                  cy={currentState === 'listening' ? "88" : "90"}
                  r="2"
                  fill="white"
                  fillOpacity="0.9"
                />

              </g>
            )}

          </g>

          {/* E. VOCALIZER / MOUTH AREA */}
          <g className="transition-all duration-300">
            {currentState === 'speaking' ? (
              /* SPEAKING: Lively Digital Vocalizer Soundwave Bars */
              <g filter="url(#cyanGlow)">
                {/* Bar 1 */}
                <rect x="84" y="123" width="3" height="12" rx="1.5" fill="#38bdf8">
                  <animate attributeName="height" values="6;16;8;14;6" dur="0.45s" repeatCount="indefinite" />
                  <animate attributeName="y" values="126;121;125;122;126" dur="0.45s" repeatCount="indefinite" />
                </rect>
                {/* Bar 2 */}
                <rect x="91" y="120" width="3.2" height="18" rx="1.6" fill="#60a5fa">
                  <animate attributeName="height" values="8;22;10;20;8" dur="0.38s" repeatCount="indefinite" />
                  <animate attributeName="y" values="125;118;124;119;125" dur="0.38s" repeatCount="indefinite" />
                </rect>
                {/* Bar 3 (Center Peak) */}
                <rect x="98.5" y="117" width="3.5" height="24" rx="1.75" fill="#38bdf8">
                  <animate attributeName="height" values="12;26;14;24;12" dur="0.32s" repeatCount="indefinite" />
                  <animate attributeName="y" values="123;116;122;117;123" dur="0.32s" repeatCount="indefinite" />
                </rect>
                {/* Bar 4 */}
                <rect x="106" y="120" width="3.2" height="18" rx="1.6" fill="#60a5fa">
                  <animate attributeName="height" values="7;20;12;18;7" dur="0.4s" repeatCount="indefinite" />
                  <animate attributeName="y" values="125;119;123;120;125" dur="0.4s" repeatCount="indefinite" />
                </rect>
                {/* Bar 5 */}
                <rect x="113" y="123" width="3" height="12" rx="1.5" fill="#38bdf8">
                  <animate attributeName="height" values="5;14;8;12;5" dur="0.48s" repeatCount="indefinite" />
                  <animate attributeName="y" values="126;122;125;123;126" dur="0.48s" repeatCount="indefinite" />
                </rect>
              </g>
            ) : currentState === 'thinking' ? (
              /* THINKING: 3 Pulsing Digital Thought Dots */
              <g className="animate-pulse" filter="url(#violetGlow)">
                <circle cx="92" cy="128" r="2" fill="#c084fc">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="128" r="2.2" fill="#c084fc">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="108" cy="128" r="2" fill="#c084fc">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.4s" repeatCount="indefinite" />
                </circle>
              </g>
            ) : currentState === 'tool' ? (
              /* TOOL EXECUTION: Data Activity Dash */
              <g filter="url(#amberGlow)">
                <line x1="88" y1="128" x2="112" y2="128" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />
              </g>
            ) : currentState === 'listening' ? (
              /* LISTENING: Friendly Attentive Smile */
              <path
                d="M 92 126 Q 100 133 108 126"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                filter="url(#cyanGlow)"
              />
            ) : (
              /* IDLE: Cute Minimal Smile */
              <path
                d="M 94 126 Q 100 130 106 126"
                stroke="rgba(56, 189, 248, 0.65)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>
        </svg>

      </div>

      {/* 4. Soft Diffused Floating 3D Shadow on Floor Plane */}
      {cfg.showShadow && (
        <div 
          className="w-28 sm:w-32 h-3.5 mt-1 rounded-[100%] bg-black/60 blur-[6px] animate-hermes-shadow pointer-events-none transition-all duration-300" 
        />
      )}

      {/* 5. Optional Status Pill */}
      {showStatusPill && (
        <div className={`mt-2.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide border transition-all duration-300 flex items-center space-x-1.5 shadow-sm ${theme.statusBadge}`}>
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: theme.led }} />
          <span>{statusLabels[currentState]}</span>
        </div>
      )}
    </div>
  );
}
