const {getStore} = require('@netlify/blobs');
const {jsonResponse, parseJsonBody, getHeader, getRequestId} = require('./_lib/http');
const logger = require('./_lib/logger');

function classifyWebhook(payload) {
  const type = payload.webhook_type || 'unknown';
  const code = payload.webhook_code || 'unknown';
  if (type === 'TRANSACTIONS') return 'transactions';
  if (type === 'ITEM') return 'item';
  if (type === 'AUTH') return 'auth';
  return `${type}:${code}`.toLowerCase();
}

function buildDedupKey(payload) {
  if (payload.webhook_id) return `webhook:${payload.webhook_id}`;
  if (payload.event_id) return `event:${payload.event_id}`;
  return [
    payload.webhook_type || 'unknown',
    payload.webhook_code || 'unknown',
    payload.item_id || 'unknown',
    payload.new_transactions ?? 'na',
    payload.timestamp || Date.now(),
  ].join(':');
}

async function markProcessed(dedupKey) {
  const store = getStore({name: 'plaid-webhook-dedupe'});
  const key = `dedupe:${dedupKey}`;
  const exists = await store.get(key, {type: 'json'});
  if (exists) return false;
  await store.setJSON(key, {processedAt: new Date().toISOString()});
  return true;
}

async function persistWebhook(eventPayload) {
  const store = getStore({name: 'plaid-webhooks'});
  const key = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await store.setJSON(key, eventPayload);
}

async function updateItemHealth(payload) {
  if (!payload.item_id) return;
  const store = getStore({name: 'plaid-item-health'});
  const key = `item:${payload.item_id}`;
  const existing = (await store.get(key, {type: 'json'})) || {};
  await store.setJSON(key, {
    ...existing,
    lastWebhookType: payload.webhook_type || null,
    lastWebhookCode: payload.webhook_code || null,
    error: payload.error || null,
    updatedAt: new Date().toISOString(),
  });
}

async function updateTransactionSync(payload) {
  if (!payload.item_id) return;
  const store = getStore({name: 'plaid-transactions-sync'});
  const key = `item:${payload.item_id}`;
  const existing = (await store.get(key, {type: 'json'})) || {};
  await store.setJSON(key, {
    ...existing,
    pendingWork: true,
    webhookCode: payload.webhook_code || null,
    newTransactions: payload.new_transactions || 0,
    removedTransactions: payload.removed_transactions || 0,
    updatedAt: new Date().toISOString(),
  });
}

async function processWebhook(payload) {
  if (payload.webhook_type === 'ITEM') {
    await updateItemHealth(payload);
    return;
  }

  if (payload.webhook_type === 'TRANSACTIONS') {
    await updateTransactionSync(payload);
  }
}

exports.handler = async function handler(event) {
  const requestId = getRequestId(event);

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {error: 'Method not allowed'}, event);
  }

  try {
    const payload = parseJsonBody(event);

    const configuredSecret = process.env.PLAID_WEBHOOK_SECRET;
    const receivedSecret = getHeader(event.headers, 'x-plaid-webhook-secret');

    if (configuredSecret && receivedSecret !== configuredSecret) {
      return jsonResponse(401, {error: 'Unauthorized webhook'}, event);
    }

    const dedupKey = buildDedupKey(payload);
    const shouldProcess = await markProcessed(dedupKey);
    if (!shouldProcess) {
      logger.info('Ignored duplicate Plaid webhook', {dedupKey, requestId});
      return jsonResponse(200, {ok: true, duplicate: true}, event);
    }

    const eventPayload = {
      webhookType: payload.webhook_type || 'unknown',
      webhookCode: payload.webhook_code || 'unknown',
      itemId: payload.item_id || null,
      environment: payload.environment || null,
      category: classifyWebhook(payload),
      dedupKey,
      receivedAt: new Date().toISOString(),
      payload,
    };

    await persistWebhook(eventPayload);
    await processWebhook(payload);

    logger.info('Received Plaid webhook', {
      webhookType: eventPayload.webhookType,
      webhookCode: eventPayload.webhookCode,
      itemId: eventPayload.itemId,
      dedupKey,
      requestId,
    });

    return jsonResponse(200, {ok: true}, event);
  } catch (error) {
    logger.error('plaid-webhook failed', {error: error.message, requestId});
    return jsonResponse(500, {error: 'Failed to process webhook'}, event);
  }
};

module.exports.__testables = {
  buildDedupKey,
  classifyWebhook,
};
