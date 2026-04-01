const {getStore} = require('@netlify/blobs');
const {jsonResponse, getRequestId} = require('./_lib/http');
const {requireAuthenticatedUser} = require('./_lib/auth');
const logger = require('./_lib/logger');
const {allowRequest, getClientKey} = require('./_lib/rateLimit');

async function getUserState(userId) {
  const store = getStore({name: 'user-app-state'});
  return store.get(`user:${userId}`, {type: 'json'});
}

exports.handler = async function handler(event) {
  const requestId = getRequestId(event);

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, {error: 'Method not allowed'}, event);
  }

  const limiter = allowRequest(`user-data-get:${getClientKey(event)}`, 60, 60000);
  if (!limiter.allowed) {
    return jsonResponse(429, {error: 'Too many requests. Please try again soon.'}, event);
  }

  try {
    const {user} = await requireAuthenticatedUser(event);
    const state = await getUserState(user.id);
    return jsonResponse(200, {state: state || null}, event);
  } catch (error) {
    logger.error('user-data-get failed', {error: error.message, requestId});
    return jsonResponse(error.statusCode || 500, {error: error.message || 'Failed to fetch user data'}, event);
  }
};
