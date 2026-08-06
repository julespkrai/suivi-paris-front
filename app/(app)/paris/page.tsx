'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Pari } from '@/lib/api';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { Plus, Trash2, Edit2, TrendingUp, Filter } from 'lucide-react';

const CANAUX = ['Winamax', 'Betclic', 'Tabac'];
const STATUTS = ['En cours', 'Gagné', 'Perdu', 'Remboursé', 'Annulé'];
const SPORTS = ['Football', 'Tennis', 'Basketball', 'Rugby', 'Hockey', 'Cyclisme', 'F1', 'Autre'];

const fmtEur = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });

type FormData = { canal: string; sport: string; competition: string; type: string; description: string; coteBase: string; cote: string; mise: string; statut: string; retourSaisi: string; date: string };
const emptyForm = (): FormData => ({ canal: 'Winamax', sport: '', competition: '', type: '', description: '', coteBase: '', cote: '', mise: '', statut: 'En cours', retourSaisi: '', date: new Date().toISOString().split('T')[0] });

export default function ParisPage() {
  const [paris, setParis] = useState<Pari[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPari, setEditPari] = useState<Pari | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [filterStatut, setFilterStatut] = useState('');
  const [filterCanal, setFilterCanal] = useState('');

  const load = useCallback(() => {
    api.get<Pari[]>('/paris').then(setParis).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditPari(null); setForm(emptyForm()); setShowModal(true); };
  const openEdit = (p: Pari) => {
    setEditPari(p);
    setForm({
      canal: p.canal, sport: p.sport || '', competition: p.competition || '',
      type: p.type || '', description: p.description || '',
      coteBase: p.coteBase?.toString() || '', cote: p.cote.toString(),
      mise: p.mise.toString(), statut: p.statut,
      retourSaisi: p.retourSaisi?.toString() || '',
      date: p.date,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      canal: form.canal, sport: form.sport || null, competition: form.competition || null,
      type: form.type || null, description: form.description || null,
      coteBase: form.coteBase ? parseFloat(form.coteBase) : null,
      cote: parseFloat(form.cote), mise: parseFloat(form.mise),
      statut: form.statut,
      retourSaisi: form.retourSaisi ? parseFloat(form.retourSaisi) : null,
      date: form.date,
    };
    try {
      if (editPari) await api.put(`/paris/${editPari.id}`, body);
      else await api.post('/paris', body);
      load(); setShowModal(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce pari ?')) return;
    await api.delete(`/paris/${id}`); load();
  };

  const filtered = paris.filter(p => {
    if (filterStatut && p.statut !== filterStatut) return false;
    if (filterCanal && p.canal !== filterCanal) return false;
    return true;
  });

  const totalPL = filtered.reduce((s, p) => s + p.pl, 0);
  const enCours = filtered.filter(p => p.statut === 'En cours').length;

  const setF = (key: keyof FormData, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Paris simples</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {paris.length} paris — {enCours} en cours — P/L:&nbsp;
            <span style={{ color: totalPL >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
              {fmtEur(totalPL)}
            </span>
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Plus size={16} /> Nouveau pari
        </button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-3 mb-4">
        <Filter size={14} style={{ color: 'var(--muted)' }} />
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm" style={{ border: '1px solid var(--border2)' }}>
          <option value="">Tous statuts</option>
          {STATUTS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterCanal} onChange={e => setFilterCanal(e.target.value)}
          className="px-3 py-2 rounded-xl text-sm" style={{ border: '1px solid var(--border2)' }}>
          <option value="">Tous canaux</option>
          {CANAUX.map(c => <option key={c}>{c}</option>)}
        </select>
        {(filterStatut || filterCanal) && (
          <button onClick={() => { setFilterStatut(''); setFilterCanal(''); }}
            className="text-xs px-3 py-2 rounded-xl" style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}>
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
        {loading ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--muted)' }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp size={32} className="mx-auto mb-3" style={{ color: 'var(--border2)' }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Aucun pari trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead><tr>
                <th>Date</th><th>Canal</th><th>Sport</th><th>Description</th>
                <th className="text-right">Cote</th><th className="text-right">Mise</th>
                <th>Statut</th><th className="text-right">P/L</th><th></th>
              </tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td className="text-xs" style={{ color: 'var(--muted)' }}>{fmtDate(p.date)}</td>
                    <td>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                        style={{ background: 'var(--surface2)', color: p.canal === 'Winamax' ? '#FF5100' : p.canal === 'Betclic' ? '#00A6FF' : '#FFB800' }}>
                        {p.canal}
                      </span>
                    </td>
                    <td className="text-sm" style={{ color: 'var(--muted)' }}>{p.sport || '—'}</td>
                    <td className="text-sm max-w-xs truncate">{p.description || p.type || '—'}</td>
                    <td className="text-right text-sm font-semibold">{p.cote}x</td>
                    <td className="text-right text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtEur(p.mise)}</td>
                    <td><StatusBadge statut={p.statut} /></td>
                    <td className="text-right text-sm font-bold" style={{
                      color: p.statut === 'En cours' ? 'var(--muted)' : p.pl >= 0 ? 'var(--green)' : 'var(--red)',
                      fontVariantNumeric: 'tabular-nums'
                    }}>
                      {p.statut === 'En cours' ? '—' : (p.pl >= 0 ? '+' : '') + fmtEur(p.pl)}
                    </td>
                    <td>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--muted)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--muted)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,61,113,0.1)'; e.currentTarget.style.color = 'var(--red)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--muted)'; }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal title={editPari ? 'Modifier le pari' : 'Nouveau pari'} open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Canal *</label>
              <select value={form.canal} onChange={e => setF('canal', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm">
                {CANAUX.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setF('date', e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Sport</label>
              <select value={form.sport} onChange={e => setF('sport', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm">
                <option value="">— Sélectionner —</option>
                {SPORTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Compétition</label>
              <input value={form.competition} onChange={e => setF('competition', e.target.value)}
                placeholder="Ligue 1, Roland Garros…" className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Description / sélection</label>
            <input value={form.description} onChange={e => setF('description', e.target.value)}
              placeholder="PSG Victoire, Nadal 1er set…" className="w-full px-3 py-2.5 rounded-xl text-sm" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Cote base</label>
              <input type="number" step="0.01" value={form.coteBase} onChange={e => setF('coteBase', e.target.value)}
                placeholder="1.50" className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Cote finale *</label>
              <input type="number" step="0.01" value={form.cote} onChange={e => setF('cote', e.target.value)}
                placeholder="1.85" required className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Mise (€) *</label>
              <input type="number" step="0.01" value={form.mise} onChange={e => setF('mise', e.target.value)}
                placeholder="10.00" required className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Statut</label>
              <select value={form.statut} onChange={e => setF('statut', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm">
                {STATUTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {(form.statut === 'Gagné' || form.statut === 'Remboursé' || form.statut === 'Perdu') && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Retour saisi (€)</label>
                <input type="number" step="0.01" value={form.retourSaisi} onChange={e => setF('retourSaisi', e.target.value)}
                  placeholder="Laisser vide = calcul auto" className="w-full px-3 py-2.5 rounded-xl text-sm" />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-50">
              {saving ? 'Sauvegarde…' : editPari ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
