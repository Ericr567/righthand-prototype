const fs = require('fs');
const path = require('path');

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    if (line && !line.startsWith('#')) {
      const [key, ...value] = line.split('=');
      if (key.trim()) {
        process.env[key.trim()] = value.join('=').trim();
      }
    }
  });
}

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

const missing = REQUIRED.filter((name) => !process.env[name] || process.env[name].includes('your-'));

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('Environment validation passed.');
