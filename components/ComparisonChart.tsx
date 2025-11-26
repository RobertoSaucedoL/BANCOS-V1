import React from 'react';
import { LoanResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { formatCurrency } from '../utils/financials';

interface Props {
  results: LoanResult[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#2E3A47] border border-[#D98918] p-3 rounded-lg shadow-2xl min-w-[200px]">
        <p className="font-bold text-white mb-2 text-xs uppercase tracking-wider border-b border-slate-600 pb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-4 text-xs">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const ComparisonChart: React.FC<Props> = ({ results }) => {
  const barData = results.map((r) => ({
    name: r.params.name,
    Interest: r.summary.totalInterest,
    Principal: r.params.principal - r.summary.remainingBalance,
    Remaining: r.summary.remainingBalance,
    Expenses: r.summary.totalIva + r.summary.totalInsurance + r.summary.totalOpeningFee,
  }));

  const maxMonths = Math.max(...results.map(r => r.table.length));
  const areaData = Array.from({ length: maxMonths }, (_, i) => {
    const month = i + 1;
    const dataPoint: any = { month };
    results.forEach(r => {
        // If the table is shorter than maxMonths (because loan ended), balance is 0
        const row = r.table[i];
        dataPoint[`loan_${r.params.id}`] = row ? row.balance : 0;
    });
    return dataPoint;
  });

  const colors = [
      '#2E3A47', // Dark Blue
      '#D98918', // Amber
      '#64748b'  // Slate
  ];

  return (
    <div className="flex flex-col h-full gap-6 p-2">
        {/* Top: Balance History */}
        <div className="flex-1 min-h-[280px] w-full relative">
             <div className="absolute top-2 left-4 z-10">
                <h4 className="text-sm font-bold text-[#2E3A47]">Carrera de Saldos (Runway)</h4>
                <p className="text-[10px] text-slate-400">Evolución de la deuda mes a mes</p>
             </div>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 40, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        {results.map((r, i) => (
                            <linearGradient key={r.params.id} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors[i % 3]} stopOpacity={0.6}/>
                                <stop offset="95%" stopColor={colors[i % 3]} stopOpacity={0.05}/>
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(val) => `${(val/1000000).toFixed(1)}M`} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    {results.map((r, i) => (
                        <Area 
                            key={r.params.id}
                            type="monotone" 
                            dataKey={`loan_${r.params.id}`} 
                            name={r.params.name}
                            stroke={colors[i % 3]} 
                            strokeWidth={3}
                            fill={`url(#grad${i})`}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>

        {/* Bottom: Cost Breakdown */}
        <div className="flex-1 min-h-[250px] w-full border-t border-slate-100 pt-4 relative">
             <div className="absolute top-4 left-4 z-10">
                <h4 className="text-sm font-bold text-[#2E3A47]">Estructura de Costo Final</h4>
                <p className="text-[10px] text-slate-400">Capital vs Intereses vs Gastos</p>
             </div>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={barData}
                    layout="vertical"
                    margin={{ top: 50, right: 30, left: 0, bottom: 0 }}
                    barSize={24}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        width={140}
                        tick={{fill: '#475569', fontSize: 10, fontWeight: 700}}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                    <Legend 
                        verticalAlign="top" 
                        align="right"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '11px', top: 0, right: 0 }} 
                    />
                    <Bar dataKey="Principal" stackId="a" fill="#cbd5e1" name="Capital Pagado" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Remaining" stackId="a" fill="#ef4444" name="Deuda Pendiente" />
                    <Bar dataKey="Interest" stackId="a" fill="#D98918" name="Intereses" />
                    <Bar dataKey="Expenses" stackId="a" fill="#2E3A47" name="Gastos (IVA)" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
  );
};