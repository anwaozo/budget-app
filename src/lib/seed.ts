import { BudgetContext, UserProfile, Category, Transaction, BudgetAllocation, SavingsGoal, Debt } from '@/types';

// ── Users ────────────────────────────────────────────────────
export const SEED_USERS: UserProfile[] = [
  { id:'user-adam', name:'Adam Nwaozo',  email:'adam@apperr.com',    pin:'1234', avatarInitials:'AN', theme:'dark',  activeContextId:'ctx-joint', createdAt:'2026-01-01T00:00:00Z' },
  { id:'user-wife', name:'Wife',          email:'wife@nwaozo.com',    pin:'5678', avatarInitials:'W',  theme:'light', activeContextId:'ctx-joint', createdAt:'2026-01-01T00:00:00Z' },
];

export const SEED_CONTEXTS: BudgetContext[] = [
  { id:'ctx-adam-personal', type:'personal', name:'Adam — Personal', ownerId:'user-adam', memberIds:['user-adam'], color:'#0EA5A0', createdAt:'2026-01-01T00:00:00Z' },
  { id:'ctx-wife-personal', type:'personal', name:'Wife — Personal', ownerId:'user-wife', memberIds:['user-wife'], color:'#0EA5A0', createdAt:'2026-01-01T00:00:00Z' },
  { id:'ctx-joint',         type:'joint',    name:'Nwaozo Joint',    ownerId:'user-adam', memberIds:['user-adam','user-wife'], color:'#22C55E', createdAt:'2026-01-01T00:00:00Z' },
  { id:'ctx-apperr',        type:'business', name:'Apperr LLC',      ownerId:'user-adam', memberIds:['user-adam'], color:'#8B5CF6', businessType:'LLC', createdAt:'2026-01-01T00:00:00Z' },
];

export const GLOBAL_CATEGORIES: Category[] = [
  { id:'cat-housing',       contextId:'global', name:'Housing & Rent',  defaultType:'need',   icon:'🏠', isSystem:true, sortOrder:1,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-childcare',     contextId:'global', name:'Childcare',       defaultType:'need',   icon:'👶', isSystem:true, sortOrder:2,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-groceries',     contextId:'global', name:'Groceries',       defaultType:'need',   icon:'🛒', isSystem:true, sortOrder:3,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-utilities',     contextId:'global', name:'Utilities',       defaultType:'need',   icon:'💡', isSystem:true, sortOrder:4,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-transport',     contextId:'global', name:'Transportation',  defaultType:'need',   icon:'🚗', isSystem:true, sortOrder:5,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-health',        contextId:'global', name:'Health',          defaultType:'need',   icon:'🏥', isSystem:true, sortOrder:6,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-baby',          contextId:'global', name:'Baby Supplies',   defaultType:'need',   icon:'🍼', isSystem:true, sortOrder:7,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-dining',        contextId:'global', name:'Dining Out',      defaultType:'want',   icon:'🍽', isSystem:true, sortOrder:8,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-entertainment', contextId:'global', name:'Entertainment',   defaultType:'want',   icon:'🎬', isSystem:true, sortOrder:9,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-subscriptions', contextId:'global', name:'Subscriptions',   defaultType:'want',   icon:'📱', isSystem:true, sortOrder:10, createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-shopping',      contextId:'global', name:'Shopping',        defaultType:'want',   icon:'🛍', isSystem:true, sortOrder:11, createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-personal',      contextId:'global', name:'Personal Care',   defaultType:'want',   icon:'✂️', isSystem:true, sortOrder:12, createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-income',        contextId:'global', name:'Income',          defaultType:'income', icon:'💰', isSystem:true, sortOrder:13, createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-savings',       contextId:'global', name:'Savings',         defaultType:'need',   icon:'🏦', isSystem:true, sortOrder:14, createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-other',         contextId:'global', name:'Other',           defaultType:'need',   icon:'📦', isSystem:false, sortOrder:99, createdAt:'2026-01-01T00:00:00Z' },
];

