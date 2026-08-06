'use client';
import { useEffect, useState } from 'react';
import { api, DashboardData } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import KpiCard from '@/components/KpiCard';
import { TrendingUp, TrendingDown, Zap, Target, Clock, ArrowDownLeft, ArrowUpRight, Minus, AlertCircle } from 'lucide-react';

const CANAL_COLORS: Record<string, string> = {
  Winamax: '#EA580C',
  Betclic: '#2563EB',
  Tabac: '#D97706',
};

function WeekBar({ canal, value, max }: { canal: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const fmt = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '12px', fontWeight: 500, width: '68px', textAlign: 'right', color: '#64748B', flexShrink: 0 }}>{canal}</span>
      <div style={{ flex: 1, height: '7px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: '99px',
          width: `${pct}%`,
          background: CANAL_COLORS[canal] || '#2563EB',
          transition: 'width 0.8s ease',
        }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 600, width: '58px', fontVariantNumeric: 'tabular-nums', color: '#1E293B', flexShrink: 0 }}>{fmt(value)}</span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.get<DashboardData>('/dashboard').then(setData).catch(e => setErr(e.message));
  }, []);

  const semMaxVal = data ? Math.max(...Object.values(data.semaine), 1) : 1;
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '6px' }}>
          {greeting}{user?.pseudo ? `, ${user.pseudo}` : ''} 👋
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Tableau de bord
        </h1>
        {data && (
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '6px' }}>
            <span style={{ fontWeight: 600, color: '#2563EB' }}>{data.counts.parisOuverts}</span> pari{data.counts.parisOuverts > 1 ? 's' : ''} en cours
            &nbsp;·&nbsp; <span style={{ fontWeight: 600, color: '#0F172A' }}>{data.counts.paris}</span> au total
          </p>
        )}
      </div>

      {err && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px',
          borderRadius: '12px', marginBottom: '28px', fontSize: '13.5px',
          background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
        }}>
          <AlertCircle size={15} /> {err}
        </div>
      )}

      {/* Skeleton */}
      {!data && !err && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              borderRadius: '14px', height: '110px',
              background: 'white', border: '1px solid rgba(15,23,42,0.07)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
      )}

      {data && (
        <>
          {/* Row 1 — 4 KPIs principaux */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <KpiCard
              label="P/L Total"
              value={data.pl}
              positive={data.pl >= 0}
              icon={data.pl >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              subtitle={data.roi !== null ? `ROI ${(data.roi * 100).toFixed(1)}%` : undefined}
              delay={0}
            />
            <KpiCard
              label="Bankroll estimée"
              value={data.bankroll}
              positive={null}
              accent="#2563EB"
              icon={<Target size={14} />}
              subtitle={`Net: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.net)}`}
              delay={0.07}
            />
            <KpiCard
              label="Engagé en cours"
              value={data.engage}
              positive={null}
              icon={<Clock size={14} />}
              subtitle={`Potentiel: +${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.pot)}`}
              delay={0.14}
            />
            <KpiCard
              label="Mise totale"
              value={data.mise}
              positive={null}
              icon={<Zap size={14} />}
              subtitle={`Réglée: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.miseReglee)}`}
              delay={0.21}
            />
          </div>

          {/* Row 2 — 3 KPIs secondaires */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
            <KpiCard label="Total déposé" value={data.dep} positive={null} icon={<ArrowDownLeft size={14} />} accent="#059669" delay={0.28} />
            <KpiCard label="Total retiré" value={data.ret} positive={null} icon={<ArrowUpRight size={14} />} delay={0.35} />
            <KpiCard label="Net dépôts" value={data.net} positive={data.net >= 0} icon={<Minus size={14} />} delay={0.42} />
          </div>

          {/* Row 3 — 2 blocs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Cette semaine */}
            <div style={{
              borderRadius: '16px', padding: '28px',
              background: 'white',
              border: '1px solid rgba(15,23,42,0.07)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Cette semaine</h2>
                <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                  Depuis le {new Date(data.semaineDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.entries(data.semaine).map(([canal, val]) => (
                  <WeekBar key={canal} canal={canal} value={val} max={semMaxVal} />
                ))}
                {Object.keys(data.semaine).length === 0 && (
                  <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>
                    Aucune mise cette semaine
                  </p>
                )}
              </div>
              <div style={{
                marginTop: '22px', paddingTop: '18px',
                borderTop: '1px solid rgba(15,23,42,0.06)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Total cette semaine</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                    Object.values(data.semaine).reduce((a, b) => a + b, 0)
                  )}
                </span>
              </div>
            </div>

            {/* Activité globale */}
            <div style={{
              borderRadius: '16px', padding: '28px',
              background: 'white',
              border: '1px solid rgba(15,23,42,0.07)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '20px' }}>Activité globale</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Paris simples', value: data.counts.paris, sub: `${data.counts.parisOuverts} en cours`, color: '#2563EB', bg: '#EFF6FF' },
                  { label: 'Combinés', value: data.counts.combis, sub: 'total', color: '#7C3AED', bg: '#F5F3FF' },
                  { label: 'Loto Foot', value: data.counts.loto, sub: 'grilles jouées', color: '#059669', bg: '#ECFDF5' },
                  {
                    label: 'ROI',
                    value: data.roi !== null ? `${(data.roi * 100).toFixed(1)}%` : '—',
                    sub: 'sur paris réglés',
                    color: data.roi !== null && data.roi >= 0 ? '#059669' : '#DC2626',
                    bg: data.roi !== null && data.roi >= 0 ? '#ECFDF5' : '#FEF2F2',
                    raw: true,
                  },
                ].map(({ label, value, sub, color, bg, raw }) => (
                  <div key={label} style={{ borderRadius: '12px', padding: '18px', background: bg }}>
                    <p style={{
                      fontSize: '28px', fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                      color, lineHeight: 1, marginBottom: '6px', letterSpacing: '-0.02em',
                    }}>
                      {value}
                    </p>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '2px' }}>{label}</p>
                    <p style={{ fontSize: '11px', color: '#94A3B8' }}>{sub}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
