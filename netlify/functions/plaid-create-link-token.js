const {Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode} = require('plaid');

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
    return {
      statusCode: 405,
      body: JSON.stringify({error: 'Method not allowed'}),
    };
  }

  try {
    const plaidClient = getPlaidClient();
    const body = event.body ? JSON.parse(event.body) : {};
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
    return {
      statusCode: 200,
      body: JSON.stringify({link_token: response.data.link_token}),
    };
  } catch (error) {
    console.error('plaid-create-link-token failed', error.response?.data || error.message);
    const isConfigError = typeof error.message === 'string' && error.message.startsWith('Missing PLAID_');
    const statusCode = isConfigError ? 400 : 500;
    const safeError = isConfigError
      ? `${error.message}. Add it to your local .env and Netlify environment variables.`
      : 'Failed to create link token';
    return {
      statusCode,
      body: JSON.stringify({error: safeError}),
    };
  }
};
