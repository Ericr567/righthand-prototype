const crypto = require('crypto');
const {getStore} = require('@netlify/blobs');
const {Configuration, PlaidApi, PlaidEnvironments} = require('plaid');

function getPlaidClient() {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
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
  const raw = process.env.PLAID_TOKEN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('Missing PLAID_TOKEN_ENCRYPTION_KEY');
  }

  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('PLAID_TOKEN_ENCRYPTION_KEY must decode to 32 bytes (base64-encoded)');
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
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({error: 'Method not allowed'}),
    };
  }

  try {
    const plaidClient = getPlaidClient();
    const body = event.body ? JSON.parse(event.body) : {};
    const publicToken = body.publicToken;
    const institutionName = body.institutionName || null;

    if (!publicToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({error: 'Missing publicToken'}),
      };
    }

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

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        institutionName,
        itemId,
      }),
    };
  } catch (error) {
    console.error('plaid-exchange-public-token failed', error.response?.data || error.message);
    const message = typeof error.message === 'string' ? error.message : '';
    const isConfigError =
      message.startsWith('Missing PLAID_') ||
      message.includes('PLAID_TOKEN_ENCRYPTION_KEY must decode to 32 bytes');
    const statusCode = isConfigError ? 400 : 500;
    const safeError = isConfigError
      ? `${message}. Verify local .env and Netlify environment variables.`
      : 'Failed to exchange public token';
    return {
      statusCode,
      body: JSON.stringify({error: safeError}),
    };
  }
};
