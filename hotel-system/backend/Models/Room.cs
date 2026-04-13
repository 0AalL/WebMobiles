using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Room
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        public string Numero { get; set; }

        [Required]
        [RegularExpression("Simple|Doble|Suite", ErrorMessage = "Tipo inválido")]
        public string Tipo { get; set; }

        [Range(0.01, 10000, ErrorMessage = "Precio inválido")]
        public decimal Precio { get; set; }

        [Required]
        [RegularExpression("Disponible|Ocupada|Mantenimiento", ErrorMessage = "Estado inválido")]
        public string Estado { get; set; }
    }
}