/**
 * Pure mathematical functions for chart rendering, Catmull-Rom / Bezier spline generation,
 * statistics, and range filtering.
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Calculates linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Calculates statistics (min, max, average, sum, change) for a series
 */
export function calculateSeriesStats(data: number[]): {
  min: number;
  max: number;
  avg: number;
  sum: number;
  first: number;
  last: number;
  growthPct: number;
} {
  if (!data || data.length === 0) {
    return { min: 0, max: 0, avg: 0, sum: 0, first: 0, last: 0, growthPct: 0 };
  }

  let min = data[0];
  let max = data[0];
  let sum = 0;

  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }

  const first = data[0];
  const last = data[data.length - 1];
  const growthPct = first !== 0 ? ((last - first) / first) * 100 : 0;
  const avg = sum / data.length;

  return {
    min,
    max,
    avg: Math.round(avg),
    sum,
    first,
    last,
    growthPct: Number(growthPct.toFixed(1)),
  };
}

/**
 * Normalizes an array of data points into SVG canvas coordinates
 */
export function getCoordinates(
  data: number[],
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number } = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 20,
  }
): Point[] {
  if (data.length === 0) return [];
  if (data.length === 1) {
    return [{ x: padding.left + (width - padding.left - padding.right) / 2, y: height / 2 }];
  }

  let min = Math.min(...data);
  let max = Math.max(...data);

  // Add slight buffer if flat
  if (min === max) {
    min = min * 0.9;
    max = max * 1.1;
    if (min === max) {
      min = 0;
      max = 1;
    }
  }

  const usableWidth = width - padding.left - padding.right;
  const usableHeight = height - padding.top - padding.bottom;
  const range = max - min;

  return data.map((val, index) => {
    const x = padding.left + (index / (data.length - 1)) * usableWidth;
    const normalizedY = (val - min) / range;
    // In SVG, y=0 is at the top, so we invert
    const y = padding.top + usableHeight * (1 - normalizedY);
    return { x, y };
  });
}

/**
 * Generates an SVG path data string using smooth cubic Bezier splines
 */
export function generateSmoothPath(points: Point[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return path;
}

/**
 * Closes a line path down to the baseline to create an area fill
 */
export function generateAreaPath(points: Point[], baselineY: number): string {
  if (points.length === 0) return '';
  const linePath = generateSmoothPath(points);
  const first = points[0];
  const last = points[points.length - 1];

  return `${linePath} L ${last.x.toFixed(2)} ${baselineY.toFixed(2)} L ${first.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
}

/**
 * Filter slice of dataset according to time range option
 */
export function filterDataByRange<T>(
  data: T[],
  range: '1M' | '6M' | '1Y' | '2Y' | '5Y' | 'ALL'
): { data: T[]; startIndex: number } {
  const total = data.length;
  let count = total;

  switch (range) {
    case '1M':
      count = Math.min(2, total); // Last 2 data points (current and previous)
      break;
    case '6M':
      count = Math.min(6, total);
      break;
    case '1Y':
      count = Math.min(12, total);
      break;
    case '2Y':
      count = Math.min(24, total);
      break;
    case '5Y':
      count = Math.min(60, total);
      break;
    case 'ALL':
    default:
      count = total;
      break;
  }

  const startIndex = total - count;
  return {
    data: data.slice(startIndex),
    startIndex,
  };
}
