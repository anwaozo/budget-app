'use client';
import { useState, useMemo } from 'react';
import { Plus, Target, Trash2, Pencil } from 'lucide-react';
import { useStore } from '@/store';
import { formatCurrency, formatPct, projectGoalCompletion, contextColor, addMonths, cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { ContextBadge } from '@/components/ui/ContextBadge';
import { SavingsGoal } from '@/types';

const COLORS = ['#22C55E','#0EA5A0','#F59E0B','#EF4444','#8B5CF6','#EC4899'];

// ── Goal Form (shared by Add and Edit) ───────────────────────
function GoalForm({ goal, onClose }: { goal?: SavingsGoal; onClose: () => void }) {
  const { contexts, activeContextId, accessibleContextIds, addGoal, updateGoal } = useStore();
  const accessible = contexts.filter(c => accessibleContextIds().includes(c.id));

  const [form, setForm] = useState({
    name: goal?.name ?? '',
    targetAmount: goal?.targetAmount?.toString() ?? '',
    currentAmount: goal?.currentAmount?.toString() ?? '',
    monthlyContribution: goal?.monthlyContribution?.toString() ?? '',
    targetDate: goal?.targetDate ?? '',
    note: goal?.note ?? '',
    contextId: goal?.contextId ?? activeContextId,
    color: goal?.color ?? COLORS[0],
  });

  // Live ETA calculation
  const liveEta = useMemo(() => {
    const target = parseFloat(form.targetAmount) || 0;
    const current = parseFloat(form.currentAmount) || 0;
    const monthly = parseFloat(form.monthlyContribution) || 0;
    return projectGoalCompletion(current, target, monthly);
  }, [form.targetAmount, form.currentAmount, form.monthlyContribution]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name: form.name,
      targetAmount: parseFloat(form.targetAmount) || 0,
      currentAmount: parseFloat(form.currentAmount) || 0,
      monthlyContribution: parseFloat(form.monthlyContribution) || 0,
      targetDate: form.targetDate,
      note: form.note,
      contextId: form.contextId,
      color: form.color,
    };
    if (goal) { updateGoal(goal.id, data); } else { addGoal(data); }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Goal Name</label>
          <input required className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Emergency Fund" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Target Amount ($)</label>
          <input required type="number" className="input" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} placeholder="15000" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Already Saved ($)</label>
          <input type="number" className="input" value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))} placeholder="0" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Monthly Contribution ($)</label>
          <input required type="number" className="input" value={form.monthlyContribution} onChange={e => setForm(f => ({ ...f, monthlyContribution: e.target.value }))} placeholder="500" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Target Date</label>
          <input required type="date" className="input" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Budget Context</label>
          <select className="input" value={form.contextId} onChange={e => setForm(f => ({ ...f, contextId: e.target.value }))}>
            {accessible.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Note (optional)</label>
          <input className="input" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Add a note..." />
        </div>
      </div>

      {/* Live ETA */}
      {liveEta && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs" style={{ borderColor: '#0EA5A040', background: '#0EA5A010' }}>
          <span className="text-lg">📅</span>
          <span style={{ color: '#0EA5A0' }}>
            Projected completion: <strong>{liveEta.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</strong>
            {' '}· {formatCurrency(Math.max(0, (parseFloat(form.targetAmount)||0) - (parseFloat(form.currentAmount)||0)))} remaining
          </span>
        </div>
      )}

      {/* Color picker */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
              className={cn('w-8 h-8 rounded-full transition-all hover:scale-110', form.color === c ? 'ring-2 ring-offset-2 scale-110' : '')}
              style={{ background: c }} />
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary flex-1" style={{ background: form.color }}>{goal ? 'Save Changes' : 'Create Goal'}</button>
        <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

// ── Main Goals Page ───────────────────────────────────────────
export default function GoalsPage() {
  const { goals, contexts, activeContextId, accessibleContextIds, addContribution, deleteGoal } = useStore();
  const [showNew, setShowNew] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
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
      {showNew && <Modal title="New Savings Goal" onClose={() => setShowNew(false)} size="md"><GoalForm onClose={() => setShowNew(false)} /></Modal>}
      {editingGoal && <Modal title="Edit Goal" onClose={() => setEditingGoal(null)} size="md"><GoalForm goal={editingGoal} onClose={() => setEditingGoal(null)} /></Modal>}

      {/* KPI strip */}
      <div className="rounded-xl p-4 lg:p-5 grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ background: 'var(--bg-sidebar)' }}>
        {[{ label:'Total Saved',val:formatCurrency(totalSaved),color:'#22C55E'},{ label:'Total Target',val:formatCurrency(totalTarget),color:'var(--text-primary)'},{ label:'Progress',val:formatPct(totalTarget>0?(totalSaved/totalTarget)*100:0),color:accentColor},{ label:'Monthly',val:`${formatCurrency(totalMonthly)}/mo`,color:'#F59E0B'}].map(k => (
          <div key={k.label}><p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color:'var(--text-muted)' }}>{k.label}</p><p className="text-xl font-bold font-mono" style={{ color:k.color }}>{k.val}</p></div>
        ))}
      </div>

      {/* Filter + New button */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setCtxFilter('all')} className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all', ctxFilter==='all'?'text-white border-transparent':'hover:opacity-80')}
            style={{ background:ctxFilter==='all'?accentColor:'transparent', borderColor:ctxFilter==='all'?accentColor:'var(--border)', color:ctxFilter==='all'?'white':'var(--text-muted)' }}>
            All Contexts
          </button>
          {accessibleCtxs.map(ctx => {
            const c = contextColor(ctx.type);
            return (
              <button key={ctx.id} onClick={() => setCtxFilter(ctx.id)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all', ctxFilter===ctx.id?'text-white border-transparent':'hover:opacity-80')}
                style={{ background:ctxFilter===ctx.id?c:'transparent', borderColor:c, color:ctxFilter===ctx.id?'white':c }}>
                {ctx.name}
              </button>
            );
          })}
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2" style={{ background:accentColor }}><Plus size={14}/> New Goal</button>
      </div>

      {/* Goal cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visibleGoals.map(g => {
          const pct = Math.min((g.currentAmount/g.targetAmount)*100, 100);
          const eta = projectGoalCompletion(g.currentAmount, g.targetAmount, g.monthlyContribution);
          const color = g.color ?? accentColor;
          const ctx = contexts.find(c => c.id === g.contextId);
          return (
            <div key={g.id} className="card overflow-hidden group">
              <div className="h-1" style={{ background:color }} />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-base truncate" style={{ color:'var(--text-primary)' }}>{g.name}</h3>
                      {ctx && <ContextBadge type={ctx.type} name={ctx.name} size="sm" />}
                    </div>
                    {g.note && <p className="text-xs" style={{ color:'var(--text-muted)' }}>{g.note}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Edit button — prominent */}
                    <button onClick={() => setEditingGoal(g)}
                      className="p-1.5 rounded-lg transition-all hover:opacity-80 flex items-center gap-1 text-xs font-semibold"
                      style={{ background: color+'18', color, border:`1px solid ${color}40` }}>
                      <Pencil size={12}/> Edit
                    </button>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background:color+'20', color }}>
                      {Math.round(pct)}%
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mb-3">
                  <div><p className="text-xs" style={{ color:'var(--text-muted)' }}>Saved</p><p className="text-xl font-bold font-mono" style={{ color }}>{formatCurrency(g.currentAmount)}</p></div>
                  <div><p className="text-xs" style={{ color:'var(--text-muted)' }}>Target</p><p className="text-xl font-bold font-mono" style={{ color:'var(--text-primary)' }}>{formatCurrency(g.targetAmount)}</p></div>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ background:'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background:color }} />
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-xs space-y-0.5">
                    {eta && <p style={{ color }}><span style={{ color:'var(--text-muted)' }}>ETA: </span>{eta.toLocaleDateString('en-US',{month:'short',year:'numeric'})}</p>}
                    <p style={{ color:'var(--text-muted)' }}>{formatCurrency(g.monthlyContribution)}/mo contribution</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { if(confirm(`Delete "${g.name}"?`)) deleteGoal(g.id); }}
                      className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={13}/></button>
                    <button onClick={() => handleContribute(g.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors border"
                      style={{ color, borderColor:color, background:color+'15' }}>
                      + Contribute
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {visibleGoals.length === 0 && (
          <div className="lg:col-span-2 card p-12 text-center">
            <Target size={40} className="mx-auto mb-3 opacity-30" style={{ color:accentColor }} />
            <p className="text-sm font-semibold mb-1" style={{ color:'var(--text-primary)' }}>No goals yet</p>
            <p className="text-xs mb-4" style={{ color:'var(--text-muted)' }}>Create your first savings goal to get started</p>
            <button onClick={() => setShowNew(true)} className="btn-primary" style={{ background:accentColor }}><Plus size={14} className="inline mr-1"/>New Goal</button>
          </div>
        )}
      </div>
    </div>
  );
}
