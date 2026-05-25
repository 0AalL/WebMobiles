import { useState } from "react";
import { api } from "../services/api";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

type AuthModalProps = {
  onClose: () => void;
  onAuthSuccess?: (message: string) => void;
  initialMode?: "login" | "register";
};

type AuthResponse = {
  token: string;
  userId: string;
  email: string;
  role: string;
};

export const AuthModal = ({ onClose, onAuthSuccess, initialMode = "login" }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(initialMode !== "register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [info, setInfo] = useState("");
  const [verificationLink, setVerificationLink] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);

  const [data, setData] = useState({
    email: "",
    password: "",
    role: "user"
  });

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setInfo("");
    setVerificationLink("");
    setLoading(true);
    try {
      if (isLogin) {
        const response = await api.post<AuthResponse>("/auth/login", {
          email: data.email,
          password: data.password
        });

        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem(
          "authUser",
          JSON.stringify({
            userId: response.data.userId,
            email: response.data.email,
            role: response.data.role
          })
        );

        setSuccess("Sesion iniciada correctamente. Bienvenido a OrbiStay.");
        onAuthSuccess?.("Sesion iniciada correctamente.");
        setTimeout(() => onClose(), 900);
      } else {
        const response = await api.post<{ verificationLink?: string }>("/auth/register", data);
        setSuccess("Cuenta creada. Revisa tu correo para verificarla.");
        if (response.data.verificationLink) {
          setInfo("Modo desarrollo: tambien puedes abrir este enlace directo.");
          setVerificationLink(response.data.verificationLink);
        }
        setIsLogin(true);
        setData({ ...data, password: "" });
      }
    } catch (err: any) {
      setError(err?.response?.data ?? "Ocurrio un error al autenticar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card auth-modal" onClick={(event) => event.stopPropagation()}>
        <div className="auth-modal__hero">
          <span className="eyebrow">OrbiStay</span>
          <h2>{isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}</h2>
          <p>
            Accede a tu espacio o regístrate para comenzar a reservar con estilo.
          </p>
        </div>

        <div className="form-stack">
          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}
          {info && <p className="muted-text">{info}</p>}
          {verificationLink && (
            <p className="link-hint">
              <a href={verificationLink}>{verificationLink}</a>
            </p>
          )}

          <label className="field-label" htmlFor="auth-email">Correo electronico</label>
          <input
            id="auth-email"
            className="text-field"
            placeholder="Email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />

          <label className="field-label" htmlFor="auth-password">Contrasena</label>
          <input
            id="auth-password"
            type="password"
            className="text-field"
            placeholder="Contraseña"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />

          {!isLogin && (
            <>
              <label className="field-label" htmlFor="auth-role">Rol</label>
              <select
                id="auth-role"
                className="text-field"
                value={data.role}
                onChange={(e) => setData({ ...data, role: e.target.value })}
              >
                <option value="user">Usuario</option>
                <option value="owner">Publicador</option>
              </select>
            </>
          )}

          <button className="button button--primary button--full" disabled={loading} onClick={handleSubmit}>
            {loading ? "Procesando..." : isLogin ? "Entrar" : "Registrarse"}
          </button>

          <div className="modal-links">
            <button className="link-button" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Crear cuenta" : "Ya tengo cuenta"}
            </button>

            <button className="link-button" onClick={() => setShowRecovery(true)}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button className="button button--ghost button--full" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      {showRecovery && <ForgotPasswordModal onClose={() => setShowRecovery(false)} />}
    </div>
  );
};