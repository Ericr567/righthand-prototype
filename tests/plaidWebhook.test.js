const test = require('node:test');
const assert = require('node:assert/strict');

const {__testables} = require('../netlify/functions/plaid-webhook');

test('classifyWebhook identifies transactions events', () => {
  const out = __testables.classifyWebhook({webhook_type: 'TRANSACTIONS', webhook_code: 'SYNC_UPDATES_AVAILABLE'});
  assert.equal(out, 'transactions');
});

test('classifyWebhook identifies item events', () => {
  const out = __testables.classifyWebhook({webhook_type: 'ITEM', webhook_code: 'ERROR'});
  assert.equal(out, 'item');
});

test('buildDedupKey prefers webhook_id', () => {
  const out = __testables.buildDedupKey({webhook_id: 'wh_123', webhook_type: 'ITEM'});
  assert.equal(out, 'webhook:wh_123');
});

test('buildDedupKey falls back to composite signature', () => {
  const out = __testables.buildDedupKey({
    webhook_type: 'TRANSACTIONS',
    webhook_code: 'DEFAULT_UPDATE',
    item_id: 'item_1',
    new_transactions: 4,
    timestamp: 1234,
  });

  assert.equal(out, 'TRANSACTIONS:DEFAULT_UPDATE:item_1:4:1234');
});
