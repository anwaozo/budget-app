'use client';
import { useMemo, useState } from 'react';
import { Settings2, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { useStore } from '@/store';
import { formatCurrency, contextColor, cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { WantsNeedsToggle } from '@/components/ui/WantsNeedsToggle';
import { TransactionType } from '@/types';

// ── Add / Edit Expense Modal ──────────────────────────────────
function AddExpenseModal({ onClose }: { onClose: () => void }) {
  const { categories, activeContextId, activeUserId, selectedMonth, addTransaction, contextCategories } = useStore();
  const cats = contextCategories(activeContextId).filter(c => c.defaultType !== 'income');
  const [form, setForm] = useState({ payee: '', amount: '', categoryId: cats[0]?.id ?? '', type: 'need' as 'need' | 'want', date: new Date().toISOString().slice(0, 10), note: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.payee || !form.amount) return;
    addTransaction({ contextId: activeContextId, date: form.date, payee: form.payee, amount: -Math.abs(parseFloat(form.amount)), categoryId: form.categoryId, type: form.type, note: form.note, importSource: 'manual', createdBy: activeUserId ?? '' });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Payee / Merchant</label><input required className="input" value={form.payee} onChange={e => setForm(f => ({ ...f, payee: e.target.value }))} placeholder="e.g. HEB Grocery" /></div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Amount ($)</label><input required type="number" step="0.01" className="input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" /></div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Date</label><input required type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Category</label>
          <select className="input" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
            {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Type</label>
          <div className="flex gap-2 pt-1">
            {(['need', 'want'] as const).map(t => (
              <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                className={cn('flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all', form.type === t ? 'text-white border-transparent' : 'hover:opacity-80')}
                style={{ background: form.type === t ? (t === 'need' ? '#0EA5A0' : '#F59E0B') : 'transparent', borderColor: t === 'need' ? '#0EA5A0' : '#F59E0B', color: form.type === t ? 'white' : (t === 'need' ? '#0EA5A0' : '#F59E0B') }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="col-span-2"><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Note (optional)</label><input className="input" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Add a note..." /></div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="btn-primary flex-1">Add Expense</button>
        <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

// ── Category Manager Modal ─────────────────────────────────────
function CategoryManagerModal({ onClose }: { onClose: () => void }) {
  const { categories, activeContextId, addCategory, updateCategory, deleteCategory, toggleCategoryType } = useStore();
  const [tab, setTab] = useState<'need' | 'want'>('need');
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', icon: '📦', type: tab as 'need' | 'want' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const cats = categories
    .filter(c => (c.contextId === 'global' || c.contextId === activeContextId) && c.defaultType === tab)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  function handleAdd() {
    if (!newCat.name.trim()) return;
    addCategory({ contextId: activeContextId, name: newCat.name.trim(), icon: newCat.icon, defaultType: newCat.type, isSystem: false, sortOrder: 99, color: undefined });
    setNewCat({ name: '', icon: '📦', type: tab });
    setAdding(false);
  }

  function startEdit(id: string, name: string) { setEditingId(id); setEditName(name); }
  function saveEdit(id: string) { if (editName.trim()) updateCategory(id, { name: editName.trim() }); setEditingId(null); }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['need', 'want'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-4 py-1.5 rounded-lg text-sm font-semibold transition-all', tab === t ? 'text-white' : 'hover:opacity-80')}
            style={{ background: tab === t ? (t === 'need' ? '#0EA5A0' : '#F59E0B') : 'var(--bg-primary)', color: tab === t ? 'white' : 'var(--text-muted)', border: `1px solid ${t === 'need' ? '#0EA5A0' : '#F59E0B'}` }}>
            {t === 'need' ? 'Needs' : 'Wants'}
          </button>
        ))}
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {cats.map(cat => (
          <div key={cat.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors hover:bg-black/5 dark:hover:bg-white/5">
            <span className="text-lg w-7 text-center flex-shrink-0">{cat.icon}</span>
            {editingId === cat.id ? (
              <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                className="input flex-1 py-1 text-sm" />
            ) : (
              <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
            )}
            <WantsNeedsToggle value={cat.defaultType as 'want' | 'need'} onChange={() => toggleCategoryType(cat.id)} size="sm" />
            {cat.isSystem ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded opacity-50" style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>System</span>
            ) : editingId === cat.id ? (
              <div className="flex gap-1">
                <button onClick={() => saveEdit(cat.id)} className="p-1 rounded hover:bg-teal-500/20 text-teal-500 transition-colors"><Check size={13} /></button>
                <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"><X size={13} /></button>
              </div>
            ) : (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(cat.id, cat.name)} className="p-1 rounded hover:bg-teal-500/20 text-teal-500 transition-colors"><Pencil size={13} /></button>
                <button onClick={() => { if (confirm(`Delete "${cat.name}"? Transactions will be moved to Other.`)) deleteCategory(cat.id); }}
                  className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 size={13} /></button>
              </div>
            )}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
          <input value={newCat.icon} onChange={e => setNewCat(f => ({ ...f, icon: e.target.value }))} className="input w-12 text-center text-lg" placeholder="📦" />
          <input autoFocus value={newCat.name} onChange={e => setNewCat(f => ({ ...f, name: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
            className="input flex-1" placeholder="Category name..." />
          <button onClick={handleAdd} className="p-1.5 rounded-lg bg-teal-500/20 text-teal-500 transition-colors hover:bg-teal-500/30"><Check size={14} /></button>
          <button onClick={() => setAdding(false)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"><X size={14} /></button>
        </div>
      ) : (
        <button onClick={() => { setAdding(true); setNewCat(f => ({ ...f, type: tab })); }}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg border-dashed border-2 text-sm font-semibold transition-all hover:bg-teal-500/5"
          style={{ borderColor: '#0EA5A0', color: '#0EA5A0' }}>
          <Plus size={14} /> Add New Category
        </button>
      )}
    </div>
  );
}

// ── Main Budget Page ───────────────────────────────────────────
export default function BudgetPage() {
  const { budgetAllocations, transactions, activeContextId, contexts, selectedMonth, upsertBudgetAllocation, contextCategories } = useStore();
  const [tab, setTab] = useState<'need' | 'want'>('need');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showManageCats, setShowManageCats] = useState(false);

  const activeCtx = contexts.find(c => c.id === activeContextId);
  const accentColor = activeCtx ? contextColor(activeCtx.type) : '#0EA5A0';
  const allCats = contextCategories(activeContextId);

  const monthAllocations = budgetAllocations.filter(b => b.contextId === activeContextId && b.month === selectedMonth);
  const monthTx = transactions.filter(t => t.contextId === activeContextId && t.date.startsWith(selectedMonth) && t.type !== 'income');
  const totalIncome = transactions.filter(t => t.contextId === activeContextId && t.date.startsWith(selectedMonth) && t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalAllocated = monthAllocations.reduce((s, b) => s + b.allocated, 0);
  const remaining = totalIncome - totalAllocated;

  const rows = allCats
    .filter(c => c.defaultType === tab)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(cat => {
      const alloc = monthAllocations.find(b => b.categoryId === cat.id);
      const spent = monthTx.filter(t => t.categoryId === cat.id).reduce((s, t) => s + Math.abs(t.amount), 0);
      const allocated = alloc?.allocated ?? 0;
      const pct = allocated > 0 ? spent / allocated : 0;
      return { cat, allocated, spent, pct, over: spent > allocated && allocated > 0 };
    });

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1400px] mx-auto">

      {showAddExpense && <Modal title="Add Expense" onClose={() => setShowAddExpense(false)} size="md"><AddExpenseModal onClose={() => setShowAddExpense(false)} /></Modal>}
      {showManageCats && <Modal title="Manage Categories" onClose={() => setShowManageCats(false)} size="md"><CategoryManagerModal onClose={() => setShowManageCats(false)} /></Modal>}

      {/* Zero-based banner */}
      <div className="rounded-xl p-4 lg:p-5 flex flex-wrap gap-4 lg:gap-8 items-center" style={{ background: 'var(--bg-sidebar)' }}>
        {[{ label: 'Income', value: formatCurrency(totalIncome), color: '#22C55E' }, { label: 'Allocated', value: formatCurrency(totalAllocated), color: 'var(--text-primary)' }, { label: 'Remaining', value: formatCurrency(Math.abs(remaining)), color: remaining >= 0 ? '#22C55E' : '#EF4444' }].map(({ label, value, color }) => (
          <div key={label}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-xl lg:text-2xl font-bold font-mono" style={{ color }}>{value}</p>
          </div>
        ))}
        <div className="flex-1" />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowManageCats(true)} className="btn-ghost flex items-center gap-2"><Settings2 size={14} /> Manage Categories</button>
          <button onClick={() => setShowAddExpense(true)} className="btn-primary flex items-center gap-2" style={{ background: accentColor }}><Plus size={14} /> Add Expense</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['need', 'want'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-5 py-2 rounded-lg text-sm font-semibold transition-all', tab === t ? 'text-white' : 'hover:opacity-80')}
            style={{ background: tab === t ? accentColor : 'transparent', color: tab === t ? 'white' : 'var(--text-muted)', border: `1px solid ${tab === t ? accentColor : 'var(--border)'}` }}>
            {t === 'need' ? 'Needs' : 'Wants'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="hidden lg:grid grid-cols-[2fr_80px_1fr_1fr_1fr_2.5fr_100px] gap-3 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wide"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-primary)' }}>
          <span>Category</span><span>Type</span><span>Budget</span><span>Spent</span><span>Remaining</span><span>Progress</span><span>Actions</span>
        </div>

        {rows.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>No {tab} categories yet</p>
            <button onClick={() => setShowManageCats(true)} className="btn-ghost text-sm"><Plus size={14} className="inline mr-1" />Add Category</button>
          </div>
        )}

        {rows.map(({ cat, allocated, spent, pct, over }, i) => {
          const rem = allocated - spent;
          const barColor = over ? '#EF4444' : pct > 0.9 ? '#F59E0B' : accentColor;
          return (
            <div key={cat.id} className={cn('flex flex-col lg:grid lg:grid-cols-[2fr_80px_1fr_1fr_1fr_2.5fr_100px] gap-2 lg:gap-3 px-4 lg:px-5 py-3 lg:py-3.5 border-b transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]', i % 2 === 1 && 'bg-black/[0.01] dark:bg-white/[0.01]')} style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="text-base">{cat.icon}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{cat.name}</span>
                {over && <span className="badge" style={{ background: '#EF444420', color: '#EF4444' }}>Over</span>}
              </div>
              <div className="flex items-center">
                <WantsNeedsToggle value={cat.defaultType as 'want' | 'need'} onChange={() => useStore.getState().toggleCategoryType(cat.id)} size="sm" />
              </div>
              <div className="flex items-center">
                <span className="text-xs lg:hidden font-semibold mr-1" style={{ color: 'var(--text-muted)' }}>Budget:</span>
                <input type="number" value={allocated || ''} onChange={e => upsertBudgetAllocation({ contextId: activeContextId, month: selectedMonth, categoryId: cat.id, allocated: parseFloat(e.target.value) || 0, rollover: 0 })}
                  placeholder="0" className="input w-24 text-sm font-mono py-1" />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs lg:hidden" style={{ color: 'var(--text-muted)' }}>Spent:</span>
                <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{formatCurrency(spent)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs lg:hidden" style={{ color: 'var(--text-muted)' }}>Left:</span>
                <span className="text-sm font-bold font-mono" style={{ color: over ? '#EF4444' : rem === 0 ? 'var(--text-muted)' : '#22C55E' }}>{allocated > 0 ? formatCurrency(rem) : '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct * 100, 100)}%`, background: barColor }} />
                </div>
                <span className="text-xs font-semibold w-9 text-right flex-shrink-0" style={{ color: barColor }}>
                  {allocated > 0 ? `${Math.round(pct * 100)}%` : '—'}
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-2">
                <button onClick={() => setShowManageCats(true)} className="p-1.5 rounded hover:bg-teal-500/20 text-teal-500 transition-colors" title="Edit category"><Pencil size={12} /></button>
                {!cat.isSystem && <button onClick={() => { if (confirm(`Delete "${cat.name}"?`)) useStore.getState().deleteCategory(cat.id); }} className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors" title="Delete category"><Trash2 size={12} /></button>}
              </div>
            </div>
          );
        })}

        {/* Add category CTA row */}
        <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
          <button onClick={() => setShowManageCats(true)}
            className="flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80" style={{ color: '#0EA5A0' }}>
            <Plus size={14} /> Add New Category
          </button>
        </div>
      </div>
    </div>
  );
}
