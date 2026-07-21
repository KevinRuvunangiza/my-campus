// src/services/studentService.js
import { supabase } from "../lib/supabaseClient";

export async function getMarketCatalog() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: courses, error } = await supabase
    .from("courses")
    .select(
      `
      id, title, department, university, price_usd, is_published,
      profiles (full_name, academic_title),
      chapters (id),
      syllabi (id)
    `,
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  let purchasedIds = new Set();
  if (user) {
    const { data: purchases } = await supabase
      .from("purchases")
      .select("course_id")
      .eq("student_id", user.id)
      .eq("status", "completed");
    if (purchases) purchasedIds = new Set(purchases.map((p) => p.course_id));
  }

  return courses.map((c) => {
    // Évite l'erreur si Supabase retourne un tableau au lieu d'un objet simple
    const prof = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
    return {
      ...c,
      professor: prof
        ? `${prof.academic_title || "Prof."} ${prof.full_name}`
        : "Professeur USCITECH",
      chaptersCount: c.chapters?.length || 0,
      syllabiCount: c.syllabi?.length || 0,
      isUnlocked: purchasedIds.has(c.id),
    };
  });
}

export async function getStudentDashboard() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: purchases, error } = await supabase
    .from("purchases")
    .select(
      `
      course_id, purchased_at,
      courses (
        id, title, department, university, price_usd,
        profiles (full_name, academic_title),
        chapters (id, title, order_index),
        syllabi (id, title, storage_file_path, file_size_mb)
      )
    `,
    )
    .eq("student_id", user.id)
    .eq("status", "completed");

  if (error) throw error;

  const activeCourses = await Promise.all(
    purchases.map(async (p) => {
      const courseRaw = Array.isArray(p.courses) ? p.courses[0] : p.courses;
      if (!courseRaw) return null;

      const prof = Array.isArray(courseRaw.profiles)
        ? courseRaw.profiles[0]
        : courseRaw.profiles;
      const { data: rScore } = await supabase.rpc("get_student_readiness", {
        p_course_id: courseRaw.id,
      });

      return {
        ...courseRaw,
        isUnlocked: true, // always true — these come from completed purchases
        professor: prof
          ? `${prof.academic_title || "Prof."} ${prof.full_name}`
          : "Professeur",
        purchased_at: p.purchased_at,
        readinessScore: rScore?.readiness_score || 0,
        metrics: {
          accuracy: rScore?.accuracy || 0,
          coverage: rScore?.coverage || 0,
          speedEfficiency: rScore?.speed_efficiency || 0,
        },
      };
    }),
  );

  return activeCourses.filter(Boolean); // Retire les éléments nuls
}

export async function processPayment(courseId, priceUsd, provider, phone) {
  // Grab the session directly rather than relying on functions.invoke() to
  // auto-attach it. That auto-attach behavior is version-dependent and was
  // the root cause of the 401s: when it didn't fire, the anon key got sent
  // instead of the user's access token, and the edge function correctly
  // rejected it since it can't resolve a real user from the anon key.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error(
      "Votre session a expiré. Veuillez vous reconnecter avant de payer.",
    );
  }

  const { data, error } = await supabase.functions.invoke("process-malipo", {
    body: { courseId, priceUsd, provider, phone },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    // On a non-2xx response, supabase-js does NOT parse the JSON body into
    // `data` — it only gives a generic error.message like "Edge Function
    // returned a non-2xx status code". The real message our edge function
    // sent back (bad price, unsupported provider, the Malipo decline
    // reason, "session your token expired", etc.) lives in error.context,
    // the raw Response object. Without reading it, every backend error
    // looked identical to the user.
    let message = error.message || "Le paiement a échoué.";
    if (error.context && typeof error.context.json === "function") {
      try {
        const body = await error.context.json();
        if (body?.error) message = body.error;
      } catch {
        // context wasn't JSON (e.g. a plain-text gateway-level 401) —
        // keep the fallback message above.
      }
    }
    throw new Error(message);
  }

  // The function ran and returned 200, but with a handled error payload,
  // e.g. { error: "USSD push rejected by customer" }
  if (data && data.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function getTransactionHistory() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("purchases")
    .select(
      `
      id, purchased_at, amount_usd, provider, status, 
      courses (title)
    `,
    )
    .eq("student_id", user.id)
    .order("purchased_at", { ascending: false });

  if (error) throw error;

  return data.map((tx) => {
    const courseTitle = Array.isArray(tx.courses)
      ? tx.courses[0]?.title
      : tx.courses?.title;
    return {
      ...tx,
      courseTitle: courseTitle || "Syllabus USCITECH",
    };
  });
}

export async function getCourseQuiz(courseId) {
  const { data, error } = await supabase
    .from("chapters")
    .select("id, title, questions(*)")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data;
}

export async function saveQcmAttempt(chapterId, scorePercentage, timeSpentSec) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("qcm_attempts").insert([
    {
      student_id: user.id,
      chapter_id: chapterId,
      score_percentage: scorePercentage,
      time_spent_seconds: timeSpentSec,
    },
  ]);
  if (error) throw error;
}