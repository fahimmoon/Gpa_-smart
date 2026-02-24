import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, Plus, Trash2, TrendingUp, TrendingDown, 
  Coffee, Car, Book, Gamepad2, Zap, Home, MoreHorizontal,
  PieChart, Calendar, Banknote, ChevronLeft, ChevronRight,
  Target, ArrowUpCircle, ArrowDownCircle, Repeat, Sparkles,
  AlertTriangle, CheckCircle, BarChart3, Filter, Download
} from 'lucide-react';
import clsx from 'clsx';
import { MonthlyBudget, Expense, ExpenseCategory, Income, IncomeSource } from '../types';

interface EnhancedBudgetTrackerProps {
  budgets: MonthlyBudget[];
  onAddBudget: (month: string, totalBudget: number) => void;
  onAddExpense: (budgetId: string, expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (budgetId: string, expenseId: string) => void;
  onUpdateBudget: (budgetId: string, totalBudget: number) => void;
  onAddIncome?: (budgetId: string, income: Omit<Income, 'id'>) => void;
  onDeleteIncome?: (budgetId: string, incomeId: string) => void;
}

const CATEGORY_CONFIG: Record<ExpenseCategory, { icon: typeof Coffee; color: string; label: string; budget?: number }> = {
  food: { icon: Coffee, color: 'text-orange-400 bg-orange-900/30', label: 'Food & Dining' },
  transport: { icon: Car, color: 'text-blue-400 bg-blue-900/30', label: 'Transport' },
  books: { icon: Book, color: 'text-emerald-400 bg-emerald-900/30', label: 'Books & Supplies' },
  entertainment: { icon: Gamepad2, color: 'text-purple-400 bg-purple-900/30', label: 'Entertainment' },
  utilities: { icon: Zap, color: 'text-yellow-400 bg-yellow-900/30', label: 'Utilities' },
  rent: { icon: Home, color: 'text-pink-400 bg-pink-900/30', label: 'Rent & Housing' },
  other: { icon: MoreHorizontal, color: 'text-slate-400 bg-slate-700', label: 'Other' },
};

const INCOME_CONFIG: Record<IncomeSource, { icon: typeof Banknote; color: string; label: string }> = {
  allowance: { icon: Wallet, color: 'text-emerald-400 bg-emerald-900/30', label: 'Allowance' },
  parttime: { icon: ArrowUpCircle, color: 'text-blue-400 bg-blue-900/30', label: 'Part-time Job' },
  scholarship: { icon: Sparkles, color: 'text-amber-400 bg-amber-900/30', label: 'Scholarship' },
  freelance: { icon: Target, color: 'text-violet-400 bg-violet-900/30', label: 'Freelance' },
  gift: { icon: ArrowUpCircle, color: 'text-pink-400 bg-pink-900/30', label: 'Gift' },
  other: { icon: MoreHorizontal, color: 'text-slate-400 bg-slate-700', label: 'Other' },
};

const QUICK_EXPENSES = [
  { label: 'Coffee', category: 'food' as ExpenseCategory, amount: 150 },
  { label: 'Lunch', category: 'food' as ExpenseCategory, amount: 350 },
  { label: 'Bus', category: 'transport' as ExpenseCategory, amount: 50 },
  { label: 'Snack', category: 'food' as ExpenseCategory, amount: 100 },
];

type ViewMode = 'overview' | 'expenses' | 'income' | 'analytics';

export default function EnhancedBudgetTracker({ 
  budgets, 
  onAddBudget, 
  onAddExpense, 
  onDeleteExpense,
  onUpdateBudget,
  onAddIncome,
  onDeleteIncome
}: EnhancedBudgetTrackerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [savingsGoal, setSavingsGoal] = useState(10000);
  
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'food' as ExpenseCategory,
    description: '',
  });

  const [newIncome, setNewIncome] = useState({
    amount: '',
    source: 'allowance' as IncomeSource,
    description: '',
  });

  const currentBudget = budgets.find(b => b.month === currentMonth);
  
  // Calculations
  const totalSpent = useMemo(() => 
    currentBudget?.expenses.reduce((sum, e) => sum + e.amount, 0) || 0
  , [currentBudget]);

  const totalIncome = useMemo(() => 
    currentBudget?.incomes?.reduce((sum, i) => sum + i.amount, 0) || 0
  , [currentBudget]);

  const remaining = (currentBudget?.totalBudget || 0) - totalSpent;
  const percentUsed = currentBudget ? (totalSpent / currentBudget.totalBudget) * 100 : 0;
  const netSavings = totalIncome - totalSpent;
  const savingsProgress = savingsGoal > 0 ? (Math.max(0, netSavings) / savingsGoal) * 100 : 0;

  // Daily budget calculations
  const daysInMonth = new Date(parseInt(currentMonth.split('-')[0]), parseInt(currentMonth.split('-')[1]), 0).getDate();
  const today = new Date();
  const currentDay = currentMonth === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}` 
    ? today.getDate() 
    : daysInMonth;
  const dailyBudget = (currentBudget?.totalBudget || 0) / daysInMonth;
  const idealSpentByNow = dailyBudget * currentDay;
  const spendingStatus = totalSpent <= idealSpentByNow ? 'on-track' : 'over';

  // Expense trends (last 7 days)
  const last7DaysExpenses = useMemo(() => {
    if (!currentBudget) return [];
    const now = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
    
    return days.map(day => ({
      date: day,
      amount: currentBudget.expenses
        .filter(e => e.date.split('T')[0] === day)
        .reduce((sum, e) => sum + e.amount, 0)
    }));
  }, [currentBudget]);

  const maxDailySpend = Math.max(...last7DaysExpenses.map(d => d.amount), 1);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    if (!currentBudget) return [];
    const expenses = [...currentBudget.expenses].reverse();
    if (categoryFilter === 'all') return expenses;
    return expenses.filter(e => e.category === categoryFilter);
  }, [currentBudget, categoryFilter]);

  // Category breakdown
  const categoryTotals = useMemo(() => {
    if (!currentBudget) return [];
    const byCategory = currentBudget.expenses.reduce((acc, e) => {
      if (!acc[e.category]) acc[e.category] = [];
      acc[e.category].push(e);
      return acc;
    }, {} as Record<ExpenseCategory, Expense[]>);
    
    return Object.entries(byCategory).map(([cat, exps]) => ({
      category: cat as ExpenseCategory,
      total: exps.reduce((sum, e) => sum + e.amount, 0),
      count: exps.length,
    })).sort((a, b) => b.total - a.total);
  }, [currentBudget]);

  // Navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + (direction === 'next' ? 1 : -1));
    setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleSetBudget = () => {
    const amount = parseFloat(budgetInput);
    if (amount > 0) {
      if (currentBudget) {
        onUpdateBudget(currentBudget.id, amount);
      } else {
        onAddBudget(currentMonth, amount);
      }
      setEditingBudget(false);
      setBudgetInput('');
    }
  };

  const handleAddExpense = () => {
    const amount = parseFloat(newExpense.amount);
    if (amount > 0 && currentBudget) {
      onAddExpense(currentBudget.id, {
        amount,
        category: newExpense.category,
        description: newExpense.description || CATEGORY_CONFIG[newExpense.category].label,
        date: new Date().toISOString(),
      });
      setNewExpense({ amount: '', category: 'food', description: '' });
      setShowAddExpense(false);
    }
  };

  const handleQuickExpense = (item: typeof QUICK_EXPENSES[0]) => {
    if (currentBudget) {
      onAddExpense(currentBudget.id, {
        amount: item.amount,
        category: item.category,
        description: item.label,
        date: new Date().toISOString(),
      });
    }
  };

  const handleAddIncome = () => {
    const amount = parseFloat(newIncome.amount);
    if (amount > 0 && currentBudget && onAddIncome) {
      onAddIncome(currentBudget.id, {
        amount,
        source: newIncome.source,
        description: newIncome.description || INCOME_CONFIG[newIncome.source].label,
        date: new Date().toISOString(),
      });
      setNewIncome({ amount: '', source: 'allowance', description: '' });
      setShowAddIncome(false);
    }
  };

  const exportData = () => {
    if (!currentBudget) return;
    const csvContent = [
      'Date,Type,Category,Description,Amount',
      ...currentBudget.expenses.map(e => 
        `${e.date.split('T')[0]},Expense,${e.category},${e.description},${e.amount}`
      ),
      ...(currentBudget.incomes || []).map(i => 
        `${i.date.split('T')[0]},Income,${i.source},${i.description},${i.amount}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget_${currentMonth}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5">
      {/* Header with Month Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="text-emerald-400" size={20} />
            <h3 className="text-lg font-bold">{formatMonth(currentMonth)}</h3>
          </div>
          <button 
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {currentBudget && (
          <button
            onClick={exportData}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Download size={16} />
            Export
          </button>
        )}
      </motion.div>

      {/* View Mode Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {(['overview', 'expenses', 'income', 'analytics'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
              viewMode === mode 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:text-white'
            )}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* No Budget State */}
      {!currentBudget && !editingBudget && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="gpa-card text-center py-12"
        >
          <Wallet size={48} className="mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400 mb-4">No budget set for {formatMonth(currentMonth)}</p>
          <button
            onClick={() => setEditingBudget(true)}
            className="btn-primary"
          >
            <Plus size={16} /> Set Budget
          </button>
        </motion.div>
      )}

      {/* Budget Setup */}
      {editingBudget && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="gpa-card"
        >
          <h4 className="font-bold mb-4">Set Monthly Budget</h4>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="Enter budget amount..."
                className="input-field pl-10 w-full"
                autoFocus
              />
            </div>
            <button onClick={handleSetBudget} className="btn-primary">Save</button>
            <button onClick={() => setEditingBudget(false)} className="btn-secondary">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Overview View */}
      {currentBudget && viewMode === 'overview' && (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="gpa-card text-center"
            >
              <p className="text-xs text-slate-400 mb-1">Budget</p>
              <p className="text-xl font-black">Rs. {currentBudget.totalBudget.toLocaleString()}</p>
              <button
                onClick={() => {
                  setBudgetInput(currentBudget.totalBudget.toString());
                  setEditingBudget(true);
                }}
                className="text-xs text-emerald-400 mt-1"
              >
                Edit
              </button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="gpa-card text-center"
            >
              <p className="text-xs text-slate-400 mb-1">Spent</p>
              <p className="text-xl font-black text-red-400">Rs. {totalSpent.toLocaleString()}</p>
              <p className="text-xs text-slate-500">{currentBudget.expenses.length} items</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="gpa-card text-center"
            >
              <p className="text-xs text-slate-400 mb-1">Remaining</p>
              <p className={clsx("text-xl font-black", remaining >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                Rs. {Math.abs(remaining).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">{remaining < 0 ? 'Over budget' : 'Left'}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="gpa-card text-center"
            >
              <p className="text-xs text-slate-400 mb-1">Daily Budget</p>
              <p className="text-xl font-black text-blue-400">Rs. {dailyBudget.toFixed(0)}</p>
              <div className={clsx("flex items-center justify-center gap-1 text-xs mt-1", 
                spendingStatus === 'on-track' ? 'text-emerald-400' : 'text-amber-400'
              )}>
                {spendingStatus === 'on-track' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                {spendingStatus === 'on-track' ? 'On Track' : 'Over Pace'}
              </div>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="gpa-card"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Budget Usage</span>
              <span className={clsx(
                "text-sm font-bold",
                percentUsed > 100 ? 'text-red-400' : percentUsed > 80 ? 'text-amber-400' : 'text-emerald-400'
              )}>
                {percentUsed.toFixed(1)}%
              </span>
            </div>
            <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentUsed, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={clsx(
                  "h-full rounded-full",
                  percentUsed > 100 ? 'bg-gradient-to-r from-red-500 to-red-400' 
                    : percentUsed > 80 ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                )}
              />
            </div>
            {/* Ideal spending marker */}
            <div className="relative h-2 mt-1">
              <div 
                className="absolute w-0.5 h-3 bg-white/50 rounded"
                style={{ left: `${Math.min((idealSpentByNow / currentBudget.totalBudget) * 100, 100)}%` }}
              />
              <span 
                className="absolute text-[10px] text-slate-400 transform -translate-x-1/2"
                style={{ left: `${Math.min((idealSpentByNow / currentBudget.totalBudget) * 100, 100)}%` }}
              >
                ideal
              </span>
            </div>
          </motion.div>

          {/* Quick Add Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="gpa-card"
          >
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <Zap size={18} className="text-amber-400" />
              Quick Add
            </h4>
            <div className="flex flex-wrap gap-2">
              {QUICK_EXPENSES.map((item, index) => {
                const { icon: Icon, color } = CATEGORY_CONFIG[item.category];
                return (
                  <button
                    key={index}
                    onClick={() => handleQuickExpense(item)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <Icon size={14} className={color.split(' ')[0]} />
                    <span className="text-sm">{item.label}</span>
                    <span className="text-xs text-slate-400">Rs. {item.amount}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 rounded-xl transition-colors"
              >
                <Plus size={14} />
                <span className="text-sm">Custom</span>
              </button>
            </div>
          </motion.div>

          {/* 7-Day Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="gpa-card"
          >
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-violet-400" />
              Last 7 Days
            </h4>
            <div className="flex items-end justify-between gap-2 h-24">
              {last7DaysExpenses.map((day, index) => (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.amount / maxDailySpend) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className={clsx(
                      "w-full rounded-t-lg min-h-[4px]",
                      day.amount > dailyBudget ? 'bg-red-500' : 'bg-emerald-500'
                    )}
                  />
                  <span className="text-[10px] text-slate-400">
                    {new Date(day.date).toLocaleDateString('en', { weekday: 'short' }).charAt(0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>Daily limit: Rs. {dailyBudget.toFixed(0)}</span>
              <span>Avg: Rs. {(last7DaysExpenses.reduce((s, d) => s + d.amount, 0) / 7).toFixed(0)}/day</span>
            </div>
          </motion.div>

          {/* Savings Goal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="gpa-card border-l-4 border-l-violet-500"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold flex items-center gap-2">
                <Target size={18} className="text-violet-400" />
                Savings Goal
              </h4>
              <span className="text-sm font-bold text-violet-400">Rs. {savingsGoal}</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(savingsProgress, 100)}%` }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">
                Net: <span className={netSavings >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  Rs. {netSavings.toLocaleString()}
                </span>
              </span>
              <span className="text-slate-400">{savingsProgress.toFixed(0)}% of goal</span>
            </div>
          </motion.div>
        </>
      )}

      {/* Expenses View */}
      {currentBudget && viewMode === 'expenses' && (
        <>
          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="gpa-card"
          >
            <div className="flex items-center gap-2 mb-3">
              <Filter size={16} className="text-slate-400" />
              <span className="text-sm font-medium">Filter by Category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-sm transition-all",
                  categoryFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                )}
              >
                All
              </button>
              {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map(cat => {
                const { icon: Icon, color, label } = CATEGORY_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={clsx(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all",
                      categoryFilter === cat ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    <Icon size={14} />
                    {label.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Add Expense Button */}
          <button
            onClick={() => setShowAddExpense(true)}
            className="w-full btn-primary justify-center"
          >
            <Plus size={16} /> Add Expense
          </button>

          {/* Expenses List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="gpa-card"
          >
            <h4 className="font-bold mb-4">
              {categoryFilter === 'all' ? 'All Expenses' : CATEGORY_CONFIG[categoryFilter].label}
              <span className="text-slate-400 font-normal ml-2">({filteredExpenses.length})</span>
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredExpenses.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No expenses found</p>
              ) : (
                filteredExpenses.map((expense, index) => {
                  const { icon: Icon, color } = CATEGORY_CONFIG[expense.category];
                  return (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl group"
                    >
                      <div className={clsx("p-2 rounded-lg", color.split(' ')[1])}>
                        <Icon size={14} className={color.split(' ')[0]} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{expense.description}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-bold text-red-400">-Rs. {expense.amount}</p>
                      <button
                        onClick={() => onDeleteExpense(currentBudget.id, expense.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-all"
                        aria-label="Delete expense"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Income View */}
      {currentBudget && viewMode === 'income' && (
        <>
          {/* Income Summary */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="gpa-card text-center border-l-4 border-l-emerald-500"
            >
              <ArrowUpCircle className="mx-auto mb-2 text-emerald-400" size={24} />
              <p className="text-xs text-slate-400">Total Income</p>
              <p className="text-2xl font-black text-emerald-400">Rs. {totalIncome.toLocaleString()}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="gpa-card text-center border-l-4 border-l-violet-500"
            >
              <ArrowDownCircle className="mx-auto mb-2 text-red-400" size={24} />
              <p className="text-xs text-slate-400">Net Balance</p>
              <p className={clsx("text-2xl font-black", netSavings >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                Rs. {netSavings.toLocaleString()}
              </p>
            </motion.div>
          </div>

          <button
            onClick={() => setShowAddIncome(true)}
            className="w-full btn-primary justify-center"
            disabled={!onAddIncome}
          >
            <Plus size={16} /> Add Income
          </button>

          {/* Income List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="gpa-card"
          >
            <h4 className="font-bold mb-4">Income Sources</h4>
            <div className="space-y-2">
              {(currentBudget.incomes || []).length === 0 ? (
                <p className="text-center text-slate-500 py-8">No income recorded</p>
              ) : (
                [...(currentBudget.incomes || [])].reverse().map((income, index) => {
                  const { icon: Icon, color } = INCOME_CONFIG[income.source];
                  return (
                    <motion.div
                      key={income.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl group"
                    >
                      <div className={clsx("p-2 rounded-lg", color.split(' ')[1])}>
                        <Icon size={14} className={color.split(' ')[0]} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{income.description}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(income.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-bold text-emerald-400">+Rs. {income.amount}</p>
                      {onDeleteIncome && (
                        <button
                          onClick={() => onDeleteIncome(currentBudget.id, income.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-all"
                          aria-label="Delete income"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Analytics View */}
      {currentBudget && viewMode === 'analytics' && (
        <>
          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="gpa-card"
          >
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <PieChart size={18} className="text-purple-400" />
              Spending by Category
            </h4>
            <div className="space-y-3">
              {categoryTotals.map(({ category, total, count }, index) => {
                const { icon: Icon, color, label } = CATEGORY_CONFIG[category];
                const percent = totalSpent > 0 ? (total / totalSpent) * 100 : 0;
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className={clsx("p-2 rounded-lg", color.split(' ')[1])}>
                      <Icon size={16} className={color.split(' ')[0]} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{label}</span>
                        <span className="font-bold">Rs. {total.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className={clsx("h-full rounded-full", color.split(' ')[1].replace('/30', ''))}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 w-12 text-right">{percent.toFixed(0)}%</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="gpa-card"
          >
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-amber-400" />
              Insights
            </h4>
            <div className="space-y-3">
              {categoryTotals[0] && (
                <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                  <TrendingUp className="text-amber-400 mt-1" size={18} />
                  <div>
                    <p className="text-sm font-medium">Top Spending Category</p>
                    <p className="text-xs text-slate-400">
                      {CATEGORY_CONFIG[categoryTotals[0].category].label} accounts for{' '}
                      {((categoryTotals[0].total / totalSpent) * 100).toFixed(0)}% of your spending
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                <Target className={clsx("mt-1", spendingStatus === 'on-track' ? 'text-emerald-400' : 'text-amber-400')} size={18} />
                <div>
                  <p className="text-sm font-medium">Spending Pace</p>
                  <p className="text-xs text-slate-400">
                    {spendingStatus === 'on-track' 
                      ? `You're on track! Spent Rs. ${totalSpent} of ideal Rs. ${idealSpentByNow.toFixed(0)} by day ${currentDay}`
                      : `Ahead of pace! Spent Rs. ${totalSpent} vs ideal Rs. ${idealSpentByNow.toFixed(0)} by day ${currentDay}`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl">
                <Calendar className="text-blue-400 mt-1" size={18} />
                <div>
                  <p className="text-sm font-medium">Average Daily Spend</p>
                  <p className="text-xs text-slate-400">
                    Rs. {(totalSpent / currentDay).toFixed(2)} per day • Target: Rs. {dailyBudget.toFixed(2)}/day
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddExpense && currentBudget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddExpense(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6"
            >
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <ArrowDownCircle size={20} className="text-red-400" />
                Add Expense
              </h4>
              <div className="space-y-4">
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Amount..."
                    className="input-field pl-10 w-full text-lg"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(CATEGORY_CONFIG) as ExpenseCategory[]).map(cat => {
                    const { icon: Icon, color, label } = CATEGORY_CONFIG[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => setNewExpense(prev => ({ ...prev, category: cat }))}
                        className={clsx(
                          "p-3 rounded-xl flex flex-col items-center gap-1 transition-all",
                          newExpense.category === cat 
                            ? 'ring-2 ring-emerald-500 bg-slate-800' 
                            : 'bg-slate-800/50 hover:bg-slate-800'
                        )}
                        title={label}
                      >
                        <div className={clsx("p-2 rounded-lg", color.split(' ')[1])}>
                          <Icon size={16} className={color.split(' ')[0]} />
                        </div>
                        <span className="text-[10px] text-slate-400 truncate w-full text-center">
                          {label.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description (optional)..."
                  className="input-field w-full"
                />
                <div className="flex gap-2">
                  <button onClick={handleAddExpense} className="btn-primary flex-1">
                    Add Expense
                  </button>
                  <button onClick={() => setShowAddExpense(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Income Modal */}
      <AnimatePresence>
        {showAddIncome && currentBudget && onAddIncome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddIncome(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6"
            >
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <ArrowUpCircle size={20} className="text-emerald-400" />
                Add Income
              </h4>
              <div className="space-y-4">
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="number"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="Amount..."
                    className="input-field pl-10 w-full text-lg"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(INCOME_CONFIG) as IncomeSource[]).map(source => {
                    const { icon: Icon, color, label } = INCOME_CONFIG[source];
                    return (
                      <button
                        key={source}
                        onClick={() => setNewIncome(prev => ({ ...prev, source }))}
                        className={clsx(
                          "p-3 rounded-xl flex flex-col items-center gap-1 transition-all",
                          newIncome.source === source 
                            ? 'ring-2 ring-emerald-500 bg-slate-800' 
                            : 'bg-slate-800/50 hover:bg-slate-800'
                        )}
                        title={label}
                      >
                        <div className={clsx("p-2 rounded-lg", color.split(' ')[1])}>
                          <Icon size={16} className={color.split(' ')[0]} />
                        </div>
                        <span className="text-[10px] text-slate-400 truncate w-full text-center">
                          {label.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={newIncome.description}
                  onChange={(e) => setNewIncome(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description (optional)..."
                  className="input-field w-full"
                />
                <div className="flex gap-2">
                  <button onClick={handleAddIncome} className="btn-primary flex-1">
                    Add Income
                  </button>
                  <button onClick={() => setShowAddIncome(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
