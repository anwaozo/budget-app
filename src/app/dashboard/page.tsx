'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '@/store';
import { computeMonthSummary, formatCurrency, formatPct, contextColor, addMonths, getMonthKey, cn } from '@/lib/utils';
import { ContextBadge } from '@/components/ui/ContextBadge';

function KPICard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="card p-4 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-xl" style={{ background: color }} />
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-xl sm:text-2xl font-bold font-mono mb-1 leading-none" style={{ color }}>{value}</p>
      <p className="text-[10px] sm:text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { transactions, goals, categories, activeContextId, contexts, selectedMonth } = useStore();
  const activeCtx   = contexts.find(c => c.id === activeContextId);
  const isBusiness  = activeCtx?.type === 'business';
  const accent      = activeCtx ? contextColor(activeCtx.type) : '#0EA5A0';

  const summary     = useMemo(() => computeMonthSummary(transactions, selectedMonth, activeContextId), [transactions, selectedMonth, activeContextId]);
  const recentTx    = useMemo(() => [...transactions].filter(t => t.contextId === activeContextId && t.date.startsWith(selectedMonth)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5), [transactions, activeContextId, selectedMonth]);
  const ctxGoals    = useMemo(() => goals.filter(g => g.contextId === activeContextId), [goals, activeContextId]);
  const getCatName  = (id: string) => categories.find(c => c.id === id)?.name ?? id;

  const chartData = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    return Array.from({ length: 5 }, (_, i) => {
      const d   = addMonths(new Date(y, m - 1), i - 4);
      const key = getMonthKey(d);
      const s   = computeMonthSummary(transactions, key, activeContextId);
      return { month: d.toLocaleDateString('en-US', { month: 'short' }), income: s.totalIncome, expenses: s.totalExpenses };
    });
  }, [transactions, selectedMonth, activeContextId]);

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 max-w-[1400px] mx-auto">

      {/* Context banner */}
      {activeCtx && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs sm:text-sm font-semibold"
          style={{ borderColor: accent, background: accent + '10', color: accent }}>
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent }} />
          <span className="truncate">{activeCtx.name}</span>
          <ContextBadge type={activeCtx.type} size="sm" className="ml-auto flex-shrink-0" />
        </div>
      )}

      {/* KPI cards — 2×2 on mobile, 4 across on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {isBusiness ? <>
          <KPICard label="Revenue"        value={formatCurrency(summary.totalIncome)}    sub="This month"              color="#22C55E" />
          <KPICard label="Expenses"       value={formatCurrency(summary.totalExpenses)}  sub="This month"              color="#EF4444" />
          <KPICard label="Net Profit"     value={formatCurrency(summary.netProfit??0)}   sub={`${formatPct(summary.savingsRate)} margin`} color={accent} />
          <KPICard label="Wants / Needs"  value={`${Math.round(summary.wantsPct)}/${Math.round(summary.needsPct)}%`} sub="Of expenses" color="#F59E0B" />
        </> : <>
          <KPICard label="Net Income"     value={formatCurrency(summary.totalIncome)}    sub="This month"              color="#22C55E" />
          <KPICard label="Total Expenses" value={formatCurrency(summary.totalExpenses)}  sub="This month"              color="#EF4444" />
          <KPICard label="Savings Rate"   value={formatPct(summary.savingsRate)}         sub="Target ≥ 20%"            color={accent} />
          <KPICard label="Wants / Needs"  value={`${Math.round(summary.wantsPct)}/${Math.round(summary.needsPct)}%`} sub="Of expenses" color="#F59E0B" />
        </>}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Bar chart */}
        <div className="card p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Monthly Overview</h2>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData} barSize={16} barGap={3}>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
                formatter={(v) => [formatCurrency(Number(v ?? 0)), '']} />
              <Bar dataKey="income"   fill={accent}    radius={[4,4,0,0]} name="Income" />
              <Bar dataKey="expenses" fill="#F59E0B"   radius={[4,4,0,0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-3 mt-1.5">
            {[{color: accent, label:'Income'}, {color:'#F59E0B', label:'Expenses'}].map(l => (
              <span key={l.label} className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: l.color }} />{l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Wants vs Needs */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Wants vs. Needs</h2>
          <div className="space-y-3">
            {[{ label:'Needs', pct:summary.needsPct, color:accent }, { label:'Wants', pct:summary.wantsPct, color:'#F59E0B' }].map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                  <span>{label}</span>
                  <span className="font-semibold" style={{ color }}>{formatPct(pct)}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
                </div>
              </div>
            ))}
            <div className="p-2.5 rounded-lg border text-xs mt-1" style={{ borderColor: accent, background: accent + '10', color: accent }}>
              <p className="font-semibold">50/30/20 Benchmark</p>
              <p className="mt-0.5 opacity-80">Needs ≤50% · Wants ≤30% · Savings ≥20%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals + Transactions — stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

        {/* Goals */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Savings Goals</h2>
            <Link href="/goals" className="text-xs font-semibold hover:underline" style={{ color: accent }}>View All →</Link>
          </div>
          {ctxGoals.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
              No goals yet — <Link href="/goals" className="underline" style={{ color: accent }}>create one</Link>
            </p>
          ) : ctxGoals.slice(0, 3).map(g => {
            const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
            return (
              <div key={g.id} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs sm:text-sm mb-1">
                  <span className="font-medium truncate pr-2" style={{ color: 'var(--text-primary)' }}>{g.name}</span>
                  <span className="font-bold font-mono flex-shrink-0" style={{ color: g.color ?? accent }}>{Math.round(pct)}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden mb-0.5" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.color ?? accent }} />
                </div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatCurrency(g.currentAmount)} of {formatCurrency(g.targetAmount)}</p>
              </div>
            );
          })}
        </div>

        {/* Recent Transactions */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h2>
            <Link href="/ledger" className="text-xs font-semibold hover:underline" style={{ color: accent }}>View All →</Link>
          </div>
          <div className="space-y-0.5">
            {recentTx.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No transactions this month</p>
            ) : recentTx.map((tx, i) => (
              <div key={tx.id}
                className={cn('flex items-center gap-2.5 py-2.5 px-2 rounded-lg', i < recentTx.length - 1 && 'border-b')}
                style={{ borderColor: 'var(--border)', borderLeft: `3px solid ${tx.type==='income'?'#22C55E':tx.type==='want'?'#F59E0B':accent}` }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tx.payee}</p>
                  <p className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>{getCatName(tx.categoryId)}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={cn('badge hidden sm:inline-flex', tx.type==='income'?'badge-income':tx.type==='want'?'badge-want':'badge-need')}>{tx.type}</span>
                  <span className="text-xs sm:text-sm font-bold font-mono" style={{ color: tx.amount>0?'#22C55E':'#EF4444' }}>
                    {formatCurrency(tx.amount, true)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
