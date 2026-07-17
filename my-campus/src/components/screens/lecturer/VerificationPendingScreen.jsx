import { useNavigate, useLocation } from "react-router-dom";
import { m } from "framer-motion";
import { FiMail, FiShield, FiArrowRight } from "react-icons/fi";

export default function VerificationPendingScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  // Pull user details passed from AuthScreen.jsx
  const { email = "votre adresse email", fullName = "Professeur" } =
    location.state || {};

  const handleEnterSandbox = () => {
    // Route them to their dashboard. GuestOnly/ProtectedRoute will let them through to /lecturer
    // where they can work in restricted Draft Mode!
    navigate("/lecturer", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#06141D] text-white flex items-center justify-center p-6 font-sans selection:bg-[#00ED64]">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00ED64]/10 rounded-full blur-[140px] pointer-events-none" />

      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-[#162C3D]/90 backdrop-blur-2xl border border-[#3D4F58]/80 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10"
      >
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

        <div className="space-y-4 mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Bienvenue, <span className="text-[#00ED64]">{fullName}</span> !
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Votre espace professeur a été initialisé. Pour garantir
            l'authenticité des cours et sécuriser vos revenus Mobile Money sur{" "}
            <strong>My Campus</strong>, un audit de routine est requis avant
            votre première publication en direct.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="p-5 rounded-2xl border bg-[#0A222F] border-amber-500/50 text-amber-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <FiMail className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm md:text-base">
                  1. Activation de l'Adresse Email
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10">
                  Action Requise
                </span>
              </div>
              <p className="text-xs mt-1 opacity-80">
                Un lien de confirmation a été envoyé à <strong>{email}</strong>.
                Veuillez cliquer dessus pour activer vos clés de sécurité DRM.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border bg-[#0A222F] border-blue-500/50 text-blue-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <FiShield className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm md:text-base">
                  2. Audit d'Accréditation (Équipe Monolith)
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10">
                  En cours
                </span>
              </div>
              <p className="text-xs mt-1 opacity-80">
                Nos responsables de déploiement (Dan Ebondo & Emmanuel Kabongo)
                vérifient actuellement votre statut de professeur titulaire à
                l'USCITECH.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#3D4F58]/50">
          <button
            onClick={handleEnterSandbox}
            className="w-full bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold py-4 px-6 rounded-2xl shadow-[0_8px_30px_rgba(0,237,100,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <span>Accéder à mon tableau de bord (Mode Brouillon)</span>
            <FiArrowRight className="w-5 h-5" />
          </button>
        </div>

        <p className="text-center text-[11px] font-mono text-slate-400 mt-6">
          🔒 En mode brouillon, vous pouvez structurer vos matières et uploader
          vos syllabus PDF, mais la vente en direct sur le Market étudiant
          restera verrouillée.
        </p>
      </m.div>
    </div>
  );
}
