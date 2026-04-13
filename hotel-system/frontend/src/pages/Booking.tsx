import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useMemo, useState } from "react";
import caption from "../assets/caption.jpg";

export const Booking = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const hasValidState = Boolean(state?.property && state?.startDate && state?.endDate);

  const { property, startDate, endDate, guests = 1, rooms = 1 } = state ?? {};
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    pais: "Ecuador"
  });

  const pricing = useMemo(() => {
    if (!hasValidState) {
      return { nights: 1, pricePerNight: 0, total: 0 };
    }

    const nights = Math.max(1, Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24)
    ));

    const base = property.precioPorNoche;
    const extraPerson = guests > 1 ? (guests - 1) * 10 : 0;
    const pricePerNight = base + extraPerson;
    const total = pricePerNight * rooms * nights;

    return { nights, pricePerNight, total };
  }, [endDate, guests, property?.precioPorNoche, rooms, startDate, hasValidState]);

  if (!hasValidState) {
    return (
      <>
        <Navbar />
        <main className="page-section">
          <p className="error-text">No encontramos los datos de la reserva. Vuelve a seleccionar disponibilidad.</p>
        </main>
      </>
    );
  }

  const handleNext = () => {
    setError("");

    if (!form.nombre.trim() || !form.apellido.trim() || !form.email.trim()) {
      setError("Completa nombre, apellido y correo para continuar.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Ingresa un correo valido.");
      return;
    }

    navigate("/payment", {
      state: {
        property,
        startDate,
        endDate,
        guests,
        rooms,
        total: pricing.total,
        form
      }
    });
  };

  return (
    <>
      <Navbar />

      <main className="page-section checkout-page">
        <section className="checkout-card">
          <span className="eyebrow">Paso 2 de 3</span>
          <h2>Completa tus datos</h2>
          <p className="muted-text">Usaremos esta informacion para enviarte la confirmacion de tu reserva.</p>

          <div className="checkout-grid">
            <div>
              <label className="field-label" htmlFor="nombre">Nombre</label>
              <input id="nombre" className="text-field" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
              <label className="field-label" htmlFor="apellido">Apellido</label>
              <input id="apellido" className="text-field" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            </div>
            <div className="checkout-grid__full">
              <label className="field-label" htmlFor="correo">Correo electronico</label>
              <input id="correo" className="text-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="field-label" htmlFor="pais">Pais</label>
              <select id="pais" className="text-field" value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })}>
                <option>Ecuador</option>
                <option>Colombia</option>
                <option>Peru</option>
                <option>Mexico</option>
                <option>Chile</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="telefono">Telefono</label>
              <input id="telefono" className="text-field" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button className="button button--ghost button--full" onClick={() => navigate(-1)}>
              Volver
            </button>
            <button className="button button--primary button--full" onClick={handleNext}>
              Continuar al pago
            </button>
          </div>
        </section>

        <aside className="summary-card">
          <img src={property.imagenes?.[0] || caption} onError={(e) => { e.currentTarget.src = caption; }} alt={property.titulo} />
          <h3>{property.titulo}</h3>
          <p className="muted-text">{property.ubicacion}</p>

          <div className="summary-row"><span>Entrada</span><strong>{new Date(startDate).toLocaleDateString()}</strong></div>
          <div className="summary-row"><span>Salida</span><strong>{new Date(endDate).toLocaleDateString()}</strong></div>
          <div className="summary-row"><span>Noches</span><strong>{pricing.nights}</strong></div>
          <div className="summary-row"><span>Huespedes</span><strong>{guests}</strong></div>
          <div className="summary-row"><span>Habitaciones</span><strong>{rooms}</strong></div>

          <hr className="divider" />

          <div className="summary-row"><span>Tarifa por noche</span><strong>{pricing.pricePerNight} {property.moneda}</strong></div>
          <div className="summary-total"><span>Total</span><strong>{pricing.total} {property.moneda}</strong></div>
        </aside>
      </main>
    </>
  );
};
