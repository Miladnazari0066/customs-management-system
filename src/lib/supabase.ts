import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  URL: 'gm_supabase_url',
  KEY: 'gm_supabase_anon_key',
};

function sanitizeUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let cleaned = rawUrl.trim();
  // Strip trailing slashes and any accidentally appended /rest/v1 or /auth/v1
  cleaned = cleaned.replace(/\/+$|\/(rest|auth)\/v\d+\/?$/i, '');
  return cleaned;
}

function isPlaceholderValue(val: string): boolean {
  if (!val) return true;
  const lower = val.toLowerCase();
  return (
    lower.includes('your-project-id') ||
    lower.includes('your_project_id') ||
    lower.includes('your-supabase') ||
    lower.includes('your_supabase') ||
    lower.includes('example.com') ||
    lower.includes('placeholder') ||
    lower.includes('<project-id>') ||
    lower.includes('<anon-key>')
  );
}

// Check for environment variables (primary) or stored local configuration (optional override)
export function getSavedSupabaseCredentials(): { url: string; key: string } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = localStorage.getItem(STORAGE_KEYS.URL) || '';
  const storedKey = localStorage.getItem(STORAGE_KEYS.KEY) || '';

  const rawUrl = envUrl || storedUrl;
  const rawKey = envKey || storedKey;

  const url = sanitizeUrl(rawUrl);
  const key = rawKey.trim();

  return { url, key };
}

let supabaseInstance: SupabaseClient | null = null;
let currentClientKey = '';

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getSavedSupabaseCredentials();
  if (!url || !key || !isSupabaseConfigured()) {
    supabaseInstance = null;
    currentClientKey = '';
    return null;
  }

  const clientKey = `${url}::${key}`;
  if (supabaseInstance && currentClientKey === clientKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(url, key);
    currentClientKey = clientKey;
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    supabaseInstance = null;
    currentClientKey = '';
    return null;
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSavedSupabaseCredentials();
  if (!url || !key) return false;
  if (!url.startsWith('https://')) return false;
  if (isPlaceholderValue(url) || isPlaceholderValue(key)) return false;
  return true;
}

export function saveSupabaseCredentials(url: string, key: string): boolean {
  try {
    const cleanedUrl = sanitizeUrl(url);
    const trimmedKey = key.trim();

    if (!cleanedUrl.startsWith('https://')) {
      throw new Error('Supabase URL must start with https://');
    }
    if (isPlaceholderValue(cleanedUrl) || isPlaceholderValue(trimmedKey)) {
      throw new Error('لطفاً آدرس و کلید معتبر را وارد کنید و از مقادیر پیش‌فرض استفاده نکنید.');
    }

    localStorage.setItem(STORAGE_KEYS.URL, cleanedUrl);
    localStorage.setItem(STORAGE_KEYS.KEY, trimmedKey);

    supabaseInstance = createClient(cleanedUrl, trimmedKey);
    currentClientKey = `${cleanedUrl}::${trimmedKey}`;
    return true;
  } catch (err) {
    console.error('Invalid Supabase configuration:', err);
    return false;
  }
}

export function clearSupabaseCredentials(): void {
  localStorage.removeItem(STORAGE_KEYS.URL);
  localStorage.removeItem(STORAGE_KEYS.KEY);
  supabaseInstance = null;
  currentClientKey = '';
}


