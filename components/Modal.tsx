'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { X } from 'lucide-react';

interface Props {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export default function Modal({ title, open, onClose, children, width = 520 }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return;
    if (open) {
      gsap.set(overlayRef.current, { display: 'flex' });
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      gsap.fromTo(panelRef.current, { y: 24, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.3, ease: 'power3.out' });
    } else {
      gsap.to(panelRef.current, { y: 16, scale: 0.97, opacity: 0, duration: 0.2, ease: 'power2.in' });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: () => {
        if (overlayRef.current) gsap.set(overlayRef.current, { display: 'none' });
      }});
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <div ref={overlayRef} style={{
      display: 'none', position: 'fixed', inset: 0, zIndex: 50,
      alignItems: 'center', justifyContent: 'center', padding: '16px',
      background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)',
    }} onClick={e => { if (e.target === overlayRef.current) onClose(); }}>
      <div ref={panelRef} style={{
        width: '100%', maxWidth: `${width}px`, borderRadius: '16px',
        background: '#FFFFFF', border: '1px solid rgba(15,23,42,0.1)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid rgba(15,23,42,0.07)',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>{title}</h2>
          <button onClick={onClose} style={{
            padding: '6px', borderRadius: '8px', border: 'none',
            background: 'transparent', cursor: 'pointer', color: '#94A3B8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}
