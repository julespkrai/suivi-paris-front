'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { BarChart2 } from 'lucide-react';

type Period = 'semaine' | 'mois' | 'annee';
type StatRow = { label: string; pl: number; roi: number; total: number; gagnes: number; pct: number };

const fmtEur = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>('mois');
  const [rows, setRows] = useState<StatRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<StatRow[]>(`/stats?period=${period}`)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [period]);

  const totalPL   = rows.reduce((s, r) => s + r.pl, 0);
  const totalParis = rows.reduce((s, r) => s + r.total, 0);
  const totalGagnes = rows.reduce((s, r) => s + r.gagnes, 0);
  const pctGlobal  = totalParis > 0 ? (totalGagnes / totalParis * 100).toFixed(1) : '—';

  const PERIODS: { key: Period; label: string }[] = [
    { key: 'semaine', label: 'Par semaine' },
    { key: 'mois',    label: 'Par mois' },
    { key: 'annee',   label: 'Par année' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Statistiques
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B' }}>
            {totalParis} paris réglés &middot; {totalGagnes} gagnés ({pctGlobal}%)
          </p>
        </div>
        {/* Toggle période */}
        <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', borderRadius: '10px', padding: '4px' }}>
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                padding: '7px 14px', borderRadius: '7px', border: 'none', cursor: 'pointer',
                fontSize: '12.5px', fontWeight: 600, transition: 'all 0.15s',
                background: period === p.key ? 'white' : 'transparent',
                color: period === p.key ? '#0F172A' : '#64748B',
                boxShadow: period === p.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Résumé global */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'P/L total', value: (totalPL >= 0 ? '+' : '') + fmtEur(totalPL), color: totalPL >= 0 ? '#059669' : '#DC2626', bg: totalPL >= 0 ? '#ECFDF5' : '#FEF2F2' },
          { label: '% Réussite', value: `${pctGlobal}%`, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Paris réglés', value: String(totalParis), color: '#7C3AED', bg: '#F5F3FF' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ borderRadius: '14px', padding: '20px', background: bg, border: `1px solid ${color}22` }}>
            <p style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{label}</p>
            <p style={{ fontSize: '24px', fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(15,23,42,0.08)', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: '#94A3B8' }}>Chargement…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <BarChart2 size={32} style={{ color: '#CBD5E1', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>Aucune donnée pour cette période</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Période</th>
                  <th style={{ textAlign: 'right' }}>P/L</th>
                  <th style={{ textAlign: 'right' }}>ROI</th>
                  <th style={{ textAlign: 'right' }}>% Réussite</th>
                  <th style={{ textAlign: 'right' }}>Gagnés</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.label}>
                    <td style={{ fontWeight: 600, color: '#0F172A' }}>{r.label}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: r.pl >= 0 ? '#059669' : '#DC2626' }}>
                      {(r.pl >= 0 ? '+' : '') + fmtEur(r.pl)}
                    </td>
                    <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: r.roi >= 0 ? '#059669' : '#DC2626', fontWeight: 600 }}>
                      {(r.roi >= 0 ? '+' : '') + r.roi.toFixed(1)}%
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                        background: r.pct >= 55 ? '#ECFDF5' : r.pct >= 40 ? '#FFF7ED' : '#FEF2F2',
                        color: r.pct >= 55 ? '#059669' : r.pct >= 40 ? '#D97706' : '#DC2626',
                      }}>
                        {r.pct.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', color: '#059669', fontWeight: 600 }}>{r.gagnes}</td>
                    <td style={{ textAlign: 'right', color: '#64748B' }}>{r.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
