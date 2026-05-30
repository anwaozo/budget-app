'use client';
import { useMemo, useState } from 'react';
import { useStore } from '@/store';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function BudgetPage() {
  const { budgetAllocations, transactions, categories, selectedMonth, upsertBudgetAllocation } = useStore();
  const [activeTab, setActiveTab] = useState<'need' | 'want'>('need');

  const monthAllocations = budgetAllocations.filter(b => b.month === selectedMonth);
  const monthTx = transactions.filter(t => t.date.startsWith(selectedMonth) && t.type !== 'income');

  const totalIncome = useMemo(() =>
    transactions.filter(t => t.date.startsWith(selectedMonth) && t.type === 'income')
      .reduce((s, t) => s + t.amount, 0),
    [transactions, selectedMonth]
  );

  const totalAllocated = monthAllocations.reduce((s, b) => s + b.allocated, 0);
  const remaining = totalIncome - totalAllocated;

  const rows = categories
    .filter(c => c.defaultType === activeTab && c.id !== 'income')
    .map(cat => {
      const alloc = monthAllocations.find(b => b.categoryId === cat.id);
      const spent = monthTx
        .filter(t => t.categoryId === cat.id)
        .reduce((s, t) => s + Math.abs(t.amount), 0);
      const allocated = alloc?.allocated ?? 0;
      const pct = allocated > 0 ? Math.min(spent / allocated, 1.1) : 0;
      const over = spent > allocated && allocated > 0;
      return { cat, allocated, spent, pct, over };
    });

  function handleAllocChange(catId: string, val: string) {
    const amount = parseFloat(val) || 0;
    upsertBudgetAllocation({ month: selectedMonth, categoryId: catId, allocated: amount, rollover: 0 });
  }

  const barColor = (pct: number, over: boolean) => {
    if (over) return '#EF4444';
    if (pct > 0.9) return '#F59E0B';
    return '#0EA5A0';
  };

  return (
    <div className="p-4 lg:p-8 space-y-4 max-w-[1400px] mx-auto">

      {/* Zero-based banner */}
      <div className="rounded-xl p-4 lg:p-5 flex flex-wrap gap-4 lg:gap-8" style={{ background: 'var(--bg-sidebar)' }}>
        {[
          { label: 'Income', value: formatCurrency(totalIncome), color: '#22C55E' },
          { label: 'Allocated', value: formatCurrency(totalAllocated), color: 'var(--text-primary)' },
          { label: 'Remaining', value: formatCurrency(Math.abs(remaining)), color: remaining >= 0 ? '#22C55E' : '#EF4444' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-xl lg:text-2xl font-bold font-mono" style={{ color }}>{value}</p>
          </div>
        ))}
        {remaining < 0 && (
          <div className="flex items-center px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold self-center">
            ⚠ Over-allocated by {formatCurrency(Math.abs(remaining))}
          </div>
        )}
        {remaining >= 0 && totalAllocated > 0 && (
          <div className="flex items-center px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-500 text-xs font-semibold self-center">
            ✓ {formatCurrency(remaining)} unassigned
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['need', 'want'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn('px-5 py-2 rounded-lg text-sm font-semibold transition-all', activeTab === tab ? 'bg-teal-500 text-white' : 'hover:bg-teal-500/10')}
            style={{ color: activeTab === tab ? undefined : 'var(--text-muted)' }}
          >
            {tab === 'need' ? 'Needs' : 'Wants'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_3fr_80px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wide" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-primary)' }}>
          <span>Category</span><span>Allocated</span><span>Spent</span><span>Remaining</span><span>Progress</span><span>Type</span>
        </div>

        {rows.map(({ cat, allocated, spent, pct, over }, i) => {
          const rem = allocated - spent;
          return (
            <div key={cat.id} className={cn('flex flex-col lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_3fr_80px] gap-2 lg:gap-4 px-4 lg:px-5 py-3 lg:py-4 border-b transition-colors hover:bg-teal-500/5', i % 2 === 1 && 'bg-teal-500/[0.02]')} style={{ borderColor: 'var(--border)' }}>
              {/* Category name */}
              <div className="flex items-center gap-2">
                <span>{cat.icon}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                {over && <span className="badge bg-red-500/10 text-red-400">Over</span>}
              </div>

              {/* Allocated (editable) */}
              <div className="flex items-center">
                <span className="text-xs mr-1 lg:hidden" style={{ color: 'var(--text-muted)' }}>Budget:</span>
                <input
                  type="number"
                  value={allocated || ''}
                  onChange={e => handleAllocChange(cat.id, e.target.value)}
                  placeholder="0"
                  className="input w-24 text-sm font-mono"
                />
              </div>

              {/* Spent */}
              <div className="flex items-center gap-2">
                <span className="text-xs lg:hidden" style={{ color: 'var(--text-muted)' }}>Spent:</span>
                <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{formatCurrency(spent)}</span>
              </div>

              {/* Remaining */}
              <div className="flex items-center gap-2">
                <span className="text-xs lg:hidden" style={{ color: 'var(--text-muted)' }}>Left:</span>
                <span className="text-sm font-bold font-mono" style={{ color: over ? '#EF4444' : rem === 0 ? 'var(--text-muted)' : '#22C55E' }}>
                  {allocated > 0 ? formatCurrency(rem) : '—'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct * 100, 100)}%`, background: barColor(pct, over) }} />
                </div>
                <span className="text-xs font-semibold w-9 text-right" style={{ color: barColor(pct, over) }}>
                  {allocated > 0 ? `${Math.round(pct * 100)}%` : '—'}
                </span>
              </div>

              {/* Type badge */}
              <div className="hidden lg:flex items-center">
                <span className={activeTab === 'need' ? 'badge-need' : 'badge-want'}>
                  {activeTab === 'need' ? 'Need' : 'Want'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
