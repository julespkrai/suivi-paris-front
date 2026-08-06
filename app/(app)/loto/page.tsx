'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, LotoFoot } from '@/lib/api';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { Plus, Trash2, Edit2, Trophy } from 'lucide-react';

const TYPES = ['Classique', 'Multi', 'Intégral'];
const STATUTS = ['En cours', 'Gagné', 'Perdu'];
const fmtEur = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });

type FormData = { type: string; nbGrilles: string; miseUnit: string; bons: string; statut: string; gain: string; date: string };
const emptyForm = (): FormData => ({ type: 'Classique', nbGrilles: '1', miseUnit: '1.50', bons: '', statut: 'En cours', gain: '', date: new Date().toISOString().split('T')[0] });

const card: React.CSSProperties = {
  borderRadius: '14px', padding: '20px',
  background: 'white', border: '1px solid rgba(15,23,42,0.08)',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

export default function LotoPage() {
  const [loto, setLoto] = useState<LotoFoot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<LotoFoot | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api.get<LotoFoot[]>('/loto').then(setLoto).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalMise = loto.reduce((s, l) => s + l.miseTotal, 0);
  const totalGain = loto.filter(l => l.statut === 'Gagné').reduce((s, l) => s + (l.gain || 0), 0);
  const pl = totalGain - loto.filter(l => l.statut !== 'En cours').reduce((s, l) => s + l.miseTotal, 0);

  const openEdit = (l: LotoFoot) => {
    setEditItem(l);
    setForm({ type: l.type, nbGrilles: l.nbGrilles.toString(), miseUnit: l.miseUnit.toString(), bons: l.bons?.toString() || '', statut: l.statut, gain: l.gain?.toString() || '', date: l.date });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const body = {
      type: form.type, nbGrilles: parseInt(form.nbGrilles), miseUnit: parseFloat(form.miseUnit),
      bons: form.bons ? parseInt(form.bons) : null, statut: form.statut,
      gain: form.gain ? parseFloat(form.gain) : null, date: form.date,
    };
    try {
      if (editItem) await api.put(`/loto/${editItem.id}`, body);
      else await api.post('/loto', body);
      load(); setShowModal(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ?')) return;
    await api.delete(`/loto/${id}`); load();
  };

  const setF = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
    Classique: { bg: '#EFF6FF', color: '#2563EB' },
    Multi: { bg: '#F5F3FF', color: '#7C3AED' },
    Intégral: { bg: '#ECFDF5', color: '#059669' },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Loto Foot
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B' }}>
            {loto.length} grilles &middot; P/L&nbsp;
            <span style={{ color: pl >= 0 ? '#059669' : '#DC2626', fontWeight: 700 }}>
              {pl >= 0 ? '+' : ''}{fmtEur(pl)}
            </span>
          </p>
        </div>
        <button onClick={() => { setShowModal(true); setEditItem(null); setForm(emptyForm()); }} className="btn-primary">
          <Plus size={15} /> Nouvelle grille
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Mise totale', value: fmtEur(totalMise), color: '#0F172A', bg: '#F8FAFC', border: 'rgba(15,23,42,0.08)' },
          { label: 'Gains totaux', value: fmtEur(totalGain), color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
          { label: 'P/L global', value: (pl >= 0 ? '+' : '') + fmtEur(pl), color: pl >= 0 ? '#059669' : '#DC2626', bg: pl >= 0 ? '#ECFDF5' : '#FEF2F2', border: pl >= 0 ? '#A7F3D0' : '#FECACA' },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} style={{ ...card, background: bg, border: `1px solid ${border}` }}>
            <p style={{ fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', marginBottom: '8px' }}>{label}</p>
            <p style={{ fontSize: '22px', fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(15,23,42,0.08)', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: '#94A3B8' }}>Chargement…</div>
        ) : loto.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <Trophy size={32} style={{ color: '#CBD5E1', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>Aucune grille enregistrée</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead><tr>
                <th>Date</th><th>Type</th>
                <th style={{ textAlign: 'right' }}>Grilles</th>
                <th style={{ textAlign: 'right' }}>Mise unit.</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Bons</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Gain</th>
                <th style={{ textAlign: 'right' }}>P/L</th>
                <th></th>
              </tr></thead>
              <tbody>
                {loto.map(l => {
                  const plItem = (l.gain || 0) - l.miseTotal;
                  const tc = TYPE_COLOR[l.type] || { bg: '#F8FAFC', color: '#475569' };
                  return (
                    <tr key={l.id}>
                      <td style={{ fontSize: '12.5px', color: '#94A3B8' }}>{fmtDate(l.date)}</td>
                      <td>
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', background: tc.bg, color: tc.color }}>
                          {l.type}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '13px', color: '#1E293B' }}>{l.nbGrilles}</td>
                      <td style={{ textAlign: 'right', fontSize: '13px', fontVariantNumeric: 'tabular-nums', color: '#1E293B' }}>{fmtEur(l.miseUnit)}</td>
                      <td style={{ textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>{fmtEur(l.miseTotal)}</td>
                      <td style={{ textAlign: 'right', fontSize: '13px', color: '#64748B' }}>{l.bons ?? '—'}</td>
                      <td><StatusBadge statut={l.statut} /></td>
                      <td style={{ textAlign: 'right', fontSize: '13px', color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                        {l.gain ? fmtEur(l.gain) : '—'}
                      </td>
                      <td style={{
                        textAlign: 'right', fontSize: '13px', fontWeight: 700,
                        color: l.statut === 'En cours' ? '#94A3B8' : plItem >= 0 ? '#059669' : '#DC2626',
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {l.statut === 'En cours' ? '—' : (plItem >= 0 ? '+' : '') + fmtEur(plItem)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                          <button onClick={() => openEdit(l)} style={{
                            padding: '6px', borderRadius: '7px', border: 'none',
                            background: 'transparent', cursor: 'pointer', color: '#94A3B8',
                            display: 'flex', alignItems: 'center', transition: 'all 0.12s',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(l.id)} style={{
                            padding: '6px', borderRadius: '7px', border: 'none',
                            background: 'transparent', cursor: 'pointer', color: '#94A3B8',
                            display: 'flex', alignItems: 'center', transition: 'all 0.12s',
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal title={editItem ? 'Modifier la grille' : 'Nouvelle grille'} open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Type *</label>
              <select value={form.type} onChange={e => setF('type', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Date</label>
              <input type="date" value={form.date} onChange={e => setF('date', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Nb grilles *</label>
              <input type="number" min="1" value={form.nbGrilles} onChange={e => setF('nbGrilles', e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Mise unitaire (€) *</label>
              <input type="number" step="0.01" value={form.miseUnit} onChange={e => setF('miseUnit', e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Bons</label>
              <input type="number" min="0" value={form.bons} onChange={e => setF('bons', e.target.value)} placeholder="Nb bons gagnants" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Statut</label>
              <select value={form.statut} onChange={e => setF('statut', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }}>
                {STATUTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {form.statut === 'Gagné' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#059669', marginBottom: '6px' }}>Gain (€)</label>
              <input type="number" step="0.01" value={form.gain} onChange={e => setF('gain', e.target.value)} placeholder="Montant gagné" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
            <button type="button" onClick={() => setShowModal(false)} style={{
              flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid rgba(15,23,42,0.12)',
              background: '#F8FAFC', color: '#64748B', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
            }}>
              Annuler
            </button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {saving ? 'Sauvegarde…' : editItem ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
