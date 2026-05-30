'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  UserProfile, BudgetContext, Category, Transaction,
  BudgetAllocation, SavingsGoal, GoalContribution, TransactionType,
} from '@/types';
import {
  SEED_USERS, SEED_CONTEXTS, ALL_CATEGORIES,
  SEED_TRANSACTIONS, SEED_BUDGET, SEED_GOALS,
} from '@/lib/seed';
import { generateId, getMonthKey } from '@/lib/utils';

interface AppState {
  // Auth / profiles
  users: UserProfile[];
  activeUserId: string;

  // Contexts
  contexts: BudgetContext[];
  activeContextId: string;

  // Data
  transactions: Transaction[];
  categories: Category[];
  budgetAllocations: BudgetAllocation[];
  goals: SavingsGoal[];

  // UI
  selectedMonth: string;

  // ── Computed helpers ────────────────────────────────────────
  activeUser: () => UserProfile | undefined;
  activeContext: () => BudgetContext | undefined;
  accessibleContextIds: () => string[];
  contextCategories: (contextId: string) => Category[];
  contextTransactions: (contextId?: string) => Transaction[];

  // ── Auth actions ────────────────────────────────────────────
  switchUser: (userId: string) => void;
  updateUserTheme: (userId: string, theme: 'dark' | 'light') => void;

  // ── Context actions ─────────────────────────────────────────
  switchContext: (contextId: string) => void;
  addContext: (ctx: Omit<BudgetContext, 'id' | 'createdAt'>) => void;
  updateContext: (id: string, updates: Partial<BudgetContext>) => void;
  deleteContext: (id: string) => void;

