import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { api } from "../services/api";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError("");
    setMessage("");

    if (!token) {
      setError("Token invalido.");
      return;
    }

    if (password.length < 8) {
      setError("La contrasena debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<string>("/auth/reset", { token, password });
      setMessage((response.data || "Contrasena actualizada.") + " Redirigiendo al inicio...");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/"), 1200);
    } catch (err: any) {
      setError(err?.response?.data ?? "No se pudo actualizar la contrasena.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-page__card">
        <span className="eyebrow">Seguridad</span>
        <h2>Nueva contraseña</h2>
        <p>
          Define una nueva clave segura para recuperar el acceso a tu cuenta.
        </p>

        <div className="form-stack">
          <label className="field-label" htmlFor="new-password">Nueva contrasena</label>
          <input
            id="new-password"
            type="password"
            className="text-field"
            placeholder="Nueva contrasena"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="field-label" htmlFor="confirm-password">Confirmar contrasena</label>
          <input
            id="confirm-password"
            type="password"
            className="text-field"
            placeholder="Confirmar contrasena"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button className="button button--ghost button--full" onClick={() => window.history.back()}>
              Volver
            </button>
            <button className="button button--primary button--full" disabled={loading} onClick={handleReset}>
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};