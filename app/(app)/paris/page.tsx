'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { api, Pari } from '@/lib/api';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import { Plus, Trash2, Edit2, TrendingUp, Filter, RotateCcw } from 'lucide-react';

const CANAUX = ['Winamax', 'Betclic', 'Tabac'];
const STATUTS = ['En cours', 'Gagné', 'Perdu', 'Cash Out', 'Remboursé', 'Annulé'];
const SPORTS = ['Football', 'Tennis', 'Basketball', 'Rugby', 'Hockey', 'Cyclisme', 'F1', 'Autre'];

const fmtEur = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });

const CANAL_COLOR: Record<string, string> = { Winamax: '#EA580C', Betclic: '#2563EB', Tabac: '#D97706' };
const CANAL_BG: Record<string, string> = { Winamax: '#FFF7ED', Betclic: '#EFF6FF', Tabac: '#FFFBEB' };

type FormData = { canal: string; sport: string; competition: string; type: string; description: string; coteBase: string; cote: string; mise: string; statut: string; retourSaisi: string; date: string };
const emptyForm = (): FormData => ({ canal: 'Winamax', sport: '', competition: '', type: '', description: '', coteBase: '', cote: '', mise: '', statut: 'En cours', retourSaisi: '', date: new Date().toISOString().split('T')[0] });

const selectStyle: React.CSSProperties = {
  padding: '10px 14px', borderRadius: '10px', fontSize: '13px',
  background: 'white', border: '1.5px solid rgba(15,23,42,0.14)',
  color: '#475569', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
};

const btnOutline: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '6px',
  padding: '8px 14px', borderRadius: '10px',
  background: 'white', border: '1.5px solid rgba(15,23,42,0.12)',
  fontSize: '12.5px', fontWeight: 500, color: '#64748B',
  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
};

interface DeletedPari { pari: Pari; timer: ReturnType<typeof setTimeout> }

