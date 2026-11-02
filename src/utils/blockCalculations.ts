/**
 * Business logic for construction blocks, masonry calculations, pallet loads, and freight estimation.
 */

export interface BlockProduct {
  id: string;
  name: string;
  code: string;
  category: 'concreto' | 'ceramica' | 'paver' | 'canaleta';
  dimensions: string; // e.g. "14 x 19 x 39 cm"
  weightKg: number; // weight in kg
  blocksPerM2: number; // units per square meter of wall/pavement
  unitsPerPallet: number;
  unitPriceBRL: number; // R$ average unit price
  color: string; // theme color
  shareOfSales: number; // percentage mix in the store
}

export const BLOCK_CATALOG: BlockProduct[] = [
  {
    id: 'bloco-concreto-14',
    name: 'Bloco de Concreto Estrutural',
    code: 'BCE-14',
    category: 'concreto',
    dimensions: '14 x 19 x 39 cm',
    weightKg: 11.5,
    blocksPerM2: 12.5,
    unitsPerPallet: 108,
    unitPriceBRL: 4.30,
    color: '#3b82f6', // blue
    shareOfSales: 45,
  },
  {
    id: 'bloco-concreto-09',
    name: 'Bloco Concreto Vedação',
    code: 'BCV-09',
    category: 'concreto',
    dimensions: '09 x 19 x 39 cm',
    weightKg: 7.8,
    blocksPerM2: 12.5,
    unitsPerPallet: 144,
    unitPriceBRL: 3.40,
    color: '#06b6d4', // cyan
    shareOfSales: 22,
  },
  {
    id: 'bloco-ceramico-8f',
    name: 'Bloco Cerâmico 8 Furos (Tijolo)',
    code: 'BCER-8F',
    category: 'ceramica',
    dimensions: '09 x 19 x 19 cm',
    weightKg: 2.3,
    blocksPerM2: 25.0,
    unitsPerPallet: 500,
    unitPriceBRL: 1.65,
    color: '#f97316', // orange
    shareOfSales: 18,
  },
  {
    id: 'paver-concreto',
    name: 'Piso Intertravado Paver 16 Faces',
    code: 'PAV-16',
    category: 'paver',
    dimensions: '10 x 20 x 06 cm',
    weightKg: 3.8,
    blocksPerM2: 35.0,
    unitsPerPallet: 360,
    unitPriceBRL: 2.15,
    color: '#10b981', // emerald
    shareOfSales: 10,
  },
  {
    id: 'canaleta-concreto-14',
    name: 'Canaleta U & Meio Bloco',
    code: 'CAN-14',
    category: 'canaleta',
    dimensions: '14 x 19 x 39 cm',
    weightKg: 10.5,
    blocksPerM2: 2.5, // per linear meter
    unitsPerPallet: 120,
    unitPriceBRL: 4.85,
    color: '#a855f7', // purple
    shareOfSales: 5,
  },
];

export interface WallCalculationResult {
  wallAreaM2: number;
  wastePercentage: number;
  totalBlocksRequired: number;
  totalPallets: number;
  totalWeightKg: number;
  totalWeightTons: number;
  estimatedCostBRL: number;
  recommendedTruck: {
    type: string;
    maxCapacityKg: number;
    truckTrips: number;
    description: string;
  };
}

/**
 * Calculates blocks, pallets, weight and recommended logistics for a given wall or pavement area
 */
export function calculateWallMaterials(
  wallAreaM2: number,
  block: BlockProduct,
  wastePercentage: number = 5
): WallCalculationResult {
  const safeArea = Math.max(0, wallAreaM2);
  const safeWaste = Math.max(0, wastePercentage);

  const baseBlocks = Math.ceil(safeArea * block.blocksPerM2);
  const totalBlocksRequired = Math.ceil(baseBlocks * (1 + safeWaste / 100));
  const totalPallets = Math.ceil(totalBlocksRequired / block.unitsPerPallet);
  const totalWeightKg = Math.round(totalBlocksRequired * block.weightKg);
  const totalWeightTons = Number((totalWeightKg / 1000).toFixed(2));
  const estimatedCostBRL = Number((totalBlocksRequired * block.unitPriceBRL).toFixed(2));

  // Determine truck logistics
  let recommendedTruck;
  if (totalWeightKg <= 3500) {
    recommendedTruck = {
      type: 'Caminhão 3/4 (VUC Urbano)',
      maxCapacityKg: 3500,
      truckTrips: 1,
      description: 'Ideal para entregas urbanas ou bairros com restrição de tráfego pesado.',
    };
  } else if (totalWeightKg <= 6000) {
    recommendedTruck = {
      type: 'Caminhão Toco (2 eixos)',
      maxCapacityKg: 6000,
      truckTrips: 1,
      description: 'Capacidade de até 6 toneladas com agilidade no descarregamento.',
    };
  } else if (totalWeightKg <= 14000) {
    recommendedTruck = {
      type: 'Caminhão Truck (3 eixos)',
      maxCapacityKg: 14000,
      truckTrips: 1,
      description: 'Excelente custo-benefício para obras residenciais de médio porte.',
    };
  } else if (totalWeightKg <= 28000) {
    recommendedTruck = {
      type: 'Carreta / Cavalo Mecânico (28T)',
      maxCapacityKg: 28000,
      truckTrips: 1,
      description: 'Transporte direto da fábrica para grandes canteiros de obras.',
    };
  } else {
    const trips = Math.ceil(totalWeightKg / 28000);
    recommendedTruck = {
      type: 'Frota de Carretas Pesadas (28T)',
      maxCapacityKg: 28000,
      truckTrips: trips,
      description: `Demanda de grande porte: necessidade de ${trips} viagens em carreta 28T.`,
    };
  }

  return {
    wallAreaM2: safeArea,
    wastePercentage: safeWaste,
    totalBlocksRequired,
    totalPallets,
    totalWeightKg,
    totalWeightTons,
    estimatedCostBRL,
    recommendedTruck,
  };
}

/**
 * Formats Brazilian currency (R$)
 */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  });
}

/**
 * Formats unit count with thousand separators (e.g. 76.454 un)
 */
export function formatUnits(value: number, suffix: string = 'un'): string {
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ${suffix}`;
}

/**
 * Calculates estimated revenue given block units and average price
 */
export function calculateRevenueFromUnits(units: number, avgPrice: number = 4.30): number {
  return Math.round(units * avgPrice);
}