export const CONTEXT_CATEGORIES: Category[] = [
  { id:'cat-date-nights', contextId:'ctx-joint',         name:'Date Nights',   defaultType:'want',   icon:'❤️', isSystem:false, sortOrder:20, createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-contractor',  contextId:'ctx-apperr',        name:'Contractors',   defaultType:'need',   icon:'👨‍💻', isSystem:false, sortOrder:1,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-saas',        contextId:'ctx-apperr',        name:'SaaS Tools',    defaultType:'need',   icon:'⚙️', isSystem:false, sortOrder:2,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-marketing',   contextId:'ctx-apperr',        name:'Marketing',     defaultType:'need',   icon:'📢', isSystem:false, sortOrder:3,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-client-rev',  contextId:'ctx-apperr',        name:'Client Revenue',defaultType:'income', icon:'💼', isSystem:false, sortOrder:4,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-gym',         contextId:'ctx-adam-personal', name:'Gym & Fitness', defaultType:'want',   icon:'💪', isSystem:false, sortOrder:1,  createdAt:'2026-01-01T00:00:00Z' },
];

export const ALL_CATEGORIES = [...GLOBAL_CATEGORIES, ...CONTEXT_CATEGORIES];

export const SEED_TRANSACTIONS: Transaction[] = [
  { id:'tx1',  contextId:'ctx-joint',         date:'2026-05-28', payee:'HEB Grocery',          amount:-142.30,  categoryId:'cat-groceries',    type:'need',   createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-28T10:00:00Z' },
  { id:'tx2',  contextId:'ctx-joint',         date:'2026-05-27', payee:'Apperr — Paycheck',    amount:4200.00,  categoryId:'cat-income',       type:'income', createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-27T09:00:00Z' },
  { id:'tx3',  contextId:'ctx-joint',         date:'2026-05-26', payee:'Shell Gas Station',    amount:-67.20,   categoryId:'cat-transport',    type:'need',   createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-26T08:30:00Z' },
  { id:'tx4',  contextId:'ctx-joint',         date:'2026-05-25', payee:'Spotify Premium',      amount:-16.00,   categoryId:'cat-subscriptions',type:'want',   createdBy:'user-wife', importSource:'manual', createdAt:'2026-05-25T00:00:00Z' },
  { id:'tx5',  contextId:'ctx-joint',         date:'2026-05-24', payee:'Sunrise Daycare',      amount:-850.00,  categoryId:'cat-childcare',    type:'need',   createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-24T08:00:00Z' },
  { id:'tx6',  contextId:'ctx-joint',         date:'2026-05-23', payee:'Netflix',              amount:-18.00,   categoryId:'cat-subscriptions',type:'want',   createdBy:'user-wife', importSource:'manual', createdAt:'2026-05-23T00:00:00Z' },
  { id:'tx7',  contextId:'ctx-joint',         date:'2026-05-22', payee:'Amazon Prime',         amount:-43.99,   categoryId:'cat-shopping',     type:'want',   createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-22T14:00:00Z' },
  { id:'tx8',  contextId:'ctx-joint',         date:'2026-05-21', payee:'HOA Monthly Fee',      amount:-210.00,  categoryId:'cat-housing',      type:'need',   createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-21T00:00:00Z' },
  { id:'tx9',  contextId:'ctx-joint',         date:'2026-05-20', payee:'Date Night — Nobu',    amount:-184.00,  categoryId:'cat-date-nights',  type:'want',   createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-20T19:00:00Z' },
  { id:'tx10', contextId:'ctx-joint',         date:'2026-05-18', payee:'CenterPoint Energy',   amount:-89.40,   categoryId:'cat-utilities',    type:'need',   createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-18T00:00:00Z' },
  { id:'tx11', contextId:'ctx-joint',         date:'2026-05-15', payee:'Apperr — Paycheck',    amount:3000.00,  categoryId:'cat-income',       type:'income', createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-15T09:00:00Z' },
  { id:'tx12', contextId:'ctx-joint',         date:'2026-05-14', payee:'Pampers Diapers',      amount:-47.99,   categoryId:'cat-baby',         type:'need',   createdBy:'user-wife', importSource:'manual', createdAt:'2026-05-14T10:00:00Z' },
  { id:'tx13', contextId:'ctx-joint',         date:'2026-05-10', payee:'Geico Insurance',      amount:-142.00,  categoryId:'cat-health',       type:'need',   createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-10T00:00:00Z' },
  { id:'tx14', contextId:'ctx-joint',         date:'2026-05-08', payee:'HEB Grocery',          amount:-138.70,  categoryId:'cat-groceries',    type:'need',   createdBy:'user-wife', importSource:'manual', createdAt:'2026-05-08T10:00:00Z' },
  { id:'tx15', contextId:'ctx-joint',         date:'2026-05-01', payee:'Mortgage — Chase',     amount:-1890.00, categoryId:'cat-housing',      type:'need',   createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-01T00:00:00Z' },
  { id:'tx16', contextId:'ctx-joint',         date:'2026-05-16', payee:'GHBCC Consulting',     amount:1200.00,  categoryId:'cat-income',       type:'income', createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-16T09:00:00Z' },
  { id:'tx17', contextId:'ctx-adam-personal', date:'2026-05-20', payee:'Planet Fitness',       amount:-25.00,   categoryId:'cat-gym',          type:'want',   createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-20T06:00:00Z' },
  { id:'tx18', contextId:'ctx-adam-personal', date:'2026-05-15', payee:'Trading Commission',   amount:-12.50,   categoryId:'cat-other',        type:'need',   createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-15T10:00:00Z' },
  { id:'tx19', contextId:'ctx-apperr',        date:'2026-05-25', payee:'Client — Prive Parking',amount:3500.00, categoryId:'cat-client-rev',   type:'income', createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-25T09:00:00Z' },
  { id:'tx20', contextId:'ctx-apperr',        date:'2026-05-24', payee:'Contractor — Dev 1',   amount:-900.00,  categoryId:'cat-contractor',   type:'need',   createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-24T10:00:00Z' },
  { id:'tx21', contextId:'ctx-apperr',        date:'2026-05-20', payee:'AWS Hosting',          amount:-142.00,  categoryId:'cat-saas',         type:'need',   createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-20T00:00:00Z' },
  { id:'tx22', contextId:'ctx-apperr',        date:'2026-05-16', payee:'GHBCC IT Services',    amount:1200.00,  categoryId:'cat-client-rev',   type:'income', createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-16T09:00:00Z' },
  { id:'tx23', contextId:'ctx-apperr',        date:'2026-05-10', payee:'Figma Pro',            amount:-45.00,   categoryId:'cat-saas',         type:'need',   createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-10T00:00:00Z' },
  { id:'tx24', contextId:'ctx-apperr',        date:'2026-05-05', payee:'Meta Ads',             amount:-380.00,  categoryId:'cat-marketing',    type:'need',   createdBy:'user-adam', importSource:'manual', createdAt:'2026-05-05T00:00:00Z' },
];

export const SEED_BUDGET: BudgetAllocation[] = [
  { id:'ba1',  contextId:'ctx-joint',  month:'2026-05', categoryId:'cat-housing',       allocated:2100, rollover:0 },
  { id:'ba2',  contextId:'ctx-joint',  month:'2026-05', categoryId:'cat-childcare',     allocated:1200, rollover:0 },
  { id:'ba3',  contextId:'ctx-joint',  month:'2026-05', categoryId:'cat-groceries',     allocated:600,  rollover:0 },
  { id:'ba4',  contextId:'ctx-joint',  month:'2026-05', categoryId:'cat-utilities',     allocated:280,  rollover:0 },
  { id:'ba5',  contextId:'ctx-joint',  month:'2026-05', categoryId:'cat-transport',     allocated:400,  rollover:0 },
  { id:'ba6',  contextId:'ctx-joint',  month:'2026-05', categoryId:'cat-health',        allocated:350,  rollover:0 },
  { id:'ba7',  contextId:'ctx-joint',  month:'2026-05', categoryId:'cat-baby',          allocated:200,  rollover:0 },
  { id:'ba8',  contextId:'ctx-joint',  month:'2026-05', categoryId:'cat-dining',        allocated:300,  rollover:0 },
  { id:'ba9',  contextId:'ctx-joint',  month:'2026-05', categoryId:'cat-entertainment', allocated:150,  rollover:0 },
  { id:'ba10', contextId:'ctx-joint',  month:'2026-05', categoryId:'cat-subscriptions', allocated:80,   rollover:0 },
  { id:'ba11', contextId:'ctx-joint',  month:'2026-05', categoryId:'cat-shopping',      allocated:180,  rollover:0 },
  { id:'ba12', contextId:'ctx-joint',  month:'2026-05', categoryId:'cat-date-nights',   allocated:200,  rollover:0 },
  { id:'ba13', contextId:'ctx-joint',  month:'2026-05', categoryId:'cat-savings',       allocated:950,  rollover:0 },
  { id:'ba14', contextId:'ctx-apperr', month:'2026-05', categoryId:'cat-contractor',    allocated:2000, rollover:0 },
  { id:'ba15', contextId:'ctx-apperr', month:'2026-05', categoryId:'cat-saas',          allocated:300,  rollover:0 },
  { id:'ba16', contextId:'ctx-apperr', month:'2026-05', categoryId:'cat-marketing',     allocated:500,  rollover:0 },
];

export const SEED_GOALS: SavingsGoal[] = [
  { id:'g1', contextId:'ctx-joint',         name:'Emergency Fund',    targetAmount:15000, currentAmount:10800, targetDate:'2026-08-01', monthlyContribution:500, note:'3–6 months expenses', color:'#22C55E', contributions:[{id:'gc1',goalId:'g1',contributedBy:'user-adam',date:'2026-05-01',amount:500}] },
  { id:'g2', contextId:'ctx-joint',         name:'Baby College Fund', targetAmount:50000, currentAmount:9000,  targetDate:'2030-01-01', monthlyContribution:400, note:'529 Plan',             color:'#0EA5A0', contributions:[{id:'gc2',goalId:'g2',contributedBy:'user-adam',date:'2026-05-01',amount:400}] },
  { id:'g3', contextId:'ctx-joint',         name:'Vacation 2026',     targetAmount:4500,  currentAmount:2025,  targetDate:'2026-11-01', monthlyContribution:350, note:'Cancun trip',          color:'#F59E0B', contributions:[{id:'gc3',goalId:'g3',contributedBy:'user-wife',date:'2026-05-01',amount:350}] },
  { id:'g4', contextId:'ctx-adam-personal', name:'Gym Equipment',     targetAmount:1200,  currentAmount:480,   targetDate:'2026-08-01', monthlyContribution:200, note:'Home gym setup',       color:'#8B5CF6', contributions:[{id:'gc4',goalId:'g4',contributedBy:'user-adam',date:'2026-05-01',amount:200}] },
  { id:'g5', contextId:'ctx-apperr',        name:'MacBook Pro',       targetAmount:3500,  currentAmount:1400,  targetDate:'2026-09-01', monthlyContribution:350, note:'Dev workstation',      color:'#8B5CF6', contributions:[{id:'gc5',goalId:'g5',contributedBy:'user-adam',date:'2026-05-01',amount:350}] },
];

export const SEED_DEBTS: Debt[] = [
  { id:'debt-1', contextId:'ctx-joint', name:'Spotify Card',   type:'credit_card', currentBalance:420,   originalBalance:1800,  apr:0.2490, minimumPayment:25,  dueDate:15, startDate:'2024-01-01', isActive:true, payments:[], note:'Pay off first!' },
  { id:'debt-2', contextId:'ctx-joint', name:'Chase Sapphire', type:'credit_card', currentBalance:1840,  originalBalance:4200,  apr:0.2140, minimumPayment:45,  dueDate:20, startDate:'2023-06-01', isActive:true, payments:[] },
  { id:'debt-3', contextId:'ctx-joint', name:'Car Loan',        type:'auto',        currentBalance:8200,  originalBalance:45000, apr:0.0690, minimumPayment:287, dueDate:1,  startDate:'2021-03-01', isActive:true, payments:[], note:'Hyundai Palisade' },
  { id:'debt-4', contextId:'ctx-joint', name:'Student Loan',    type:'student',     currentBalance:14500, originalBalance:22000, apr:0.0580, minimumPayment:162, dueDate:10, startDate:'2020-09-01', isActive:true, payments:[] },
];
