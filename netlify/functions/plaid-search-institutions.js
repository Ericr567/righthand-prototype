const {Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode} = require('plaid');
const {jsonResponse, getRequestId} = require('./_lib/http');
const {requireEnv} = require('./_lib/env');
const logger = require('./_lib/logger');
const {allowRequest, getClientKey} = require('./_lib/rateLimit');

const POPULAR_BANKS = [
  {id: 'fallback_chase', name: 'Chase', url: 'https://www.chase.com', login_url: 'https://secure.chase.com/web/auth/dashboard'},
  {id: 'fallback_boa', name: 'Bank of America', url: 'https://www.bankofamerica.com', login_url: 'https://secure.bankofamerica.com/login/sign-in/signOnV2Screen.go'},
  {id: 'fallback_wf', name: 'Wells Fargo', url: 'https://www.wellsfargo.com', login_url: 'https://connect.secure.wellsfargo.com/auth/login/present'},
  {id: 'fallback_cap1', name: 'Capital One', url: 'https://www.capitalone.com', login_url: 'https://verified.capitalone.com/sign-in'},
  {id: 'fallback_citi', name: 'Citi', url: 'https://www.citi.com', login_url: 'https://online.citi.com/US/ag/login'},
  {id: 'fallback_usb', name: 'U.S. Bank', url: 'https://www.usbank.com', login_url: 'https://onlinebanking.usbank.com/auth/login'},
  {id: 'fallback_pnc', name: 'PNC Bank', url: 'https://www.pnc.com', login_url: 'https://www.onlinebanking.pnc.com/alservlet/OnlineBankingServlet?T=login'},
  {id: 'fallback_td', name: 'TD Bank', url: 'https://www.td.com/us/en/personal-banking', login_url: 'https://onlinebanking.tdbank.com'},
  {id: 'fallback_ally', name: 'Ally Bank', url: 'https://www.ally.com', login_url: 'https://secure.ally.com'},
  {id: 'fallback_discover', name: 'Discover Bank', url: 'https://www.discover.com', login_url: 'https://portal.discover.com/customersvcs/universalLogin/ac_main'},
  {id: 'fallback_truist', name: 'Truist', url: 'https://www.truist.com', login_url: 'https://onlinebanking.truist.com'},
  {id: 'fallback_chime', name: 'Chime', url: 'https://www.chime.com', login_url: 'https://app.chime.com/login'},
  {id: 'fallback_creditkarma', name: 'Credit Karma', url: 'https://www.creditkarma.com', login_url: 'https://www.creditkarma.com/auth/logon'},
];

const LOGIN_URL_HINTS = {
  ins_109508: 'https://secure.chase.com/web/auth/dashboard',
  ins_104183: 'https://secure.bankofamerica.com/login/sign-in/signOnV2Screen.go',
  ins_103397: 'https://connect.secure.wellsfargo.com/auth/login/present',
};

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

  const map = {
    auth: Products.Auth,
    transactions: Products.Transactions,
    identity: Products.Identity,
    investments: Products.Investments,
    liabilities: Products.Liabilities,
    assets: Products.Assets,
    signal: Products.Signal,
    transfer: Products.Transfer,
    income: Products.Income,
  };

  const parsed = raw
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)
    .map((name) => map[name])
    .filter(Boolean);

  return parsed.length ? parsed : defaultProducts;
}

function parseCountryCodes(raw) {
  const defaultCountries = [CountryCode.Us];
  if (!raw) return defaultCountries;

  const map = {
    US: CountryCode.Us,
    CA: CountryCode.Ca,
    GB: CountryCode.Gb,
    FR: CountryCode.Fr,
    ES: CountryCode.Es,
    IE: CountryCode.Ie,
    NL: CountryCode.Nl,
    DE: CountryCode.De,
  };

  const parsed = raw
    .split(',')
    .map((v) => v.trim().toUpperCase())
    .filter(Boolean)
    .map((code) => map[code])
    .filter(Boolean);

  return parsed.length ? parsed : defaultCountries;
}

