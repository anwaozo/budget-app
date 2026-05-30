'use client';
import { ContextType } from '@/types';
import { contextLabel, contextColor, cn } from '@/lib/utils';

interface Props { type: ContextType; name?: string; size?: 'sm' | 'md'; className?: string; }

export function ContextBadge({ type, name, size = 'md', className }: Props) {
  const color = contextColor(type);
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full font-semibold border', size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1', className)}
      style={{ color, borderColor: color, background: color + '18' }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      {name ?? contextLabel(type)}
    </span>
  );
}
