import { Strategy, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'single', title: '一、單腿策略', description: '最基本、方向性最強' },
  { id: 'directional', title: '二、方向性組合', description: '比單腿更安全' },
  { id: 'neutral', title: '三、中性策略', description: '常用於波動率交易' },
  { id: 'neutral_theta', title: '四、中性 + Theta', description: '專業收租策略' },
  { id: 'stock_mix', title: '五、股票混合', description: '持股保險與增強' },
  { id: 'volatility', title: '六、波幅策略', description: '時間與對角價差' },
  { id: 'beginner', title: '七、新手精選', description: '風險可控 Top 5' },
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
    explanation: '這是最基本的看漲策略。當你強烈看好某檔股票會在短期內大漲時使用。你只需支付一筆權利金，就能擁有以特定價格買入股票的權利。如果股價大漲，你的獲利倍數會非常驚人；如果股價不漲或下跌，你最多損失投入的權利金，不會有額外負債。就像買一張看漲的樂透彩票，風險有限，潛力無窮。',
    example: {
      setup: '現價 $100。你花 $2 (總成本$200) 買入一張行權價 $105 的 Call。',
      scenarios: [
        { label: '上漲至 $120', result: '獲利 $1,300', description: '期權價值 $15 - 成本 $2 = 賺 $13。', pnlType: 'profit' },
        { label: '持平於 $100', result: '虧損 $200', description: '期權價外到期歸零，損失全部本金。', pnlType: 'loss' },
        { label: '下跌至 $80', result: '虧損 $200', description: '無論跌多少，最多只賠付出的權利金。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 80, pnl: -5 },
      { price: 90, pnl: -5 },
      { price: 100, pnl: -5 }, 
      { price: 110, pnl: 5 },
      { price: 120, pnl: 15 },
    ]
  },
  {
    id: 'long-put',
    name: '買入看跌期權',
    engName: 'Long Put',
    category: 'single',
    usage: '看空股價下跌',
    risk: '有限（權利金）',
    reward: '接近無上限（跌到 0）',
    features: ['可作為股票持倉保險（Protective Put）'],
    explanation: '當你預期股價會暴跌，或者想為手上的股票買「保險」時使用。支付權利金後，你擁有以特定價格「賣出」股票的權利。如果股價崩盤，這張合約價值會暴增，彌補股票的虧損；如果股價上漲，你只需放棄合約，損失僅限於權利金。這是做空市場最安全的方式之一，因為不需要借券，虧損也是鎖定的。',
    example: {
      setup: '現價 $100。你花 $2 (總成本$200) 買入一張行權價 $95 的 Put。',
      scenarios: [
        { label: '上漲至 $120', result: '虧損 $200', description: '看錯方向，期權歸零，損失本金。', pnlType: 'loss' },
        { label: '持平於 $100', result: '虧損 $200', description: '股價未跌破行權價，期權歸零。', pnlType: 'loss' },
        { label: '下跌至 $80', result: '獲利 $1,300', description: '期權價值 $15 - 成本 $2 = 賺 $13。', pnlType: 'profit' }
      ]
    },
    chartData: [
      { price: 80, pnl: 15 },
      { price: 90, pnl: 5 },
      { price: 100, pnl: -5 }, 
      { price: 110, pnl: -5 },
      { price: 120, pnl: -5 },
    ]
  },
  {
    id: 'short-call',
    name: '賣出看漲期權',
    engName: 'Short Call',
    category: 'single',
    usage: '看淡或看平',
    risk: '無上限（股價暴升）',
    reward: '有限（收權利金）',
    features: ['裸賣風險極高'],
    explanation: '這是一種高風險策略，通常不建議新手「裸賣」（手頭沒有股票的情況下）。你的角色是莊家，賣出合約收取權利金。如果股價下跌或不動，你賺取權利金；但如果股價暴漲，你需要以高價從市場買回股票賠給對方，理論上虧損是無限的。通常只有在你有股票做擔保（Covered Call）或做價差單時才建議使用。',
    example: {
      setup: '現價 $100。你賣出一張行權價 $105 的 Call，收取 $2 (獲利$200)。',
      scenarios: [
        { label: '大漲至 $130', result: '虧損 $2,300', description: '賠付 ($130-$105) - 已收 $2 = 虧 $23。', pnlType: 'loss' },
        { label: '持平於 $100', result: '獲利 $200', description: '期權歸零，你保留全額權利金。', pnlType: 'profit' },
        { label: '下跌至 $80', result: '獲利 $200', description: '對方不履約，你保留權利金。', pnlType: 'profit' }
      ]
    },
    chartData: [
      { price: 80, pnl: 5 },
      { price: 90, pnl: 5 },
      { price: 100, pnl: 5 }, 
      { price: 110, pnl: -5 },
      { price: 120, pnl: -15 },
    ]
  },
  {
    id: 'short-put',
    name: '賣出看跌期權',
    engName: 'Short Put',
    category: 'single',
    usage: '看漲或看平',
    risk: '大（股價暴跌→被指派買入）',
    reward: '有限（收權利金）',
    features: ['想以較低價格買股票（類似限價單）'],
    explanation: '這是巴菲特也常用的策略。當你願意以更便宜的價格買入某支股票，或者認為股價會緩漲/盤整時使用。你賣出 Put 收取權利金。如果股價不跌，你白賺權利金；如果股價跌破履約價，你有義務買入股票，但因為先收了權利金，實際買入成本會比市價更低。風險在於股價若遭遇黑天鵝暴跌，你仍需以履約價買入。',
    example: {
      setup: '現價 $100。你賣出一張行權價 $95 的 Put，收取 $2 (獲利$200)。',
      scenarios: [
        { label: '上漲至 $120', result: '獲利 $200', description: '期權歸零，保留權利金。', pnlType: 'profit' },
        { label: '持平於 $100', result: '獲利 $200', description: '未跌破 $95，保留權利金。', pnlType: 'profit' },
        { label: '暴跌至 $80', result: '虧損 $1,300', description: '需以 $95 買入 $80 股票。虧 ($95-$80) - $2 = 虧 $13。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 80, pnl: -15 },
      { price: 90, pnl: -5 },
      { price: 100, pnl: 5 }, 
      { price: 110, pnl: 5 },
      { price: 120, pnl: 5 },
    ]
  },

  // --- Directional Spreads ---
  {
    id: 'bull-call-spread',
    name: '牛市看漲價差',
    engName: 'Bull Call Spread',
    category: 'directional',
    usage: '看漲，但不預期暴升',
    risk: '有限',
    reward: '有限',
    features: ['買 Call + 賣更高價的 Call', '降低成本', 'Theta 壓力較輕'],
    explanation: '這是買入 Call 的改良版，適合「溫和看漲」。你在買入一個低價 Call 的同時，賣出一個高價 Call。賣出的動作能幫你抵銷部分成本，但也限制了你的最大獲利。這就像是說：「我認為股票會漲，但不會漲飛天」。好處是成本低、損益平衡點也較低，勝率通常比單純買 Call 高。',
    example: {
      setup: '現價 $100。買入 $105 Call ($3)，賣出 $110 Call ($1)。淨成本 $2。',
      scenarios: [
        { label: '上漲至 $115', result: '獲利 $300', description: '價差 $5 封頂 - 成本 $2 = 賺 $3。', pnlType: 'profit' },
        { label: '持平於 $100', result: '虧損 $200', description: '兩張期權皆歸零，損失淨成本 $2。', pnlType: 'loss' },
        { label: '下跌至 $90', result: '虧損 $200', description: '損失被鎖定在淨成本 $2。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 80, pnl: -5 },
      { price: 90, pnl: -5 }, 
      { price: 100, pnl: 5 },
      { price: 110, pnl: 5 }, 
      { price: 120, pnl: 5 },
    ]
  },
  {
    id: 'bull-put-spread',
    name: '牛市看跌價差',
    engName: 'Bull Put Spread',
    category: 'directional',
    usage: '看漲或看平',
    risk: '有限',
    reward: '有限（收權利金）',
    features: ['賣 Put + 買更低價的 Put'],
    explanation: '這是一種「收租」策略，適合看漲或認為股價「跌不下去」時使用。你賣出一個 Put（主要收入來源），同時買入一個更低價的 Put 做保護。這樣就算股價崩盤，你的最大虧損也是鎖定的。這比單純賣出 Put 安全得多，適合風險厭惡型的投資者賺取時間價值。',
    example: {
      setup: '現價 $100。賣出 $95 Put ($3)，買入 $90 Put ($1)。淨收入 $2。',
      scenarios: [
        { label: '上漲至 $110', result: '獲利 $200', description: '期權歸零，賺取全部淨收入。', pnlType: 'profit' },
        { label: '持平於 $100', result: '獲利 $200', description: '未跌破 $95，賺取全部淨收入。', pnlType: 'profit' },
        { label: '暴跌至 $80', result: '虧損 $300', description: '最大虧損鎖定：價差 $5 - 收入 $2 = 虧 $3。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 80, pnl: -10 },
      { price: 90, pnl: -10 }, 
      { price: 100, pnl: 0 },
      { price: 110, pnl: 5 }, 
      { price: 120, pnl: 5 },
    ]
  },
  {
    id: 'bear-put-spread',
    name: '熊市看跌價差',
    engName: 'Bear Put Spread',
    category: 'directional',
    usage: '看跌',
    risk: '有限',
    reward: '有限',
    features: ['買 Put + 賣更低價的 Put'],
    explanation: '當你看空後市，但不想支付昂貴的 Put 權利金時使用。你買入一個 Put，同時賣出一個更低價的 Put。這樣大大降低了做空的成本，代價是如果股價跌到深淵，你的獲利會在賣出的 Put 履約價處封頂。這是一個性價比很高的看空策略。',
    example: {
      setup: '現價 $100。買入 $95 Put ($3)，賣出 $90 Put ($1)。淨成本 $2。',
      scenarios: [
        { label: '上漲至 $110', result: '虧損 $200', description: '期權歸零，損失淨成本。', pnlType: 'loss' },
        { label: '持平於 $100', result: '虧損 $200', description: '期權歸零，損失淨成本。', pnlType: 'loss' },
        { label: '下跌至 $85', result: '獲利 $300', description: '價差 $5 封頂 - 成本 $2 = 賺 $3。', pnlType: 'profit' }
      ]
    },
    chartData: [
      { price: 80, pnl: 10 }, 
      { price: 90, pnl: 10 },
      { price: 100, pnl: 0 },
      { price: 110, pnl: -5 }, 
      { price: 120, pnl: -5 },
    ]
  },
  {
    id: 'bear-call-spread',
    name: '熊市看漲價差',
    engName: 'Bear Call Spread',
    category: 'directional',
    usage: '看跌或看平',
    risk: '有限',
    reward: '有限（收權利金）',
    features: ['賣 Call + 買更高價的 Call'],
    explanation: '適合看跌或認為股價「漲不上去」的情境。你賣出一個 Call（收入），同時買入一個更高價的 Call 作為保險。只要股價在到期時低於你賣出的履約價，你就能賺取全部權利金。這是一種定義了最大風險的做空/收租策略。',
    example: {
      setup: '現價 $100。賣出 $105 Call ($3)，買入 $110 Call ($1)。淨收入 $2。',
      scenarios: [
        { label: '大漲至 $120', result: '虧損 $300', description: '最大虧損鎖定：價差 $5 - 收入 $2 = 虧 $3。', pnlType: 'loss' },
        { label: '持平於 $100', result: '獲利 $200', description: '期權歸零，保留全部收入。', pnlType: 'profit' },
        { label: '下跌至 $90', result: '獲利 $200', description: '期權歸零，保留全部收入。', pnlType: 'profit' }
      ]
    },
    chartData: [
      { price: 80, pnl: 5 },
      { price: 90, pnl: 5 }, 
      { price: 100, pnl: 0 },
      { price: 110, pnl: -5 }, 
      { price: 120, pnl: -5 },
    ]
  },

  // --- Neutral ---
  {
    id: 'long-straddle',
    name: '買入跨式',
    engName: 'Long Straddle',
    category: 'neutral',
    usage: '預期大波動（不知方向）',
    risk: '兩邊權利金',
    reward: '高',
    features: ['買 Call + 買 Put（同 strike）'],
    explanation: '當你知道會有大新聞（如財報、FDA 藥物審核）但不確定是好是壞時使用。你同時買入相同履約價的 Call 和 Put。只要股價「大幅」偏離目前的價格（無論暴漲或暴跌），你就能獲利。缺點是成本很高，如果股價死魚不動，你會損失兩邊的權利金。',
    example: {
      setup: '現價 $100。買入 $100 Call ($3) + 買入 $100 Put ($3)。總成本 $6。',
      scenarios: [
        { label: '大漲至 $120', result: '獲利 $1,400', description: 'Call 賺 $20 - 總成本 $6 = 淨賺 $14。', pnlType: 'profit' },
        { label: '持平於 $100', result: '虧損 $600', description: '雙邊歸零，損失全部成本。', pnlType: 'loss' },
        { label: '大跌至 $80', result: '獲利 $1,400', description: 'Put 賺 $20 - 總成本 $6 = 淨賺 $14。', pnlType: 'profit' }
      ]
    },
    chartData: [
      { price: 80, pnl: 10 },
      { price: 90, pnl: 0 },
      { price: 100, pnl: -10 }, 
      { price: 110, pnl: 0 },
      { price: 120, pnl: 10 },
    ]
  },
  {
    id: 'long-strangle',
    name: '買入寬跨式',
    engName: 'Long Strangle',
    category: 'neutral',
    usage: '看重大事件（財報、FOMC）',
    risk: '有限（兩邊權利金）',
    reward: '高',
    features: ['買 OTM Call + 買 OTM Put', '成本低於 Straddle', '更需要大波動'],
    explanation: '與「跨式 (Straddle)」類似，都是賭大波動，但成本較低。你買入價外的 Call 和價外的 Put。因為履約價離現價較遠，權利金便宜，但也意味著股價需要「更劇烈」的波動才能開始獲利。這是一種以小博大的波動率交易策略。',
    example: {
      setup: '現價 $100。買入 $110 Call ($1) + 買入 $90 Put ($1)。總成本 $2。',
      scenarios: [
        { label: '大漲至 $120', result: '獲利 $800', description: 'Call 賺 $10 - 成本 $2 = 淨賺 $8。', pnlType: 'profit' },
        { label: '小動於 $105', result: '虧損 $200', description: '雙邊皆未進入行權區，歸零。', pnlType: 'loss' },
        { label: '大跌至 $80', result: '獲利 $800', description: 'Put 賺 $10 - 成本 $2 = 淨賺 $8。', pnlType: 'profit' }
      ]
    },
    chartData: [
      { price: 70, pnl: 10 },
      { price: 80, pnl: 0 }, 
      { price: 100, pnl: -5 }, 
      { price: 120, pnl: 0 }, 
      { price: 130, pnl: 10 },
    ]
  },
  {
    id: 'short-straddle',
    name: '賣出跨式',
    engName: 'Short Straddle',
    category: 'neutral',
    usage: '預期超級平靜',
    risk: '無上限（極危險）',
    reward: '收權利金大',
    features: ['裸賣 Call + 裸賣 Put'],
    explanation: '這是極高風險的策略。你賭股價會「精準」地停留在某個價格不動。你同時賣出 Call 和 Put。雖然收取的權利金非常豐厚，但只要股價往任一方向大幅移動，虧損就會迅速擴大且理論無上限。通常只有專業機構或極有經驗的交易者才會操作。',
    example: {
      setup: '現價 $100。賣出 $100 Call ($3) + 賣出 $100 Put ($3)。總收入 $6。',
      scenarios: [
        { label: '大漲至 $120', result: '虧損 $1,400', description: 'Call 賠 $20，扣掉收入 $6 = 淨虧 $14。', pnlType: 'loss' },
        { label: '持平於 $100', result: '獲利 $600', description: '雙邊歸零，賺滿全部權利金。', pnlType: 'profit' },
        { label: '大跌至 $80', result: '虧損 $1,400', description: 'Put 賠 $20，扣掉收入 $6 = 淨虧 $14。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 80, pnl: -10 },
      { price: 90, pnl: 0 },
      { price: 100, pnl: 10 }, 
      { price: 110, pnl: 0 },
      { price: 120, pnl: -10 },
    ]
  },
  {
    id: 'short-strangle',
    name: '賣出寬跨式',
    engName: 'Short Strangle',
    category: 'neutral',
    usage: '預期震幅小、波動下降',
    risk: '無上限',
    reward: '收權利金',
    features: ['預期震幅小', '雖有兩邊保護線，但仍屬高風險'],
    explanation: '你預期股價會在一個區間內震盪，不會突破某個高點或跌破某個低點。你賣出上方 Call 和下方 Put，建立一個「獲利區間」。只要股價保持在區間內，你就能賺取權利金。雖然比賣出跨式安全一點（區間較寬），但若遇到黑天鵝事件，虧損依然是無限的。',
    example: {
      setup: '現價 $100。賣出 $110 Call ($1) + 賣出 $90 Put ($1)。總收入 $2。',
      scenarios: [
        { label: '大漲至 $120', result: '虧損 $800', description: 'Call 賠 $10 - 收入 $2 = 淨虧 $8。', pnlType: 'loss' },
        { label: '震盪 $95-$105', result: '獲利 $200', description: '都在區間內，賺取全部權利金。', pnlType: 'profit' },
        { label: '大跌至 $80', result: '虧損 $800', description: 'Put 賠 $10 - 收入 $2 = 淨虧 $8。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 70, pnl: -10 },
      { price: 80, pnl: 0 }, 
      { price: 100, pnl: 5 }, 
      { price: 120, pnl: 0 }, 
      { price: 130, pnl: -10 },
    ]
  },

  // --- Neutral + Theta ---
  {
    id: 'iron-condor',
    name: '鐵秃鷹',
    engName: 'Iron Condor',
    category: 'neutral_theta',
    usage: '預期股價區間震盪',
    risk: '有限',
    reward: '收權利金',
    features: ['Bear Call Spread + Bull Put Spread', 'IV 高、預期回落'],
    explanation: '這是一種靈活的結構化策略，根據你的市場觀點，可以有兩種變化：\n\n1. **賣方鐵禿鷹 (Short Iron Condor)**：最常見的用法（收租）。當你預期市場像死水一樣盤整時使用。你「賣出」一個寬跨式 (Strangle) 並買入更外圍的期權做保護。獲利來源是權利金的時間價值流失，風險與回報都是有限且已知的。\n\n2. **買方鐵禿鷹 (Long Iron Condor)**：又稱反向鐵禿鷹。當你預期市場會有「大波動」，但想限制權利金成本時使用。你「買入」中間的寬跨式並賣出外圍期權。這是一種低成本博取波動率突破的策略。',
    example: {
      setup: '現價 $100。做賣權價差 ($90/$95) + 買權價差 ($105/$110)。總收入 $2。',
      scenarios: [
        { label: '大漲至 $120', result: '虧損 $300', description: '買權價差賠 $5 - 收入 $2 = 淨虧 $3。', pnlType: 'loss' },
        { label: '盤整 $95-$105', result: '獲利 $200', description: '全部過期無價值，賺滿收入。', pnlType: 'profit' },
        { label: '大跌至 $80', result: '虧損 $300', description: '賣權價差賠 $5 - 收入 $2 = 淨虧 $3。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 70, pnl: -5 },
      { price: 80, pnl: -5 }, 
      { price: 90, pnl: 5 },  
      { price: 110, pnl: 5 }, 
      { price: 120, pnl: -5 }, 
      { price: 130, pnl: -5 },
    ]
  },
  {
    id: 'iron-butterfly',
    name: '鐵蝶式',
    engName: 'Iron Butterfly',
    category: 'neutral_theta',
    usage: '預期區間極小',
    risk: '比 Iron Condor 高',
    reward: '收權利金更高',
    features: ['Short Straddle + 兩邊保護 Put/Call'],
    explanation: '這是鐵禿鷹的變形，同樣有兩種方向：\n\n1. **賣方鐵蝶式 (Short Iron Butterfly)**：預期股價「釘」在某個價格不動。賣出跨式 (Straddle) 收取高額權利金，並買入保護翼。獲利潛力比鐵禿鷹高，但獲利區間很窄。\n\n2. **買方鐵蝶式 (Long Iron Butterfly)**：預期股價「大幅偏離」中心點。這比直接買跨式 (Long Straddle) 便宜，因為你賣出了外圍期權來補貼成本，代價是最大獲利被封頂。適合在低波動率時佈局突破行情。',
    example: {
      setup: '現價 $100。賣 $100 Call/Put，買 $105 Call/$95 Put 保護。總收入 $3。',
      scenarios: [
        { label: '大漲至 $110', result: '虧損 $200', description: '內層賠 $5 - 收入 $3 = 淨虧 $2。', pnlType: 'loss' },
        { label: '釘在 $100', result: '獲利 $300', description: '完美收乾，賺取全部收入。', pnlType: 'profit' },
        { label: '大跌至 $90', result: '虧損 $200', description: '內層賠 $5 - 收入 $3 = 淨虧 $2。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 80, pnl: -5 },
      { price: 90, pnl: 0 },
      { price: 100, pnl: 10 }, 
      { price: 110, pnl: 0 },
      { price: 120, pnl: -5 },
    ]
  },

  // --- Stock Mix ---
  {
    id: 'covered-call',
    name: '備兌買權',
    engName: 'Covered Call',
    category: 'stock_mix',
    usage: '持股看平到小漲',
    risk: '股票下跌風險仍有',
    reward: '額外收權利金',
    features: ['持有正股 + 賣出 Call'],
    explanation: '這是許多長期投資者的最愛。當你手上有 100 股股票，且認為近期股價不會大漲時，可以賣出 Call 來「收房租」。如果股價持平或下跌，這筆權利金能減少你的帳面虧損；如果股價大漲，你可能需要賣出股票，但通常是在獲利的狀態下賣出。這是一個增強持股收益的穩健策略。',
    example: {
      setup: '持股成本 $100。賣出 $105 Call，收入 $2。',
      scenarios: [
        { label: '上漲至 $110', result: '獲利 $700', description: '股票漲至$105被召回($5) + 權利金($2) = $7。', pnlType: 'profit' },
        { label: '持平於 $100', result: '獲利 $200', description: '股票沒賺，但白賺權利金 $2。', pnlType: 'profit' },
        { label: '下跌至 $90', result: '虧損 $800', description: '股票賠 $10，權利金補 $2，實虧 $8。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 80, pnl: -15 },
      { price: 90, pnl: -5 },
      { price: 100, pnl: 5 }, 
      { price: 110, pnl: 5 },
      { price: 120, pnl: 5 },
    ]
  },
  {
    id: 'protective-put',
    name: '保護性 Put',
    engName: 'Protective Put',
    category: 'stock_mix',
    usage: '股票保險',
    risk: '風險封頂',
    reward: '無限（跟隨股票上漲，扣除保費）',
    features: ['成本高（像買保險）'],
    explanation: '這就像為你的股票買意外險。你持有股票，同時買入 Put。如果市場崩盤，Put 的獲利會抵銷股票的虧損，確保你最多只賠一點錢。如果股票大漲，你依然擁有股票的上漲收益（只需扣除買 Put 的保費）。這是保護資產最有效的方法，雖然保費通常不便宜。',
    example: {
      setup: '持股成本 $100。買入 $95 Put (保險)，成本 $2。',
      scenarios: [
        { label: '上漲至 $120', result: '獲利 $1,800', description: '股票賺 $20 - 保費 $2 = $18。', pnlType: 'profit' },
        { label: '持平於 $100', result: '虧損 $200', description: '股票沒賺，損失保費 $2。', pnlType: 'loss' },
        { label: '暴跌至 $80', result: '虧損 $700', description: 'Put 履約賣 $95。損失($100-$95) + 保費$2 = $7。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 80, pnl: -5 },
      { price: 90, pnl: -5 }, 
      { price: 100, pnl: -5 },
      { price: 110, pnl: 5 },
      { price: 120, pnl: 15 },
    ]
  },
  {
    id: 'collar',
    name: '領口策略',
    engName: 'Collar',
    category: 'stock_mix',
    usage: '低成本保護策略',
    risk: '有限',
    reward: '有限',
    features: ['持股 + 買 Put + 賣 Call', '用賣 Call 的收入抵銷 Put 保費'],
    explanation: '這是「保護性 Put」的升級版，解決了保費太貴的問題。你持有股票，買入 Put 做保護，同時賣出 Call 來賺錢支付 Put 的保費。這樣你就構建了一個「零成本」或「低成本」的保護傘。代價是，如果股價大漲，你的獲利也會被賣出的 Call 封頂。適合希望保本、對超額報酬不強求的穩健投資者。',
    example: {
      setup: '持股成本$100。買$90 Put (付$1)，賣$110 Call (收$1)。零成本保護。',
      scenarios: [
        { label: '大漲至 $120', result: '獲利 $1,000', description: '被 $110 Call 封頂，最大賺 $10。', pnlType: 'profit' },
        { label: '持平於 $100', result: '平盤 $0', description: '股票沒動，期權抵銷。', pnlType: 'neutral' },
        { label: '大跌至 $80', result: '虧損 $1,000', description: '有 $90 Put 保護，最大賠 $10。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 80, pnl: -2 },
      { price: 90, pnl: -2 }, 
      { price: 100, pnl: 2 },
      { price: 110, pnl: 5 }, 
      { price: 120, pnl: 5 },
    ]
  },

  // --- Volatility ---
  {
    id: 'calendar-spread',
    name: '時間價差',
    engName: 'Calendar Spread',
    category: 'volatility',
    usage: '看波動率上升、方向不確定',
    risk: '有限',
    reward: '有限',
    features: ['賣近月 + 買遠月', '吃 Theta'],
    explanation: '這是在玩「時間」的遊戲。你賣出近期的期權（因為時間價值流失快），同時買入遠期的期權。只要股價在近期不要大幅波動，你就能賺取近期期權時間價值流失的錢。這是一種低風險的收租方式，特別適合預期短期盤整、長期波動的股票。',
    example: {
      setup: '現價 $100。賣近月 $100 Call，買遠月 $100 Call。淨成本 $2。',
      scenarios: [
        { label: '大漲或大跌', result: '虧損', description: '偏離 $100 太遠，會損失所付出的成本。', pnlType: 'loss' },
        { label: '持平於 $100', result: '獲利', description: '近月歸零(賺)，遠月仍有價值。', pnlType: 'profit' },
        { label: '微幅波動', result: '小賺/小賠', description: '取決於剩餘價值。', pnlType: 'neutral' }
      ]
    },
    chartData: [
      { price: 80, pnl: -5 },
      { price: 90, pnl: 2 },
      { price: 100, pnl: 8 }, 
      { price: 110, pnl: 2 },
      { price: 120, pnl: -5 },
    ]
  },
  {
    id: 'diagonal-spread',
    name: '對角價差',
    engName: 'Diagonal Spread',
    category: 'volatility',
    usage: '方向性 + 波動率',
    risk: '有限',
    reward: '有限',
    features: ['時間價差 + 價格價差', '可調整方向性'],
    explanation: '這是時間價差的進階版，你可以同時調整履約價和到期日。例如，買入遠期的價內 Call，賣出近期的價外 Call（這叫窮人版 Covered Call）。這讓你能用極低的資金複製持有股票的效果，並賺取時間價值。這是一個靈活度極高，但需要較多管理技巧的策略。',
    example: {
      setup: '買遠期 $90 Call，賣近期 $105 Call。類似低成本持股。',
      scenarios: [
        { label: '緩漲至 $105', result: '最大獲利', description: '近期 Call 歸零，遠期 Call 增值。', pnlType: 'profit' },
        { label: '持平', result: '小賺', description: '賺取近期期權的時間價值。', pnlType: 'profit' },
        { label: '大跌', result: '虧損', description: '遠期 Call 損失價值。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 80, pnl: -5 },
      { price: 90, pnl: 0 },
      { price: 100, pnl: 5 },
      { price: 110, pnl: 8 },
      { price: 120, pnl: 10 },
    ]
  },
  {
    id: 'seagull',
    name: '海鷗策略',
    engName: 'Seagull Option',
    category: 'volatility',
    usage: '看漲但預期波動不大，零成本建倉',
    risk: '下跌風險大（像 Naked Put）',
    reward: '有限（Short Call 封頂）',
    features: ['牛市價差 (Bull Call) + 賣 Put', '通常零成本', '三腿策略'],
    explanation: '海鷗策略是一種三腿策略，通常用於看漲但想降低成本的場景。你建立一個「牛市看漲價差」（買低價 Call + 賣高價 Call），然後再「賣出一個更低價的 Put」。這個賣 Put 的收入用來支付買 Call 的費用，甚至可以創造淨收入。結果是你擁有上漲潛力（到 Short Call 處封頂），但如果股價暴跌，你需要接貨（因為賣了 Put）。',
    example: {
      setup: '現價 $100。賣 $90 Put (收$2)，買 $100 Call (付$3)，賣 $110 Call (收$1)。淨成本 $0。',
      scenarios: [
        { label: '上漲至 $115', result: '獲利 $1,000', description: 'Call 價差賺 $10，其他歸零。', pnlType: 'profit' },
        { label: '持平 $95-$100', result: '平盤', description: '全部期權歸零。', pnlType: 'neutral' },
        { label: '暴跌至 $80', result: '虧損 $1,000', description: '需以 $90 買入 (損失$10)。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 80, pnl: -10 },
      { price: 90, pnl: 0 }, 
      { price: 100, pnl: 0 },
      { price: 110, pnl: 10 }, 
      { price: 120, pnl: 10 },
    ]
  },

  // --- Beginner ---
  {
    id: 'beginner-bull-call',
    name: '牛市看漲價差 (新手)',
    engName: 'Bull Call Spread',
    category: 'beginner',
    usage: '看漲，風險受控',
    risk: '有限',
    reward: '有限',
    features: ['推薦新手', '成本低'],
    explanation: '新手最推薦的看漲策略。相比直接買 Call，這個策略透過「一買一賣」降低了入場費，也設定了停利點。雖然限制了潛在的最大獲利，但大大提高了勝率和持倉心態的穩定性。這能教導新手「不要貪心」，並習慣風險管理的思維。',
    example: {
      setup: '現價 $100。買 $105 Call ($3)，賣 $110 Call ($1)。成本 $2。',
      scenarios: [
        { label: '漲過 $110', result: '獲利 $300', description: '價差 $5 - 成本 $2 = 鎖定賺 $3。', pnlType: 'profit' },
        { label: '持平 $100', result: '虧損 $200', description: '全部歸零，賠本金。', pnlType: 'loss' },
        { label: '下跌', result: '虧損 $200', description: '最大只賠本金 $2。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 80, pnl: -5 },
      { price: 90, pnl: -5 },
      { price: 100, pnl: 5 },
      { price: 110, pnl: 5 },
      { price: 120, pnl: 5 },
    ]
  },
  {
    id: 'beginner-bear-put',
    name: '熊市看跌價差 (新手)',
    engName: 'Bear Put Spread',
    category: 'beginner',
    usage: '看跌，風險受控',
    risk: '有限',
    reward: '有限',
    features: ['推薦新手'],
    explanation: '新手最推薦的看跌策略。如果你覺得股票會跌，直接買 Put 往往太貴且容易被時間價值吃掉獲利。這個策略讓你用便宜的價格參與下跌行情，且風險完全可控。這是學習做空市場最安全的第一步。',
    example: {
      setup: '現價 $100。買 $95 Put ($3)，賣 $90 Put ($1)。成本 $2。',
      scenarios: [
        { label: '上漲', result: '虧損 $200', description: '歸零，賠本金。', pnlType: 'loss' },
        { label: '持平', result: '虧損 $200', description: '歸零，賠本金。', pnlType: 'loss' },
        { label: '跌破 $90', result: '獲利 $300', description: '價差 $5 - 成本 $2 = 鎖定賺 $3。', pnlType: 'profit' }
      ]
    },
    chartData: [
      { price: 80, pnl: 10 },
      { price: 90, pnl: 10 },
      { price: 100, pnl: 0 },
      { price: 110, pnl: -5 },
      { price: 120, pnl: -5 },
    ]
  },
  {
    id: 'beginner-covered-call',
    name: '備兌買權 (新手)',
    engName: 'Covered Call',
    category: 'beginner',
    usage: '收租增強收益',
    risk: '股票下跌風險',
    reward: '權利金',
    features: ['有股票就能做'],
    explanation: '如果你手上有閒置的股票，這策略讓你馬上變身「房東」收租。操作簡單，邏輯清晰：用放棄未來的「暴漲」機會，換取現在確定的「現金」收入。對於長期持股的新手來說，這是增加額外收入最穩健的方式，也是很多退休基金的操作手法。',
    example: {
      setup: '持股 @ $100。賣 $105 Call 收 $2。',
      scenarios: [
        { label: '漲至 $110', result: '獲利 $700', description: '股價漲$5(被封頂) + 權利金$2。', pnlType: 'profit' },
        { label: '持平', result: '獲利 $200', description: '白賺權利金。', pnlType: 'profit' },
        { label: '下跌至 $90', result: '虧損 $800', description: '股票跌$10，權利金補$2，少賠一點。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 80, pnl: -15 },
      { price: 90, pnl: -5 },
      { price: 100, pnl: 5 },
      { price: 110, pnl: 5 },
      { price: 120, pnl: 5 },
    ]
  },
  {
    id: 'beginner-protective-put',
    name: '保護性 Put (新手)',
    engName: 'Protective Put',
    category: 'beginner',
    usage: '買保險',
    risk: '有限（保費）',
    reward: '無限',
    features: ['睡得安穩'],
    explanation: '新手在面對市場動盪時最需要的策略。它教你如何用小錢保護大錢。雖然需要支付權利金（保費），但它能讓你在市場崩盤時依然睡得安穩。這不是為了賺錢，而是為了生存，是風險管理最重要的一課。',
    example: {
      setup: '持股 @ $100。買 $95 Put 花 $2。',
      scenarios: [
        { label: '大漲', result: '大賺', description: '股票賺錢 - 保費 = 賺。', pnlType: 'profit' },
        { label: '持平', result: '小虧', description: '損失保費 $2。', pnlType: 'loss' },
        { label: '崩盤', result: '虧損有限', description: '最大只賠 ($100-$95) + 保費$2 = $7。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 80, pnl: -5 },
      { price: 90, pnl: -5 },
      { price: 100, pnl: -5 },
      { price: 110, pnl: 5 },
      { price: 120, pnl: 15 },
    ]
  },
  {
    id: 'beginner-cash-put',
    name: 'Cash-Secured Put',
    engName: 'Cash-Secured Put',
    category: 'beginner',
    usage: '低價接貨',
    risk: '接貨下跌',
    reward: '權利金',
    features: ['有現金備援的 Short Put', '巴菲特也用'],
    explanation: '如果你想買某支股票但覺得現在太貴，不要只掛限價單空等。使用這個策略，你可以一邊等股價跌下來，一邊收權利金。如果股價沒跌到目標價，你就白賺權利金；如果跌到了，你就以心目中的低價買進。這是價值投資者最愛用的進場技巧。',
    example: {
      setup: '想買 $95 的股票 (現價$100)。賣 $95 Put 收 $2。',
      scenarios: [
        { label: '上漲/持平', result: '獲利 $200', description: '沒買到股票，但賺了權利金。', pnlType: 'profit' },
        { label: '微跌至 $95', result: '獲利 $200', description: '剛好以 $95 買入，成本變 $93。', pnlType: 'profit' },
        { label: '崩盤至 $80', result: '帳面虧損', description: '以 $95 接刀，現價 $80。', pnlType: 'loss' }
      ]
    },
    chartData: [
      { price: 80, pnl: -15 },
      { price: 90, pnl: -5 },
      { price: 100, pnl: 5 },
      { price: 110, pnl: 5 },
      { price: 120, pnl: 5 },
    ]
  }
];