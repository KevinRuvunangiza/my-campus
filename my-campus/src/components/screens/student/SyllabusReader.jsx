// src/components/screens/student/SyllabusReader.jsx
import { useRef, useEffect, useState, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";
import { useEncryptedSyllabus } from "../../../hooks/useEncryptedSyllabus";

// ─── PDF.js setup ────────────────────────────────────────────────────────────
// Import the worker as a local URL via Vite's ?url suffix so it is bundled and
// served locally — no CDN dependency, no version mismatch, no CORS issues.
import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
// ─────────────────────────────────────────────────────────────────────────────

export default function SyllabusReader({
  course,
  studentName = "Étudiant",
  studentPhone = "000",
  onBack,
}) {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null); // track ongoing render to cancel it on page change

  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [renderingPage, setRenderingPage] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const { getSyllabusStream } = useEncryptedSyllabus();

  // ── Step 1: fetch the PDF bytes and load into pdfjs ────────────────────────
  useEffect(() => {
    let cancelled = false;
    let activeLoadingTask = null;

    async function loadPdf() {
      setLoadingPdf(true);
      setLoadError(null);
      setPdfDoc(null);
      setCurrentPage(1);
      setTotalPages(0);

      const activeSyllabus = course?.syllabi?.[0];
      if (!activeSyllabus?.storage_file_path) {
        setLoadError("Aucun document PDF rattaché à ce cours.");
        setLoadingPdf(false);
        return;
      }

      try {
        // getSyllabusStream returns a blob object URL (or throws on access denied)
        const objectUrl = await getSyllabusStream(
          activeSyllabus.id,
          activeSyllabus.storage_file_path,
        );

        if (cancelled) return;
        if (!objectUrl) {
          setLoadError("Impossible de charger le syllabus. Veuillez réessayer.");
          setLoadingPdf(false);
          return;
        }

        // Pass the URL — pdfjs accepts blob: URLs directly
        const loadingTask = pdfjsLib.getDocument({ url: objectUrl });
        activeLoadingTask = loadingTask;
        const doc = await loadingTask.promise;

        if (cancelled) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message || "Erreur lors du chargement du PDF.");
        }
      } finally {
        if (!cancelled) setLoadingPdf(false);
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
      if (activeLoadingTask) {
        activeLoadingTask.destroy();
      }
    };
  }, [course, getSyllabusStream]);

  // ── Step 2: render the current page onto the canvas ────────────────────────
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    // Cancel any previous in-flight render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    setRenderingPage(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    try {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.8 }); // HD on mobile

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      // ── DRM watermark ────────────────────────────────────────────────────
      ctx.save();
      ctx.globalAlpha = 0.10;
      ctx.fillStyle = "#001E2B";
      ctx.font = "bold 18px 'Courier New', monospace";
      ctx.rotate(-Math.PI / 6);

      const step = 280;
      for (let x = -canvas.width; x <= canvas.width * 2; x += step) {
        for (let y = -canvas.height; y <= canvas.height * 2; y += 130) {
          ctx.fillText(`ACHETÉ PAR: ${studentName.toUpperCase()}`, x, y);
          ctx.fillText(`TÉL: ${studentPhone} · NO DIFFUSION`, x, y + 22);
        }
      }
      ctx.restore();
      // ─────────────────────────────────────────────────────────────────────
    } catch (err) {
      // RenderingCancelledException is expected when the user flips pages fast
      if (err?.name !== "RenderingCancelledException") {
        console.error("Erreur de rendu PDF:", err);
      }
    } finally {
      setRenderingPage(false);
    }
  }, [pdfDoc, currentPage, studentName, studentPhone]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#071721] text-white flex flex-col font-sans select-none">
      {/* Header */}
      <header className="p-4 bg-[#0D2633] border-b border-[#3D4F58]/50 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#162C3D] hover:bg-[#1C364B] text-slate-200 cursor-pointer shrink-0 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white line-clamp-1">
              {course?.title}
            </h1>
            <p className="text-[11px] text-slate-400 line-clamp-1">
              {course?.professor}
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#00ED64] bg-[#0A222F] px-2.5 py-1 rounded-full border border-[#00ED64]/20 shrink-0">
          <FiShield className="w-3 h-3" /> Canvas DRM
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto flex justify-center items-start bg-[#071721] p-4">
        <AnimatePresence mode="wait">
          {loadingPdf && (
            <m.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center mt-24 text-slate-400 text-xs font-mono gap-4"
            >
              <div className="w-10 h-10 border-2 border-[#00ED64] border-t-transparent rounded-full animate-spin" />
              <span>Déchiffrement du syllabus en cours…</span>
            </m.div>
          )}

          {!loadingPdf && loadError && (
            <m.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center mt-24 gap-4 max-w-sm text-center"
            >
              <FiAlertTriangle className="w-10 h-10 text-rose-400" />
              <p className="text-rose-300 text-sm">{loadError}</p>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 bg-[#162C3D] hover:bg-[#1C364B] rounded-xl text-xs text-slate-200 cursor-pointer transition-colors"
              >
                <FiRefreshCw className="w-3.5 h-3.5" /> Réessayer
              </button>
            </m.div>
          )}

          {!loadingPdf && !loadError && pdfDoc && (
            <m.div
              key="canvas"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative shadow-[0_10px_40px_rgba(0,0,0,0.6)] rounded-lg overflow-hidden border border-[#3D4F58]/30"
            >
              {renderingPage && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#071721]/60 z-10">
                  <div className="w-6 h-6 border-2 border-[#00ED64] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto block bg-white"
              />
            </m.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer pagination */}
      {pdfDoc && totalPages > 0 && (
        <footer className="p-4 bg-[#0D2633] border-t border-[#3D4F58]/50 flex items-center justify-between max-w-md w-full mx-auto">
          <button
            onClick={goToPrev}
            disabled={currentPage === 1 || renderingPage}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#162C3D] text-xs font-bold text-slate-200 disabled:opacity-40 cursor-pointer hover:bg-[#1C364B] transition-colors disabled:cursor-not-allowed"
          >
            <FiChevronLeft className="w-4 h-4" /> Précédent
          </button>
          <span className="font-mono text-xs text-slate-300 font-medium">
            Page <strong className="text-[#00ED64]">{currentPage}</strong>
            {" / "}
            {totalPages}
          </span>
          <button
            onClick={goToNext}
            disabled={currentPage === totalPages || renderingPage}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#162C3D] text-xs font-bold text-slate-200 disabled:opacity-40 cursor-pointer hover:bg-[#1C364B] transition-colors disabled:cursor-not-allowed"
          >
            Suivant <FiChevronRight className="w-4 h-4" />
          </button>
        </footer>
      )}
    </div>
  );
}
