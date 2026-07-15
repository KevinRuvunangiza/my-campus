// src/hooks/useEncryptedSyllabus.js
//
// Monolith. — "My Campus"
// "The Kinshasa Cache Engine"
//
// Goal: a student should only ever download a given syllabus ONCE per
// semester. Mobile data in Kinshasa is expensive and connections drop
// often, so we aggressively cache the PDF binary in IndexedDB and reuse
// it on every subsequent view — $0 additional bandwidth, instant load.
//
// Flow for getSyllabusStream(syllabusId, storageFilePath):
//   1. Look up `syllabusId` in IndexedDB (`Monolith_MyCampus_Cache` /
//      `syllabi_blobs`). If found -> return a local object URL instantly.
//   2. If not found -> ask Supabase Storage for a 60-second Signed URL,
//      fetch the blob, persist it to IndexedDB, then return a local
//      object URL.

import { useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

const DB_NAME = "Monolith_MyCampus_Cache";
const DB_VERSION = 1;
const STORE_NAME = "syllabi_blobs";
const SIGNED_URL_EXPIRY_SECONDS = 60;

// --- Low-level IndexedDB helpers -------------------------------------------
// Kept as plain Promise-wrapped functions (no external dependency like
// `idb`) to keep the bundle lean for slow 3G/4G connections.

function openCacheDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // keyPath = syllabusId, so each syllabus is stored exactly once.
        db.createObjectStore(STORE_NAME, { keyPath: "syllabusId" });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) =>
      reject(
        new Error(
          `Erreur IndexedDB (ouverture) : ${event.target.error?.message}`,
        ),
      );
  });
}

function getCachedBlobRecord(db, syllabusId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(syllabusId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = (event) =>
      reject(
        new Error(
          `Erreur IndexedDB (lecture) : ${event.target.error?.message}`,
        ),
      );
  });
}

function putBlobRecord(db, record) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = (event) =>
      reject(
        new Error(
          `Erreur IndexedDB (écriture) : ${event.target.error?.message}`,
        ),
      );
  });
}

/**
 * Removes a cached syllabus (e.g. if the file is corrupt or the lecturer
 * re-uploads a new version under the same id). Exported so UI code can
 * offer a "Forcer la mise à jour" (force refresh) action if needed.
 */
export async function evictSyllabusFromCache(syllabusId) {
  const db = await openCacheDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(syllabusId);
    request.onsuccess = () => resolve();
    request.onerror = (event) =>
      reject(
        new Error(
          `Erreur IndexedDB (suppression) : ${event.target.error?.message}`,
        ),
      );
  });
}

// --- React hook -------------------------------------------------------------

export function useEncryptedSyllabus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  // Track object URLs we've created so we can revoke them on unmount and
  // avoid leaking memory across a long study session with many syllabi.
  const objectUrlsRef = useRef(new Set());

  const revokeAllObjectUrls = useCallback(() => {
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
  }, []);

  /**
   * Returns a local blob object URL for the given syllabus, using the
   * IndexedDB cache whenever possible.
   *
   * @param {string} syllabusId - primary key from public.syllabi
   * @param {string} storageFilePath - path inside the `course-syllabi` bucket
   * @returns {Promise<string>} object URL usable in an <iframe>/<embed>/pdf viewer
   */
  const getSyllabusStream = useCallback(async (syllabusId, storageFilePath) => {
    setLoading(true);
    setError(null);
    setFromCache(false);

    try {
      const db = await openCacheDB();

      // 1. Check the cache first — this is the $0-bandwidth happy path.
      const cached = await getCachedBlobRecord(db, syllabusId);
      if (cached?.blob) {
        const objectUrl = URL.createObjectURL(cached.blob);
        objectUrlsRef.current.add(objectUrl);
        setFromCache(true);
        setLoading(false);
        return objectUrl;
      }

      // 2. Not cached: request a short-lived Signed URL. RLS on the
      //    `course-syllabi` bucket will deny this if the student hasn't
      //    purchased the course, hasn't verified their email, etc.
      const { data: signedData, error: signedError } = await supabase.storage
        .from("course-syllabi")
        .createSignedUrl(storageFilePath, SIGNED_URL_EXPIRY_SECONDS);

      if (signedError || !signedData?.signedUrl) {
        // Common RLS-denial case: unpaid course, unverified email, or the
        // file has been removed by the lecturer.
        throw new Error(
          "Accès refusé : vous n'avez pas les droits pour consulter ce syllabus. " +
            "Assurez-vous que le cours a bien été acheté et que votre compte est vérifié.",
        );
      }

      // 3. Fetch the actual bytes. This is the ONLY network transfer that
      //    counts against our Supabase bandwidth budget for this file.
      const response = await fetch(signedData.signedUrl);
      if (!response.ok) {
        throw new Error(
          `Le lien temporaire a expiré ou le fichier est introuvable (code ${response.status}). Veuillez réessayer.`,
        );
      }
      const blob = await response.blob();

      // 4. Persist to IndexedDB for all future views (offline-capable).
      await putBlobRecord(db, {
        syllabusId,
        blob,
        storageFilePath,
        cachedAt: new Date().toISOString(),
      });

      const objectUrl = URL.createObjectURL(blob);
      objectUrlsRef.current.add(objectUrl);
      setLoading(false);
      return objectUrl;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Une erreur inconnue est survenue lors du chargement du syllabus.";
      setError(message);
      setLoading(false);
      throw new Error(message);
    }
  }, []);

  return {
    getSyllabusStream,
    evictSyllabusFromCache,
    loading,
    error,
    fromCache,
    revokeAllObjectUrls,
  };
}

export default useEncryptedSyllabus;
