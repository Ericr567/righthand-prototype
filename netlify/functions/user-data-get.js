const {getStore} = require('@netlify/blobs');
const {jsonResponse} = require('./_lib/http');
const {requireAuthenticatedUser} = require('./_lib/auth');
const logger = require('./_lib/logger');

async function getUserState(userId) {
  const store = getStore({name: 'user-app-state'});
  return store.get(`user:${userId}`, {type: 'json'});
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, {error: 'Method not allowed'});
  }

  try {
    const {user} = await requireAuthenticatedUser(event);
    const state = await getUserState(user.id);
    return jsonResponse(200, {state: state || null});
  } catch (error) {
    logger.error('user-data-get failed', {error: error.message});
    return jsonResponse(error.statusCode || 500, {error: error.message || 'Failed to fetch user data'});
  }
};
