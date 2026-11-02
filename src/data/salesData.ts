/**
 * Historical sales dataset for the block store from Jan 2016 to Apr 2026 (125 data points)
 */

export const INITIAL_SALES_DATA: number[] = [
  369, 438, 417, 448, 531, 673, 625, 575, 610, 701, 746, 964, 970, 1180, 1072,
  1348, 2286, 2481, 2875, 4703, 4339, 6468, 10234, 14156, 10221, 10398, 6974,
  9241, 7494, 6404, 7780, 7038, 6626, 6318, 4017, 3743, 3458, 3855, 4105,
  5351, 8575, 10817, 10086, 9631, 8294, 9200, 7570, 7194, 9351, 8600, 6439,
  8659, 9461, 9138, 11323, 11681, 10784, 13781, 19626, 29002, 33114, 45138,
  58919, 57750, 37333, 35041, 41626, 47167, 43791, 61319, 57005, 46306, 38483,
  43193, 45539, 37715, 31792, 19785, 23337, 20050, 19432, 20496, 17169, 16547,
  23139, 23147, 28478, 29269, 27220, 30477, 29230, 25931, 26968, 34668, 37713,
  42265, 42583, 61198, 71334, 60637, 67491, 62678, 64619, 58970, 63330, 70215,
  96449, 93429, 102405, 84373, 82549, 94207, 104638, 107135, 115758, 108237,
  114056, 109556, 90394, 87509, 78621, 66996, 68233, 75776, 76454,
];

export const START_TIMESTAMP = new Date(2016, 0, 1).getTime();
export const END_TIMESTAMP = new Date(2026, 3, 30).getTime();

export function generateLabels(count: number, start = START_TIMESTAMP, end = END_TIMESTAMP): string[] {
  if (count <= 0) return [];
  if (count === 1) {
    const d = new Date(end);
    const month = d.toLocaleDateString('pt-BR', { month: 'short' });
    return [`${month.replace('.', '')} '${String(d.getFullYear()).slice(-2)}`];
  }

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start + (i / (count - 1)) * (end - start));
    const month = d.toLocaleDateString('pt-BR', { month: 'short' });
    return `${month.replace('.', '')} '${String(d.getFullYear()).slice(-2)}`;
  });
}

export function generateFullDates(count: number, start = START_TIMESTAMP, end = END_TIMESTAMP): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start + (i / (count - 1)) * (end - start));
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  });
}

export interface MonthlyRecord {
  index: number;
  label: string;
  fullDate: string;
  units: number;
  revenueBRL: number;
  variationPct: number;
  palletsCount: number;
  weightTons: number;
  topProduct: string;
}

export function buildMonthlyRecords(
  data: number[],
  avgUnitPrice: number = 4.30
): MonthlyRecord[] {
  const labels = generateLabels(data.length);
  const fullDates = generateFullDates(data.length);

  return data.map((units, idx) => {
    const prev = idx > 0 ? data[idx - 1] : units;
    const variationPct = prev > 0 ? Number((((units - prev) / prev) * 100).toFixed(1)) : 0;
    const revenueBRL = Math.round(units * avgUnitPrice);
    const palletsCount = Math.round(units / 108);
    const weightTons = Number(((units * 11.5) / 1000).toFixed(1));

    let topProduct = 'Bloco Concreto 14x19x39';
    if (idx % 4 === 1) topProduct = 'Bloco Vedação 09x19x39';
    else if (idx % 4 === 2) topProduct = 'Bloco Cerâmico 8 Furos';
    else if (idx % 4 === 3) topProduct = 'Piso Paver 16 Faces';

    return {
      index: idx,
      label: labels[idx],
      fullDate: fullDates[idx],
      units,
      revenueBRL,
      variationPct,
      palletsCount,
      weightTons,
      topProduct,
    };
  });
}