export default function ParisPage() {
  const [paris, setParis] = useState<Pari[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPari, setEditPari] = useState<Pari | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [filterStatut, setFilterStatut] = useState('');
  const [filterCanal, setFilterCanal] = useState('');
  const [undoItem, setUndoItem] = useState<DeletedPari | null>(null);
  const undoRef = useRef<DeletedPari | null>(null);

  const load = useCallback(() => {
    api.get<Pari[]>('/paris').then(setParis).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => () => { if (undoRef.current) clearTimeout(undoRef.current.timer); }, []);

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
    } catch { setSaving(false); return; }
    finally { setSaving(false); }
  };

  const handleDelete = async (pari: Pari) => {
    if (undoRef.current) {
      clearTimeout(undoRef.current.timer);
      await api.delete(`/paris/${undoRef.current.pari.id}`);
    }
    setParis(prev => prev.filter(p => p.id !== pari.id));
    const timer = setTimeout(async () => {
      await api.delete(`/paris/${pari.id}`);
      undoRef.current = null;
      setUndoItem(null);
    }, 15000);
    const item = { pari, timer };
    undoRef.current = item;
    setUndoItem(item);
  };

  const handleUndo = () => {
    if (!undoRef.current) return;
    clearTimeout(undoRef.current.timer);
    setParis(prev => [...prev, undoRef.current!.pari].sort((a, b) => b.id - a.id));
    undoRef.current = null;
    setUndoItem(null);
  };

  const filtered = paris.filter(p => {
    if (filterStatut && p.statut !== filterStatut) return false;
    if (filterCanal && p.canal !== filterCanal) return false;
    return true;
  });

  const totalPL = filtered.reduce((s, p) => s + p.pl, 0);
  const enCours = filtered.filter(p => p.statut === 'En cours').length;

  const setF = (key: keyof FormData, val: string) => setForm(f => ({ ...f, [key]: val }));

  const showRetour = ['Gagné', 'Remboursé', 'Perdu', 'Cash Out'].includes(form.statut);
  const retourLabel = form.statut === 'Cash Out' ? 'Montant cash out (€)' : 'Retour saisi (€)';
  const retourPlaceholder = form.statut === 'Cash Out' ? 'Ex: 8.50' : 'Laisser vide = calcul auto';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Paris Quotidien
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B' }}>
            {paris.length} paris &middot; {enCours} en cours &middot; P/L&nbsp;
            <span style={{ color: totalPL >= 0 ? '#059669' : '#DC2626', fontWeight: 700 }}>
              {totalPL >= 0 ? '+' : ''}{fmtEur(totalPL)}
            </span>
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={15} /> Nouveau pari
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <Filter size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} style={selectStyle}>
          <option value="">Tous statuts</option>
          {STATUTS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterCanal} onChange={e => setFilterCanal(e.target.value)} style={selectStyle}>
          <option value="">Tous canaux</option>
          {CANAUX.map(c => <option key={c}>{c}</option>)}
        </select>
        {(filterStatut || filterCanal) && (
          <button onClick={() => { setFilterStatut(''); setFilterCanal(''); }} style={btnOutline}>
            Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(15,23,42,0.08)', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: '#94A3B8' }}>Chargement…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <TrendingUp size={32} style={{ color: '#CBD5E1', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>Aucun pari trouvé</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead><tr>
                <th>Date</th><th>Canal</th><th>Sport</th><th>Description</th>
                <th style={{ textAlign: 'right' }}>Cote</th><th style={{ textAlign: 'right' }}>Mise</th>
                <th>Statut</th><th style={{ textAlign: 'right' }}>P/L</th><th></th>
              </tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontSize: '12.5px', color: '#94A3B8' }}>{fmtDate(p.date)}</td>
                    <td>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px',
                        background: CANAL_BG[p.canal] || '#F8FAFC',
                        color: CANAL_COLOR[p.canal] || '#475569',
                      }}>
                        {p.canal}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748B' }}>{p.sport || '—'}</td>
                    <td style={{ fontSize: '13px', color: '#1E293B', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.description || p.type || '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{p.cote}x</td>
                    <td style={{ textAlign: 'right', fontSize: '13px', fontVariantNumeric: 'tabular-nums', color: '#1E293B' }}>{fmtEur(p.mise)}</td>
                    <td><StatusBadge statut={p.statut} /></td>
                    <td style={{
                      textAlign: 'right', fontSize: '13px', fontWeight: 700,
                      color: p.statut === 'En cours' ? '#94A3B8' : p.pl >= 0 ? '#059669' : '#DC2626',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {p.statut === 'En cours' ? '—' : (p.pl >= 0 ? '+' : '') + fmtEur(p.pl)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openEdit(p)} style={{
                          padding: '6px', borderRadius: '7px', border: 'none',
                          background: 'transparent', cursor: 'pointer', color: '#94A3B8',
                          display: 'flex', alignItems: 'center', transition: 'all 0.12s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(p)} style={{
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast undo */}
      {undoItem && (
        <div style={{
          position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: '14px',
          background: '#0F172A', color: 'white',
          padding: '12px 20px', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          fontSize: '13.5px', fontWeight: 500, zIndex: 100,
          animation: 'slideUp 0.25s ease',
        }}>
        <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
          Pari supprimé
          <button onClick={handleUndo} style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
            color: 'white', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
          }}>
            <RotateCcw size={12} /> Annuler
          </button>
        </div>
      )}

      {/* Modal */}
      <Modal title={editPari ? 'Modifier le pari' : 'Nouveau pari'} open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Canal *</label>
              <select value={form.canal} onChange={e => setF('canal', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }}>
                {CANAUX.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setF('date', e.target.value)} required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Sport</label>
              <select value={form.sport} onChange={e => setF('sport', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }}>
                <option value="">— Sélectionner —</option>
                {SPORTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Compétition</label>
              <input value={form.competition} onChange={e => setF('competition', e.target.value)} placeholder="Ligue 1, Roland Garros…" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Description / sélection</label>
            <input value={form.description} onChange={e => setF('description', e.target.value)} placeholder="PSG Victoire, Nadal 1er set…" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Côte *</label>
              <input type="number" step="0.01" value={form.cote} onChange={e => setF('cote', e.target.value)} placeholder="1.85" required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Mise (€) *</label>
              <input type="number" step="0.01" value={form.mise} onChange={e => setF('mise', e.target.value)} placeholder="10.00" required style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: showRetour ? '1fr 1fr' : '1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Statut</label>
              <select value={form.statut} onChange={e => setF('statut', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }}>
                {STATUTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {showRetour && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: form.statut === 'Cash Out' ? '#C2410C' : '#64748B', marginBottom: '6px' }}>
                  {retourLabel}
                </label>
                <input type="number" step="0.01" value={form.retourSaisi} onChange={e => setF('retourSaisi', e.target.value)}
                  placeholder={retourPlaceholder}
                  required={form.statut === 'Cash Out'}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
              </div>
            )}
          </div>

          {form.statut === 'Cash Out' && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px',
              background: '#FFF7ED', border: '1px solid #FED7AA',
              fontSize: '12.5px', color: '#92400E',
            }}>
              Le P/L sera calculé automatiquement : montant cash out − mise.
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
              {saving ? 'Sauvegarde…' : editPari ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
