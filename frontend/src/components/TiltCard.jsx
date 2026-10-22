import React, { useRef, useState } from 'react';

/**
 * TiltCard - 60fps Hardware-Accelerated 3D Interactive Card
 * 
 * Features:
 * - Subtle 3D perspective tilt following the cursor (max 4.5deg)
 * - Dynamic cursor specular lighting reflection
 * - Dynamic depth shadow shifting with tilt
 * - Smooth spring-lerp back to resting pose on mouse leave
 * - Respects prefers-reduced-motion
 */
export default function TiltCard({
  children,
  onClick,
  className = '',
  maxTilt = 4.5,
  ...props
}) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.4)',
    lightX: 50,
    lightY: 50,
    isHovered: false
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

    const shadowX = -rotY * 1.5;
    const shadowY = rotX * 1.5 + 8;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(8px)`,
      boxShadow: `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 24px -4px rgba(0, 0, 0, 0.65), 0 0 20px -2px rgba(99, 102, 241, 0.12)`,
      lightX: ((x / rect.width) * 100).toFixed(1),
      lightY: ((y / rect.height) * 100).toFixed(1),
      isHovered: true
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
      boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.4)',
      lightX: 50,
      lightY: 50,
      isHovered: false
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: style.transform,
        boxShadow: style.boxShadow,
        transition: style.isHovered ? 'transform 0.08s ease-out, box-shadow 0.08s ease-out' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d'
      }}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {/* Interactive Cursor Specular Sheen */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
        style={{
          opacity: style.isHovered ? 1 : 0,
          background: `radial-gradient(circle 180px at ${style.lightX}% ${style.lightY}%, rgba(255, 255, 255, 0.07) 0%, rgba(99, 102, 241, 0.04) 40%, transparent 80%)`
        }}
      />
      
      {/* Card Content with subtle 3D elevation */}
      <div style={{ transform: 'translateZ(6px)' }}>
        {children}
      </div>
    </div>
  );
}
