export type ExpenseCategory = string;

export type IncomeType = 'Salary' | 'Extra';

export interface Income {
  id: string;
  type: IncomeType;
  amount: number;
  description?: string;
  date: string;
  is_recurring?: boolean;
  tags?: string[];
}

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  date: string;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  day_of_month: number;
  description?: string;
  tags?: string[];
}

export interface Debt {
  id: string;
  person_name: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  description?: string;
  due_date?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  is_completed: boolean;
  description?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at?: string;
}

export interface GamificationStats {
  current_streak: number;
  longest_streak: number;
  last_logged_date?: string;
  total_savings_milestones_reached: number;
  achievements: Achievement[];
}

export interface Settings {
  monthly_budget_per_category: Record<ExpenseCategory, number>;
  dark_mode_enabled: boolean;
  recurring_salary_amount?: number;
  recurring_salary_day?: number;
  recurring_salary_enabled?: boolean;
  daily_budget_mode: 'recommended' | 'custom';
  custom_daily_budget?: number;
  has_completed_onboarding: boolean;
  security_pin?: string;
  notifications_enabled?: boolean;
}

export interface FinanceState {
  income: Income[];
  expenses: Expense[];
  debts: Debt[];
  savingsGoals: SavingsGoal[];
  recurringExpenses: RecurringExpense[];
  categories: Category[];
  settings: Settings;
  gamification: GamificationStats;
}
