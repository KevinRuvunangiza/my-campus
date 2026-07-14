import { useState } from "react";
import { m } from "framer-motion";
import {
  FiUser,
  FiPhone,
  FiShield,
  FiCheckCircle,
  FiWifi,
  FiGlobe,
  FiLogOut,
  FiEdit3,
  FiAward,
} from "react-icons/fi";
import TopNav from "../../layout/TopNav";
import BottomNav from "../../layout/BottomNav";

const UNIVERSITIES = ["UNIKIN", "UPC", "ULK", "ISC", "ISTA"];
const TRANSACTIONS = [
  {
    id: "TX-9081",
    date: "12 Juil 2026",
    course: "Algorithmique II",
    amount: "3,500 FC",
    provider: "M-Pesa",
    status: "Succès",
  },
  {
    id: "TX-8412",
    date: "04 Juin 2026",
    course: "Systèmes d'Exploitation",
    amount: "5,000 FC",
    provider: "Orange Money",
    status: "Succès",
  },
];

export default function Profile({ activeTab, setActiveTab }) {
  const [name, setName] = useState("Kevin Ruvunangiza");
  const [phone, setPhone] = useState("084 123 4567");
  const [university, setUniversity] = useState("UNIKIN");
  const [dataSaver, setDataSaver] = useState(true); // Optimized for Kinshasa 3G/4G
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A222F] text-white flex flex-col justify-between pb-24 md:pb-6 font-sans">
      <TopNav name={name} university={university} />

      <main className="flex-1 max-w-md w-full mx-auto px-5 py-6 space-y-6">
        {/* PROFILE HEADER & STATS CARD */}
        <div className="bg-gradient-to-br from-[#162C3D] to-[#0D2633] border border-[#3D4F58]/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#00ED64]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#00684A] border-2 border-[#00ED64]/40 flex items-center justify-center text-xl font-extrabold text-white shadow-[0_0_20px_rgba(0,237,100,0.2)]">
                KR
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  {name}
                </h2>
                <span className="text-xs font-mono text-[#00ED64] flex items-center gap-1 mt-0.5">
                  <FiAward className="w-3.5 h-3.5" /> Étudiant Vérifié
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2.5 rounded-xl bg-[#0A222F]/60 border border-[#3D4F58]/50 text-slate-300 hover:text-[#00ED64] transition-colors cursor-pointer"
            >
              <FiEdit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Stats Pill Bar */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#3D4F58]/30">
            <div className="bg-[#0A222F]/50 p-3 rounded-2xl border border-[#3D4F58]/20 text-center">
              <span className="text-xs text-slate-400 font-mono block">
                Syllabus Actifs
              </span>
              <span className="text-lg font-bold font-mono text-[#00ED64]">
                2 Cours
              </span>
            </div>
            <div className="bg-[#0A222F]/50 p-3 rounded-2xl border border-[#3D4F58]/20 text-center">
              <span className="text-xs text-slate-400 font-mono block">
                Score Moyen (R)
              </span>
              <span className="text-lg font-bold font-mono text-white">
                78%
              </span>
            </div>
          </div>
        </div>

        {/* ACADEMIC & SECURITY SETTINGS */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 pl-1">
            Informations Académiques & DRM
          </h3>

          <div className="bg-[#162C3D] border border-[#3D4F58]/40 rounded-2xl p-5 space-y-4 shadow-md">
            {/* University Selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <FiUser className="text-[#00ED64]" /> Institution Universitaire
              </label>
              {isEditing ? (
                <select
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00ED64]"
                >
                  {UNIVERSITIES.map((u) => (
                    <option key={u} value={u}>
                      {u} - Kinshasa
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-sm font-mono font-semibold text-slate-100 bg-[#0A222F]/40 px-3 py-2 rounded-xl border border-[#3D4F58]/20">
                  {university} - Kinshasa, RDC
                </div>
              )}
            </div>

            {/* Mobile Money Phone (DRM Bound) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-300 font-medium flex items-center gap-2">
                  <FiPhone className="text-[#00ED64]" /> Numéro Mobile Money
                  (USSD)
                </label>
                <span className="text-[10px] font-mono bg-[#00684A]/40 text-[#00ED64] px-2 py-0.5 rounded border border-[#00ED64]/30">
                  Lié au Filigrame
                </span>
              </div>
              {isEditing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-[#00ED64]"
                />
              ) : (
                <div className="text-sm font-mono font-semibold text-slate-100 bg-[#0A222F]/40 px-3 py-2 rounded-xl border border-[#3D4F58]/20 flex justify-between items-center">
                  <span>{phone}</span>
                  <FiShield className="text-[#00ED64] w-4 h-4" />
                </div>
              )}
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                Ce numéro reçoit vos invites de paiement FlexPay et s'affiche en
                filigrane (15% opacité) sur vos syllabus pour empêcher le
                piratage.
              </p>
            </div>

            {isEditing && (
              <m.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(false)}
                className="w-full bg-[#00ED64] text-[#001E2B] font-bold text-xs py-3 rounded-xl shadow-[0_4px_15px_rgba(0,237,100,0.2)] mt-2 cursor-pointer"
              >
                Enregistrer les modifications
              </m.button>
            )}
          </div>
        </section>

        {/* LOCAL DRC PREFERENCES (Data Saver & Language) */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 pl-1">
            Préférences de l'Application
          </h3>

          <div className="bg-[#162C3D] border border-[#3D4F58]/40 rounded-2xl p-5 space-y-4 shadow-md">
            {/* 3G/4G Data Saver Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3 pr-4">
                <div className="p-2 rounded-lg bg-[#0A222F] text-[#00ED64] mt-0.5">
                  <FiWifi className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Mode Économie de Données (3G/4G)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Compresse les flux Canvas et met les syllabus en cache
                    hors-ligne.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDataSaver(!dataSaver)}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                  dataSaver ? "bg-[#00ED64]" : "bg-[#3D4F58]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#001E2B] transition-transform ${
                    dataSaver ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="pt-3 border-t border-[#3D4F58]/30 flex items-center justify-between text-xs">
              <span className="text-slate-300 flex items-center gap-2">
                <FiGlobe className="text-slate-400" /> Langue de l'interface
              </span>
              <span className="font-mono font-semibold text-[#00ED64] bg-[#0A222F] px-3 py-1 rounded-lg border border-[#3D4F58]/30">
                Français (RDC)
              </span>
            </div>
          </div>
        </section>

        {/* TRANSACTION HISTORY LEDGER */}
        <section className="space-y-3">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 pl-1">
            Historique Mobile Money
          </h3>

          <div className="space-y-2.5">
            {TRANSACTIONS.map((tx) => (
              <div
                key={tx.id}
                className="bg-[#162C3D]/80 border border-[#3D4F58]/30 rounded-2xl p-4 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#00684A]/30 text-[#00ED64] flex items-center justify-center font-bold">
                    <FiCheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{tx.course}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {tx.provider} • {tx.date}
                    </span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-[#00ED64] block">
                    {tx.amount}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LOGOUT BUTTON */}
        <button className="w-full bg-[#162C3D] hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-[#3D4F58]/40 hover:border-red-500/30 font-semibold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-sm">
          <FiLogOut className="w-4 h-4" /> Déconnexion de l'appareil
        </button>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
