'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '@/store';
import { computeMonthSummary, formatCurrency, formatPct, contextColor, addMonths, getMonthKey } from '@/lib/utils';
import { ContextBadge } from '@/components/ui/ContextBadge';
import { cn } from '@/lib/utils';

function KPICard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="card p-5 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-xl" style={{ background: color }} />
      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-2xl font-bold font-mono mb-1" style={{ color }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { transactions, goals, categories, activeContextId, contexts, selectedMonth } = useStore();
  const activeCtx = contexts.find(c => c.id === activeContextId);
  const isBusiness = activeCtx?.type === 'business';
  const accentColor = activeCtx ? contextColor(activeCtx.type) : '#0EA5A0';

  const summary = useMemo(() => computeMonthSummary(transactions, selectedMonth, activeContextId), [transactions, selectedMonth, activeContextId]);
  const recentTx = useMemo(() => [...transactions].filter(t => t.contextId === activeContextId && t.date.startsWith(selectedMonth)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6), [transactions, activeContextId, selectedMonth]);
  const contextGoals = useMemo(() => goals.filter(g => g.contextId === activeContextId), [goals, activeContextId]);

  const chartData = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    return Array.from({ length: 5 }, (_, i) => {
      const d = addMonths(new Date(y, m - 1), i - 4);
      const key = getMonthKey(d);
      const s = computeMonthSummary(transactions, key, activeContextId);
      return { month: d.toLocaleDateString('en-US', { month: 'short' }), income: s.totalIncome, expenses: s.totalExpenses };
    });
  }, [transactions, selectedMonth, activeContextId]);

  const getCatName = (id: string) => categories.find(c => c.id === id)?.name ?? id;

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Context banner */}
      {activeCtx && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold"
          style={{ borderColor: accentColor, background: accentColor + '10', color: accentColor }}>
          <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
          Viewing: {activeCtx.name}
          <ContextBadge type={activeCtx.type} size="sm" className="ml-1" />
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isBusiness ? <>
          <KPICard label="Total Revenue" value={formatCurrency(summary.totalIncome)} sub="This month" color="#22C55E" />
          <KPICard label="Operating Expenses" value={formatCurrency(summary.totalExpenses)} sub="This month" color="#EF4444" />
          <KPICard label="Net Profit" value={formatCurrency((summary.netProfit ?? 0))} sub={`${formatPct(summary.savingsRate)} margin`} color={accentColor} />
          <KPICard label="Wants / Needs" value={`${Math.round(summary.wantsPct)}% / ${Math.round(summary.needsPct)}%`} sub="Of expenses" color="#F59E0B" />
        </> : <>
          <KPICard label="Net Income" value={formatCurrency(summary.totalIncome)} sub="This month" color="#22C55E" />
          <KPICard label="Total Expenses" value={formatCurrency(summary.totalExpenses)} sub="This month" color="#EF4444" />
          <KPICard label="Savings Rate" value={formatPct(summary.savingsRate)} sub="Target ≥ 20%" color={accentColor} />
          <KPICard label="Wants / Needs" value={`${Math.round(summary.wantsPct)}% / ${Math.round(summary.needsPct)}%`} sub="Of expenses" color="#F59E0B" />
        </>}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Monthly Overview</h2>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={chartData} barSize={18} barGap={4}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [formatCurrency(Number(v ?? 0)), '']} />
              <Bar dataKey="income" fill={accentColor} radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Wants vs. Needs</h2>
          <div className="space-y-4">
            {[{ label: 'Needs', pct: summary.needsPct, color: accentColor }, { label: 'Wants', pct: summary.wantsPct, color: '#F59E0B' }].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  <span>{label}</span><span className="font-semibold" style={{ color }}>{formatPct(pct)}</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
                </div>
              </div>
            ))}
            <div className="mt-3 p-3 rounded-lg border text-xs" style={{ borderColor: accentColor, background: accentColor + '10', color: accentColor }}>
              <p className="font-semibold">50/30/20 Benchmark</p>
              <p className="mt-0.5 opacity-80">Needs ≤50% · Wants ≤30% · Savings ≥20%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals + Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Savings Goals</h2>
            <Link href="/goals" className="text-xs font-semibold hover:underline" style={{ color: accentColor }}>View All →</Link>
          </div>
          {contextGoals.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No goals yet — <Link href="/goals" className="underline" style={{ color: accentColor }}>create one</Link></p>
          ) : contextGoals.slice(0, 3).map(g => {
            const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
            return (
              <div key={g.id} className="mb-4 last:mb-0">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{g.name}</span>
                  <span className="font-bold font-mono ml-2 flex-shrink-0" style={{ color: g.color ?? accentColor }}>{Math.round(pct)}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: g.color ?? accentColor }} />
                </div>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{formatCurrency(g.currentAmount)} of {formatCurrency(g.targetAmount)}</p>
              </div>
            );
          })}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h2>
            <Link href="/ledger" className="text-xs font-semibold hover:underline" style={{ color: accentColor }}>View All →</Link>
          </div>
          <div className="space-y-0.5">
            {recentTx.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No transactions this month</p>
            ) : recentTx.map((tx, i) => (
              <div key={tx.id} className={cn('flex items-center gap-3 py-2.5 px-2 rounded-lg', i < recentTx.length - 1 && 'border-b')} style={{ borderColor: 'var(--border)' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tx.type === 'income' ? '#22C55E' : tx.type === 'want' ? '#F59E0B' : accentColor }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tx.payee}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{getCatName(tx.categoryId)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn('badge', tx.type === 'income' ? 'badge-income' : tx.type === 'want' ? 'badge-want' : 'badge-need')}>{tx.type}</span>
                  <span className="text-sm font-bold font-mono" style={{ color: tx.amount > 0 ? '#22C55E' : '#EF4444' }}>{formatCurrency(tx.amount, true)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
