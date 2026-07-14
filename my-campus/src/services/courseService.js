// src/services/courseService.js
import { supabase } from "../lib/supabaseClient";

// 1. Fetch all courses for the marketplace (or lecturer dashboard)
export async function getCourses({ lecturerId = null, onlyPublished = true } = {}) {
  let query = supabase.from("courses").select("*, profiles(full_name, academic_title)");
  
  if (lecturerId) {
    query = query.eq("lecturer_id", lecturerId);
  } else if (onlyPublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

// 2. Upload a Syllabus PDF (Enforcing the 10MB limit & Database 5-file cap)
export async function uploadSyllabusFile(file, courseId) {
  // Frontend Safety Check: Enforce the 10MB limit before wasting network bandwidth
  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Le fichier dépasse la limite de 10 Mo. Veuillez compresser votre PDF.");
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${courseId}/${Date.now()}_syllabus.${fileExt}`;

  // Upload to private Supabase bucket
  const { error: uploadError } = await supabase.storage
    .from("course-syllabi")
    .upload(filePath, file, { cacheControl: "3600", upsert: false, contentType: "application/pdf" });

  if (uploadError) throw uploadError;

  // Insert metadata into SQL table (This will trigger our SQL cap check!)
  const { data, error: dbError } = await supabase
    .from("syllabi")
    .insert([{
      course_id: courseId,
      title: file.name.replace(`.${fileExt}`, ""),
      storage_file_path: filePath,
      file_size_mb: Number((file.size / (1024 * 1024)).toFixed(2))
    }])
    .select()
    .single();

  if (dbError) {
    // If SQL blocks them for having 5/5 syllabi, delete the file we just uploaded to keep storage clean!
    await supabase.storage.from("course-syllabi").remove([filePath]);
    throw dbError;
  }

  return data;
}

// 3. Calculate Student Readiness Score (R) via PostgreSQL RPC
export async function getReadinessMetrics(courseId) {
  const { data, error } = await supabase.rpc("get_student_readiness", {
    p_course_id: courseId
  });

  if (error) {
    console.error("Erreur Calcul Indice R:", error.message);
    return { readiness_score: 0, accuracy: 0, coverage: 0, speed_efficiency: 0 };
  }
  return data;
}