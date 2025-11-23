import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartDataPoint } from '../types';
import { formatCurrency } from '../utils';

interface CostChartProps {
  personalTotal: number;
  jointShare: number;
}

export const CostChart: React.FC<CostChartProps> = ({ personalTotal, jointShare }) => {
  const data: ChartDataPoint[] = [
    { name: 'Gastos Particulares', value: personalTotal, fill: '#6366f1' }, // Indigo 500
    { name: 'Minha Parte (Conjunta)', value: jointShare, fill: '#14b8a6' }, // Teal 500
  ];

  // If both are 0, show a placeholder
  if (personalTotal === 0 && jointShare === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100">
         <p>Sem dados para exibir</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Distribuição de Gastos</h3>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};