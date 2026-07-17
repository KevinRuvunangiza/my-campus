// src/components/screens/lecturer/VerificationPendingRoute.jsx
//
// Monolith. — "My Campus"
// Container that wires the presentational VerificationPendingScreen to real
// auth state: real email/is_verified from Postgres, a working "refresh
// status" button, and a "enter draft mode" action that's remembered across
// a page reload (sessionStorage, per user id — not fake data, just UI memory).

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import VerificationPendingScreen from "./VerificationPendingScreen";

export const DRAFT_KEY_PREFIX = "monolith_draft_mode_ack";

export default function VerificationPendingRoute() {
  const { userProfile, session, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const handleEnterDraftMode = () => {
    if (userProfile?.id) {
      sessionStorage.setItem(`${DRAFT_KEY_PREFIX}:${userProfile.id}`, "true");
    }
    navigate("/lecturer", { replace: true });
  };

  const handleCheckStatus = async () => {
    const fresh = await refreshProfile();
    if (fresh?.is_verified) {
      navigate("/lecturer", { replace: true });
    }
    // If still not verified, VerificationPendingScreen re-renders with the
    // (unchanged) profile — no-op is the correct behavior here.
  };

  return (
    <VerificationPendingScreen
      user={{
        ...userProfile,
        email: session?.user?.email,
        email_confirmed_at: session?.user?.email_confirmed_at,
      }}
      onEnterDraftMode={handleEnterDraftMode}
      onCheckStatus={handleCheckStatus}
    />
  );
}
