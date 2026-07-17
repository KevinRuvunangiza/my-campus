// src/components/screens/student/Profile.jsx
import { useState, useEffect } from "react";
import {
  FiPhone,
  FiShield,
  FiCheckCircle,
  FiWifi,
  FiAward,
  FiTrash2,
  FiFileText,
} from "react-icons/fi";

import { TbLogout } from "react-icons/tb";
import { Link } from "react-router-dom";
import TopNav from "../../layout/TopNav";
import BottomNav from "../../layout/BottomNav";
import * as studentService from "../../../services/studentService";
import { useAuth } from "../../../hooks/useAuth";

export default function Profile({ user, activeTab, setActiveTab, onLogout }) {
  const [dataSaver, setDataSaver] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { deleteAccount } = useAuth(); // Import the delete function

  useEffect(() => {
    studentService.getTransactionHistory().then((data) => {
      setTransactions(data || []);
      setLoading(false);
    });
  }, []);

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Tous vos achats de syllabus seront irrémédiablement perdus.",
      )
    ) {
      try {
        await deleteAccount();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A222F] text-white flex flex-col justify-between pb-24 md:pb-6 font-sans">
      <TopNav name={user?.full_name} university={user?.university} />

      <main className="flex-1 max-w-md w-full mx-auto px-5 py-6 space-y-6">
        <div className="bg-gradient-to-br from-[#162C3D] to-[#0D2633] border border-[#3D4F58]/40 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#00ED64]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#00684A] border-2 border-[#00ED64]/40 flex items-center justify-center text-xl font-extrabold text-white shadow-lg">
              {user?.full_name?.charAt(0).toUpperCase() || "E"}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {user?.full_name || "Étudiant"}
              </h2>
              <span className="text-xs font-mono text-[#00ED64] flex items-center gap-1 mt-0.5">
                <FiAward className="w-3.5 h-3.5" /> Compte Vérifié
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#3D4F58]/30">
            <div className="bg-[#0A222F]/50 p-3 rounded-2xl border border-[#3D4F58]/20 text-center">
              <span className="text-xs text-slate-400 font-mono block">
                Achats
              </span>
              <span className="text-lg font-bold font-mono text-[#00ED64]">
                {transactions.length}
              </span>
            </div>
            <div className="bg-[#0A222F]/50 p-3 rounded-2xl border border-[#3D4F58]/20 text-center">
              <span className="text-xs text-slate-400 font-mono block">
                Statut DRM
              </span>
              <span className="text-lg font-bold font-mono text-white">
                Actif
              </span>
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 pl-1">
            Sécurité & Préférences
          </h3>
          <div className="bg-[#162C3D] border border-[#3D4F58]/40 rounded-2xl p-5 space-y-4 shadow-md">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <FiPhone className="text-[#00ED64]" /> Numéro Mobile Money
              </label>
              <div className="text-sm font-mono font-semibold text-slate-100 bg-[#0A222F]/40 px-3 py-2 rounded-xl border border-[#3D4F58]/20 flex justify-between items-center">
                <span>{user?.phone_number || "Non renseigné"}</span>
                <FiShield className="text-[#00ED64] w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[#3D4F58]/30 pt-4">
              <div className="flex items-start gap-3 pr-4">
                <div className="p-2 rounded-lg bg-[#0A222F] text-[#00ED64]">
                  <FiWifi className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Économie de Données 3G
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Active le cache de syllabus local.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDataSaver(!dataSaver)}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${dataSaver ? "bg-[#00ED64]" : "bg-[#3D4F58]"}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#001E2B] transition-transform ${dataSaver ? "translate-x-6" : "translate-x-0"}`}
                />
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-slate-400 pl-1">
            Historique d'Achats ({transactions.length})
          </h3>
          <div className="space-y-2.5">
            {loading ? (
              <p className="text-xs text-slate-500 text-center py-4">
                Chargement...
              </p>
            ) : transactions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4 bg-[#162C3D]/50 rounded-xl">
                Aucun achat.
              </p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-[#162C3D]/80 border border-[#3D4F58]/30 rounded-2xl p-4 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#00684A]/30 text-[#00ED64] flex items-center justify-center font-bold">
                      <FiCheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white max-w-[150px] truncate">
                        {tx.courseTitle}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(tx.purchased_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-[#00ED64] block">
                      {tx.amount_fc.toLocaleString()} FC
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 💥 NEW: LEGAL AND DANGER ZONES */}
        <div className="pt-4 border-t border-[#3D4F58]/30 space-y-3">
          <Link
            to="/privacy"
            className="w-full bg-[#162C3D] hover:bg-[#1A3347] text-slate-300 border border-[#3D4F58]/40 font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs transition-colors"
          >
            <FiFileText className="w-4 h-4" /> Politique de confidentialité
          </Link>
          <button
            onClick={onLogout}
            className="w-full bg-[#162C3D] hover:bg-slate-700/50 text-slate-300 border border-[#3D4F58]/40 font-semibold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <TbLogout className="w-4 h-4" /> Se déconnecter
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full bg-transparent hover:bg-red-500/10 text-rose-500 border border-red-500/30 hover:border-red-500/60 font-semibold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <FiTrash2 className="w-4 h-4" /> Supprimer définitivement mon compte
          </button>
        </div>
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
