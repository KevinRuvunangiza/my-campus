// src/components/layout/lecturer/TopNavbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  FiBell,
  FiCalendar,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiMenu,
} from "react-icons/fi";

export default function TopNavbar({
  lecturerName = "Professeur",
  department = "Tronc Commun",
  syllabiCount = 0,
  isCapReached = false,
  onToggleSidebar,
}) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  // Génération de la date formatée (ex: Mercredi 15 Juillet 2026)
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const capitalizedDate = today.charAt(0).toUpperCase() + today.slice(1);

  // 💥 MOTEUR DE NOTIFICATIONS DYNAMIQUE
  // Réagit en temps réel à l'état de la base de données Supabase
  useEffect(() => {
    const notifs = [];

    if (isCapReached) {
      notifs.push({
        id: "cap-reached",
        type: "critical",
        icon: <FiAlertTriangle className="text-rose-400 w-5 h-5" />,
        title: "Quota de stockage atteint",
        message:
          "Vous avez utilisé vos 5 emplacements de syllabus. Vous devez en supprimer un pour uploader un nouveau document.",
      });
    }

    if (syllabiCount === 0) {
      notifs.push({
        id: "welcome",
        type: "info",
        icon: <FiInfo className="text-blue-400 w-5 h-5" />,
        title: "Espace initialisé",
        message:
          "Bienvenue sur My Campus. Créez votre première matière dans l'onglet 'Mes Cours' pour commencer.",
      });
    } else {
      notifs.push({
        id: "sync",
        type: "success",
        icon: <FiCheckCircle className="text-[#00ED64] w-5 h-5" />,
        title: "Cloud Synchronisé",
        message: `${syllabiCount}/5 syllabus sont actifs, hébergés dans le cloud privé et protégés par le DRM Canvas.`,
      });
    }

    setNotifications(notifs);
  }, [syllabiCount, isCapReached]);

  // Fermer le menu des notifications si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // La cloche affiche un point rouge uniquement s'il y a une alerte critique (le plafond 5/5)
  const hasCriticalAlert = isCapReached;

  return (
    <header className="sticky top-0 z-40 bg-[#0A222F]/90 backdrop-blur-xl border-b border-[#3D4F58]/40 h-20 px-6 flex items-center justify-between">
      {/* GAUCHE : Bouton Mobile & Fil d'ariane contextuel */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-[#162C3D] hover:text-white transition-colors"
          >
            <FiMenu className="w-5 h-5" />
          </button>
        )}

        <div className="hidden sm:block">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="bg-[#162C3D] text-[#00ED64] px-2.5 py-1 rounded-md border border-[#3D4F58]/50 font-bold">
              USCITECH
            </span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-300 font-bold">{department}</span>
          </div>
        </div>
      </div>

      {/* DROITE : Date, Notifications et Profil */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Date / Status */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#162C3D]/50 px-3 py-1.5 rounded-lg border border-[#3D4F58]/30">
          <FiCalendar className="w-3.5 h-3.5" />
          <span>{capitalizedDate}</span>
        </div>

        {/* Protection Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-[#00ED64] bg-[#00684A]/20 px-2 py-1.5 rounded-lg border border-[#00ED64]/20">
          <FiShield className="w-3.5 h-3.5" />
          <span className="font-bold">Réseau Sécurisé</span>
        </div>

        {/* Cloche de Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className={`relative p-2.5 rounded-xl transition-all cursor-pointer ${
              showNotifs
                ? "bg-[#162C3D] text-white"
                : "text-slate-400 hover:text-white hover:bg-[#162C3D]"
            }`}
          >
            <FiBell className="w-5 h-5" />
            {hasCriticalAlert && (
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-rose-500 border border-[#0A222F] animate-pulse" />
            )}
          </button>

          {/* Menu Déroulant Notifications */}
          <AnimatePresence>
            {showNotifs && (
              <m.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-80 bg-[#162C3D] border border-[#3D4F58]/60 rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="bg-[#0D2633] px-4 py-3 border-b border-[#3D4F58]/40 flex justify-between items-center">
                  <span className="text-sm font-bold text-white">
                    Notifications
                  </span>
                  {hasCriticalAlert && (
                    <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-bold">
                      1 Alerte
                    </span>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      Aucune notification pour le moment.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#3D4F58]/30">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 flex gap-3 ${notif.type === "critical" ? "bg-rose-950/20" : "hover:bg-[#0A222F]/40"}`}
                        >
                          <div className="shrink-0 mt-0.5">{notif.icon}</div>
                          <div className="space-y-1">
                            <h4
                              className={`text-xs font-bold ${notif.type === "critical" ? "text-rose-300" : "text-slate-200"}`}
                            >
                              {notif.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profil Professeur (Avatar) */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#3D4F58]/40">
          <div className="text-right hidden md:block">
            <div className="text-sm font-bold text-white truncate max-w-[150px]">
              {lecturerName}
            </div>
            <div className="text-[10px] text-[#00ED64] font-mono font-bold">
              Compte Actif
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ED64] to-[#00684A] text-[#001E2B] flex items-center justify-center font-extrabold text-sm shadow-md">
            {lecturerName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
