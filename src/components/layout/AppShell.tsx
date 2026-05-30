'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, BookOpen, Target, BarChart3, Settings, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { getMonthLabel } from '@/lib/utils';
import { addMonths } from '@/lib/utils';

const NAV = [
  { href: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/budget',     label: 'Budget',    icon: Wallet },
  { href: '/ledger',     label: 'Ledger',    icon: BookOpen },
  { href: '/goals',      label: 'Goals',     icon: Target },
  { href: '/analytics',  label: 'Analytics', icon: BarChart3 },
  { href: '/settings',   label: 'Settings',  icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggleTheme, selectedMonth, setSelectedMonth } = useStore();

  function shiftMonth(delta: number) {
    const [y, m] = selectedMonth.split('-').map(Number);
    const next = addMonths(new Date(y, m - 1), delta);
    setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

      {/* ── SIDEBAR (desktop) ─────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 h-full" style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-white text-sm">B</div>
          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>BudgetHome</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-teal-500/15 text-teal-500 border-l-2 border-teal-500 pl-[10px]'
                    : 'hover:bg-teal-500/5'
                )}
                style={{ color: active ? undefined : 'var(--text-muted)' }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Profile + theme */}
        <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all hover:bg-teal-500/10"
            style={{ color: 'var(--text-muted)' }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">A</div>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Adam Nwaozo</p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>CTO & Co-Founder</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ──────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between px-4 lg:px-6 h-14 flex-shrink-0 border-b" style={{ background: 'var(--bg-topbar)', borderColor: 'var(--border)' }}>
          {/* Month picker */}
          <div className="flex items-center gap-2">
            <button onClick={() => shiftMonth(-1)} className="p-1.5 rounded-lg hover:bg-teal-500/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold min-w-[120px] text-center" style={{ color: 'var(--text-primary)' }}>
              {getMonthLabel(selectedMonth)}
            </span>
            <button onClick={() => shiftMonth(1)} className="p-1.5 rounded-lg hover:bg-teal-500/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-teal-500/10 transition-colors"
              style={{ color: 'var(--text-muted)' }}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* ── BOTTOM NAV (mobile) ───────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 flex border-t" style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
        {NAV.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5"
            >
              <Icon size={20} color={active ? '#0EA5A0' : 'var(--text-muted)'} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium" style={{ color: active ? '#0EA5A0' : 'var(--text-muted)' }}>
                {label}
              </span>
              {active && <span className="absolute bottom-0 w-6 h-0.5 bg-teal-500 rounded-full" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
