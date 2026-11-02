import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BLOCK_CATALOG,
  calculateWallMaterials,
  formatBRL,
  formatUnits,
  calculateRevenueFromUnits,
} from './blockCalculations';

test('BLOCK_CATALOG contains products and shares sum up to 100%', () => {
  assert.ok(BLOCK_CATALOG.length >= 4);
  const totalShare = BLOCK_CATALOG.reduce((acc, p) => acc + p.shareOfSales, 0);
  assert.equal(totalShare, 100);
});

test('calculateWallMaterials calculates correct quantity, pallets and truck for 100m2 wall', () => {
  const block14 = BLOCK_CATALOG[0]; // BCE-14, 12.5 blocks/m2, 11.5 kg/block, 108/pallet
  // 100 m2 * 12.5 = 1250 base blocks
  // 5% waste -> 1250 * 1.05 = 1312.5 -> 1313 blocks
  const result = calculateWallMaterials(100, block14, 5);

  assert.equal(result.wallAreaM2, 100);
  assert.equal(result.totalBlocksRequired, 1313);
  // Pallets: ceil(1313 / 108) = 13
  assert.equal(result.totalPallets, 13);
  // Weight: 1313 * 11.5 = 15099.5 -> 15100 kg
  assert.equal(result.totalWeightKg, 15100);
  assert.equal(result.totalWeightTons, 15.1);
  // Cost: 1313 * 4.30 = 5645.90
  assert.equal(result.estimatedCostBRL, 5645.90);
  // 15.1 tons needs Carreta (up to 28t)
  assert.equal(result.recommendedTruck.type, 'Carreta / Cavalo Mecânico (28T)');
  assert.equal(result.recommendedTruck.truckTrips, 1);
});

test('calculateWallMaterials selects smaller truck for small area', () => {
  const block14 = BLOCK_CATALOG[0];
  const result = calculateWallMaterials(10, block14, 0); // 125 blocks * 11.5kg = 1438 kg
  assert.equal(result.totalWeightKg, 1438);
  assert.equal(result.recommendedTruck.type, 'Caminhão 3/4 (VUC Urbano)');
});

test('formatBRL formats Brazilian Real values accurately', () => {
  const formatted = formatBRL(1250.5);
  assert.ok(formatted.includes('R$'));
  assert.ok(formatted.includes('1.250,50') || formatted.includes('1250,50') || formatted.includes('1.250'));
});

test('formatUnits formats unit counts with suffix', () => {
  assert.equal(formatUnits(76454), '76.454 un');
});

test('calculateRevenueFromUnits computes total with given unit price', () => {
  assert.equal(calculateRevenueFromUnits(1000, 4.30), 4300);
});
