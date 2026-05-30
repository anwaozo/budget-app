'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { useStore } from '@/store';
import { contextColor, cn } from '@/lib/utils';

export function ContextSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { contexts, activeContextId, switchContext, accessibleContextIds } = useStore();
  const accessible = contexts.filter(c => accessibleContextIds().includes(c.id));
  const active = contexts.find(c => c.id === activeContextId);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (!active) return null;
  const color = contextColor(active.type);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm font-semibold hover:opacity-90"
        style={{ color, borderColor: color, background: color + '18' }}>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="hidden sm:block max-w-[130px] truncate">{active.name}</span>
        <ChevronDown size={13} className={cn('transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Switch Context</p>
          {accessible.map(ctx => {
            const c = contextColor(ctx.type);
            const isActive = ctx.id === activeContextId;
            return (
              <button key={ctx.id} onClick={() => { switchContext(ctx.id); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all hover:bg-black/5 dark:hover:bg-white/5"
                style={{ background: isActive ? c + '15' : undefined }}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{ctx.name}</p>
                  <p className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>{ctx.type}</p>
                </div>
                {isActive && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: c, background: c + '20' }}>Active</span>}
              </button>
            );
          })}
          <div className="border-t mx-3 my-1" style={{ borderColor: 'var(--border)' }} />
          <a href="/settings" onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}>
            <Plus size={13} /> Add Business Context
          </a>
        </div>
      )}
    </div>
  );
}
