export interface Bill {
  id: string;
  name: string;
  value: number;
  isRecurring?: boolean;
  recurringAmount?: number;
}

export type CategoryType = 'personal' | 'joint';

export interface FinancialData {
  personal: Bill[];
  joint: Bill[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill: string;
}