'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  UserProfile, BudgetContext, Category, Transaction,
  BudgetAllocation, SavingsGoal, GoalContribution, TransactionType,
  Debt, DebtPayment, SnowballProjection,
} from '@/types';
import {
  SEED_USERS, SEED_CONTEXTS, ALL_CATEGORIES,
  SEED_TRANSACTIONS, SEED_BUDGET, SEED_GOALS, SEED_DEBTS,
} from '@/lib/seed';
import { generateId, getMonthKey } from '@/lib/utils';
import { computeSnowball } from '@/lib/snowball';

interface AppState {
  // Auth
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
  debts: Debt[];
  // UI
  selectedMonth: string;

  // ── Selectors ──────────────────────────────────────────────
  activeUser: () => UserProfile | undefined;
  activeContext: () => BudgetContext | undefined;
  accessibleContextIds: () => string[];
  contextCategories: (contextId: string) => Category[];
  contextTransactions: (contextId?: string) => Transaction[];
  contextDebts: (contextId?: string) => Debt[];
  snowballProjection: (extra: number, strategy: 'snowball' | 'avalanche') => SnowballProjection;

  // ── Auth ───────────────────────────────────────────────────
  switchUser: (userId: string) => void;
  toggleTheme: () => void;

  // ── Context ────────────────────────────────────────────────
  switchContext: (contextId: string) => void;
  addContext: (ctx: Omit<BudgetContext, 'id' | 'createdAt'>) => void;
  updateContext: (id: string, updates: Partial<BudgetContext>) => void;
  deleteContext: (id: string) => void;

