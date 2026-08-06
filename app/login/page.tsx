'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { gsap } from 'gsap';
import { TrendingUp, BarChart3, Wallet, Shield } from 'lucide-react';

const features = [
  { icon: TrendingUp, label: 'Suivi en temps réel', desc: 'Paris simples, combinés, Loto Foot' },
  { icon: BarChart3, label: 'Dashboard complet', desc: 'P/L, ROI, bankroll, statistiques' },
  { icon: Wallet, label: 'Multi-canal', desc: 'Winamax, Betclic, Tabac — tout centralisé' },
  { icon: Shield, label: 'Données sécurisées', desc: 'Chiffrement JWT, accès privé' },
];

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useAuth();
  const router = useRouter();
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.from(leftRef.current, { x: -40, opacity: 0, duration: 0.9, ease: 'power3.out' })
      .from(rightRef.current, { x: 40, opacity: 0, duration: 0.9, ease: 'power3.out' }, '-=0.7')
      .from('.feature-item', { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }, '-=0.5');
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
    gsap.to(formRef.current, { opacity: 0, y: 8, duration: 0.15, onComplete: () => {
      setMode(next); setError('');
      gsap.to(formRef.current, { opacity: 1, y: 0, duration: 0.25 });
    }});
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>

      {/* Panneau gauche — branding */}
      <div ref={leftRef} className="hidden lg:flex flex-col justify-between w-[520px] shrink-0 relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(145deg, #0F1628 0%, #0A0E1A 100%)', borderRight: '1px solid var(--border)' }}>

        {/* Orbe décoratif */}
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(79,107,237,0.15) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-50px] left-[-50px] w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,230,118,0.08) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-11 h-11 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #4F6BED, #8B5CF6)', boxShadow: '0 8px 24px rgba(79,107,237,0.4)' }}>
              <TrendingUp size={20} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-bold text-white">Suivi Paris</span>
          </div>
        </div>

        {/* Tagline */}
        <div>
          <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Prenez le contrôle<br />
            <span style={{ background: 'linear-gradient(135deg, #4F6BED, #00E676)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              de vos paris
            </span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
            Centralisez tous vos paris sportifs, suivez vos performances et pilotez votre bankroll en temps réel.
          </p>

          {/* Features */}
          <div className="mt-10 flex flex-col gap-5">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="feature-item flex items-start gap-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0 mt-0.5"
                  style={{ background: 'rgba(79,107,237,0.12)', border: '1px solid rgba(79,107,237,0.2)' }}>
                  <Icon size={16} style={{ color: '#4F6BED' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs" style={{ color: 'var(--muted)', opacity: 0.5 }}>
          © 2026 Suivi Paris — Usage privé
        </p>
      </div>

      {/* Panneau droit — formulaire */}
      <div ref={rightRef} className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #4F6BED, #8B5CF6)' }}>
              <TrendingUp size={18} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-bold text-white">Suivi Paris</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-white mb-2">
            {mode === 'login' ? 'Bon retour 👋' : 'Créer un compte'}
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
            {mode === 'login'
              ? 'Connectez-vous pour accéder à votre tableau de bord'
              : 'Commencez à suivre vos paris dès maintenant'}
          </p>

          {/* Toggle */}
          <div className="flex rounded-2xl p-1 mb-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: mode === m ? 'var(--blue)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--muted)',
                  boxShadow: mode === m ? '0 4px 12px rgba(79,107,237,0.3)' : 'none',
                }}>
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Pseudo</label>
                <input value={pseudo} onChange={e => setPseudo(e.target.value)}
                  placeholder="Votre pseudo" autoComplete="nickname"
                  className="w-full px-4 py-3.5 rounded-xl text-sm"
                  style={{ border: '1px solid var(--border2)' }} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Adresse email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com" required autoComplete="email"
                className="w-full px-4 py-3.5 rounded-xl text-sm"
                style={{ border: '1px solid var(--border2)' }} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full px-4 py-3.5 rounded-xl text-sm"
                style={{ border: '1px solid var(--border2)' }} />
            </div>

            {error && (
              <div className="px-4 py-3.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,61,113,0.08)', color: 'var(--red)', border: '1px solid rgba(255,61,113,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-4 rounded-xl text-sm font-semibold mt-2 disabled:opacity-50"
              style={{ letterSpacing: '0.02em', fontSize: '15px' }}>
              {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter →' : 'Créer mon compte →'}
            </button>
          </form>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--muted)', opacity: 0.6 }}>
            Vos données sont chiffrées et accessibles uniquement par vous
          </p>
        </div>
      </div>
    </div>
  );
}
