import { Category, Transaction, BudgetAllocation, SavingsGoal } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'housing',       name: 'Housing & Rent',      defaultType: 'need',   icon: '🏠', isSystem: true },
  { id: 'childcare',     name: 'Childcare',            defaultType: 'need',   icon: '👶', isSystem: true },
  { id: 'groceries',     name: 'Groceries',            defaultType: 'need',   icon: '🛒', isSystem: true },
  { id: 'utilities',     name: 'Utilities',            defaultType: 'need',   icon: '💡', isSystem: true },
  { id: 'transport',     name: 'Transportation',       defaultType: 'need',   icon: '🚗', isSystem: true },
  { id: 'health',        name: 'Health & Insurance',   defaultType: 'need',   icon: '🏥', isSystem: true },
  { id: 'baby',          name: 'Baby Supplies',        defaultType: 'need',   icon: '🍼', isSystem: true },
  { id: 'dining',        name: 'Dining Out',           defaultType: 'want',   icon: '🍽', isSystem: true },
  { id: 'entertainment', name: 'Entertainment',        defaultType: 'want',   icon: '🎬', isSystem: true },
  { id: 'subscriptions', name: 'Subscriptions',        defaultType: 'want',   icon: '📱', isSystem: true },
  { id: 'shopping',      name: 'Shopping',             defaultType: 'want',   icon: '🛍', isSystem: true },
  { id: 'personal',      name: 'Personal Care',        defaultType: 'want',   icon: '✂️', isSystem: true },
  { id: 'income',        name: 'Income',               defaultType: 'income', icon: '💰', isSystem: true },
  { id: 'savings',       name: 'Savings',              defaultType: 'need',   icon: '🏦', isSystem: true },
  { id: 'other',         name: 'Other',                defaultType: 'need',   icon: '📦', isSystem: false },
];

export const SEED_TRANSACTIONS: Transaction[] = [
  { id:'t1',  date:'2026-05-28', payee:'HEB Grocery',         amount:-142.30,  categoryId:'groceries',     type:'need',   note:'Weekly shop',     importSource:'manual', createdAt:'2026-05-28T10:00:00Z' },
  { id:'t2',  date:'2026-05-27', payee:'Apperr — Paycheck',   amount:4200.00,  categoryId:'income',        type:'income', note:'Bi-weekly',       importSource:'manual', createdAt:'2026-05-27T09:00:00Z' },
  { id:'t3',  date:'2026-05-26', payee:'Shell Gas Station',   amount:-67.20,   categoryId:'transport',     type:'need',   note:'',                importSource:'manual', createdAt:'2026-05-26T08:30:00Z' },
  { id:'t4',  date:'2026-05-25', payee:'Spotify Premium',     amount:-16.00,   categoryId:'subscriptions', type:'want',   note:'',                importSource:'manual', createdAt:'2026-05-25T00:00:00Z' },
  { id:'t5',  date:'2026-05-24', payee:'Sunrise Daycare',     amount:-850.00,  categoryId:'childcare',     type:'need',   note:'June invoice',    importSource:'manual', createdAt:'2026-05-24T08:00:00Z' },
  { id:'t6',  date:'2026-05-23', payee:'Netflix',             amount:-18.00,   categoryId:'subscriptions', type:'want',   note:'',                importSource:'manual', createdAt:'2026-05-23T00:00:00Z' },
  { id:'t7',  date:'2026-05-22', payee:'Amazon Prime',        amount:-43.99,   categoryId:'shopping',      type:'want',   note:'Baby items',      importSource:'manual', createdAt:'2026-05-22T14:00:00Z' },
  { id:'t8',  date:'2026-05-21', payee:'HOA Monthly Fee',     amount:-210.00,  categoryId:'housing',       type:'need',   note:'Auto-pay',        importSource:'manual', createdAt:'2026-05-21T00:00:00Z' },
  { id:'t9',  date:'2026-05-20', payee:'CVS Pharmacy',        amount:-38.50,   categoryId:'health',        type:'need',   note:'',                importSource:'manual', createdAt:'2026-05-20T11:00:00Z' },
  { id:'t10', date:'2026-05-19', payee:"Chick-fil-A",         amount:-24.80,   categoryId:'dining',        type:'want',   note:'',                importSource:'manual', createdAt:'2026-05-19T12:30:00Z' },
  { id:'t11', date:'2026-05-18', payee:'CenterPoint Energy',  amount:-89.40,   categoryId:'utilities',     type:'need',   note:'',                importSource:'manual', createdAt:'2026-05-18T00:00:00Z' },
  { id:'t12', date:'2026-05-17', payee:'Target',              amount:-112.30,  categoryId:'shopping',      type:'want',   note:'Household',       importSource:'manual', createdAt:'2026-05-17T15:00:00Z' },
  { id:'t13', date:'2026-05-16', payee:'GHBCC Consulting',    amount:1200.00,  categoryId:'income',        type:'income', note:'IT services',     importSource:'manual', createdAt:'2026-05-16T09:00:00Z' },
  { id:'t14', date:'2026-05-15', payee:'Starbucks',           amount:-18.60,   categoryId:'dining',        type:'want',   note:'',                importSource:'manual', createdAt:'2026-05-15T08:00:00Z' },
  { id:'t15', date:'2026-05-14', payee:'Apperr — Paycheck',   amount:3000.00,  categoryId:'income',        type:'income', note:'Bi-weekly',       importSource:'manual', createdAt:'2026-05-14T09:00:00Z' },
  { id:'t16', date:'2026-05-13', payee:'Pampers Diapers',     amount:-47.99,   categoryId:'baby',          type:'need',   note:'',                importSource:'manual', createdAt:'2026-05-13T10:00:00Z' },
  { id:'t17', date:'2026-05-10', payee:'Geico Insurance',     amount:-142.00,  categoryId:'health',        type:'need',   note:'Auto insurance',  importSource:'manual', createdAt:'2026-05-10T00:00:00Z' },
  { id:'t18', date:'2026-05-08', payee:'H-E-B Grocery',       amount:-138.70,  categoryId:'groceries',     type:'need',   note:'Weekly shop',     importSource:'manual', createdAt:'2026-05-08T10:00:00Z' },
  { id:'t19', date:'2026-05-05', payee:'Regal Cinemas',       amount:-38.00,   categoryId:'entertainment', type:'want',   note:'Date night',      importSource:'manual', createdAt:'2026-05-05T19:00:00Z' },
  { id:'t20', date:'2026-05-01', payee:'Mortgage — Chase',    amount:-1890.00, categoryId:'housing',       type:'need',   note:'May mortgage',    importSource:'manual', createdAt:'2026-05-01T00:00:00Z' },
];

