import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSeriesStats,
  getCoordinates,
  generateSmoothPath,
  generateAreaPath,
  filterDataByRange,
} from './chartMath';

test('calculateSeriesStats accurately computes min, max, sum, and growth', () => {
  const data = [100, 200, 150, 300];
  const stats = calculateSeriesStats(data);

  assert.equal(stats.min, 100);
  assert.equal(stats.max, 300);
  assert.equal(stats.sum, 750);
  assert.equal(stats.avg, 188); // 750 / 4 = 187.5 -> rounded to 188
  assert.equal(stats.first, 100);
  assert.equal(stats.last, 300);
  assert.equal(stats.growthPct, 200); // ((300 - 100) / 100) * 100 = 200%
});

test('calculateSeriesStats handles empty or single element array', () => {
  const emptyStats = calculateSeriesStats([]);
  assert.equal(emptyStats.sum, 0);

  const singleStats = calculateSeriesStats([500]);
  assert.equal(singleStats.min, 500);
  assert.equal(singleStats.max, 500);
  assert.equal(singleStats.growthPct, 0);
});

test('getCoordinates scales within width and height bounds with padding', () => {
  const data = [10, 50, 100];
  const width = 500;
  const height = 200;
  const padding = { top: 10, right: 10, bottom: 20, left: 10 };

  const coords = getCoordinates(data, width, height, padding);
  assert.equal(coords.length, 3);

  // First point should be at x = padding.left, y = bottom bound (top + usableHeight)
  assert.equal(coords[0].x, 10);
  assert.equal(coords[0].y, 10 + (200 - 10 - 20)); // Lowest value at bottom

  // Last point should be at right bound, y = top bound
  assert.equal(coords[2].x, 500 - 10);
  assert.equal(coords[2].y, 10); // Highest value at top
});

test('generateSmoothPath produces valid SVG bezier commands', () => {
  const points = [
    { x: 10, y: 100 },
    { x: 50, y: 40 },
    { x: 90, y: 80 },
  ];
  const path = generateSmoothPath(points);
  assert.ok(path.startsWith('M 10 100'));
  assert.ok(path.includes('C '));
});

test('generateAreaPath closes down to baseline', () => {
  const points = [
    { x: 10, y: 100 },
    { x: 50, y: 40 },
  ];
  const area = generateAreaPath(points, 200);
  assert.ok(area.startsWith('M 10 100'));
  assert.ok(area.includes('L 50.00 200.00'));
  assert.ok(area.endsWith('Z'));
});

test('filterDataByRange slices array appropriately', () => {
  const data = Array.from({ length: 125 }, (_, i) => i + 1);

  const filter1Y = filterDataByRange(data, '1Y');
  assert.equal(filter1Y.data.length, 12);
  assert.equal(filter1Y.data[filter1Y.data.length - 1], 125);

  const filter5Y = filterDataByRange(data, '5Y');
  assert.equal(filter5Y.data.length, 60);

  const filterAll = filterDataByRange(data, 'ALL');
  assert.equal(filterAll.data.length, 125);
});
