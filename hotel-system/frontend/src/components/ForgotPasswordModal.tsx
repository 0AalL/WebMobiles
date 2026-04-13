import { useState } from "react";
import { api } from "../services/api";

type ForgotPasswordModalProps = {
  onClose: () => void;
};

export const ForgotPasswordModal = ({ onClose }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async () => {
    setMessage("");
    setError("");
    setResetLink("");

    if (!email.trim()) {
      setError("Ingresa un correo valido.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post<{ message: string; resetLink?: string }>("/auth/forgot", {
        email
      });

      setMessage(response.data.message);
      setResetLink(response.data.resetLink ?? "");
    } catch (err: any) {
      setError(err?.response?.data ?? "No se pudo iniciar la recuperacion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card--compact" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="eyebrow">Recuperacion</span>
            <h2>Recupera tu contrasena</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <p className="muted-text">
          Escribe tu correo y te enviaremos el enlace para restablecer acceso.
        </p>

        <div className="form-stack">
          <label className="field-label" htmlFor="recovery-email">
            Correo electronico
          </label>
          <input
            id="recovery-email"
            className="text-field"
            placeholder="tu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          {message && <p className="success-text">{message}</p>}
          {resetLink && (
            <p className="link-hint">
              Enlace de desarrollo: <a href={resetLink}>{resetLink}</a>
            </p>
          )}
          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button className="button button--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button className="button button--primary" disabled={loading} onClick={handleSubmit}>
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};