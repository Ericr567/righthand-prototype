function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    const error = new Error(`Missing ${name}`);
    error.statusCode = 400;
    throw error;
  }
  return value;
}

module.exports = {
  requireEnv,
};
