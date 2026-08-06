'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { TrendingUp, BarChart3, Wallet, Layers, Trophy, LogOut, User } from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/paris', label: 'Paris', icon: TrendingUp },
  { href: '/combis', label: 'Combinés', icon: Layers },
  { href: '/depots', label: 'Dépôts', icon: Wallet },
  { href: '/loto', label: 'Loto Foot', icon: Trophy },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <aside className="flex flex-col h-screen w-60 shrink-0 fixed left-0 top-0 z-50"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl"
          style={{ background: 'linear-gradient(135deg, #4F6BED, #8B5CF6)' }}>
          <TrendingUp size={18} color="white" strokeWidth={2.5} />
        </div>
        <span className="font-display font-bold text-white text-lg">Suivi Paris</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background: active ? 'rgba(79,107,237,0.12)' : 'transparent',
                color: active ? '#4F6BED' : 'var(--muted)',
                borderLeft: active ? '2px solid #4F6BED' : '2px solid transparent',
              }}>
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1">
          <div className="flex items-center justify-center w-7 h-7 rounded-full"
            style={{ background: 'rgba(79,107,237,0.2)' }}>
            <User size={14} style={{ color: '#4F6BED' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.pseudo || user?.email}</p>
            {user?.pseudo && <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{user.email}</p>}
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm w-full transition-colors duration-150"
          style={{ color: 'var(--muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
