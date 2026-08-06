'use client';
import { useState, useEffect, useCallback } from 'react';
import { api, Depot } from '@/lib/api';
import Modal from '@/components/Modal';
import { Plus, Trash2, ArrowDown, ArrowUp, Wallet } from 'lucide-react';

const CANAUX = ['Winamax', 'Betclic', 'Tabac'];
const CANAL_COLOR: Record<string, string> = { Winamax: '#EA580C', Betclic: '#2563EB', Tabac: '#D97706' };
const CANAL_BG: Record<string, string> = { Winamax: '#FFF7ED', Betclic: '#EFF6FF', Tabac: '#FFFBEB' };
const fmtEur = (v: number | undefined) => v != null ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v) : '—';
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });

type FormData = { canal: string; depot: string; retrait: string; date: string };
const emptyForm = (): FormData => ({ canal: 'Winamax', depot: '', retrait: '', date: new Date().toISOString().split('T')[0] });

const card: React.CSSProperties = {
  borderRadius: '14px', padding: '20px',
  background: 'white', border: '1px solid rgba(15,23,42,0.08)',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

export default function DepotsPage() {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    api.get<Depot[]>('/depots').then(setDepots).catch(() => {}).finally(() => setLoading(false));
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
    } catch { setSaving(false); return; }
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Dépôts & Retraits
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748B' }}>{depots.length} mouvements enregistrés</p>
        </div>
        <button onClick={() => { setShowModal(true); setForm(emptyForm()); }} className="btn-primary">
          <Plus size={15} /> Ajouter
        </button>
      </div>

      {/* Résumé par canal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
        {CANAUX.map(canal => {
          const d = byCanal[canal] || { dep: 0, ret: 0 };
          const netCanal = d.dep - d.ret;
          return (
            <div key={canal} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                  background: CANAL_BG[canal] || '#F8FAFC', color: CANAL_COLOR[canal] || '#475569',
                }}>{canal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>Dépôts</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>{fmtEur(d.dep)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>Retraits</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#DC2626', fontVariantNumeric: 'tabular-nums' }}>{fmtEur(d.ret)}</p>
                </div>
              </div>
              <div style={{ paddingTop: '10px', borderTop: '1px solid rgba(15,23,42,0.07)' }}>
                <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '2px' }}>Net</p>
                <p style={{ fontSize: '17px', fontWeight: 800, color: netCanal >= 0 ? '#0F172A' : '#DC2626', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtEur(netCanal)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total global */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '24px' }}>
        <div style={{ flex: 1, ...card, display: 'flex', alignItems: 'center', gap: '14px', background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowDown size={17} color="white" />
          </div>
          <div>
            <p style={{ fontSize: '11.5px', color: '#065F46', fontWeight: 500, marginBottom: '2px' }}>Total déposé</p>
            <p style={{ fontSize: '20px', fontWeight: 800, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>{fmtEur(totalDep)}</p>
          </div>
        </div>
        <div style={{ flex: 1, ...card, display: 'flex', alignItems: 'center', gap: '14px', background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ArrowUp size={17} color="white" />
          </div>
          <div>
            <p style={{ fontSize: '11.5px', color: '#7F1D1D', fontWeight: 500, marginBottom: '2px' }}>Total retiré</p>
            <p style={{ fontSize: '20px', fontWeight: 800, color: '#DC2626', fontVariantNumeric: 'tabular-nums' }}>{fmtEur(totalRet)}</p>
          </div>
        </div>
        <div style={{ flex: 1, ...card, display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: net >= 0 ? '#EFF6FF' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Wallet size={17} style={{ color: net >= 0 ? '#2563EB' : '#DC2626' }} />
          </div>
          <div>
            <p style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500, marginBottom: '2px' }}>Net total</p>
            <p style={{ fontSize: '20px', fontWeight: 800, color: net >= 0 ? '#0F172A' : '#DC2626', fontVariantNumeric: 'tabular-nums' }}>{fmtEur(net)}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(15,23,42,0.08)', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', fontSize: '13px', color: '#94A3B8' }}>Chargement…</div>
        ) : depots.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <Wallet size={32} style={{ color: '#CBD5E1', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>Aucun mouvement enregistré</p>
          </div>
        ) : (
          <table className="data-table" style={{ width: '100%' }}>
            <thead><tr>
              <th>Date</th><th>Canal</th>
              <th style={{ textAlign: 'right' }}>Dépôt</th>
              <th style={{ textAlign: 'right' }}>Retrait</th>
              <th style={{ textAlign: 'right' }}>Solde</th>
              <th></th>
            </tr></thead>
            <tbody>
              {depots.map(d => (
                <tr key={d.id}>
                  <td style={{ fontSize: '12.5px', color: '#94A3B8' }}>{fmtDate(d.date)}</td>
                  <td>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                      background: CANAL_BG[d.canal] || '#F8FAFC', color: CANAL_COLOR[d.canal] || '#475569',
                    }}>{d.canal}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '13px', color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                    {d.depot ? fmtEur(d.depot) : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '13px', color: '#DC2626', fontVariantNumeric: 'tabular-nums' }}>
                    {d.retrait ? fmtEur(d.retrait) : '—'}
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
                    {fmtEur((d.depot || 0) - (d.retrait || 0))}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleDelete(d.id)} style={{
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
        )}
      </div>

      <Modal title="Ajouter un mouvement" open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Canal</label>
              <select value={form.canal} onChange={e => setF('canal', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }}>
                {CANAUX.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>Date</label>
              <input type="date" value={form.date} onChange={e => setF('date', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#059669', marginBottom: '6px' }}>Dépôt (€)</label>
              <input type="number" step="0.01" value={form.depot} onChange={e => setF('depot', e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#DC2626', marginBottom: '6px' }}>Retrait (€)</label>
              <input type="number" step="0.01" value={form.retrait} onChange={e => setF('retrait', e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', fontSize: '13.5px' }} />
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#94A3B8' }}>Remplissez au moins l'un des deux champs.</p>
          <div style={{ display: 'flex', gap: '12px', paddingTop: '4px' }}>
            <button type="button" onClick={() => setShowModal(false)} style={{
              flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid rgba(15,23,42,0.12)',
              background: '#F8FAFC', color: '#64748B', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
            }}>
              Annuler
            </button>
            <button type="submit" disabled={saving || (!form.depot && !form.retrait)} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              {saving ? 'Sauvegarde…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
