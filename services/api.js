async function requestJson(path, options) {
  let response;
  try {
    response = await fetch(path, options);
  } catch {
    throw new Error('Unable to reach backend. Start with "npx netlify dev" and try again.');
  }

  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error('Backend returned invalid JSON. Ensure Netlify functions are running.');
  }

  if (!response.ok) {
    const requestId = data.requestId ? ` (requestId: ${data.requestId})` : '';
    const plaidMeta = data.plaidRequestId
      ? ` [plaidRequestId: ${data.plaidRequestId}${data.plaidErrorCode ? `, code: ${data.plaidErrorCode}` : ''}]`
      : '';
    throw new Error((data.error || `Request failed with status ${response.status}`) + plaidMeta + requestId);
  }

  return data;
}

export async function searchInstitutions(query) {
  const q = (query || '').trim();
  const endpoint = q
    ? `/.netlify/functions/plaid-search-institutions?q=${encodeURIComponent(q)}`
    : '/.netlify/functions/plaid-search-institutions';

  const data = await requestJson(endpoint);
  if (!Array.isArray(data.institutions)) {
    throw new Error('Unable to search institutions.');
  }

  return data.institutions;
}

export async function createLinkToken(userId) {
  const data = await requestJson('/.netlify/functions/plaid-create-link-token', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({userId: userId || `user-${Date.now()}`}),
  });

  if (!data.link_token) {
    throw new Error('Unable to create Plaid link token.');
  }

  return data.link_token;
}

export async function exchangePublicToken(publicToken, institutionName) {
  const data = await requestJson('/.netlify/functions/plaid-exchange-public-token', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({publicToken, institutionName}),
  });

  if (!data.ok) {
    throw new Error('Unable to exchange Plaid token.');
  }

  return data;
}
