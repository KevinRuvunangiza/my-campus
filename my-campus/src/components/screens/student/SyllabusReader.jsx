import { useRef, useEffect, useState } from "react";
import { m } from "framer-motion";
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiShield, FiZoomIn, FiZoomOut } from "react-icons/fi";

export default function SyllabusReader({ course, studentName = "Kevin Ruvunangiza", studentPhone = "084 123 4567", onBack }) {
  const canvasRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 14; // Mock syllabus page count

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Set canvas resolution for crisp rendering
    const width = 600;
    const height = 850;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Page Background (Soft cream/paper feel for reading comfort)
    ctx.fillStyle = "#FDFBF7";
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Simulated Academic Content (Headers and text lines)
    ctx.fillStyle = "#1A2E3B";
    ctx.font = "bold 24px 'Inter', sans-serif";
    ctx.fillText(`${course.department} - Chapitre ${currentPage}`, 50, 70);

    ctx.fillStyle = "#4A5D6B";
    ctx.font = "14px 'Source Code Pro', monospace";
    ctx.fillText(`DOCUMENT RÉSERVÉ • UNIVERSITÉ DE KINSHASA`, 50, 100);

    // Draw dummy text blocks
    ctx.fillStyle = "#2C3E50";
    for (let i = 0; i < 15; i++) {
      const lineWidth = i % 4 === 0 ? width - 180 : width - 100;
      ctx.fillRect(50, 140 + i * 40, lineWidth, 12);
      ctx.fillStyle = "#E2E8F0";
      ctx.fillRect(50, 158 + i * 40, width - 120, 4);
      ctx.fillStyle = "#2C3E50";
    }

    // 3. THE ANTI-PIRACY DYNAMIC WATERMARK ENGINE (15% Opacity, Diagonal)
    ctx.save();
    ctx.fillStyle = "rgba(0, 30, 43, 0.13)"; // 13-15% opacity dark forest
    ctx.font = "bold 18px 'Source Code Pro', monospace";
    ctx.rotate(-Math.PI / 6); // -30 degree diagonal tilt

    // Loop across canvas to burn identity into every zone
    for (let x = -width; x < width * 2; x += 280) {
      for (let y = -height; y < height * 2; y += 160) {
        ctx.fillText(`ACHETÉ PAR: ${studentName.toUpperCase()}`, x, y);
        ctx.fillText(`TEL: ${studentPhone} • NO DIFFUSION`, x, y + 22);
      }
    }
    ctx.restore();

    // 4. Page Footer
    ctx.fillStyle = "#718096";
    ctx.font = "12px sans-serif";
    ctx.fillText(`Page ${currentPage} sur ${totalPages} • Protection DRM Active`, 50, height - 30);

  }, [currentPage, course, studentName, studentPhone]);

  return (
    <div className="min-h-screen bg-[#0A222F] text-white flex flex-col justify-between font-sans selection:bg-[#00ED64] selection:text-[#001E2B]">
      
      {/* TOP CONTROL BAR */}
      <header className="p-4 bg-[#0D2633] border-b border-[#3D4F58]/50 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-[#162C3D] hover:bg-[#1C364B] text-slate-200 transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-white line-clamp-1">{course.title}</h1>
            <p className="text-[11px] text-slate-400">{course.professor}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-[#00ED64] bg-[#0A222F] px-2.5 py-1 rounded-full border border-[#00ED64]/20">
            <FiShield className="w-3 h-3" /> Canvas DRM
          </span>
        </div>
      </header>

      {/* CANVAS DISPLAY AREA */}
      <main className="flex-1 overflow-auto p-4 flex justify-center items-start bg-[#071721]">
        <m.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden border border-[#3D4F58]/30 max-w-full"
        >
          <canvas ref={canvasRef} className="max-w-full h-auto block bg-white" />
        </m.div>
      </main>

      {/* BOTTOM PAGINATION CONTROLS */}
      <footer className="p-4 bg-[#0D2633] border-t border-[#3D4F58]/50 flex items-center justify-between max-w-md w-full mx-auto">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#162C3D] text-xs font-bold text-slate-200 disabled:opacity-40 hover:bg-[#1C364B] transition-all cursor-pointer"
        >
          <FiChevronLeft className="w-4 h-4" /> Précédent
        </button>

        <span className="font-mono text-xs text-slate-300 font-medium">
          Page <strong className="text-[#00ED64]">{currentPage}</strong> / {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#162C3D] text-xs font-bold text-slate-200 disabled:opacity-40 hover:bg-[#1C364B] transition-all cursor-pointer"
        >
          Suivant <FiChevronRight className="w-4 h-4" />
        </button>
      </footer>

    </div>
  );
}