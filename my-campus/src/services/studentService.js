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
      id, title, department, university, price_fc, is_published,
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
        id, title, department, university, price_fc,
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

export async function processPayment(courseId, priceFc, provider, phone) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const lecturerShare = Math.floor(priceFc * 0.7);

  const { data, error } = await supabase.from("purchases").insert([
    {
      student_id: user.id,
      course_id: courseId,
      amount_fc: priceFc,
      lecturer_share_fc: lecturerShare,
      provider: provider,
      phone_number: phone,
      status: "completed",
    },
  ]);

  if (error) throw error;
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
      id, purchased_at, amount_fc, provider, status, 
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
