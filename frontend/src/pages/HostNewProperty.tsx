import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { api } from "../services/api";

export const HostNewProperty = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    ubicacion: "",
    precioPorNoche: 100,
    moneda: "USD",
    caracteristicasRaw: "wifi, desayuno",
    imagenes: [] as string[]
  });

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    Promise.all(files.map((file) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })
    )).then((images) => {
      setForm((prev) => ({ ...prev, imagenes: [...prev.imagenes, ...images] }));
    }).catch(() => setError("No se pudieron cargar algunas imagenes."));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!form.titulo.trim() || !form.descripcion.trim() || !form.ubicacion.trim() || form.precioPorNoche <= 0) {
      setError("Completa titulo, descripcion, ubicacion y precio por noche.");
      return;
    }

    setLoading(true);
    try {
      const caracteristicas = form.caracteristicasRaw
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      await api.post("/property/owner", {
        titulo: form.titulo,
        descripcion: form.descripcion,
        ubicacion: form.ubicacion,
        precioPorNoche: form.precioPorNoche,
        moneda: form.moneda,
        caracteristicas,
        imagenes: form.imagenes
      });

      setSuccess("Propiedad publicada correctamente.");
      setTimeout(() => navigate("/host"), 800);
    } catch (err: any) {
      setError(err?.response?.data ?? "No se pudo publicar la propiedad.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="auth-page">
        <section className="auth-page__card host-form-card">
          <span className="eyebrow">Nueva publicación</span>
          <h2>Publica tu propiedad</h2>
          <p className="muted-text">Sube toda la información para que aparezca en las búsquedas de huéspedes.</p>

          <div className="form-stack">
            <label className="field-label">Titulo</label>
            <input className="text-field" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />

            <label className="field-label">Descripcion</label>
            <textarea className="text-field text-area" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />

            <label className="field-label">Ubicacion</label>
            <input className="text-field" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} />

            <div className="checkout-grid">
              <div>
                <label className="field-label">Precio por noche</label>
                <input type="number" className="text-field" value={form.precioPorNoche} onChange={(e) => setForm({ ...form, precioPorNoche: Number(e.target.value) })} />
              </div>
              <div>
                <label className="field-label">Moneda</label>
                <select className="text-field" value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value })}>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>COP</option>
                </select>
              </div>
            </div>

            <label className="field-label">Caracteristicas (separadas por coma)</label>
            <input className="text-field" value={form.caracteristicasRaw} onChange={(e) => setForm({ ...form, caracteristicasRaw: e.target.value })} />

            <label className="field-label">Imagenes</label>
            <input type="file" multiple accept="image/*" className="text-field" onChange={handleFiles} />
            <div className="host-image-grid">
              {form.imagenes.map((img, index) => (
                <img key={index} src={img} alt={`preview-${index}`} className="host-image-preview" />
              ))}
            </div>

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <div className="modal-actions">
              <button className="button button--ghost button--full" onClick={() => navigate("/host")}>Cancelar</button>
              <button className="button button--primary button--full" disabled={loading} onClick={handleSubmit}>
                {loading ? "Publicando..." : "Publicar ahora"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};
