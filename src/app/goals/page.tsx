'use client';
import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { useStore } from '@/store';
import { formatCurrency, formatPct, projectGoalCompletion } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function GoalsPage() {
  const { goals, addGoal, addContribution } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', monthlyContribution: '', targetDate: '', note: '' });

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const overallPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const totalMonthly = goals.reduce((s, g) => s + g.monthlyContribution, 0);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    addGoal({
      name: form.name,
      targetAmount: parseFloat(form.targetAmount) || 0,
      currentAmount: parseFloat(form.currentAmount) || 0,
      monthlyContribution: parseFloat(form.monthlyContribution) || 0,
      targetDate: form.targetDate,
      note: form.note,
      color: ['#22C55E','#0EA5A0','#F59E0B','#EF4444','#8B5CF6'][goals.length % 5],
    });
    setForm({ name:'', targetAmount:'', currentAmount:'', monthlyContribution:'', targetDate:'', note:'' });
    setShowAdd(false);
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1400px] mx-auto">

      {/* KPI strip */}
      <div className="rounded-xl p-4 lg:p-5 grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ background: 'var(--bg-sidebar)' }}>
        {[
          { label:'Total Saved', val:formatCurrency(totalSaved), color:'#22C55E' },
          { label:'Total Target', val:formatCurrency(totalTarget), color:'var(--text-primary)' },
          { label:'Overall Progress', val:formatPct(overallPct), color:'#0EA5A0' },
          { label:'Monthly Contributions', val:`${formatCurrency(totalMonthly)}/mo`, color:'#F59E0B' },
        ].map(k => (
          <div key={k.label}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
            <p className="text-xl font-bold font-mono" style={{ color: k.color }}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Add goal button */}
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> New Goal
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="card p-5 space-y-4">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Create New Savings Goal</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>Goal Name</label><input className="input" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Emergency Fund" /></div>
            <div><label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>Target Amount ($)</label><input className="input" type="number" required value={form.targetAmount} onChange={e => setForm(f => ({...f, targetAmount: e.target.value}))} placeholder="15000" /></div>
            <div><label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>Already Saved ($)</label><input className="input" type="number" value={form.currentAmount} onChange={e => setForm(f => ({...f, currentAmount: e.target.value}))} placeholder="0" /></div>
            <div><label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>Monthly Contribution ($)</label><input className="input" type="number" required value={form.monthlyContribution} onChange={e => setForm(f => ({...f, monthlyContribution: e.target.value}))} placeholder="500" /></div>
            <div><label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>Target Date</label><input className="input" type="date" required value={form.targetDate} onChange={e => setForm(f => ({...f, targetDate: e.target.value}))} /></div>
            <div><label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-muted)' }}>Note (optional)</label><input className="input" value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} placeholder="Add a note..." /></div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Save Goal</button>
            <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* Goal cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {goals.map(g => {
          const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
          const eta = projectGoalCompletion(g.currentAmount, g.targetAmount, g.monthlyContribution);
          const color = g.color ?? '#0EA5A0';
          return (
            <div key={g.id} className="card overflow-hidden">
              {/* Top accent bar */}
              <div className="h-1" style={{ background: color }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{g.name}</h3>
                    {g.note && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{g.note}</p>}
                  </div>
                  {/* Ring */}
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: color + '20', color }}>
                      {Math.round(pct)}%
                    </div>
                  </div>
                </div>

                {/* Amounts */}
                <div className="flex gap-4 mb-3">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Saved</p>
                    <p className="text-xl font-bold font-mono" style={{ color }}>{formatCurrency(g.currentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Target</p>
                    <p className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{formatCurrency(g.targetAmount)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="text-xs space-y-0.5">
                    {eta && <p style={{ color }}><span style={{ color: 'var(--text-muted)' }}>ETA: </span>{eta.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>}
                    <p style={{ color: 'var(--text-muted)' }}>${g.monthlyContribution}/mo contribution</p>
                  </div>
                  <button
                    onClick={() => {
                      const amt = parseFloat(prompt('Contribution amount ($):') ?? '0') || 0;
                      if (amt > 0) addContribution(g.id, amt, new Date().toISOString().slice(0, 10));
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors border"
                    style={{ color, borderColor: color, background: color + '15' }}
                  >
                    + Contribute
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-20">
          <Target size={40} className="mx-auto mb-3 text-teal-500/40" />
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No goals yet</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Create your first savings goal to get started</p>
        </div>
      )}
    </div>
  );
}
