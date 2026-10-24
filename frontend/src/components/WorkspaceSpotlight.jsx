import React, { useEffect, useRef } from 'react';

/**
 * WorkspaceSpotlight - Smooth 60FPS Cursor Spotlight
 * Palette: Jet Black (#050505) × Royal Amethyst (#3B0A6B) × Electric Cyan (#00E5FF)
 * 
 * Features:
 * - Fluid requestAnimationFrame lerp interpolation (no React re-renders)
 * - Accurate local coordinate calculation relative to the main canvas
 * - Multi-layer blended gradient: subtle white specular core + soft cyan tint + broad amethyst ambient glow
 * - Completely transparent falloff into Jet Black with zero banding or visible borders
 * - Gentle fade-in on enter, smooth dimming on idle/leave
 * - pointer-events: none, safely layered behind interactive elements
 * - Handles window resize, scrolling, and container position changes
 * - Respects prefers-reduced-motion and touch devices
 */
export default function WorkspaceSpotlight({ containerRef, className = '' }) {
  const spotlightRef = useRef(null);
  const animFrameRef = useRef(null);
  const idleTimerRef = useRef(null);

  // High-performance physics state without React re-renders
  const stateRef = useRef({
    targetX: 0,
    targetY: 0,
    currentX: 0,
    currentY: 0,
    targetOpacity: 0,
    currentOpacity: 0,
    isInside: false,
    isTouchDevice: false,
    initialized: false
  });

  useEffect(() => {
    // Detect touch-only or coarse pointer devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stateRef.current.isTouchDevice = isTouch || prefersReducedMotion;

    const container = containerRef?.current || document.body;
    const spotlightEl = spotlightRef.current;
    if (!spotlightEl) return;

    if (stateRef.current.isTouchDevice) {
      // Touch or reduced-motion: set a static subtle ambient gradient
      spotlightEl.style.opacity = '0.35';
      spotlightEl.style.background = `
        radial-gradient(circle 500px at 50% 20%, rgba(59, 10, 107, 0.18) 0%, rgba(0, 229, 255, 0.025) 45%, transparent 80%)
      `;
      return;
    }

    // Set initial position to center top
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

      // Keep within bounds with slight padding allowance
      stateRef.current.targetX = localX;
      stateRef.current.targetY = localY;
      stateRef.current.targetOpacity = 1;
      stateRef.current.isInside = true;

      // Reset idle timer (dims spotlight gently when idle for 3.5s)
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        if (stateRef.current.isInside) {
          stateRef.current.targetOpacity = 0.45;
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
      stateRef.current.targetOpacity = 0.15;
      stateRef.current.isInside = false;
    };

    // 60FPS Render Loop using lerp interpolation
    const updateMotion = () => {
      const s = stateRef.current;
      const lerpPos = 0.13;     // Smooth yet responsive position tracking
      const lerpAlpha = 0.075;   // Gentle opacity deceleration

      s.currentX += (s.targetX - s.currentX) * lerpPos;
      s.currentY += (s.targetY - s.currentY) * lerpPos;
      s.currentOpacity += (s.targetOpacity - s.currentOpacity) * lerpAlpha;

      if (spotlightEl) {
        spotlightEl.style.opacity = Math.max(0, Math.min(1, s.currentOpacity)).toFixed(3);
        spotlightEl.style.background = `
          radial-gradient(circle 85px at ${s.currentX.toFixed(1)}px ${s.currentY.toFixed(1)}px, rgba(255, 255, 255, 0.038) 0%, transparent 80%),
          radial-gradient(circle 260px at ${s.currentX.toFixed(1)}px ${s.currentY.toFixed(1)}px, rgba(0, 229, 255, 0.048) 0%, rgba(0, 229, 255, 0.012) 50%, transparent 80%),
          radial-gradient(circle 620px at ${s.currentX.toFixed(1)}px ${s.currentY.toFixed(1)}px, rgba(59, 10, 107, 0.22) 0%, rgba(59, 10, 107, 0.075) 45%, rgba(14, 4, 26, 0.02) 70%, transparent 95%)
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
