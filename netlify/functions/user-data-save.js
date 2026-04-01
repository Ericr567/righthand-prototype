const {getStore} = require('@netlify/blobs');
const {jsonResponse, parseJsonBody} = require('./_lib/http');
const {requireAuthenticatedUser} = require('./_lib/auth');
const logger = require('./_lib/logger');

async function setUserState(userId, state) {
  const store = getStore({name: 'user-app-state'});
  await store.setJSON(`user:${userId}`, {
    ...state,
    updatedAt: new Date().toISOString(),
  });
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {error: 'Method not allowed'});
  }

  try {
    const {user} = await requireAuthenticatedUser(event);
    const body = parseJsonBody(event);

    if (!body.state || typeof body.state !== 'object') {
      return jsonResponse(400, {error: 'Missing state payload'});
    }

    await setUserState(user.id, body.state);
    return jsonResponse(200, {ok: true});
  } catch (error) {
    logger.error('user-data-save failed', {error: error.message});
    return jsonResponse(error.statusCode || 500, {error: error.message || 'Failed to save user data'});
  }
};
