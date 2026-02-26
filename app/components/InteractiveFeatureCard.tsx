'use client';

import { useRef, useState } from 'react';

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: string;
  index: number;
}

export default function InteractiveFeatureCard({ title, desc, icon, index }: FeatureCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative bg-[var(--bg-card)] border border-[var(--border-default)] rounded-lg p-6 overflow-hidden transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 animate-fade-in-up"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Spotlight effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 40%)`,
        }}
      />
      
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-blue-500/20 group-hover:scale-110">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-500"
          >
            <path d={icon} />
          </svg>
        </div>
        <h3 className="font-[family-name:var(--font-display)] text-[0.95rem] font-semibold mb-2 text-[var(--text-primary)]">
          {title}
        </h3>
        <p className="text-[0.82rem] text-[var(--text-muted)] leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}
