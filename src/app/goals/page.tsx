'use client';
import { useState } from 'react';
import { Plus, Target, Trash2, Pencil } from 'lucide-react';
import { useStore } from '@/store';
import { formatCurrency, formatPct, projectGoalCompletion, contextColor, cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { ContextBadge } from '@/components/ui/ContextBadge';

function NewGoalModal({ onClose }: { onClose: () => void }) {
  const { contexts, activeContextId, accessibleContextIds, addGoal } = useStore();
  const accessible = contexts.filter(c => accessibleContextIds().includes(c.id));
  const COLORS = ['#22C55E', '#0EA5A0', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', monthlyContribution: '', targetDate: '', note: '', contextId: activeContextId, color: COLORS[0] });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addGoal({ name: form.name, targetAmount: parseFloat(form.targetAmount) || 0, currentAmount: parseFloat(form.currentAmount) || 0, monthlyContribution: parseFloat(form.monthlyContribution) || 0, targetDate: form.targetDate, note: form.note, contextId: form.contextId, color: form.color });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Goal Name</label><input required className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Emergency Fund" /></div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Target Amount ($)</label><input required type="number" className="input" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} placeholder="15000" /></div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Already Saved ($)</label><input type="number" className="input" value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))} placeholder="0" /></div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Monthly Contribution ($)</label><input required type="number" className="input" value={form.monthlyContribution} onChange={e => setForm(f => ({ ...f, monthlyContribution: e.target.value }))} placeholder="500" /></div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Target Date</label><input required type="date" className="input" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} /></div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Context (Budget)</label>
          <select className="input" value={form.contextId} onChange={e => setForm(f => ({ ...f, contextId: e.target.value }))}>
            {accessible.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
          </select>
        </div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Color</label>
          <div className="flex gap-2 pt-1 flex-wrap">
            {COLORS.map(c => <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))} className={cn('w-7 h-7 rounded-full transition-all', form.color === c ? 'ring-2 ring-offset-1 scale-110' : 'hover:scale-105')} style={{ background: c }} />)}
          </div>
        </div>
        <div className="col-span-2"><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Note (optional)</label><input className="input" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Add a note..." /></div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">Create Goal</button>
        <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

export default function GoalsPage() {
  const { goals, contexts, activeContextId, accessibleContextIds, addContribution, deleteGoal, updateGoal } = useStore();
  const [showNew, setShowNew] = useState(false);
  const [ctxFilter, setCtxFilter] = useState<string>('all');

  const activeCtx = contexts.find(c => c.id === activeContextId);
  const accentColor = activeCtx ? contextColor(activeCtx.type) : '#0EA5A0';
  const accessibleIds = accessibleContextIds();
  const accessibleCtxs = contexts.filter(c => accessibleIds.includes(c.id));

  const visibleGoals = goals.filter(g => {
    if (!accessibleIds.includes(g.contextId)) return false;
    if (ctxFilter !== 'all' && g.contextId !== ctxFilter) return false;
    return true;
  });

  const totalSaved = visibleGoals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = visibleGoals.reduce((s, g) => s + g.targetAmount, 0);
  const totalMonthly = visibleGoals.reduce((s, g) => s + g.monthlyContribution, 0);

  function handleContribute(goalId: string) {
    const input = prompt('Contribution amount ($):');
    const amt = parseFloat(input ?? '0');
    if (amt > 0) addContribution(goalId, amt, new Date().toISOString().slice(0, 10));
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1400px] mx-auto">
      {showNew && <Modal title="New Savings Goal" onClose={() => setShowNew(false)} size="md"><NewGoalModal onClose={() => setShowNew(false)} /></Modal>}

      {/* KPI strip */}
      <div className="rounded-xl p-4 lg:p-5 grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ background: 'var(--bg-sidebar)' }}>
        {[{ label: 'Total Saved', val: formatCurrency(totalSaved), color: '#22C55E' }, { label: 'Total Target', val: formatCurrency(totalTarget), color: 'var(--text-primary)' }, { label: 'Progress', val: formatPct(totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0), color: accentColor }, { label: 'Monthly', val: `${formatCurrency(totalMonthly)}/mo`, color: '#F59E0B' }].map(k => (
          <div key={k.label}><p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{k.label}</p><p className="text-xl font-bold font-mono" style={{ color: k.color }}>{k.val}</p></div>
        ))}
      </div>

      {/* Context filter + New Goal button */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setCtxFilter('all')} className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all', ctxFilter === 'all' ? 'text-white border-transparent' : 'hover:opacity-80')}
            style={{ background: ctxFilter === 'all' ? accentColor : 'transparent', borderColor: ctxFilter === 'all' ? accentColor : 'var(--border)', color: ctxFilter === 'all' ? 'white' : 'var(--text-muted)' }}>
            All Contexts
          </button>
          {accessibleCtxs.map(ctx => {
            const c = contextColor(ctx.type);
            return (
              <button key={ctx.id} onClick={() => setCtxFilter(ctx.id)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all', ctxFilter === ctx.id ? 'text-white border-transparent' : 'hover:opacity-80')}
                style={{ background: ctxFilter === ctx.id ? c : 'transparent', borderColor: c, color: ctxFilter === ctx.id ? 'white' : c }}>
                {ctx.name}
              </button>
            );
          })}
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2" style={{ background: accentColor }}><Plus size={14} /> New Goal</button>
      </div>

      {/* Goal cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visibleGoals.map(g => {
          const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
          const eta = projectGoalCompletion(g.currentAmount, g.targetAmount, g.monthlyContribution);
          const color = g.color ?? accentColor;
          const ctx = contexts.find(c => c.id === g.contextId);
          return (
            <div key={g.id} className="card overflow-hidden group">
              <div className="h-1" style={{ background: color }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-base truncate" style={{ color: 'var(--text-primary)' }}>{g.name}</h3>
                      {ctx && <ContextBadge type={ctx.type} name={ctx.name} size="sm" />}
                    </div>
                    {g.note && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{g.note}</p>}
                  </div>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: color + '20', color }}>
                    {Math.round(pct)}%
                  </div>
                </div>
                <div className="flex gap-4 mb-3">
                  <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Saved</p><p className="text-xl font-bold font-mono" style={{ color }}>{formatCurrency(g.currentAmount)}</p></div>
                  <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Target</p><p className="text-xl font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{formatCurrency(g.targetAmount)}</p></div>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-xs space-y-0.5">
                    {eta && <p style={{ color }}><span style={{ color: 'var(--text-muted)' }}>ETA: </span>{eta.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>}
                    <p style={{ color: 'var(--text-muted)' }}>{formatCurrency(g.monthlyContribution)}/mo contribution</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => deleteGoal(g.id)} className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors" title="Delete goal"><Trash2 size={13} /></button>
                    </div>
                    <button onClick={() => handleContribute(g.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors border"
                      style={{ color, borderColor: color, background: color + '15' }}>
                      + Contribute
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {/* Empty state */}
        {visibleGoals.length === 0 && (
          <div className="lg:col-span-2 card p-12 text-center">
            <Target size={40} className="mx-auto mb-3 opacity-30" style={{ color: accentColor }} />
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No goals yet</p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Create your first savings goal to get started</p>
            <button onClick={() => setShowNew(true)} className="btn-primary" style={{ background: accentColor }}><Plus size={14} className="inline mr-1" />New Goal</button>
          </div>
        )}
      </div>
    </div>
  );
}
