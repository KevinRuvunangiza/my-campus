// src/hooks/useAuth.js
//
// Monolith. — "My Campus"
// Custom authentication hook wrapping Supabase Auth + the `profiles` table.
//
// Responsibilities:
//   1. Track the live session via `onAuthStateChange`.
//   2. Fetch the matching `public.profiles` row so the rest of the app can
//      read `userProfile.role` ('student' | 'lecturer') without extra queries.
//   3. Handle the "Confirm Email ON" quirk: after signUp(), Supabase returns
//      a user but a NULL session until the student/lecturer clicks the
//      confirmation link in their inbox. We surface that clearly in French.

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetches the public.profiles row tied to a given auth user id.
  // Isolated as its own function so it can be reused both on initial load
  // and whenever the auth state changes (login, token refresh, etc.).
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // A missing profile row usually means the `handle_new_user` trigger
      // hasn't finished (rare race condition right after signup) or the
      // account was deleted server-side. We log it but don't crash the UI.
      // eslint-disable-next-line no-console
      console.error('[useAuth] Impossible de charger le profil :', error.message);
      setUserProfile(null);
      return null;
    }

    setUserProfile(data);
    return data;
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Grab whatever session already exists (e.g. page refresh).
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!isMounted) return;
      setSession(initialSession);
      if (initialSession?.user) {
        await fetchProfile(initialSession.user.id);
      }
      setLoading(false);
    });

    // 2. Subscribe to all future auth changes: SIGNED_IN, SIGNED_OUT,
    //    TOKEN_REFRESHED, USER_UPDATED, etc.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // --- login -----------------------------------------------------------
  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Translate the most common Supabase auth errors into French for a
      // cleaner UX. Anything unrecognized falls back to a generic message.
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        throw new Error('Adresse e-mail ou mot de passe incorrect.');
      }
      if (error.message.toLowerCase().includes('email not confirmed')) {
        throw new Error(
          "Votre adresse e-mail n'est pas encore confirmée. Veuillez vérifier votre boîte de réception."
        );
      }
      throw new Error('Une erreur est survenue lors de la connexion. Veuillez réessayer.');
    }

    return data;
  }, []);

  // --- signup ------------------------------------------------------------
  // Returns an object describing what happened so the calling UI component
  // can decide whether to redirect straight in (session present) or show
  // the "check your inbox" screen (session null, confirm-email flow).
  const signup = useCallback(
    async ({ email, password, fullName, phone, role, academicTitle, department }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // These are passed as `raw_user_meta_data` and picked up by the
          // `handle_new_user` trigger to populate `public.profiles`.
          data: {
            full_name: fullName,
            phone_number: phone,
            role, // trigger maps French/English terms to the SQL enum
            academic_title: academicTitle ?? null,
            department: department ?? null,
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
          throw new Error('Un compte existe déjà avec cette adresse e-mail.');
        }
        throw new Error("Une erreur est survenue lors de l'inscription. Veuillez réessayer.");
      }

      // *** CRITICAL: "Confirm Email" is ON in this Supabase project. ***
      // When that's the case, `data.user` exists but `data.session` is null
      // until the user clicks the confirmation link. We must NOT treat this
      // as a failure — it's the expected happy path.
      if (data.user && !data.session) {
        return {
          status: 'confirmation_required',
          message:
            'Compte créé avec succès ! Veuillez consulter votre boîte de réception pour activer votre compte avant de vous connecter.',
          user: data.user,
        };
      }

      // Edge case: email confirmation disabled in some environments (e.g.
      // local dev) — session comes back immediately.
      return {
        status: 'signed_in',
        message: 'Compte créé et connexion automatique réussie.',
        user: data.user,
        session: data.session,
      };
    },
    []
  );

  // --- logout --------------------------------------------------------------
  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error('Impossible de vous déconnecter. Veuillez réessayer.');
    }
    setUserProfile(null);
    setSession(null);
  }, []);

  return {
    session,
    userProfile,
    loading,
    isLecturer: userProfile?.role === 'lecturer',
    login,
    signup,
    logout,
  };
}

export default useAuth;