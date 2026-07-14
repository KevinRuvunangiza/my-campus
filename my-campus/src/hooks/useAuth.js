// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function useAuth() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active session on initial load
    async function getInitialSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }
    getInitialSession();

    // 2. Listen for login, logout, or token refresh events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch role, academic title, and phone number from public.profiles
  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (err) {
      console.error("Erreur Monolith [Auth]: Impossible de charger le profil.", err.message);
    } finally {
      setLoading(false);
    }
  }

  // Login handler
  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  // Signup handler (passes phone and role into metadata so our SQL trigger catches it!)
  async function signup({ email, password, fullName, phone, role, academicTitle, department }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          role: role,
          academic_title: academicTitle || null,
          department: department || "Tronc Commun",
          university: "USCITECH - Kinshasa"
        }
      }
    });
    if (error) throw error;
    return data;
  }

  // Logout handler
  async function logout() {
    await supabase.auth.signOut();
    setUserProfile(null);
  }

  return { userProfile, loading, login, signup, logout };
}