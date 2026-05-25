import { useState } from "react";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";

export const SearchBar = ({ initialData }: any) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [location, setLocation] = useState(initialData?.location || "");
  const [startDate, setStartDate] = useState(initialData?.startDate || null);
  const [endDate, setEndDate] = useState(initialData?.endDate || null);
  const [guests, setGuests] = useState(initialData?.guests || 1);
  const [rooms, setRooms] = useState(initialData?.rooms || 1);

  const handleSearch = () => {
    setError("");

    if (!location || !startDate || !endDate) {
      setError("Completa destino, fecha de entrada y salida para buscar.");
      return;
    }

    navigate("/search", {
      state: { location, startDate, endDate, guests, rooms }
    });
  };

  return (
    <div className="search-bar">
      <div className="search-field search-field--wide">
        <label>Destino</label>
        <input
          className="text-field"
          placeholder="¿A dónde vas?"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="search-field">
        <label>Entrada</label>
        <DatePicker
          className="text-field date-field"
          selected={startDate}
          onChange={(date: Date | null) => {
            setStartDate(date);
            setEndDate(null);
          }}
          minDate={new Date()}
          placeholderText="Fecha"
        />

      </div>

      <div className="search-field">
        <label>Salida</label>
        <DatePicker
          className="text-field date-field"
          selected={endDate}
          onChange={(date: Date | null) => setEndDate(date)}
          minDate={
            startDate
              ? new Date(startDate.getTime() + 86400000)
              : new Date()
          }
          placeholderText="Fecha"
        />

      </div>

      <div className="search-field search-field--small">
        <label>Personas</label>
        <input
          type="number"
          min={1}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="text-field"
        />
      </div>

      <div className="search-field search-field--small">
        <label>Habitaciones</label>
        <input
          type="number"
          min={1}
          value={rooms}
          onChange={(e) => setRooms(Number(e.target.value))}
          className="text-field"
        />
      </div>

      <button className="button button--primary search-button" onClick={handleSearch}>
        Buscar
      </button>

      {error && <p className="error-text search-error">{error}</p>}
    </div>
  );
};