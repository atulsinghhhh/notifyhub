'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: string;
  label: string;
}

export default function AnimatedCounter({ value, label }: AnimatedCounterProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Parse numeric value from string
    const match = value.match(/[\d.]+/);
    if (!match) return;

    const target = parseFloat(match[0]);
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  const formatValue = (val: number) => {
    if (value.includes('M+')) return `${val.toFixed(0)}M+`;
    if (value.includes('%')) return `${val.toFixed(1)}%`;
    if (value.includes('<')) return `<${val.toFixed(0)}ms`;
    return val.toFixed(0);
  };

  return (
    <div ref={ref} className="text-center">
      <div className="font-mono text-2xl font-medium text-blue-500 leading-none">
        {isVisible ? formatValue(count) : value}
      </div>
      <div className="text-[0.7rem] uppercase tracking-widest text-[var(--text-muted)] mt-1">
        {label}
      </div>
    </div>
  );
}
