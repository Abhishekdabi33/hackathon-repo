import React, { useEffect, useRef } from 'react';

/**
 * WorkspaceSpotlight - High-Performance Global & Localized Spotlight Glow
 * 
 * Tracks mouse position smoothly across the entire viewport.
 * Provides:
 * 1. Global luminous radial spotlight glow following the cursor everywhere across all UI.
 * 2. Real-time updates of --mouse-x and --mouse-y CSS custom properties on .spotlight-card elements.
 */
export default function WorkspaceSpotlight({ 
  containerRef, 
  className = '',
  global = true
}) {
  const spotlightRef = useRef(null);
  const animFrameRef = useRef(null);
  const idleTimerRef = useRef(null);

  const stateRef = useRef({
    targetX: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
    targetY: typeof window !== 'undefined' ? window.innerHeight / 3 : 300,
    currentX: typeof window !== 'undefined' ? window.innerWidth / 2 : 400,
    currentY: typeof window !== 'undefined' ? window.innerHeight / 3 : 300,
    targetOpacity: 0.8,
    currentOpacity: 0.8,
    isInside: true,
    isTouchDevice: false
  });

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stateRef.current.isTouchDevice = isTouch || prefersReducedMotion;

    const spotlightEl = spotlightRef.current;
    if (!spotlightEl) return;

    if (stateRef.current.isTouchDevice) {
      spotlightEl.style.opacity = '0.4';
      spotlightEl.style.background = `
        radial-gradient(circle 320px at 50% 25%, rgba(255, 255, 255, 0.06) 0%, transparent 75%)
      `;
      return;
    }

    const targetElement = (containerRef && containerRef.current && !global) 
      ? containerRef.current 
      : window;

    const handlePointerMove = (e) => {
      let localX = e.clientX;
      let localY = e.clientY;

      if (containerRef && containerRef.current && !global) {
        const rect = containerRef.current.getBoundingClientRect();
        localX = e.clientX - rect.left;
        localY = e.clientY - rect.top;
      }

      stateRef.current.targetX = localX;
      stateRef.current.targetY = localY;
      stateRef.current.targetOpacity = 1;
      stateRef.current.isInside = true;

      // Update localized CSS variables on any hovered .spotlight-card
      const card = e.target?.closest ? e.target.closest('.spotlight-card') : null;
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${(e.clientX - rect.left).toFixed(1)}px`);
        card.style.setProperty('--mouse-y', `${(e.clientY - rect.top).toFixed(1)}px`);
      }

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        if (stateRef.current.isInside) {
          stateRef.current.targetOpacity = 0.55;
        }
      }, 3000);
    };

    const handlePointerEnter = (e) => {
      stateRef.current.targetX = e.clientX;
      stateRef.current.targetY = e.clientY;
      stateRef.current.targetOpacity = 1;
      stateRef.current.isInside = true;
    };

    const handlePointerLeave = () => {
      stateRef.current.targetOpacity = 0.25;
      stateRef.current.isInside = false;
    };

    const updateMotion = () => {
      const s = stateRef.current;
      const lerpPos = 0.16;
      const lerpAlpha = 0.1;

      s.currentX += (s.targetX - s.currentX) * lerpPos;
      s.currentY += (s.targetY - s.currentY) * lerpPos;
      s.currentOpacity += (s.targetOpacity - s.currentOpacity) * lerpAlpha;

      if (spotlightEl) {
        spotlightEl.style.opacity = Math.max(0, Math.min(1, s.currentOpacity)).toFixed(3);
        spotlightEl.style.background = `
          radial-gradient(circle 80px at ${s.currentX.toFixed(1)}px ${s.currentY.toFixed(1)}px, rgba(255, 255, 255, 0.13) 0%, transparent 75%),
          radial-gradient(circle 240px at ${s.currentX.toFixed(1)}px ${s.currentY.toFixed(1)}px, rgba(255, 255, 255, 0.06) 0%, rgba(59, 10, 107, 0.05) 50%, transparent 75%),
          radial-gradient(circle 480px at ${s.currentX.toFixed(1)}px ${s.currentY.toFixed(1)}px, rgba(255, 255, 255, 0.025) 0%, transparent 85%)
        `;
      }

      animFrameRef.current = requestAnimationFrame(updateMotion);
    };

    targetElement.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerenter', handlePointerEnter, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    window.addEventListener('blur', handlePointerLeave);

    animFrameRef.current = requestAnimationFrame(updateMotion);

    return () => {
      targetElement.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerenter', handlePointerEnter);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [containerRef, global]);

  return (
    <div
      ref={spotlightRef}
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-30 overflow-hidden will-change-transform ${className}`}
      style={{
        transition: 'opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
      }}
    />
  );
}
