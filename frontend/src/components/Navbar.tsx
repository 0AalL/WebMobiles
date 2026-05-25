import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "./AuthModal";

export const Navbar = () => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [notice, setNotice] = useState("");
  const [authUser, setAuthUser] = useState<{ email: string; role: string } | null>(() => {
    const raw = localStorage.getItem("authUser");
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setAuthUser(null);
  };

  return (
    <>
      <header className="topbar">
        <div>
          <span className="eyebrow">Hotel system</span>
          <h2 className="brand-mark">OrbiStay</h2>
        </div>

        <div className="topbar__actions">
          {!authUser && (
            <>
              <button className="button button--ghost" onClick={() => {
                setAuthMode("login");
                setShowAuth(true);
              }}>Iniciar sesión</button>
              <button className="button button--primary" onClick={() => {
                setAuthMode("register");
                setShowAuth(true);
              }}>Registrarse</button>
            </>
          )}

          {authUser && (
            <div className="user-chip">
              <div>
                <strong>{authUser.email}</strong>
                <span>{authUser.role}</span>
              </div>
              {authUser.role === "owner" && (
                <button className="button button--primary" onClick={() => navigate("/host")}>Mi panel</button>
              )}
              <button className="button button--ghost" onClick={handleLogout}>Cerrar sesión</button>
            </div>
          )}
        </div>
      </header>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          initialMode={authMode}
          onAuthSuccess={(message) => {
            const raw = localStorage.getItem("authUser");
            if (!raw) return;

            try {
              setAuthUser(JSON.parse(raw));
              setNotice(message);
              setTimeout(() => setNotice(""), 2600);
            } catch {
              setAuthUser(null);
            }
          }}
        />
      )}

      {notice && (
        <div className="ui-notice">{notice}</div>
      )}
    </>
  );
};