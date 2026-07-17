// src/components/screens/auth/AuthScreen.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
  FiBookOpen,
  FiAward,
  FiArrowLeft,
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

export default function AuthScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, userProfile } = useAuth();

  // Read router state passed from LandingPage or default to student login
  const { mode: initialMode = "login", role: initialRole = "student" } =
    location.state || {};

  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [academicTitle, setAcademicTitle] = useState("");

  // login()/signup() only resolve the Supabase session; `userProfile`
  // (role, is_verified) arrives a beat later via the onAuthStateChange
  // listener inside useAuth. We flag that a redirect is owed, then this
  // effect fires the actual navigation once the profile lands — this is
  // the ONLY place that decides where a user goes after auth.
  const pendingRedirect = useRef(false);

  useEffect(() => {
    if (!pendingRedirect.current || !userProfile) return;
    pendingRedirect.current = false;

    const from = location.state?.from?.pathname;

    if (userProfile.role === "lecturer") {
      if (userProfile.is_verified) {
        navigate(from?.startsWith("/lecturer") ? from : "/lecturer", {
          replace: true,
        });
      } else {
        navigate("/lecturer/verification-pending", { replace: true });
      }
    } else {
      navigate(from?.startsWith("/student") ? from : "/student", {
        replace: true,
      });
    }
  }, [userProfile, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setConfirmationMessage(null);

    try {
      if (isLogin) {
        await login(email, password);
        pendingRedirect.current = true;
        // Don't setLoading(false) here — the redirect effect above will
        // navigate away momentarily; leaving the spinner on avoids a
        // flash of the empty form while userProfile resolves.
      } else {
        const result = await signup({
          email,
          password,
          fullName,
          phone,
          role,
          academicTitle: role === "lecturer" ? academicTitle : null,
          department: department || "Tronc Commun",
        });

        if (result.status === "confirmation_required") {
          setConfirmationMessage(
            result.message ||
              `🎉 Inscription réussie ! Un email de confirmation a été envoyé à ${email}. Veuillez vérifier votre boîte de réception pour activer votre compte.`,
          );
          setLoading(false);
          return;
        }

        if (result.status === "signed_in") {
          pendingRedirect.current = true;
        }
      }
    } catch (err) {
      console.error("Erreur Monolith Auth:", err);
      setError(
        err.message || "Une erreur est survenue lors de l'authentification.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06141D] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#00ED64] selection:text-[#001E2B] relative overflow-x-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00ED64]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[#00ED64] transition-colors mb-6"
        >
          <FiArrowLeft className="w-4 h-4" /> Retour au site Monolith
        </Link>

        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white flex items-center justify-center text-[#06141D] font-extrabold text-xl rounded-xl shadow-[0_0_15px_rgba(0,237,100,0.1)]">
            MC
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            My Campus{" "}
            <span className="text-xs font-mono text-[#00ED64] font-normal">
              • RDC
            </span>
          </h2>
        </div>

        <h3 className="text-center text-lg font-bold text-slate-300">
          {isLogin
            ? "Connexion à votre espace"
            : "Créer votre compte de portail"}
        </h3>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-[#162C3D]/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-[#3D4F58]/60 sm:px-10">
          {/* ROLE SWITCHER */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#0A222F] rounded-xl mb-6 border border-[#3D4F58]/40">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`py-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role === "student"
                  ? "bg-[#00ED64] text-[#001E2B] shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FiUser className="w-3.5 h-3.5" /> Étudiant
            </button>
            <button
              type="button"
              onClick={() => setRole("lecturer")}
              className={`py-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role === "lecturer"
                  ? "bg-[#00ED64] text-[#001E2B] shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FiAward className="w-3.5 h-3.5" /> Professeur
            </button>
          </div>

          {/* INLINE CONFIRMATION BANNER */}
          {confirmationMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-[#00ED64]/50 flex items-start gap-3 text-emerald-200 text-xs leading-relaxed">
              <FiCheckCircle className="w-5 h-5 text-[#00ED64] shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-1 text-white">
                  Vérification Requise
                </strong>
                {confirmationMessage}
              </div>
            </div>
          )}

          {/* ERROR BANNER */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-start gap-3 text-rose-200 text-xs leading-relaxed">
              <FiAlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-1 text-white">
                  Erreur d'authentification
                </strong>
                {error}
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nom complet
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <FiUser className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={
                        role === "lecturer"
                          ? "Ex: Prof. Mpunga Jean"
                          : "Ex: Kevin Ruvunangiza"
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-sm text-white focus:outline-none focus:border-[#00ED64] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Numéro Mobile Money (Airtel/Orange/M-Pesa)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <FiPhone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="084 123 4567"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-sm text-white focus:outline-none focus:border-[#00ED64] transition-colors"
                    />
                  </div>
                </div>

                {role === "lecturer" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Titre académique
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <FiAward className="w-4 h-4" />
                      </div>
                      <select
                        required
                        value={academicTitle}
                        onChange={(e) => setAcademicTitle(e.target.value)}
                        className="w-full pl-10 pr-8 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-sm text-white focus:outline-none focus:border-[#00ED64] transition-colors appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="text-slate-500">
                          Sélectionnez votre titre...
                        </option>
                        <option value="Professeur">Professeur (Prof.)</option>
                        <option value="Chef de Travaux">
                          Chef de Travaux (C.T.)
                        </option>
                        <option value="Docteur">Docteur (Dr.)</option>
                        <option value="Assistant">Assistant (Ass.)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                        <span className="text-xs">▼</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Faculté / Département
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <FiBookOpen className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Ex: Sciences Informatiques"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-sm text-white focus:outline-none focus:border-[#00ED64] transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Adresse Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <FiMail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@uscitech.ac.cd"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-sm text-white focus:outline-none focus:border-[#00ED64] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <FiLock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0A222F] border border-[#3D4F58] rounded-xl text-sm text-white focus:outline-none focus:border-[#00ED64] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#00ED64] hover:bg-[#00c753] disabled:opacity-50 text-[#001E2B] font-extrabold py-3 rounded-xl shadow-[0_8px_25px_rgba(0,237,100,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#001E2B] border-t-transparent rounded-full animate-spin" />
              ) : isLogin ? (
                "Se Connecter"
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-[#3D4F58]/30 pt-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setConfirmationMessage(null);
              }}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isLogin
                ? "Pas encore de compte ? S'inscrire"
                : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
