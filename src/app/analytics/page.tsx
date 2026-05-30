'use client';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-32 gap-4">
      <BarChart3 size={48} className="text-teal-500/40" />
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Analytics</h2>
      <p className="text-sm text-center max-w-xs" style={{ color: 'var(--text-muted)' }}>
        12-month rolling trends, year-end projections, and category breakdowns — coming in the next sprint.
      </p>
    </div>
  );
}
