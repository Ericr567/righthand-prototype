function requireObject(value, fieldName) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    const error = new Error(`${fieldName} must be an object`);
    error.statusCode = 400;
    throw error;
  }

  return value;
}

function requireString(value, fieldName, maxLen = 512) {
  if (typeof value !== 'string' || !value.trim()) {
    const error = new Error(`${fieldName} is required`);
    error.statusCode = 400;
    throw error;
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLen) {
    const error = new Error(`${fieldName} exceeds max length`);
    error.statusCode = 400;
    throw error;
  }

  return trimmed;
}

function optionalString(value, fieldName, maxLen = 512) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string') {
    const error = new Error(`${fieldName} must be a string`);
    error.statusCode = 400;
    throw error;
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLen) {
    const error = new Error(`${fieldName} exceeds max length`);
    error.statusCode = 400;
    throw error;
  }

  return trimmed;
}

function assertAllowedFields(obj, allowed) {
  const unknown = Object.keys(obj).filter((key) => !allowed.includes(key));
  if (unknown.length) {
    const error = new Error(`Unexpected fields: ${unknown.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
}

module.exports = {
  requireObject,
  requireString,
  optionalString,
  assertAllowedFields,
};