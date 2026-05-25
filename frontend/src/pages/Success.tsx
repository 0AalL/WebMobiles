import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import caption from "../assets/caption.jpg";

export const Success = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.property || !state?.booking) {
    return (
      <>
        <Navbar />
        <main className="page-section">
          <p className="error-text">No hay una confirmacion para mostrar.</p>
          <button className="button button--primary" onClick={() => navigate("/")}>Ir al inicio</button>
        </main>
      </>
    );
  }

  const { property, startDate, endDate, guests, rooms, total, form, booking, bookingMessage } = state;

  return (
    <>
      <Navbar />

      <main className="auth-page">
        <section className="auth-page__card success-card">
          <span className="eyebrow">Reserva confirmada</span>
          <h2>Tu reserva fue procesada correctamente</h2>
          <p>{bookingMessage ?? "Hemos guardado tu reserva exitosamente en nuestra base de datos."}</p>

          <img
            className="success-hero-image"
            src={property.imagenes?.[0] || caption}
            onError={(e) => { e.currentTarget.src = caption; }}
            alt={property.titulo}
          />

          <div className="success-grid">
            <div className="summary-row"><span>Codigo de reserva</span><strong>{booking.id ?? "Generando..."}</strong></div>
            <div className="summary-row"><span>Hotel</span><strong>{property.titulo}</strong></div>
            <div className="summary-row"><span>Ubicacion</span><strong>{property.ubicacion}</strong></div>
            <div className="summary-row"><span>Entrada</span><strong>{new Date(startDate).toLocaleDateString()}</strong></div>
            <div className="summary-row"><span>Salida</span><strong>{new Date(endDate).toLocaleDateString()}</strong></div>
            <div className="summary-row"><span>Personas</span><strong>{guests}</strong></div>
            <div className="summary-row"><span>Habitaciones</span><strong>{rooms}</strong></div>
            <div className="summary-row"><span>Estado</span><strong>{booking.estado}</strong></div>
            <div className="summary-row"><span>Huesped principal</span><strong>{form?.nombre} {form?.apellido}</strong></div>
            <div className="summary-row"><span>Correo de contacto</span><strong>{form?.email}</strong></div>
            <div className="summary-total"><span>Total pagado</span><strong>{total} {property.moneda}</strong></div>
          </div>

          <div className="modal-actions">
            <button className="button button--ghost button--full" onClick={() => navigate("/search")}>Seguir explorando</button>
            <button className="button button--primary button--full" onClick={() => navigate("/")}>Volver al inicio</button>
          </div>
        </section>
      </main>
    </>
  );
};
