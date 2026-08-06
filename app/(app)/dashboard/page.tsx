'use client';
import { useEffect, useState } from 'react';
import { api, DashboardData } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import KpiCard from '@/components/KpiCard';
import { TrendingUp, TrendingDown, Zap, Target, Clock, AlertCircle } from 'lucide-react';

const CANAL_COLORS: Record<string, string> = {
  Winamax: '#FF5100',
  Betclic: '#00A6FF',
  Tabac: '#FFB800',
};

function WeekBar({ canal, value, max }: { canal: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const fmt = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '12px', fontWeight: 500, width: '64px', textAlign: 'right', color: 'var(--muted)', flexShrink: 0 }}>{canal}</span>
      <div style={{ flex: 1, height: '6px', borderRadius: '99px', background: 'var(--surface2)' }}>
        <div style={{ height: '6px', borderRadius: '99px', width: `${pct}%`, background: CANAL_COLORS[canal] || 'var(--blue)', transition: 'width 0.7s ease' }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 600, width: '56px', fontVariantNumeric: 'tabular-nums', color: 'var(--text)', flexShrink: 0 }}>{fmt(value)}</span>
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
  const greeting = h < 18 ? 'Bonjour' : 'Bonsoir';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>
          {greeting}{user?.pseudo ? `, ${user.pseudo}` : ''} 👋
        </p>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '28px', fontWeight: 700, color: 'white', margin: 0 }}>
          Tableau de bord
        </h1>
        {data && (
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px' }}>
            {data.counts.parisOuverts} pari{data.counts.parisOuverts > 1 ? 's' : ''} en cours · {data.counts.paris} au total
          </p>
        )}
      </div>

      {err && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 18px',
          borderRadius: '12px', marginBottom: '24px', fontSize: '13px',
          background: 'rgba(255,61,113,0.1)', border: '1px solid rgba(255,61,113,0.2)', color: 'var(--red)'
        }}>
          <AlertCircle size={15} /> {err}
        </div>
      )}

      {/* Skeleton */}
      {!data && !err && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ borderRadius: '16px', height: '96px', background: 'var(--surface)', opacity: 0.6 }} />
          ))}
        </div>
      )}

      {data && (
        <>
          {/* KPI row 1 — 4 cols */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '14px' }}>
            <KpiCard label="P/L Total" value={data.pl} positive={data.pl >= 0}
              icon={data.pl >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
              subtitle={data.roi !== null ? `ROI ${(data.roi * 100).toFixed(1)}%` : undefined}
              delay={0} />
            <KpiCard label="Bankroll" value={data.bankroll} positive={data.bankroll >= 0}
              icon={<Target size={15} />}
              subtitle={`Net dépôts: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.net)}`}
              delay={0.07} />
            <KpiCard label="Engagé" value={data.engage} positive={null}
              icon={<Clock size={15} />}
              subtitle={`Potentiel: +${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.pot)}`}
              delay={0.14} />
            <KpiCard label="Mise totale" value={data.mise} positive={null}
              icon={<Zap size={15} />}
              subtitle={`Réglée: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.miseReglee)}`}
              delay={0.21} />
          </div>

          {/* KPI row 2 — 3 cols */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
            <KpiCard label="Total déposé" value={data.dep} positive={null} delay={0.28} />
            <KpiCard label="Total retiré" value={data.ret} positive={null} delay={0.35} />
            <KpiCard label="Net dépôts" value={data.net} positive={data.net >= 0} delay={0.42} />
          </div>

          {/* Bottom — 2 cols */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Cette semaine */}
            <div style={{ borderRadius: '16px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '15px', color: 'white', margin: '0 0 4px' }}>
                Cette semaine
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 20px' }}>
                Dépenses par canal depuis le {new Date(data.semaineDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(data.semaine).map(([canal, val]) => (
                  <WeekBar key={canal} canal={canal} value={val} max={semMaxVal} />
                ))}
                {Object.keys(data.semaine).length === 0 && (
                  <p style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center', padding: '16px 0' }}>Aucune mise cette semaine</p>
                )}
              </div>
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Total semaine</span>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                    Object.values(data.semaine).reduce((a, b) => a + b, 0)
                  )}
                </span>
              </div>
            </div>

            {/* Activité globale */}
            <div style={{ borderRadius: '16px', padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '15px', color: 'white', margin: '0 0 20px' }}>
                Activité globale
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Paris simples', value: data.counts.paris, sub: `${data.counts.parisOuverts} en cours` },
                  { label: 'Combinés', value: data.counts.combis, sub: '' },
                  { label: 'Loto Foot', value: data.counts.loto, sub: '' },
                  { label: 'ROI', value: data.roi !== null ? `${(data.roi * 100).toFixed(1)}%` : '—', sub: 'sur paris réglés', raw: true },
                ].map(({ label, value, sub, raw }) => (
                  <div key={label} style={{ borderRadius: '12px', padding: '16px', background: 'var(--surface2)' }}>
                    <p style={{
                      fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums', margin: '0 0 4px',
                      color: raw && value !== '—' && String(value).startsWith('-') ? 'var(--red)' : 'var(--text)'
                    }}>
                      {value}
                    </p>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--muted)', margin: 0 }}>{label}</p>
                    {sub && <p style={{ fontSize: '11px', color: 'var(--muted)', opacity: 0.6, margin: '2px 0 0' }}>{sub}</p>}
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
