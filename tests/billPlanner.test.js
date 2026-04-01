const test = require('node:test');
const assert = require('node:assert/strict');

const {computeCertaintyScore, buildRiskAlerts, normalizeBill} = require('../utils/billPlanner');

test('computeCertaintyScore returns 100 for empty bill list', () => {
  assert.equal(computeCertaintyScore([]), 100);
});

test('normalizeBill computes remaining and coverage', () => {
  const now = new Date('2026-03-10T12:00:00Z');
  const out = normalizeBill({amount: 200, saved: 50, due: 15}, now);
  assert.equal(out.remaining, 150);
  assert.equal(out.coverage, 0.25);
  assert.ok(out.days >= 1);
});

test('buildRiskAlerts returns urgent underfunded bills', () => {
  const now = new Date('2026-03-20T12:00:00Z');
  const alerts = buildRiskAlerts([
    {id: 'a', name: 'Rent', amount: 1200, saved: 300, due: 22},
    {id: 'b', name: 'Phone', amount: 80, saved: 80, due: 21},
    {id: 'c', name: 'Power', amount: 140, saved: 60, due: 24},
  ], now);

  assert.equal(alerts.length, 2);
  assert.equal(alerts[0].name, 'Rent');
  assert.ok(alerts[0].dailyMove >= 1);
});
