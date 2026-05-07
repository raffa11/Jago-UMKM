import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Transaction, UserProfile, TransactionType } from '../types';
import { formatCurrency } from '../lib/utils';
import { startOfMonth, endOfMonth, isWithinInterval, format, subMonths } from 'date-fns';
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity } from 'lucide-react';

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

  const NEON_COLORS = ['#39FF14', '#CCFF00', '#00FFF0', '#FF007F', '#BC13FE', '#FFFB1D'];

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
    <div className="section-container">
      <header className="flex justify-between items-end px-1">
        <div>
          <p className="text-label mb-0.5">Business intel</p>
          <h1 className="text-neon-lime">Dinamika cabang</h1>
        </div>
        <Activity className="w-8 h-8 text-white/10" />
      </header>

      {/* Monthly Expense Breakdown */}
      <div className="card-fintech group">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-neon-lime" />
                <h3 className="text-label">Distribusi biaya bulan ini</h3>
            </div>
            
            <div className="h-[240px] w-full">
            {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    >
                    {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={NEON_COLORS[index % NEON_COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value: number) => formatCurrency(value, profile.currency)}
                        contentStyle={{ 
                            backgroundColor: '#0A0A0B', 
                            borderRadius: '12px', 
                            border: '1px solid rgba(255,255,255,0.05)',
                            padding: '8px 12px',
                            fontSize: '12px', 
                            fontWeight: '600',
                            color: '#fff'
                        }}
                    />
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/5 space-y-4">
                    <PieIcon className="w-12 h-12" />
                    <p className="text-caption">Belum ada data pengeluaran</p>
                </div>
            )}
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
            {categoryData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: NEON_COLORS[i % NEON_COLORS.length] }} />
                <div className="flex flex-col min-w-0">
                    <span className="text-label text-white/40 truncate">{item.name}</span>
                    <span className="text-sm font-bold text-white leading-tight">{formatCurrency(item.value, profile.currency)}</span>
                </div>
                </div>
            ))}
            </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="card-fintech group">
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 rounded-full bg-neon-lime" />
                <h3 className="text-label">Momentum finansial (6 bulan terakhir)</h3>
            </div>

            <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: '500', fill: 'rgba(255,255,255,0.2)' }} 
                />
                <YAxis hide />
                <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ 
                        backgroundColor: '#0A0A0B', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: '600'
                    }}
                />
                <Bar name="Pendapatan" dataKey="income" fill="#39FF14" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar name="Pengeluaran" dataKey="expense" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
}
