const getConfig = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ''), key };
};

async function supabaseRequest(path, options = {}) {
  const config = getConfig();
  if (!config) {
    const error = new Error('Database is not configured.');
    error.code = 'DATABASE_NOT_CONFIGURED';
    throw error;
  }
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: config.key,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Database request failed (${response.status}): ${detail}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

module.exports = { getConfig, supabaseRequest };
