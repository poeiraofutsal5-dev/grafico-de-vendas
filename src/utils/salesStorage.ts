/**
 * Utilities for managing persistent sales records across 5 construction block products.
 */

export type ProductType = 'bloco14' | 'canaleta14' | 'bloco9' | 'pingadeira' | 'pavers';

export interface ProductConfig {
  id: ProductType;
  name: string;
  shortName: string;
  color: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  defaultShare: number;
}

export const PRODUCTS: ProductConfig[] = [
  {
    id: 'bloco14',
    name: 'Bloco de 14',
    shortName: 'Bloco 14',
    color: '#eab308', // Amarelo
    borderClass: 'border-yellow-500',
    bgClass: 'bg-yellow-500/10',
    textClass: 'text-yellow-400',
    defaultShare: 0.45,
  },
  {
    id: 'canaleta14',
    name: 'Canaleta de 14',
    shortName: 'Canaleta 14',
    color: '#ef4444', // Vermelho
    borderClass: 'border-red-500',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-400',
    defaultShare: 0.10,
  },
  {
    id: 'bloco9',
    name: 'Bloco de 9',
    shortName: 'Bloco 9',
    color: '#3b82f6', // Azul
    borderClass: 'border-blue-500',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    defaultShare: 0.25,
  },
  {
    id: 'pingadeira',
    name: 'Pingadeira',
    shortName: 'Pingadeira',
    color: '#22c55e', // Verde
    borderClass: 'border-green-500',
    bgClass: 'bg-green-500/10',
    textClass: 'text-green-400',
    defaultShare: 0.08,
  },
  {
    id: 'pavers',
    name: 'Pavers',
    shortName: 'Paver',
    color: '#ffffff', // Branco
    borderClass: 'border-slate-200',
    bgClass: 'bg-white/10',
    textClass: 'text-slate-100',
    defaultShare: 0.12,
  },
];

export interface SaleEntry {
  id: string;
  product: ProductType;
  date: string; // YYYY-MM-DD
  label: string;
  units: number;
  timestamp: number;
}

// Storage key updated to ensure user browser starts from a clean zero state
export const MULTI_STORAGE_KEY = 'bloco_sales_v4_zeroed';

export function createDateLabel(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month) return dateStr;
    const d = new Date(year, month - 1, day || 1);
    const m = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    return `${m} '${String(year).slice(-2)}`;
  } catch {
    return dateStr;
  }
}

/**
 * Builds chronological timeline points grouping all products by month/date label
 */
export interface TimelinePoint {
  date: string;
  label: string;
  timestamp: number;
  values: Record<ProductType, number>;
  total: number;
}

export function aggregateTimeline(entries: SaleEntry[]): TimelinePoint[] {
  const map = new Map<string, TimelinePoint>();

  for (const entry of entries) {
    const key = entry.label;
    let point = map.get(key);
    if (!point) {
      point = {
        date: entry.date,
        label: entry.label,
        timestamp: entry.timestamp,
        values: {
          bloco14: 0,
          canaleta14: 0,
          bloco9: 0,
          pingadeira: 0,
          pavers: 0,
        },
        total: 0,
      };
      map.set(key, point);
    }
    point.values[entry.product] = (point.values[entry.product] || 0) + entry.units;
    point.total += entry.units;
    if (entry.timestamp > point.timestamp) {
      point.timestamp = entry.timestamp;
      point.date = entry.date;
    }
  }

  return Array.from(map.values()).sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Adds a new sale entry and sorts chronologically
 */
export function addMultiSaleEntry(
  current: SaleEntry[],
  product: ProductType,
  units: number,
  dateStr: string
): SaleEntry[] {
  const safeUnits = Math.max(1, Math.round(units));
  const [year, month, day] = dateStr.split('-').map(Number);
  const timestamp = new Date(year, (month || 1) - 1, day || 1).getTime();
  const label = createDateLabel(dateStr);

  const newEntry: SaleEntry = {
    id: `sale-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    product,
    date: dateStr,
    label,
    units: safeUnits,
    timestamp,
  };

  const updated = [...current, newEntry];
  return updated.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Removes a sale entry by id
 */
export function removeSaleEntry(current: SaleEntry[], id: string): SaleEntry[] {
  return current.filter((item) => item.id !== id);
}