function withHttps(raw) {
  if (!raw || typeof raw !== 'string') return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `https://${raw}`;
}

function buildFallbackResults(query) {
  const q = (query || '').toLowerCase();
  const list = !q
    ? POPULAR_BANKS
    : POPULAR_BANKS.filter((bank) => bank.name.toLowerCase().includes(q));
  return list.slice(0, 15);
}

function dedupeByName(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = (item.name || '').toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function resolveLoginUrl(inst) {
  if (LOGIN_URL_HINTS[inst.institution_id]) {
    return LOGIN_URL_HINTS[inst.institution_id];
  }

  const name = (inst.name || '').toLowerCase();
  if (name.includes('chase')) return 'https://secure.chase.com/web/auth/dashboard';
  if (name.includes('bank of america')) return 'https://secure.bankofamerica.com/login/sign-in/signOnV2Screen.go';
  if (name.includes('wells fargo')) return 'https://connect.secure.wellsfargo.com/auth/login/present';
  if (name.includes('capital one')) return 'https://verified.capitalone.com/sign-in';
  if (name.includes('citi')) return 'https://online.citi.com/US/ag/login';
  if (name.includes('u.s. bank') || name.includes('us bank')) return 'https://onlinebanking.usbank.com/auth/login';
  if (name.includes('pnc')) return 'https://www.onlinebanking.pnc.com/alservlet/OnlineBankingServlet?T=login';
  if (name.includes('td bank')) return 'https://onlinebanking.tdbank.com';
  if (name.includes('ally')) return 'https://secure.ally.com';
  if (name.includes('discover')) return 'https://portal.discover.com/customersvcs/universalLogin/ac_main';
  if (name.includes('truist')) return 'https://onlinebanking.truist.com';
  if (name.includes('chime')) return 'https://app.chime.com/login';
  if (name.includes('credit karma') || name.includes('creditkarma')) return 'https://www.creditkarma.com/auth/logon';
  return withHttps(inst.url) || null;
}

exports.handler = async function handler(event) {
  const requestId = getRequestId(event);

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, {error: 'Method not allowed'}, event);
  }

  const clientKey = getClientKey(event);
  const limiter = allowRequest(`search-institutions:${clientKey}`, 45, 60000);
  if (!limiter.allowed) {
    return jsonResponse(
      429,
      {error: 'Too many requests. Please try again soon.'},
      event,
      {
        'X-RateLimit-Limit': '45',
        'X-RateLimit-Remaining': String(limiter.remaining),
        'X-RateLimit-Reset': String(limiter.resetAt),
      }
    );
  }

  try {
    const query = (event.queryStringParameters?.q || '').trim();

    const hasPlaidCreds = !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);
    if (!hasPlaidCreds) {
      return jsonResponse(200, {institutions: buildFallbackResults(query)}, event);
    }

    const plaidClient = getPlaidClient();
    const response = await plaidClient.institutionsSearch({
      query: query || 'bank',
      products: parseProducts(process.env.PLAID_PRODUCTS),
      country_codes: parseCountryCodes(process.env.PLAID_COUNTRY_CODES),
      options: {limit: 15},
    });

    const liveInstitutions = (response.data.institutions || []).map((inst) => ({
      id: inst.institution_id,
      name: inst.name,
      url: withHttps(inst.url),
      login_url: resolveLoginUrl(inst),
    }));

    const fallbackInstitutions = buildFallbackResults(query);
    const institutions = dedupeByName([...liveInstitutions, ...fallbackInstitutions]).slice(0, 15);

    return jsonResponse(200, {institutions}, event);
  } catch (error) {
    logger.error('plaid-search-institutions failed', {
      error: error.response?.data || error.message,
      requestId,
    });
    return jsonResponse(200, {institutions: buildFallbackResults((event.queryStringParameters?.q || '').trim())}, event);
  }
};
