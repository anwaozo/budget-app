import { Debt, SnowballProjection, DebtSchedule, MonthlyBreakdown } from '@/types';
import { addMonths, generateId } from './utils';

/**
 * Pure Debt Snowball / Avalanche projection engine.
 * Runs a month-by-month simulation until all debts are $0.
 */
export function computeSnowball(
  debts: Debt[],
  extraMonthlyPayment: number,
  strategy: 'snowball' | 'avalanche'
): SnowballProjection {
  const activeDebts = debts.filter(d => d.isActive && d.currentBalance > 0);
  if (activeDebts.length === 0) {
    return {
      strategy, extraMonthlyPayment,
      debtFreeDate: new Date().toISOString(),
      totalInterestPaid: 0, totalMonthsToPayoff: 0,
      debtSchedules: [], reachable: true,
    };
  }

  // Sort: snowball = smallest balance first; avalanche = highest APR first
  const sorted = [...activeDebts].sort((a, b) =>
    strategy === 'snowball'
      ? a.currentBalance - b.currentBalance
      : b.apr - a.apr
  );

  // Working state
  const balances = sorted.map(d => d.currentBalance);
  const schedules: DebtSchedule[] = sorted.map(d => ({
    debtId: d.id, payoffMonth: 0,
    payoffDate: '', totalInterestPaid: 0, monthlyBreakdown: [],
  }));

  let freedPayment = 0; // accumulates as debts are paid off
  let month = 0;
  const MAX_MONTHS = 600;

  while (balances.some(b => b > 0.005) && month < MAX_MONTHS) {
    month++;
    // Find the first unpaid debt (attack target)
    const attackIdx = balances.findIndex(b => b > 0.005);

    for (let i = 0; i < sorted.length; i++) {
      if (balances[i] <= 0.005) continue;
      const d = sorted[i];

      // Apply monthly interest
      const monthlyInterest = balances[i] * (d.apr / 12);
      balances[i] += monthlyInterest;

      // Payment = minimum + (extra + freed-up payments if this is the attack debt)
      const extraForThis = i === attackIdx ? extraMonthlyPayment + freedPayment : 0;
      const payment = Math.min(d.minimumPayment + extraForThis, balances[i]);
      const principal = payment - monthlyInterest;
      const actualInterest = Math.min(monthlyInterest, payment);

      balances[i] = Math.max(0, balances[i] - payment);
      schedules[i].totalInterestPaid += actualInterest;

      const breakdown: MonthlyBreakdown = {
        month, payment, principal: Math.max(0, principal),
        interest: actualInterest, balance: balances[i],
      };
      schedules[i].monthlyBreakdown.push(breakdown);

      // Debt paid off this month
      if (balances[i] <= 0.005 && schedules[i].payoffMonth === 0) {
        schedules[i].payoffMonth = month;
        schedules[i].payoffDate = addMonths(new Date(), month).toISOString().slice(0, 7);
        freedPayment += d.minimumPayment; // snowball rolls forward
        balances[i] = 0;
      }
    }
  }

  const reachable = month < MAX_MONTHS;
  const totalMonthsToPayoff = Math.max(...schedules.map(s => s.payoffMonth));
  const debtFreeDate = addMonths(new Date(), totalMonthsToPayoff).toISOString().slice(0, 7);
  const totalInterestPaid = schedules.reduce((s, d) => s + d.totalInterestPaid, 0);

  return {
    strategy, extraMonthlyPayment, debtFreeDate,
    totalInterestPaid, totalMonthsToPayoff,
    debtSchedules: schedules, reachable,
  };
}

/** Format a YYYY-MM string as "March 2028" */
export function formatProjectionDate(yyyyMM: string): string {
  if (!yyyyMM) return '—';
  const [y, m] = yyyyMM.split('-').map(Number);
  return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Months from now */
export function monthsFromNow(yyyyMM: string): number {
  if (!yyyyMM) return 0;
  const [y, m] = yyyyMM.split('-').map(Number);
  const target = new Date(y, m - 1);
  const now = new Date();
  return (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
}
