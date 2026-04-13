import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { api } from "../services/api";

export const HostProfile = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    bio: "",
    city: "",
    avatarUrl: ""
  });

  useEffect(() => {
    const raw = localStorage.getItem("authUser");
    if (!raw) return;

    try {
      const auth = JSON.parse(raw) as { userId?: string };
      if (!auth.userId) return;

      api.get(`/user/public/${auth.userId}`).then((res) => {
        setForm({
          fullName: res.data.fullName || "",
          phone: res.data.phone || "",
          bio: res.data.bio || "",
          city: res.data.city || "",
          avatarUrl: res.data.avatarUrl || ""
        });
      }).catch(() => {
        // ignore initial load errors for empty profile
      });
    } catch {
      // ignore parse error
    }
  }, []);

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!form.fullName.trim()) {
      setError("Ingresa al menos el nombre público del anfitrion.");
      return;
    }

    try {
      await api.put("/user/owner/profile", form);
      setSuccess("Perfil público actualizado.");
      setTimeout(() => navigate("/host"), 700);
    } catch (err: any) {
      setError(err?.response?.data ?? "No se pudo actualizar el perfil.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-page">
        <section className="auth-page__card host-form-card">
          <span className="eyebrow">Perfil público</span>
          <h2>Información del publicador</h2>
          <p className="muted-text">Estos datos se mostrarán al huésped en la página de la propiedad.</p>

          <div className="form-stack">
            <label className="field-label">Nombre público</label>
            <input className="text-field" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />

            <label className="field-label">Ciudad</label>
            <input className="text-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />

            <label className="field-label">Telefono</label>
            <input className="text-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />

            <label className="field-label">Email público (opcional)</label>
            <p className="muted-text">Se mostrará tu email de registro en la tarjeta de anfitrión.</p>

            <label className="field-label">Avatar URL</label>
            <input className="text-field" value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} />

            <label className="field-label">Bio</label>
            <textarea className="text-field text-area" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <div className="modal-actions">
              <button className="button button--ghost button--full" onClick={() => navigate("/host")}>Cancelar</button>
              <button className="button button--primary button--full" onClick={handleSave}>Guardar perfil</button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};
