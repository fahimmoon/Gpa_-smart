import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, Plus, Trash2, TrendingUp, TrendingDown, 
  Coffee, Car, Book, Gamepad2, Zap, Home, MoreHorizontal,
  PieChart, Calendar, Banknote, ChevronLeft, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { MonthlyBudget, Expense, ExpenseCategory } from '../types';

interface BudgetTrackerProps {
  budgets: MonthlyBudget[];
  onAddBudget: (month: string, totalBudget: number) => void;
  onAddExpense: (budgetId: string, expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (budgetId: string, expenseId: string) => void;
  onUpdateBudget: (budgetId: string, totalBudget: number) => void;
}

const CATEGORY_CONFIG: Record<ExpenseCategory, { icon: typeof Coffee; color: string; label: string }> = {
  food: { icon: Coffee, color: 'text-orange-400 bg-orange-900/30', label: 'Food & Dining' },
  transport: { icon: Car, color: 'text-blue-400 bg-blue-900/30', label: 'Transport' },
  books: { icon: Book, color: 'text-emerald-400 bg-emerald-900/30', label: 'Books & Supplies' },
  entertainment: { icon: Gamepad2, color: 'text-purple-400 bg-purple-900/30', label: 'Entertainment' },
  utilities: { icon: Zap, color: 'text-yellow-400 bg-yellow-900/30', label: 'Utilities' },
  rent: { icon: Home, color: 'text-pink-400 bg-pink-900/30', label: 'Rent & Housing' },
  other: { icon: MoreHorizontal, color: 'text-slate-400 bg-slate-700', label: 'Other' },
};

export default function BudgetTracker({ 
  budgets, 
  onAddBudget, 
  onAddExpense, 
  onDeleteExpense,
  onUpdateBudget 
}: BudgetTrackerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'food' as ExpenseCategory,
    description: '',
  });
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  const currentBudget = budgets.find(b => b.month === currentMonth);
  const totalSpent = currentBudget?.expenses.reduce((sum, e) => sum + e.amount, 0) || 0;
  const remaining = (currentBudget?.totalBudget || 0) - totalSpent;
  const percentUsed = currentBudget ? (totalSpent / currentBudget.totalBudget) * 100 : 0;

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

  // Group expenses by category
  const expensesByCategory = currentBudget?.expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) acc[expense.category] = [];
    acc[expense.category].push(expense);
    return acc;
  }, {} as Record<ExpenseCategory, Expense[]>) || {};

  const categoryTotals = Object.entries(expensesByCategory).map(([cat, exps]) => ({
    category: cat as ExpenseCategory,
    total: exps.reduce((sum, e) => sum + e.amount, 0),
    count: exps.length,
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-5">
      {/* Month Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <button 
          onClick={() => navigateMonth('prev')}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
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
        >
          <ChevronRight size={20} />
        </button>
      </motion.div>

      {/* Budget Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="gpa-card overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-900/30 rounded-xl">
              <Wallet size={20} className="text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold">Monthly Budget</h4>
              {currentBudget && (
                <p className="text-xs text-slate-400">
                  {currentBudget.expenses.length} transactions
                </p>
              )}
            </div>
          </div>
          {currentBudget && !editingBudget && (
            <button
              onClick={() => {
                setBudgetInput(currentBudget.totalBudget.toString());
                setEditingBudget(true);
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300"
            >
              Edit
            </button>
          )}
        </div>

        {!currentBudget && !editingBudget ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="text-slate-400 mb-4">No budget set for this month</p>
            <button
              onClick={() => setEditingBudget(true)}
              className="btn-primary"
            >
              <Plus size={16} /> Set Budget
            </button>
          </motion.div>
        ) : editingBudget ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="Enter monthly budget..."
                  className="input-field pl-10 w-full"
                  autoFocus
                />
              </div>
              <button onClick={handleSetBudget} className="btn-primary">
                Save
              </button>
              <button 
                onClick={() => setEditingBudget(false)} 
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Budget Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Budget</p>
                <p className="text-lg font-black text-white">
                  Rs. {currentBudget?.totalBudget.toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Spent</p>
                <p className="text-lg font-black text-red-400">
                  Rs. {totalSpent.toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Remaining</p>
                <p className={clsx(
                  "text-lg font-black",
                  remaining >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  Rs. {Math.abs(remaining).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Usage</span>
                <span className={clsx(
                  "font-bold",
                  percentUsed > 100 ? 'text-red-400' : percentUsed > 80 ? 'text-amber-400' : 'text-emerald-400'
                )}>
                  {percentUsed.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentUsed, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={clsx(
                    "h-full rounded-full",
                    percentUsed > 100 
                      ? 'bg-gradient-to-r from-red-500 to-red-400' 
                      : percentUsed > 80 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  )}
                />
              </div>
              {percentUsed > 100 && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-400 mt-1 flex items-center gap-1"
                >
                  <TrendingDown size={12} /> Over budget by Rs. {Math.abs(remaining).toLocaleString()}
                </motion.p>
              )}
            </div>

            {/* Add Expense Button */}
            <button
              onClick={() => setShowAddExpense(true)}
              className="w-full btn-primary justify-center"
            >
              <Plus size={16} /> Add Expense
            </button>
          </>
        )}
      </motion.div>

      {/* Add Expense Form */}
      <AnimatePresence>
        {showAddExpense && currentBudget && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="gpa-card overflow-hidden"
          >
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Plus size={18} className="text-emerald-400" />
              New Expense
            </h4>
            <div className="space-y-3">
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Amount..."
                  className="input-field pl-10 w-full"
                />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
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
                        <Icon size={18} className={color.split(' ')[0]} />
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
                <button 
                  onClick={() => setShowAddExpense(false)} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Breakdown */}
      {currentBudget && categoryTotals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="gpa-card"
        >
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <PieChart size={18} className="text-purple-400" />
            Spending by Category
          </h4>
          <div className="space-y-3">
            {categoryTotals.map(({ category, total, count }, index) => {
              const { icon: Icon, color, label } = CATEGORY_CONFIG[category];
              const percent = (total / totalSpent) * 100;
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
                  <span className="text-xs text-slate-400">{count}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent Expenses */}
      {currentBudget && currentBudget.expenses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="gpa-card"
        >
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" />
            Recent Expenses
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...currentBudget.expenses].reverse().map((expense, index) => {
              const { icon: Icon, color } = CATEGORY_CONFIG[expense.category];
              return (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
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
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
