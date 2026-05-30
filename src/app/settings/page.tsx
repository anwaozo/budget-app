'use client';
import { Sun, Moon, Download } from 'lucide-react';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { theme, setTheme, transactions } = useStore();

  function exportCSV() {
    const headers = ['Date', 'Payee', 'Amount', 'Category', 'Type', 'Note'];
    const rows = transactions.map(t => [t.date, t.payee, t.amount, t.categoryId, t.type, t.note ?? '']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'budgethome-export.csv';
    a.click();
  }

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6">

      {/* Theme */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Appearance</h2>
        <div className="flex gap-3">
          {(['dark','light'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all', theme === t ? 'bg-teal-500 text-white border-teal-500' : 'border hover:bg-teal-500/10')}
              style={{ color: theme === t ? undefined : 'var(--text-muted)', borderColor: theme === t ? undefined : 'var(--border)' }}
            >
              {t === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
              {t.charAt(0).toUpperCase() + t.slice(1)} Mode
            </button>
          ))}
        </div>
      </div>

      {/* Profiles */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Profiles</h2>
        {[{ name:'Adam Nwaozo', role:'Primary — CTO & Co-Founder' }, { name:'Wife', role:'Partner' }].map(p => (
          <div key={p.name} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
            <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-bold">{p.name[0]}</div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Data */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Data</h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {transactions.length} transactions stored locally in your browser.
        </p>
        <button onClick={exportCSV} className="btn-ghost flex items-center gap-2">
          <Download size={14} /> Export All Transactions (CSV)
        </button>
      </div>

      {/* About */}
      <div className="card p-5 space-y-1">
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>About</h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>BudgetHome v1.0.0 — Nwaozo Family</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Built by Apperr · apperr.com</p>
      </div>
    </div>
  );
}
