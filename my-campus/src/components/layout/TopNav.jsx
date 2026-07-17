// src/components/layout/TopNav.jsx
import React from "react";
import { FiShield, FiAward } from "react-icons/fi";

export default function TopNav({ name, university = "USCITECH" }) {
  return (
    <header className="sticky top-0 z-40 bg-[#0A222F]/90 backdrop-blur-md border-b border-[#3D4F58]/40 px-5 py-3.5 transition-all font-sans">
      <div className="max-w-md mx-auto flex items-center justify-between">
        
        {/* Brand & University Tag */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00684A] to-[#00ED64] flex items-center justify-center text-[#001E2B] font-extrabold text-base shadow-md">
            MC
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-sm tracking-tight">My Campus</span>
              <span className="text-[10px] font-mono font-bold bg-[#162C3D] text-[#00ED64] px-1.5 py-0.5 rounded border border-[#00ED64]/30">
                {university}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block -mt-0.5">Syllabus DRM & QCM</span>
          </div>
        </div>

        {/* User Status Badge */}
        <div className="flex items-center gap-2 bg-[#162C3D]/80 border border-[#3D4F58]/60 px-3 py-1.5 rounded-xl shadow-inner">
          <div className="w-2 h-2 rounded-full bg-[#00ED64] animate-pulse" />
          <span className="text-xs font-mono font-bold text-slate-200 max-w-[100px] truncate">
            {name ? name.split(" ")[0] : "Étudiant"}
          </span>
          <FiShield className="w-3.5 h-3.5 text-[#00ED64] shrink-0" title="DRM Actif" />
        </div>

      </div>
    </header>
  );
}