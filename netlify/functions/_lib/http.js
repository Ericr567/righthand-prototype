const crypto = require('crypto');

function getHeader(headers, name) {
  if (!headers) return undefined;
  const key = Object.keys(headers).find((entry) => entry.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : undefined;
}

function getRequestId(event) {
  return (
    getHeader(event?.headers, 'x-request-id') ||
    event?.requestContext?.requestId ||
    crypto.randomUUID()
  );
}

function jsonResponse(statusCode, payload, event, extraHeaders = {}) {
  const requestId = getRequestId(event);
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Request-Id': requestId,
      ...extraHeaders,
    },
    body: JSON.stringify({...payload, requestId}),
  };
}

function parseJsonBody(event) {
  if (!event.body) return {};
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;
    return JSON.parse(raw);
  } catch {
    const error = new Error('Invalid JSON request body');
    error.statusCode = 400;
    throw error;
  }
}

module.exports = {
  getRequestId,
  getHeader,
  jsonResponse,
  parseJsonBody,
};
