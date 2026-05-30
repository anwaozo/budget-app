'use client';
import { cn } from '@/lib/utils';

interface Props { value: 'want' | 'need'; onChange: (v: 'want' | 'need') => void; size?: 'sm' | 'md'; disabled?: boolean; }

export function WantsNeedsToggle({ value, onChange, size = 'md', disabled }: Props) {
  const color = value === 'want' ? '#F59E0B' : '#0EA5A0';
  return (
    <button type="button" disabled={disabled}
      onClick={() => onChange(value === 'want' ? 'need' : 'want')}
      title="Click to toggle Want / Need"
      className={cn('inline-flex items-center rounded-full font-semibold border transition-all select-none', disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80 active:scale-95', size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-xs px-3 py-1 gap-1.5')}
      style={{ color, borderColor: color, background: color + '18' }}>
      <span className={cn('rounded-full flex-shrink-0', size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} style={{ background: color }} />
      {value === 'want' ? 'Want' : 'Need'}
    </button>
  );
}
