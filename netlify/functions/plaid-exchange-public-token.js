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

    // Prototype: return a short confirmation only.
    // In production, persist encrypted access_token + item_id in your backend datastore.
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        institutionName,
        itemId: exchange.data.item_id,
      }),
    };
  } catch (error) {
    console.error('plaid-exchange-public-token failed', error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({error: 'Failed to exchange public token'}),
    };
  }
};
