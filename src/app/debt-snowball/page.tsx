'use client';
import { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, CreditCard, Car, BookOpen, Heart, AlertCircle, TrendingDown } from 'lucide-react';
import { useStore } from '@/store';
import { formatCurrency, contextColor, cn } from '@/lib/utils';
import { computeSnowball, formatProjectionDate, monthsFromNow } from '@/lib/snowball';
import { Modal } from '@/components/ui/Modal';
import { Debt, DebtType } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DEBT_ICONS: Record<DebtType, React.ReactNode> = {
  credit_card: <CreditCard size={14} />, auto: <Car size={14} />,
  student: <BookOpen size={14} />, personal: <Heart size={14} />,
  medical: <AlertCircle size={14} />, other: <TrendingDown size={14} />,
};
const DEBT_TYPE_LABELS: Record<DebtType, string> = {
  credit_card:'Credit Card', auto:'Auto Loan', student:'Student Loan',
  personal:'Personal Loan', medical:'Medical Bill', other:'Other',
};

// ── Add / Edit Debt Modal ─────────────────────────────────────
function DebtModal({ debt, onClose }: { debt?: Debt; onClose: () => void }) {
  const { activeContextId, addDebt, updateDebt } = useStore();
  const [form, setForm] = useState({
    name: debt?.name ?? '',
    type: (debt?.type ?? 'credit_card') as DebtType,
    currentBalance: debt?.currentBalance?.toString() ?? '',
    apr: debt ? (debt.apr * 100).toFixed(2) : '',
    minimumPayment: debt?.minimumPayment?.toString() ?? '',
    dueDate: debt?.dueDate?.toString() ?? '15',
    note: debt?.note ?? '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      contextId: activeContextId,
      name: form.name,
      type: form.type,
      currentBalance: parseFloat(form.currentBalance) || 0,
      originalBalance: debt?.originalBalance ?? (parseFloat(form.currentBalance) || 0),
      apr: (parseFloat(form.apr) || 0) / 100,
      minimumPayment: parseFloat(form.minimumPayment) || 0,
      dueDate: parseInt(form.dueDate) || 15,
      note: form.note,
    };
    if (debt) { updateDebt(debt.id, data); } else { addDebt(data); }
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Debt Name</label>
          <input required className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Chase Sapphire Card" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Type</label>
          <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as DebtType }))}>
            {Object.entries(DEBT_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Current Balance ($)</label>
          <input required type="number" step="0.01" min="0" className="input" value={form.currentBalance} onChange={e => setForm(f => ({ ...f, currentBalance: e.target.value }))} placeholder="1,840.00" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Interest Rate APR (%)</label>
          <input required type="number" step="0.01" min="0" max="100" className="input" value={form.apr} onChange={e => setForm(f => ({ ...f, apr: e.target.value }))} placeholder="21.40" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Min Monthly Payment ($)</label>
          <input required type="number" step="0.01" min="0" className="input" value={form.minimumPayment} onChange={e => setForm(f => ({ ...f, minimumPayment: e.target.value }))} placeholder="45.00" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Due Date (day of month)</label>
          <input type="number" min="1" max="31" className="input" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} placeholder="15" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Note (optional)</label>
          <input className="input" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Add a note..." />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1" style={{ background: '#3B82F6' }}>{debt ? 'Save Changes' : 'Add Debt'}</button>
        <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

// ── Log Payment Modal ─────────────────────────────────────────
function LogPaymentModal({ debt, onClose }: { debt: Debt; onClose: () => void }) {
  const { logPayment } = useStore();
  const [amount, setAmount] = useState(debt.minimumPayment.toString());
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isSnowflake, setIsSnowflake] = useState(false);

  const monthlyInterest = debt.currentBalance * (debt.apr / 12);
  const principal = Math.max(0, parseFloat(amount) - monthlyInterest);
  const balanceAfter = Math.max(0, debt.currentBalance - principal);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    logPayment(debt.id, parseFloat(amount) || 0, date, isSnowflake);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 rounded-lg border" style={{ borderColor: '#3B82F640', background: '#3B82F610' }}>
        <p className="text-sm font-semibold" style={{ color: '#3B82F6' }}>{debt.name}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Balance: {formatCurrency(debt.currentBalance)} · APR: {(debt.apr * 100).toFixed(2)}% · Min: {formatCurrency(debt.minimumPayment)}/mo</p>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Payment Amount ($)</label>
        <input required type="number" step="0.01" min="0" className="input text-xl font-bold font-mono" value={amount} onChange={e => setAmount(e.target.value)} />
        <div className="flex gap-2 mt-2">
          {[debt.minimumPayment, debt.minimumPayment * 2, debt.currentBalance].map((v, i) => (
            <button key={i} type="button" onClick={() => setAmount(v.toFixed(2))} className="text-xs px-2 py-1 rounded border transition-colors hover:opacity-80"
              style={{ borderColor: '#3B82F6', color: '#3B82F6', background: '#3B82F610' }}>
              {i === 0 ? 'Min' : i === 1 ? '2× Min' : 'Pay Off'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Payment Date</label>
        <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setIsSnowflake(!isSnowflake)}
          className={cn('w-10 h-6 rounded-full transition-all flex-shrink-0', isSnowflake ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600')}>
          <span className={cn('block w-4 h-4 rounded-full bg-white shadow transition-transform mx-1 mt-1', isSnowflake ? 'translate-x-4' : '')} />
        </button>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>❄ Snowflake payment</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>One-time extra payment (tax refund, bonus, etc.)</p>
        </div>
      </div>
      {parseFloat(amount) > 0 && (
        <div className="p-3 rounded-lg text-xs space-y-1" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Interest paid</span><span style={{ color: '#EF4444' }}>{formatCurrency(monthlyInterest)}</span></div>
          <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Principal paid</span><span style={{ color: '#22C55E' }}>{formatCurrency(Math.max(0, principal))}</span></div>
          <div className="flex justify-between font-semibold"><span style={{ color: 'var(--text-primary)' }}>Balance after</span><span style={{ color: '#3B82F6' }}>{formatCurrency(balanceAfter)}</span></div>
        </div>
      )}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1" style={{ background: '#3B82F6' }}>Log Payment</button>
        <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

// ── Main Debt Snowball Page ───────────────────────────────────
export default function DebtSnowballPage() {
  const { debts, contexts, activeContextId, deleteDebt } = useStore();
  const [extra, setExtra] = useState(300);
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>('snowball');
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [loggingDebt, setLoggingDebt] = useState<Debt | null>(null);

  const activeCtx = contexts.find(c => c.id === activeContextId);
  const SNOW = '#3B82F6';

  const contextDebts = debts.filter(d => d.contextId === activeContextId && d.isActive);
  const sortedDebts = useMemo(() => [...contextDebts].sort((a, b) =>
    strategy === 'snowball' ? a.currentBalance - b.currentBalance : b.apr - a.apr
  ), [contextDebts, strategy]);

  const projection = useMemo(() => computeSnowball(contextDebts, extra, strategy), [contextDebts, extra, strategy]);
  const altProjection = useMemo(() => computeSnowball(contextDebts, extra, strategy === 'snowball' ? 'avalanche' : 'snowball'), [contextDebts, extra, strategy]);

  const totalDebt = contextDebts.reduce((s, d) => s + d.currentBalance, 0);
  const totalMinPayments = contextDebts.reduce((s, d) => s + d.minimumPayment, 0);
  const paidOffDebts = debts.filter(d => d.contextId === activeContextId && !d.isActive);

  // Chart data — payoff order
  const chartData = sortedDebts.map((d, i) => {
    const schedule = projection.debtSchedules.find(s => s.debtId === d.id);
    return { name: d.name.length > 12 ? d.name.slice(0, 12) + '…' : d.name, months: schedule?.payoffMonth ?? 0 };
  });
  const chartColors = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1200px] mx-auto">
      {showAddDebt && <Modal title="Add Debt" onClose={() => setShowAddDebt(false)} size="md"><DebtModal onClose={() => setShowAddDebt(false)} /></Modal>}
      {editingDebt && <Modal title="Edit Debt" onClose={() => setEditingDebt(null)} size="md"><DebtModal debt={editingDebt} onClose={() => setEditingDebt(null)} /></Modal>}
      {loggingDebt && <Modal title="Log Payment" onClose={() => setLoggingDebt(null)} size="md"><LogPaymentModal debt={loggingDebt} onClose={() => setLoggingDebt(null)} /></Modal>}

      {/* ── Debt-Free Hero Banner ── */}
      {contextDebts.length > 0 && (
        <div className="rounded-xl p-5 text-white relative overflow-hidden" style={{ background: SNOW }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-semibold opacity-75 mb-1 uppercase tracking-wide">Debt-Free Date</p>
              <p className="text-2xl font-bold">{projection.reachable ? formatProjectionDate(projection.debtFreeDate) : 'Increase payment'}</p>
              {projection.reachable && <p className="text-xs mt-1 opacity-75">{monthsFromNow(projection.debtFreeDate)} months away</p>}
            </div>
            <div>
              <p className="text-xs font-semibold opacity-75 mb-1 uppercase tracking-wide">Total Interest</p>
              <p className="text-xl font-bold">{formatCurrency(projection.totalInterestPaid)}</p>
              {projection.totalInterestPaid !== altProjection.totalInterestPaid && (
                <p className="text-xs mt-1 opacity-75">{strategy === 'snowball' ? '+' : '-'}{formatCurrency(Math.abs(projection.totalInterestPaid - altProjection.totalInterestPaid))} vs {strategy === 'snowball' ? 'Avalanche' : 'Snowball'}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold opacity-75 mb-1 uppercase tracking-wide">Total Debt</p>
              <p className="text-xl font-bold">{formatCurrency(totalDebt)}</p>
              <p className="text-xs mt-1 opacity-75">{contextDebts.length} active debts</p>
            </div>
            <div>
              <p className="text-xs font-semibold opacity-75 mb-1 uppercase tracking-wide">Extra/Month</p>
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-75">$</span>
                <input type="number" value={extra} onChange={e => setExtra(parseInt(e.target.value) || 0)} min="0"
                  className="bg-white/20 border border-white/30 rounded-lg px-2 py-1 text-white font-bold w-24 text-lg" />
              </div>
              <p className="text-xs mt-1 opacity-75">Min required: {formatCurrency(totalMinPayments)}/mo</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Strategy Toggle + Add Button ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Payoff Strategy</p>
          <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {(['snowball', 'avalanche'] as const).map(s => (
              <button key={s} onClick={() => setStrategy(s)}
                className={cn('px-4 py-1.5 rounded-md text-sm font-semibold transition-all', strategy === s ? 'text-white shadow-sm' : 'hover:opacity-80')}
                style={{ background: strategy === s ? SNOW : 'transparent', color: strategy === s ? 'white' : 'var(--text-muted)' }}>
                {s === 'snowball' ? '❄ Snowball' : '🏔 Avalanche'}
              </button>
            ))}
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            {strategy === 'snowball' ? 'Smallest balance first — Dave Ramsey method. Psychological wins keep you motivated.' : 'Highest APR first — saves most interest mathematically.'}
          </p>
        </div>
        <button onClick={() => setShowAddDebt(true)} className="btn-primary flex items-center gap-2" style={{ background: SNOW }}>
          <Plus size={14} /> Add Debt
        </button>
      </div>

      {/* ── Debt List ── */}
      {sortedDebts.length === 0 ? (
        <div className="card p-12 text-center">
          <TrendingDown size={40} className="mx-auto mb-3 opacity-30" style={{ color: SNOW }} />
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No active debts</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Add your debts to generate a personalized payoff plan</p>
          <button onClick={() => setShowAddDebt(true)} className="btn-primary" style={{ background: SNOW }}><Plus size={14} className="inline mr-1" />Add Your First Debt</button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDebts.map((debt, idx) => {
            const isAttacking = idx === 0;
            const pct = ((debt.originalBalance - debt.currentBalance) / debt.originalBalance) * 100;
            const schedule = projection.debtSchedules.find(s => s.debtId === debt.id);
            const color = chartColors[idx % chartColors.length];

            return (
              <div key={debt.id} className={cn('card overflow-hidden transition-all', isAttacking && 'ring-2')} style={{ borderColor: isAttacking ? SNOW : undefined }}>
                <div className="h-1" style={{ background: color }} />
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {/* Rank badge */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: color }}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{debt.name}</h3>
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>{DEBT_TYPE_LABELS[debt.type]}</span>
                        {isAttacking && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: SNOW }}>
                            ❄ ATTACK NOW
                          </span>
                        )}
                        {debt.note && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {debt.note}</span>}
                      </div>
                      {schedule?.payoffDate && (
                        <p className="text-xs" style={{ color }}>Payoff: {formatProjectionDate(schedule.payoffDate)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button onClick={() => setEditingDebt(debt)} className="p-1.5 rounded hover:bg-teal-500/20 transition-colors" style={{ color: 'var(--text-muted)' }}><Pencil size={13} /></button>
                      <button onClick={() => { if (confirm(`Delete "${debt.name}"?`)) deleteDebt(debt.id); }} className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors"><Trash2 size={13} /></button>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                    <div><p style={{ color: 'var(--text-muted)' }}>Balance</p><p className="font-bold font-mono text-sm" style={{ color }}>{formatCurrency(debt.currentBalance)}</p></div>
                    <div><p style={{ color: 'var(--text-muted)' }}>APR</p><p className="font-semibold">{(debt.apr * 100).toFixed(2)}%</p></div>
                    <div><p style={{ color: 'var(--text-muted)' }}>Min Payment</p><p className="font-semibold">{formatCurrency(debt.minimumPayment)}/mo</p></div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                      <span>Paid off</span><span style={{ color }}>{Math.round(pct)}% ({formatCurrency(debt.originalBalance - debt.currentBalance)} of {formatCurrency(debt.originalBalance)})</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
                    </div>
                  </div>

                  {/* Log payment button */}
                  <button onClick={() => setLoggingDebt(debt)}
                    className={cn('w-full py-2 rounded-lg text-sm font-semibold transition-all', isAttacking ? 'text-white' : 'hover:opacity-80')}
                    style={{ background: isAttacking ? SNOW : SNOW + '18', color: isAttacking ? 'white' : SNOW, border: isAttacking ? 'none' : `1px solid ${SNOW}40` }}>
                    Log Payment{isAttacking ? ' — Attack This Debt! ❄' : ''}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Payoff Timeline Chart ── */}
      {sortedDebts.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Payoff Timeline</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Months until each debt is paid off (snowball rolls forward after each payoff)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 40 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} label={{ value: 'months', position: 'insideRight', offset: 10, fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${Number(v ?? 0)} months`, 'Payoff time']} />
              <Bar dataKey="months" radius={[0, 4, 4, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Paid Off Debts ── */}
      {paidOffDebts.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>🎉 Paid Off ({paidOffDebts.length})</h2>
          <div className="space-y-2">
            {paidOffDebts.map(d => (
              <div key={d.id} className="flex items-center gap-3 py-2 px-3 rounded-lg" style={{ background: '#22C55E10', border: '1px solid #22C55E30' }}>
                <span className="text-green-500">✓</span>
                <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>{formatCurrency(d.originalBalance)}</span>
                <span className="text-xs font-semibold text-green-500">PAID OFF {d.paidOffDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
