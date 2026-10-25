import React, { useRef, useEffect } from 'react';

/**
 * TiltCard - Monochrome Glassmorphic Card
 * Design Tokens:
 * - Surface: bg-white/[0.03] to bg-white/[0.06]
 * - Borders: border-white/10 (normal) to border-white/20 (hover)
 * - Localized Glow: low-opacity white radial glow rgba(255, 255, 255, 0.05)
 */
export default function TiltCard({
  children,
  onClick,
  className = '',
  maxTilt = 3.2,
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

      if (!p.isReducedMotion) {
        const transY = p.isHovered && !p.isActive ? -2 : p.isActive ? 1 : 0;
        const scale = p.isActive ? 0.988 : 1;
        const transZ = p.isHovered ? 5 : 0;

        card.style.transform = `perspective(1000px) rotateX(${p.currentRotX.toFixed(2)}deg) rotateY(${p.currentRotY.toFixed(2)}deg) translateY(${transY}px) translateZ(${transZ}px) scale(${scale})`;

        const shadowX = -p.currentRotY * 1.2;
        const shadowY = p.currentRotX * 1.2 + (p.isHovered ? 10 : 3);
        const shadowBlur = p.isHovered ? 20 : 10;
        card.style.boxShadow = p.isHovered
          ? `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur}px -4px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.15)`
          : '0 4px 14px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
      }

      // Low-opacity white localized spotlight
      highlight.style.opacity = Math.max(0, Math.min(1, p.currentOpacity)).toFixed(3);
      highlight.style.background = `
        radial-gradient(circle 120px at ${p.currentLightX.toFixed(1)}px ${p.currentLightY.toFixed(1)}px, rgba(255, 255, 255, 0.16) 0%, transparent 80%),
        radial-gradient(circle 180px at ${p.currentLightX.toFixed(1)}px ${p.currentLightY.toFixed(1)}px, rgba(255, 255, 255, 0.02) 0%, transparent 75%)
      `;

      const deltaRot = Math.abs(p.targetRotX - p.currentRotX) + Math.abs(p.targetRotY - p.currentRotY);
      const deltaOpacity = Math.abs(p.targetOpacity - p.currentOpacity);

      if (p.isHovered || deltaRot > 0.02 || deltaOpacity > 0.01) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        isRunning = false;
      }
    };

    const handlePointerMove = (e) => {
      const rect = card.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      const normX = (localX / rect.width - 0.5) * 2;
      const normY = (localY / rect.height - 0.5) * 2;

      const p = physicsRef.current;
      p.targetRotY = normX * maxTilt;
      p.targetRotX = -normY * maxTilt;
      p.targetLightX = localX;
      p.targetLightY = localY;
      p.targetOpacity = 1;
      p.isHovered = true;

      if (!isRunning) {
        isRunning = true;
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const handlePointerEnter = (e) => {
      const rect = card.getBoundingClientRect();
      const p = physicsRef.current;
      p.isHovered = true;
      p.targetLightX = e.clientX - rect.left;
      p.targetLightY = e.clientY - rect.top;
      p.targetOpacity = 1;

      if (!isRunning) {
        isRunning = true;
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const handlePointerLeave = () => {
      const p = physicsRef.current;
      p.isHovered = false;
      p.isActive = false;
      p.targetRotX = 0;
      p.targetRotY = 0;
      p.targetOpacity = 0;

      if (!isRunning) {
        isRunning = true;
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const handlePointerDown = () => {
      physicsRef.current.isActive = true;
      if (!isRunning) {
        isRunning = true;
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const handlePointerUp = () => {
      physicsRef.current.isActive = false;
      if (!isRunning) {
        isRunning = true;
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    card.addEventListener('pointermove', handlePointerMove, { passive: true });
    card.addEventListener('pointerenter', handlePointerEnter, { passive: true });
    card.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    card.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });

    return () => {
      card.removeEventListener('pointermove', handlePointerMove);
      card.removeEventListener('pointerenter', handlePointerEnter);
      card.removeEventListener('pointerleave', handlePointerLeave);
      card.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [maxTilt]);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`relative overflow-hidden group select-none transition-colors duration-200 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform, box-shadow'
      }}
      {...props}
    >
      {/* Specular Localized Low-Opacity White Spotlight */}
      <div
        ref={highlightRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 z-10"
        style={{ opacity: 0 }}
      />

      {/* Top-Edge Highlight Line */}
      <div 
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-10" 
      />

      {/* Card Content */}
      <div className="relative z-0 h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}
