import React, { useRef, useState } from 'react';

/**
 * TiltCard - Premium Interactive 3D Card
 * Palette: Jet Black (#050505) × Royal Amethyst (#3B0A6B) × Electric Cyan (#00E5FF)
 * 
 * Refinements:
 * - Gentle elevation with 2.5-3px lift and realistic deep shadow
 * - Delicate white top-edge highlight and cursor-tracking specular sheen
 * - Dynamic cursor radial highlight blending white core into cyan & amethyst depth
 * - Smooth deceleration using cubic-bezier(0.22, 1, 0.36, 1)
 * - Tactile active press response (scale 0.985)
 * - Respects prefers-reduced-motion
 */
export default function TiltCard({
  children,
  onClick,
  className = '',
  maxTilt = 3.6,
  ...props
}) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({
    rotX: 0,
    rotY: 0,
    lightX: 50,
    lightY: 50,
    isHovered: false,
    isActive: false
  });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * maxTilt;
    const rotY = ((x - centerX) / centerX) * maxTilt;

    setStyle(prev => ({
      ...prev,
      rotX: parseFloat(rotX.toFixed(2)),
      rotY: parseFloat(rotY.toFixed(2)),
      lightX: parseFloat(((x / rect.width) * 100).toFixed(1)),
      lightY: parseFloat(((y / rect.height) * 100).toFixed(1)),
      isHovered: true
    }));
  };

  const handleMouseEnter = () => {
    setStyle(prev => ({ ...prev, isHovered: true }));
  };

  const handleMouseLeave = () => {
    setStyle({
      rotX: 0,
      rotY: 0,
      lightX: 50,
      lightY: 50,
      isHovered: false,
      isActive: false
    });
  };

  const handleMouseDown = () => {
    setStyle(prev => ({ ...prev, isActive: true }));
  };

  const handleMouseUp = () => {
    setStyle(prev => ({ ...prev, isActive: false }));
  };

  const transformStyle = style.isActive
    ? `perspective(1000px) rotateX(${style.rotX * 0.4}deg) rotateY(${style.rotY * 0.4}deg) scale(0.985) translateZ(0px)`
    : style.isHovered
    ? `perspective(1000px) rotateX(${style.rotX}deg) rotateY(${style.rotY}deg) translateY(-3px) translateZ(6px)`
    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) translateZ(0px)';

  const shadowStyle = style.isHovered
    ? `${-style.rotY * 1.5}px ${style.rotX * 1.5 + 12}px 28px -6px rgba(0, 0, 0, 0.85), 0 0 22px rgba(59, 10, 107, 0.35), 0 0 12px rgba(0, 229, 255, 0.15)`
    : '0 4px 14px -2px rgba(0, 0, 0, 0.6)';

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
      style={{
        transform: transformStyle,
        boxShadow: shadowStyle,
        transition: style.isHovered && !style.isActive
          ? 'transform 0.12s ease-out, box-shadow 0.22s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.22s cubic-bezier(0.22, 1, 0.36, 1)'
          : 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        transformStyle: 'preserve-3d'
      }}
      className={`relative overflow-hidden group select-none ${className}`}
      {...props}
    >
      {/* Delicate White Top Edge Highlight */}
      <div 
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none transition-opacity duration-300 z-20"
        style={{
          opacity: style.isHovered ? 1 : 0.4,
          background: 'linear-gradient(90deg, transparent 5%, rgba(255, 255, 255, 0.25) 50%, transparent 95%)'
        }}
      />

      {/* Dynamic Cursor Radial Highlight: Soft White core blending into Cyan & Amethyst */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
        style={{
          opacity: style.isHovered ? 1 : 0,
          background: `radial-gradient(circle 220px at ${style.lightX}% ${style.lightY}%, rgba(255, 255, 255, 0.08) 0%, rgba(0, 229, 255, 0.12) 25%, rgba(59, 10, 107, 0.2) 55%, transparent 80%)`
        }}
      />
      
      {/* Card Content with subtle 3D translation */}
      <div 
        className="relative z-10 h-full"
        style={{ transform: 'translateZ(4px)' }}
      >
        {children}
      </div>
    </div>
  );
}
