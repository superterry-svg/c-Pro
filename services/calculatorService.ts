import { ChartDataPoint, Scenario, CalculatorConfig } from '../types';

// Helper to format currency
const fmt = (n: number) => (n >= 0 ? `+$${n.toFixed(0)}` : `-$${Math.abs(n).toFixed(0)}`);
const safe = (n: number | undefined) => (n === undefined || isNaN(n)) ? 0 : n;

const getSingleLegPnL = (
  type: 'call' | 'put',
  position: 'long' | 'short',
  strike: number,
  premium: number,
  price: number,
  qty: number = 1
) => {
  let intrinsic = 0;
  if (type === 'call') intrinsic = Math.max(0, price - strike);
  else intrinsic = Math.max(0, strike - price);

  if (position === 'long') return (intrinsic * 100 - premium * 100) * qty;
  else return (premium * 100 - intrinsic * 100) * qty;
};

const generateChartData = (
  centerPrice: number,
  pnlFunc: (price: number) => number
): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const start = Math.floor(centerPrice * 0.6);
  const end = Math.ceil(centerPrice * 1.4);
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

export const getCalculatorConfig = (strategyId: string): CalculatorConfig | null => {
  const defaultPrice = 100;

  // 1. Seagull Strategy (Special 3-Leg)
  if (strategyId === 'seagull') {
    return {
      defaultPrice,
      params: [
        { key: 'putStrike', label: '賣出 Put 行權價', value: 90 },
        { key: 'callLower', label: '買入 Call 行權價', value: 100 },
        { key: 'callUpper', label: '賣出 Call 行權價', value: 110 },
        { key: 'netPrem', label: '淨支出/收入', value: 0, step: 0.1 },
      ],
      calculate: (price, params) => {
        const ps = safe(params.putStrike);
        const cl = safe(params.callLower);
        const cu = safe(params.callUpper);
        const prem = safe(params.netPrem);
        const pnlFunc = (p: number) => {
            const p1 = getSingleLegPnL('put', 'short', ps, 0, p);
            const c1 = getSingleLegPnL('call', 'long', cl, 0, p);
            const c2 = getSingleLegPnL('call', 'short', cu, 0, p);
            return p1 + c1 + c2 - (prem * 100);
        };
        return {
          chartData: generateChartData(price, pnlFunc),
          scenarios: generateScenarios(price, pnlFunc),
          summary: { maxProfit: fmt((cu-cl-prem)*100), maxLoss: '下方巨大', breakEven: '見圖表' },
          strategySetup: `海鷗策略: 賣 $${ps} Put, 買 $${cl} Call, 賣 $${cu} Call`
        };
      }
    };
  }

  // 2. Calendar / Diagonal Spread (Time Based)
  if (strategyId === 'calendar-spread' || strategyId === 'diagonal-spread') {
      const isDiagonal = strategyId === 'diagonal-spread';
      return {
          defaultPrice,
          params: [
              { key: 'longStrike', label: '遠月買入行權價', value: isDiagonal ? 90 : 100 },
              { key: 'shortStrike', label: '近月賣出行權價', value: 100 },
              { key: 'netDebit', label: '淨支出 (Debit)', value: 3.5, step: 0.1 },
          ],
          calculate: (price, params) => {
              const ls = safe(params.longStrike);
              const ss = safe(params.shortStrike);
              const cost = safe(params.netDebit);
              const pnlFunc = (p: number) => {
                  const shortPnL = getSingleLegPnL('call', 'short', ss, 0, p);
                  const intrinsic = Math.max(0, p - ls) * 100;
                  const timeVal = Math.max(0, 10 - Math.abs(p - ss) * 0.5) * 100; 
                  return shortPnL + intrinsic + timeVal - (cost * 100);
              };
              return {
                  chartData: generateChartData(price, pnlFunc),
                  scenarios: generateScenarios(price, pnlFunc),
                  summary: { maxProfit: '估算中', maxLoss: fmt(-cost*100), breakEven: '雙邊' },
                  strategySetup: `${strategyId}: 買遠期 $${ls}C, 賣近期 $${ss}C`
              };
          }
      }
  }

  // 3. Jade Lizard
  if (strategyId === 'jade-lizard') {
    return {
      defaultPrice,
      params: [
        { key: 'putSell', label: '賣出 Put 行權價', value: 95 },
        { key: 'putBuy', label: '買入 Put 行權價', value: 90 },
        { key: 'callSell', label: '賣出 Call 行權價', value: 110 },
        { key: 'netCredit', label: '總收權利金', value: 6.0, step: 0.1 },
      ],
      calculate: (price, params) => {
        const ps = safe(params.putSell);
        const pb = safe(params.putBuy);
        const cs = safe(params.callSell);
        const credit = safe(params.netCredit);
        const pnlFunc = (p: number) => {
            const p1 = getSingleLegPnL('put', 'short', ps, 0, p);
            const p2 = getSingleLegPnL('put', 'long', pb, 0, p);
            const c1 = getSingleLegPnL('call', 'short', cs, 0, p);
            return p1 + p2 + c1 + (credit * 100);
        };
        return {
          chartData: generateChartData(price, pnlFunc),
          scenarios: generateScenarios(price, pnlFunc),
          summary: { maxProfit: fmt(credit*100), maxLoss: '下方風險', breakEven: '見圖表' },
          strategySetup: `翠玉蜥蜴: 賣 $${cs}C, 賣 $${ps}P, 買 $${pb}P`
        };
      }
    };
  }

  // 4. Iron Butterfly
  if (strategyId === 'iron-butterfly') {
    return {
      defaultPrice,
      params: [
        { key: 'center', label: '中心行權價 (ATM)', value: 100 },
        { key: 'width', label: '翅膀寬度', value: 10 },
        { key: 'netCredit', label: '淨收入 (Credit)', value: 6.0, step: 0.1 },
      ],
      calculate: (price, params) => {
        const center = safe(params.center);
        const width = safe(params.width);
        const credit = safe(params.netCredit);
        const pnlFunc = (p: number) => {
            const leg1 = getSingleLegPnL('call', 'short', center, 0, p);
            const leg2 = getSingleLegPnL('call', 'long', center + width, 0, p);
            const leg3 = getSingleLegPnL('put', 'short', center, 0, p);
            const leg4 = getSingleLegPnL('put', 'long', center - width, 0, p);
            return leg1 + leg2 + leg3 + leg4 + (credit * 100);
        };
        return {
          chartData: generateChartData(center, pnlFunc),
          scenarios: generateScenarios(price, pnlFunc),
          summary: { maxProfit: fmt(credit*100), maxLoss: fmt((width-credit)*100), breakEven: '雙邊' },
          strategySetup: `鐵蝶式: 賣 $${center} Call/Put, 買 $${center-width}P, 買 $${center+width}C`
        };
      }
    };
  }

  // 5. Vertical Spreads (Consolidated)
  if (['bull-call-spread', 'bear-put-spread', 'bull-put-spread', 'bear-call-spread'].includes(strategyId)) {
    const isCall = strategyId.includes('call');
    const isCredit = strategyId.includes('put-spread') && strategyId.includes('bull') || strategyId.includes('call-spread') && strategyId.includes('bear');
    return {
      defaultPrice,
      params: [
        { key: 'longStrike', label: '買入行權價', value: strategyId.includes('bull') ? 100 : 105 },
        { key: 'shortStrike', label: '賣出行權價', value: strategyId.includes('bull') ? 105 : 100 },
        { key: 'netPrem', label: isCredit ? '淨收入 (Credit)' : '淨支出 (Debit)', value: 2.0, step: 0.1 },
      ],
      calculate: (price, params) => {
        const ls = safe(params.longStrike);
        const ss = safe(params.shortStrike);
        const prem = safe(params.netPrem);
        const opt = isCall ? 'call' : 'put';
        const pnlFunc = (p: number) => {
          const l = getSingleLegPnL(opt, 'long', ls, 0, p);
          const s = getSingleLegPnL(opt, 'short', ss, 0, p);
          return l + s + (isCredit ? prem * 100 : -prem * 100);
        };
        return {
          chartData: generateChartData(price, pnlFunc),
          scenarios: generateScenarios(price, pnlFunc),
          summary: { maxProfit: '見圖表', maxLoss: '有限', breakEven: '見圖表' },
          strategySetup: `${strategyId}: 買 $${ls} / 賣 $${ss}`
        };
      }
    };
  }

  // 6. Single Leg Options
  if (['long-call', 'short-call', 'long-put', 'short-put'].includes(strategyId)) {
    const isCall = strategyId.includes('call');
    const isLong = strategyId.includes('long');
    return {
      defaultPrice,
      params: [
        { key: 'strike', label: '行權價', value: 100 },
        { key: 'premium', label: '權利金', value: 2.5, step: 0.1 },
      ],
      calculate: (price, params) => {
        const strike = safe(params.strike);
        const premium = safe(params.premium);
        const pnlFunc = (p: number) => getSingleLegPnL(isCall ? 'call' : 'put', isLong ? 'long' : 'short', strike, premium, p);
        return {
          chartData: generateChartData(price, pnlFunc),
          scenarios: generateScenarios(price, pnlFunc),
          summary: { maxProfit: isLong ? '無限' : fmt(premium * 100), maxLoss: isLong ? fmt(-premium * 100) : '無限', breakEven: '見圖表' },
          strategySetup: `${isLong ? '買入' : '賣出'} $${strike} ${isCall ? 'Call' : 'Put'}`
        };
      }
    };
  }

  // Ratio Spreads
  if (strategyId.includes('ratio-spread')) {
      const isCall = strategyId.includes('call');
      return {
          defaultPrice,
          params: [
              { key: 'ls', label: '買入行權價 (1x)', value: 100 },
              { key: 'lp', label: '買入權利金', value: 3.0 },
              { key: 'ss', label: '賣出行權價 (2x)', value: isCall ? 105 : 95 },
              { key: 'sp', label: '賣出權利金', value: 1.8 },
          ],
          calculate: (price, params) => {
              const ls = safe(params.ls); const lp = safe(params.lp);
              const ss = safe(params.ss); const sp = safe(params.sp);
              const pnlFunc = (p: number) => getSingleLegPnL(isCall?'call':'put', 'long', ls, lp, p, 1) + getSingleLegPnL(isCall?'call':'put', 'short', ss, sp, p, 2);
              return {
                  chartData: generateChartData(price, pnlFunc),
                  scenarios: generateScenarios(price, pnlFunc),
                  summary: { maxProfit: '見峰值', maxLoss: '無限', breakEven: '見圖表' },
                  strategySetup: `比例價差 (1:2)`
              };
          }
      }
  }

  return null;
};