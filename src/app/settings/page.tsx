'use client';
import { useState } from 'react';
import { Sun, Moon, Download, Plus, Check, X } from 'lucide-react';
import { useStore } from '@/store';
import { contextColor, contextLabel, cn } from '@/lib/utils';
import { ContextBadge } from '@/components/ui/ContextBadge';
import { Modal } from '@/components/ui/Modal';
import { ContextType } from '@/types';

function AddBusinessModal({ onClose }: { onClose: () => void }) {
  const { activeUserId, addContext } = useStore();
  const [form, setForm] = useState({ name: '', businessType: 'LLC', color: '#8B5CF6' });
  const BIZ_TYPES = ['LLC', 'Sole Prop', 'S-Corp', 'C-Corp', 'Partnership', 'Nonprofit'];
  const COLORS = ['#8B5CF6', '#0EA5A0', '#22C55E', '#F59E0B', '#EF4444', '#EC4899'];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addContext({ type: 'business', name: form.name.trim(), ownerId: activeUserId ?? '', memberIds: [activeUserId ?? ''], color: form.color, businessType: form.businessType });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Business Name</label><input required className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Apperr LLC" /></div>
      <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Entity Type</label>
        <select className="input" value={form.businessType} onChange={e => setForm(f => ({ ...f, businessType: e.target.value }))}>
          {BIZ_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>Context Color</label>
        <div className="flex gap-2 pt-1">{COLORS.map(c => <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))} className={cn('w-8 h-8 rounded-full transition-all hover:scale-105', form.color === c ? 'ring-2 ring-offset-2 scale-110' : '')} style={{ background: c }} />)}</div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1" style={{ background: '#8B5CF6' }}>Create Business</button>
        <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  const { users, activeUserId, contexts, activeContextId, transactions, switchUser, switchContext, toggleTheme, updateContext, deleteContext } = useStore();
  const [showAddBiz, setShowAddBiz] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const user = users.find(u => u.id === activeUserId);
  const theme = user?.theme ?? 'dark';

  function handleUserSwitch(userId: string) {
    if (userId === activeUserId) return;
    const target = users.find(u => u.id === userId);
    if (!target) return;
    setSwitchingTo(userId);
    setPin(''); setPinError('');
  }

  function confirmSwitch() {
    const target = users.find(u => u.id === switchingTo);
    if (!target) return;
    if (target.pin && pin !== target.pin) { setPinError('Incorrect PIN'); return; }
    switchUser(switchingTo!);
    setSwitchingTo(null); setPin('');
  }

  function exportCSV() {
    const headers = ['Date', 'Payee', 'Amount', 'Category', 'Type', 'Context', 'Note'];
    const rows = transactions.map(t => [t.date, t.payee, t.amount, t.categoryId, t.type, t.contextId, t.note ?? '']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'home-budget-os-export.csv'; a.click();
  }

  const accessibleCtxs = contexts.filter(c => c.ownerId === activeUserId || c.memberIds.includes(activeUserId ?? ''));

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6">
      {showAddBiz && <Modal title="Add Business Context" onClose={() => setShowAddBiz(false)} size="sm"><AddBusinessModal onClose={() => setShowAddBiz(false)} /></Modal>}

      {/* Switch User */}
      {switchingTo && (
        <Modal title="Switch User" onClose={() => setSwitchingTo(null)} size="sm">
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Enter PIN for <strong>{users.find(u => u.id === switchingTo)?.name}</strong></p>
            <input type="password" maxLength={4} value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmSwitch()} className="input text-center text-2xl tracking-[0.5em] font-mono" placeholder="••••" />
            {pinError && <p className="text-xs text-red-400 font-semibold">{pinError}</p>}
            <div className="flex gap-2">
              <button onClick={confirmSwitch} className="btn-primary flex-1">Switch</button>
              <button onClick={() => setSwitchingTo(null)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* User profiles */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>User Profiles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {users.map(u => {
            const isActive = u.id === activeUserId;
            return (
              <button key={u.id} onClick={() => handleUserSwitch(u.id)}
                className={cn('flex items-center gap-3 p-3 rounded-xl border text-left transition-all', isActive ? 'cursor-default' : 'hover:border-teal-500/50 hover:bg-teal-500/5')}
                style={{ borderColor: isActive ? '#0EA5A0' : 'var(--border)', background: isActive ? '#0EA5A018' : 'var(--bg-primary)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: isActive ? '#0EA5A0' : 'var(--text-muted)' }}>{u.avatarInitials}</div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{u.name}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{isActive ? '● Active' : 'Tap to switch'}</p>
                </div>
                {isActive && <span className="ml-auto text-xs font-bold" style={{ color: '#0EA5A0' }}>Active</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* My Contexts */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>My Contexts</h2>
          <button onClick={() => setShowAddBiz(true)} className="btn-ghost text-xs flex items-center gap-1" style={{ borderColor: '#8B5CF6', color: '#8B5CF6' }}><Plus size={12} /> Add Business</button>
        </div>
        {accessibleCtxs.map(ctx => {
          const c = contextColor(ctx.type);
          const isActive = ctx.id === activeContextId;
          const txCount = transactions.filter(t => t.contextId === ctx.id).length;
          return (
            <div key={ctx.id} className={cn('flex items-center gap-3 p-3 rounded-xl border transition-all', isActive ? '' : 'hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer')}
              style={{ borderColor: isActive ? c : 'var(--border)', background: isActive ? c + '12' : 'var(--bg-primary)' }}
              onClick={() => switchContext(ctx.id)}>
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{ctx.name}</span>
                  <ContextBadge type={ctx.type} size="sm" />
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{txCount} transactions{ctx.businessType ? ` · ${ctx.businessType}` : ''}</p>
              </div>
              {isActive ? <span className="text-xs font-bold flex-shrink-0" style={{ color: c }}>Active</span> : <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>Switch →</span>}
            </div>
          );
        })}
      </div>

      {/* Appearance */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Appearance</h2>
        <div className="flex gap-3">
          {(['dark', 'light'] as const).map(t => (
            <button key={t} onClick={() => { if (t !== theme) toggleTheme(); }}
              className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all', theme === t ? 'text-white' : 'hover:opacity-80')}
              style={{ background: theme === t ? '#0EA5A0' : 'transparent', borderColor: '#0EA5A0', color: theme === t ? 'white' : 'var(--text-muted)' }}>
              {t === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
              {t.charAt(0).toUpperCase() + t.slice(1)} Mode
            </button>
          ))}
        </div>
      </div>

      {/* Data */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Data & Privacy</h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{transactions.length} total transactions across all contexts · stored locally in your browser</p>
        <button onClick={exportCSV} className="btn-ghost flex items-center gap-2"><Download size={14} /> Export All Transactions (CSV)</button>
      </div>

      {/* About */}
      <div className="card p-5 space-y-1">
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>About</h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Home Budget OS v2.0 — Nwaozo Family</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Built by Apperr · apperr.com · Houston, TX</p>
      </div>
    </div>
  );
}
