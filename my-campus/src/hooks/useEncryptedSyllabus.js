// src/hooks/useEncryptedSyllabus.js
import { useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

const DB_NAME = "Monolith_MyCampus_Cache";
const STORE_NAME = "syllabi_blobs";

// Helper: Open native browser IndexedDB
function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject("Erreur d'accès au stockage local.");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME);
    };
  });
}

export function useEncryptedSyllabus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getSyllabusStream = useCallback(async (syllabusId, storageFilePath) => {
    setLoading(true);
    setError(null);

    try {
      const db = await getDB();

      // 1. Check if we already downloaded this PDF earlier in the semester
      const cachedBlob = await new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(syllabusId);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });

      // 💥 CACHE HIT: Serve locally! $0 bandwidth cost!
      if (cachedBlob) {
        console.log("⚡ [Monolith Cache] Syllabus chargé depuis la mémoire du téléphone (0 Mo consommé).");
        setLoading(false);
        return URL.createObjectURL(cachedBlob);
      }

      // 🌐 CACHE MISS: Download from Supabase via 60-second Signed URL
      console.log("🌐 [Monolith Cloud] Téléchargement initial du syllabus...");
      const { data: signedData, error: signedErr } = await supabase.storage
        .from("course-syllabi")
        .createSignedUrl(storageFilePath, 60);

      if (signedErr) throw new Error("Accès refusé. Vérifiez votre paiement M-Pesa.");

      // Fetch the actual file binary
      const response = await fetch(signedData.signedUrl);
      if (!response.ok) throw new Error("Erreur réseau lors du téléchargement.");
      const blob = await response.blob();

      // Save Blob to IndexedDB so we never have to download it again
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(blob, syllabusId);

      setLoading(false);
      return URL.createObjectURL(blob);

    } catch (err) {
      console.error("Erreur Lecteur Syllabus:", err);
      setError(err.message || "Impossible de charger le document.");
      setLoading(false);
      return null;
    }
  }, []);

  return { getSyllabusStream, loading, error };
}