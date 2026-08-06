'use client';
import { useEffect, useRef, useState } from 'react';
import { api, DashboardData } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import KpiCard from '@/components/KpiCard';
import { gsap } from 'gsap';
import { TrendingUp, TrendingDown, Zap, Target, Clock, AlertCircle } from 'lucide-react';

const CANAL_COLORS: Record<string, string> = {
  Winamax: '#FF5100',
  Betclic: '#00A6FF',
  Tabac: '#FFB800',
};

function WeekBar({ canal, value, max }: { canal: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium w-16 text-right" style={{ color: 'var(--muted)' }}>{canal}</span>
      <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--surface2)' }}>
        <div className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: CANAL_COLORS[canal] || 'var(--blue)' }} />
      </div>
      <span className="text-xs font-semibold w-14" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [err, setErr] = useState('');
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get<DashboardData>('/dashboard').then(setData).catch(e => setErr(e.message));
  }, []);

  useEffect(() => {
    if (!data) return;
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, { y: -20, opacity: 0, duration: 0.6, ease: 'power3.out' });
    });
    return () => ctx.revert();
  }, [data]);

  const semMaxVal = data ? Math.max(...Object.values(data.semaine), 1) : 1;
  const h = new Date().getHours();
  const greeting = h < 18 ? 'Bonjour' : 'Bonsoir';

  return (
    <div>
      <div ref={headerRef} className="mb-8">
        <p className="text-sm mb-1" style={{ color: 'var(--muted)' }}>
          {greeting}{user?.pseudo ? `, ${user.pseudo}` : ''} 👋
        </p>
        <h1 className="font-display text-3xl font-bold text-white">Tableau de bord</h1>
        {data && (
          <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>
            {data.counts.parisOuverts} pari{data.counts.parisOuverts > 1 ? 's' : ''} en cours sur {data.counts.paris} total
          </p>
        )}
      </div>

      {err && (
        <div className="flex items-center gap-2 p-4 rounded-xl mb-6 text-sm"
          style={{ background: 'rgba(255,61,113,0.1)', border: '1px solid rgba(255,61,113,0.2)', color: 'var(--red)' }}>
          <AlertCircle size={16} /> {err}
        </div>
      )}

      {!data && !err && (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl h-28 animate-pulse" style={{ background: 'var(--surface)' }} />
          ))}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <KpiCard label="P/L Total" value={data.pl} positive={data.pl >= 0}
              icon={data.pl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              subtitle={data.roi !== null ? `ROI ${(data.roi * 100).toFixed(1)}%` : undefined}
              delay={0} />
            <KpiCard label="Bankroll" value={data.bankroll} positive={data.bankroll >= 0}
              icon={<Target size={16} />}
              subtitle={`Net dépôts: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.net)}`}
              delay={0.08} />
            <KpiCard label="Engagé" value={data.engage} positive={null}
              icon={<Clock size={16} />}
              subtitle={`Potentiel: +${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.pot)}`}
              delay={0.16} />
            <KpiCard label="Mise totale" value={data.mise} positive={null}
              icon={<Zap size={16} />}
              subtitle={`Réglée: ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(data.miseReglee)}`}
              delay={0.24} />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <KpiCard label="Total déposé" value={data.dep} positive={null} delay={0.32} />
            <KpiCard label="Total retiré" value={data.ret} positive={null} delay={0.40} />
            <KpiCard label="Net dépôts" value={data.net} positive={data.net >= 0} delay={0.48} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h2 className="font-display font-semibold text-white mb-1">Cette semaine</h2>
              <p className="text-xs mb-5" style={{ color: 'var(--muted)' }}>
                Dépenses par canal depuis le {new Date(data.semaineDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
              </p>
              <div className="flex flex-col gap-3">
                {Object.entries(data.semaine).map(([canal, val]) => (
                  <WeekBar key={canal} canal={canal} value={val} max={semMaxVal} />
                ))}
              </div>
              <div className="mt-5 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Total semaine</span>
                <span className="font-display font-bold" style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                    Object.values(data.semaine).reduce((a, b) => a + b, 0)
                  )}
                </span>
              </div>
            </div>

            <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h2 className="font-display font-semibold text-white mb-5">Activité globale</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Paris simples', value: data.counts.paris, sub: `${data.counts.parisOuverts} en cours` },
                  { label: 'Combinés', value: data.counts.combis, sub: '' },
                  { label: 'Loto Foot', value: data.counts.loto, sub: '' },
                  { label: 'ROI', value: data.roi !== null ? `${(data.roi * 100).toFixed(1)}%` : '—', sub: 'sur paris réglés', raw: true },
                ].map(({ label, value, sub, raw }) => (
                  <div key={label} className="rounded-xl p-4" style={{ background: 'var(--surface2)' }}>
                    <p className="text-2xl font-display font-bold" style={{
                      color: raw && value !== '—' && String(value).startsWith('-') ? 'var(--red)' : 'var(--text)',
                      fontVariantNumeric: 'tabular-nums'
                    }}>
                      {value}
                    </p>
                    <p className="text-xs font-medium mt-1" style={{ color: 'var(--muted)' }}>{label}</p>
                    {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--muted)', opacity: 0.7 }}>{sub}</p>}
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
