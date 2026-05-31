'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, BookOpen, Target, BarChart3, Settings, Sun, Moon, ChevronLeft, ChevronRight, Snowflake } from 'lucide-react';
import { useStore } from '@/store';
import { ContextSwitcher } from '@/components/ui/ContextSwitcher';
import { ContextBadge } from '@/components/ui/ContextBadge';
import { contextColor, getMonthLabel, addMonths, cn } from '@/lib/utils';

const NAV = [
  { href:'/dashboard',     label:'Dashboard',  icon:LayoutDashboard },
  { href:'/budget',        label:'Budget',     icon:Wallet },
  { href:'/ledger',        label:'Ledger',     icon:BookOpen },
  { href:'/goals',         label:'Goals',      icon:Target },
  { href:'/debt-snowball', label:'Snowball',   icon:Snowflake },
  { href:'/analytics',     label:'Analytics',  icon:BarChart3 },
  { href:'/settings',      label:'Settings',   icon:Settings },
];

const MOBILE_NAV = [
  { href:'/dashboard',     label:'Home',      icon:LayoutDashboard },
  { href:'/budget',        label:'Budget',    icon:Wallet },
  { href:'/ledger',        label:'Ledger',    icon:BookOpen },
  { href:'/goals',         label:'Goals',     icon:Target },
  { href:'/debt-snowball', label:'Snowball',  icon:Snowflake },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const { users, activeUserId, contexts, activeContextId, selectedMonth, setSelectedMonth, toggleTheme } = useStore();

  const user       = users.find(u => u.id === activeUserId);
  const theme      = user?.theme ?? 'dark';
  const activeCtx  = contexts.find(c => c.id === activeContextId);
  const accent     = activeCtx ? contextColor(activeCtx.type) : '#0EA5A0';
  const snowAccent = '#3B82F6';

  function shiftMonth(d: number) {
    const [y, m] = selectedMonth.split('-').map(Number);
    const next   = addMonths(new Date(y, m - 1), d);
    setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  }

  function navColor(href: string) {
    return href === '/debt-snowball' ? snowAccent : accent;
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0"
        style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-16 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
            style={{ background: accent }}>H</div>
          <span className="font-bold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>Home Budget OS</span>
        </div>

        {/* Context badge */}
        {activeCtx && (
          <div className="px-3 py-2 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
            <ContextBadge type={activeCtx.type} name={activeCtx.name} size="sm" className="w-full justify-center" />
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            const c      = navColor(href);
            return (
              <Link key={href} href={href}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all no-select',
                  active ? 'border-l-2 pl-[10px]' : 'hover:bg-black/5 dark:hover:bg-white/5')}
                style={{ color: active ? c : 'var(--text-muted)', background: active ? c + '15' : undefined, borderColor: active ? c : 'transparent' }}>
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Profile + theme */}
        <div className="p-3 border-t space-y-1.5 flex-shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
          <button onClick={toggleTheme}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all hover:bg-black/5 dark:hover:bg-white/5 touch-target"
            style={{ color: 'var(--text-muted)' }}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <Link href="/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: accent }}>
              {user?.avatarInitials ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name ?? 'User'}</p>
              <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>Manage profile</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-2 lg:gap-3 px-3 lg:px-5 h-14 flex-shrink-0 border-b"
          style={{ background: 'var(--bg-topbar)', borderColor: 'var(--border)', paddingTop: 'var(--safe-top)' }}>

          {/* Month picker */}
          <div className="flex items-center gap-0.5">
            <button onClick={() => shiftMonth(-1)}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors touch-target"
              style={{ color: 'var(--text-muted)' }}>
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs sm:text-sm font-semibold min-w-[100px] sm:min-w-[124px] text-center"
              style={{ color: 'var(--text-primary)' }}>
              {getMonthLabel(selectedMonth)}
            </span>
            <button onClick={() => shiftMonth(1)}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors touch-target"
              style={{ color: 'var(--text-muted)' }}>
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="flex-1" />

          {/* Context switcher */}
          <ContextSwitcher />

          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors touch-target"
            style={{ color: 'var(--text-muted)' }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Avatar */}
          <Link href="/settings" className="touch-target">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: accent }}>
              {user?.avatarInitials ?? 'U'}
            </div>
          </Link>
        </header>

        {/* Page content — iOS momentum scroll */}
        <main className="flex-1 overflow-y-auto ios-scroll"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)' }}>
          <div className="lg:pb-0">
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom nav ────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex border-t"
        style={{
          background: 'var(--bg-sidebar)',
          borderColor: 'var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
        {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          const c      = navColor(href);
          return (
            <Link key={href} href={href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative touch-target no-select">
              <Icon size={22} color={active ? c : 'var(--text-muted)'} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium leading-none" style={{ color: active ? c : 'var(--text-muted)' }}>
                {label}
              </span>
              {active && (
                <span className="absolute top-0 left-3 right-3 h-0.5 rounded-full" style={{ background: c }} />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
