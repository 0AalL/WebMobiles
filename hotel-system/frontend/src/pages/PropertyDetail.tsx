import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { Navbar } from "../components/Navbar";
import type { Property } from "../types/property";
import type { HostPublicProfile } from "../types/host";
import caption from "../assets/caption.jpg";
import room from "../assets/room.jpg";
import pool from "../assets/pool.jpg";

export const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const locationState = useLocation();

  const { startDate, endDate, guests, rooms } = locationState.state || {};
  const [property, setProperty] = useState<Property | null>(null);
  const [hostProfile, setHostProfile] = useState<HostPublicProfile | null>(null);

  useEffect(() => {
    api.get("/Property")
      .then((res) => {
        const found = res.data.find((p: Property) => p.id === id);
        setProperty(found ?? null);

        if (found?.ownerId) {
          api.get(`/user/public/${found.ownerId}`)
            .then((ownerRes) => setHostProfile(ownerRes.data))
            .catch(() => setHostProfile(null));
        }
      })
      .catch(() => setProperty(null));
  }, [id]);

  const gallery = useMemo(() => {
    if (!property) return [caption, room, pool];
    return [caption, room, pool];
  }, [property]);

  if (!property) {
    return (
      <>
        <Navbar />
        <main className="page-section">
          <p className="muted-text">Cargando propiedad...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="page-section detail-page">
        <section className="section-heading">
          <span className="eyebrow">Detalle del hotel</span>
          <h2>{property.titulo}</h2>
          <p className="muted-text">{property.ubicacion}</p>
        </section>

        <section className="detail-gallery">
          <img src={gallery[0]} onError={(e) => { e.currentTarget.src = caption; }} alt={property.titulo} className="detail-gallery__main" />
          <img src={gallery[1]} onError={(e) => { e.currentTarget.src = caption; }} alt={`${property.titulo} vista 2`} className="detail-gallery__side" />
          <img src={gallery[2]} onError={(e) => { e.currentTarget.src = caption; }} alt={`${property.titulo} vista 3`} className="detail-gallery__side" />
        </section>

        <section className="detail-layout">
          <article className="detail-content">
            <h3>Descripcion</h3>
            <p>{property.descripcion}</p>

            <h3>Servicios destacados</h3>
            <div className="tag-row">
              {property.caracteristicas.map((c, i) => (
                <span key={i} className="tag-chip">{c}</span>
              ))}
            </div>

            {hostProfile && (
              <section className="host-public-card">
                <h3>Anfitrion</h3>
                <div className="host-public-header">
                  {hostProfile.avatarUrl && (
                    <img src={hostProfile.avatarUrl} alt={hostProfile.fullName} />
                  )}
                  <div>
                    <strong>{hostProfile.fullName || "Anfitrion verificado"}</strong>
                    <p className="muted-text">{hostProfile.city}</p>
                  </div>
                </div>
                {hostProfile.bio && <p className="muted-text">{hostProfile.bio}</p>}
                <p className="muted-text">Contacto: {hostProfile.email}</p>
                {hostProfile.phone && <p className="muted-text">Telefono: {hostProfile.phone}</p>}
              </section>
            )}
          </article>

          <aside className="detail-booking-card">
            <h3>{property.precioPorNoche} {property.moneda}</h3>
            <span>por noche</span>

            {startDate && endDate && (
              <p>
                {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
              </p>
            )}

            {guests && rooms && <p>{guests} personas - {rooms} habitaciones</p>}

            <p className="muted-text">Cancelacion gratis en las primeras 24 horas.</p>

            <button
              className="button button--primary button--full"
              onClick={() =>
                navigate("/booking", {
                  state: {
                    property,
                    startDate,
                    endDate,
                    guests,
                    rooms
                  }
                })
              }
            >
              Reservar ahora
            </button>
          </aside>
        </section>
      </main>
    </>
  );
};
