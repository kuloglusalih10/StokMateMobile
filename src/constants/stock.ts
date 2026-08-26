export const STOCK_STATUS_COLORS = {
  healthy: '#0E0F0C',
  low: '#F2994A',
  out: '#EB5757',
} as const;

export type StockHealth = keyof typeof STOCK_STATUS_COLORS;

export const getStockHealth = (stock: number, minStock: number): StockHealth => {
  if (stock <= 0) return 'out';
  if (stock <= minStock) return 'low';
  return 'healthy';
};
