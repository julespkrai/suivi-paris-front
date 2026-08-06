'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Combi, CombiLeg } from '@/lib/api';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { Plus, Trash2, ChevronDown, ChevronRight, Layers } from 'lucide-react';

const STATUTS_LEG = ['En cours', 'Gagné', 'Perdu', 'Annulé'];
const SPORTS = ['Football', 'Tennis', 'Basketball', 'Rugby', 'Hockey', 'Autre'];
const fmtEur = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });

type CombiForm = { combiId: string; nom: string; comp: string; mise: string; date: string };
type LegForm = { sel: string; sport: string; comp: string; cote: string; statut: string; date: string };
const emptyCombi = (): CombiForm => ({ combiId: '', nom: '', comp: '', mise: '', date: new Date().toISOString().split('T')[0] });
const emptyLeg = (): LegForm => ({ sel: '', sport: '', comp: '', cote: '', statut: 'En cours', date: new Date().toISOString().split('T')[0] });

export default function CombisPage() {
  const [combis, setCombis] = useState<Combi[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCombiModal, setShowCombiModal] = useState(false);
  const [showLegModal, setShowLegModal] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [combiForm, setCombiForm] = useState<CombiForm>(emptyCombi());
  const [legForm, setLegForm] = useState<LegForm>(emptyLeg());
  const [saving, setSaving] = useState(false);
  const [editLeg, setEditLeg] = useState<{ combiId: number; legId: number; statut: string } | null>(null);

  const load = useCallback(() => {
    api.get<Combi[]>('/combis').then(setCombis).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalPL = combis.filter(c => !['En cours', 'À compléter'].includes(c.statut)).reduce((s, c) => s + c.pl, 0);

  const toggleExpand = (id: number) => {
    setExpanded(e => { const n = new Set(e); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const saveCombi = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/combis', { ...combiForm, mise: parseFloat(combiForm.mise), comp: combiForm.comp || null });
      load(); setShowCombiModal(false); setCombiForm(emptyCombi());
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const saveLeg = async (e: React.FormEvent) => {
    e.preventDefault(); if (!showLegModal) return; setSaving(true);
    try {
      await api.post(`/combis/${showLegModal}/legs`, {
        ...legForm, cote: parseFloat(legForm.cote), sport: legForm.sport || null, comp: legForm.comp || null,
      });
      load(); setShowLegModal(null); setLegForm(emptyLeg());
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const updateLegStatut = async (combiId: number, legId: number, statut: string) => {
    await api.patch(`/combis/${combiId}/legs/${legId}`, { statut }); load();
  };

  const deleteCombi = async (id: number) => {
    if (!confirm('Supprimer ce combiné et tous ses legs ?')) return;
    await api.delete(`/combis/${id}`); load();
  };

  const setC = (k: keyof CombiForm, v: string) => setCombiForm(f => ({ ...f, [k]: v }));
  const setL = (k: keyof LegForm, v: string) => setLegForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Combinés</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {combis.length} combinés — P/L:&nbsp;
            <span style={{ color: totalPL >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
              {totalPL >= 0 ? '+' : ''}{fmtEur(totalPL)}
            </span>
          </p>
        </div>
        <button onClick={() => { setShowCombiModal(true); setCombiForm(emptyCombi()); }}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
          <Plus size={16} /> Nouveau combiné
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm" style={{ color: 'var(--muted)' }}>Chargement…</div>
      ) : combis.length === 0 ? (
        <div className="p-12 text-center rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <Layers size={32} className="mx-auto mb-3" style={{ color: 'var(--border2)' }} />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Aucun combiné enregistré</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {combis.map(c => (
            <div key={c.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {/* Header combiné */}
              <div className="flex items-center gap-3 px-5 py-4 cursor-pointer"
                onClick={() => toggleExpand(c.id)}
                style={{ borderBottom: expanded.has(c.id) ? '1px solid var(--border)' : 'none' }}>
                <div style={{ color: 'var(--muted)' }}>
                  {expanded.has(c.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                      {c.combiId}
                    </span>
                    <span className="font-semibold text-sm text-white truncate">{c.nom}</span>
                    {c.comp && <span className="text-xs" style={{ color: 'var(--muted)' }}>{c.comp}</span>}
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {fmtDate(c.date)} • Mise {fmtEur(c.mise)} • Cote {c.cote > 0 ? c.cote.toFixed(2) + 'x' : '—'} • {c.legs.length} sélection{c.legs.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge statut={c.statut} />
                  <span className="font-display font-bold text-sm" style={{
                    color: ['En cours', 'À compléter'].includes(c.statut) ? 'var(--muted)' : c.pl >= 0 ? 'var(--green)' : 'var(--red)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {['En cours', 'À compléter'].includes(c.statut) ? `Pot: +${fmtEur(c.mise * c.cote - c.mise)}` : (c.pl >= 0 ? '+' : '') + fmtEur(c.pl)}
                  </span>
                  <button onClick={e => { e.stopPropagation(); deleteCombi(c.id); }}
                    className="p-1.5 rounded-lg" style={{ color: 'var(--muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Legs */}
              {expanded.has(c.id) && (
                <div>
                  {c.legs.map((leg, idx) => (
                    <div key={leg.id} className="flex items-center gap-3 px-5 py-3"
                      style={{ borderBottom: idx < c.legs.length - 1 ? '1px solid var(--border)' : 'none', background: 'var(--surface2)' }}>
                      <span className="text-xs w-4 text-center font-bold" style={{ color: 'var(--muted)' }}>{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{leg.sel}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                          {[leg.sport, leg.comp].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                      <span className="text-sm font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>{leg.cote}x</span>
                      <select value={leg.statut} onChange={e => updateLegStatut(c.id, leg.id, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border2)', color: 'var(--text)' }}>
                        {STATUTS_LEG.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                  <div className="px-5 py-3">
                    <button onClick={() => { setShowLegModal(c.id); setLegForm(emptyLeg()); }}
                      className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl transition-colors"
                      style={{ color: 'var(--blue)', border: '1px dashed rgba(79,107,237,0.4)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,107,237,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <Plus size={12} /> Ajouter une sélection
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal nouveau combiné */}
      <Modal title="Nouveau combiné" open={showCombiModal} onClose={() => setShowCombiModal(false)}>
        <form onSubmit={saveCombi} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>ID combiné</label>
              <input value={combiForm.combiId} onChange={e => setC('combiId', e.target.value)} required
                placeholder="LT1, LT2…" className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Date</label>
              <input type="date" value={combiForm.date} onChange={e => setC('date', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Nom / description *</label>
            <input value={combiForm.nom} onChange={e => setC('nom', e.target.value)} required
              placeholder="Ligue 1 + Serie A + Champions League" className="w-full px-3 py-2.5 rounded-xl text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Compétition</label>
              <input value={combiForm.comp} onChange={e => setC('comp', e.target.value)}
                placeholder="Optionnel" className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Mise (€) *</label>
              <input type="number" step="0.01" value={combiForm.mise} onChange={e => setC('mise', e.target.value)} required
                placeholder="5.00" className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowCombiModal(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-50">
              {saving ? 'Sauvegarde…' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal ajout leg */}
      <Modal title="Ajouter une sélection" open={showLegModal !== null} onClose={() => setShowLegModal(null)}>
        <form onSubmit={saveLeg} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Sélection *</label>
            <input value={legForm.sel} onChange={e => setL('sel', e.target.value)} required
              placeholder="PSG Victoire, Nadal 1er set…" className="w-full px-3 py-2.5 rounded-xl text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Sport</label>
              <select value={legForm.sport} onChange={e => setL('sport', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm">
                <option value="">—</option>
                {SPORTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Compétition</label>
              <input value={legForm.comp} onChange={e => setL('comp', e.target.value)}
                placeholder="Ligue 1…" className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Cote *</label>
              <input type="number" step="0.01" value={legForm.cote} onChange={e => setL('cote', e.target.value)} required
                placeholder="1.85" className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Date</label>
              <input type="date" value={legForm.date} onChange={e => setL('date', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowLegModal(null)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--surface2)', color: 'var(--muted)', border: '1px solid var(--border)' }}>
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-50">
              {saving ? 'Sauvegarde…' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
