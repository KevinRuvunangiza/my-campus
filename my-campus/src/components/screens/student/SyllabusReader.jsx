// src/components/screens/student/SyllabusReader.jsx
import { useRef, useEffect, useState } from "react";
import { m } from "framer-motion";
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
} from "react-icons/fi";
import { useEncryptedSyllabus } from "../../../hooks/useEncryptedSyllabus";
import * as pdfjsLib from "pdfjs-dist";

// Setup du worker PDF.js via CDN (Evite les erreurs de compilation Vite)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function SyllabusReader({
  course,
  studentName = "Étudiant",
  studentPhone = "000",
  onBack,
}) {
  const canvasRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfError, setPdfError] = useState(null);

  const {
    getSyllabusStream,
    loading: loadingBlob,
    error: blobError,
  } = useEncryptedSyllabus();

  useEffect(() => {
    const fetchAndLoadPdf = async () => {
      const activeSyllabus = course?.syllabi?.[0];
      if (!activeSyllabus) {
        setPdfError("Aucun document PDF rattaché à ce cours.");
        return;
      }
      try {
        // 1. Récupère le Blob (depuis IndexedDB Cache ou Supabase)
        const objectUrl = await getSyllabusStream(
          activeSyllabus.id,
          activeSyllabus.storage_file_path,
        );
        if (!objectUrl) return;

        // 2. Charge le document dans le moteur PDF.js
        const loadingTask = pdfjsLib.getDocument(objectUrl);
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
      } catch (err) {
        setPdfError(err.message);
      }
    };
    fetchAndLoadPdf();
  }, [course, getSyllabusStream]);

  // Rendu de la page active sur le Canvas
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.5 }); // Qualité HD Mobile
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Rendu PDF natif
        await page.render({ canvasContext: ctx, viewport }).promise;

        // 💥 APPLICATION DU FILIGRANE DRM MONOLITH
        ctx.save();
        ctx.fillStyle = "rgba(0, 30, 43, 0.12)"; // 12% Opacité
        ctx.font = "bold 20px 'Courier New', monospace";
        ctx.rotate(-Math.PI / 6);

        for (let x = -canvas.width; x <= canvas.width * 2; x += 300) {
          for (let y = -canvas.height; y <= canvas.height * 2; y += 150) {
            ctx.fillText(`ACHETÉ PAR: ${studentName.toUpperCase()}`, x, y);
            ctx.fillText(`TEL: ${studentPhone} (NO DIFFUSION)`, x, y + 25);
          }
        }
        ctx.restore();
      } catch (err) {
        console.error("Erreur de rendu PDF:", err);
      }
    };
    renderPage();
  }, [pdfDoc, currentPage, studentName, studentPhone]);

  return (
    <div className="min-h-screen bg-[#0A222F] text-white flex flex-col justify-between font-sans">
      <header className="p-4 bg-[#0D2633] border-b border-[#3D4F58]/50 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#162C3D] hover:bg-[#1C364B] text-slate-200 cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white line-clamp-1">
              {course.title}
            </h1>
            <p className="text-[11px] text-slate-400">{course.professor}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-[#00ED64] bg-[#0A222F] px-2.5 py-1 rounded-full border border-[#00ED64]/20">
          <FiShield className="w-3 h-3" /> Canvas DRM
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 flex justify-center items-start bg-[#071721]">
        {loadingBlob || !pdfDoc ? (
          <div className="flex flex-col items-center mt-20 text-slate-400 text-xs font-mono">
            <div className="w-8 h-8 border-2 border-[#00ED64] border-t-transparent rounded-full animate-spin mb-4" />
            {blobError || pdfError || "Déchiffrement du syllabus en cours..."}
          </div>
        ) : (
          <m.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border border-[#3D4F58]/30"
          >
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto block bg-white"
            />
          </m.div>
        )}
      </main>

      <footer className="p-4 bg-[#0D2633] border-t border-[#3D4F58]/50 flex items-center justify-between max-w-md w-full mx-auto">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1 || !pdfDoc}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#162C3D] text-xs font-bold text-slate-200 disabled:opacity-40 cursor-pointer"
        >
          <FiChevronLeft className="w-4 h-4" /> Précédent
        </button>
        <span className="font-mono text-xs text-slate-300 font-medium">
          Page <strong className="text-[#00ED64]">{currentPage}</strong> /{" "}
          {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || !pdfDoc}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#162C3D] text-xs font-bold text-slate-200 disabled:opacity-40 cursor-pointer"
        >
          Suivant <FiChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
}
