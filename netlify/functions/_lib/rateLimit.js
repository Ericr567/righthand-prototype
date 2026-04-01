const buckets = new Map();

function allowRequest(key, limit = 30, windowMs = 60000) {
  const now = Date.now();
  const current = buckets.get(key) || {count: 0, resetAt: now + windowMs};

  if (now > current.resetAt) {
    const next = {count: 1, resetAt: now + windowMs};
    buckets.set(key, next);
    return {allowed: true, remaining: limit - 1, resetAt: next.resetAt};
  }

  if (current.count >= limit) {
    return {allowed: false, remaining: 0, resetAt: current.resetAt};
  }

  current.count += 1;
  buckets.set(key, current);
  return {allowed: true, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt};
}

function getClientKey(event) {
  const forwardedFor =
    event.headers?.['x-forwarded-for'] ||
    event.headers?.['X-Forwarded-For'] ||
    '';
  const firstIp = String(forwardedFor).split(',')[0].trim();
  return firstIp || event.headers?.['client-ip'] || event.headers?.['Client-Ip'] || 'unknown-client';
}

module.exports = {
  allowRequest,
  getClientKey,
};
