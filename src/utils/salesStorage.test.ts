import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCTS,
  createDateLabel,
  addMultiSaleEntry,
  removeSaleEntry,
  aggregateTimeline,
  SaleEntry,
} from './salesStorage';

test('PRODUCTS contains 5 requested products with specified colors', () => {
  assert.equal(PRODUCTS.length, 5);
  const b14 = PRODUCTS.find((p) => p.id === 'bloco14');
  assert.equal(b14?.color, '#eab308'); // Amarelo

  const c14 = PRODUCTS.find((p) => p.id === 'canaleta14');
  assert.equal(c14?.color, '#ef4444'); // Vermelho

  const b9 = PRODUCTS.find((p) => p.id === 'bloco9');
  assert.equal(b9?.color, '#3b82f6'); // Azul

  const ping = PRODUCTS.find((p) => p.id === 'pingadeira');
  assert.equal(ping?.color, '#22c55e'); // Verde

  const pav = PRODUCTS.find((p) => p.id === 'pavers');
  assert.equal(pav?.color, '#ffffff'); // Branco
});

test('addMultiSaleEntry adds sale with product identifier and sorts', () => {
  const initial: SaleEntry[] = [];
  const after1 = addMultiSaleEntry(initial, 'bloco14', 500, '2026-05-01');
  const after2 = addMultiSaleEntry(after1, 'canaleta14', 200, '2026-05-01');

  assert.equal(after2.length, 2);
  assert.equal(after2[0].product, 'bloco14');
  assert.equal(after2[1].product, 'canaleta14');
});

test('aggregateTimeline groups sales by label with distinct product values', () => {
  const list: SaleEntry[] = [
    {
      id: '1',
      product: 'bloco14',
      date: '2026-05-01',
      label: 'mai 26',
      units: 1000,
      timestamp: 100,
    },
    {
      id: '2',
      product: 'bloco9',
      date: '2026-05-01',
      label: 'mai 26',
      units: 500,
      timestamp: 100,
    },
    {
      id: '3',
      product: 'canaleta14',
      date: '2026-06-01',
      label: 'jun 26',
      units: 300,
      timestamp: 200,
    },
  ];

  const timeline = aggregateTimeline(list);
  assert.equal(timeline.length, 2);
  assert.equal(timeline[0].label, 'mai 26');
  assert.equal(timeline[0].values.bloco14, 1000);
  assert.equal(timeline[0].values.bloco9, 500);
  assert.equal(timeline[0].values.canaleta14, 0);
  assert.equal(timeline[0].total, 1500);

  assert.equal(timeline[1].label, 'jun 26');
  assert.equal(timeline[1].values.canaleta14, 300);
});