  // ── Category actions (full CRUD) ────────────────────────────
  addCategory: (cat: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  toggleCategoryType: (id: string) => void;
  reorderCategories: (contextId: string, orderedIds: string[]) => void;

  // ── Transaction actions ─────────────────────────────────────
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  importTransactions: (ts: Omit<Transaction, 'id' | 'createdAt'>[]) => number;
  toggleTransactionType: (id: string) => void;

  // ── Budget actions ──────────────────────────────────────────
  upsertBudgetAllocation: (b: Omit<BudgetAllocation, 'id'>) => void;

  // ── Goal actions ────────────────────────────────────────────
  addGoal: (g: Omit<SavingsGoal, 'id' | 'contributions'>) => void;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  addContribution: (goalId: string, amount: number, date: string) => void;

  // ── UI actions ──────────────────────────────────────────────
  setSelectedMonth: (m: string) => void;
  toggleTheme: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: SEED_USERS,
      activeUserId: 'user-adam',
      contexts: SEED_CONTEXTS,
      activeContextId: 'ctx-joint',
      transactions: SEED_TRANSACTIONS,
      categories: ALL_CATEGORIES,
      budgetAllocations: SEED_BUDGET,
      goals: SEED_GOALS,
      selectedMonth: getMonthKey(),

      // ── Computed ──────────────────────────────────────────
      activeUser: () => get().users.find(u => u.id === get().activeUserId),
      activeContext: () => get().contexts.find(c => c.id === get().activeContextId),
      accessibleContextIds: () => {
        const uid = get().activeUserId;
        return get().contexts
          .filter(c => c.ownerId === uid || c.memberIds.includes(uid))
          .map(c => c.id);
      },
      contextCategories: (contextId: string) =>
        get().categories.filter(c => c.contextId === 'global' || c.contextId === contextId),
      contextTransactions: (contextId?: string) => {
        const cid = contextId ?? get().activeContextId;
        return get().transactions.filter(t => t.contextId === cid);
      },

      // ── Auth ─────────────────────────────────────────────
      switchUser: (userId) => {
        const user = get().users.find(u => u.id === userId);
        if (!user) return;
        set({ activeUserId: userId, activeContextId: user.activeContextId });
      },
      updateUserTheme: (userId, theme) =>
        set(s => ({ users: s.users.map(u => u.id === userId ? { ...u, theme } : u) })),

      // ── Context ───────────────────────────────────────────
      switchContext: (contextId) => {
        set(s => ({
          activeContextId: contextId,
          users: s.users.map(u => u.id === s.activeUserId ? { ...u, activeContextId: contextId } : u),
        }));
      },
      addContext: (ctx) =>
        set(s => ({
          contexts: [...s.contexts, { ...ctx, id: generateId(), createdAt: new Date().toISOString() }],
        })),
      updateContext: (id, updates) =>
        set(s => ({ contexts: s.contexts.map(c => c.id === id ? { ...c, ...updates } : c) })),
      deleteContext: (id) =>
        set(s => ({ contexts: s.contexts.filter(c => c.id !== id) })),

      // ── Category CRUD ─────────────────────────────────────
      addCategory: (cat) =>
        set(s => ({
          categories: [...s.categories, { ...cat, id: generateId(), createdAt: new Date().toISOString() }],
        })),
      updateCategory: (id, updates) =>
        set(s => ({ categories: s.categories.map(c => c.id === id ? { ...c, ...updates } : c) })),
      deleteCategory: (id) =>
        set(s => {
          const cat = s.categories.find(c => c.id === id);
          if (cat?.isSystem) return s;
          return {
            categories: s.categories.filter(c => c.id !== id),
            transactions: s.transactions.map(t => t.categoryId === id ? { ...t, categoryId: 'cat-other' } : t),
          };
        }),
      toggleCategoryType: (id) =>
        set(s => ({
          categories: s.categories.map(c => {
            if (c.id !== id) return c;
            const next: TransactionType = c.defaultType === 'want' ? 'need' : 'want';
            return { ...c, defaultType: next };
          }),
        })),
      reorderCategories: (contextId, orderedIds) =>
        set(s => ({
          categories: s.categories.map(c => {
            const idx = orderedIds.indexOf(c.id);
            if (idx === -1 || (c.contextId !== contextId && c.contextId !== 'global')) return c;
            return { ...c, sortOrder: idx };
          }),
        })),

      // ── Transactions ──────────────────────────────────────
      addTransaction: (t) =>
        set(s => ({
          transactions: [{ ...t, id: generateId(), createdAt: new Date().toISOString() }, ...s.transactions],
        })),
      updateTransaction: (id, updates) =>
        set(s => ({ transactions: s.transactions.map(t => t.id === id ? { ...t, ...updates } : t) })),
      deleteTransaction: (id) =>
        set(s => ({ transactions: s.transactions.filter(t => t.id !== id) })),
      importTransactions: (ts) => {
        const existing = get().transactions;
        const dedup = ts.filter(t =>
          !existing.some(e => e.date === t.date && e.payee === t.payee && e.amount === t.amount)
        );
        set(s => ({
          transactions: [
            ...dedup.map(t => ({ ...t, id: generateId(), createdAt: new Date().toISOString() })),
            ...s.transactions,
          ],
        }));
        return dedup.length;
      },
      toggleTransactionType: (id) =>
        set(s => ({
          transactions: s.transactions.map(t => {
            if (t.id !== id || t.type === 'income') return t;
            return { ...t, type: t.type === 'want' ? 'need' : 'want' };
          }),
        })),

      // ── Budget ────────────────────────────────────────────
      upsertBudgetAllocation: (b) =>
        set(s => {
          const idx = s.budgetAllocations.findIndex(
            a => a.contextId === b.contextId && a.month === b.month && a.categoryId === b.categoryId
          );
          if (idx >= 0) {
            const updated = [...s.budgetAllocations];
            updated[idx] = { ...updated[idx], ...b };
            return { budgetAllocations: updated };
          }
          return { budgetAllocations: [{ ...b, id: generateId() }, ...s.budgetAllocations] };
        }),

      // ── Goals ─────────────────────────────────────────────
      addGoal: (g) =>
        set(s => ({ goals: [...s.goals, { ...g, id: generateId(), contributions: [] }] })),
      updateGoal: (id, updates) =>
        set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, ...updates } : g) })),
      deleteGoal: (id) =>
        set(s => ({ goals: s.goals.filter(g => g.id !== id) })),
      addContribution: (goalId, amount, date) =>
        set(s => ({
          goals: s.goals.map(g => {
            if (g.id !== goalId) return g;
            const c: GoalContribution = {
              id: generateId(), goalId, date, amount,
              contributedBy: get().activeUserId,
            };
            return { ...g, currentAmount: g.currentAmount + amount, contributions: [c, ...g.contributions] };
          }),
        })),

      // ── UI ────────────────────────────────────────────────
      setSelectedMonth: (m) => set({ selectedMonth: m }),
      toggleTheme: () =>
        set(s => {
          const newTheme = s.users.find(u => u.id === s.activeUserId)?.theme === 'dark' ? 'light' : 'dark';
          return { users: s.users.map(u => u.id === s.activeUserId ? { ...u, theme: newTheme } : u) };
        }),
    }),
    { name: 'hbos-v2', storage: createJSONStorage(() => localStorage) }
  )
);

// Convenience theme selector
export const useTheme = () => {
  const { users, activeUserId } = useStore();
  return users.find(u => u.id === activeUserId)?.theme ?? 'dark';
};
