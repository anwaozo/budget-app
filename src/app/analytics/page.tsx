'use client';
import { BarChart3 } from 'lucide-react';
import { useStore } from '@/store';
import { contextColor } from '@/lib/utils';
export default function AnalyticsPage() {
  const { contexts, activeContextId } = useStore();
  const activeCtx = contexts.find(c => c.id === activeContextId);
  const color = activeCtx ? contextColor(activeCtx.type) : '#0EA5A0';
  return (
    <div className="flex flex-col items-center justify-center h-full py-32 gap-4">
      <BarChart3 size={48} style={{ color: color + '60' }} />
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Analytics</h2>
      <p className="text-sm text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>12-month rolling trends, year-end projections, and cross-context comparisons — coming in the next sprint.</p>
    </div>
  );
}
