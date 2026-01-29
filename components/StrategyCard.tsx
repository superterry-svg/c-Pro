import React from 'react';
import { Strategy } from '../types';
import PayoffChart from './PayoffChart';

interface StrategyCardProps {
  strategy: Strategy;
  onClick: () => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onClick }) => {
  const handleExercise = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the detail modal
    
    const isConfirmed = window.confirm(`確定要模擬執行「${strategy.name}」的行權動作嗎？\n這將模擬結算此筆交易組合。`);
    
    if (isConfirmed) {
      alert(`🎉 執行成功！\n\n您已成功模擬行權「${strategy.name}」。\n在實戰中，這通常代表將權利轉化為標的資產或進行現金結算。`);
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-blue-500 transition-all cursor-pointer shadow-lg hover:shadow-blue-500/10 flex flex-col gap-4 group h-full relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-colors pointer-events-none"></div>

      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
            {strategy.name}
          </h3>
          <span className="text-sm text-slate-400 font-mono">{strategy.engName}</span>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
          strategy.category === 'single' ? 'bg-blue-900/40 text-blue-300 border border-blue-800/50' :
          strategy.category.includes('neutral') ? 'bg-purple-900/40 text-purple-300 border border-purple-800/50' :
          strategy.category === 'beginner' ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/50' :
          'bg-slate-700/40 text-slate-300 border border-slate-600/50'
        }`}>
          {strategy.category === 'beginner' ? '新手推薦' : strategy.category === 'single' ? '單腿' : '組合'}
        </div>
      </div>

      <PayoffChart data={strategy.chartData} />

      <div className="space-y-2 text-sm mt-1 flex-1">
        {/* Usage */}
        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 flex gap-3 items-start">
          <div className="mt-1 p-1 bg-blue-500/10 rounded text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold mb-0.5">策略用途</span>
            <span className="text-slate-200 font-medium leading-tight text-xs">{strategy.usage}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {/* Risk */}
          <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 flex gap-2 items-start">
            <div className="mt-1 p-1 bg-rose-500/10 rounded text-rose-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold mb-0.5">風險</span>
              <span className="text-rose-300 font-medium text-xs">{strategy.risk}</span>
            </div>
          </div>
          {/* Reward */}
          <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 flex gap-2 items-start">
            <div className="mt-1 p-1 bg-emerald-500/10 rounded text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-bold mb-0.5">回報</span>
              <span className="text-emerald-300 font-medium text-xs">{strategy.reward}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-auto pt-3 border-t border-slate-700/50 flex items-center justify-between gap-2">
         <div className="flex flex-wrap gap-1 flex-1">
            {strategy.features.slice(0, 2).map((feature, idx) => (
                <span key={idx} className="bg-slate-700/30 text-[10px] text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50 whitespace-nowrap">
                  {feature}
                </span>
            ))}
         </div>
         
         <button 
           onClick={handleExercise}
           className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-lg shadow-blue-900/20 active:scale-95 transition-all border border-blue-400/20 group/btn"
         >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover/btn:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
           </svg>
           模擬行權
         </button>
      </div>
    </div>
  );
};

export default StrategyCard;