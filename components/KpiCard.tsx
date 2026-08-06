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

  const color = value === null || positive === null
    ? 'var(--text)'
    : positive
      ? 'var(--green)'
      : 'var(--red)';

  const borderColor = value === null || positive === null
    ? 'rgba(255,255,255,0.07)'
    : positive
      ? 'rgba(0,230,118,0.18)'
      : 'rgba(255,61,113,0.18)';

  useEffect(() => {
    if (!ref.current || value === null) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current, { y: 16, opacity: 0, duration: 0.5, delay, ease: 'power3.out' });
      gsap.from({ val: 0 }, {
        val: value, duration: 1.0, delay: delay + 0.1, ease: 'power2.out',
        onUpdate() {
          if (numRef.current) numRef.current.textContent = fmt(this.targets()[0].val, format);
        }
      });
    });
    return () => ctx.revert();
  }, [value, delay, format]);

  return (
    <div ref={ref} style={{
      background: 'var(--surface)',
      border: `1px solid ${borderColor}`,
      borderRadius: '16px',
      padding: '20px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)' }}>
          {label}
        </span>
        {icon && <span style={{ color: 'var(--muted)', opacity: 0.7 }}>{icon}</span>}
      </div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '22px', color, fontVariantNumeric: 'tabular-nums' }}>
        <span ref={numRef}>{value !== null ? fmt(value, format) : '—'}</span>
      </div>
      {subtitle && (
        <p style={{ marginTop: '6px', fontSize: '12px', color: 'var(--muted)' }}>{subtitle}</p>
      )}
    </div>
  );
}
