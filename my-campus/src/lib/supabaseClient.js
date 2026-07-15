// src/lib/supabaseClient.js
//
// Monolith. — "My Campus"
// Singleton Supabase client initialization.
//
// This module is the single source of truth for the Supabase connection.
// Every other module (hooks, services) MUST import `supabase` from here
// rather than instantiating a new client — Supabase clients are meant
// to be singletons per browser tab (auth listeners, realtime sockets, etc.
// would otherwise be duplicated).

import { createClient } from '@supabase/supabase-js';

// Vite exposes env vars prefixed with VITE_ on `import.meta.env`.
// These must be defined in your `.env` (or `.env.local`) file at the
// project root:
//
//   VITE_SUPABASE_URL=https://xxxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxx
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- Defensive validation -------------------------------------------------
// Fail loudly and immediately at boot time rather than producing cryptic
// "fetch failed" errors deep inside a hook later on. This is especially
// important for a small deployment team (Dan & Emmanuel) debugging on-site
// in Kinshasa with limited connectivity — a clear console error saves a lot
// of guesswork.
const missingVars = [];
if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

if (missingVars.length > 0) {
  throw new Error(
    `[Monolith. / My Campus] Variables d'environnement manquantes : ${missingVars.join(
      ', '
    )}. Vérifiez votre fichier .env à la racine du projet.`
  );
}

// Optional sanity check: the modern Supabase publishable key format starts
// with "sb_publishable_". This won't block the app (Supabase may rotate key
// formats), but it helps catch a pasted-in secret/service key by mistake.
if (!supabaseAnonKey.startsWith('sb_publishable_')) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Monolith. / My Campus] La clé VITE_SUPABASE_ANON_KEY ne correspond pas au format attendu ("sb_publishable_..."). ' +
      'Assurez-vous de ne pas avoir collé une clé secrète (service_role) par erreur.'
  );
}

// --- Singleton client ------------------------------------------------------
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist the session in localStorage so students/lecturers stay logged
    // in across app restarts — important on mobile where the browser/app
    // may be closed frequently to save battery/data.
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;