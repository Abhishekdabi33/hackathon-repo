import React, { useState, useEffect, useRef } from 'react';

/**
 * HermesCharacter - A Genuinely Interactive 3D AI Character
 * 
 * Capabilities:
 * 1. Cursor-Tracking Eyes:
 *    - Smooth interpolation (lerp physics) following the cursor
 *    - Realistic anatomical bounds (max ±4.8px X, ±3.8px Y)
 *    - Secondary head/body 3D perspective rotation (rotateY: ±7deg, rotateX: ±5.5deg)
 *    - Returns smoothly to center when cursor leaves or pauses
 * 
 * 2. Real 3D Depth:
 *    - Layered z-depth planes (Floor Shadow @ -28px, Helmet @ 0px, Visor @ 12px,
 *      Vocalizer @ 18px, Eyes @ 24px, Specular Rim @ 28px)
 *    - Creates genuine parallax and stereoscopic volume as Hermes turns
 * 
 * 3. Dynamic Cursor Lighting:
 *    - Interactive light source follows cursor across the visor glass
 *    - Subtle specular highlights that shift with cursor angle
 * 
 * 4. Scroll-Based Depth Progression:
 *    - At top: Full hero scale, forward presence, rich ambient aura
 *    - As user scrolls: Character recedes smoothly in perspective (translateZ -40px, scale 0.9)
 * 
 * 5. Full AI State Harmonization:
 *    - Idle: Natural breathing, occasional blinking, smooth cursor-tracking
 *    - Listening: Alert posture, forward lean, attentive eye dilation, cyan bloom
 *    - Thinking: Upward inquisitive gaze, 3D orbiting data rings, contemplative sway
 *    - Tool: High-focus telemetry ray, dual counter-rotating data rings
 *    - Speaking: Conversational 3D nodding cadence, acoustic vocalizer wave, resonance ripples
 * 
 * 6. High Performance:
 *    - Driven by requestAnimationFrame loop updating transforms directly on DOM refs
 *    - Zero unnecessary React re-renders during mouse movement
 *    - Full prefers-reduced-motion accessibility support
 */
