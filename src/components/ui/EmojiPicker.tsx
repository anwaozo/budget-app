'use client';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: 'Money',     emojis: ['💰','💵','💳','🏦','📈','📉','💹','🏧','💎','🪙','💸','🤑','💱','🏛','📊'] },
  { label: 'Home',      emojis: ['🏠','🏡','🏢','🔑','🛋','🪑','🛏','🚿','🪴','🧹','🔧','💡','🪟','🚪','🧺'] },
  { label: 'Food',      emojis: ['🍽','🍔','🍕','🌮','🥗','☕','🍺','🥂','🎂','🍎','🛒','🥘','🍣','🥪','🧆'] },
  { label: 'Transport', emojis: ['🚗','🚕','✈️','🚂','🛵','🚲','⛽','🅿️','🚙','🏎','🛻','🚌','🚐','🛺','🚁'] },
  { label: 'Health',    emojis: ['🏥','💊','🩺','🏋','🧘','🏃','❤️','🩹','💆','🦷','👓','🧬','🩻','🫀','🫁'] },
  { label: 'Fun',       emojis: ['🎬','🎮','🎵','🎭','📚','🎨','🏆','⚽','🎯','🎸','🎲','🎪','🎢','🏄','🎳'] },
  { label: 'Work',      emojis: ['💼','📊','🖥','📝','📱','⚙️','🔌','📡','🏗','👔','🤝','📋','🖨','💻','🖱'] },
  { label: 'Family',    emojis: ['👶','🍼','🧸','🎒','🏫','❤️','👨‍👩‍👧‍👦','🎠','🛝','🧩','🎀','📐','🧦','🎁','🥳'] },
  { label: 'Misc',      emojis: ['🎁','🌟','✂️','📦','🔐','🗓','⏰','🌈','☀️','🌙','❄️','🌊','🔥','⚡','🌸'] },
];

const RECENT_KEY = 'hbos_recent_emojis';

function getRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]').slice(0, 8); } catch { return []; }
}
function addRecent(emoji: string) {
  if (typeof window === 'undefined') return;
  const prev = getRecent().filter(e => e !== emoji);
  localStorage.setItem(RECENT_KEY, JSON.stringify([emoji, ...prev].slice(0, 8)));
}

interface Props {
  value: string;
  onChange: (emoji: string) => void;
  onClose?: () => void;
}

export function EmojiPicker({ value, onChange, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState(0);
  const recent = getRecent();

  const filtered = useMemo(() => {
    if (!search.trim()) return EMOJI_GROUPS[activeGroup].emojis;
    // Simple keyword match — returns emojis from all groups
    const allEmojis = EMOJI_GROUPS.flatMap(g => g.emojis);
    return allEmojis.filter(e => {
      const name = e.codePointAt(0)?.toString(16) ?? '';
      return search.split('').some(c => e.includes(c));
    }).slice(0, 40);
  }, [search, activeGroup]);

  function select(emoji: string) {
    addRecent(emoji);
    onChange(emoji);
    onClose?.();
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', width: 280 }}>
      {/* Recent */}
      {recent.length > 0 && (
        <div className="px-2 pt-2">
          <p className="text-[10px] font-semibold mb-1 px-1" style={{ color: 'var(--text-muted)' }}>Recently used</p>
          <div className="flex flex-wrap gap-0.5">
            {recent.map(e => (
              <button key={e} onClick={() => select(e)}
                className={cn('w-8 h-8 flex items-center justify-center rounded-lg text-lg hover:scale-110 transition-transform', value === e && 'ring-2 ring-teal-500')}
                style={{ background: value === e ? '#0EA5A018' : 'transparent' }}>
                {e}
              </button>
            ))}
          </div>
          <div className="h-px mt-2" style={{ background: 'var(--border)' }} />
        </div>
      )}

      {/* Search */}
      <div className="p-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search emojis..."
          className="input text-xs py-1.5" autoFocus />
      </div>

      {/* Group tabs */}
      {!search && (
        <div className="flex overflow-x-auto px-2 gap-1 pb-1 scrollbar-hide">
          {EMOJI_GROUPS.map((g, i) => (
            <button key={g.label} onClick={() => setActiveGroup(i)}
              className={cn('px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all', activeGroup === i ? 'text-white' : 'hover:opacity-80')}
              style={{ background: activeGroup === i ? '#0EA5A0' : 'var(--bg-primary)', color: activeGroup === i ? 'white' : 'var(--text-muted)' }}>
              {g.label}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="p-2 grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto">
        {filtered.map(e => (
          <button key={e} onClick={() => select(e)}
            className={cn('w-8 h-8 flex items-center justify-center rounded-lg text-xl hover:scale-110 transition-transform', value === e && 'ring-2 ring-teal-500')}
            style={{ background: value === e ? '#0EA5A018' : 'transparent' }}>
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
