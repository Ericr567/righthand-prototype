const {createClient} = require('@supabase/supabase-js');

let supabaseClient = null;

function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;

  if (!url || !anon) {
    const error = new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    error.statusCode = 500;
    throw error;
  }

  if (supabaseClient) return supabaseClient;

  supabaseClient = createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}

async function requireAuthenticatedUser(event) {
  const header = event.headers?.authorization || event.headers?.Authorization;
  if (!header || !header.startsWith('Bearer ')) {
    const error = new Error('Missing bearer token');
    error.statusCode = 401;
    throw error;
  }

  const token = header.replace('Bearer ', '').trim();
  if (!token) {
    const error = new Error('Invalid bearer token');
    error.statusCode = 401;
    throw error;
  }

  const supabase = getSupabaseAdminClient();
  const {data, error} = await supabase.auth.getUser(token);
  if (error || !data.user) {
    const authError = new Error('Unauthorized');
    authError.statusCode = 401;
    throw authError;
  }

  return {user: data.user, token};
}

module.exports = {
  requireAuthenticatedUser,
};
