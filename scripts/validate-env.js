const REQUIRED = [
  'PLAID_CLIENT_ID',
  'PLAID_SECRET',
  'PLAID_ENV',
  'PLAID_TOKEN_ENCRYPTION_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
];

const missing = REQUIRED.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('Environment validation passed.');
