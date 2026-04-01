const crypto = require('crypto');
const {getStore} = require('@netlify/blobs');
const {Configuration, PlaidApi, PlaidEnvironments} = require('plaid');
const {jsonResponse, getRequestId} = require('./_lib/http');
const {requireEnv} = require('./_lib/env');
const logger = require('./_lib/logger');
const {allowRequest, getClientKey} = require('./_lib/rateLimit');

function getPlaidClient() {
  const clientId = requireEnv('PLAID_CLIENT_ID');
  const secret = requireEnv('PLAID_SECRET');
  const envName = (process.env.PLAID_ENV || 'sandbox').toLowerCase();
  const environment = PlaidEnvironments[envName] || PlaidEnvironments.sandbox;

  const config = new Configuration({
    basePath: environment,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': clientId,
        'PLAID-SECRET': secret,
      },
    },
  });

  return new PlaidApi(config);
}

function getEncryptionKey() {
  const raw = requireEnv('PLAID_TOKEN_ENCRYPTION_KEY');
  const key = raw.length === 64
    ? Buffer.from(raw, 'hex')
    : Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('PLAID_TOKEN_ENCRYPTION_KEY must decode to 32 bytes');
  }
  return key;
}

function decryptAccessToken(encrypted, key) {
  const iv = Buffer.from(encrypted.iv, 'base64');
  const authTag = Buffer.from(encrypted.authTag, 'base64');
  const ciphertext = Buffer.from(encrypted.ciphertext, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

async function getItemSecret(itemId) {
  const store = getStore({name: 'plaid-items'});
  return store.get(`item:${itemId}`, {type: 'json'});
}

function parseDate(str, fallback) {
  if (!str) return fallback;
  const d = new Date(str);
  return isNaN(d.getTime()) ? fallback : str;
}

exports.handler = async function handler(event) {
  const requestId = getRequestId(event);

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, {error: 'Method not allowed'}, event);
  }

  const clientKey = getClientKey(event);
  const limiter = allowRequest(`get-transactions:${clientKey}`, 20, 60000);
  if (!limiter.allowed) {
    return jsonResponse(429, {error: 'Too many requests. Please try again soon.'}, event);
  }

  try {
    const itemId = event.queryStringParameters?.itemId;
    if (!itemId || typeof itemId !== 'string' || itemId.length > 128) {
      return jsonResponse(400, {error: 'Missing or invalid itemId parameter'}, event);
    }

    const now = new Date();
    const defaultEnd = now.toISOString().slice(0, 10);
    const defaultStart = new Date(now.setMonth(now.getMonth() - 3)).toISOString().slice(0, 10);

    const startDate = parseDate(event.queryStringParameters?.startDate, defaultStart);
    const endDate = parseDate(event.queryStringParameters?.endDate, defaultEnd);

    const record = await getItemSecret(itemId);
    if (!record) {
      return jsonResponse(404, {error: 'Item not found. Please reconnect your bank.'}, event);
    }

    const encryptionKey = getEncryptionKey();
    const accessToken = decryptAccessToken(record.encryptedAccessToken, encryptionKey);

    const plaidClient = getPlaidClient();
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: {count: 250, offset: 0},
    });

    const transactions = response.data.transactions.map((t) => ({
      transaction_id: t.transaction_id,
      account_id: t.account_id,
      amount: t.amount,
      date: t.date,
      name: t.name,
      merchant_name: t.merchant_name || null,
      category: t.category || [],
      pending: t.pending,
      iso_currency_code: t.iso_currency_code || 'USD',
    }));

    logger.info('Fetched Plaid transactions', {itemId, count: transactions.length, requestId});

    return jsonResponse(200, {
      transactions,
      totalTransactions: response.data.total_transactions,
      startDate,
      endDate,
      itemId,
    }, event);
  } catch (error) {
    const provider = error.response?.data;
    logger.error('plaid-get-transactions failed', {error: provider || error.message, requestId});
    const providerMessage = provider?.error_message || provider?.display_message || null;
    const providerCode = provider?.error_code || null;
    const isConfigError = typeof error.message === 'string' && error.message.startsWith('Missing PLAID_');
    return jsonResponse(
      isConfigError ? 400 : 500,
      {
        error: isConfigError ? error.message : (providerMessage || 'Failed to fetch transactions'),
        plaidErrorCode: providerCode,
      },
      event
    );
  }
};
