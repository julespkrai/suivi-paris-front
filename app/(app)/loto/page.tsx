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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Loto Foot</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {loto.length} grilles — P/L:&nbsp;
            <span style={{ color: pl >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{pl >= 0 ? '+' : ''}{fmtEur(pl)}</span>
          </p>
        </div>
        <button onClick={() => { setShowModal(true); setEditItem(null); setForm(emptyForm()); }}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Plus size={16} /> Nouvelle grille
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Mise totale', value: fmtEur(totalMise), color: 'var(--text)' },
          { label: 'Gains totaux', value: fmtEur(totalGain), color: 'var(--green)' },
          { label: 'P/L', value: (pl >= 0 ? '+' : '') + fmtEur(pl), color: pl >= 0 ? 'var(--green)' : 'var(--red)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>{label}</p>
            <p className="text-2xl font-display font-bold" style={{ color, fontVariantNumeric: 'tabular-nums' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
        {loading ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--muted)' }}>Chargement…</div>
        ) : loto.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy size={32} className="mx-auto mb-3" style={{ color: 'var(--border2)' }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Aucune grille enregistrée</p>
          </div>
        ) : (
          <table className="data-table w-full">
            <thead><tr>
              <th>Date</th><th>Type</th><th className="text-right">Grilles</th><th className="text-right">Mise unit.</th>
              <th className="text-right">Total</th><th className="text-right">Bons</th><th>Statut</th>
              <th className="text-right">Gain</th><th className="text-right">P/L</th><th></th>
            </tr></thead>
            <tbody>
              {loto.map(l => {
                const plItem = (l.gain || 0) - l.miseTotal;
                return (
                  <tr key={l.id}>
                    <td className="text-xs" style={{ color: 'var(--muted)' }}>{fmtDate(l.date)}</td>
                    <td className="text-sm font-medium">{l.type}</td>
                    <td className="text-right text-sm">{l.nbGrilles}</td>
                    <td className="text-right text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtEur(l.miseUnit)}</td>
                    <td className="text-right text-sm font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtEur(l.miseTotal)}</td>
                    <td className="text-right text-sm">{l.bons ?? '—'}</td>
                    <td><StatusBadge statut={l.statut} /></td>
                    <td className="text-right text-sm" style={{ color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>
                      {l.gain ? fmtEur(l.gain) : '—'}
                    </td>
                    <td className="text-right text-sm font-bold" style={{
                      color: l.statut === 'En cours' ? 'var(--muted)' : plItem >= 0 ? 'var(--green)' : 'var(--red)',
                      fontVariantNumeric: 'tabular-nums'
                    }}>
                      {l.statut === 'En cours' ? '—' : (plItem >= 0 ? '+' : '') + fmtEur(plItem)}
                    </td>
                    <td>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg" style={{ color: 'var(--muted)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(l.id)} className="p-1.5 rounded-lg" style={{ color: 'var(--muted)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,61,113,0.1)'; e.currentTarget.style.color = 'var(--red)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal title={editItem ? 'Modifier la grille' : 'Nouvelle grille'} open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Type *</label>
              <select value={form.type} onChange={e => setF('type', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm">
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Date</label>
              <input type="date" value={form.date} onChange={e => setF('date', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Nb grilles *</label>
              <input type="number" min="1" value={form.nbGrilles} onChange={e => setF('nbGrilles', e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Mise unitaire (€) *</label>
              <input type="number" step="0.01" value={form.miseUnit} onChange={e => setF('miseUnit', e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Bons</label>
              <input type="number" min="0" value={form.bons} onChange={e => setF('bons', e.target.value)}
                placeholder="Nb bons gagnants" className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Statut</label>
              <select value={form.statut} onChange={e => setF('statut', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm">
                {STATUTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {form.statut === 'Gagné' && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Gain (€)</label>
              <input type="number" step="0.01" value={form.gain} onChange={e => setF('gain', e.target.value)}
                placeholder="Montant gagné" className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-50">
              {saving ? 'Sauvegarde…' : editItem ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
