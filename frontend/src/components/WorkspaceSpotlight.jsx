import React, { useEffect, useRef } from 'react';

/**
 * WorkspaceSpotlight - Low-Opacity White Radial Spotlight
 * Design Tokens:
 * - Low-opacity white radial glows: rgba(255, 255, 255, 0.05)
 * - Deep obsidian falloff: #070709
 */
export default function WorkspaceSpotlight({ containerRef, className = '' }) {
  const spotlightRef = useRef(null);
  const animFrameRef = useRef(null);
  const idleTimerRef = useRef(null);

  const stateRef = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    targetOpacity: 0,
    currentOpacity: 0,
    isInside: false,
    isTouchDevice: false
  });

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stateRef.current.isTouchDevice = isTouch || prefersReducedMotion;

    const container = containerRef?.current || document.body;
    const spotlightEl = spotlightRef.current;
    if (!spotlightEl) return;

    if (stateRef.current.isTouchDevice) {
      spotlightEl.style.opacity = '0.3';
      spotlightEl.style.background = `
        radial-gradient(circle 500px at 50% 22%, rgba(255, 255, 255, 0.04) 0%, transparent 75%)
      `;
      return;
    }

    const initRect = container.getBoundingClientRect();
    stateRef.current.currentX = initRect.width / 2;
    stateRef.current.currentY = Math.min(240, initRect.height / 3);
    stateRef.current.targetX = stateRef.current.currentX;
    stateRef.current.targetY = stateRef.current.currentY;
    stateRef.current.currentOpacity = 0.4;
    stateRef.current.targetOpacity = 0.4;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      stateRef.current.targetX = localX;
      stateRef.current.targetY = localY;
      stateRef.current.targetOpacity = 1;
      stateRef.current.isInside = true;

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        if (stateRef.current.isInside) {
          stateRef.current.targetOpacity = 0.4;
        }
      }, 3500);
    };

    const handlePointerEnter = (e) => {
      const rect = container.getBoundingClientRect();
      stateRef.current.targetX = e.clientX - rect.left;
      stateRef.current.targetY = e.clientY - rect.top;
      stateRef.current.targetOpacity = 1;
      stateRef.current.isInside = true;
    };

    const handlePointerLeave = () => {
      stateRef.current.targetOpacity = 0.2;
      stateRef.current.isInside = false;
    };

    const updateMotion = () => {
      const s = stateRef.current;
      const lerpPos = 0.14;
      const lerpAlpha = 0.08;

      s.currentX += (s.targetX - s.currentX) * lerpPos;
      s.currentY += (s.targetY - s.currentY) * lerpPos;
      s.currentOpacity += (s.targetOpacity - s.currentOpacity) * lerpAlpha;

      if (spotlightEl) {
        spotlightEl.style.opacity = Math.max(0, Math.min(1, s.currentOpacity)).toFixed(3);
        spotlightEl.style.background = `
          radial-gradient(circle 85px at ${s.currentX.toFixed(1)}px ${s.currentY.toFixed(1)}px, rgba(255, 255, 255, 0.05) 0%, transparent 80%),
          radial-gradient(circle 280px at ${s.currentX.toFixed(1)}px ${s.currentY.toFixed(1)}px, rgba(255, 255, 255, 0.025) 0%, transparent 75%),
          radial-gradient(circle 600px at ${s.currentX.toFixed(1)}px ${s.currentY.toFixed(1)}px, rgba(255, 255, 255, 0.012) 0%, transparent 85%)
        `;
      }

      animFrameRef.current = requestAnimationFrame(updateMotion);
    };

    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerenter', handlePointerEnter, { passive: true });
    container.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    window.addEventListener('blur', handlePointerLeave);

    animFrameRef.current = requestAnimationFrame(updateMotion);

    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerenter', handlePointerEnter);
      container.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [containerRef]);

  return (
    <div
      ref={spotlightRef}
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none z-0 overflow-hidden will-change-transform ${className}`}
      style={{
        transition: 'opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)'
      }}
    />
  );
}
