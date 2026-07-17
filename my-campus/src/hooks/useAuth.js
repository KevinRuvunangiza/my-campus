// src/hooks/useAuth.js
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useAuth() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error(
        "[useAuth] Impossible de charger le profil:",
        error.message,
      );
      setUserProfile(null);
      return null;
    }
    setUserProfile(data);
    return data;
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession } }) => {
        if (!isMounted) return;
        setSession(initialSession);
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
        }
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
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

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials"))
        throw new Error("Adresse e-mail ou mot de passe incorrect.");
      if (error.message.toLowerCase().includes("email not confirmed"))
        throw new Error(
          "Votre adresse e-mail n'est pas encore confirmée. Veuillez vérifier votre boîte de réception.",
        );
      if (
        error.status === 429 ||
        error.message.toLowerCase().includes("rate limit")
      )
        throw new Error(
          "Trop de tentatives. Veuillez patienter 5 minutes avant de réessayer.",
        );
      throw new Error(
        "Une erreur est survenue lors de la connexion. Veuillez réessayer.",
      );
    }
    return data;
  }, []);

  const signup = useCallback(
    async ({
      email,
      password,
      fullName,
      phone,
      role,
      academicTitle,
      department,
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phone,
            role,
            academic_title: academicTitle ?? null,
            department: department ?? null,
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("already registered"))
          throw new Error("Un compte existe déjà avec cette adresse e-mail.");
        if (
          error.status === 429 ||
          error.message.toLowerCase().includes("rate limit")
        )
          throw new Error(
            "Trop de tentatives. Veuillez patienter 5 minutes avant de réessayer.",
          );
        throw new Error(
          "Une erreur est survenue lors de l'inscription. Veuillez réessayer.",
        );
      }

      if (data.user && !data.session) {
        return {
          status: "confirmation required",
          message:
            "Compte créé avec succès! Veuillez consulter votre boîte de réception pour activer votre compte avant de vous connecter.",
          user: data.user,
        };
      }

      return {
        status: "signed_in",
        message: "Compte créé et connexion automatique réussie.",
        user: data.user,
        session: data.session,
      };
    },
    [],
  );

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error)
      throw new Error("Impossible de vous déconnecter. Veuillez réessayer.");
    setUserProfile(null);
    setSession(null);
  }, []);

  // 💥 NEW: Account Deletion Logic
  const deleteAccount = useCallback(async () => {
    const { error } = await supabase.rpc("delete_user_account");
    if (error) {
      console.error("Delete Account Error:", error);
      throw new Error(
        "Impossible de supprimer le compte. Veuillez contacter le support.",
      );
    }
    await logout(); // Clear local session
  }, [logout]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return null;
    return fetchProfile(session.user.id);
  }, [session, fetchProfile]);

  return {
    session,
    userProfile,
    loading,
    isLecturer: userProfile?.role === "lecturer",
    login,
    signup,
    logout,
    deleteAccount,
    refreshProfile,
  };
}
