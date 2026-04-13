import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import type { Property } from "../types/property";
import { PropertyCard } from "../components/PropertyCard";
import { Navbar } from "../components/Navbar";
import { SearchBar } from "../components/SearchBar";

export const Home = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("authUser");
    if (!raw) {
      setIsOwner(false);
      return;
    }

    try {
      const authUser = JSON.parse(raw) as { role?: string };
      setIsOwner(authUser.role === "owner");
    } catch {
      setIsOwner(false);
    }
  }, []);

  useEffect(() => {
    api.get("/Property")
      .then(res => setProperties(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <Navbar />

      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Estadias premium</span>
          <h1>{isOwner ? "Bienvenido, publicador." : "Elegancia, calma y reservas sin friccion."}</h1>
          <p>
            {isOwner
              ? "Desde aqui puedes revisar propiedades recomendadas y gestionar tus publicaciones desde el panel de anfitrion."
              : "Un frontend limpio, moderno y agradable para que buscar alojamiento se sienta premium desde el primer clic."}
          </p>

          {isOwner && (
            <div className="host-actions">
              <Link to="/host" className="button button--primary">Ir a mi panel</Link>
            </div>
          )}
        </div>

        {!isOwner && (
          <div className="hero-search">
            <SearchBar />
          </div>
        )}
      </section>

      <main className="page-section">
        <div className="section-heading">
          <span className="eyebrow">Selección</span>
          <h2>Alojamientos recomendados</h2>
        </div>

        {properties.length === 0 && (
          <p className="muted-text">
            No hay propiedades disponibles
          </p>
        )}

        {properties.map(p => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </main>
    </>
  );
};