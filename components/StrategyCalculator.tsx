import React, { useState, useEffect } from 'react';
import { Strategy, CalculatorConfig } from '../types';
import { getCalculatorConfig } from '../services/calculatorService';
import PayoffChart from './PayoffChart';

// Global cache to store user inputs per strategy ID so they persist when modal closes
const strategyCache: Record<string, { price: number | string, params: Record<string, number> }> = {};

interface StrategyCalculatorProps {
  strategy: Strategy;
}

const StrategyCalculator: React.FC<StrategyCalculatorProps> = ({ strategy }) => {
  const [config, setConfig] = useState<CalculatorConfig | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | string>(100);
  const [params, setParams] = useState<Record<string, number>>({});
  
  // Load config on strategy change and restore from cache if available
  useEffect(() => {
    const conf = getCalculatorConfig(strategy.id);
    if (conf) {
      setConfig(conf);
      
      if (strategyCache[strategy.id]) {
        // Restore from cache
        setCurrentPrice(strategyCache[strategy.id].price);
        setParams(strategyCache[strategy.id].params);
      } else {
        // Initialize from defaults
        const initialParams: Record<string, number> = {};
        conf.params.forEach(p => {
          initialParams[p.key] = p.value;
        });
        setCurrentPrice(conf.defaultPrice);
        setParams(initialParams);
        
        // Save to cache
        strategyCache[strategy.id] = {
            price: conf.defaultPrice,
            params: initialParams
        };
      }
    } else {
      setConfig(null);
    }
  }, [strategy.id]);

  const handleReset = () => {
    if (!config) return;
    
    // Reset to defaults
    const initialParams: Record<string, number> = {};
    config.params.forEach(p => {
      initialParams[p.key] = p.value;
    });
    
    setCurrentPrice(config.defaultPrice);
    setParams(initialParams);
    
    // Update cache
    strategyCache[strategy.id] = {
        price: config.defaultPrice,
        params: initialParams
    };
  };

  if (!config) {
    // Fallback to static data if no calculator is available for this strategy
    return (
      <div className="space-y-6">
         {/* Static Example (Legacy) */}
         {strategy.example && (
            <div className="bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden">
               <div className="bg-slate-800 border-b border-slate-700 px-5 py-3 flex items-center gap-2">
                  <span className="font-bold text-slate-200 text-sm uppercase">實戰範例 (靜態)</span>
               </div>
               <div className="p-5">
                  <div className="mb-4 text-sm text-slate-300 font-medium bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                     <span className="text-slate-500 mr-2">設定：</span>
                     {strategy.example.setup}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                     {strategy.example.scenarios.map((scenario, idx) => (
                       <div key={idx} className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 flex flex-col">
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-bold text-slate-400 uppercase">{scenario.label}</span>
                             <span className={`text-sm font-bold ${
                                scenario.pnlType === 'profit' ? 'text-emerald-400' : 
                                scenario.pnlType === 'loss' ? 'text-rose-400' : 'text-slate-300'
                             }`}>
                               {scenario.result}
                             </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed mt-auto">
                            {scenario.description}
                          </p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
          <PayoffChart data={strategy.chartData} />
      </div>
    );
  }

  // Calculate results based on current inputs
  // Use 0 or safe default if input is empty string/undefined during editing
  const safePrice = typeof currentPrice === 'number' ? currentPrice : parseFloat(currentPrice) || 0;
  const result = config.calculate(safePrice, params);

  const handleParamChange = (key: string, val: string) => {
      // Allow clearing the input
      if (val === '') {
          setParams(prev => {
              const next = { ...prev };
              delete next[key];
              // Update cache
              if (strategyCache[strategy.id]) {
                  strategyCache[strategy.id].params = next;
              }
              return next;
          });
          return;
      }

      const num = parseFloat(val);
      if (!isNaN(num)) {
          setParams(prev => {
              const next = { ...prev, [key]: num };
              // Update cache
              if (strategyCache[strategy.id]) {
                  strategyCache[strategy.id].params = next;
              }
              return next;
          });
      }
  };

  const handlePriceChange = (val: string) => {
      let newPrice: number | string = val;
      if (val === '') {
          setCurrentPrice('');
      } else {
          const num = parseFloat(val);
          if (!isNaN(num)) {
              setCurrentPrice(num);
              newPrice = num;
          } else {
              setCurrentPrice(val); // Keep string to allow typing
          }
      }

      // Update cache
      if (strategyCache[strategy.id]) {
          strategyCache[strategy.id].price = newPrice;
      }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-slate-800/80 rounded-xl border border-blue-500/30 p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <h3 className="font-bold text-white text-sm uppercase tracking-wide">策略參數模擬</h3>
            </div>
            
            <button 
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 hover:text-white text-slate-400 text-xs font-medium transition-all border border-slate-600/30 hover:border-slate-500"
                title="重置所有參數為預設值"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                重置
            </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Global Market Price Input */}
            <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-medium">當前股價 (Market Price)</label>
                <input 
                    type="number" 
                    value={currentPrice}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
            </div>

            {/* Dynamic Strategy Params */}
            {config.params.map(p => (
                <div key={p.key} className="flex flex-col gap-1">
                    <label className="text-xs text-slate-400 font-medium">{p.label}</label>
                    <input 
                        type="number" 
                        step={p.step || 1}
                        // Ensure we handle 0 correctly, but allow empty string
                        value={params[p.key] !== undefined ? params[p.key] : ''}
                        onChange={(e) => handleParamChange(p.key, e.target.value)}
                        className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 focus:outline-none transition-colors"
                    />
                </div>
            ))}
        </div>
      </div>

      {result.strategySetup && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-200 whitespace-pre-line leading-relaxed">
            <div className="font-bold text-blue-400 mb-1 flex items-center gap-2 text-xs uppercase tracking-wide">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                交易組合詳情
            </div>
            {result.strategySetup}
        </div>
      )}

      {/* Dynamic Chart */}
      <PayoffChart data={result.chartData} />

      {/* Dynamic Scenarios */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 overflow-hidden">
            <div className="bg-slate-800 border-b border-slate-700 px-5 py-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0 1 1 0 002 0zM8 8a1 1 0 100-2 1 1 0 000 2zm1 4a1 1 0 10-2 0 1 1 0 002 0zm3 0a1 1 0 10-2 0 1 1 0 002 0zm-3 4a1 1 0 10-2 0 1 1 0 002 0zm3 0a1 1 0 10-2 0 1 1 0 002 0z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-slate-200 text-sm uppercase">盈虧模擬分析</span>
            </div>
            
            <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {result.scenarios.map((scenario, idx) => (
                    <div key={idx} className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/50 flex flex-col transition-all hover:bg-slate-900/60">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">{scenario.label}</span>
                            <span className={`text-sm font-bold ${
                                scenario.pnlType === 'profit' ? 'text-emerald-400' : 
                                scenario.pnlType === 'loss' ? 'text-rose-400' : 'text-slate-300'
                            }`}>
                            {scenario.result}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mt-auto">
                            {scenario.description}
                        </p>
                    </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default StrategyCalculator;