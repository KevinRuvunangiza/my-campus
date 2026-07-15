
import { m } from "framer-motion";
import {
  FiMail,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";

export default function VerificationPendingScreen({
  user,
  onEnterDraftMode,
  onCheckStatus,
}) {
  const isEmailConfirmed = !!user?.email_confirmed_at;
  const isVerifiedByMonolith = user?.is_verified;

  return (
    <div className="min-h-screen bg-[#06141D] text-white flex items-center justify-center p-6 font-sans selection:bg-[#00ED64]">
      {/* AMBIENT GLOW */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00ED64]/10 rounded-full blur-[140px] pointer-events-none" />

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-[#162C3D]/90 backdrop-blur-2xl border border-[#3D4F58]/80 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10"
      >
        {/* HEADER BRANDING */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#3D4F58]/50">
          <div className="w-12 h-12 bg-white text-[#06141D] font-extrabold text-2xl rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,237,100,0.2)]">
            MC
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Sas de Validation Académique
            </h1>
            <p className="text-xs font-mono text-[#00ED64]">
              USCITECH • Déploiement Monolith.
            </p>
          </div>
        </div>

        {/* WELCOME MESSAGE */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Bienvenue,{" "}
            <span className="text-[#00ED64]">
              {user?.full_name || "Professeur"}
            </span>{" "}
            !
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Votre espace professeur a été créé avec succès. Pour garantir
            l'excellence et la sécurité de la propriété intellectuelle sur{" "}
            <strong>My Campus</strong>, deux étapes sont nécessaires avant la
            publication en direct de vos syllabus.
          </p>
        </div>

        {/* STATUS CHECKLIST */}
        <div className="space-y-4 mb-8">
          {/* STEP 1: EMAIL VERIFICATION */}
          <div
            className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
              isEmailConfirmed
                ? "bg-emerald-950/40 border-[#00ED64]/50 text-emerald-200"
                : "bg-[#0A222F] border-amber-500/50 text-amber-200"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                isEmailConfirmed
                  ? "bg-[#00ED64] text-[#001E2B]"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}
            >
              {isEmailConfirmed ? (
                <FiCheckCircle className="w-5 h-5" />
              ) : (
                <FiMail className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm md:text-base">
                  1. Confirmation de l'Adresse Email
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10">
                  {isEmailConfirmed ? "Validé" : "Action Requise"}
                </span>
              </div>
              <p className="text-xs mt-1 opacity-80">
                {isEmailConfirmed
                  ? "Votre email académique est confirmé et sécurisé."
                  : `Un lien d'activation a été envoyé à ${user?.email || "votre boîte mail"}. Veuillez cliquer dessus pour activer vos clés de sécurité DRM.`}
              </p>
            </div>
          </div>

          {/* STEP 2: MONOLITH AUDIT */}
          <div
            className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
              isVerifiedByMonolith
                ? "bg-emerald-950/40 border-[#00ED64]/50 text-emerald-200"
                : "bg-[#0A222F] border-blue-500/50 text-blue-200"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                isVerifiedByMonolith
                  ? "bg-[#00ED64] text-[#001E2B]"
                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              }`}
            >
              {isVerifiedByMonolith ? (
                <FiCheckCircle className="w-5 h-5" />
              ) : (
                <FiShield className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm md:text-base">
                  2. Audit d'Identité (Équipe Monolith)
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10">
                  {isVerifiedByMonolith ? "Approuvé" : "En cours"}
                </span>
              </div>
              <p className="text-xs mt-1 opacity-80">
                {isVerifiedByMonolith
                  ? "Votre statut de professeur titulaire à l'USCITECH est certifié."
                  : "Nos responsables de déploiement (Dan Ebondo & Emmanuel Kabongo) vérifient actuellement vos accréditations académiques."}
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[#3D4F58]/50">
          <button
            onClick={onEnterDraftMode}
            className="w-full sm:flex-1 bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold py-4 px-6 rounded-2xl shadow-[0_8px_30px_rgba(0,237,100,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <span>Accéder en Mode Brouillon (Sandbox)</span>
            <FiArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onCheckStatus}
            className="w-full sm:w-auto bg-[#0A222F] hover:bg-[#1C364B] text-slate-300 hover:text-white border border-[#3D4F58] font-bold py-4 px-5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            title="Rafraîchir le statut"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span className="sm:hidden">Actualiser</span>
          </button>
        </div>

        {/* RESTRICTION NOTICE */}
        <p className="text-center text-[11px] font-mono text-slate-400 mt-6">
          🔒 En mode brouillon, vous pouvez créer vos cours, uploader vos TP
          (max 5) et préparer vos QCM, mais la vente sur le Market étudiant
          reste désactivée.
        </p>
      </m.div>
    </div>
  );
}
