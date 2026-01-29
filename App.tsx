import React, { useState } from 'react';
import { CATEGORIES, STRATEGIES } from './constants';
import StrategyCard from './components/StrategyCard';
import StrategyCalculator from './components/StrategyCalculator';
import AIAssistant from './components/AIAssistant';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  
  const filteredStrategies = activeCategory === 'all' 
    ? STRATEGIES 
    : STRATEGIES.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                OM
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                OptionsMaster <span className="text-blue-500">期權策略大師</span>
              </span>
            </div>
            
            <button 
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg hover:shadow-blue-500/25"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Ask AI</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar / Category Filter */}
        <aside className="md:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-1">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
              策略分類
            </h3>
            <button
                onClick={() => setActiveCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeCategory === 'all' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                全部顯示
              </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex flex-col ${
                  activeCategory === cat.id 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="font-medium">{cat.title.split('、')[1] || cat.title}</span>
                {activeCategory === cat.id && (
                  <span className="text-[10px] opacity-80 mt-0.5 font-light">{cat.description}</span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Grid */}
        <main className="flex-1">
          <div className="mb-6">
             <h1 className="text-2xl font-bold text-white">
               {activeCategory === 'all' ? '所有策略' : CATEGORIES.find(c => c.id === activeCategory)?.title}
             </h1>
             <p className="text-slate-400 mt-1">
               {activeCategory === 'all' 
                 ? '瀏覽最常用、最基礎的期權策略指南' 
                 : CATEGORIES.find(c => c.id === activeCategory)?.description}
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredStrategies.map(strategy => (
              <StrategyCard 
                key={strategy.id} 
                strategy={strategy} 
                onClick={() => setSelectedStrategyId(strategy.id)}
              />
            ))}
          </div>

          {filteredStrategies.length === 0 && (
             <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
               <p className="text-slate-500">此分類暫無策略資料</p>
             </div>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {selectedStrategyId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setSelectedStrategyId(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl custom-scrollbar" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedStrategyId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 bg-slate-800/50 rounded-full p-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {(() => {
              const s = STRATEGIES.find(x => x.id === selectedStrategyId);
              if (!s) return null;
              
              return (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{s.name}</h2>
                    <p className="text-blue-400 font-mono text-lg">{s.engName}</p>
                  </div>
                  
                  {/* Detailed Explanation Section */}
                  <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-5 rounded-xl border border-blue-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <svg className="w-24 h-24 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                    </div>
                    <h3 className="flex items-center gap-2 font-bold text-blue-300 mb-3 text-sm uppercase relative z-10">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                       </svg>
                       核心概念詳解
                    </h3>
                    
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap relative z-10">
                      {s.explanation}
                    </p>
                  </div>

                  {/* Dynamic Strategy Calculator & Scenarios */}
                  <StrategyCalculator strategy={s} />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <span className="block text-xs text-slate-500 uppercase">用途</span>
                        <span className="font-medium">{s.usage}</span>
                     </div>
                     <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <span className="block text-xs text-slate-500 uppercase">風險</span>
                        <span className="font-medium text-rose-300">{s.risk}</span>
                     </div>
                     <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                        <span className="block text-xs text-slate-500 uppercase">回報</span>
                        <span className="font-medium text-emerald-300">{s.reward}</span>
                     </div>
                  </div>

                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <h3 className="font-bold text-slate-300 mb-3 text-sm uppercase">策略特點</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-200">
                      {s.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                   <button 
                    onClick={() => {
                        setSelectedStrategyId(null);
                        setIsChatOpen(true);
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors border border-transparent hover:border-blue-400"
                   >
                     還有疑問？向 AI 詢問更多
                   </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* AI Chat Drawer */}
      <AIAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default App;