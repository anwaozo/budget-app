import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Transaction, MonthSummary } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, showSign = false): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(abs);
  if (showSign && amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function getMonthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function computeMonthSummary(
  transactions: Transaction[],
  monthKey: string,
): MonthSummary {
  const monthly = transactions.filter(t => t.date.startsWith(monthKey));

  const totalIncome = monthly
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = monthly.filter(t => t.type !== 'income' && t.type !== 'transfer');
  const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalWants = expenses
    .filter(t => t.type === 'want')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalNeeds = expenses
    .filter(t => t.type === 'need')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const savingsRate = totalIncome > 0
    ? ((totalIncome - totalExpenses) / totalIncome) * 100
    : 0;

  const wantsPct = totalExpenses > 0 ? (totalWants / totalExpenses) * 100 : 0;
  const needsPct = totalExpenses > 0 ? (totalNeeds / totalExpenses) * 100 : 0;

  return { month: monthKey, totalIncome, totalExpenses, totalWants, totalNeeds, savingsRate, wantsPct, needsPct };
}

export function projectGoalCompletion(
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number,
): Date | null {
  if (monthlyContribution <= 0) return null;
  const monthsNeeded = Math.ceil((targetAmount - currentAmount) / monthlyContribution);
  return addMonths(new Date(), monthsNeeded);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
