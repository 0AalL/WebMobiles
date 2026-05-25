import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useMemo, useState } from "react";
import { api } from "../services/api";
import caption from "../assets/caption.jpg";

type BookingResponse = {
  message: string;
  booking: {
    id?: string;
    userId: string;
    propertyId: string;
    fechaInicio: string;
    fechaFin: string;
    noches: number;
    precioTotal: number;
    estado: string;
  };
};

export const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const hasValidState = Boolean(state?.property && state?.startDate && state?.endDate && state?.form);
  const { property, startDate, endDate, guests = 1, rooms = 1, form } = state ?? {};
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });

  const formatCardNumber = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 12);
    return clean.replace(/(.{4})/g, "$1 ").trim();
  };

  const pricing = useMemo(() => {
    if (!hasValidState) {
      return { nights: 1, total: 0 };
    }

    const nights = Math.max(1, Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24)
    ));

    const base = property.precioPorNoche;
    const extraPerson = guests > 1 ? (guests - 1) * 10 : 0;
    const pricePerNight = base + extraPerson;
    const total = pricePerNight * rooms * nights;

    return { nights, total };
  }, [endDate, guests, property?.precioPorNoche, rooms, startDate, hasValidState]);

  if (!hasValidState) {
    return (
      <>
        <Navbar />
        <main className="page-section">
          <p className="error-text">No encontramos los datos para procesar el pago. Vuelve al paso anterior.</p>
        </main>
      </>
    );
  }

  const handleConfirm = async () => {
    setError("");

    if (!/^\d{12}$/.test(card.number.replace(/\s/g, ""))) {
      setError("El numero de tarjeta debe tener 12 digitos.");
      return;
    }

    if (!card.name.trim()) {
      setError("Ingresa el nombre del titular.");
      return;
    }

    if (!card.expiry) {
      setError("Ingresa la fecha de expiracion.");
      return;
    }

    const expiryDate = new Date(card.expiry + "T23:59:59");
    if (Number.isNaN(expiryDate.getTime()) || expiryDate < new Date()) {
      setError("La tarjeta parece expirada.");
      return;
    }

    if (!/^\d{3}$/.test(card.cvv)) {
      setError("El CVV debe tener 3 digitos.");
      return;
    }

    const authRaw = localStorage.getItem("authUser");
    let authUser: { userId?: string } | null = null;
    if (authRaw) {
      try {
        authUser = JSON.parse(authRaw);
      } catch {
        authUser = null;
      }
    }

    if (!authUser?.userId) {
      setError("Debes iniciar sesion para confirmar la reserva.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userId: authUser.userId,
        propertyId: property.id,
        fechaInicio: new Date(startDate).toISOString(),
        fechaFin: new Date(endDate).toISOString()
      };

      const response = await api.post<BookingResponse>("/booking", payload);

      navigate("/success", {
        state: {
          property,
          startDate,
          endDate,
          guests,
          rooms,
          total: pricing.total,
          form,
          booking: response.data.booking,
          bookingMessage: response.data.message
        }
      });
    } catch (err: any) {
      setError(err?.response?.data ?? "No se pudo completar la reserva. Intentalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="page-section checkout-page">
        <section className="checkout-card">
          <span className="eyebrow">Paso 3 de 3</span>
          <h2>Finaliza tu pago</h2>
          <p className="muted-text">Tu pago se procesa de forma segura y al confirmar guardamos la reserva en nuestra base de datos.</p>

          <div className="checkout-grid">
            <div className="checkout-grid__full">
              <label className="field-label" htmlFor="card-number">Numero de tarjeta</label>
              <input
                id="card-number"
                className="text-field"
                value={card.number}
                onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                placeholder="1234 5678 9012"
              />
            </div>

            <div className="checkout-grid__full">
              <label className="field-label" htmlFor="card-name">Titular</label>
              <input
                id="card-name"
                className="text-field"
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
                placeholder="Nombre como aparece en la tarjeta"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="card-expiry">Expiracion</label>
              <input
                id="card-expiry"
                type="date"
                className="text-field"
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: e.target.value })}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="card-cvv">CVV</label>
              <input
                id="card-cvv"
                className="text-field"
                value={card.cvv}
                onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })}
                placeholder="123"
              />
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button className="button button--ghost button--full" onClick={() => navigate(-1)}>
              Volver
            </button>
            <button className="button button--primary button--full" disabled={loading} onClick={handleConfirm}>
              {loading ? "Procesando..." : "Confirmar pago"}
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
          <div className="summary-total"><span>Total</span><strong>{pricing.total} {property.moneda}</strong></div>
        </aside>
      </main>
    </>
  );
};
