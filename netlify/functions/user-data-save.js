const {getStore} = require('@netlify/blobs');
const {jsonResponse, parseJsonBody, getRequestId} = require('./_lib/http');
const {requireAuthenticatedUser} = require('./_lib/auth');
const logger = require('./_lib/logger');
const {allowRequest, getClientKey} = require('./_lib/rateLimit');
const {assertAllowedFields, requireObject} = require('./_lib/validation');

async function setUserState(userId, state) {
  const store = getStore({name: 'user-app-state'});
  await store.setJSON(`user:${userId}`, {
    ...state,
    updatedAt: new Date().toISOString(),
  });
}

exports.handler = async function handler(event) {
  const requestId = getRequestId(event);

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {error: 'Method not allowed'}, event);
  }

  const limiter = allowRequest(`user-data-save:${getClientKey(event)}`, 45, 60000);
  if (!limiter.allowed) {
    return jsonResponse(429, {error: 'Too many requests. Please try again soon.'}, event);
  }

  try {
    const {user} = await requireAuthenticatedUser(event);
    const body = parseJsonBody(event);
    assertAllowedFields(body, ['state']);
    const state = requireObject(body.state, 'state');

    await setUserState(user.id, state);
    return jsonResponse(200, {ok: true}, event);
  } catch (error) {
    logger.error('user-data-save failed', {error: error.message, requestId});
    return jsonResponse(error.statusCode || 500, {error: error.message || 'Failed to save user data'}, event);
  }
};
