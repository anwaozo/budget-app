'use client';
import { useMemo, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useStore } from '@/store';
import { computeMonthSummary, formatCurrency, formatPct, contextColor, addMonths, getMonthKey, cn } from '@/lib/utils';

type Tab = 'overview' | 'spending' | 'income' | 'networth' | 'yearend';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'overview',  label: 'Overview',         emoji: '📊' },
  { id: 'spending',  label: 'Spending',          emoji: '💸' },
  { id: 'income',    label: 'Income',            emoji: '💰' },
  { id: 'networth',  label: 'Net Worth',         emoji: '📈' },
  { id: 'yearend',   label: 'Year-End',          emoji: '🎯' },
];

// Chart tooltip style
const tooltipStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--text-primary)',
};

// ── Shared KPI card ────────────────────────────────────────────
function KPI({ label, value, sub, color, trend }: {
  label: string; value: string; sub?: string; color: string; trend?: 'up' | 'down' | 'flat';
}) {
  return (
    <div className="card p-4 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-0.5" style={{ background: color }} />
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-lg sm:text-2xl font-bold font-mono leading-none mb-1" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] sm:text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────
function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const { transactions, categories, contexts, activeContextId, debts } = useStore();

  const activeCtx = contexts.find(c => c.id === activeContextId);
  const accent = activeCtx ? contextColor(activeCtx.type) : '#0EA5A0';
  const getCat = (id: string) => categories.find(c => c.id === id);

  // Build last 6 months of data
  const today = new Date(2026, 4, 31); // May 31 2026
  const months6 = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = addMonths(today, i - 5);
    const key = getMonthKey(d);
    const s = computeMonthSummary(transactions, key, activeContextId);
    return {
      key,
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      shortLabel: d.toLocaleDateString('en-US', { month: 'short' }),
      ...s,
    };
  }), [transactions, activeContextId]);

  // Avg over last 5 full months (exclude partial May)
  const full5 = months6.slice(0, 5);
  const avgIncome   = full5.reduce((s, m) => s + m.totalIncome, 0) / 5;
  const avgExpenses = full5.reduce((s, m) => s + m.totalExpenses, 0) / 5;
  const avgSavings  = full5.reduce((s, m) => s + m.savingsRate, 0) / 5;
  const avgNet      = avgIncome - avgExpenses;

  // Category spending breakdown for last full month (Apr 2026)
  const aprilTx = transactions.filter(t =>
    t.contextId === activeContextId && t.date.startsWith('2026-04') && t.type !== 'income'
  );
  const catSpend = useMemo(() => {
    const map: Record<string, number> = {};
    aprilTx.forEach(t => { map[t.categoryId] = (map[t.categoryId] ?? 0) + Math.abs(t.amount); });
    return Object.entries(map)
      .map(([id, total]) => ({ id, name: getCat(id)?.name ?? id, icon: getCat(id)?.icon ?? '📦', total }))
      .sort((a, b) => b.total - a.total);
  }, [aprilTx, categories]);

  // Category trend data — top 5 categories over 5 months
  const top5Cats = catSpend.slice(0, 5).map(c => c.id);
  const catTrendData = useMemo(() => full5.map(m => {
    const row: Record<string, string | number> = { month: m.shortLabel };
    top5Cats.forEach(catId => {
      const total = transactions
        .filter(t => t.contextId === activeContextId && t.date.startsWith(m.key) && t.categoryId === catId && t.type !== 'income')
        .reduce((s, t) => s + Math.abs(t.amount), 0);
      row[getCat(catId)?.name ?? catId] = total;
    });
    return row;
  }), [transactions, full5, top5Cats, activeContextId]);

  // Income breakdown
  const incomeBySource = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter(t => t.contextId === activeContextId && t.type === 'income')
      .forEach(t => {
        const key = t.payee.includes('Optum') ? 'Adam — Optum (Job 2)'
          : t.payee.includes('Bailey') || t.payee.includes('Webster') ? 'Bailey — Zelle'
          : t.payee.includes('Adam') ? 'Adam — Transfer'
          : 'Other Income';
        map[key] = (map[key] ?? 0) + t.amount;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions, activeContextId]);

  // Account balance trend from statement end balances
  const balanceTrend = [
    { month: 'Dec 25', balance: 17540 },
    { month: 'Jan 26', balance: 18301 },
    { month: 'Feb 26', balance: 17595 },
    { month: 'Mar 26', balance: 18558 },
    { month: 'Apr 26', balance: 21132 },
  ];

  const totalDebt = debts.filter(d => d.contextId === activeContextId && d.isActive)
    .reduce((s, d) => s + d.currentBalance, 0);

  const netWorthData = balanceTrend.map((b, i) => ({
    ...b,
    netWorth: b.balance - totalDebt + i * 1000, // approx brokerage growth
    debt: -totalDebt,
  }));

  // Year-end projection
  const currentBalance = 21132;
  const monthsLeft = 7; // Jun–Dec
  const projectedYE = currentBalance + (avgNet * monthsLeft);
  const yearTotalIncome = full5.reduce((s, m) => s + m.totalIncome, 0) + (avgIncome * 7);
  const yearTotalExpenses = full5.reduce((s, m) => s + m.totalExpenses, 0) + (avgExpenses * 7);

  const CHART_COLORS = [accent, '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#22C55E'];
  const PIE_COLORS  = ['#22C55E', '#0EA5A0', '#F59E0B', '#EF4444', '#8B5CF6', '#CBD5E0'];

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 max-w-[1400px] mx-auto">

      {/* ── Tab bar ── */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0', tab === t.id ? 'text-white' : 'hover:opacity-80')}
            style={{
              background: tab === t.id ? accent : 'var(--bg-card)',
              color: tab === t.id ? 'white' : 'var(--text-muted)',
              border: `1px solid ${tab === t.id ? accent : 'var(--border)'}`,
            }}>
            <span>{t.emoji}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <KPI label="Avg Monthly Income"   value={formatCurrency(avgIncome)}   sub="5-month avg (Dec–Apr)" color="#22C55E" />
            <KPI label="Avg Monthly Expenses" value={formatCurrency(avgExpenses)} sub="5-month avg"            color="#EF4444" />
            <KPI label="Avg Savings Rate"     value={formatPct(avgSavings)}       sub="Near-zero — rent heavy" color={accent} />
            <KPI label="Avg Net / Month"      value={formatCurrency(avgNet)}      sub="After all expenses"     color={avgNet >= 0 ? '#22C55E' : '#EF4444'} />
          </div>

          {/* Income vs Expenses bar chart */}
          <div className="card p-4">
            <SectionHead title="Income vs. Expenses — 6 Months" sub="Dec 2025 through May 2026 (partial)" />
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={months6} barSize={18} barGap={4} margin={{ left: 0, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCurrency(Number(v ?? 0)), '']} />
                <Bar dataKey="totalIncome"   fill="#22C55E" radius={[4,4,0,0]} name="Income"   />
                <Bar dataKey="totalExpenses" fill="#EF4444" radius={[4,4,0,0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-1">
              {[{c:'#22C55E',l:'Income'},{c:'#EF4444',l:'Expenses'}].map(i => (
                <span key={i.l} className="flex items-center gap-1 text-xs" style={{ color:'var(--text-muted)' }}>
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background:i.c }} />{i.l}
                </span>
              ))}
            </div>
          </div>

          {/* Savings rate line */}
          <div className="card p-4">
            <SectionHead title="Savings Rate Trend" sub="Rent is 62% of expenses — suppressing savings rate" />
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={months6} margin={{ left: 0, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${v.toFixed(0)}%`} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v ?? 0).toFixed(1)}%`, 'Savings Rate']} />
                <Line type="monotone" dataKey="savingsRate" stroke={accent} strokeWidth={2.5} dot={{ fill: accent, r: 4 }} name="Savings Rate" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-2 p-2.5 rounded-lg text-xs" style={{ background: '#EF444410', border: '1px solid #EF444430' }}>
              <span className="font-semibold text-red-400">⚠ Insight: </span>
              <span style={{ color: 'var(--text-muted)' }}>Rent ($3,750/mo) consumes ~62% of expenses. Without rent, estimated savings rate would be ~48%.</span>
            </div>
          </div>

          {/* Wants vs Needs over time */}
          <div className="card p-4">
            <SectionHead title="Wants vs. Needs Split" sub="All expenses classified by month" />
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={months6.filter(m => m.totalExpenses > 0)} barSize={24} margin={{ left: 0, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="shortLabel" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${v.toFixed(0)}%`} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={32} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v ?? 0).toFixed(1)}%`, '']} />
                <Bar dataKey="needsPct" stackId="a" fill={accent}    name="Needs %" radius={[0,0,0,0]} />
                <Bar dataKey="wantsPct" stackId="a" fill="#F59E0B"   name="Wants %" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: SPENDING
      ══════════════════════════════════════════════════════ */}
      {tab === 'spending' && (
        <div className="space-y-4">
          {/* Top expenses April 2026 */}
          <div className="card p-4">
            <SectionHead title="Top Spending Categories — April 2026" sub="Most recent full month" />
            <div className="space-y-2.5">
              {catSpend.slice(0, 8).map((cat, i) => {
                const maxVal = catSpend[0]?.total ?? 1;
                const pct    = (cat.total / maxVal) * 100;
                const color  = CHART_COLORS[i % CHART_COLORS.length];
                return (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-primary)' }}>
                        <span>{cat.icon}</span>{cat.name}
                      </span>
                      <span className="font-bold font-mono" style={{ color }}>{formatCurrency(cat.total)}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category trend bars */}
          <div className="card p-4">
            <SectionHead title="Category Spending — 5 Month Trend" sub="Top spending categories over time" />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={catTrendData} margin={{ left: 0, right: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(1)}k`} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCurrency(Number(v ?? 0)), '']} />
                <Legend wrapperStyle={{ fontSize: 10, color: 'var(--text-muted)' }} />
                {top5Cats.map((catId, i) => (
                  <Bar key={catId} dataKey={getCat(catId)?.name ?? catId} fill={CHART_COLORS[i]} radius={[3,3,0,0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart — April breakdown */}
          <div className="card p-4">
            <SectionHead title="April 2026 Expense Breakdown" sub="By category" />
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={catSpend.slice(0, 6)} dataKey="total" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                    {catSpend.slice(0, 6).map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCurrency(Number(v ?? 0)), '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {catSpend.slice(0, 6).map((cat, i) => (
                  <div key={cat.id} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                    <span className="flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{cat.icon} {cat.name}</span>
                    <span className="font-mono font-semibold" style={{ color: PIE_COLORS[i] }}>{formatCurrency(cat.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insight callout */}
          <div className="card p-4 border-l-4" style={{ borderLeftColor: '#EF4444' }}>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>💡 Key Insights</p>
            <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>• <strong style={{ color: 'var(--text-primary)' }}>Rent ($3,750/mo)</strong> is your single largest expense — 62% of all spending.</p>
              <p>• <strong style={{ color: 'var(--text-primary)' }}>EZTag tolls</strong> average ~$130/mo — more than your electricity bill most months.</p>
              <p>• <strong style={{ color: 'var(--text-primary)' }}>Auto expenses</strong> (loan $818 + insurance $441 + tolls $130) = ~$1,389/mo total.</p>
              <p>• <strong style={{ color: 'var(--text-primary)' }}>Gas bill</strong> dropped from $113 (Dec) to $66 (Apr) — seasonal savings of ~$570 annualized.</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: INCOME
      ══════════════════════════════════════════════════════ */}
      {tab === 'income' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            <KPI label="Adam — Optum Avg/Mo" value="$3,600"  sub="Bi-weekly $1,800 × 2"  color="#22C55E" />
            <KPI label="Bailey — Avg/Mo"     value="~$2,440" sub="Variable Zelle transfers" color={accent}  />
            <KPI label="Combined Avg"        value={formatCurrency(avgIncome)} sub="5-month average" color="#F59E0B" />
          </div>

          {/* Income sources area chart */}
          <div className="card p-4">
            <SectionHead title="Total Income — 6 Month Trend" sub="Combined household income flowing through Chase #8891" />
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={months6} margin={{ left: 0, right: 8 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCurrency(Number(v ?? 0)), 'Income']} />
                <Area type="monotone" dataKey="totalIncome" stroke="#22C55E" strokeWidth={2.5} fill="url(#incomeGrad)" name="Income" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Income breakdown pie */}
          <div className="card p-4">
            <SectionHead title="Income Sources — All-Time" sub="Cumulative breakdown by source" />
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={incomeBySource} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                    {incomeBySource.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCurrency(Number(v ?? 0)), '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {incomeBySource.map((src, i) => {
                  const total = incomeBySource.reduce((s, x) => s + x.value, 0);
                  return (
                    <div key={src.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{src.name}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatPct((src.value / total) * 100, 0)} of total</p>
                      </div>
                      <span className="text-xs font-bold font-mono" style={{ color: PIE_COLORS[i] }}>{formatCurrency(src.value)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card p-4 border-l-4" style={{ borderLeftColor: accent }}>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>💡 Income Insights</p>
            <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>• <strong style={{ color: 'var(--text-primary)' }}>Optum payroll</strong> is your most reliable income — $3,600/mo every month without fail.</p>
              <p>• <strong style={{ color: 'var(--text-primary)' }}>Bailey's transfers</strong> vary significantly ($500–$4,100) — plan budgets around the minimum.</p>
              <p>• <strong style={{ color: 'var(--text-primary)' }}>April</strong> was your highest income month ($7,099) — April payroll + $3,100 Bailey + $399 deposit.</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: NET WORTH
      ══════════════════════════════════════════════════════ */}
      {tab === 'networth' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <KPI label="Current Balance"  value={formatCurrency(21132)} sub="Chase #8891 Apr end"      color="#22C55E" />
            <KPI label="Balance Growth"   value="+$5,429"               sub="Dec 2025 → Apr 2026"       color={accent}  />
            <KPI label="Total Debt"       value={formatCurrency(totalDebt)} sub="Auto loan + CC"        color="#EF4444" />
            <KPI label="Est. Net Worth"   value={formatCurrency(21132 - totalDebt + 5000)} sub="Checking + brokerage est." color="#F59E0B" />
          </div>

          {/* Balance trend area chart */}
          <div className="card p-4">
            <SectionHead title="Account Balance Over Time" sub="Chase #8891 statement closing balances" />
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={balanceTrend} margin={{ left: 0, right: 8 }}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={accent} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={accent} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={36} domain={[14000, 23000]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCurrency(Number(v ?? 0)), 'Balance']} />
                <Area type="monotone" dataKey="balance" stroke={accent} strokeWidth={2.5} fill="url(#balGrad)" name="Balance" dot={{ fill: accent, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Debt payoff progress */}
          <div className="card p-4">
            <SectionHead title="Debt Payoff Progress" sub="Auto loan principal paid down over time" />
            <div className="space-y-3">
              {debts.filter(d => d.contextId === activeContextId).map(d => {
                const pct = ((d.originalBalance - d.currentBalance) / d.originalBalance) * 100;
                return (
                  <div key={d.id}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                      <div className="flex gap-3">
                        <span style={{ color: '#EF4444' }}>Remaining: {formatCurrency(d.currentBalance)}</span>
                        <span style={{ color: '#22C55E' }}>Paid: {formatPct(pct, 0)}</span>
                      </div>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent }} />
                    </div>
                    <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                      <span>Original: {formatCurrency(d.originalBalance)}</span>
                      <span>{formatCurrency(d.minimumPayment)}/mo · {(d.apr * 100).toFixed(2)}% APR</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: YEAR-END PROJECTION
      ══════════════════════════════════════════════════════ */}
      {tab === 'yearend' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <KPI label="Projected YE Balance" value={formatCurrency(projectedYE)}       sub="Based on 5-mo avg rate" color="#22C55E"  />
            <KPI label="Projected YE Income"  value={formatCurrency(yearTotalIncome)}   sub="Jan–Dec 2026 est."      color={accent}   />
            <KPI label="Projected YE Expenses"value={formatCurrency(yearTotalExpenses)} sub="Jan–Dec 2026 est."      color="#EF4444"  />
            <KPI label="Brokerage + Savings"  value={formatCurrency(1000 * 12)}         sub="$1K/mo × 12 months"    color="#F59E0B"  />
          </div>

          {/* Projection chart */}
          <div className="card p-4">
            <SectionHead title="Balance Projection — Jun–Dec 2026" sub={`Assumes avg net of ${formatCurrency(avgNet)}/mo`} />
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={[
                  { month: 'May', balance: 21132 },
                  ...Array.from({ length: 7 }, (_, i) => ({
                    month: addMonths(new Date(2026, 5), i).toLocaleDateString('en-US', { month: 'short' }),
                    balance: Math.round(21132 + (avgNet * (i + 1))),
                    projected: true,
                  })),
                ]}
                margin={{ left: 0, right: 8 }}>
                <defs>
                  <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCurrency(Number(v ?? 0)), 'Projected Balance']} />
                <Area type="monotone" dataKey="balance" stroke="#22C55E" strokeWidth={2.5} strokeDasharray="6 3" fill="url(#projGrad)" name="Projected" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Annual expenses breakdown */}
          <div className="card p-4">
            <SectionHead title="Annualized Expense Breakdown" sub="Major recurring costs projected for full year" />
            <div className="space-y-2">
              {[
                { label: 'Rent (Rhino)',        monthly: 3750,  color: '#EF4444', note: 'If rent continues all year' },
                { label: 'Auto Loan (PNC)',      monthly: 818,   color: '#F59E0B' },
                { label: 'Auto Insurance',       monthly: 441,   color: '#F59E0B' },
                { label: 'EZTag Tolls',          monthly: 130,   color: '#F59E0B', note: 'Monthly avg' },
                { label: 'Electricity',          monthly: 195,   color: accent,    note: 'Seasonal avg' },
                { label: 'Natural Gas',          monthly: 107,   color: accent,    note: 'Seasonal avg' },
                { label: 'Internet/Cable',       monthly: 101,   color: accent },
                { label: 'Storage (CubeSmart)',  monthly: 152,   color: accent },
                { label: 'Water & Sewer',        monthly: 120,   color: accent,    note: 'Estimate' },
                { label: 'Renters Insurance',    monthly: 28,    color: '#8B5CF6' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 text-xs">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: row.color }} />
                  <span className="flex-1" style={{ color: 'var(--text-primary)' }}>
                    {row.label}
                    {row.note && <span className="ml-1 opacity-60">({row.note})</span>}
                  </span>
                  <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{formatCurrency(row.monthly)}/mo</span>
                  <span className="font-bold font-mono w-20 text-right" style={{ color: row.color }}>{formatCurrency(row.monthly * 12)}/yr</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-1 flex justify-between text-xs font-bold" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                <span>Total Recurring Expenses</span>
                <span style={{ color: '#EF4444' }}>{formatCurrency((3750+818+441+130+195+107+101+152+120+28)*12)}/yr</span>
              </div>
            </div>
          </div>

          <div className="card p-4 border-l-4" style={{ borderLeftColor: '#22C55E' }}>
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🎯 Year-End Action Items</p>
            <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p>• If rent ends, your savings rate jumps from ~1% to ~48% — identify a move-out timeline.</p>
              <p>• Brokerage transfers ($1,000/mo = $12,000/yr) are your primary wealth-building vehicle.</p>
              <p>• Auto loan payoff at current rate: ~{Math.ceil(18500 / (818 - 18500 * 0.0699 / 12))} months remaining.</p>
              <p>• Consider EZTag pre-load schedule — multiple small charges suggest running low frequently.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
