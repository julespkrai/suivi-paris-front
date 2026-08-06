'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Depot } from '@/lib/api';
import Modal from '@/components/Modal';
import { Plus, Trash2, ArrowDown, ArrowUp, Wallet } from 'lucide-react';

const CANAUX = ['Winamax', 'Betclic', 'Tabac'];
const fmtEur = (v: number | undefined) => v != null ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v) : '—';
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });

type FormData = { canal: string; depot: string; retrait: string; date: string };
const emptyForm = (): FormData => ({ canal: 'Winamax', depot: '', retrait: '', date: new Date().toISOString().split('T')[0] });

export default function DepotsPage() {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api.get<Depot[]>('/depots').then(setDepots).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalDep = depots.reduce((s, d) => s + (d.depot || 0), 0);
  const totalRet = depots.reduce((s, d) => s + (d.retrait || 0), 0);
  const net = totalDep - totalRet;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.depot && !form.retrait) return;
    setSaving(true);
    try {
      await api.post('/depots', {
        canal: form.canal,
        depot: form.depot ? parseFloat(form.depot) : null,
        retrait: form.retrait ? parseFloat(form.retrait) : null,
        date: form.date,
      });
      load(); setShowModal(false); setForm(emptyForm());
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet enregistrement ?')) return;
    await api.delete(`/depots/${id}`); load();
  };

  const setF = (key: keyof FormData, val: string) => setForm(f => ({ ...f, [key]: val }));

  const byCanal: Record<string, { dep: number; ret: number }> = {};
  depots.forEach(d => {
    if (!byCanal[d.canal]) byCanal[d.canal] = { dep: 0, ret: 0 };
    byCanal[d.canal].dep += d.depot || 0;
    byCanal[d.canal].ret += d.retrait || 0;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Dépôts & Retraits</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{depots.length} mouvements</p>
        </div>
        <button onClick={() => { setShowModal(true); setForm(emptyForm()); }}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Résumé par canal */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {CANAUX.map(canal => {
          const d = byCanal[canal] || { dep: 0, ret: 0 };
          return (
            <div key={canal} className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>{canal}</p>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--green)' }}>
                  <ArrowDown size={13} />
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtEur(d.dep)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--red)' }}>
                  <ArrowUp size={13} />
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtEur(d.ret)}</span>
                </div>
              </div>
              <p className="text-lg font-display font-bold" style={{ color: (d.dep - d.ret) >= 0 ? 'var(--text)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>
                Net: {fmtEur(d.dep - d.ret)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Total global */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)' }}>
          <ArrowDown size={20} style={{ color: 'var(--green)' }} />
          <div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Total déposé</p>
            <p className="text-xl font-display font-bold" style={{ color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>{fmtEur(totalDep)}</p>
          </div>
        </div>
        <div className="flex-1 rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'rgba(255,61,113,0.06)', border: '1px solid rgba(255,61,113,0.2)' }}>
          <ArrowUp size={20} style={{ color: 'var(--red)' }} />
          <div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Total retiré</p>
            <p className="text-xl font-display font-bold" style={{ color: 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{fmtEur(totalRet)}</p>
          </div>
        </div>
        <div className="flex-1 rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}>
          <Wallet size={20} style={{ color: net >= 0 ? 'var(--green)' : 'var(--red)' }} />
          <div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Net total</p>
            <p className="text-xl font-display font-bold" style={{ color: net >= 0 ? 'var(--text)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>{fmtEur(net)}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
        {loading ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--muted)' }}>Chargement…</div>
        ) : depots.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet size={32} className="mx-auto mb-3" style={{ color: 'var(--border2)' }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Aucun mouvement enregistré</p>
          </div>
        ) : (
          <table className="data-table w-full">
            <thead><tr>
              <th>Date</th><th>Canal</th><th className="text-right">Dépôt</th><th className="text-right">Retrait</th><th className="text-right">Solde mouvement</th><th></th>
            </tr></thead>
            <tbody>
              {depots.map(d => (
                <tr key={d.id}>
                  <td className="text-xs" style={{ color: 'var(--muted)' }}>{fmtDate(d.date)}</td>
                  <td>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                      style={{ background: 'var(--surface2)', color: d.canal === 'Winamax' ? '#FF5100' : d.canal === 'Betclic' ? '#00A6FF' : '#FFB800' }}>
                      {d.canal}
                    </span>
                  </td>
                  <td className="text-right text-sm" style={{ color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>
                    {d.depot ? fmtEur(d.depot) : '—'}
                  </td>
                  <td className="text-right text-sm" style={{ color: 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>
                    {d.retrait ? fmtEur(d.retrait) : '—'}
                  </td>
                  <td className="text-right text-sm font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {fmtEur((d.depot || 0) - (d.retrait || 0))}
                  </td>
                  <td>
                    <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg transition-colors float-right"
                      style={{ color: 'var(--muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,61,113,0.1)'; e.currentTarget.style.color = 'var(--red)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal title="Ajouter un mouvement" open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Canal</label>
              <select value={form.canal} onChange={e => setF('canal', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm">
                {CANAUX.map(c => <option key={c}>{c}</option>)}
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
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--green)', opacity: 0.8 }}>Dépôt (€)</label>
              <input type="number" step="0.01" value={form.depot} onChange={e => setF('depot', e.target.value)}
                placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--red)', opacity: 0.8 }}>Retrait (€)</label>
              <input type="number" step="0.01" value={form.retrait} onChange={e => setF('retrait', e.target.value)}
                placeholder="0.00" className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Remplissez au moins l'un des deux champs.</p>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
              Annuler
            </button>
            <button type="submit" disabled={saving || (!form.depot && !form.retrait)}
              className="flex-1 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-50">
              {saving ? 'Sauvegarde…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
