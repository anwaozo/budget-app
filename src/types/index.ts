export type TransactionType = 'want' | 'need' | 'income' | 'transfer';

export interface Transaction {
  id: string;
  date: string; // ISO YYYY-MM-DD
  payee: string;
  amount: number; // positive = income, negative = expense
  categoryId: string;
  type: TransactionType;
  note?: string;
  importSource?: 'csv' | 'manual';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  defaultType: TransactionType;
  icon?: string;
  color?: string;
  isSystem: boolean;
}

export interface BudgetAllocation {
  id: string;
  month: string; // 'YYYY-MM'
  categoryId: string;
  allocated: number;
  rollover: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  monthlyContribution: number;
  note?: string;
  color?: string;
  contributions: GoalContribution[];
}

export interface GoalContribution {
  id: string;
  date: string;
  amount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'primary' | 'partner';
  theme: 'dark' | 'light';
  currency: string;
}

export interface MonthSummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  totalWants: number;
  totalNeeds: number;
  savingsRate: number;
  wantsPct: number;
  needsPct: number;
}
