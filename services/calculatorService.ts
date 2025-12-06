import { ChartDataPoint, Scenario, CalculatorConfig } from '../types';

// Helper to format currency
const fmt = (n: number) => (n >= 0 ? `+$${n.toFixed(0)}` : `-$${Math.abs(n).toFixed(0)}`);
// Safe float parsing that defaults to 0 if NaN (double check)
const safe = (n: number | undefined) => (n === undefined || isNaN(n)) ? 0 : n;

// --- PnL Calculation Helpers ---

const getSingleLegPnL = (
  type: 'call' | 'put',
  position: 'long' | 'short',
  strike: number,
  premium: number,
  price: number
) => {
  let intrinsic = 0;
  if (type === 'call') intrinsic = Math.max(0, price - strike);
  else intrinsic = Math.max(0, strike - price);

  if (position === 'long') return intrinsic * 100 - premium * 100;
  else return premium * 100 - intrinsic * 100;
};

// --- Generators ---

const generateChartData = (
  centerPrice: number,
  range: number,
  pnlFunc: (price: number) => number
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const start = Math.floor(centerPrice * 0.7);
  const end = Math.ceil(centerPrice * 1.3);
  const step = Math.max(1, Math.round((end - start) / 40));

  for (let p = start; p <= end; p += step) {
    data.push({ price: p, pnl: pnlFunc(p) });
  }
  return data;
};

const generateScenarios = (
  currentPrice: number,
  pnlFunc: (price: number) => number
): Scenario[] => {
  const targets = [
    { label: '股價大漲 (+15%)', price: currentPrice * 1.15 },
    { label: '股價持平 (0%)', price: currentPrice },
    { label: '股價大跌 (-15%)', price: currentPrice * 0.85 },
  ];

  return targets.map((t) => {
    const pnl = pnlFunc(t.price);
    return {
      label: `${t.label} 至 $${t.price.toFixed(0)}`,
      result: pnl >= 0 ? `獲利 $${pnl.toFixed(0)}` : `虧損 $${Math.abs(pnl).toFixed(0)}`,
      description: `結算時盈虧為 ${fmt(pnl)}`,
      pnlType: pnl > 0 ? 'profit' : pnl < 0 ? 'loss' : 'neutral',
    };
  });
};

// --- Strategy Specific Configs ---

