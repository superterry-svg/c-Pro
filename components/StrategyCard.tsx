import React from 'react';
import { Strategy } from '../types';
import PayoffChart from './PayoffChart';

interface StrategyCardProps {
  strategy: Strategy;
  onClick: () => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-blue-500 transition-all cursor-pointer shadow-lg hover:shadow-blue-500/10 flex flex-col gap-4 group h-full"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
            {strategy.name}
          </h3>
          <span className="text-sm text-slate-400 font-mono">{strategy.engName}</span>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-semibold ${
          strategy.category === 'single' ? 'bg-blue-900/50 text-blue-300' :
          strategy.category.includes('neutral') ? 'bg-purple-900/50 text-purple-300' :
          strategy.category === 'beginner' ? 'bg-emerald-900/50 text-emerald-300' :
          'bg-slate-700 text-slate-300'
        }`}>
          {strategy.category === 'beginner' ? '新手推薦' : strategy.category === 'single' ? '單腿' : '組合'}
        </div>
      </div>

      <PayoffChart data={strategy.chartData} />

      <div className="space-y-2 text-sm mt-1">
        <div className="bg-slate-700/30 p-2.5 rounded-lg border border-slate-700/50">
          <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">用途</span>
          <span className="text-slate-200 font-medium">{strategy.usage}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-700/30 p-2.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">風險</span>
            <span className="text-rose-300 font-medium">{strategy.risk}</span>
          </div>
          <div className="bg-slate-700/30 p-2.5 rounded-lg border border-slate-700/50">
            <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">回報</span>
            <span className="text-emerald-300 font-medium">{strategy.reward}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-2">
         <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
            {strategy.features.slice(0, 2).map((feature, idx) => (
                <li key={idx}>{feature}</li>
            ))}
         </ul>
      </div>
    </div>
  );
};

export default StrategyCard;