'use client';
import { useEffect, useState } from 'react';
import { api, CommunityPari } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import { Users, AlertCircle } from 'lucide-react';

const fmt = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(v);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

const CANAL_COLORS: Record<string, { bg: string; color: string }> = {
  Winamax:  { bg: '#FFF7ED', color: '#EA580C' },
  Betclic:  { bg: '#EFF6FF', color: '#2563EB' },
  Tabac:    { bg: '#FFFBEB', color: '#D97706' },
};

export default function CommunityPage() {
  const [paris, setParis] = useState<CommunityPari[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get<CommunityPari[]>('/community')
      .then(setParis)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Communauté
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B' }}>
            Les derniers paris joués par les membres
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px', borderRadius: '10px',
          background: '#EFF6FF', color: '#2563EB',
          fontSize: '13px', fontWeight: 600,
        }}>
          <Users size={15} />
          {paris.length} paris
        </div>
      </div>

      {err && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px',
          borderRadius: '12px', marginBottom: '24px', fontSize: '13.5px',
          background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
        }}>
          <AlertCircle size={15} /> {err}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              borderRadius: '14px', height: '78px',
              background: 'white', border: '1px solid rgba(15,23,42,0.07)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
      )}

      {!loading && paris.length === 0 && !err && (
        <div style={{
          borderRadius: '16px', padding: '48px 32px', textAlign: 'center',
          background: 'white', border: '1px solid rgba(15,23,42,0.07)',
        }}>
          <Users size={32} color="#CBD5E1" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Aucun pari partagé</p>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>Les paris des membres apparaîtront ici.</p>
        </div>
      )}

      {!loading && paris.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {paris.map(p => {
            const canalStyle = CANAL_COLORS[p.canal] || { bg: '#F8FAFC', color: '#475569' };
            return (
              <div key={p.id} style={{
                borderRadius: '14px', padding: '16px 20px',
                background: 'white', border: '1px solid rgba(15,23,42,0.07)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                {/* Avatar pseudo */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700, color: 'white',
                }}>
                  {p.pseudo.slice(0, 2).toUpperCase()}
                </div>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{p.pseudo}</span>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px',
                      background: canalStyle.bg, color: canalStyle.color,
                    }}>{p.canal}</span>
                    {p.sport && (
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>{p.sport}</span>
                    )}
                  </div>
                  <p style={{
                    fontSize: '13px', color: '#475569',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: '400px',
                  }}>
                    {p.description || p.competition || '—'}
                  </p>
                </div>

                {/* Cote */}
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: '#2563EB', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
                    {p.cote.toFixed(2)}
                  </p>
                  <p style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Côte</p>
                </div>

                {/* Mise */}
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(p.mise)}
                  </p>
                  <p style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mise</p>
                </div>

                {/* Statut + date */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                  <StatusBadge statut={p.statut} />
                  <p style={{ fontSize: '11px', color: '#94A3B8' }}>{formatDate(p.date)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
