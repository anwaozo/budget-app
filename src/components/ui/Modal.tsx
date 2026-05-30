'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { title: string; onClose: () => void; children: React.ReactNode; size?: 'sm' | 'md' | 'lg'; }

export function Modal({ title, onClose, children, size = 'md' }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={cn('relative w-full rounded-2xl shadow-2xl z-10', size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl')}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"><X size={16} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
