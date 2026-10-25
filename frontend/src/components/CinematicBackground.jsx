import React, { useEffect, useRef } from 'react';

/**
 * CinematicBackground - Atmospheric Deep Obsidian & Ambient Stardust Canvas
 * Palette: Deep Obsidian (#0A0A0C) × Pure White / Silver × Subtle Amethyst & Cyan
 * 
 * Features:
 * - 60FPS lightweight particle mesh with zero impact on UI responsiveness
 * - Delicate silver-white nodes with ultra-subtle connecting filaments
 * - Subtle ambient radial glows centered behind the avatar
 * - Seamless parallax response on feed scroll
 * - Respects prefers-reduced-motion (disables animation gracefully)
 */
export default function CinematicBackground({ scrollOffset = 0, className = '' }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    if (prefersReducedMotion) {
      return () => window.removeEventListener('resize', handleResize);
    }

    // Initialize 36 lightweight ambient particles
    const particleCount = Math.min(36, Math.floor(width / 38));
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        radius: Math.random() * 1.2 + 0.6,
        alpha: Math.random() * 0.25 + 0.1,
        // 80% subtle silver/white, 12% faint amethyst, 8% faint cyan
        color: i % 10 === 0 
          ? 'rgba(0, 229, 255,' 
          : i % 8 === 0 
            ? 'rgba(150, 60, 230,' 
            : 'rgba(255, 255, 255,'
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render delicate connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.055;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }
      }

      // Update & render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.alpha})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div 
      aria-hidden="true" 
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
    >
      {/* 1. Deep Obsidian Base Canvas */}
      <div className="absolute inset-0 bg-[#0A0A0C]" />

      {/* 2. Atmospheric Radial Illumination behind Avatar with subtle Parallax */}
      <div 
        style={{ transform: `translate(-50%, ${scrollOffset * 0.12}px)` }}
        className="absolute top-0 left-1/2 w-[820px] h-[480px] pointer-events-none will-change-transform opacity-70"
      >
        <div 
          className="w-full h-full"
          style={{
            background: `
              radial-gradient(ellipse 65% 55% at 50% 25%, rgba(255, 255, 255, 0.035) 0%, transparent 60%),
              radial-gradient(ellipse 80% 65% at 50% 32%, rgba(0, 229, 255, 0.04) 0%, rgba(0, 229, 255, 0.01) 40%, transparent 70%),
              radial-gradient(ellipse 95% 80% at 50% 38%, rgba(59, 10, 107, 0.22) 0%, rgba(59, 10, 107, 0.08) 50%, transparent 85%)
            `
          }}
        />
      </div>

      {/* 3. Delicate Ambient Stardust Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
      />

      {/* 4. Subtle Vignette Border Mask */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 65%, rgba(10, 10, 12, 0.6) 100%)'
        }}
      />
    </div>
  );
}
