import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { 
  FiPhone, FiLock, FiUser, FiBook, FiBriefcase, 
  FiShield, FiCheckCircle, FiArrowRight, FiAlertCircle, FiAward, FiMail 
} from "react-icons/fi";

const UNIVERSITIES = [
  "UNIKIN - Université de Kinshasa",
  "UPC - Université Protestante au Congo",
  "ULK - Université Libre de Kinshasa",
  "ISC - Institut Supérieur de Commerce",
  "ISTA - Institut Supérieur des Techniques Appliquées"
];

const ACADEMIC_TITLES = [
  "Professeur (Prof.)",
  "Docteur (Dr.)",
  "Chef de Travaux (C.T.)",
  "Assistant (Ass.)"
];

export default function AuthScreen({ onAuthSuccess }) {
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'signup'
  const [role, setRole] = useState("student");       // 'student' | 'lecturer'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);

  // Updated Form Data: Now includes Email!
  const [formData, setFormData] = useState({
    email: "etudiant@unikin.ac.cd",
    phone: "084 123 4567",
    password: "",
    fullName: "",
    university: UNIVERSITIES[0],
    department: "Faculté d'Informatique",
    academicTitle: ACADEMIC_TITLES[0]
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (authMode === "signup" && role === "lecturer") {
        setVerificationPending(true);
      } else {
        onAuthSuccess({ role, user: formData });
      }
    }, 1200);
  };

  // 1. LECTURER VERIFICATION PENDING STATE
  if (verificationPending) {
    return (
      <div className="min-h-screen bg-[#0A222F] text-white flex items-center justify-center p-6 font-sans">
        <m.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#162C3D] border border-[#00ED64]/40 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden space-y-6"
        >
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#00ED64]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 bg-[#00684A] text-[#00ED64] rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-[0_0_25px_rgba(0,237,100,0.3)] border border-[#00ED64]/30">
            <FiShield className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#00ED64] block font-bold">
              INSCRIPTION PROFESSEUR ENREGISTRÉE
            </span>
            <h2 className="text-xl font-extrabold text-white">Vérification Académique en Cours</h2>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              Merci <strong>{formData.academicTitle} {formData.fullName}</strong>. Un e-mail de confirmation a été envoyé à <strong className="text-[#00ED64]">{formData.email}</strong>. Notre équipe vérifie votre affiliation à <strong>{formData.university.split(" - ")[0]}</strong>.
            </p>
          </div>

          <div className="bg-[#0A222F]/80 p-4 rounded-2xl border border-[#3D4F58]/50 text-left space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-300">
              <FiCheckCircle className="text-[#00ED64] shrink-0" />
              <span>Compte distributeur affilié créé</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300">
              <FiAlertCircle className="text-amber-400 shrink-0" />
              <span>Liaison M-Pesa ({formData.phone}) en validation</span>
            </div>
          </div>

          <button
            onClick={() => onAuthSuccess({ role: "lecturer", user: formData })}
            className="w-full bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold py-3.5 rounded-xl text-xs shadow-[0_4px_15px_rgba(0,237,100,0.25)] transition-all cursor-pointer"
          >
            Accéder à mon espace (Mode Brouillon)
          </button>
        </m.div>
      </div>
    );
  }

  // 2. MAIN LOGIN / SIGNUP SCREEN
  return (
    <div className="min-h-screen bg-[#0A222F] text-white flex flex-col justify-center items-center p-4 sm:p-6 font-sans selection:bg-[#00ED64] selection:text-[#001E2B]">
      
      <div className="w-full max-w-md space-y-6">
        
        {/* BRANDING HEADER */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#162C3D] px-3.5 py-1.5 rounded-full border border-[#3D4F58]/60 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#00ED64] animate-ping" />
            <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-slate-200">
              Campus Digital • RDC
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {authMode === "login" ? "Bon retour sur le Campus" : "Créer un compte universitaire"}
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            La première plateforme de TP interactifs et d'examen sécurisée par filigrane en RDC.
          </p>
        </div>

        {/* AUTH MODE TABS */}
        <div className="grid grid-cols-2 p-1 bg-[#162C3D] rounded-2xl border border-[#3D4F58]/50 shadow-md">
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              authMode === "login" ? "bg-[#00ED64] text-[#001E2B] shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className={`py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              authMode === "signup" ? "bg-[#00ED64] text-[#001E2B] shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Inscription
          </button>
        </div>

        {/* MAIN FORM CARD */}
        <m.form
          layout
          onSubmit={handleSubmit}
          className="bg-[#162C3D] border border-[#3D4F58]/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative overflow-hidden"
        >
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#00ED64]/10 rounded-full blur-3xl pointer-events-none" />

          {/* ROLE SELECTOR (SIGNUP ONLY) */}
          <AnimatePresence mode="popLayout">
            {authMode === "signup" && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-xs text-slate-300 font-medium block">Je m'inscris en tant que :</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      role === "student"
                        ? "bg-[#1C364B] border-[#00ED64] text-white shadow-[0_0_15px_rgba(0,237,100,0.15)] font-bold"
                        : "bg-[#0A222F]/60 border-[#3D4F58]/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    <FiUser className={`w-5 h-5 ${role === "student" ? "text-[#00ED64]" : ""}`} />
                    <span className="text-xs">Étudiant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("lecturer")}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      role === "lecturer"
                        ? "bg-[#1C364B] border-[#00ED64] text-white shadow-[0_0_15px_rgba(0,237,100,0.15)] font-bold"
                        : "bg-[#0A222F]/60 border-[#3D4F58]/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    <FiAward className={`w-5 h-5 ${role === "lecturer" ? "text-[#00ED64]" : ""}`} />
                    <span className="text-xs">Professeur / C.T.</span>
                  </button>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {/* SPECIFIC FIELDS FOR SIGNUP */}
          <AnimatePresence mode="popLayout">
            {authMode === "signup" && (
              <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                
                {role === "lecturer" && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-medium block">Titre académique</label>
                    <select
                      value={formData.academicTitle}
                      onChange={(e) => handleChange("academicTitle", e.target.value)}
                      className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00ED64] cursor-pointer"
                    >
                      {ACADEMIC_TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium block">Nom complet</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder={role === "lecturer" ? "Ex : Jean-Marie Mpunga" : "Ex : Kevin Ruvunangiza"}
                      className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ED64] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium block">Institution universitaire</label>
                  <div className="relative">
                    <FiBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <select
                      value={formData.university}
                      onChange={(e) => handleChange("university", e.target.value)}
                      className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#00ED64] cursor-pointer"
                    >
                      {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                {role === "lecturer" && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-300 font-medium block">Faculté / Département d'enseignement</label>
                    <div className="relative">
                      <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        required
                        value={formData.department}
                        onChange={(e) => handleChange("department", e.target.value)}
                        placeholder="Ex : Faculté d'Informatique, Polytechnique..."
                        className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ED64]"
                      />
                    </div>
                  </div>
                )}
              </m.div>
            )}
          </AnimatePresence>

          {/* COMMON FIELDS: EMAIL, PHONE & PASSWORD */}
          <div className="space-y-4">
            
            {/* 1. EMAIL FIELD (Cheap OTP Verification & Promotional Updates) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-300 font-medium block">Adresse E-mail</label>
                <span className="text-[9px] font-mono text-[#00ED64] bg-[#0A222F] px-2 py-0.5 rounded border border-[#00ED64]/30">
                  Vérification OTP & Mises à jour
                </span>
              </div>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="etudiant@unikin.ac.cd"
                  className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#00ED64] transition-all"
                />
              </div>
              {authMode === "signup" && (
                <p className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                  <FiCheckCircle className="text-[#00ED64] w-3 h-3 shrink-0" />
                  <span>Utilisé pour l'envoi gratuit de vos codes de connexion et des alertes de nouveaux TP.</span>
                </p>
              )}
            </div>

            {/* 2. PHONE NUMBER (M-Pesa Checkout & Anti-Piracy Watermarking) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-300 font-medium block">
                  {role === "lecturer" && authMode === "signup" ? "Numéro Mobile Money (Retraits 70%)" : "Numéro Mobile Money (M-Pesa / Orange / Airtel)"}
                </label>
                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Ancrage DRM
                </span>
              </div>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="084 000 0000"
                  className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl pl-10 pr-4 py-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#00ED64] transition-all"
                />
              </div>
              {authMode === "signup" && (
                <p className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                  <FiShield className="text-[#00ED64] w-3 h-3 shrink-0" />
                  {role === "student" ? (
                    <span>Ce numéro sert aux paiements USSD 1-clic et s'affiche en filigrane sur vos syllabus.</span>
                  ) : (
                    <span>Ce numéro recevra automatiquement vos reversements de 70% à chaque achat étudiant.</span>
                  )}
                </p>
              )}
            </div>

            {/* 3. PASSWORD / PIN */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs text-slate-300 font-medium block">Mot de passe / PIN de sécurité</label>
                {authMode === "login" && (
                  <button type="button" className="text-[11px] text-[#00ED64] hover:underline cursor-pointer">
                    Oublié ?
                  </button>
                )}
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0A222F] border border-[#3D4F58]/60 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00ED64] transition-all"
                />
              </div>
            </div>

          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#00ED64] hover:bg-[#00c753] disabled:opacity-50 text-[#001E2B] font-extrabold py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,237,100,0.25)] hover:shadow-[0_6px_25px_rgba(0,237,100,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#001E2B] border-t-transparent rounded-full animate-spin" />
                <span>Validation Supabase en cours...</span>
              </>
            ) : (
              <>
                <span>{authMode === "login" ? "Se connecter à mon portail" : "Créer mon compte et continuer"}</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* FOOTER SWITCHER */}
          <div className="text-center pt-2 border-t border-[#3D4F58]/40">
            <p className="text-xs text-slate-400">
              {authMode === "login" ? "Pas encore de compte ?" : "Vous avez déjà un compte ?"}
              <button
                type="button"
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                className="text-[#00ED64] font-bold ml-1 hover:underline cursor-pointer"
              >
                {authMode === "login" ? "S'inscrire gratuitement" : "Se connecter"}
              </button>
            </p>
          </div>

        </m.form>

        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
            <FiShield className="text-[#00ED64]" /> Chiffrement Supabase • Authentification RDC
          </span>
        </div>

      </div>

    </div>
  );
}