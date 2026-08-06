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
    <aside style={{
      position: 'fixed', left: 0, top: 0, width: '240px', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '22px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #4F6BED, #8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <TrendingUp size={16} color="white" strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '16px', color: 'white' }}>
          Suivi Paris
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '10px',
              fontSize: '14px', fontWeight: 500, textDecoration: 'none',
              background: active ? 'rgba(79,107,237,0.12)' : 'transparent',
              color: active ? '#4F6BED' : 'var(--muted)',
              borderLeft: `2px solid ${active ? '#4F6BED' : 'transparent'}`,
              transition: 'all 0.15s',
            }}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginBottom: '2px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(79,107,237,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={13} color="#4F6BED" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.pseudo || user?.email}
            </p>
            {user?.pseudo && (
              <p style={{ fontSize: '11px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </p>
            )}
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 12px', borderRadius: '10px', width: '100%',
          fontSize: '13px', color: 'var(--muted)', background: 'none', border: 'none',
          cursor: 'pointer', transition: 'color 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
          <LogOut size={14} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
