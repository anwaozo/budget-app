// ── Context types ─────────────────────────────────────────────
export type ContextType = 'personal' | 'joint' | 'business';

export interface BudgetContext {
  id: string;
  type: ContextType;
  name: string;
  ownerId: string;
  memberIds: string[];
  color: string;          // teal | green | purple per type
  businessType?: string;  // LLC | Sole Prop | S-Corp etc.
  createdAt: string;
}

// ── User ──────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  pin: string;            // 4-digit PIN for quick switch
  avatarInitials: string;
  theme: 'dark' | 'light';
  activeContextId: string;
  createdAt: string;
}

// ── Category ──────────────────────────────────────────────────
export type TransactionType = 'want' | 'need' | 'income' | 'transfer';

export interface Category {
  id: string;
  contextId: string;      // 'global' for defaults, or BudgetContext.id
  name: string;
  defaultType: TransactionType;
  icon: string;
  color?: string;
  isSystem: boolean;
  sortOrder: number;
  createdAt: string;
}

// ── Transaction ───────────────────────────────────────────────
export interface Transaction {
  id: string;
  contextId: string;
  date: string;
  payee: string;
  amount: number;
  categoryId: string;
  type: TransactionType;
  note?: string;
  importSource?: 'csv' | 'manual';
  createdBy: string;
  createdAt: string;
}

// ── Budget allocation ─────────────────────────────────────────
export interface BudgetAllocation {
  id: string;
  contextId: string;
  month: string;
  categoryId: string;
  allocated: number;
  rollover: number;
}

// ── Goals ─────────────────────────────────────────────────────
export interface GoalContribution {
  id: string;
  goalId: string;
  contributedBy: string;
  date: string;
  amount: number;
}

export interface SavingsGoal {
  id: string;
  contextId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  note?: string;
  color?: string;
  contributions: GoalContribution[];
}

// ── Derived ───────────────────────────────────────────────────
export interface MonthSummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  totalWants: number;
  totalNeeds: number;
  savingsRate: number;
  wantsPct: number;
  needsPct: number;
  netProfit?: number;      // business contexts
}
