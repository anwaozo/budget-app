'use client';
import { useMemo, useState, useRef } from 'react';
import { Upload, Plus, Search, Trash2, Edit2 } from 'lucide-react';
import Papa from 'papaparse';
import { useStore } from '@/store';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Transaction, TransactionType } from '@/types';

export default function LedgerPage() {
  const { transactions, categories, selectedMonth, addTransaction, deleteTransaction, importTransactions } = useStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const getCatName = (id: string) => categories.find(c => c.id === id)?.name ?? id;

  const filtered = useMemo(() => {
    return [...transactions]
      .filter(t => t.date.startsWith(selectedMonth))
      .filter(t => typeFilter === 'all' || t.type === typeFilter)
      .filter(t => !search || t.payee.toLowerCase().includes(search.toLowerCase()) || getCatName(t.categoryId).toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedMonth, typeFilter, search]);

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered.filter(t => t.type !== 'income').reduce((s, t) => s + Math.abs(t.amount), 0);

  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const rows = results.data as Record<string, string>[];
        const mapped = rows.map(r => ({
          date: r['Date'] ?? r['date'] ?? '',
          payee: r['Payee'] ?? r['Description'] ?? r['payee'] ?? 'Unknown',
          amount: parseFloat(r['Amount'] ?? r['amount'] ?? '0'),
          categoryId: 'other',
          type: (parseFloat(r['Amount'] ?? '0') > 0 ? 'income' : 'need') as TransactionType,
          importSource: 'csv' as const,
        })).filter(r => r.date && !isNaN(r.amount));

        const count = (importTransactions as (ts: typeof mapped) => number)(mapped);
        setImportMsg(`✓ ${count} transactions imported`);
        setTimeout(() => setImportMsg(''), 4000);
      },
    });
    e.target.value = '';
  }

  const typeColor = (type: TransactionType) => {
    if (type === 'income') return '#22C55E';
    if (type === 'want') return '#F59E0B';
    return '#0EA5A0';
  };

  return (
    <div className="p-4 lg:p-8 space-y-4 max-w-[1400px] mx-auto">

      {/* Header row */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search transactions..."
              className="input pl-9 w-56"
            />
          </div>
          <div className="flex gap-1">
            {(['all','income','need','want'] as const).map(f => (
              <button
                key={f}
                onClick={() => setTypeFilter(f)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', typeFilter === f ? 'bg-teal-500 text-white' : 'hover:bg-teal-500/10')}
                style={{ color: typeFilter === f ? undefined : 'var(--text-muted)' }}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {importMsg && <span className="text-xs text-teal-500 font-semibold">{importMsg}</span>}
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          <button onClick={() => fileRef.current?.click()} className="btn-ghost flex items-center gap-2">
            <Upload size={14} /> Import CSV
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 flex-wrap">
        <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs font-semibold text-green-500">
          Income: +{formatCurrency(totalIncome)}
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400">
          Expenses: -{formatCurrency(totalExpenses)}
        </div>
        <div className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          {filtered.length} transactions
        </div>
      </div>

      {/* Table — desktop */}
      <div className="card overflow-hidden">
        <div className="hidden lg:grid grid-cols-[100px_2fr_1.5fr_80px_120px_1fr_80px] gap-4 px-5 py-3 border-b text-xs font-semibold uppercase tracking-wide" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--bg-primary)' }}>
          <span>Date</span><span>Payee</span><span>Category</span><span>Type</span><span>Amount</span><span>Notes</span><span>Actions</span>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center" style={{ color: 'var(--text-muted)' }}>
            <p className="text-sm">No transactions found</p>
          </div>
        )}

        {filtered.map((tx, i) => (
          <div key={tx.id} className={cn(
            'flex flex-col lg:grid lg:grid-cols-[100px_2fr_1.5fr_80px_120px_1fr_80px] gap-2 lg:gap-4 px-4 lg:px-5 py-3 border-b hover:bg-teal-500/5 transition-colors group',
            i % 2 === 1 && 'bg-teal-500/[0.02]'
          )} style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{tx.date}</span>
            <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tx.payee}</span>
            <span className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{getCatName(tx.categoryId)}</span>
            <span className={cn('badge self-start lg:self-center', tx.type === 'income' ? 'badge-income' : tx.type === 'want' ? 'badge-want' : 'badge-need')}>
              {tx.type}
            </span>
            <span className="text-sm font-bold font-mono" style={{ color: tx.amount > 0 ? '#22C55E' : '#EF4444' }}>
              {formatCurrency(tx.amount, true)}
            </span>
            <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{tx.note || '—'}</span>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 rounded hover:bg-teal-500/20 text-teal-500 transition-colors"><Edit2 size={13} /></button>
              <button onClick={() => deleteTransaction(tx.id)} className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
