'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface Props {
  label: string;
  value: number | null;
  format?: 'currency' | 'percent' | 'number';
  positive?: boolean | null;
  subtitle?: string;
  icon?: React.ReactNode;
  delay?: number;
}

function fmt(value: number, format: Props['format']) {
  if (format === 'currency') return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value);
  if (format === 'percent') return new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
  return new Intl.NumberFormat('fr-FR').format(value);
}

export default function KpiCard({ label, value, format = 'currency', positive, subtitle, icon, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  const isPositive = positive ?? (value !== null && value >= 0);
  const colorVar = value === null ? 'var(--muted)' : (isPositive ? 'var(--green)' : 'var(--red)');
  const glowClass = value === null ? '' : (isPositive ? 'glow-green' : 'glow-red');

  useEffect(() => {
    if (!ref.current || value === null) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current, { y: 20, opacity: 0, duration: 0.6, delay, ease: 'power3.out' });
      gsap.from({ val: 0 }, {
        val: value, duration: 1.2, delay: delay + 0.1, ease: 'power2.out',
        onUpdate() {
          if (numRef.current) numRef.current.textContent = fmt(this.targets()[0].val, format);
        }
      });
    });
    return () => ctx.revert();
  }, [value, delay, format]);

  return (
    <div ref={ref} className={`rounded-2xl p-5 ${glowClass}`} style={{
      background: 'var(--surface)',
      border: `1px solid ${value !== null && !isPositive ? 'rgba(255,61,113,0.2)' : value !== null && isPositive ? 'rgba(0,230,118,0.15)' : 'var(--border)'}`,
    }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          {label}
        </span>
        {icon && <span style={{ color: 'var(--muted)' }}>{icon}</span>}
      </div>
      <div className="font-display font-bold text-2xl" style={{ color: colorVar, fontVariantNumeric: 'tabular-nums' }}>
        <span ref={numRef}>{value !== null ? fmt(value, format) : '—'}</span>
      </div>
      {subtitle && <p className="mt-1.5 text-xs" style={{ color: 'var(--muted)' }}>{subtitle}</p>}
    </div>
  );
}