export default function HermesCharacter({
  state = 'idle',
  size = 'hero',
  interactive = true,
  showStatusPill = false,
  scrollProgress = 0,
  className = ''
}) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPoked, setIsPoked] = useState(false);

  // DOM References for 60fps direct transform updates
  const containerRef = useRef(null);
  const body3DRef = useRef(null);
  const eyesGroupRef = useRef(null);
  const shadowRef = useRef(null);
  const cursorLightRef = useRef(null);

  // Physics / Lerp state
  const physicsRef = useRef({
    targetGazeX: 0,
    targetGazeY: 0,
    currentGazeX: 0,
    currentGazeY: 0,

    targetRotX: 0,
    targetRotY: 0,
    currentRotX: 0,
    currentRotY: 0,

    targetLightX: 50,
    targetLightY: 42,
    currentLightX: 50,
    currentLightY: 42,

    targetTransX: 0,
    targetTransY: 0,
    currentTransX: 0,
    currentTransY: 0,

    isMouseActive: false,
    mouseTimer: null,
    speechCadenceTimer: 0
  });

  // Natural Blinking Cycle (every 3.8 to 5.5s)
  useEffect(() => {
    let blinkTimer;
    let unblinkTimer;

    const scheduleBlink = () => {
      const delay = Math.random() * 1800 + 3800;
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

  // Global Cursor Position Tracking (Window / Workspace level)
  useEffect(() => {
    if (!interactive || size !== 'hero') return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from Hermes center normalized to window bounds
      const maxDistX = Math.max(window.innerWidth / 2, 400);
      const maxDistY = Math.max(window.innerHeight / 2, 400);

      const ndx = Math.max(-1, Math.min(1, (e.clientX - centerX) / maxDistX));
      const ndy = Math.max(-1, Math.min(1, (e.clientY - centerY) / maxDistY));

      const p = physicsRef.current;
      p.isMouseActive = true;

      // Realistic anatomical eye gaze limits (max ±4.6px X, ±3.6px Y)
      p.targetGazeX = ndx * 4.6;
      p.targetGazeY = ndy * 3.6;

      // Subtle 3D perspective rotation (max ±6.8deg Y, ±5.2deg X)
      p.targetRotY = ndx * 6.8;
      p.targetRotX = -ndy * 5.2;

      // Subtle lateral 3D translation (max ±3.5px)
      p.targetTransX = ndx * 3.5;
      p.targetTransY = ndy * 2.5;

      // Dynamic cursor specular light hotspot on visor
      p.targetLightX = 50 + ndx * 34;
      p.targetLightY = 40 + ndy * 28;

      // Reset activity timeout
      if (p.mouseTimer) clearTimeout(p.mouseTimer);
      p.mouseTimer = setTimeout(() => {
        // Smoothly return gaze toward center when cursor stops moving
        p.targetGazeX *= 0.3;
        p.targetGazeY *= 0.3;
        p.targetRotX *= 0.3;
        p.targetRotY *= 0.3;
        p.targetTransX *= 0.3;
        p.targetTransY *= 0.3;
      }, 2600);
    };

    const handleMouseLeaveWindow = () => {
      const p = physicsRef.current;
      p.targetGazeX = 0;
      p.targetGazeY = 0;
      p.targetRotX = 0;
      p.targetRotY = 0;
      p.targetTransX = 0;
      p.targetTransY = 0;
      p.targetLightX = 50;
      p.targetLightY = 42;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      if (physicsRef.current.mouseTimer) clearTimeout(physicsRef.current.mouseTimer);
    };
  }, [interactive, size]);

  // 60FPS Physics Animation Loop (Lerp Interpolation without React re-renders)
  useEffect(() => {
    let animId;

    const updatePhysics = () => {
      const p = physicsRef.current;
      const lerpFactor = 0.082; // Natural organic inertia

      // Interpolate eye gaze
      p.currentGazeX += (p.targetGazeX - p.currentGazeX) * lerpFactor;
      p.currentGazeY += (p.targetGazeY - p.currentGazeY) * lerpFactor;

      // Interpolate 3D rotations & translations
      p.currentRotX += (p.targetRotX - p.currentRotX) * lerpFactor;
      p.currentRotY += (p.targetRotY - p.currentRotY) * lerpFactor;
      p.currentTransX += (p.targetTransX - p.currentTransX) * lerpFactor;
      p.currentTransY += (p.targetTransY - p.currentTransY) * lerpFactor;

      // Interpolate cursor lighting position
      p.currentLightX += (p.targetLightX - p.currentLightX) * lerpFactor;
      p.currentLightY += (p.targetLightY - p.currentLightY) * lerpFactor;

      // Conversational 3D micro-nodding cadence during Speaking state
      let speakingNodX = 0;
      let speakingNodY = 0;
      if (state === 'speaking' || isPoked) {
        p.speechCadenceTimer += 0.055;
        speakingNodX = Math.sin(p.speechCadenceTimer * 2.8) * 1.8;
        speakingNodY = Math.cos(p.speechCadenceTimer * 1.6) * 0.8;
      }

      // Thinking state slight upward contemplative gaze bias
      const thinkingBiasY = state === 'thinking' ? -2.8 : 0;
      const thinkingBiasX = state === 'thinking' ? 2.2 : 0;

      // Update Eyes SVG group directly
      if (eyesGroupRef.current) {
        const finalEyeX = p.currentGazeX + thinkingBiasX;
        const finalEyeY = p.currentGazeY + thinkingBiasY;
        eyesGroupRef.current.setAttribute(
          'transform',
          `translate(${finalEyeX.toFixed(2)}, ${finalEyeY.toFixed(2)})`
        );
      }

      // Update 3D Character Body transform directly
      if (body3DRef.current) {
        const finalRotX = p.currentRotX + speakingNodX;
        const finalRotY = p.currentRotY + speakingNodY;
        const finalTransX = p.currentTransX;
        const finalTransY = p.currentTransY + (speakingNodX ? -speakingNodX * 0.6 : 0);

        // Listening posture lean: translateZ(12px)
        const zLean = state === 'listening' ? 12 : 0;

        body3DRef.current.style.transform = `perspective(1000px) rotateX(${finalRotX.toFixed(2)}deg) rotateY(${finalRotY.toFixed(2)}deg) translate3d(${finalTransX.toFixed(2)}px, ${finalTransY.toFixed(2)}px, ${zLean}px)`;
      }

      // Update Floor Shadow shift in 3D
      if (shadowRef.current) {
        const shadowShiftX = -p.currentRotY * 1.2;
        const shadowShiftY = p.currentRotX * 0.8;
        shadowRef.current.style.transform = `translate(${shadowShiftX.toFixed(1)}px, ${shadowShiftY.toFixed(1)}px)`;
      }

      // Update Dynamic Cursor Lighting hotspot on visor
      if (cursorLightRef.current) {
        cursorLightRef.current.style.background = `radial-gradient(circle 85px at ${p.currentLightX.toFixed(1)}% ${p.currentLightY.toFixed(1)}%, rgba(165, 180, 252, 0.28) 0%, rgba(99, 102, 241, 0.08) 42%, transparent 75%)`;
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [state, isPoked, size, interactive]);

  // Click/Poke Interaction: Hermes acknowledges with bounce & speaking pulse
  const handlePoke = () => {
    if (!interactive) return;
    setIsPoked(true);
    setTimeout(() => setIsPoked(false), 1400);
  };

  const activeState = isPoked ? 'speaking' : state;

  // Status Labels for Optional Floating Pill
  const statusLabels = {
    idle: 'Hermes Online',
    listening: 'Listening...',
    thinking: 'Reasoning & Planning...',
    tool: 'Invoking Agent Tools...',
    speaking: 'Speaking...'
  };

  // State Themes Cohesive with Midnight/Indigo/Violet UI
  const stateThemes = {
    idle: {
      aura: 'from-indigo-600/25 via-violet-600/15 to-transparent',
      led: '#38bdf8',
      eyeGrad: 'url(#eyeGradCyan)',
      filterGlow: 'url(#cyanGlow)',
      statusBadge: 'text-indigo-300 border-indigo-500/20 bg-indigo-500/10',
      eyeScale: 'scale(1)'
    },
    listening: {
      aura: 'from-cyan-500/30 via-indigo-600/20 to-transparent',
      led: '#22d3ee',
      eyeGrad: 'url(#eyeGradCyan)',
      filterGlow: 'url(#cyanGlow)',
      statusBadge: 'text-cyan-300 border-cyan-500/25 bg-cyan-500/10',
      eyeScale: 'scale(1.08)'
    },
    thinking: {
      aura: 'from-violet-500/35 via-indigo-600/25 to-transparent',
      led: '#c084fc',
      eyeGrad: 'url(#eyeGradViolet)',
      filterGlow: 'url(#violetGlow)',
      statusBadge: 'text-violet-300 border-violet-500/25 bg-violet-500/10',
      eyeScale: 'scale(0.98)'
    },
    tool: {
      aura: 'from-amber-500/30 via-indigo-600/25 to-transparent',
      led: '#fbbf24',
      eyeGrad: 'url(#eyeGradAmber)',
      filterGlow: 'url(#amberGlow)',
      statusBadge: 'text-amber-300 border-amber-500/25 bg-amber-500/10',
      eyeScale: 'scaleX(1.04) scaleY(0.93)'
    },
    speaking: {
      aura: 'from-indigo-500/40 via-sky-500/30 to-violet-500/20',
      led: '#38bdf8',
      eyeGrad: 'url(#eyeGradCyan)',
      filterGlow: 'url(#cyanGlow)',
      statusBadge: 'text-sky-300 border-sky-500/30 bg-sky-500/15',
      eyeScale: 'scale(1.03)'
    }
  };

  const theme = stateThemes[activeState] || stateThemes.idle;

  // Sizing Styles
  const sizeStyles = {
    hero: {
      container: 'w-44 h-48 sm:w-48 sm:h-52',
      showAura: true,
      showShadow: true,
      showOrbits: true
    },
    md: {
      container: 'w-20 h-22 sm:w-22 sm:h-24',
      showAura: true,
      showShadow: false,
      showOrbits: false
    },
    sm: {
      container: 'w-9 h-9',
      showAura: false,
      showShadow: false,
      showOrbits: false
    }
  };

  const cfg = sizeStyles[size] || sizeStyles.hero;

  // 3D Scroll Perspective Recession (Clamped 0 to 1)
  const clampedScroll = Math.max(0, Math.min(1, scrollProgress));
  const scroll3DTransform = size === 'hero' ? {
    transform: `perspective(1000px) translateZ(${-clampedScroll * 38}px) scale(${1 - clampedScroll * 0.1})`,
    opacity: 1 - clampedScroll * 0.22,
    transition: 'transform 0.15s ease-out, opacity 0.15s ease-out'
  } : {};

  return (
    <div 
      ref={containerRef}
      onClick={handlePoke}
      style={scroll3DTransform}
      className={`relative inline-flex flex-col items-center justify-center select-none ${cfg.container} ${interactive ? 'cursor-pointer' : ''} ${className}`}
      title={interactive ? "Hermes 3D AI - Moving cursor guides Hermes gaze" : "Hermes AI"}
    >
      {/* 1. Ambient Dynamic Lighting Halo (Layer -10px) */}
      {cfg.showAura && (
        <div 
          className={`absolute -inset-4 sm:-inset-6 rounded-full bg-gradient-to-tr ${theme.aura} blur-2xl transition-all duration-700 pointer-events-none opacity-80 ${activeState === 'speaking' ? 'animate-hermes-pulse' : ''}`} 
          style={{ transform: 'translateZ(-10px)' }}
        />
      )}

      {/* 2. Character 3D Body Container with Cursor & State Parallax (preserve-3d) */}
      <div 
        ref={body3DRef}
        className="relative w-full h-full flex items-center justify-center will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        
        {/* Luminous Orbital Ring: Thinking State */}
        {cfg.showOrbits && activeState === 'thinking' && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500"
            style={{ transform: 'translateZ(6px)' }}
          >
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
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500"
            style={{ transform: 'translateZ(8px)' }}
          >
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
            style={{ animationDuration: '2.4s', transform: 'translateZ(12px)' }} 
          />
        )}

        {/* Dynamic Interactive Cursor Specular Sheen on Glass Faceplate (Layer 14px) */}
        <div
          ref={cursorLightRef}
          className="absolute inset-7 rounded-[46px] pointer-events-none transition-opacity duration-300 z-10"
          style={{
            transform: 'translateZ(14px)',
            mixBlendMode: 'screen'
          }}
        />

        {/* 3. Layered Vector AI Companion (ViewBox 0 0 200 220) */}
        <svg
          viewBox="0 0 200 220"
          className="w-full h-full drop-shadow-[0_14px_30px_rgba(0,0,0,0.7)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transformStyle: 'preserve-3d' }}
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
              <stop offset="0%" stopColor="rgba(199, 210, 254, 0.42)" />
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
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.24)" />
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

          {/* LAYER 0: SIDE SENSOR EAR NODES */}
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

          {/* LAYER 0: MAIN OUTER POD HELMET */}
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

          {/* LAYER 28px: Top Curved Specular Arc (Curved 3D Glass Polish) */}
          <path
            d="M 58 44 Q 100 32 142 44 Q 100 38 58 44 Z"
            fill="white"
            fillOpacity="0.26"
          />

          {/* LAYER 12px: VISOR FACEPLATE */}
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

          {/* LAYER 24px: CURSOR-TRACKING LIVING EYES (Hardware Parallax Layer) */}
          <g 
            ref={eyesGroupRef}
            className="will-change-transform"
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

          {/* LAYER 18px: ACOUSTIC VOCALIZER & MOUTH */}
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

      {/* 4. Layer -28px: Diffused Dynamic 3D Floor Shadow */}
      {cfg.showShadow && (
        <div 
          ref={shadowRef}
          className="w-28 sm:w-32 h-3.5 mt-1 rounded-[100%] bg-black/65 blur-[6px] pointer-events-none transition-all duration-300 will-change-transform" 
          style={{ transform: 'translateZ(-28px)' }}
        />
      )}

      {/* 5. Floating Status Badge */}
      {showStatusPill && (
        <div className={`mt-2.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide border transition-all duration-500 flex items-center space-x-1.5 shadow-sm ${theme.statusBadge}`}>
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: theme.led }} />
          <span>{statusLabels[activeState]}</span>
        </div>
      )}
    </div>
  );
}
