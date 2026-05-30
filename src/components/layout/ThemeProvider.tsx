'use client';
import { useEffect } from 'react';
import { useStore } from '@/store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { users, activeUserId } = useStore();
  const theme = users.find(u => u.id === activeUserId)?.theme ?? 'dark';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return <>{children}</>;
}