export const SEED_BUDGET: BudgetAllocation[] = [
  { id:'b1',  month:'2026-05', categoryId:'housing',       allocated:2100,  rollover:0 },
  { id:'b2',  month:'2026-05', categoryId:'childcare',     allocated:1200,  rollover:0 },
  { id:'b3',  month:'2026-05', categoryId:'groceries',     allocated:600,   rollover:0 },
  { id:'b4',  month:'2026-05', categoryId:'utilities',     allocated:280,   rollover:0 },
  { id:'b5',  month:'2026-05', categoryId:'transport',     allocated:400,   rollover:0 },
  { id:'b6',  month:'2026-05', categoryId:'health',        allocated:350,   rollover:0 },
  { id:'b7',  month:'2026-05', categoryId:'baby',          allocated:200,   rollover:0 },
  { id:'b8',  month:'2026-05', categoryId:'dining',        allocated:300,   rollover:0 },
  { id:'b9',  month:'2026-05', categoryId:'entertainment', allocated:150,   rollover:0 },
  { id:'b10', month:'2026-05', categoryId:'subscriptions', allocated:80,    rollover:0 },
  { id:'b11', month:'2026-05', categoryId:'shopping',      allocated:180,   rollover:0 },
  { id:'b12', month:'2026-05', categoryId:'personal',      allocated:120,   rollover:0 },
  { id:'b13', month:'2026-05', categoryId:'savings',       allocated:930,   rollover:0 },
];

export const SEED_GOALS: SavingsGoal[] = [
  {
    id:'g1', name:'Emergency Fund', targetAmount:15000, currentAmount:10800,
    targetDate:'2026-08-01', monthlyContribution:500,
    note:'3–6 months of expenses', color:'#22C55E',
    contributions:[
      {id:'gc1',date:'2026-05-01',amount:500},
      {id:'gc2',date:'2026-04-01',amount:500},
    ],
  },
  {
    id:'g2', name:'Baby College Fund', targetAmount:50000, currentAmount:9000,
    targetDate:'2030-01-01', monthlyContribution:400,
    note:'529 Plan — start early', color:'#0EA5A0',
    contributions:[
      {id:'gc3',date:'2026-05-01',amount:400},
    ],
  },
  {
    id:'g3', name:'Vacation 2026', targetAmount:4500, currentAmount:2025,
    targetDate:'2026-11-01', monthlyContribution:350,
    note:'Family trip — Cancun', color:'#F59E0B',
    contributions:[
      {id:'gc4',date:'2026-05-01',amount:350},
    ],
  },
  {
    id:'g4', name:'New Vehicle Fund', targetAmount:8000, currentAmount:2000,
    targetDate:'2028-03-01', monthlyContribution:200,
    note:'Replace the Palisade', color:'#EF4444',
    contributions:[
      {id:'gc5',date:'2026-05-01',amount:200},
    ],
  },
];
