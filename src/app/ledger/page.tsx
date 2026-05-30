'use client';
import { useMemo, useState, useRef } from 'react';
import { Upload, Plus, Search, Trash2, Pencil, Check, X } from 'lucide-react';
import Papa from 'papaparse';
import { useStore } from '@/store';
import { formatCurrency, contextColor, cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { WantsNeedsToggle } from '@/components/ui/WantsNeedsToggle';
import { TransactionType } from '@/types';

function NewTransactionModal({ onClose }: { onClose: () => void }) {
  const { activeContextId, activeUserId, contextCategories, addTransaction } = useStore();
  const cats = contextCategories(activeContextId);
  const [form, setForm] = useState({ payee: '', amount: '', categoryId: cats.find(c => c.defaultType !== 'income')?.id ?? '', type: 'need' as TransactionType, date: new Date().toISOString().slice(0, 10), note: '', isIncome: false });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!form.payee || isNaN(amt)) return;
    addTransaction({ contextId: activeContextId, date: form.date, payee: form.payee, amount: form.isIncome ? Math.abs(amt) : -Math.abs(amt), categoryId: form.categoryId, type: form.isIncome ? 'income' : form.type, note: form.note, importSource: 'manual', createdBy: activeUserId ?? '' });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2 mb-2">
        {[{ label: 'Expense', v: false }, { label: 'Income', v: true }].map(({ label, v }) => (
          <button key={label} type="button" onClick={() => setForm(f => ({ ...f, isIncome: v, type: v ? 'income' : 'need' as TransactionType }))}
            className={cn('flex-1 py-2 rounded-lg text-sm font-semibold border transition-all', form.isIncome === v ? 'text-white border-transparent' : 'hover:opacity-80')}
            style={{ background: form.isIncome === v ? (v ? '#22C55E' : '#EF4444') : 'transparent', borderColor: v ? '#22C55E' : '#EF4444', color: form.isIncome === v ? 'white' : (v ? '#22C55E' : '#EF4444') }}>
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Payee</label><input required className="input" value={form.payee} onChange={e => setForm(f => ({ ...f, payee: e.target.value }))} placeholder="e.g. HEB Grocery" /></div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Amount ($)</label><input required type="number" step="0.01" min="0" className="input" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" /></div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Date</label><input required type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
        <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Category</label>
          <select className="input" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
            {cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        {!form.isIncome && <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Type</label>
          <div className="flex gap-2 pt-1">
            {(['need', 'want'] as const).map(t => (
              <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                className={cn('flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all', form.type === t ? 'text-white border-transparent' : 'hover:opacity-80')}
                style={{ background: form.type === t ? (t === 'need' ? '#0EA5A0' : '#F59E0B') : 'transparent', borderColor: t === 'need' ? '#0EA5A0' : '#F59E0B', color: form.type === t ? 'white' : (t === 'need' ? '#0EA5A0' : '#F59E0B') }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>}
        <div className="col-span-2"><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Note (optional)</label><input className="input" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Add a note..." /></div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">Save Transaction</button>
        <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

export default function LedgerPage() {
  const { transactions, categories, activeContextId, contexts, activeUserId, selectedMonth, deleteTransaction, toggleTransactionType, importTransactions, contextCategories } = useStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [showNewTx, setShowNewTx] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const activeCtx = contexts.find(c => c.id === activeContextId);
  const accentColor = activeCtx ? contextColor(activeCtx.type) : '#0EA5A0';
  const getCatName = (id: string) => categories.find(c => c.id === id)?.name ?? id;

  const filtered = useMemo(() => [...transactions]
    .filter(t => t.contextId === activeContextId && t.date.startsWith(selectedMonth))
    .filter(t => typeFilter === 'all' || t.type === typeFilter)
    .filter(t => !search || t.payee.toLowerCase().includes(search.toLowerCase()) || getCatName(t.categoryId).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date)),
    [transactions, activeContextId, selectedMonth, typeFilter, search]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered.filter(t => t.type !== 'income').reduce((s, t) => s + Math.abs(t.amount), 0);

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete(results) {
        const rows = (results.data as Record<string, string>[]).map(r => ({
          contextId: activeContextId, date: r['Date'] ?? r['date'] ?? '', payee: r['Payee'] ?? r['Description'] ?? r['payee'] ?? 'Unknown',
          amount: parseFloat(r['Amount'] ?? r['amount'] ?? '0'), categoryId: 'cat-other',
          type: (parseFloat(r['Amount'] ?? '0') > 0 ? 'income' : 'need') as TransactionType,
          importSource: 'csv' as const, createdBy: activeUserId ?? '',
        })).filter(r => r.date && !isNaN(r.amount));
        const count = importTransactions(rows);
        setImportMsg(`✓ ${count} transactions imported`);
        setTimeout(() => setImportMsg(''), 4000);
      },
    });
    e.target.value = '';
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1400px] mx-auto">
      {showNewTx && <Modal title="New Transaction" onClose={() => setShowNewTx(false)}><NewTransactionModal onClose={() => setShowNewTx(false)} /></Modal>}

      {/* Actions bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="input pl-9 w-52 text-sm" />
          </div>
          <div className="flex gap-1">
            {(['all', 'income', 'need', 'want'] as const).map(f => (
              <button key={f} onClick={() => setTypeFilter(f)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', typeFilter === f ? 'text-white' : 'hover:opacity-80')}
                style={{ background: typeFilter === f ? accentColor : 'transparent', color: typeFilter === f ? 'white' : 'var(--text-muted)', border: `1px solid ${typeFilter === f ? accentColor : 'var(--border)'}` }}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {importMsg && <span className="text-xs font-semibold" style={{ color: accentColor }}>{importMsg}</span>}
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          <button onClick={() => fileRef.current?.click()} className="btn-ghost flex items-center gap-2"><Upload size={14} /> Import CSV</button>
          <button onClick={() => setShowNewTx(true)} className="btn-primary flex items-center gap-2" style={{ background: accentColor }}><Plus size={14} /> New Transaction</button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex gap-2 flex-wrap">
        <div className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#22C55E18', color: '#22C55E', border: '1px solid #22C55E40' }}>Income: +{formatCurrency(totalIncome)}</div>
        <div className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#EF444418', color: '#EF4444', border: '1px solid #EF444440' }}>Expenses: -{formatCurrency(totalExpenses)}</div>
        <div className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{filtered.length} transactions</div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="hidden lg:grid grid-cols-[90px_2fr_1.2fr_90px_110px_1fr_90px] gap-3 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wide"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-primary)' }}>
          <span>Date</span><span>Payee</span><span>Category</span><span>Type</span><span>Amount</span><span>Notes</span><span>Actions</span>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>No transactions found</p>
            <button onClick={() => setShowNewTx(true)} className="btn-primary text-sm" style={{ background: accentColor }}><Plus size={14} className="inline mr-1" />Add Transaction</button>
          </div>
        )}

        {filtered.map((tx, i) => (
          <div key={tx.id} className={cn('flex flex-col lg:grid lg:grid-cols-[90px_2fr_1.2fr_90px_110px_1fr_90px] gap-2 lg:gap-3 px-4 lg:px-5 py-3 border-b transition-colors group', i % 2 === 1 && 'bg-black/[0.01] dark:bg-white/[0.01]')}
            style={{ borderColor: 'var(--border)', borderLeft: `3px solid ${tx.type === 'income' ? '#22C55E' : tx.type === 'want' ? '#F59E0B' : accentColor}` }}>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{tx.date}</span>
            <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tx.payee}</span>
            <span className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{getCatName(tx.categoryId)}</span>
            {tx.type === 'income' ? (
              <span className="badge badge-income self-start lg:self-center">Income</span>
            ) : (
              <WantsNeedsToggle value={tx.type as 'want' | 'need'} onChange={() => toggleTransactionType(tx.id)} size="sm" />
            )}
            <span className="text-sm font-bold font-mono" style={{ color: tx.amount > 0 ? '#22C55E' : '#EF4444' }}>{formatCurrency(tx.amount, true)}</span>
            <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{tx.note || '—'}</span>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 rounded hover:bg-teal-500/20 text-teal-500 transition-colors" onClick={() => setShowNewTx(true)}><Pencil size={12} /></button>
              <button onClick={() => deleteTransaction(tx.id)} className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
