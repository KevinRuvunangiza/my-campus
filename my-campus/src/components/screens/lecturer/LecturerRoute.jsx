// src/components/screens/lecturer/LecturerRoute.jsx
//
// Monolith. — "My Campus"
// Thin wrapper around LecturerPortal that wires auth state and provides
// a logout escape hatch. Unverified lecturers are no longer redirected to
// a separate pending screen — the dashboard itself handles the standby state.

import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
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
      <LecturerPortal user={userProfile} />

      {/* LOGOUT BUTTON — fixed bottom-right corner */}
      <div className="fixed bottom-6 right-6 z-50">
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
