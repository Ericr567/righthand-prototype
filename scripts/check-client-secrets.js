const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const targets = ['App.js', 'screens', 'components', 'services', 'assets', 'theme', 'styles', 'utils'];
const forbidden = [
  'PLAID_SECRET',
  'PLAID_CLIENT_ID',
  'PLAID_TOKEN_ENCRYPTION_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PLAID-SECRET',
  'PLAID-CLIENT-ID',
];

function collectFiles(entryPath, out) {
  const stats = fs.statSync(entryPath);
  if (stats.isDirectory()) {
    for (const child of fs.readdirSync(entryPath)) {
      collectFiles(path.join(entryPath, child), out);
    }
    return;
  }

  if (/\.(js|jsx|ts|tsx)$/.test(entryPath)) {
    out.push(entryPath);
  }
}

const files = [];
for (const target of targets) {
  const full = path.join(root, target);
  if (fs.existsSync(full)) {
    collectFiles(full, files);
  }
}

const failures = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const token of forbidden) {
    if (text.includes(token)) {
      failures.push({file, token});
    }
  }
}

if (failures.length) {
  console.error('Potential secret exposure in client-visible code:');
  for (const failure of failures) {
    console.error(`- ${path.relative(root, failure.file)} contains ${failure.token}`);
  }
  process.exit(1);
}

console.log('Client secret exposure check passed.');
