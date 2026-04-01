const {Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode} = require('plaid');
const {jsonResponse, parseJsonBody} = require('./_lib/http');
const {requireEnv} = require('./_lib/env');
const logger = require('./_lib/logger');
const {allowRequest, getClientKey} = require('./_lib/rateLimit');

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

function parseProducts(raw) {
  const defaultProducts = [Products.Auth, Products.Transactions];
  if (!raw) return defaultProducts;
  const tokens = raw.split(',').map((v) => v.trim().toLowerCase()).filter(Boolean);
  if (!tokens.length) return defaultProducts;
  return tokens.map((name) => Products[name.charAt(0).toUpperCase() + name.slice(1)] || name);
}

function parseCountryCodes(raw) {
  const defaultCountries = [CountryCode.Us];
  if (!raw) return defaultCountries;
  const tokens = raw.split(',').map((v) => v.trim().toUpperCase()).filter(Boolean);
  if (!tokens.length) return defaultCountries;
  return tokens.map((code) => CountryCode[code.charAt(0) + code.slice(1).toLowerCase()] || code);
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {error: 'Method not allowed'});
  }

  const clientKey = getClientKey(event);
  const limiter = allowRequest(`create-link-token:${clientKey}`, 20, 60000);
  if (!limiter.allowed) {
    return jsonResponse(429, {error: 'Too many requests. Please try again soon.'});
  }

  try {
    const plaidClient = getPlaidClient();
    const body = parseJsonBody(event);
    const userId = body.userId || `user-${Date.now()}`;

    const request = {
      user: {client_user_id: userId},
      client_name: 'RightHand',
      products: parseProducts(process.env.PLAID_PRODUCTS),
      country_codes: parseCountryCodes(process.env.PLAID_COUNTRY_CODES),
      language: 'en',
    };

    if (process.env.PLAID_REDIRECT_URI) {
      request.redirect_uri = process.env.PLAID_REDIRECT_URI;
    }

    const response = await plaidClient.linkTokenCreate(request);
    logger.info('Created Plaid link token', {userId});
    return jsonResponse(200, {link_token: response.data.link_token});
  } catch (error) {
    logger.error('plaid-create-link-token failed', {
      error: error.response?.data || error.message,
    });
    const isConfigError = typeof error.message === 'string' && error.message.startsWith('Missing PLAID_');
    const isInputError = error.statusCode === 400;
    const statusCode = isConfigError || isInputError ? 400 : 500;
    const safeError = isConfigError
      ? `${error.message}. Add it to your local .env and Netlify environment variables.`
      : isInputError
        ? error.message
        : 'Failed to create link token';
    return jsonResponse(statusCode, {error: safeError});
  }
};
