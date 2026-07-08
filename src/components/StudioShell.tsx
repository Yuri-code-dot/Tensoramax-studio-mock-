import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Calculator, Boxes, Database, Rocket, Store,
  UsersRound, BookOpen, Menu, X, Bell, LogOut, ChevronDown, Sigma, Search, Sparkles, UserRound,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiGet, apiSend } from '../lib/api';
import type { Notification } from '../lib/studioTypes';
import ThemeToggle from './ThemeToggle';

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/workspace', label: 'Workspace', icon: FolderKanban },
  { to: '/ai-studio', label: 'AI Studio', icon: Sparkles },
  { to: '/accounting', label: 'Accounting', icon: Calculator },
  { to: '/models', label: 'Models', icon: Boxes },
  { to: '/datasets', label: 'Datasets', icon: Database },
  { to: '/deploy', label: 'Deploy', icon: Rocket },
  { to: '/marketplace', label: 'Marketplace', icon: Store },
  { to: '/community', label: 'Community', icon: UsersRound },
  { to: '/docs', label: 'Documentation', icon: BookOpen },
];

export function StudioLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-cream">
        <Sigma size={20} strokeWidth={2.2} />
      </div>
      {!compact && (
        <div>
          <p className="font-display text-lg font-semibold leading-tight text-ink">TensoraMax</p>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">Studio</p>
        </div>
      )}
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-5 py-5">
        <StudioLogo />
      </div>
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Studio navigation">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                isActive ? 'bg-primary text-white shadow-sm' : 'text-ink-soft hover:bg-primary-soft hover:text-ink'
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-line px-5 py-4">
        <p className="text-[11px] font-semibold text-ink-soft">Build. Train. Deploy.</p>
        <p className="mt-0.5 text-[11px] text-muted">© TensoraMax Studio</p>
      </div>
    </div>
  );
}

export default function StudioShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const current = nav.find((n) => location.pathname.startsWith(n.to));
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    apiGet<Notification[]>('/studio?resource=notifications').then(setNotifications).catch(() => {});
  }, []);

  const markAllRead = async () => {
    const unreadItems = notifications.filter((n) => !n.read);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await Promise.all(unreadItems.map((n) => apiSend('/studio', 'PUT', { resource: 'notifications', id: n.id, read: true }).catch(() => {})));
  };

  const initials = (user?.email || 'TX').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-line bg-surface lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-surface shadow-xl">
            <button
              className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-muted hover:bg-cream"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-cream/90 px-4 py-3 backdrop-blur sm:px-6">
          <button
            className="rounded-lg border border-line bg-surface p-2 text-ink-soft lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <h1 className="font-display text-lg font-semibold text-ink sm:text-xl">{title ?? current?.label ?? 'Studio'}</h1>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                className="w-52 rounded-lg border border-line bg-surface py-2 pl-8 pr-3 text-[13px] text-ink outline-none placeholder:text-muted focus:border-primary"
                placeholder="Search Studio…"
                onKeyDown={(e) => { if (e.key === 'Enter') navigate('/workspace'); }}
              />
            </div>

            <div className="relative">
              <button
                onClick={() => { setNotifOpen((o) => !o); setUserOpen(false); }}
                className="relative rounded-lg border border-line bg-surface p-2 text-ink-soft transition hover:border-primary/40"
                aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
                aria-expanded={notifOpen}
                aria-haspopup="dialog"
              >
                <Bell size={16} />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">{unread}</span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
                    <div className="flex items-center justify-between border-b border-line px-4 py-3">
                      <p className="text-sm font-semibold text-ink">Notifications</p>
                      {unread > 0 && (
                        <button onClick={markAllRead} className="text-xs font-semibold text-primary hover:underline">Mark all read</button>
                      )}
                    </div>
                    <div className="scrollbar-thin max-h-80 overflow-y-auto">
                      {notifications.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted">No notifications.</p>}
                      {notifications.map((n) => (
                        <div key={n.id} className={`border-b border-line/60 px-4 py-3 last:border-0 ${n.read ? '' : 'bg-primary-soft/40'}`}>
                          <p className="text-[13px] font-medium text-ink">{n.title}</p>
                          <p className="mt-0.5 text-xs text-muted">{n.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => { setUserOpen((o) => !o); setNotifOpen(false); }}
                className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1.5 hover:border-primary/40"
                aria-label="Account menu"
                aria-expanded={userOpen}
                aria-haspopup="menu"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">{initials}</span>
                <ChevronDown size={13} className="text-muted" />
              </button>
              {userOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
                    <div className="border-b border-line px-4 py-3">
                      <p className="truncate text-[13px] font-semibold text-ink">{user?.email ?? 'Guest session'}</p>
                      <p className="text-[11px] text-muted">TensoraMax Studio</p>
                    </div>
                    {user ? (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setUserOpen(false)}
                          className="flex w-full items-center gap-2 border-b border-line/60 px-4 py-3 text-left text-[13px] font-medium text-ink-soft hover:bg-cream"
                        >
                          <UserRound size={14} className="text-primary" /> View profile
                        </Link>
                        <button
                          onClick={async () => { await signOut(); navigate('/'); }}
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-[13px] font-medium text-danger hover:bg-cream"
                        >
                          <LogOut size={14} /> Sign out
                        </button>
                      </>
                    ) : (
                      <Link to="/login" className="block px-4 py-3 text-[13px] font-semibold text-primary hover:bg-cream">Sign in</Link>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
