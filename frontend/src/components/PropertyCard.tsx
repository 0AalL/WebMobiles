import { useNavigate } from "react-router-dom";
import type { Property } from "../types/property";
import caption from "../assets/caption.jpg";

interface Props {
    property: Property;
    nights?: number;
    searchData?: any;
}

export const PropertyCard = ({ property, nights, searchData }: Props) => {
    const navigate = useNavigate();

    const total = nights
        ? property.precioPorNoche * nights
        : null;

    return (
        <article className="property-card">
            <img
                src={caption}
                alt={property.titulo}
                className="property-card__image"
            />

            <div className="property-card__content">
                <h2>
                    {property.titulo}
                </h2>

                <p className="property-card__location">
                    {property.ubicacion}
                </p>

                <div className="tag-row">
                    {property.caracteristicas.map((c, i) => (
                        <span key={i} className="tag-chip">
                            {c}
                        </span>
                    ))}
                </div>

                <p className="property-card__description">
                    {property.descripcion}
                </p>
            </div>

            <div className="property-card__price">
                <h2>
                    {property.precioPorNoche} {property.moneda}
                </h2>

                <span>
                    por noche
                </span>

                {total && (
                    <p className="property-card__total">
                        Total: {total} {property.moneda}
                    </p>
                )}

                <button
                    className="button button--primary button--full"
                    onClick={() =>
                        navigate(`/property/${property.id}`, {
                            state: searchData
                        })
                    }
                >
                    Ver disponibilidad
                </button>
            </div>
        </article>
    );
};