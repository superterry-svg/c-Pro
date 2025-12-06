export interface ChartDataPoint {
  price: number;
  pnl: number;
}

export interface Scenario {
  label: string; // e.g. "股價大漲至 $120"
  result: string; // e.g. "獲利 $1500"
  description: string; // detailed calculation logic
  pnlType: 'profit' | 'loss' | 'neutral';
}

export interface StrategyExample {
  setup: string; // The initial trade setup context
  scenarios: Scenario[];
}

export interface Strategy {
  id: string;
  name: string;
  engName: string;
  category: string;
  usage: string;
  risk: string;
  reward: string;
  features: string[];
  explanation: string; 
  example: StrategyExample; // New detailed example field
  chartData: ChartDataPoint[]; 
}

export interface Category {
  id: string;
  title: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

// --- Calculator Types ---

export interface CalcParam {
  key: string;
  label: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}

export interface CalculatorConfig {
  defaultPrice: number;
  params: CalcParam[];
  calculate: (currentPrice: number, params: Record<string, number>) => {
    chartData: ChartDataPoint[];
    scenarios: Scenario[];
    summary: { maxProfit: string; maxLoss: string; breakEven: string };
  };
}