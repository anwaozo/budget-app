import { BudgetContext, UserProfile, Category, Transaction, BudgetAllocation, SavingsGoal, Debt } from '@/types';

// ── Users ────────────────────────────────────────────────────
export const SEED_USERS: UserProfile[] = [
  { id:'user-adam', name:'Adam Nwaozo',  email:'adam@apperr.com',    pin:'1234', avatarInitials:'AN', theme:'dark',  activeContextId:'ctx-joint', createdAt:'2026-01-01T00:00:00Z' },
  { id:'user-bailey', name:'Bailey Webster', email:'bailey@nwaozo.com', pin:'5678', avatarInitials:'BW', theme:'light', activeContextId:'ctx-joint', createdAt:'2026-01-01T00:00:00Z' },
];

export const SEED_CONTEXTS: BudgetContext[] = [
  { id:'ctx-adam-personal', type:'personal', name:'Adam — Personal', ownerId:'user-adam',   memberIds:['user-adam'],              color:'#0EA5A0', createdAt:'2026-01-01T00:00:00Z' },
  { id:'ctx-joint',         type:'joint',    name:'Nwaozo Joint',    ownerId:'user-adam',   memberIds:['user-adam','user-bailey'], color:'#22C55E', createdAt:'2026-01-01T00:00:00Z' },
  { id:'ctx-apperr',        type:'business', name:'Apperr LLC',      ownerId:'user-adam',   memberIds:['user-adam'],              color:'#8B5CF6', businessType:'LLC', createdAt:'2026-01-01T00:00:00Z' },
];

