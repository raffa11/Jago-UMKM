import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Transaction, UserProfile, TransactionType } from '../types';
import { formatCurrency } from '../lib/utils';
import { startOfMonth, endOfMonth, isWithinInterval, format, subMonths } from 'date-fns';

interface ReportsProps {
  transactions: Transaction[];
  profile: UserProfile;
}

export function Reports({ transactions, profile }: ReportsProps) {
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthTransactions = transactions.filter(t => 
    isWithinInterval(t.date.toDate(), { start: monthStart, end: monthEnd })
  );

  const categoryData = monthTransactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc: any[], t) => {
      const existing = acc.find(item => item.name === t.category);
      if (existing) {
        existing.value += t.amount;
      } else {
        acc.push({ name: t.category, value: t.amount });
      }
      return acc;
    }, []);

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  // Last 6 months trend data (simplified)
  const trendData = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const mStart = startOfMonth(d);
    const mEnd = endOfMonth(d);
    const mtxs = transactions.filter(t => isWithinInterval(t.date.toDate(), { start: mStart, end: mEnd }));
    
    return {
      name: format(d, 'MMM'),
      income: mtxs.filter(t => t.type === TransactionType.INCOME).reduce((a, b) => a + b.amount, 0),
      expense: mtxs.filter(t => t.type === TransactionType.EXPENSE).reduce((a, b) => a + b.amount, 0),
    };
  });

  return (
    <div className="px-6 pb-12">
      <header className="mb-8">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Analytics</h2>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Performance</h1>
      </header>

      {/* Monthly Expense Breakdown */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-8">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Expense Breakdown (This Month)</h4>
        <div className="h-[240px] w-full">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value, profile.currency)}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-widest">
              Not enough data
            </div>
          )}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-y-3">
          {categoryData.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{item.name}</span>
                <span className="text-[9px] font-bold text-slate-400">{formatCurrency(item.value, profile.currency)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Income vs Expense Trend</h4>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} 
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
              />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={8} />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
