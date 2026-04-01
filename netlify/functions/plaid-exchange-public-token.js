const crypto = require('crypto');
const {getStore} = require('@netlify/blobs');
const {Configuration, PlaidApi, PlaidEnvironments} = require('plaid');
const {jsonResponse, parseJsonBody, getRequestId} = require('./_lib/http');
const {requireEnv} = require('./_lib/env');
const logger = require('./_lib/logger');
const {allowRequest, getClientKey} = require('./_lib/rateLimit');
const {assertAllowedFields, requireString, optionalString} = require('./_lib/validation');

function getPlaidClient() {
  const clientId = requireEnv('PLAID_CLIENT_ID');
  const secret = requireEnv('PLAID_SECRET');
  const envName = (process.env.PLAID_ENV || 'sandbox').toLowerCase();
  const environment = PlaidEnvironments[envName] || PlaidEnvironments.sandbox;

  if (!clientId || !secret) {
    throw new Error('Missing PLAID_CLIENT_ID or PLAID_SECRET');
  }

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

  // Support both base64 and hex key material for easier ops migration.
  const key = raw.length === 64
    ? Buffer.from(raw, 'hex')
    : Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('PLAID_TOKEN_ENCRYPTION_KEY must decode to 32 bytes (base64 or 64-char hex)');
  }

  return key;
}

function encryptAccessToken(accessToken, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(accessToken, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    alg: 'aes-256-gcm',
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
}

async function persistItemSecret(record) {
  const store = getStore({name: 'plaid-items'});
  const key = `item:${record.itemId}`;
  await store.setJSON(key, record);
}

exports.handler = async function handler(event) {
  const requestId = getRequestId(event);

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {error: 'Method not allowed'}, event);
  }

  const clientKey = getClientKey(event);
  const limiter = allowRequest(`exchange-public-token:${clientKey}`, 20, 60000);
  if (!limiter.allowed) {
    return jsonResponse(
      429,
      {error: 'Too many requests. Please try again soon.'},
      event,
      {
        'X-RateLimit-Limit': '20',
        'X-RateLimit-Remaining': String(limiter.remaining),
        'X-RateLimit-Reset': String(limiter.resetAt),
      }
    );
  }

  try {
    const plaidClient = getPlaidClient();
    const body = parseJsonBody(event);
    assertAllowedFields(body, ['publicToken', 'institutionName']);
    const publicToken = requireString(body.publicToken, 'publicToken', 512);
    const institutionName = optionalString(body.institutionName, 'institutionName', 140);

    const exchange = await plaidClient.itemPublicTokenExchange({public_token: publicToken});
    const itemId = exchange.data.item_id;
    const accessToken = exchange.data.access_token;

    if (!itemId || !accessToken) {
      throw new Error('Plaid exchange response missing item_id or access_token');
    }

    const encryptionKey = getEncryptionKey();
    const encryptedToken = encryptAccessToken(accessToken, encryptionKey);
    const nowIso = new Date().toISOString();

    await persistItemSecret({
      itemId,
      institutionName,
      plaidEnv: (process.env.PLAID_ENV || 'sandbox').toLowerCase(),
      encryptedAccessToken: encryptedToken,
      createdAt: nowIso,
      updatedAt: nowIso,
    });

    logger.info('Exchanged Plaid public token', {itemId, institutionName, requestId});

    return jsonResponse(200, {
      ok: true,
      institutionName,
      itemId,
    }, event);
  } catch (error) {
    logger.error('plaid-exchange-public-token failed', {
      error: error.response?.data || error.message,
      requestId,
    });
    const message = typeof error.message === 'string' ? error.message : '';
    const isConfigError =
      message.startsWith('Missing PLAID_') ||
      message.includes('PLAID_TOKEN_ENCRYPTION_KEY must decode to 32 bytes');
    const isInputError = error.statusCode === 400;
    const statusCode = isConfigError || isInputError ? 400 : 500;
    const safeError = isConfigError
      ? `${message}. Verify local .env and Netlify environment variables.`
      : isInputError
        ? message
        : 'Failed to exchange public token';
    return jsonResponse(statusCode, {error: safeError}, event);
  }
};
