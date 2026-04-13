import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { api } from "../services/api";
import type { Property } from "../types/property";

export const HostDashboard = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/property/owner/mine")
      .then((res) => setProperties(res.data))
      .catch((err) => setError(err?.response?.data ?? "No se pudo cargar el panel del publicador."));
  }, []);

  const stats = useMemo(() => {
    const total = properties.length;
    const published = properties.filter((p) => p.estado === "Publicado" || !p.estado).length;
    const avgPrice = total > 0
      ? Math.round(properties.reduce((acc, p) => acc + p.precioPorNoche, 0) / total)
      : 0;

    return { total, published, avgPrice };
  }, [properties]);

  return (
    <>
      <Navbar />
      <main className="page-section host-page">
        <section className="section-heading host-hero">
          <span className="eyebrow">Panel de publicador</span>
          <h2>Gestiona tus propiedades</h2>
          <p className="muted-text">Crea, organiza y revisa todo tu inventario desde un solo dashboard.</p>

          <div className="host-actions">
            <Link to="/host/new-property" className="button button--primary">Publicar propiedad</Link>
            <Link to="/host/profile" className="button button--ghost">Editar perfil público</Link>
          </div>
        </section>

        <section className="host-stats">
          <article className="host-stat-card"><span>Total propiedades</span><strong>{stats.total}</strong></article>
          <article className="host-stat-card"><span>Publicadas</span><strong>{stats.published}</strong></article>
          <article className="host-stat-card"><span>Precio promedio</span><strong>{stats.avgPrice}</strong></article>
        </section>

        {error && <p className="error-text">{error}</p>}

        <section className="host-list">
          {properties.length === 0 && <p className="muted-text">Aun no publicas propiedades. Empieza creando la primera.</p>}
          {properties.map((property) => (
            <article key={property.id} className="host-property-card">
              <div>
                <h3>{property.titulo}</h3>
                <p className="muted-text">{property.ubicacion}</p>
                <p className="muted-text">{property.descripcion}</p>
              </div>
              <div>
                <span className="tag-chip">{property.estado || "Publicado"}</span>
                <p className="host-price">{property.precioPorNoche} {property.moneda}</p>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
};
