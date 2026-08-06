'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { gsap } from 'gsap';
import { TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  useEffect(() => {
    gsap.from(cardRef.current, { y: 32, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, pseudo || undefined);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: 'login' | 'register') => {
    if (next === mode) return;
    gsap.to(formRef.current, {
      opacity: 0, y: 10, duration: 0.15,
      onComplete: () => {
        setMode(next); setError('');
        gsap.to(formRef.current, { opacity: 1, y: 0, duration: 0.25 });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6"
      style={{ background: 'var(--bg)' }}>

      {/* Arrière-plan */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(79,107,237,0.12) 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-15%] right-[15%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)' }} />
        <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,230,118,0.06) 0%, transparent 65%)' }} />
        {/* Grille subtile */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
      </div>

      {/* Carte principale */}
      <div ref={cardRef} className="relative z-10 w-full" style={{ maxWidth: '520px' }}>

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center justify-center w-16 h-16 rounded-3xl mb-5"
            style={{
              background: 'linear-gradient(135deg, #4F6BED 0%, #8B5CF6 100%)',
              boxShadow: '0 16px 40px rgba(79,107,237,0.4), 0 0 0 1px rgba(79,107,237,0.2)'
            }}>
            <TrendingUp size={28} color="white" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Suivi Paris</h1>
          <p className="mt-2 text-base" style={{ color: 'var(--muted)' }}>
            {mode === 'login' ? 'Bon retour 👋 Ravi de vous revoir' : 'Créez votre compte gratuitement'}
          </p>
        </div>

        {/* Card formulaire */}
        <div className="rounded-3xl p-10" style={{
          background: 'rgba(15, 22, 40, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}>

          {/* Toggle Connexion / Inscription */}
          <div className="flex rounded-2xl p-1.5 mb-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all duration-250"
                style={{
                  background: mode === m ? 'linear-gradient(135deg, #4F6BED, #8B5CF6)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--muted)',
                  boxShadow: mode === m ? '0 4px 16px rgba(79,107,237,0.35)' : 'none',
                }}>
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '20px' }}>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-2.5" style={{ color: '#94A3B8' }}>Pseudo</label>
                <input
                  value={pseudo} onChange={e => setPseudo(e.target.value)}
                  placeholder="Votre pseudo"
                  autoComplete="nickname"
                  className="w-full rounded-xl text-sm text-white"
                  style={{
                    padding: '14px 18px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#4F6BED'; e.target.style.boxShadow = '0 0 0 3px rgba(79,107,237,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2.5" style={{ color: '#94A3B8' }}>Adresse email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com" required autoComplete="email"
                className="w-full rounded-xl text-sm text-white"
                style={{
                  padding: '14px 18px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#4F6BED'; e.target.style.boxShadow = '0 0 0 3px rgba(79,107,237,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2.5" style={{ color: '#94A3B8' }}>Mot de passe</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full rounded-xl text-sm text-white"
                style={{
                  padding: '14px 18px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#4F6BED'; e.target.style.boxShadow = '0 0 0 3px rgba(79,107,237,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {error && (
              <div className="rounded-xl text-sm" style={{
                padding: '14px 18px',
                background: 'rgba(255,61,113,0.08)',
                border: '1px solid rgba(255,61,113,0.25)',
                color: '#FF3D71'
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                padding: '15px 24px',
                marginTop: '4px',
                background: loading ? 'rgba(79,107,237,0.6)' : 'linear-gradient(135deg, #4F6BED 0%, #8B5CF6 100%)',
                color: 'white',
                fontSize: '15px',
                letterSpacing: '0.02em',
                boxShadow: '0 8px 24px rgba(79,107,237,0.35)',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; if (!loading) e.currentTarget.style.boxShadow = '0 12px 28px rgba(79,107,237,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,107,237,0.35)'; }}>
              {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter →' : 'Créer mon compte →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(100,116,139,0.6)' }}>
          Vos données sont chiffrées — accès strictement privé
        </p>
      </div>
    </div>
  );
}
