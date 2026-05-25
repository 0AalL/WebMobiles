import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";

export const VerifyEmail = () => {
  const { token } = useParams();

  const [message, setMessage] = useState("Verificando cuenta...");
  const [error, setError] = useState("");

  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token || hasVerified.current) {
      return;
    }

    hasVerified.current = true;

    api.get(`/auth/verify/${token}`)
      .then((res) => {
        setMessage(res.data || "Cuenta verificada correctamente.");
        setError("");
      })
      .catch((err: any) => {
        setError(
          err?.response?.data ?? "No se pudo verificar la cuenta."
        );

        setMessage("");
      });

  }, [token]);

  return (
    <main className="auth-page">
      <section className="auth-page__card">
        <span className="eyebrow">Confirmacion</span>

        <h2>Verificacion de correo</h2>

        <p>
          Estamos validando tu cuenta para que puedas entrar sin fricciones.
        </p>

        {message && (
          <div className="verify-status verify-status--success">
            <p className="success-text">{message}</p>
          </div>
        )}

        {error && (
          <div className="verify-status verify-status--error">
            <p className="error-text">{error}</p>
          </div>
        )}

        <Link to="/" className="primary-button">
          Ir a la paguina de inicio 
        </Link>
      </section>
    </main>
  );
};