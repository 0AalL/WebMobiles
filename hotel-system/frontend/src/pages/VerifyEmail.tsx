import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";

export const VerifyEmail = () => {
  const { token } = useParams();
  const [message, setMessage] = useState("Verificando cuenta...");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token invalido.");
      setMessage("");
      return;
    }

    api.get(`/auth/verify/${token}`)
      .then((res) => {
        setMessage(res.data || "Cuenta verificada correctamente.");
      })
      .catch((err: any) => {
        setError(err?.response?.data ?? "No se pudo verificar la cuenta.");
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

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
      </section>
    </main>
  );
};
