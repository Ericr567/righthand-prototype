async function requestJson(path, options = {}) {
  let response;
  try {
    response = await fetch(path, options);
  } catch {
    throw new Error('Unable to reach backend. Start with "npx netlify dev" and try again.');
  }

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('Backend returned invalid JSON. Verify Netlify functions are running correctly.');
  }

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

function buildAuthHeaders(accessToken) {
  const headers = {'Content-Type': 'application/json'};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

export async function loadUserAppState(accessToken) {
  const data = await requestJson('/.netlify/functions/user-data-get', {
    method: 'GET',
    headers: buildAuthHeaders(accessToken),
  });
  return data.state || null;
}

export async function saveUserAppState(accessToken, state) {
  return requestJson('/.netlify/functions/user-data-save', {
    method: 'POST',
    headers: buildAuthHeaders(accessToken),
    body: JSON.stringify({state}),
  });
}