// ── Categories ────────────────────────────────────────────────
export const GLOBAL_CATEGORIES: Category[] = [
  { id:'cat-income',        contextId:'global', name:'Income',             defaultType:'income',   icon:'💰', isSystem:true,  sortOrder:1,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-housing',       contextId:'global', name:'Rent & Housing',     defaultType:'need',     icon:'🏠', isSystem:true,  sortOrder:2,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-transport',     contextId:'global', name:'Transportation',      defaultType:'need',     icon:'🚗', isSystem:true,  sortOrder:3,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-tolls',         contextId:'global', name:'EZTag Tolls',         defaultType:'need',     icon:'🛣️', isSystem:true,  sortOrder:4,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-utilities',     contextId:'global', name:'Utilities',           defaultType:'need',     icon:'💡', isSystem:true,  sortOrder:5,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-subscriptions', contextId:'global', name:'Subscriptions',       defaultType:'want',     icon:'📱', isSystem:true,  sortOrder:6,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-storage',       contextId:'global', name:'Storage Unit',        defaultType:'need',     icon:'🗄️', isSystem:true,  sortOrder:7,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-health',        contextId:'global', name:'Health & Medical',    defaultType:'need',     icon:'🏥', isSystem:true,  sortOrder:8,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-groceries',     contextId:'global', name:'Groceries',           defaultType:'need',     icon:'🛒', isSystem:true,  sortOrder:9,  createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-dining',        contextId:'global', name:'Dining Out',          defaultType:'want',     icon:'🍽', isSystem:true,  sortOrder:10, createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-entertainment', contextId:'global', name:'Entertainment',       defaultType:'want',     icon:'🎬', isSystem:true,  sortOrder:11, createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-savings',       contextId:'global', name:'Savings / Investment',defaultType:'need',     icon:'📈', isSystem:true,  sortOrder:12, createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-childcare',     contextId:'global', name:'Childcare',           defaultType:'need',     icon:'👶', isSystem:true,  sortOrder:13, createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-baby',          contextId:'global', name:'Baby Supplies',       defaultType:'need',     icon:'🍼', isSystem:true,  sortOrder:14, createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-shopping',      contextId:'global', name:'Shopping',            defaultType:'want',     icon:'🛍', isSystem:true,  sortOrder:15, createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-other',         contextId:'global', name:'Other',               defaultType:'need',     icon:'📦', isSystem:false, sortOrder:99, createdAt:'2026-01-01T00:00:00Z' },
];

export const CONTEXT_CATEGORIES: Category[] = [
  { id:'cat-apperr-rev',  contextId:'ctx-apperr', name:'Client Revenue',  defaultType:'income', icon:'💼', isSystem:false, sortOrder:1, createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-contractor',  contextId:'ctx-apperr', name:'Contractors',     defaultType:'need',   icon:'👨‍💻', isSystem:false, sortOrder:2, createdAt:'2026-01-01T00:00:00Z' },
  { id:'cat-saas',        contextId:'ctx-apperr', name:'SaaS Tools',      defaultType:'need',   icon:'⚙️', isSystem:false, sortOrder:3, createdAt:'2026-01-01T00:00:00Z' },
];

export const ALL_CATEGORIES = [...GLOBAL_CATEGORIES, ...CONTEXT_CATEGORIES];

// ── Real transaction data from Chase #8891 ────────────────────
// Helper
const jt = (id:string, date:string, payee:string, amount:number, catId:string,
            type:'income'|'need'|'want'|'transfer', note?:string): Transaction => ({
  id, contextId:'ctx-joint', date, payee, amount, categoryId:catId,
  type: type === 'transfer' ? 'need' : type,
  note, importSource:'csv' as const, createdBy:'user-adam', createdAt:`${date}T00:00:00Z`,
});

export const SEED_TRANSACTIONS: Transaction[] = [
  // ── DECEMBER 2025 ──────────────────────────────────────────
  jt('s1-1',  '2025-12-09', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s1-2',  '2025-12-10', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s1-3',  '2025-12-11', 'Natural Gas — CenterPoint',        -113.35,  'cat-utilities','need'),
  jt('s1-4',  '2025-12-12', 'Auto Insurance — Mercury',         -445.48,  'cat-transport','need'),
  jt('s1-5',  '2025-12-12', 'Renters Insurance — Mercury',      -27.88,   'cat-housing',  'need'),
  jt('s1-6',  '2025-12-12', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s1-7',  '2025-12-12', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s1-8',  '2025-12-15', 'Bailey — Zelle Transfer',          +13.53,   'cat-income',   'income','Wife transfer'),
  jt('s1-9',  '2025-12-15', 'Playa Bowls — Fulshear TX',        -13.53,   'cat-dining',   'want'),
  jt('s1-10', '2025-12-15', 'Electricity — Frontier',           -220.36,  'cat-utilities','need'),
  jt('s1-11', '2025-12-16', 'Bailey — Zelle Transfer',          +600.00,  'cat-income',   'income','Wife transfer'),
  jt('s1-12', '2025-12-16', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s1-13', '2025-12-16', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s1-14', '2025-12-18', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s1-15', '2025-12-18', 'Internet/Cable — Xfinity',         -237.85,  'cat-subscriptions','want'),
  jt('s1-16', '2025-12-19', 'Adam — Optum Payroll (Job 2)',      +1800.00, 'cat-income',   'income','Bi-weekly paycheck'),
  jt('s1-17', '2025-12-19', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s1-18', '2025-12-22', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s1-19', '2025-12-23', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s1-20', '2025-12-23', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s1-21', '2025-12-29', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s1-22', '2025-12-30', 'EZTag Tolls — HCTRA',              -12.22,   'cat-tolls',    'need'),
  jt('s1-23', '2025-12-30', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s1-24', '2025-12-31', 'Bailey — Zelle Transfer',          +3100.00, 'cat-income',   'income','Wife monthly transfer'),
  jt('s1-25', '2025-12-31', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s1-26', '2025-12-31', 'Auto Loan — PNC Lending',          -817.95,  'cat-transport','need','Monthly auto loan'),
  jt('s1-27', '2025-12-31', 'Water & Sewer — City of Fulshear', -178.45,  'cat-utilities','need'),
  jt('s1-28', '2025-12-31', 'Rent — Rhino Custom Builds',       -3750.00, 'cat-housing',  'need','Monthly rent'),

  // ── JANUARY 2026 ───────────────────────────────────────────
  jt('s2-1',  '2026-01-02', 'Adam — Optum Payroll (Job 2)',      +1800.00, 'cat-income',   'income','Bi-weekly paycheck'),
  jt('s2-2',  '2026-01-02', 'Bailey — Zelle Transfer',          +500.00,  'cat-income',   'income','Wife transfer'),
  jt('s2-3',  '2026-01-07', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-4',  '2026-01-12', 'Storage Unit — CubeSmart',         -133.00,  'cat-storage',  'need'),
  jt('s2-5',  '2026-01-12', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-6',  '2026-01-13', 'Auto Insurance — Mercury',         -440.56,  'cat-transport','need'),
  jt('s2-7',  '2026-01-13', 'Renters Insurance — Mercury',      -27.88,   'cat-housing',  'need'),
  jt('s2-8',  '2026-01-13', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-9',  '2026-01-13', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-10', '2026-01-14', 'Natural Gas — CenterPoint',        -106.69,  'cat-utilities','need'),
  jt('s2-11', '2026-01-14', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-12', '2026-01-15', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-13', '2026-01-16', 'Adam — Optum Payroll (Job 2)',      +1800.00, 'cat-income',   'income','Bi-weekly paycheck'),
  jt('s2-14', '2026-01-16', 'Savings — Brokerage Transfer',     -1000.00, 'cat-savings',  'need','Monthly investment'),
  jt('s2-15', '2026-01-20', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-16', '2026-01-20', 'Electricity — Frontier',           -200.71,  'cat-utilities','need'),
  jt('s2-17', '2026-01-20', 'Internet/Cable — Xfinity',         -100.53,  'cat-subscriptions','want'),
  jt('s2-18', '2026-01-21', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-19', '2026-01-21', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-20', '2026-01-22', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-21', '2026-01-22', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-22', '2026-01-26', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-23', '2026-01-27', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-24', '2026-01-28', 'EZTag Tolls — HCTRA',              -11.31,   'cat-tolls',    'need'),
  jt('s2-25', '2026-01-29', 'EZTag Tolls — HCTRA',              -10.06,   'cat-tolls',    'need'),
  jt('s2-26', '2026-01-30', 'Adam — Optum Payroll (Job 2)',      +1800.00, 'cat-income',   'income','Bi-weekly paycheck'),
  jt('s2-27', '2026-02-02', 'Bailey — Zelle Transfer',          +3100.00, 'cat-income',   'income','Wife monthly transfer'),
  jt('s2-28', '2026-02-02', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-29', '2026-02-02', 'Rent — Rhino Custom Builds',       -3750.00, 'cat-housing',  'need','Monthly rent'),
  jt('s2-30', '2026-02-02', 'Auto Loan — PNC Lending',          -817.95,  'cat-transport','need'),
  jt('s2-31', '2026-02-02', 'Water & Sewer — City of Fulshear', -170.13,  'cat-utilities','need'),
  jt('s2-32', '2026-02-03', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-33', '2026-02-04', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-34', '2026-02-05', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s2-35', '2026-02-06', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),

  // ── MARCH 2026 ─────────────────────────────────────────────
  jt('s3-1',  '2026-03-10', 'Storage Unit — CubeSmart',         -160.00,  'cat-storage',  'need'),
  jt('s3-2',  '2026-03-12', 'Auto Insurance — Mercury',         -440.56,  'cat-transport','need'),
  jt('s3-3',  '2026-03-12', 'Renters Insurance — Mercury',      -27.88,   'cat-housing',  'need'),
  jt('s3-4',  '2026-03-13', 'Adam — Optum Payroll (Job 2)',      +1800.00, 'cat-income',   'income'),
  jt('s3-5',  '2026-03-13', 'Bailey — Zelle Transfer',          +1000.00, 'cat-income',   'income'),
  jt('s3-6',  '2026-03-13', 'Savings — Brokerage Transfer',     -1000.00, 'cat-savings',  'need'),
  jt('s3-7',  '2026-03-17', 'Natural Gas — CenterPoint',        -142.87,  'cat-utilities','need'),
  jt('s3-8',  '2026-03-17', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s3-9',  '2026-03-17', 'Internet/Cable — Xfinity',         -100.53,  'cat-subscriptions','want'),
  jt('s3-10', '2026-03-19', 'Electricity — Frontier',           -207.20,  'cat-utilities','need'),
  jt('s3-11', '2026-03-20', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s3-12', '2026-03-27', 'Adam — Optum Payroll (Job 2)',      +1800.00, 'cat-income',   'income'),
  jt('s3-13', '2026-03-31', 'Bailey — Zelle Transfer',          +3100.00, 'cat-income',   'income','Wife monthly transfer'),
  jt('s3-14', '2026-03-31', 'Auto Loan — PNC Lending',          -817.95,  'cat-transport','need'),
  jt('s3-15', '2026-03-31', 'Water & Sewer — City of Fulshear', -70.50,   'cat-utilities','need'),
  jt('s3-16', '2026-03-31', 'Rent — Rhino Custom Builds',       -3750.00, 'cat-housing',  'need','Monthly rent'),

  // ── APRIL 2026 ─────────────────────────────────────────────
  jt('s4-1',  '2026-04-09', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s4-2',  '2026-04-10', 'Adam — Optum Payroll (Job 2)',      +1800.00, 'cat-income',   'income'),
  jt('s4-3',  '2026-04-10', 'Storage Unit — CubeSmart',         -160.00,  'cat-storage',  'need'),
  jt('s4-4',  '2026-04-13', 'Auto Insurance — Mercury',         -440.55,  'cat-transport','need'),
  jt('s4-5',  '2026-04-13', 'Renters Insurance — Mercury',      -27.87,   'cat-housing',  'need'),
  jt('s4-6',  '2026-04-14', 'Check Deposit',                    +399.22,  'cat-income',   'income','Remote deposit'),
  jt('s4-7',  '2026-04-15', 'Medical — HCA Houston',            -712.00,  'cat-health',   'need','Hospital payment'),
  jt('s4-8',  '2026-04-15', 'Natural Gas — CenterPoint',        -66.45,   'cat-utilities','need'),
  jt('s4-9',  '2026-04-17', 'Internet/Cable — Xfinity',         -100.53,  'cat-subscriptions','want'),
  jt('s4-10', '2026-04-20', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s4-11', '2026-04-20', 'Electricity — Frontier',           -148.62,  'cat-utilities','need'),
  jt('s4-12', '2026-04-21', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s4-13', '2026-04-24', 'Adam — Optum Payroll (Job 2)',      +1800.00, 'cat-income',   'income'),
  jt('s4-14', '2026-04-29', 'Auto Loan — PNC Lending',          -817.95,  'cat-transport','need'),
  jt('s4-15', '2026-04-30', 'Bailey — Zelle Transfer',          +3100.00, 'cat-income',   'income','Wife monthly transfer'),
  jt('s4-16', '2026-04-30', 'Rent — Rhino Custom Builds',       -3750.00, 'cat-housing',  'need','Monthly rent'),
  jt('s4-17', '2026-05-01', 'Water & Sewer — City of Fulshear', -61.40,   'cat-utilities','need'),
  jt('s4-18', '2026-05-05', 'EZTag Tolls — HCTRA',              -10.00,   'cat-tolls',    'need'),
  jt('s4-19', '2026-05-08', 'Adam — Optum Payroll (Job 2)',      +1800.00, 'cat-income',   'income'),
];

// ── Budget Allocations — based on real spending ──────────────
// Using April 2026 as the reference month for current budget
export const SEED_BUDGET: BudgetAllocation[] = [
  { id:'ba1', contextId:'ctx-joint', month:'2026-05', categoryId:'cat-housing',      allocated:3800,  rollover:0 },
  { id:'ba2', contextId:'ctx-joint', month:'2026-05', categoryId:'cat-transport',    allocated:1300,  rollover:0 },
  { id:'ba3', contextId:'ctx-joint', month:'2026-05', categoryId:'cat-tolls',        allocated:150,   rollover:0 },
  { id:'ba4', contextId:'ctx-joint', month:'2026-05', categoryId:'cat-utilities',    allocated:420,   rollover:0 },
  { id:'ba5', contextId:'ctx-joint', month:'2026-05', categoryId:'cat-subscriptions',allocated:110,   rollover:0 },
  { id:'ba6', contextId:'ctx-joint', month:'2026-05', categoryId:'cat-storage',      allocated:160,   rollover:0 },
  { id:'ba7', contextId:'ctx-joint', month:'2026-05', categoryId:'cat-health',       allocated:200,   rollover:0 },
  { id:'ba8', contextId:'ctx-joint', month:'2026-05', categoryId:'cat-dining',       allocated:200,   rollover:0 },
  { id:'ba9', contextId:'ctx-joint', month:'2026-05', categoryId:'cat-groceries',    allocated:600,   rollover:0 },
  { id:'ba10',contextId:'ctx-joint', month:'2026-05', categoryId:'cat-savings',      allocated:1000,  rollover:0 },
  { id:'ba11',contextId:'ctx-joint', month:'2026-05', categoryId:'cat-childcare',    allocated:400,   rollover:0 },
];

// ── Goals ─────────────────────────────────────────────────────
export const SEED_GOALS: SavingsGoal[] = [
  { id:'g1', contextId:'ctx-joint', name:'Emergency Fund',    targetAmount:15000, currentAmount:10800, targetDate:'2026-08-01', monthlyContribution:500, note:'3–6 months expenses', color:'#22C55E', contributions:[{id:'gc1',goalId:'g1',contributedBy:'user-adam',date:'2026-05-01',amount:500}] },
  { id:'g2', contextId:'ctx-joint', name:'Baby College Fund', targetAmount:50000, currentAmount:9000,  targetDate:'2030-01-01', monthlyContribution:400, note:'529 Plan',             color:'#0EA5A0', contributions:[{id:'gc2',goalId:'g2',contributedBy:'user-adam',date:'2026-05-01',amount:400}] },
  { id:'g3', contextId:'ctx-joint', name:'Vacation 2026',     targetAmount:4500,  currentAmount:2025,  targetDate:'2026-11-01', monthlyContribution:350, note:'Family trip',          color:'#F59E0B', contributions:[{id:'gc3',goalId:'g3',contributedBy:'user-bailey',date:'2026-05-01',amount:350}] },
];

// ── Debts — PNC auto loan is real from statements ─────────────
export const SEED_DEBTS: Debt[] = [
  {
    id:'debt-pnc', contextId:'ctx-joint', name:'Auto Loan — PNC',
    type:'auto', currentBalance:18500, originalBalance:32000,
    apr:0.0699, minimumPayment:817.95, dueDate:31,
    startDate:'2021-03-01', isActive:true, payments:[],
    note:'Hyundai Palisade — $817.95/mo fixed',
  },
  {
    id:'debt-cc1', contextId:'ctx-joint', name:'Credit Card',
    type:'credit_card', currentBalance:2400, originalBalance:2400,
    apr:0.2190, minimumPayment:60, dueDate:15,
    startDate:'2026-01-01', isActive:true, payments:[],
  },
];

// ── Bank Statements (from Chase #8891) ────────────────────────
import { BankStatement } from '@/types';
export const SEED_STATEMENTS: BankStatement[] = [
  { id:'stmt-1', contextId:'ctx-joint', accountName:'Chase Premier Plus Checking', accountNumberLast4:'8891', institution:'JPMorgan Chase', statementStart:'2025-12-09', statementEnd:'2026-01-09', openingBalance:15703.48, closingBalance:17540.08, totalDeposits:7913.67, totalWithdrawals:6077.07, importedAt:'2026-05-31T00:00:00Z', importedBy:'user-adam', transactionIds:[] },
  { id:'stmt-2', contextId:'ctx-joint', accountName:'Chase Premier Plus Checking', accountNumberLast4:'8891', institution:'JPMorgan Chase', statementStart:'2026-01-10', statementEnd:'2026-02-09', openingBalance:17540.08, closingBalance:18301.41, totalDeposits:7700.15, totalWithdrawals:6938.82, importedAt:'2026-05-31T00:00:00Z', importedBy:'user-adam', transactionIds:[] },
  { id:'stmt-3', contextId:'ctx-joint', accountName:'Chase Premier Plus Checking', accountNumberLast4:'8891', institution:'JPMorgan Chase', statementStart:'2026-03-10', statementEnd:'2026-04-08', openingBalance:17594.84, closingBalance:18557.50, totalDeposits:7700.15, totalWithdrawals:6737.49, importedAt:'2026-05-31T00:00:00Z', importedBy:'user-adam', transactionIds:[] },
  { id:'stmt-4', contextId:'ctx-joint', accountName:'Chase Premier Plus Checking', accountNumberLast4:'8891', institution:'JPMorgan Chase', statementStart:'2026-04-09', statementEnd:'2026-05-08', openingBalance:18557.50, closingBalance:21131.51, totalDeposits:8899.38, totalWithdrawals:6325.37, importedAt:'2026-05-31T00:00:00Z', importedBy:'user-adam', transactionIds:[] },
];
