'use client';
import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Plus } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/store';
import { computeMonthSummary, formatCurrency, formatPct } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function KPICard({ label, value, sub, trend, color }: {
  label: string; value: string; sub: string; trend?: 'up' | 'down' | 'neutral'; color: string;
}) {
  return (
    <div className="card p-5 flex flex-col gap-2 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: color }} />
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { transactions, goals, categories, budgetAllocations, selectedMonth } = useStore();

  const summary = useMemo(() => computeMonthSummary(transactions, selectedMonth), [transactions, selectedMonth]);

  const recentTx = useMemo(() =>
    [...transactions]
      .filter(t => t.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5),
    [transactions, selectedMonth]
  );

  // Bar chart — last 5 months
  const chartData = useMemo(() => {
    const months: { month: string; income: number; expenses: number }[] = [];
    const [y, m] = selectedMonth.split('-').map(Number);
    for (let i = 4; i >= 0; i--) {
      const d = new Date(y, m - 1 - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const s = computeMonthSummary(transactions, key);
      months.push({ month: d.toLocaleDateString('en-US', { month: 'short' }), income: s.totalIncome, expenses: s.totalExpenses });
    }
    return months;
  }, [transactions, selectedMonth]);

  const getCatName = (id: string) => categories.find(c => c.id === id)?.name ?? id;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1400px] mx-auto">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KPICard label="Net Income" value={formatCurrency(summary.totalIncome)} sub="This month" color="#22C55E" />
        <KPICard label="Total Expenses" value={formatCurrency(summary.totalExpenses)} sub="This month" color="#EF4444" />
        <KPICard label="Savings Rate" value={formatPct(summary.savingsRate)} sub="Target ≥ 20%" color="#0EA5A0" />
        <KPICard label="Wants / Needs" value={`${Math.round(summary.wantsPct)}% / ${Math.round(summary.needsPct)}%`} sub="Of expenses" color="#F59E0B" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly bar chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Monthly Overview</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={20} barGap={4}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [formatCurrency(Number(v ?? 0)), '']}
              />
              <Bar dataKey="income" fill="#0EA5A0" radius={[4,4,0,0]} name="Income" />
              <Bar dataKey="expenses" fill="#F59E0B" radius={[4,4,0,0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}><span className="w-3 h-3 rounded-sm bg-teal-500 inline-block" /> Income</span>
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Expenses</span>
          </div>
        </div>

        {/* Wants vs Needs */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Wants vs. Needs</h2>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>Needs</span><span className="text-teal-500 font-semibold">{formatPct(summary.needsPct)}</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${summary.needsPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>Wants</span><span className="text-amber-400 font-semibold">{formatPct(summary.wantsPct)}</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${summary.wantsPct}%` }} />
              </div>
            </div>
            <div className="mt-2 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
              <p className="text-xs font-semibold text-teal-500">50/30/20 Benchmark</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Needs ≤50% · Wants ≤30% · Savings ≥20%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Savings Goals + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Goals */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Savings Goals</h2>
            <Link href="/goals" className="text-xs text-teal-500 font-semibold hover:underline">View All →</Link>
          </div>
          <div className="space-y-4">
            {goals.slice(0, 3).map(g => {
              const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
              return (
                <div key={g.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{g.name}</span>
                    <span className="text-xs font-semibold" style={{ color: g.color ?? '#0EA5A0' }}>{Math.round(pct)}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: g.color ?? '#0EA5A0' }} />
                  </div>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    {formatCurrency(g.currentAmount)} of {formatCurrency(g.targetAmount)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Transactions</h2>
            <Link href="/ledger" className="text-xs text-teal-500 font-semibold hover:underline">View All →</Link>
          </div>
          <div className="space-y-1">
            {recentTx.map((tx, i) => (
              <div key={tx.id} className={cn('flex items-center gap-3 py-2.5 px-2 rounded-lg', i < recentTx.length - 1 && 'border-b')} style={{ borderColor: 'var(--border)' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tx.type === 'income' ? '#22C55E' : tx.type === 'want' ? '#F59E0B' : '#0EA5A0' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tx.payee}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{getCatName(tx.categoryId)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn('badge', tx.type === 'income' ? 'badge-income' : tx.type === 'want' ? 'badge-want' : 'badge-need')}>
                    {tx.type}
                  </span>
                  <span className="text-sm font-bold font-mono" style={{ color: tx.amount > 0 ? '#22C55E' : '#EF4444' }}>
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
