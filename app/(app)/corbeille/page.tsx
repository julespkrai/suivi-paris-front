'use client';
import { useEffect, useState } from 'react';
import { api, CorbeilleItem } from '@/lib/api';
import { Trash2, RotateCcw, AlertCircle } from 'lucide-react';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

const TYPE_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  pari:   { label: 'Paris Quotidien', bg: '#EFF6FF', color: '#2563EB' },
  combi:  { label: 'Paris Long Terme', bg: '#F5F3FF', color: '#7C3AED' },
  depot:  { label: 'Dépôt/Retrait', bg: '#ECFDF5', color: '#059669' },
  loto:   { label: 'Loto Foot', bg: '#FEF9C3', color: '#CA8A04' },
};

const RESTORE_ROUTES: Record<string, string> = {
  pari:  '/paris',
  combi: '/combis',
  depot: '/depots',
  loto:  '/loto',
};

export default function CorbeillePage() {
  const [items, setItems] = useState<CorbeilleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [restoring, setRestoring] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.get<CorbeilleItem[]>('/corbeille')
      .then(setItems)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRestore = async (item: CorbeilleItem) => {
    setRestoring(item.id);
    try {
      await api.patch(`${RESTORE_ROUTES[item.type]}/${item.id}/restore`, {});
      setItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Erreur lors de la restauration');
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Corbeille
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B' }}>
            Éléments supprimés — cliquez sur restaurer pour les récupérer
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px', borderRadius: '10px',
          background: '#FEF2F2', color: '#DC2626',
          fontSize: '13px', fontWeight: 600,
        }}>
          <Trash2 size={15} />
          {items.length} élément{items.length !== 1 ? 's' : ''}
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
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              borderRadius: '14px', height: '72px',
              background: 'white', border: '1px solid rgba(15,23,42,0.07)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
      )}

      {!loading && items.length === 0 && !err && (
        <div style={{
          borderRadius: '16px', padding: '48px 32px', textAlign: 'center',
          background: 'white', border: '1px solid rgba(15,23,42,0.07)',
        }}>
          <Trash2 size={32} color="#CBD5E1" style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Corbeille vide</p>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>Aucun élément supprimé à restaurer.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map(item => {
            const typeInfo = TYPE_LABELS[item.type] || { label: item.type, bg: '#F8FAFC', color: '#475569' };
            const isRestoring = restoring === item.id;
            return (
              <div key={`${item.type}-${item.id}`} style={{
                borderRadius: '14px', padding: '16px 20px',
                background: 'white', border: '1px solid rgba(15,23,42,0.07)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', gap: '16px',
                opacity: isRestoring ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}>
                {/* Type badge */}
                <span style={{
                  fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '8px',
                  background: typeInfo.bg, color: typeInfo.color, flexShrink: 0, whiteSpace: 'nowrap',
                }}>
                  {typeInfo.label}
                </span>

                {/* Main info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '13.5px', fontWeight: 700, color: '#0F172A', marginBottom: '3px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748B' }}>{item.detail}</p>
                </div>

                {/* Dates */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '2px' }}>
                    Joué le {formatDate(item.date)}
                  </p>
                  <p style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Supprimé le {formatDate(item.deletedAt)}
                  </p>
                </div>

                {/* Restore button */}
                <button
                  onClick={() => handleRestore(item)}
                  disabled={isRestoring}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '8px', flexShrink: 0,
                    fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                    background: '#EFF6FF', color: '#2563EB',
                    border: '1px solid rgba(37,99,235,0.2)',
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#DBEAFE'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#EFF6FF'; }}
                >
                  <RotateCcw size={13} />
                  {isRestoring ? 'Restauration...' : 'Restaurer'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
