// src/services/courseService.js
//
// Monolith. — "My Campus"
// Database service layer: courses, syllabus uploads, and the exam
// readiness RPC. All user-facing error messages are in French.

import { supabase } from "../lib/supabaseClient";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const STORAGE_BUCKET = "course-syllabi";
const MAX_ALLOCATION_ERROR_SNIPPET = "Allocation maximale atteinte";

/**
 * Fetches courses, optionally filtered by lecturer and/or publication
 * status, with the lecturer's profile name joined in.
 *
 * @param {Object} params
 * @param {string} [params.lecturerId] - filter to a single lecturer's courses
 * @param {boolean} [params.onlyPublished] - only return is_published = true
 * @returns {Promise<Array>} list of courses with `lecturer` profile attached
 */
export async function getCourses({ lecturerId, onlyPublished } = {}) {
  let query = supabase
    .from("courses")
    .select(
      `
      id,
      title,
      department,
      university,
      price_usd,
      is_published,
      lecturer_id,
      lecturer:profiles!courses_lecturer_id_fkey (
        id,
        full_name,
        academic_title
      )
    `,
    )
    .order("title", { ascending: true });

  if (lecturerId) {
    query = query.eq("lecturer_id", lecturerId);
  }

  if (onlyPublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;

  if (error) {
    // eslint-disable-next-line no-console
    console.error("[courseService.getCourses]", error.message);
    throw new Error(
      "Impossible de charger la liste des cours. Veuillez réessayer.",
    );
  }

  return data;
}

/**
 * Uploads a syllabus PDF for a given course.
 *
 * Steps:
 *   1. Hard-block anything over 10 MB before touching the network.
 *   2. Upload the binary to the private `course-syllabi` bucket.
 *   3. Insert the metadata row into `public.syllabi`.
 *   4. If step 3 fails because the lecturer already has 5 syllabi
 *      (Postgres trigger), delete the orphaned storage file and
 *      re-throw a clean French error for the UI.
 *
 * @param {File} file - the PDF file selected by the lecturer
 * @param {string} courseId - target course id
 * @returns {Promise<Object>} the newly created public.syllabi row
 */
export async function uploadSyllabusFile(file, courseId) {
  if (!file) {
    throw new Error("Aucun fichier sélectionné.");
  }

  // --- 1. Frontend size guard --------------------------------------------
  // This check happens BEFORE any network request — critical on Kinshasa's
  // 3G/4G networks where uploading 40MB just to get rejected server-side
  // would waste the lecturer's mobile data budget.
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `Le fichier est trop volumineux (${sizeMb} Mo). La taille maximale autorisée est de ${MAX_FILE_SIZE_MB} Mo.`,
    );
  }

  if (file.type !== "application/pdf") {
    throw new Error("Seuls les fichiers PDF sont acceptés pour les syllabus.");
  }

  // Build a collision-resistant storage path: courseId/timestamp-filename
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageFilePath = `${courseId}/${Date.now()}-${sanitizedFileName}`;

  // --- 2. Upload to the private bucket -----------------------------------
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storageFilePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: "application/pdf",
    });

  if (uploadError) {
    // eslint-disable-next-line no-console
    console.error(
      "[courseService.uploadSyllabusFile] upload error:",
      uploadError.message,
    );
    throw new Error(
      "Échec de l'envoi du fichier. Vérifiez votre connexion et réessayez.",
    );
  }

  // --- 3. Insert metadata row ---------------------------------------------
  const fileSizeMb = Number((file.size / (1024 * 1024)).toFixed(2));

  try {
    const { data: syllabusRow, error: insertError } = await supabase
      .from("syllabi")
      .insert({
        course_id: courseId,
        title: file.name.replace(/\.pdf$/i, ""),
        storage_file_path: storageFilePath,
        file_size_mb: fileSizeMb,
        // total_pages is typically populated client-side via pdfjs-dist
        // after a quick parse, or left null and backfilled later.
      })
      .select()
      .single();

    if (insertError) {
      // Throw so it's caught below in the same try/catch, keeping the
      // "delete orphaned file" cleanup logic in one place.
      throw insertError;
    }

    return syllabusRow;
  } catch (dbError) {
    // --- 4. Crucial cleanup: remove the orphaned storage file -------------
    // If the insert failed for ANY reason we still attempt cleanup, but we
    // give a specific, friendly message for the known "5 syllabi max" case.
    const { error: removeError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storageFilePath]);

    if (removeError) {
      // eslint-disable-next-line no-console
      console.error(
        "[courseService.uploadSyllabusFile] Échec du nettoyage du fichier orphelin :",
        removeError.message,
      );
    }

    const message = dbError?.message || "";
    if (message.includes(MAX_ALLOCATION_ERROR_SNIPPET)) {
      throw new Error(
        "Allocation maximale atteinte (5/5) : vous avez déjà publié le nombre maximum de syllabus autorisés pour ce cours. Supprimez-en un pour en ajouter un nouveau.", { cause: dbError },
      );
    }

    // eslint-disable-next-line no-console
    console.error("[courseService.uploadSyllabusFile] insert error:", message);
    throw new Error(
      "Échec de l'enregistrement du syllabus. Veuillez réessayer.", { cause: dbError },
    );
  }
}

/**
 * Calls the `get_student_readiness` Postgres RPC and returns the parsed
 * readiness metrics for a given course.
 *
 * @param {string} courseId
 * @returns {Promise<{readiness_score: number, accuracy: number, coverage: number, speed_efficiency: number}>}
 */
export async function getReadinessMetrics(courseId) {
  const { data, error } = await supabase.rpc("get_student_readiness", {
    p_course_id: courseId,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("[courseService.getReadinessMetrics]", error.message);
    throw new Error(
      "Impossible de calculer votre score de préparation. Veuillez réessayer.",
    );
  }

  // The RPC returns a JSON object as described in the schema; guard against
  // an unexpected null (e.g. student has no attempts yet for this course).
  return (
    data ?? {
      readiness_score: 0,
      accuracy: 0,
      coverage: 0,
      speed_efficiency: 0,
    }
  );
}

export default {
  getCourses,
  uploadSyllabusFile,
  getReadinessMetrics,
};
