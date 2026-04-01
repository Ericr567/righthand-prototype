const {getStore} = require('@netlify/blobs');
const {jsonResponse, parseJsonBody} = require('./_lib/http');
const logger = require('./_lib/logger');

async function persistWebhook(eventPayload) {
  const store = getStore({name: 'plaid-webhooks'});
  const key = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  await store.setJSON(key, eventPayload);
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {error: 'Method not allowed'});
  }

  try {
    const payload = parseJsonBody(event);

    const configuredSecret = process.env.PLAID_WEBHOOK_SECRET;
    const receivedSecret = event.headers?.['x-plaid-webhook-secret'] || event.headers?.['X-Plaid-Webhook-Secret'];

    if (configuredSecret && receivedSecret !== configuredSecret) {
      return jsonResponse(401, {error: 'Unauthorized webhook'});
    }

    const eventPayload = {
      webhookType: payload.webhook_type || 'unknown',
      webhookCode: payload.webhook_code || 'unknown',
      itemId: payload.item_id || null,
      environment: payload.environment || null,
      receivedAt: new Date().toISOString(),
      payload,
    };

    await persistWebhook(eventPayload);

    logger.info('Received Plaid webhook', {
      webhookType: eventPayload.webhookType,
      webhookCode: eventPayload.webhookCode,
      itemId: eventPayload.itemId,
    });

    return jsonResponse(200, {ok: true});
  } catch (error) {
    logger.error('plaid-webhook failed', {error: error.message});
    return jsonResponse(500, {error: 'Failed to process webhook'});
  }
};
