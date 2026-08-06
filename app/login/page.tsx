'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const router = useRouter();

  useEffect(() => { if (user) router.push('/dashboard'); }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, pseudo || undefined);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: '10px',
    background: '#F8FAFC', border: '1.5px solid #E2E8F0',
    fontSize: '14px', color: '#0F172A', outline: 'none',
    transition: 'all 0.15s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: '#F1F5F9',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Panneau gauche décoratif */}
      <div style={{
        width: '45%', background: 'linear-gradient(145deg, #1E3A8A 0%, #1d4ed8 50%, #2563EB 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-60px', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '10%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.25)',
            }}>
              <TrendingUp size={20} color="white" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>Suivi Paris</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            Suivez vos paris<br />comme un pro.
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '300px' }}>
            Bankroll, P/L, combinés, Loto Foot — tout au même endroit, en temps réel.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: 'Paris suivis', value: '100%' },
            { label: 'Données privées', value: '🔒' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.08)', borderRadius: '12px',
              padding: '16px', border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <p style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '4px' }}>{value}</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '36px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              {mode === 'login' ? 'Connexion' : 'Créer un compte'}
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B' }}>
              {mode === 'login'
                ? 'Ravi de vous revoir. Entrez vos identifiants.'
                : 'Quelques secondes pour commencer.'}
            </p>
          </div>

          {/* Toggle */}
          <div style={{
            display: 'flex', background: '#F1F5F9', borderRadius: '10px',
            padding: '4px', marginBottom: '28px',
          }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
                fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
                background: mode === m ? 'white' : 'transparent',
                color: mode === m ? '#0F172A' : '#64748B',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}>
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Pseudo
                </label>
                <input
                  value={pseudo} onChange={e => setPseudo(e.target.value)}
                  placeholder="Votre pseudo"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Adresse email
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com" required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={e => { e.target.style.borderColor = '#2563EB'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px',
                }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '12px 16px', borderRadius: '10px', fontSize: '13.5px',
                background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: '13px 24px', borderRadius: '10px', border: 'none',
              background: loading ? '#93C5FD' : 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
              color: 'white', fontSize: '14px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.35)',
              transition: 'all 0.15s',
              marginTop: '4px',
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.35)'; }}>
              {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#CBD5E1', marginTop: '32px' }}>
            Accès strictement privé — vos données vous appartiennent
          </p>
        </div>
      </div>
    </div>
  );
}
