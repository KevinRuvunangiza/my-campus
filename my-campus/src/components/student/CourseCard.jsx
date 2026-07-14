import { m } from "framer-motion";
import { FiBookOpen } from "react-icons/fi";

// NOTICE: We added the onSelect prop here!
export default function CourseCard({ course, onSelect }) {
  return (
    <m.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      onClick={onSelect}
      className="bg-[#162C3D] hover:bg-[#1A3347] border border-[#3D4F58]/40 rounded-xl p-4 flex flex-col justify-between cursor-pointer shadow-md transition-colors group"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-[#00ED64] transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">{course.professor}</p>
        </div>
        <span className="text-[10px] font-mono text-[#00ED64] bg-[#0A222F] px-2 py-1 rounded border border-[#3D4F58]/40 shrink-0">
          DRM
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#3D4F58]/30">
        <div className="flex items-center gap-2">
          <FiBookOpen className="text-slate-400 w-4 h-4 text-[#00ED64]" />
          <span className="text-xs text-slate-300 font-mono">
            Ch. {course.chaptersCompleted}/{course.totalChapters}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents double-triggering the div click
            onSelect();
          }}
          className="bg-[#00684A] hover:bg-[#00ED64] text-white hover:text-[#001E2B] font-bold text-xs px-4 py-2 rounded-full transition-all duration-150 border border-[#00ED64]/30 shadow-sm"
        >
          Ouvrir
        </button>
      </div>
    </m.div>
  );
}
