import React, { useState, useEffect, useRef } from 'react';

/**
 * HermesCharacter - 3D AI Assistant Companion
 * Palette: Jet Black (#050505) × Royal Amethyst (#3B0A6B) × Electric Cyan (#00E5FF)
 * 
 * Features:
 * - Expressive 3D AI character with realistic facial depth and obsidian glass visor
 * - Royal Amethyst rim lighting with Electric Cyan highlights
 * - 60fps lerping cursor-tracking eyes with head perspective rotation
 * - Acoustic vocalizer wave synchronized during speech
 * - Subtle reactive light rings when listening, sophisticated orbital effect when thinking
 * - Layered 3D z-depth (Floor shadow @ -28px, Visor @ 12px, Vocalizer @ 18px, Eyes @ 24px)
 * - Restrained, premium futuristic presence
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

  // Physics & Lerp State
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

      // Anatomical eye gaze limits (max ±4.6px X, ±3.6px Y)
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

      if (p.mouseTimer) clearTimeout(p.mouseTimer);
      p.mouseTimer = setTimeout(() => {
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

      p.currentGazeX += (p.targetGazeX - p.currentGazeX) * lerpFactor;
      p.currentGazeY += (p.targetGazeY - p.currentGazeY) * lerpFactor;

      p.currentRotX += (p.targetRotX - p.currentRotX) * lerpFactor;
      p.currentRotY += (p.targetRotY - p.currentRotY) * lerpFactor;
      p.currentTransX += (p.targetTransX - p.currentTransX) * lerpFactor;
      p.currentTransY += (p.targetTransY - p.currentTransY) * lerpFactor;

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

        // Listening posture lean forward: translateZ(12px)
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
        cursorLightRef.current.style.background = `radial-gradient(circle 85px at ${p.currentLightX.toFixed(1)}% ${p.currentLightY.toFixed(1)}%, rgba(0, 229, 255, 0.32) 0%, rgba(59, 10, 107, 0.16) 45%, transparent 75%)`;
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [state, isPoked, size, interactive]);

  // Click/Poke Interaction
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

  // State Themes strictly derived from Jet Black × Royal Amethyst × Electric Cyan
  const stateThemes = {
    idle: {
      aura: 'from-[#3B0A6B]/35 via-[#0e041a]/20 to-transparent',
      led: '#00E5FF',
      eyeGrad: 'url(#eyeGradCyan)',
      filterGlow: 'url(#cyanGlow)',
      statusBadge: 'text-[#00E5FF] border-[#3B0A6B]/40 bg-[#3B0A6B]/20',
      eyeScale: 'scale(1)'
    },
    listening: {
      aura: 'from-[#00E5FF]/30 via-[#3B0A6B]/25 to-transparent',
      led: '#00E5FF',
      eyeGrad: 'url(#eyeGradCyan)',
      filterGlow: 'url(#cyanGlow)',
      statusBadge: 'text-[#00E5FF] border-[#00E5FF]/45 bg-[#00E5FF]/15',
      eyeScale: 'scale(1.08)'
    },
    thinking: {
      aura: 'from-[#3B0A6B]/50 via-[#16042b]/35 to-transparent',
      led: '#00E5FF',
      eyeGrad: 'url(#eyeGradCyan)',
      filterGlow: 'url(#cyanGlow)',
      statusBadge: 'text-[#F5F5FA] border-[#3B0A6B]/60 bg-[#3B0A6B]/35',
      eyeScale: 'scale(0.98)'
    },
    tool: {
      aura: 'from-[#00E5FF]/25 via-[#3B0A6B]/40 to-transparent',
      led: '#00E5FF',
      eyeGrad: 'url(#eyeGradCyan)',
      filterGlow: 'url(#cyanGlow)',
      statusBadge: 'text-[#00E5FF] border-[#00E5FF]/35 bg-[#3B0A6B]/25',
      eyeScale: 'scaleX(1.04) scaleY(0.93)'
    },
    speaking: {
      aura: 'from-[#3B0A6B]/45 via-[#00E5FF]/25 to-transparent',
      led: '#00E5FF',
      eyeGrad: 'url(#eyeGradCyan)',
      filterGlow: 'url(#cyanGlow)',
      statusBadge: 'text-[#00E5FF] border-[#00E5FF]/50 bg-[#00E5FF]/20',
      eyeScale: 'scale(1.03)'
    }
  };

  const theme = stateThemes[activeState] || stateThemes.idle;

  // Sizing Styles
  const sizeStyles = {
    hero: {
      container: 'w-48 h-52 sm:w-56 sm:h-60',
      showAura: true,
      showShadow: true,
      showOrbits: true,
      showStardust: true
    },
    companion: {
      container: 'w-14 h-14',
      showAura: true,
      showShadow: false,
      showOrbits: false,
      showStardust: false
    },
    md: {
      container: 'w-20 h-22 sm:w-22 sm:h-24',
      showAura: true,
      showShadow: false,
      showOrbits: false,
      showStardust: false
    },
    sm: {
      container: 'w-9 h-9',
      showAura: false,
      showShadow: false,
      showOrbits: false,
      showStardust: false
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
      {/* 1. Ambient Royal Amethyst Dynamic Lighting Halo (Layer -10px) */}
      {cfg.showAura && (
        <div 
          className={`absolute -inset-4 sm:-inset-6 rounded-full bg-gradient-to-tr ${theme.aura} blur-2xl transition-all duration-700 pointer-events-none opacity-85 ${activeState === 'speaking' ? 'animate-hermes-pulse' : ''}`} 
          style={{ transform: 'translateZ(-10px)' }}
        />
      )}

      {/* 2. Character 3D Body Container (preserve-3d) */}
      <div 
        ref={body3DRef}
        className="relative w-full h-full flex items-center justify-center will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        
        {/* Signature 3D Astrolabe Orbit Geometry (Delicate Glass Gyro Rings) */}
        {cfg.showOrbits && (
          <div 
            className="absolute inset-[-12%] flex items-center justify-center pointer-events-none transition-opacity duration-700"
            style={{ transform: 'translateZ(6px)', transformStyle: 'preserve-3d' }}
          >
            {/* Primary Ambient Gyro Ring */}
            <div 
              className="w-full h-[62%] rounded-full border border-[#00E5FF]/20 animate-hermes-orbit-slow" 
              style={{ 
                transform: 'rotateX(68deg) rotateY(-16deg)',
                boxShadow: '0 0 20px rgba(0, 229, 255, 0.08), inset 0 0 15px rgba(59, 10, 107, 0.2)'
              }}
            >
              <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] -top-1 left-1/4 absolute" />
            </div>

            {/* Counter-Tilted Amethyst Deep Arc */}
            <div 
              className="w-[90%] h-[56%] rounded-full border border-[#3B0A6B]/40 animate-hermes-orbit-rev" 
              style={{ 
                transform: 'rotateX(74deg) rotateY(24deg) translateZ(-10px)',
                boxShadow: '0 0 15px rgba(59, 10, 107, 0.25)'
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFFFFF] shadow-[0_0_6px_#FFFFFF] top-1/2 -right-0.5 absolute" />
            </div>
          </div>
        )}

        {/* Luminous Floating Depth Stardust Particles */}
        {cfg.showStardust && (
          <div 
            className="absolute inset-[-20%] pointer-events-none overflow-visible"
            style={{ transform: 'translateZ(12px)', transformStyle: 'preserve-3d' }}
          >
            <div 
              className="absolute left-2 top-8 w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-stardust-1"
              style={{ transform: 'translateZ(20px)' }}
            />
            <div 
              className="absolute right-3 top-12 w-1.5 h-1.5 rounded-full bg-[#FFFFFF] shadow-[0_0_6px_#FFFFFF] animate-stardust-2"
              style={{ transform: 'translateZ(-14px)' }}
            />
            <div 
              className="absolute left-0 bottom-16 w-2 h-2 rounded-full bg-[#3B0A6B] border border-[#00E5FF]/40 shadow-[0_0_10px_rgba(59,10,107,0.8)] animate-stardust-3"
              style={{ transform: 'translateZ(24px)' }}
            />
            <div 
              className="absolute right-1 bottom-14 w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF] animate-stardust-1"
              style={{ transform: 'translateZ(10px)' }}
            />
            <div 
              className="absolute left-8 bottom-4 w-1 h-1 rounded-full bg-[#FFFFFF] shadow-[0_0_4px_#FFFFFF] animate-stardust-2"
              style={{ transform: 'translateZ(-8px)' }}
            />
            <div 
              className="absolute right-10 top-4 w-1 h-1 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF] animate-stardust-3"
              style={{ transform: 'translateZ(16px)' }}
            />
          </div>
        )}

        {/* Dynamic Activity Orbital Rings: Thinking State */}
        {cfg.showOrbits && activeState === 'thinking' && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500"
            style={{ transform: 'translateZ(8px)' }}
          >
            <div 
              className="w-[125%] h-[58%] rounded-full border border-[#00E5FF]/45 animate-hermes-orbit-fast" 
              style={{ transform: 'rotateX(70deg)' }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_12px_#00E5FF] -top-1 left-1/4 absolute" />
            </div>
          </div>
        )}

        {/* Counter-Rotating Dual Data Rings: Tool Execution */}
        {cfg.showOrbits && activeState === 'tool' && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500"
            style={{ transform: 'translateZ(10px)' }}
          >
            <div 
              className="w-[128%] h-[60%] rounded-full border border-[#00E5FF]/50 animate-hermes-orbit-fast" 
              style={{ transform: 'rotateX(68deg)' }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_12px_#00E5FF] -top-1 left-1/3 absolute" />
            </div>
            <div 
              className="w-[114%] h-[54%] rounded-full border border-[#3B0A6B]/60 animate-hermes-orbit-rev" 
              style={{ transform: 'rotateX(74deg) rotateY(20deg)' }}
            >
              <div className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] top-1/2 -right-1 absolute" />
            </div>
          </div>
        )}

        {/* Voice Resonance Waves in Speaking State */}
        {cfg.showAura && activeState === 'speaking' && (
          <div 
            className="absolute inset-3 rounded-full border border-[#00E5FF]/30 animate-ping pointer-events-none" 
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
          className="w-full h-full drop-shadow-[0_14px_34px_rgba(0,0,0,0.85)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <defs>
            {/* Shell Body: Jet Black with Royal Amethyst Rim Shadows */}
            <linearGradient id="hermesShellGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#1e0537" />
              <stop offset="40%" stopColor="#0a0214" />
              <stop offset="100%" stopColor="#050505" />
            </linearGradient>

            {/* Shell Royal Amethyst & Cyan Specular Rim */}
            <linearGradient id="hermesShellStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0, 229, 255, 0.55)" />
              <stop offset="45%" stopColor="rgba(59, 10, 107, 0.65)" />
              <stop offset="100%" stopColor="rgba(0, 229, 255, 0.15)" />
            </linearGradient>

            {/* Visor Glass: Deep obsidian jet black with interior bounce illumination */}
            <radialGradient id="hermesVisorGrad" cx="50%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#0f021c" />
              <stop offset="65%" stopColor="#08010f" />
              <stop offset="100%" stopColor="#050505" />
            </radialGradient>

            <linearGradient id="visorRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0, 229, 255, 0.35)" />
              <stop offset="100%" stopColor="rgba(59, 10, 107, 0.3)" />
            </linearGradient>

            {/* Electric Cyan Eye Gradient */}
            <linearGradient id="eyeGradCyan" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E0FFFF" />
              <stop offset="40%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#0099b8" />
            </linearGradient>

            {/* Neon Glow Filters */}
            <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
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
            fill="#090212" 
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
            fill="#090212" 
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

          {/* LAYER 0: MAIN OUTER POD HELMET (Jet Black × Royal Amethyst) */}
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

          {/* LAYER 28px: Top Curved Specular Arc */}
          <path
            d="M 58 44 Q 100 32 142 44 Q 100 38 58 44 Z"
            fill="white"
            fillOpacity="0.25"
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
            fillOpacity="0.08"
          />

          {/* Tool Execution: High-Precision Cyan Scanning Ray */}
          <line
            x1="52"
            y1="102"
            x2="148"
            y2="102"
            stroke="#00E5FF"
            strokeWidth="1.5"
            strokeOpacity={activeState === 'tool' ? "0.9" : "0"}
            strokeDasharray="4 2"
            className="transition-opacity duration-300 animate-pulse"
            filter="url(#cyanGlow)"
          />

          {/* LAYER 24px: CURSOR-TRACKING ELECTRIC CYAN EYES */}
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
                  fill="url(#eyeGradCyan)"
                  filter="url(#cyanGlow)"
                  className="transition-all duration-500"
                />
                {/* Left Pupil Specular Catchlight */}
                <circle
                  cx="79"
                  cy="90"
                  r="2"
                  fill="white"
                  fillOpacity="0.95"
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
                  fill="url(#eyeGradCyan)"
                  filter="url(#cyanGlow)"
                  className="transition-all duration-500"
                />
                {/* Right Pupil Specular Catchlight */}
                <circle
                  cx="123"
                  cy="90"
                  r="2"
                  fill="white"
                  fillOpacity="0.95"
                  className="transition-opacity duration-300"
                />
              </g>

            </g>
          </g>

          {/* LAYER 18px: ACOUSTIC VOCALIZER & MOUTH (Electric Cyan) */}
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
                  fill="#00E5FF"
                  fillOpacity="0.18"
                  className="animate-hermes-vocal-glow"
                  filter="url(#cyanGlow)"
                />

                {/* Secondary Royal Amethyst Harmonic Wave */}
                <path
                  d="M 85 127 C 91 129.5, 96 124.5, 100 127 C 104 129.5, 109 124.5, 115 127"
                  stroke="#3B0A6B"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                  className="animate-hermes-vocal-harmonic"
                />

                {/* Primary Voice Waveform Ribbon (Electric Cyan) */}
                <path
                  d="M 81 127 C 87 123, 93 131, 100 127 C 107 123, 113 131, 119 127"
                  stroke="#00E5FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  className="animate-hermes-vocal-primary"
                  filter="url(#cyanGlow)"
                />

                {/* Symmetrical Cyan Acoustic Resonance Ticks */}
                <circle cx="76" cy="127" r="1.5" fill="#00E5FF" fillOpacity="0.75" className="animate-pulse" />
                <circle cx="124" cy="127" r="1.5" fill="#00E5FF" fillOpacity="0.75" className="animate-pulse" />
              </g>
            )}

            {/* 2. THINKING STATE: 3 Meditative Luminous Data Dots */}
            {activeState === 'thinking' && (
              <g className="transition-opacity duration-300" filter="url(#cyanGlow)">
                <circle cx="92" cy="127" r="2" fill="#00E5FF">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="127" r="2.2" fill="#00E5FF">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" begin="0.25s" repeatCount="indefinite" />
                </circle>
                <circle cx="108" cy="127" r="2" fill="#00E5FF">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" begin="0.5s" repeatCount="indefinite" />
                </circle>
              </g>
            )}

            {/* 3. TOOL EXECUTION: Cyan Data Activity Telemetry Thread */}
            {activeState === 'tool' && (
              <g className="transition-opacity duration-300" filter="url(#cyanGlow)">
                <line 
                  x1="86" 
                  y1="127" 
                  x2="114" 
                  y2="127" 
                  stroke="#00E5FF" 
                  strokeWidth="2.2" 
                  strokeLinecap="round" 
                  className="animate-pulse" 
                />
              </g>
            )}

            {/* 4. LISTENING STATE: Receptive Attentive Cyan Curve */}
            {activeState === 'listening' && (
              <path
                d="M 91 126 Q 100 131 109 126"
                stroke="#00E5FF"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
                filter="url(#cyanGlow)"
                className="transition-all duration-300"
              />
            )}

            {/* 5. IDLE STATE: Serene Cyan Resting Aperture */}
            {activeState === 'idle' && (
              <path
                d="M 93 126.5 Q 100 129 107 126.5"
                stroke="rgba(0, 229, 255, 0.6)"
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
          className="w-28 sm:w-32 h-3.5 mt-1 rounded-[100%] bg-black/85 blur-[6px] pointer-events-none transition-all duration-300 will-change-transform" 
          style={{ transform: 'translateZ(-28px)' }}
        />
      )}

      {/* 5. Floating Status Badge (Jet Black × Royal Amethyst × Electric Cyan) */}
      {showStatusPill && (
        <div className={`mt-2.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide border transition-all duration-300 flex items-center space-x-1.5 shadow-sm hover:border-white/25 hover:shadow-[0_0_15px_rgba(255,255,255,0.08)] ${theme.statusBadge}`}>
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: theme.led }} />
          <span>{statusLabels[activeState]}</span>
        </div>
      )}
    </div>
  );
}
