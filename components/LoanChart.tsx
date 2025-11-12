import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AmortizationPeriod } from '../types';

interface LoanChartProps {
  schedule: AmortizationPeriod[];
  scheduleB?: AmortizationPeriod[];
}

const LoanChart: React.FC<LoanChartProps> = ({ schedule, scheduleB }) => {
  if (schedule.length === 0) {
    return null;
  }

  // Ensure data aligns correctly, even if schedules have different lengths
  const maxLength = Math.max(schedule.length, scheduleB?.length || 0);
  const combinedData = Array.from({ length: maxLength }, (_, i) => {
    const periodA = schedule[i];
    const periodB = scheduleB ? scheduleB[i] : undefined;

    return {
      period: periodA?.period || periodB?.period || i + 1,
      balanceA: periodA?.remainingBalance,
      balanceB: periodB?.remainingBalance,
    };
  });

  // Calculate a dynamic interval for the X-axis to avoid label clutter
  const xAxisInterval = Math.max(0, Math.floor(maxLength / 15));

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl mt-8">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Loan Balance Over Time</h2>
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <AreaChart
                    data={combinedData}
                    margin={{
                        top: 10, right: 30, left: 20, bottom: 20,
                    }}
                >
                    <defs>
                        <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis 
                        dataKey="period" 
                        stroke="#94a3b8" 
                        label={{ value: 'Payment Period', position: 'insideBottom', offset: -15, fill: '#94a3b8' }}
                        interval={xAxisInterval}
                    />
                    <YAxis 
                        stroke="#94a3b8" 
                        tickFormatter={(value) => `$${(Number(value) / 1000).toFixed(0)}k`} 
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '0.5rem' }} 
                        formatter={(value: number, name: string) => [
                            value != null ? `$${value.toLocaleString(undefined, {maximumFractionDigits: 2})}` : '$0.00', 
                            name === 'balanceA' ? 'Scenario A' : 'Scenario B'
                        ]}
                        labelFormatter={(label) => `Period: ${label}`}
                    />
                    <Legend wrapperStyle={{paddingTop: 20}} />
                    <Area type="monotone" dataKey="balanceA" name="Scenario A" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#colorA)" />
                    {scheduleB && <Area type="monotone" dataKey="balanceB" name="Scenario B" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorB)" />}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};

export default LoanChart;