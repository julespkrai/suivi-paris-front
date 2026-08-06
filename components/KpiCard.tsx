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
  accent?: string;
}

function fmt(value: number, format: Props['format']) {
  if (format === 'currency') return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value);
  if (format === 'percent') return new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
  return new Intl.NumberFormat('fr-FR').format(value);
}

export default function KpiCard({ label, value, format = 'currency', positive, subtitle, icon, delay = 0, accent }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  let color = '#0F172A';
  let bg = '#FFFFFF';
  let iconBg = '#F1F5F9';
  let iconColor = '#64748B';

  if (accent) {
    color = accent;
    iconBg = accent + '18';
    iconColor = accent;
  } else if (positive === true) {
    color = '#059669';
    iconBg = '#ECFDF5';
    iconColor = '#059669';
  } else if (positive === false) {
    color = '#DC2626';
    iconBg = '#FEF2F2';
    iconColor = '#DC2626';
  }

  useEffect(() => {
    if (!ref.current || value === null) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current, { y: 12, opacity: 0, duration: 0.45, delay, ease: 'power3.out' });
      gsap.from({ val: 0 }, {
        val: value, duration: 0.9, delay: delay + 0.08, ease: 'power2.out',
        onUpdate() {
          if (numRef.current) numRef.current.textContent = fmt(this.targets()[0].val, format);
        }
      });
    });
    return () => ctx.revert();
  }, [value, delay, format]);

  return (
    <div ref={ref} style={{
      background: bg,
      border: '1px solid rgba(15,23,42,0.07)',
      borderRadius: '14px',
      padding: '20px 22px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', letterSpacing: '0.03em' }}>
          {label}
        </span>
        {icon && (
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: iconColor, flexShrink: 0,
          }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: '26px', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.01em' }}>
        <span ref={numRef}>{value !== null ? fmt(value, format) : '—'}</span>
      </div>
      {subtitle && (
        <p style={{ marginTop: '8px', fontSize: '12px', color: '#94A3B8' }}>{subtitle}</p>
      )}
    </div>
  );
}
