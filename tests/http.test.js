const test = require('node:test');
const assert = require('node:assert/strict');

const {jsonResponse, parseJsonBody} = require('../netlify/functions/_lib/http');

test('jsonResponse includes request id header and payload field', () => {
  const event = {headers: {'x-request-id': 'abc-123'}};
  const out = jsonResponse(200, {ok: true}, event);
  const payload = JSON.parse(out.body);

  assert.equal(out.headers['X-Request-Id'], 'abc-123');
  assert.equal(payload.ok, true);
  assert.equal(payload.requestId, 'abc-123');
});

test('parseJsonBody throws on invalid json', () => {
  assert.throws(() => parseJsonBody({body: '{broken'}), /Invalid JSON request body/);
});

test('parseJsonBody supports base64 payloads', () => {
  const body = Buffer.from(JSON.stringify({a: 1}), 'utf8').toString('base64');
  const out = parseJsonBody({body, isBase64Encoded: true});
  assert.equal(out.a, 1);
});
