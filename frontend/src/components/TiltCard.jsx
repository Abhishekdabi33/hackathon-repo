import React, { useRef, useEffect } from 'react';

/**
 * TiltCard - 60FPS Tactile Interactive Card with Localized Cursor Spotlight
 * Palette: Jet Black (#050505) × Royal Amethyst (#3B0A6B) × Electric Cyan (#00E5FF)
 * 
 * Features:
 * - High-precision local coordinate tracking (exact pixels, no percentage distortion)
 * - requestAnimationFrame lerping without React re-renders on mousemove
 * - Multi-layer blended spotlight: subtle white reflection + cyan accent + royal amethyst depth
 * - Clipped neatly to rounded corners with overflow-hidden
 * - Gentle elevation and realistic 3D shadow shifting with tilt
 * - Delicate white top-edge reflection
 * - Pauses RAF loop when idle/resting to conserve resources
 * - Respects prefers-reduced-motion
 */
export default function TiltCard({
  children,
  onClick,
  className = '',
  maxTilt = 3.4,
  ...props
}) {
  const cardRef = useRef(null);
  const highlightRef = useRef(null);
  const rafRef = useRef(null);

  const physicsRef = useRef({
    targetRotX: 0,
    targetRotY: 0,
    currentRotX: 0,
    currentRotY: 0,
    targetLightX: 0,
    targetLightY: 0,
    currentLightX: 0,
    currentLightY: 0,
    targetOpacity: 0,
    currentOpacity: 0,
    isHovered: false,
    isActive: false,
    isReducedMotion: false
  });

  useEffect(() => {
    const card = cardRef.current;
    const highlight = highlightRef.current;
    if (!card || !highlight) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    physicsRef.current.isReducedMotion = prefersReducedMotion;

    // Render loop
    let isRunning = false;

    const tick = () => {
      const p = physicsRef.current;
      const lerpPos = 0.16;
      const lerpAlpha = 0.12;

      p.currentRotX += (p.targetRotX - p.currentRotX) * lerpPos;
      p.currentRotY += (p.targetRotY - p.currentRotY) * lerpPos;
      p.currentLightX += (p.targetLightX - p.currentLightX) * lerpPos;
      p.currentLightY += (p.targetLightY - p.currentLightY) * lerpPos;
      p.currentOpacity += (p.targetOpacity - p.currentOpacity) * lerpAlpha;

      // Apply transforms
      if (!p.isReducedMotion) {
        const transY = p.isHovered && !p.isActive ? -3 : p.isActive ? 1 : 0;
        const scale = p.isActive ? 0.985 : 1;
        const transZ = p.isHovered ? 6 : 0;

        card.style.transform = `perspective(1000px) rotateX(${p.currentRotX.toFixed(2)}deg) rotateY(${p.currentRotY.toFixed(2)}deg) translateY(${transY}px) translateZ(${transZ}px) scale(${scale})`;

        const shadowX = -p.currentRotY * 1.5;
        const shadowY = p.currentRotX * 1.5 + (p.isHovered ? 12 : 4);
        const shadowBlur = p.isHovered ? 26 : 14;
        card.style.boxShadow = p.isHovered
          ? `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur}px -6px rgba(0, 0, 0, 0.85), 0 0 20px rgba(59, 10, 107, 0.35), 0 0 10px rgba(0, 229, 255, 0.12)`
          : '0 4px 14px -2px rgba(0, 0, 0, 0.6)';
      }

      // Apply localized spotlight
      highlight.style.opacity = Math.max(0, Math.min(1, p.currentOpacity)).toFixed(3);
      highlight.style.background = `
        radial-gradient(circle 60px at ${p.currentLightX.toFixed(1)}px ${p.currentLightY.toFixed(1)}px, rgba(255, 255, 255, 0.075) 0%, transparent 80%),
        radial-gradient(circle 140px at ${p.currentLightX.toFixed(1)}px ${p.currentLightY.toFixed(1)}px, rgba(0, 229, 255, 0.09) 0%, rgba(0, 229, 255, 0.015) 55%, transparent 85%),
        radial-gradient(circle 260px at ${p.currentLightX.toFixed(1)}px ${p.currentLightY.toFixed(1)}px, rgba(59, 10, 107, 0.28) 0%, rgba(59, 10, 107, 0.08) 50%, transparent 80%)
      `;

      // Keep running if hovered or still transitioning back to resting pose
      const deltaRot = Math.abs(p.targetRotX - p.currentRotX) + Math.abs(p.targetRotY - p.currentRotY);
      const deltaOpacity = Math.abs(p.targetOpacity - p.currentOpacity);

      if (p.isHovered || deltaRot > 0.02 || deltaOpacity > 0.01) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        isRunning = false;
      }
    };

    const startLoop = () => {
      if (!isRunning) {
        isRunning = true;
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (e) => {
      const rect = card.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      const p = physicsRef.current;
      p.targetLightX = localX;
      p.targetLightY = localY;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      p.targetRotX = -((localY - centerY) / centerY) * maxTilt;
      p.targetRotY = ((localX - centerX) / centerX) * maxTilt;
      p.targetOpacity = 1;
      p.isHovered = true;

      startLoop();
    };

    const handlePointerEnter = (e) => {
      const rect = card.getBoundingClientRect();
      const p = physicsRef.current;
      p.targetLightX = e.clientX - rect.left;
      p.targetLightY = e.clientY - rect.top;
      p.currentLightX = p.targetLightX;
      p.currentLightY = p.targetLightY;
      p.targetOpacity = 1;
      p.isHovered = true;
      startLoop();
    };

    const handlePointerLeave = () => {
      const p = physicsRef.current;
      p.targetRotX = 0;
      p.targetRotY = 0;
      p.targetOpacity = 0;
      p.isHovered = false;
      p.isActive = false;
      startLoop();
    };

    const handlePointerDown = () => {
      physicsRef.current.isActive = true;
      startLoop();
    };

    const handlePointerUp = () => {
      physicsRef.current.isActive = false;
      startLoop();
    };

    card.addEventListener('pointermove', handlePointerMove, { passive: true });
    card.addEventListener('pointerenter', handlePointerEnter, { passive: true });
    card.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    card.addEventListener('pointerdown', handlePointerDown, { passive: true });
    card.addEventListener('pointerup', handlePointerUp, { passive: true });

    return () => {
      card.removeEventListener('pointermove', handlePointerMove);
      card.removeEventListener('pointerenter', handlePointerEnter);
      card.removeEventListener('pointerleave', handlePointerLeave);
      card.removeEventListener('pointerdown', handlePointerDown);
      card.removeEventListener('pointerup', handlePointerUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [maxTilt]);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`relative overflow-hidden group select-none ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'border-color 0.22s cubic-bezier(0.22, 1, 0.36, 1)'
      }}
      {...props}
    >
      {/* Delicate White Top Edge Highlight */}
      <div 
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none transition-opacity duration-300 z-20"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, rgba(255, 255, 255, 0.25) 50%, transparent 95%)'
        }}
      />

      {/* Dynamic Localized Cursor Radial Spotlight */}
      <div
        ref={highlightRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-10 will-change-[background,opacity]"
        style={{
          opacity: 0,
          transition: 'opacity 0.25s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      />
      
      {/* Card Content with subtle 3D translation */}
      <div 
        className="relative z-20 h-full"
        style={{ transform: 'translateZ(4px)' }}
      >
        {children}
      </div>
    </div>
  );
}
