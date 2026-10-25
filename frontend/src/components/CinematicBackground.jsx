import React, { useEffect, useRef } from 'react';

/**
 * CinematicBackground - Deep Obsidian Black (#070709) with Low-Opacity White Radial Glow
 * Design Tokens:
 * - Background Primary Base: #070709
 * - Subtle Radial Glow: rgba(255, 255, 255, 0.05)
 * - Delicate monochrome stardust plexus node effect
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

    // 32 lightweight monochrome particles
    const particleCount = Math.min(32, Math.floor(width / 42));
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        radius: Math.random() * 1.1 + 0.5,
        alpha: Math.random() * 0.20 + 0.06
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render subtle connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 105) {
            const lineAlpha = (1 - dist / 105) * 0.045;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Render monochrome stardust particles
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
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
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
      {/* 1. Primary Base: #070709 (Deep Obsidian Black) */}
      <div className="absolute inset-0 bg-[#070709]" />

      {/* 2. Low-Opacity White Radial Glow centered behind avatar with Parallax */}
      <div 
        style={{ transform: `translate(-50%, ${scrollOffset * 0.1}px)` }}
        className="absolute top-0 left-1/2 w-[800px] h-[480px] pointer-events-none will-change-transform opacity-100"
      >
        <div 
          className="w-full h-full"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 50% 25%, rgba(255, 255, 255, 0.05) 0%, transparent 60%),
              radial-gradient(ellipse 80% 65% at 50% 32%, rgba(255, 255, 255, 0.025) 0%, transparent 70%),
              radial-gradient(ellipse 95% 85% at 50% 38%, rgba(255, 255, 255, 0.01) 0%, transparent 85%)
            `
          }}
        />
      </div>

      {/* 3. Subtle Animated Plexus Nodes Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-50"
      />

      {/* 4. Soft Vignette Mask */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 70%, rgba(7, 7, 9, 0.65) 100%)'
        }}
      />
    </div>
  );
}
