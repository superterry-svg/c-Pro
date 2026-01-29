import { Strategy, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'single', title: '一、單腿策略', description: '最基本、方向性最強' },
  { id: 'directional', title: '二、垂直價差 (Vertical)', description: '定義風險的方向性組合' },
  { id: 'neutral', title: '三、中性策略', description: '常用於波動率交易' },
  { id: 'neutral_theta', title: '四、中性 + Theta', description: '專業收租策略' },
  { id: 'stock_mix', title: '五、股票混合', description: '持股保險與增強' },
  { id: 'volatility', title: '六、波動率與時間 (Greeks)', description: '時間價值與跨期價差' },
  { id: 'synthetic', title: '七、合成頭寸', description: '資本效率極致化' },
  { id: 'beginner', title: '八、新手精選', description: '風險可控 Top 5' },
];

export const STRATEGIES: Strategy[] = [
  // --- Single Leg ---
  {
    id: 'long-call',
    name: '買入看漲期權',
    engName: 'Long Call',
    category: 'single',
    usage: '看好股價大升',
    risk: '有限（權利金）',
    reward: '無上限',
    features: ['低成本槓桿', '時間價值流失快（Theta）'],
    explanation: '這是最基本的看漲策略。當你強烈看好某檔股票會在短期內大漲時使用。',
    example: {
      setup: '現價 $100。你花 $2 買入一張行權價 $105 的 Call。',
      scenarios: [
        { label: '上漲至 $120', result: '獲利 $1,300', description: '期權價值 $15 - 成本 $2 = 賺 $13。', pnlType: 'profit' },
        { label: '下跌至 $80', result: '虧損 $200', description: '最多只賠付出的權利金。', pnlType: 'loss' }
      ]
    },
    chartData: [{ price: 80, pnl: -5 }, { price: 100, pnl: -5 }, { price: 120, pnl: 15 }]
  },
  {
    id: 'long-put',
    name: '買入看跌期權',
    engName: 'Long Put',
    category: 'single',
    usage: '看空股價大跌',
    risk: '有限（權利金）',
    reward: '接近無上限',
    features: ['可作為股票保險', '對沖黑天鵝'],
    explanation: '預期股價暴跌時使用。相比做空股票，買 Put 的風險僅限於權利金。',
    example: { setup: '買入 $95 Put ($2)', scenarios: [] },
    chartData: [{ price: 80, pnl: 15 }, { price: 100, pnl: -5 }, { price: 120, pnl: -5 }]
  },
  {
    id: 'short-put',
    name: '賣出看跌期權',
    engName: 'Short Put / CSP',
    category: 'single',
    usage: '看漲或低價接貨',
    risk: '大（股價暴跌）',
    reward: '有限（權利金）',
    features: ['Cash Secured Put', '價值投資進場工具'],
    explanation: '賣出一個 Put 並準備好現金。如果股價沒跌，賺取權利金；如果跌了，以較低價格買入心儀股票。',
    example: { setup: '賣出 $95 Put (收 $2)', scenarios: [] },
    chartData: [{ price: 80, pnl: -15 }, { price: 100, pnl: 5 }, { price: 120, pnl: 5 }]
  },

  // --- Vertical Spreads ---
  {
    id: 'bull-call-spread',
    name: '牛市看漲價差',
    engName: 'Bull Call Spread',
    category: 'directional',
    usage: '溫和看漲',
    risk: '有限',
    reward: '有限',
    features: ['買低賣高 Call', '降低成本'],
    explanation: '買入一個 Call 的同時賣出一個更高行權價的 Call。',
    example: { setup: '買 $100 Call，賣 $105 Call。', scenarios: [] },
    chartData: [{ price: 90, pnl: -2 }, { price: 105, pnl: 3 }]
  },
  {
    id: 'bear-put-spread',
    name: '熊市看跌價差',
    engName: 'Bear Put Spread',
    category: 'directional',
    usage: '看跌，但跌幅有限',
    risk: '有限',
    reward: '有限',
    features: ['買高賣低 Put', '低成本看空'],
    explanation: '買入一個高價 Put，賣出一個低價 Put 以抵消成本。',
    example: { setup: '買 $100P，賣 $95P', scenarios: [] },
    chartData: [{ price: 90, pnl: 3 }, { price: 100, pnl: -2 }, { price: 110, pnl: -2 }]
  },
  {
    id: 'bull-put-spread',
    name: '牛市看跌價差',
    engName: 'Bull Put Spread',
    category: 'directional',
    usage: '看平或看漲 (收租)',
    risk: '有限',
    reward: '有限',
    features: ['賣高買低 Put', 'Credit Spread'],
    explanation: '賣出一個高價 Put (收錢)，買入更低價 Put (保險)。只要股價不跌破賣出價，即可獲利。',
    example: { setup: '賣 $95P，買 $90P (收 $1.5)', scenarios: [] },
    chartData: [{ price: 80, pnl: -3.5 }, { price: 95, pnl: 1.5 }, { price: 110, pnl: 1.5 }]
  },
  {
    id: 'call-ratio-spread',
    name: '看漲比例價差 (1:2)',
    engName: 'Call Ratio Spread',
    category: 'directional',
    usage: '看漲但預期漲幅有限',
    risk: '上方風險無限',
    reward: '有限',
    features: ['買 1 張賣 2 張', '高勝率但極端風險'],
    explanation: '買入一張低價 Call，賣出兩張高價 Call。適合預期股價會漲但不會暴漲的場景。',
    example: { setup: '買 1x $100 Call，賣 2x $105 Call。', scenarios: [] },
    chartData: [{ price: 90, pnl: 1 }, { price: 105, pnl: 6 }, { price: 120, pnl: -9 }]
  },

  // --- Neutral ---
  {
    id: 'long-straddle',
    name: '買入跨式',
    engName: 'Long Straddle',
    category: 'neutral',
    usage: '預期大波動',
    risk: '權利金',
    reward: '高',
    features: ['買 Call + 買 Put'],
    explanation: '同時買入相同行權價的 Call 和 Put。不論方向，只要動得夠遠就賺。',
    example: { setup: '買 $100 Call/Put。', scenarios: [] },
    chartData: [{ price: 80, pnl: 10 }, { price: 100, pnl: -10 }, { price: 120, pnl: 10 }]
  },
  {
    id: 'short-strangle',
    name: '賣出寬跨式',
    engName: 'Short Strangle',
    category: 'neutral',
    usage: '看平 (賭不動)',
    risk: '無限',
    reward: '有限 (權利金)',
    features: ['賣價外 Call + 賣價外 Put'],
    explanation: '賭股價會在一定區間內震盪。只要不突破上下邊界，就能收乾權利金。',
    example: { setup: '賣 $110C + 賣 $90P', scenarios: [] },
    chartData: [{ price: 80, pnl: -10 }, { price: 90, pnl: 5 }, { price: 110, pnl: 5 }, { price: 120, pnl: -10 }]
  },

  // --- Neutral + Theta ---
  {
    id: 'iron-condor',
    name: '鐵秃鷹',
    engName: 'Iron Condor',
    category: 'neutral_theta',
    usage: '區間震盪',
    risk: '有限',
    reward: '權利金',
    features: ['賣價差組合', '風險定義明確'],
    explanation: '結合兩個 Credit Spread。適合在高波動率 (IV High) 預期回落時使用。',
    example: { setup: '賣 $110C/$115C + 賣 $90P/$85P', scenarios: [] },
    chartData: [{ price: 80, pnl: -5 }, { price: 90, pnl: 5 }, { price: 110, pnl: 5 }, { price: 120, pnl: -5 }]
  },
  {
    id: 'iron-butterfly',
    name: '鐵蝶式',
    engName: 'Iron Butterfly',
    category: 'neutral_theta',
    usage: '極度盤整',
    risk: '有限',
    reward: '高權利金',
    features: ['Short Straddle + Wings'],
    explanation: '賣出 ATM 跨式並買入遠端翅膀。獲利區間較窄，但賠率極佳。',
    example: { setup: '賣 $100C/P, 買 $110C, 買 $90P', scenarios: [] },
    chartData: [{ price: 80, pnl: -5 }, { price: 100, pnl: 15 }, { price: 120, pnl: -5 }]
  },
  {
    id: 'jade-lizard',
    name: '翠玉蜥蜴',
    engName: 'Jade Lizard',
    category: 'neutral_theta',
    usage: '看漲或中性',
    risk: '下方較大',
    reward: '權利金',
    features: ['無上方風險', 'Bull Put Spread + Short Call'],
    explanation: '消除上方風險。透過權利金覆蓋 Call 價差，使得股價無限上漲也不會虧損。',
    example: {
      setup: '現價 $100。賣 $110 Call，賣 $95 Put，買 $90 Put。總收 $6。',
      scenarios: [
        { label: '大漲', result: '獲利 $100', description: '即便暴漲，權利金足以覆蓋風險。', pnlType: 'profit' },
        { label: '盤整', result: '獲利 $600', description: '賺取全額權利金。', pnlType: 'profit' }
      ]
    },
    chartData: [{ price: 80, pnl: -9 }, { price: 95, pnl: 6 }, { price: 110, pnl: 6 }, { price: 120, pnl: 1 }]
  },

  // --- Volatility & Time ---
  {
    id: 'calendar-spread',
    name: '時間價差',
    engName: 'Calendar Spread',
    category: 'volatility',
    usage: '吃時間價值流失 (Theta)',
    risk: '有限 (淨支出)',
    reward: '有限',
    features: ['賣近月、買遠月', '低波動性獲利'],
    explanation: '賣出近期的期權，買入遠期的同價位期權。利用近期期權流失更快的特性獲利。',
    example: {
      setup: '賣出下週 $100 Call ($2)，買入下月 $100 Call ($5)。',
      scenarios: []
    },
    chartData: [{ price: 80, pnl: -5 }, { price: 100, pnl: 10 }, { price: 120, pnl: -5 }]
  },
  {
    id: 'diagonal-spread',
    name: '對角價差',
    engName: 'Diagonal Spread',
    category: 'volatility',
    usage: '低成本看漲/收租',
    risk: '有限',
    reward: '有限',
    features: ['不同行權價 + 不同到期日', 'Poor Man\'s Covered Call'],
    explanation: '結合時間與垂直價差。以極低資金成本複製備兌買權的效果。',
    example: { setup: '買遠期 $90 Call，賣近期 $105 Call。', scenarios: [] },
    chartData: [{ price: 80, pnl: -10 }, { price: 105, pnl: 8 }, { price: 120, pnl: 5 }]
  },
  {
    id: 'seagull',
    name: '海鷗策略 (Seagull)',
    engName: 'Seagull Strategy',
    category: 'volatility',
    usage: '低成本看漲',
    risk: '下方風險',
    reward: '有限',
    features: ['Bull Call Spread + Short Put', '三腿策略', '通常零成本'],
    explanation: '由三腿組成。賣 Put 的錢用來支付價差的成本，達成零成本建倉。',
    example: {
      setup: '賣 $90P，買 $100C，賣 $110C。',
      scenarios: []
    },
    chartData: [{ price: 80, pnl: -10 }, { price: 90, pnl: 0 }, { price: 100, pnl: 0 }, { price: 110, pnl: 10 }, { price: 120, pnl: 10 }]
  },

  // --- Synthetic ---
  {
    id: 'synthetic-long',
    name: '合成多頭',
    engName: 'Synthetic Long',
    category: 'synthetic',
    usage: '模擬持有股票',
    risk: '同持有股票',
    reward: '無限',
    features: ['Long Call + Short Put (同 Strike)', '資金效率極高'],
    explanation: '完美複製股票的盈虧曲線，但所需資金極低。',
    example: { setup: '買 $100 Call，賣 $100 Put。', scenarios: [] },
    chartData: [{ price: 80, pnl: -20 }, { price: 100, pnl: 0 }, { price: 120, pnl: 20 }]
  },

  // --- Stock Mix ---
  {
    id: 'covered-call',
    name: '備兌買權',
    engName: 'Covered Call',
    category: 'stock_mix',
    usage: '持股收租',
    risk: '股票下跌風險',
    reward: '權利金',
    features: ['正股 + Short Call'],
    explanation: '持有股票的同時賣出 Call。放棄暴漲機會以換取穩定現金流。',
    example: { setup: '持股成本 $100，賣 $105 Call。', scenarios: [] },
    chartData: [{ price: 80, pnl: -15 }, { price: 105, pnl: 5 }, { price: 120, pnl: 5 }]
  }
];