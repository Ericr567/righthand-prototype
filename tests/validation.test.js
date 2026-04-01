const test = require('node:test');
const assert = require('node:assert/strict');

const {
  requireString,
  optionalString,
  requireObject,
  assertAllowedFields,
} = require('../netlify/functions/_lib/validation');

test('requireString trims and returns a value', () => {
  assert.equal(requireString(' abc ', 'field'), 'abc');
});

test('requireString throws on empty input', () => {
  assert.throws(() => requireString('', 'field'), /field is required/);
});

test('optionalString returns null for empty values', () => {
  assert.equal(optionalString('', 'field'), null);
  assert.equal(optionalString(undefined, 'field'), null);
});

test('requireObject rejects arrays', () => {
  assert.throws(() => requireObject([], 'state'), /state must be an object/);
});

test('assertAllowedFields rejects unknown fields', () => {
  assert.throws(() => assertAllowedFields({a: 1, b: 2}, ['a']), /Unexpected fields: b/);
});