export const getCalculatorConfig = (strategyId: string): CalculatorConfig | null => {
  const defaultPrice = 100;

  // 1. Single Leg Options
  if (['long-call', 'short-call', 'long-put', 'short-put'].includes(strategyId)) {
    const isCall = strategyId.includes('call');
    const isLong = strategyId.includes('long');
    
    return {
      defaultPrice,
      params: [
        { key: 'strike', label: '行權價 (Strike)', value: isCall && isLong ? 105 : isCall ? 105 : isLong ? 95 : 95 },
        { key: 'premium', label: '權利金 (Premium)', value: 2.5, step: 0.1 },
      ],
      calculate: (price, params) => {
        // Default to 0 to prevent NaN during editing
        const strike = safe(params.strike);
        const premium = safe(params.premium);

        const pnlFunc = (p: number) => getSingleLegPnL(isCall ? 'call' : 'put', isLong ? 'long' : 'short', strike, premium, p);
        
        const maxProfit = isLong ? '無限' : fmt(premium * 100);
        const maxLoss = isLong ? fmt(-premium * 100) : '無限';
        const breakEven = isCall 
            ? (isLong ? strike + premium : strike + premium) 
            : (isLong ? strike - premium : strike - premium);

        return {
          chartData: generateChartData(strike || price, 20, pnlFunc),
          scenarios: generateScenarios(price, pnlFunc),
          summary: { maxProfit, maxLoss, breakEven: `$${breakEven.toFixed(2)}` }
        };
      }
    };
  }

  // 2. Vertical Spreads
  if (['bull-call-spread', 'bear-call-spread', 'bull-put-spread', 'bear-put-spread'].includes(strategyId)) {
    const isCall = strategyId.includes('call');
    const isBull = strategyId.includes('bull');

    const setup = {
        'bull-call-spread': { longStrike: 100, shortStrike: 110, longPrem: 3.5, shortPrem: 1.0 },
        'bear-call-spread': { shortStrike: 100, longStrike: 110, shortPrem: 3.5, longPrem: 1.0 }, 
        'bull-put-spread':  { longStrike: 90, shortStrike: 100, longPrem: 1.0, shortPrem: 3.5 }, 
        'bear-put-spread':  { longStrike: 100, shortStrike: 90, longPrem: 3.5, shortPrem: 1.0 }, 
    }[strategyId]!;

    return {
      defaultPrice,
      params: [
        { key: 'longStrike', label: '買入行權價', value: setup.longStrike },
        { key: 'longPrem', label: '買入權利金', value: setup.longPrem, step: 0.1 },
        { key: 'shortStrike', label: '賣出行權價', value: setup.shortStrike },
        { key: 'shortPrem', label: '賣出權利金', value: setup.shortPrem, step: 0.1 },
      ],
      calculate: (price, params) => {
        const longStrike = safe(params.longStrike);
        const longPrem = safe(params.longPrem);
        const shortStrike = safe(params.shortStrike);
        const shortPrem = safe(params.shortPrem);

        const pnlFunc = (p: number) => {
            const longPnL = getSingleLegPnL(isCall ? 'call' : 'put', 'long', longStrike, longPrem, p);
            const shortPnL = getSingleLegPnL(isCall ? 'call' : 'put', 'short', shortStrike, shortPrem, p);
            return longPnL + shortPnL;
        };
        
        const netCost = (longPrem - shortPrem) * 100;
        const maxProfit = isBull && isCall ? fmt((shortStrike - longStrike) * 100 - netCost) : '計算中'; 
        
        return {
          chartData: generateChartData(price, 20, pnlFunc),
          scenarios: generateScenarios(price, pnlFunc),
          summary: { maxProfit: '見圖表', maxLoss: '見圖表', breakEven: '見圖表' }
        };
      }
    };
  }

  // 3. Straddle / Strangle
  if (['long-straddle', 'short-straddle', 'long-strangle', 'short-strangle'].includes(strategyId)) {
    const isLong = strategyId.includes('long');
    const isStraddle = strategyId.includes('straddle');
    
    return {
        defaultPrice,
        params: [
            { key: 'callStrike', label: 'Call 行權價', value: isStraddle ? 100 : 110 },
            { key: 'callPrem', label: 'Call 權利金', value: isStraddle ? 3 : 1.5, step: 0.1 },
            { key: 'putStrike', label: 'Put 行權價', value: isStraddle ? 100 : 90 },
            { key: 'putPrem', label: 'Put 權利金', value: isStraddle ? 3 : 1.5, step: 0.1 },
        ],
        calculate: (price, params) => {
            const callStrike = safe(params.callStrike);
            const callPrem = safe(params.callPrem);
            const putStrike = safe(params.putStrike);
            const putPrem = safe(params.putPrem);

            const pnlFunc = (p: number) => {
                const callPnL = getSingleLegPnL('call', isLong ? 'long' : 'short', callStrike, callPrem, p);
                const putPnL = getSingleLegPnL('put', isLong ? 'long' : 'short', putStrike, putPrem, p);
                return callPnL + putPnL;
            };
            return {
                chartData: generateChartData(price, 30, pnlFunc),
                scenarios: generateScenarios(price, pnlFunc),
                summary: { maxProfit: isLong ? '無限' : fmt((callPrem+putPrem)*100), maxLoss: isLong ? fmt(-(callPrem+putPrem)*100) : '無限', breakEven: '雙邊' }
            };
        }
    }
  }

  // 4. Covered Call / Protective Put
  if (['covered-call', 'protective-put'].includes(strategyId)) {
      const isCC = strategyId === 'covered-call';
      return {
          defaultPrice,
          params: [
              { key: 'stockCost', label: '股票成本', value: 100 },
              { key: 'strike', label: isCC ? 'Call 行權價' : 'Put 行權價', value: isCC ? 105 : 95 },
              { key: 'premium', label: '權利金', value: 2.5, step: 0.1 },
          ],
          calculate: (price, params) => {
            const stockCost = safe(params.stockCost);
            const strike = safe(params.strike);
            const premium = safe(params.premium);

            const pnlFunc = (p: number) => {
                const stockPnL = (p - stockCost) * 100;
                const optionPnL = isCC 
                    ? getSingleLegPnL('call', 'short', strike, premium, p)
                    : getSingleLegPnL('put', 'long', strike, premium, p);
                return stockPnL + optionPnL;
            };
            return {
                chartData: generateChartData(price, 20, pnlFunc),
                scenarios: generateScenarios(price, pnlFunc),
                summary: { maxProfit: '見圖表', maxLoss: '見圖表', breakEven: '見圖表' }
            };
          }
      }
  }

  // 5. Collar Strategy
  if (strategyId === 'collar') {
      return {
          defaultPrice,
          params: [
              { key: 'stockCost', label: '股票成本', value: 100 },
              { key: 'putStrike', label: 'Put 行權價 (保護)', value: 90 },
              { key: 'putPrem', label: 'Put 權利金 (支出)', value: 2.0, step: 0.1 },
              { key: 'callStrike', label: 'Call 行權價 (抵銷)', value: 110 },
              { key: 'callPrem', label: 'Call 權利金 (收入)', value: 2.0, step: 0.1 },
          ],
          calculate: (price, params) => {
            const stockCost = safe(params.stockCost);
            const putStrike = safe(params.putStrike);
            const putPrem = safe(params.putPrem);
            const callStrike = safe(params.callStrike);
            const callPrem = safe(params.callPrem);

            const pnlFunc = (p: number) => {
                const stockPnL = (p - stockCost) * 100;
                // Long Put
                const putPnL = getSingleLegPnL('put', 'long', putStrike, putPrem, p);
                // Short Call
                const callPnL = getSingleLegPnL('call', 'short', callStrike, callPrem, p);
                
                return stockPnL + putPnL + callPnL;
            };

            // Max Profit occurs at or above Call Strike: (CallStrike - StockCost - PutPrem + CallPrem) * 100
            const maxProfitVal = (callStrike - stockCost - putPrem + callPrem) * 100;
            
            // Max Loss occurs at or below Put Strike: (PutStrike - StockCost - PutPrem + CallPrem) * 100
            const maxLossVal = (putStrike - stockCost - putPrem + callPrem) * 100;

            return {
                chartData: generateChartData(price, 20, pnlFunc),
                scenarios: generateScenarios(price, pnlFunc),
                summary: { 
                    maxProfit: fmt(maxProfitVal), 
                    maxLoss: fmt(maxLossVal), 
                    breakEven: '見圖表' 
                }
            };
          }
      }
  }

  // 6. Seagull Strategy
  if (strategyId === 'seagull') {
    return {
        defaultPrice,
        params: [
            { key: 'putStrike', label: '賣出 Put 行權價', value: 90 },
            { key: 'putPrem', label: '賣出 Put 權利金', value: 2.0, step: 0.1 },
            { key: 'longCallStrike', label: '買入 Call 行權價', value: 100 },
            { key: 'longCallPrem', label: '買入 Call 權利金', value: 3.5, step: 0.1 },
            { key: 'shortCallStrike', label: '賣出 Call 行權價', value: 110 },
            { key: 'shortCallPrem', label: '賣出 Call 權利金', value: 1.5, step: 0.1 },
        ],
        calculate: (price, params) => {
          const putStrike = safe(params.putStrike);
          const putPrem = safe(params.putPrem);
          const longCallStrike = safe(params.longCallStrike);
          const longCallPrem = safe(params.longCallPrem);
          const shortCallStrike = safe(params.shortCallStrike);
          const shortCallPrem = safe(params.shortCallPrem);

          const pnlFunc = (p: number) => {
              // 1. Short Put
              const leg1 = getSingleLegPnL('put', 'short', putStrike, putPrem, p);
              // 2. Long Call
              const leg2 = getSingleLegPnL('call', 'long', longCallStrike, longCallPrem, p);
              // 3. Short Call
              const leg3 = getSingleLegPnL('call', 'short', shortCallStrike, shortCallPrem, p);
              
              return leg1 + leg2 + leg3;
          };

          return {
              chartData: generateChartData(price, 20, pnlFunc),
              scenarios: generateScenarios(price, pnlFunc),
              summary: { 
                  maxProfit: '見圖表', 
                  maxLoss: '見圖表', 
                  breakEven: '見圖表' 
              }
          };
        }
    }
  }

  // 7. Iron Condor (Neutral/Theta)
  if (strategyId === 'iron-condor') {
    return {
      defaultPrice,
      params: [
        { key: 'mode', label: '模式 (0=賣方收租, 1=買方賭突破)', value: 0, step: 1, min: 0, max: 1 },
        { key: 'putStrike', label: 'Put 近端履約價', value: 90 },
        { key: 'callStrike', label: 'Call 近端履約價', value: 110 },
        { key: 'width', label: '保護寬度 (價差)', value: 5 },
        { key: 'netPrem', label: '總權利金 (Net)', value: 2.0, step: 0.1 },
      ],
      calculate: (price, params) => {
        const isLong = safe(params.mode) === 1; // 0=Short(Credit), 1=Long(Debit)
        const putInner = safe(params.putStrike);
        const callInner = safe(params.callStrike);
        const width = safe(params.width);
        const netPrem = safe(params.netPrem);

        const pnlFunc = (p: number) => {
          // Pass 0 premium to helpers, handle net premium at the end to simplify
          if (!isLong) {
            // Short IC: Short Inner Strangle + Long Outer Strangle (Protection)
            // Profit if price stays between PutInner and CallInner
            const shortPut = getSingleLegPnL('put', 'short', putInner, 0, p);
            const longPut = getSingleLegPnL('put', 'long', putInner - width, 0, p);
            const shortCall = getSingleLegPnL('call', 'short', callInner, 0, p);
            const longCall = getSingleLegPnL('call', 'long', callInner + width, 0, p);
            return shortPut + longPut + shortCall + longCall + (netPrem * 100);
          } else {
            // Long IC: Long Inner Strangle + Short Outer Strangle
            // Profit if price moves OUTSIDE Inner strikes
            const longPut = getSingleLegPnL('put', 'long', putInner, 0, p);
            const shortPut = getSingleLegPnL('put', 'short', putInner - width, 0, p);
            const longCall = getSingleLegPnL('call', 'long', callInner, 0, p);
            const shortCall = getSingleLegPnL('call', 'short', callInner + width, 0, p);
            return longPut + shortPut + longCall + shortCall - (netPrem * 100);
          }
        };

        const maxProfit = isLong 
             ? fmt((width * 100) - (netPrem * 100)) // Width - Debit
             : fmt(netPrem * 100);                  // Credit

        const maxLoss = isLong
             ? fmt(-(netPrem * 100))                // Debit
             : fmt(-((width * 100) - (netPrem * 100))); // -(Width - Credit)

        return {
          chartData: generateChartData(price, 30, pnlFunc),
          scenarios: generateScenarios(price, pnlFunc),
          summary: { 
            maxProfit, 
            maxLoss, 
            breakEven: '見圖表' 
          }
        };
      }
    }
  }

  // 8. Iron Butterfly (Neutral/Theta)
  if (strategyId === 'iron-butterfly') {
    return {
      defaultPrice,
      params: [
        { key: 'mode', label: '模式 (0=賣方收租, 1=買方賭突破)', value: 0, step: 1, min: 0, max: 1 },
        { key: 'centerStrike', label: '中心履約價 (ATM)', value: 100 },
        { key: 'width', label: '保護寬度 (價差)', value: 10 },
        { key: 'netPrem', label: '總權利金 (Net)', value: 4.0, step: 0.1 },
      ],
      calculate: (price, params) => {
        const isLong = safe(params.mode) === 1;
        const center = safe(params.centerStrike);
        const width = safe(params.width);
        const netPrem = safe(params.netPrem);

        const pnlFunc = (p: number) => {
           if (!isLong) {
             // Short IB: Sell ATM Straddle + Buy OTM Strangle
             const shortPut = getSingleLegPnL('put', 'short', center, 0, p);
             const longPut = getSingleLegPnL('put', 'long', center - width, 0, p);
             const shortCall = getSingleLegPnL('call', 'short', center, 0, p);
             const longCall = getSingleLegPnL('call', 'long', center + width, 0, p);
             return shortPut + longPut + shortCall + longCall + (netPrem * 100);
           } else {
             // Long IB: Buy ATM Straddle + Sell OTM Strangle
             const longPut = getSingleLegPnL('put', 'long', center, 0, p);
             const shortPut = getSingleLegPnL('put', 'short', center - width, 0, p);
             const longCall = getSingleLegPnL('call', 'long', center, 0, p);
             const shortCall = getSingleLegPnL('call', 'short', center + width, 0, p);
             return longPut + shortPut + longCall + shortCall - (netPrem * 100);
           }
        };
        
        const maxProfit = isLong 
             ? fmt((width * 100) - (netPrem * 100))
             : fmt(netPrem * 100);

        const maxLoss = isLong
             ? fmt(-(netPrem * 100))
             : fmt(-((width * 100) - (netPrem * 100)));

        return {
          chartData: generateChartData(center, 30, pnlFunc),
          scenarios: generateScenarios(price, pnlFunc),
          summary: { maxProfit, maxLoss, breakEven: '見圖表' }
        };
      }
    }
  }

  // Fallback
  return null;
};