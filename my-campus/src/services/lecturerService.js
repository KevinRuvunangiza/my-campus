// src/services/lecturerService.js
import { supabase } from "../lib/supabaseClient";

// --- COURSES ---
export async function getLecturerCourses(lecturerId) {
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      *,
      syllabi(*),
      chapters(id, title, questions(id)),
      purchases(id, amount_usd, lecturer_share_usd, status)
    `,
    )
    .eq("lecturer_id", lecturerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createCourse({ lecturerId, title, department, priceUsd }) {
  const { data, error } = await supabase
    .from("courses")
    .insert([
      {
        lecturer_id: lecturerId,
        title,
        department: department || "Tronc Commun",
        university: "USCITECH",
        price_usd: Math.round(Number(priceUsd)) || 1, // integer column
        is_published: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 💥 Delete a full course (cascades to chapters, questions, syllabi via DB policy)
export async function deleteCourse(courseId) {
  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) throw error;
}

export async function toggleCoursePublication(
  courseId,
  isPublished,
  userProfile,
) {
  if (isPublished && !userProfile.is_verified) {
    throw new Error(
      "Publication bloquée: Votre profil doit d'abord être certifié par l'équipe Monolith.",
    );
  }
  const { data, error } = await supabase
    .from("courses")
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq("id", courseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- SYLLABI ---
export async function uploadSyllabusFile(file, courseId, title) {
  const MAX_SIZE_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Le fichier dépasse la limite stricte de 10 Mo.");
  }

  const fileExt = file.name.split(".").pop();
  const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, "")}.${fileExt}`;
  const filePath = `${courseId}/${cleanFileName}`;

  const { error: uploadError } = await supabase.storage
    .from("course-syllabi")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: "application/pdf",
    });

  if (uploadError) throw uploadError;

  const { data, error: dbError } = await supabase
    .from("syllabi")
    .insert([
      {
        course_id: courseId,
        title: title || file.name.replace(`.${fileExt}`, ""),
        storage_file_path: filePath,
        file_size_mb: Number((file.size / (1024 * 1024)).toFixed(2)),
      },
    ])
    .select()
    .single();

  if (dbError) {
    await supabase.storage.from("course-syllabi").remove([filePath]);
    throw dbError;
  }
  return data;
}

export async function deleteSyllabus(syllabusId, storageFilePath) {
  if (storageFilePath) {
    await supabase.storage.from("course-syllabi").remove([storageFilePath]);
  }
  const { error } = await supabase
    .from("syllabi")
    .delete()
    .eq("id", syllabusId);
  if (error) throw error;
}

// --- QCM ARENA ---
export async function createChapter(courseId, title, orderIndex = 1) {
  const { data, error } = await supabase
    .from("chapters")
    .insert([{ course_id: courseId, title, order_index: orderIndex }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createQuestion({
  chapterId,
  questionText,
  options,
  correctIndex,
  timeLimitSeconds,
  explanation,
}) {
  const { data, error } = await supabase
    .from("questions")
    .insert([
      {
        chapter_id: chapterId,
        question_text: questionText,
        options: options,
        correct_option_index: parseInt(correctIndex),
        time_limit_seconds: parseInt(timeLimitSeconds) || 60,
        explanation: explanation || "",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- FINANCIALS ---
export async function getFinancialDashboard(lecturerId) {
  const { data: courses, error } = await supabase
    .from("courses")
    .select(
      `id, title, price_usd, purchases(id, amount_usd, lecturer_share_usd, status, purchased_at)`,
    )
    .eq("lecturer_id", lecturerId);

  if (error) throw error;

  let totalSalesCount = 0;
  let grossRevenueUsd = 0;
  let netLecturerShareUsd = 0;

  courses.forEach((course) => {
    course.purchases?.forEach((p) => {
      if (p.status === "completed") {
        totalSalesCount += 1;
        grossRevenueUsd += Number(p.amount_usd);
        netLecturerShareUsd += Number(p.lecturer_share_usd);
      }
    });
  });

  return {
    totalSalesCount,
    grossRevenueUsd: Number(grossRevenueUsd.toFixed(2)),
    netLecturerShareUsd: Number(netLecturerShareUsd.toFixed(2)),
    courses,
  };
}

export async function requestMobileMoneyCashout({
  lecturerId,
  amountUsd,
  provider,
  destinationPhone,
}) {
  let dbProvider = "vodacom_mpesa";
  if (provider === "ORANGE" || provider === "orange_money" || provider === "ORANGE_MONEY") {
    dbProvider = "orange_money";
  } else if (provider === "AIRTEL" || provider === "airtel_money" || provider === "AIRTEL_MONEY") {
    dbProvider = "airtel_money";
  }

  const { data, error } = await supabase
    .from("lecturer_payouts")
    .insert([
      {
        lecturer_id: lecturerId,
        amount_usd: Math.round(Number(amountUsd)), // integer column
        provider: dbProvider,
        destination_phone: destinationPhone,
        status: "requested",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}
