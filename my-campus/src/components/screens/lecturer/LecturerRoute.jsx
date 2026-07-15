// src/components/screens/lecturer/LecturerRoute.jsx
//
// Monolith. — "My Campus"
// Thin wrapper around LecturerPortal so the floating "switch to student
// view (testing)" and logout buttons live next to the route, not baked
// into App.jsx.

import { useNavigate } from "react-router-dom";
import { FiUsers, FiLogOut } from "react-icons/fi";
import { useAuth } from "../../../hooks/useAuth";
import LecturerPortal from "./Portal";

export default function LecturerRoute() {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <LecturerPortal user={userProfile} onSwitchToStudent={() => navigate("/student")} />

      {/* TEMPORARY FLOATING SWITCHER BUTTON (TESTING UTILITY) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => navigate("/student")}
          className="bg-[#00ED64] hover:bg-[#00c753] text-[#001E2B] font-extrabold px-5 py-3 rounded-full shadow-[0_8px_30px_rgba(0,237,100,0.4)] flex items-center gap-2 text-xs cursor-pointer border-2 border-[#001E2B] transition-transform hover:scale-105"
        >
          <FiUsers className="w-4 h-4" />
          <span>Basculer sur Vue PWA Étudiant</span>
        </button>
        <button
          onClick={handleLogout}
          title="Se déconnecter"
          className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg cursor-pointer transition-transform hover:scale-105"
        >
          <FiLogOut className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}