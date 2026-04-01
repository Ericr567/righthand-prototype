function scrub(meta = {}) {
  const redacted = {...meta};
  const keys = ['accessToken', 'publicToken', 'secret', 'token'];

  Object.keys(redacted).forEach((key) => {
    const lower = key.toLowerCase();
    if (keys.some((k) => lower.includes(k))) {
      redacted[key] = '[REDACTED]';
    }
  });

  return redacted;
}

function log(level, message, meta = {}) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...scrub(meta),
  };

  if (level === 'error') {
    console.error(JSON.stringify(entry));
    return;
  }

  console.log(JSON.stringify(entry));
}

module.exports = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
};
