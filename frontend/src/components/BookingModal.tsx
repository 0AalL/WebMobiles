import { useState } from "react";
import DatePicker from "react-datepicker";
import { api } from "../services/api";
import type { Property } from "../types/property";

interface Props {
  property: Property;
  onClose: () => void;
}

export const BookingModal = ({ property, onClose }: Props) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      alert("Selecciona fechas");
      return;
    }

    try {
      await api.post("/Booking", {
        userId: "ID_USER_AQUI", // luego login
        propertyId: property.id,
        fechaInicio: startDate,
        fechaFin: endDate
      });

      alert("Reserva realizada 😏🔥");
      onClose();
    } catch (err: any) {
      alert(err.response?.data || "Error en reserva");
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        background: "#1a1a1a",
        padding: "20px",
        borderRadius: "12px",
        width: "320px"
      }}>
        <h3 style={{ color: "#ff2e2e" }}>Reservar</h3>

        <p>Fecha inicio</p>
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => setStartDate(date)}
          minDate={new Date()}
        />

        <p>Fecha fin</p>
        <DatePicker
          selected={endDate}
          onChange={(date: Date | null) => setEndDate(date)}
          minDate={startDate || new Date()}
        />

        <button onClick={handleBooking} style={{
          marginTop: "15px",
          width: "100%",
          background: "#ff2e2e",
          color: "white",
          padding: "10px",
          border: "none",
          borderRadius: "8px"
        }}>
          Confirmar
        </button>

        <button onClick={onClose} style={{
          marginTop: "10px",
          width: "100%",
          background: "#333",
          color: "white",
          padding: "10px",
          border: "none",
          borderRadius: "8px"
        }}>
          Cancelar
        </button>
      </div>
    </div>
  );
};