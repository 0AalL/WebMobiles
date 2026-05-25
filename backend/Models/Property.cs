using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Property
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string Titulo { get; set; }

        [Required]
        public string Descripcion { get; set; }

        [Required]
        public string Ubicacion { get; set; }

        [Range(1, 10000)]
        public decimal PrecioPorNoche { get; set; }

        [Required]
        public string Moneda { get; set; } // USD, EUR, etc.

        public List<string> Imagenes { get; set; } = new();

        public List<string> Caracteristicas { get; set; } = new(); // wifi, piscina, etc.

        public string? Estado { get; set; } // Pendiente, Aprobado, Rechazado

        [Required]
        public string OwnerId { get; set; } // usuario que publica
    }
}