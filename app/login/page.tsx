'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { gsap } from 'gsap';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.login-orb-1', { scale: 0, opacity: 0, duration: 2, ease: 'power2.out' });
      gsap.from('.login-orb-2', { scale: 0, opacity: 0, duration: 2.5, delay: 0.3, ease: 'power2.out' });
      gsap.from('.login-logo', { y: -30, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });
      gsap.from('.login-tagline', { y: 20, opacity: 0, duration: 0.8, delay: 0.4, ease: 'power3.out' });
      gsap.from(formRef.current, { y: 40, opacity: 0, duration: 0.9, delay: 0.5, ease: 'power3.out' });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, pseudo || undefined);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    gsap.to(formRef.current, { opacity: 0, y: 10, duration: 0.2, onComplete: () => {
      setMode(m => m === 'login' ? 'register' : 'login');
      setError('');
      gsap.to(formRef.current, { opacity: 1, y: 0, duration: 0.3 });
    }});
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-grid flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg)' }}>

      {/* Orbs de fond */}
      <div className="login-orb-1 absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(79,107,237,0.12) 0%, transparent 70%)' }} />
      <div className="login-orb-2 absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,230,118,0.08) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Logo */}
        <div className="login-logo text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #4F6BED, #8B5CF6)', boxShadow: '0 8px 32px rgba(79,107,237,0.4)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Suivi Paris</h1>
          <p className="login-tagline mt-1 text-sm" style={{ color: 'var(--muted)' }}>
            Gérez vos paris sportifs en un coup d'oeil
          </p>
        </div>

        {/* Card formulaire */}
        <div ref={formRef} className="rounded-2xl p-8" style={{
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)'
        }}>
          {/* Toggle */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: 'var(--surface2)' }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => mode !== m && switchMode()}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: mode === m ? 'var(--blue)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--muted)',
                }}>
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Pseudo</label>
                <input value={pseudo} onChange={e => setPseudo(e.target.value)}
                  placeholder="JohnDoe" autoComplete="nickname"
                  className="w-full px-4 py-3 rounded-xl text-sm" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com" required autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-4 py-3 rounded-xl text-sm" />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,61,113,0.1)', color: 'var(--red)', border: '1px solid rgba(255,61,113,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ letterSpacing: '0.02em' }}>
              {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--muted)' }}>
          Vos données sont chiffrées et sécurisées
        </p>
      </div>
    </div>
  );
}
