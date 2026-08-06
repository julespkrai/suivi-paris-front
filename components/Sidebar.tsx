'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { TrendingUp, BarChart3, Wallet, Layers, Trophy, LogOut, ChevronRight, Users, Trash2 } from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/paris', label: 'Paris Quotidien', icon: TrendingUp },
  { href: '/combis', label: 'Paris Longs Termes', icon: Layers },
  { href: '/depots', label: 'Dépôts & Retraits', icon: Wallet },
  { href: '/loto', label: 'Loto Foot', icon: Trophy },
  { href: '/community', label: 'Communauté', icon: Users },
  { href: '/corbeille', label: 'Corbeille', icon: Trash2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const handleLogout = () => { logout(); router.push('/login'); };

  const initials = (user?.pseudo || user?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, width: '240px', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: '#FFFFFF',
      borderRight: '1px solid rgba(15,23,42,0.08)',
      zIndex: 50,
    }}>

      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}>
            <TrendingUp size={17} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>Suivi Paris</p>
            <p style={{ fontSize: '11px', color: '#94A3B8', lineHeight: 1.2 }}>Tableau de bord</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
        <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', padding: '4px 10px 8px' }}>
          Navigation
        </p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '8px',
              fontSize: '13.5px', fontWeight: active ? 600 : 500,
              textDecoration: 'none',
              background: active ? '#EFF6FF' : 'transparent',
              color: active ? '#2563EB' : '#475569',
              transition: 'all 0.12s',
              position: 'relative',
            }}>
              <Icon size={15} strokeWidth={active ? 2.5 : 2} />
              <span style={{ flex: 1 }}>{label}</span>
              {active && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 10px 16px', borderTop: '1px solid rgba(15,23,42,0.06)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '8px',
          background: '#F8FAFC', marginBottom: '4px',
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700, color: 'white',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.pseudo || 'Mon compte'}
            </p>
            <p style={{ fontSize: '11px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '8px 12px', borderRadius: '8px', width: '100%',
          fontSize: '13px', fontWeight: 500, color: '#94A3B8',
          background: 'none', border: 'none', cursor: 'pointer',
          transition: 'all 0.12s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.background = '#FEF2F2'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'none'; }}>
          <LogOut size={13} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
