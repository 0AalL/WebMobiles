import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { PropertyCard } from "../components/PropertyCard";
import { Navbar } from "../components/Navbar";
import { SearchBar } from "../components/SearchBar";
import type { Property } from "../types/property";

export const Search = () => {
  const locationState = useLocation();

  const { location, startDate, endDate, guests, rooms } =
    locationState.state || {};

  const [properties, setProperties] = useState<Property[]>([]);

  const nights =
    startDate && endDate
      ? Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 1;

  useEffect(() => {
    api.get("/Property").then((res) => {
      const filtered = res.data.filter((p: Property) =>
        p.ubicacion.toLowerCase().includes(location?.toLowerCase() || "")
      );
      setProperties(filtered);
    });
  }, []);

  return (
    <>
      <Navbar />

      {/* 🔥 SEARCH BAR CON DATOS */}
      <div style={{ padding: "20px" }}>
        <SearchBar
          initialData={{ location, startDate, endDate, guests, rooms }}
        />
      </div>

      <div style={{ maxWidth: "1100px", margin: "auto" }}>
        {properties.map((p) => (
          <PropertyCard
            key={p.id}
            property={p}
            nights={nights}
            searchData={{ location, startDate, endDate, guests, rooms }}
          />
        ))}
      </div>
    </>
  );
};