  // ── Category CRUD ──────────────────────────────────────────
  addCategory: (cat: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  toggleCategoryType: (id: string) => void;

  // ── Transaction ────────────────────────────────────────────
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  importTransactions: (ts: Omit<Transaction, 'id' | 'createdAt'>[]) => number;
  toggleTransactionType: (id: string) => void;

  // ── Budget ─────────────────────────────────────────────────
  upsertBudgetAllocation: (b: Omit<BudgetAllocation, 'id'>) => void;

  // ── Goals ──────────────────────────────────────────────────
  addGoal: (g: Omit<SavingsGoal, 'id' | 'contributions'>) => void;
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  addContribution: (goalId: string, amount: number, date: string) => void;

  // ── Debts ──────────────────────────────────────────────────
  addDebt: (d: Omit<Debt, 'id' | 'startDate' | 'payments' | 'isActive'>) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  logPayment: (debtId: string, amount: number, date: string, isSnowflake: boolean) => void;
  markDebtPaidOff: (id: string) => void;

  // ── UI ─────────────────────────────────────────────────────
  setSelectedMonth: (m: string) => void;
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
      debts: SEED_DEBTS,
      selectedMonth: getMonthKey(),

      // ── Selectors ────────────────────────────────────────
      activeUser: () => get().users.find(u => u.id === get().activeUserId),
      activeContext: () => get().contexts.find(c => c.id === get().activeContextId),
      accessibleContextIds: () => {
        const uid = get().activeUserId;
        return get().contexts.filter(c => c.ownerId === uid || c.memberIds.includes(uid)).map(c => c.id);
      },
      contextCategories: (contextId) =>
        get().categories.filter(c => c.contextId === 'global' || c.contextId === contextId)
          .sort((a, b) => a.sortOrder - b.sortOrder),
      contextTransactions: (contextId) =>
        get().transactions.filter(t => t.contextId === (contextId ?? get().activeContextId)),
      contextDebts: (contextId) =>
        get().debts.filter(d => d.contextId === (contextId ?? get().activeContextId) && d.isActive),
      snowballProjection: (extra, strategy) =>
        computeSnowball(
          get().debts.filter(d => d.contextId === get().activeContextId && d.isActive && d.currentBalance > 0),
          extra, strategy
        ),

      // ── Auth ─────────────────────────────────────────────
      switchUser: (userId) => {
        const user = get().users.find(u => u.id === userId);
        if (!user) return;
        set({ activeUserId: userId, activeContextId: user.activeContextId });
      },
      toggleTheme: () =>
        set(s => ({
          users: s.users.map(u =>
            u.id === s.activeUserId ? { ...u, theme: u.theme === 'dark' ? 'light' : 'dark' } : u
          ),
        })),

      // ── Context ───────────────────────────────────────────
      switchContext: (contextId) =>
        set(s => ({
          activeContextId: contextId,
          users: s.users.map(u => u.id === s.activeUserId ? { ...u, activeContextId: contextId } : u),
        })),
      addContext: (ctx) =>
        set(s => ({ contexts: [...s.contexts, { ...ctx, id: generateId(), createdAt: new Date().toISOString() }] })),
      updateContext: (id, updates) =>
        set(s => ({ contexts: s.contexts.map(c => c.id === id ? { ...c, ...updates } : c) })),
      deleteContext: (id) =>
        set(s => ({ contexts: s.contexts.filter(c => c.id !== id) })),

      // ── Category ──────────────────────────────────────────
      addCategory: (cat) =>
        set(s => ({ categories: [...s.categories, { ...cat, id: generateId(), createdAt: new Date().toISOString() }] })),
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
            return { ...c, defaultType: c.defaultType === 'want' ? 'need' : 'want' };
          }),
        })),

      // ── Transaction ───────────────────────────────────────
      addTransaction: (t) =>
        set(s => ({ transactions: [{ ...t, id: generateId(), createdAt: new Date().toISOString() }, ...s.transactions] })),
      updateTransaction: (id, updates) =>
        set(s => ({ transactions: s.transactions.map(t => t.id === id ? { ...t, ...updates } : t) })),
      deleteTransaction: (id) =>
        set(s => ({ transactions: s.transactions.filter(t => t.id !== id) })),
      importTransactions: (ts) => {
        const existing = get().transactions;
        const dedup = ts.filter(t => !existing.some(e => e.date === t.date && e.payee === t.payee && e.amount === t.amount));
        set(s => ({ transactions: [...dedup.map(t => ({ ...t, id: generateId(), createdAt: new Date().toISOString() })), ...s.transactions] }));
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
          const idx = s.budgetAllocations.findIndex(a => a.contextId === b.contextId && a.month === b.month && a.categoryId === b.categoryId);
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
            const c: GoalContribution = { id: generateId(), goalId, contributedBy: get().activeUserId, date, amount };
            return { ...g, currentAmount: g.currentAmount + amount, contributions: [c, ...g.contributions] };
          }),
        })),

      // ── Debts ─────────────────────────────────────────────
      addDebt: (d) =>
        set(s => ({
          debts: [...s.debts, {
            ...d, id: generateId(),
            startDate: new Date().toISOString().slice(0, 10),
            payments: [], isActive: true,
          }],
        })),
      updateDebt: (id, updates) =>
        set(s => ({ debts: s.debts.map(d => d.id === id ? { ...d, ...updates } : d) })),
      deleteDebt: (id) =>
        set(s => ({ debts: s.debts.filter(d => d.id !== id) })),
      logPayment: (debtId, amount, date, isSnowflake) =>
        set(s => ({
          debts: s.debts.map(d => {
            if (d.id !== debtId) return d;
            const monthlyInterest = d.currentBalance * (d.apr / 12);
            const interest = Math.min(monthlyInterest, amount);
            const principal = Math.max(0, amount - interest);
            const balanceAfter = Math.max(0, d.currentBalance - principal);
            const payment: DebtPayment = {
              id: generateId(), debtId, date, amount,
              principal, interest, balanceAfter, isSnowflake,
              createdBy: get().activeUserId,
            };
            return {
              ...d,
              currentBalance: balanceAfter,
              payments: [payment, ...d.payments],
              paidOffDate: balanceAfter <= 0 ? date : undefined,
              isActive: balanceAfter > 0,
            };
          }),
        })),
      markDebtPaidOff: (id) =>
        set(s => ({
          debts: s.debts.map(d =>
            d.id === id ? { ...d, currentBalance: 0, isActive: false, paidOffDate: new Date().toISOString().slice(0, 10) } : d
          ),
        })),

      // ── UI ────────────────────────────────────────────────
      setSelectedMonth: (m) => set({ selectedMonth: m }),
    }),
    { name: 'hbos-v3', storage: createJSONStorage(() => localStorage) }
  )
);

export const useTheme = () => {
  const { users, activeUserId } = useStore();
  return users.find(u => u.id === activeUserId)?.theme ?? 'dark';
};
