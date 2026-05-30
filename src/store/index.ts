'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Transaction, Category, BudgetAllocation, SavingsGoal, GoalContribution } from '@/types';
import { DEFAULT_CATEGORIES, SEED_TRANSACTIONS, SEED_BUDGET, SEED_GOALS } from '@/lib/seed';
import { generateId, getMonthKey } from '@/lib/utils';

interface AppState {
  // Data
  transactions: Transaction[];
  categories: Category[];
  budgetAllocations: BudgetAllocation[];
  goals: SavingsGoal[];

  // UI
  selectedMonth: string;
  theme: 'dark' | 'light';

  // Transaction actions
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  importTransactions: (ts: Omit<Transaction, 'id' | 'createdAt'>[]) => void;

  // Budget actions
  upsertBudgetAllocation: (b: Omit<BudgetAllocation, 'id'>) => void;

  // Goal actions
  addGoal: (g: Omit<SavingsGoal, 'id' | 'contributions'>) => void;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  addContribution: (goalId: string, amount: number, date: string) => void;

  // Category actions
  addCategory: (c: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // UI actions
  setSelectedMonth: (month: string) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      transactions: SEED_TRANSACTIONS,
      categories: DEFAULT_CATEGORIES,
      budgetAllocations: SEED_BUDGET,
      goals: SEED_GOALS,
      selectedMonth: getMonthKey(),
      theme: 'dark',

      addTransaction: (t) =>
        set(state => ({
          transactions: [
            { ...t, id: generateId(), createdAt: new Date().toISOString() },
            ...state.transactions,
          ],
        })),

      updateTransaction: (id, updates) =>
        set(state => ({
          transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t),
        })),

      deleteTransaction: (id) =>
        set(state => ({
          transactions: state.transactions.filter(t => t.id !== id),
        })),

      importTransactions: (ts) => {
        const existing = get().transactions;
        const dedup = ts.filter(t => !existing.some(
          e => e.date === t.date && e.payee === t.payee && e.amount === t.amount
        ));
        set(state => ({
          transactions: [
            ...dedup.map(t => ({ ...t, id: generateId(), createdAt: new Date().toISOString() })),
            ...state.transactions,
          ],
        }));
        return dedup.length;
      },

      upsertBudgetAllocation: (b) =>
        set(state => {
          const existing = state.budgetAllocations.findIndex(
            a => a.month === b.month && a.categoryId === b.categoryId
          );
          if (existing >= 0) {
            const updated = [...state.budgetAllocations];
            updated[existing] = { ...updated[existing], ...b };
            return { budgetAllocations: updated };
          }
          return {
            budgetAllocations: [{ ...b, id: generateId() }, ...state.budgetAllocations],
          };
        }),

      addGoal: (g) =>
        set(state => ({
          goals: [...state.goals, { ...g, id: generateId(), contributions: [] }],
        })),

      updateGoal: (id, updates) =>
        set(state => ({
          goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g),
        })),

      deleteGoal: (id) =>
        set(state => ({ goals: state.goals.filter(g => g.id !== id) })),

      addContribution: (goalId, amount, date) =>
        set(state => ({
          goals: state.goals.map(g => {
            if (g.id !== goalId) return g;
            const contrib: GoalContribution = { id: generateId(), date, amount };
            return {
              ...g,
              currentAmount: g.currentAmount + amount,
              contributions: [contrib, ...g.contributions],
            };
          }),
        })),

      addCategory: (c) =>
        set(state => ({
          categories: [...state.categories, { ...c, id: generateId() }],
        })),

      updateCategory: (id, updates) =>
        set(state => ({
          categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c),
        })),

      deleteCategory: (id) =>
        set(state => ({
          categories: state.categories.filter(c => c.id !== id || c.isSystem),
        })),

      setSelectedMonth: (month) => set({ selectedMonth: month }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    }),
    {
      name: 'budgethome-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
