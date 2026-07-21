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

  // Fetch payouts to calculate the correct available balance
  const { data: payouts, error: payoutError } = await supabase
    .from("lecturer_payouts")
    .select("amount_usd")
    .eq("lecturer_id", lecturerId)
    .in("status", ["completed", "requested"]);

  if (payoutError) throw payoutError;

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

  let totalWithdrawnUsd = 0;
  payouts?.forEach((po) => {
    totalWithdrawnUsd += Number(po.amount_usd);
  });

  const availableBalanceUsd = Number((netLecturerShareUsd - totalWithdrawnUsd).toFixed(2));

  return {
    totalSalesCount,
    grossRevenueUsd: Number(grossRevenueUsd.toFixed(2)),
    netLecturerShareUsd: availableBalanceUsd, // now represents the true available balance
    lifetimeEarningsUsd: Number(netLecturerShareUsd.toFixed(2)), // lifetime share for reporting
    courses,
  };
}

export async function requestMobileMoneyCashout({
  lecturerId,
  amountUsd,
  provider,
  destinationPhone,
}) {
  const { data, error } = await supabase.functions.invoke("process-payout", {
    body: { amountUsd, provider, destinationPhone },
  });

  if (error) {
    let message = error.message || "Le retrait a échoué.";
    if (error.context) {
      try {
        const bodyText = await error.context.text();
        const bodyJson = JSON.parse(bodyText);
        message = bodyJson.error || message;
      } catch (_) {}
    }
    throw new Error(message);
  }

  return data;
}
