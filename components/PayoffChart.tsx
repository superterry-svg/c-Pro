import React, { useId } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { ChartDataPoint } from '../types';

interface PayoffChartProps {
  data: ChartDataPoint[];
}

const PayoffChart: React.FC<PayoffChartProps> = ({ data }) => {
  // Generate a unique ID for the gradient definition to prevent collision between multiple charts
  const uniqueId = useId().replace(/:/g, '');
  const gradientId = `splitColor-${uniqueId}`;

  const gradientOffset = () => {
    const dataMax = Math.max(...data.map((i) => i.pnl));
    const dataMin = Math.min(...data.map((i) => i.pnl));
  
    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }
  
    return dataMax / (dataMax - dataMin);
  };
  
  const off = gradientOffset();

  return (
    <div className="w-full h-48 bg-slate-800/50 rounded-lg p-2 border border-slate-700">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="price" 
            stroke="#94a3b8" 
            tick={{fontSize: 12}}
            tickFormatter={(val) => `$${val}`}
          />
          <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
            itemStyle={{ color: '#f1f5f9' }}
            labelFormatter={(label) => `股價: $${label}`}
            formatter={(value: number) => [
              <span key="val" className={value >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {value > 0 ? '+' : ''}{value}
              </span>, 
              "盈虧"
            ]}
          />
          <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset={off} stopColor="#10b981" stopOpacity={0.4} />
              <stop offset={off} stopColor="#f43f5e" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="pnl"
            stroke="#64748b"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="text-center text-xs text-slate-400 mt-1">示意圖 (Payoff Diagram)</div>
    </div>
  );
};

export default PayoffChart;