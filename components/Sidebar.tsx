'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { TrendingUp, BarChart3, Wallet, Layers, Trophy, LogOut, ChevronRight, Users, Trash2, MoreHorizontal, X } from 'lucide-react';

const mainNav = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/paris',     label: 'Paris',     icon: TrendingUp },
  { href: '/combis',    label: 'Combinés',  icon: Layers },
  { href: '/depots',    label: 'Dépôts',    icon: Wallet },
  { href: '/loto',      label: 'Loto',      icon: Trophy },
];

const moreNav = [
  { href: '/community', label: 'Communauté', icon: Users },
  { href: '/corbeille', label: 'Corbeille',  icon: Trash2 },
];

const allNav = [
  { href: '/dashboard',  label: 'Dashboard',         icon: BarChart3  },
  { href: '/paris',      label: 'Paris Quotidien',    icon: TrendingUp },
  { href: '/combis',     label: 'Paris Longs Termes', icon: Layers     },
  { href: '/depots',     label: 'Dépôts & Retraits',  icon: Wallet     },
  { href: '/loto',       label: 'Loto Foot',          icon: Trophy     },
  { href: '/community',  label: 'Communauté',         icon: Users      },
  { href: '/corbeille',  label: 'Corbeille',          icon: Trash2     },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();
  const [showMore, setShowMore] = useState(false);

  const handleLogout = () => { logout(); router.push('/login'); };
  const initials = (user?.pseudo || user?.email || 'U').slice(0, 2).toUpperCase();

  const moreActive = pathname === '/community' || pathname === '/corbeille';

  return (
    <>
      {/* ── DESKTOP SIDEBAR ───────────────────────────────────────── */}
      <aside className="sidebar-desktop" style={{
        position: 'fixed', left: 0, top: 0, width: '240px', height: '100vh',
        flexDirection: 'column',
        background: '#FFFFFF',
        borderRight: '1px solid rgba(15,23,42,0.08)',
        zIndex: 50,
      }}>
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

        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
          <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', padding: '4px 10px 8px' }}>
            Navigation
          </p>
          {allNav.map(({ href, label, icon: Icon }) => {
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

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────────────── */}
      <nav className="mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: '60px',
        background: '#FFFFFF',
        borderTop: '1px solid rgba(15,23,42,0.08)',
        zIndex: 100,
        alignItems: 'stretch',
        justifyContent: 'space-around',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {mainNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '3px', flex: 1, textDecoration: 'none',
              color: active ? '#2563EB' : '#94A3B8',
              transition: 'color 0.12s',
            }}>
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: '9.5px', fontWeight: active ? 600 : 500, lineHeight: 1 }}>{label}</span>
            </Link>
          );
        })}

        {/* Bouton Plus */}
        <button onClick={() => setShowMore(v => !v)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '3px', flex: 1,
          color: moreActive ? '#2563EB' : (showMore ? '#0F172A' : '#94A3B8'),
          background: 'none', border: 'none', cursor: 'pointer',
          transition: 'color 0.12s',
        }}>
          {showMore
            ? <X size={20} strokeWidth={1.8} />
            : <MoreHorizontal size={20} strokeWidth={1.8} />}
          <span style={{ fontSize: '9.5px', fontWeight: 500, lineHeight: 1 }}>Plus</span>
        </button>
      </nav>

      {/* Overlay + menu "Plus" */}
      {showMore && (
        <>
          <div
            onClick={() => setShowMore(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,0.15)' }}
          />
          <div style={{
            position: 'fixed', bottom: '68px', right: '8px', zIndex: 95,
            background: '#FFFFFF', borderRadius: '14px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
            border: '1px solid rgba(15,23,42,0.08)',
            overflow: 'hidden', minWidth: '190px',
          }}>
            {moreNav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} onClick={() => setShowMore(false)} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 18px', textDecoration: 'none',
                  color: active ? '#2563EB' : '#475569',
                  background: active ? '#EFF6FF' : 'transparent',
                  fontSize: '14px', fontWeight: active ? 600 : 500,
                  borderBottom: '1px solid rgba(15,23,42,0.06)',
                }}>
                  <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </Link>
              );
            })}
            <button onClick={() => { setShowMore(false); handleLogout(); }} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 18px', width: '100%',
              color: '#DC2626', fontSize: '14px', fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
            }}>
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </>
      )}
    </>
  );
}
