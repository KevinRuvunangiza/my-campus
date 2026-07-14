
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Erreur Monolith : Variables d'environnement Supabase manquantes.",
  );
}

// Export the client so any component can use it!
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
