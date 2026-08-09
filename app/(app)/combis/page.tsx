'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Combi } from '@/lib/api';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { Plus, Trash2, ChevronDown, ChevronRight, Layers, TrendingUp } from 'lucide-react';

const STATUTS_LEG = ['En cours', 'Gagné', 'Perdu', 'Annulé'];
const SPORTS = ['Football', 'Tennis', 'Basketball', 'Rugby', 'Hockey', 'Cyclisme', 'F1', 'Autre'];
const fmtEur = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });

type CombiForm = {
  combiId: string; nom: string; comp: string; mise: string; date: string;
  firstSel: string; firstCote: string; firstSport: string;
};
type LegForm = { sel: string; sport: string; comp: string; cote: string; statut: string; date: string };

const emptyCombi = (): CombiForm => ({
  combiId: '', nom: '', comp: '', mise: '', date: new Date().toISOString().split('T')[0],
  firstSel: '', firstCote: '', firstSport: '',
});
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

  const load = useCallback(() => {
    api.get<Combi[]>('/combis').then(setCombis).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const enCours = combis.filter(c => ['En cours', 'À compléter'].includes(c.statut));
  const totalPL = combis.filter(c => !['En cours', 'À compléter'].includes(c.statut)).reduce((s, c) => s + c.pl, 0);
  const plvLatente = enCours.reduce((s, c) => {
    if (c.cote > 1) return s + (c.mise * c.cote - c.mise);
    return s;
  }, 0);

  const toggleExpand = (id: number) => {
    setExpanded(e => { const n = new Set(e); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const saveCombi = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const created = await api.post<Combi>('/combis', {
        combiId: combiForm.combiId,
        nom: combiForm.nom,
        comp: combiForm.comp || null,
        mise: parseFloat(combiForm.mise),
        date: combiForm.date,
      });
      if (combiForm.firstSel && combiForm.firstCote && created?.id) {
        await api.post(`/combis/${created.id}/legs`, {
          sel: combiForm.firstSel,
          cote: parseFloat(combiForm.firstCote),
          sport: combiForm.firstSport || null,
          comp: null,
          statut: 'En cours',
          date: combiForm.date,
        });
      }
      load(); setShowCombiModal(false); setCombiForm(emptyCombi());
    } catch { setSaving(false); return; }
    finally { setSaving(false); }
  };

  const saveLeg = async (e: React.FormEvent) => {
    e.preventDefault(); if (!showLegModal) return; setSaving(true);
    try {
      await api.post(`/combis/${showLegModal}/legs`, {
        ...legForm, cote: parseFloat(legForm.cote), sport: legForm.sport || null, comp: legForm.comp || null,
      });
      load(); setShowLegModal(null); setLegForm(emptyLeg());
    } catch { setSaving(false); return; }
    finally { setSaving(false); }
  };

  const updateLegStatut = async (combiId: number, legId: number, statut: string) => {
    await api.patch(`/combis/${combiId}/legs/${legId}`, { statut }); load();
  };

  const deleteCombi = async (id: number) => {
    if (!confirm('Supprimer ce paris long terme et toutes ses sélections ?')) return;
    await api.delete(`/combis/${id}`); load();
  };

  const deleteLeg = async (combiId: number, legId: number) => {
    if (!confirm('Supprimer cette sélection ?')) return;
    await api.delete(`/combis/${combiId}/legs/${legId}`); load();
  };

  const setC = (k: keyof CombiForm, v: string) => setCombiForm(f => ({ ...f, [k]: v }));
  const setL = (k: keyof LegForm, v: string) => setLegForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Paris Longs Termes
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B' }}>
            {combis.length} paris &middot; P/L réalisé&nbsp;
            <span style={{ color: totalPL >= 0 ? '#059669' : '#DC2626', fontWeight: 700 }}>
              {totalPL >= 0 ? '+' : ''}{fmtEur(totalPL)}
            </span>
          </p>
        </div>
        <button onClick={() => { setShowCombiModal(true); setCombiForm(emptyCombi()); }} className="btn-primary">
          <Plus size={15} /> Nouveau pari LT
        </button>
      </div>

      {/* Carte PLV latente */}
      {enCours.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px',
          padding: '16px 20px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)',
          border: '1px solid #BFDBFE',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
            background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={18} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11.5px', fontWeight: 600, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
              Plus-value latente — {enCours.length} paris en cours
            </p>
            <p style={{ fontSize: '22px', fontWeight: 800, color: '#1E3A8A', fontVariantNumeric: 'tabular-nums' }}>
              +{fmtEur(plvLatente)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '2px' }}>Mis en jeu</p>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
              {fmtEur(enCours.reduce((s, c) => s + c.mise, 0))}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: '#94A3B8' }}>Chargement…</div>
      ) : combis.length === 0 ? (
        <div style={{
          padding: '48px', textAlign: 'center', borderRadius: '14px',
          background: 'white', border: '1px solid rgba(15,23,42,0.08)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <Layers size={32} style={{ color: '#CBD5E1', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>Aucun paris long terme enregistré</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {combis.map(c => {
            const isEnCours = ['En cours', 'À compléter'].includes(c.statut);
            const plv = c.cote > 1 ? c.mise * c.cote - c.mise : 0;
            return (
              <div key={c.id} style={{
                borderRadius: '14px', overflow: 'hidden',
                background: 'white', border: '1px solid rgba(15,23,42,0.08)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}>
                {/* Header combiné */}
                <div
                  onClick={() => toggleExpand(c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '16px 20px', cursor: 'pointer',
                    borderBottom: expanded.has(c.id) ? '1px solid rgba(15,23,42,0.07)' : 'none',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ color: '#94A3B8', flexShrink: 0 }}>
                    {expanded.has(c.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '11px', fontFamily: 'monospace', padding: '2px 7px', borderRadius: '5px',
                        background: '#F1F5F9', color: '#64748B', fontWeight: 600,
                      }}>{c.combiId}</span>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.nom}
                      </span>
                      {c.comp && <span style={{ fontSize: '12px', color: '#94A3B8' }}>{c.comp}</span>}
                    </div>
                    <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: c.legs.length > 0 ? '8px' : '0' }}>
                      {fmtDate(c.date)} &middot; Mise {fmtEur(c.mise)} &middot; Cote {c.cote > 0 ? c.cote.toFixed(2) + 'x' : '—'} &middot; {c.legs.length} sélection{c.legs.length > 1 ? 's' : ''}
                    </p>
                    {c.legs.length > 0 && (
                      <div style={{ display: 'flex', gap: '3px', height: '6px' }}>
                        {c.legs.map(leg => (
                          <div key={leg.id} style={{
                            flex: 1,
                            borderRadius: '3px',
                            background: leg.statut === 'Gagné' ? '#059669'
                              : leg.statut === 'Perdu' ? '#DC2626'
                              : leg.statut === 'Annulé' ? '#94A3B8'
                              : '#BFDBFE',
                            transition: 'background 0.4s ease',
                          }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <StatusBadge statut={c.statut} />
                    {isEnCours && c.cote > 1 ? (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1px' }}>PLV latente</p>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#2563EB', fontVariantNumeric: 'tabular-nums' }}>
                          +{fmtEur(plv)}
                        </span>
                      </div>
                    ) : (
                      <span style={{
                        fontSize: '13.5px', fontWeight: 700,
                        color: c.pl >= 0 ? '#059669' : '#DC2626',
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {(c.pl >= 0 ? '+' : '') + fmtEur(c.pl)}
                      </span>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); deleteCombi(c.id); }}
                      style={{ padding: '6px', borderRadius: '7px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', transition: 'all 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Legs */}
                {expanded.has(c.id) && (
                  <div>
                    {c.legs.map((leg, idx) => (
                      <div key={leg.id} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px',
                        borderBottom: idx < c.legs.length - 1 ? '1px solid rgba(15,23,42,0.06)' : 'none',
                        borderLeft: `3px solid ${leg.statut === 'Gagné' ? '#059669' : leg.statut === 'Perdu' ? '#DC2626' : leg.statut === 'Annulé' ? '#94A3B8' : 'transparent'}`,
                        background: leg.statut === 'Gagné' ? '#F0FDF4' : leg.statut === 'Perdu' ? '#FFF1F2' : leg.statut === 'Annulé' ? '#F1F5F9' : '#F8FAFC',
                        transition: 'background 0.3s ease, border-left-color 0.3s ease',
                      }}>
                        <span style={{ fontSize: '11px', width: '18px', textAlign: 'center', fontWeight: 700, color: '#94A3B8', flexShrink: 0 }}>
                          {idx + 1}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '2px' }}>{leg.sel}</p>
                          <p style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                            {[leg.sport, leg.comp].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                          {leg.cote}x
                        </span>
                        <select
                          value={leg.statut}
                          onChange={e => updateLegStatut(c.id, leg.id, e.target.value)}
                          onClick={e => e.stopPropagation()}
                          style={{
                            fontSize: '12px', padding: '5px 10px', borderRadius: '8px',
                            background: 'white', border: '1.5px solid rgba(15,23,42,0.12)',
                            color: '#475569', cursor: 'pointer', flexShrink: 0,
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          {STATUTS_LEG.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <button
                          onClick={e => { e.stopPropagation(); deleteLeg(c.id, leg.id); }}
                          style={{ padding: '6px', borderRadius: '7px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', transition: 'all 0.12s', flexShrink: 0 }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    <div style={{ padding: '12px 20px' }}>
                      <button
                        onClick={() => { setShowLegModal(c.id); setLegForm(emptyLeg()); }}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontSize: '12.5px', padding: '7px 14px', borderRadius: '8px',
                          color: '#2563EB', border: '1.5px dashed rgba(37,99,235,0.35)',
                          background: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                          fontWeight: 600, transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#EFF6FF')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Plus size={12} /> Ajouter une sélection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal nouveau paris LT */}
      <Modal title="Nouveau Paris Long Terme" open={showCombiModal} onClose={() => setShowCombiModal(false)}>
        <form onSubmit={saveCombi} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>ID (référence) *</label>
              <input value={combiForm.combiId} onChange={e => setC('combiId', e.target.value)} required placeholder="LT1, PLT2…" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Date</label>
              <input type="date" value={combiForm.date} onChange={e => setC('date', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Description *</label>
            <input value={combiForm.nom} onChange={e => setC('nom', e.target.value)} required placeholder="PSG champion Ligue 1, OM top 3…" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Compétition</label>
              <input value={combiForm.comp} onChange={e => setC('comp', e.target.value)} placeholder="Ligue 1, Champions League…" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Mise (€) *</label>
              <input type="number" step="0.01" value={combiForm.mise} onChange={e => setC('mise', e.target.value)} required placeholder="5.00" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
          </div>

          {/* Première sélection */}
          <div style={{ paddingTop: '4px', borderTop: '1px solid rgba(15,23,42,0.07)' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
              Première sélection <span style={{ fontWeight: 400, color: '#94A3B8' }}>(optionnel)</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Événement / sélection</label>
                <input value={combiForm.firstSel} onChange={e => setC('firstSel', e.target.value)} placeholder="PSG champion Ligue 1, Mbappé meilleur buteur…" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Cote</label>
                  <input type="number" step="0.01" value={combiForm.firstCote} onChange={e => setC('firstCote', e.target.value)} placeholder="3.50" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Sport</label>
                  <select value={combiForm.firstSport} onChange={e => setC('firstSport', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }}>
                    <option value="">—</option>
                    {SPORTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
            <button type="button" onClick={() => setShowCombiModal(false)} style={{
              flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid rgba(15,23,42,0.12)',
              background: '#F8FAFC', color: '#64748B', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
            }}>
              Annuler
            </button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {saving ? 'Sauvegarde…' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal ajout leg */}
      <Modal title="Ajouter une sélection" open={showLegModal !== null} onClose={() => setShowLegModal(null)}>
        <form onSubmit={saveLeg} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Sélection *</label>
            <input value={legForm.sel} onChange={e => setL('sel', e.target.value)} required placeholder="PSG Victoire, Nadal 1er set…" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Sport</label>
              <select value={legForm.sport} onChange={e => setL('sport', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }}>
                <option value="">—</option>
                {SPORTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Compétition</label>
              <input value={legForm.comp} onChange={e => setL('comp', e.target.value)} placeholder="Ligue 1…" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Cote *</label>
              <input type="number" step="0.01" value={legForm.cote} onChange={e => setL('cote', e.target.value)} required placeholder="1.85" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Date</label>
              <input type="date" value={legForm.date} onChange={e => setL('date', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
            <button type="button" onClick={() => setShowLegModal(null)} style={{
              flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid rgba(15,23,42,0.12)',
              background: '#F8FAFC', color: '#64748B', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
            }}>
              Annuler
            </button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {saving ? 'Sauvegarde…' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
