import {createClient} from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let client = null;

function hasConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseClient() {
  if (!hasConfig()) return null;
  if (client) return client;

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}

export function isSupabaseConfigured() {
  return hasConfig();
}

export async function getCurrentSession() {
  const supabase = getSupabaseClient();
  if (!supabase) return {session: null, error: new Error('Supabase is not configured')};
  const {data, error} = await supabase.auth.getSession();
  return {session: data.session, error};
}

export async function signUpWithEmail(email, password) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured');
  const {data, error} = await supabase.auth.signUp({email, password});
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email, password) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured');
  const {data, error} = await supabase.auth.signInWithPassword({email, password});
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const {error} = await supabase.auth.signOut();
  if (error) throw error;
}

export function subscribeToAuthChanges(callback) {
  const supabase = getSupabaseClient();
  if (!supabase) return {unsubscribe: () => {}};
  const {data} = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return data.subscription;
}

export async function updatePassword(newPassword) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured. Password change is unavailable.');
  const {data, error} = await supabase.auth.updateUser({password: newPassword});
  if (error) throw error;
  return data;
}
