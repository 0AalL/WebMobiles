using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        public string Role { get; set; } = "user";

        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;

        public bool IsVerified { get; set; } = false;
        public string? VerificationToken { get; set; }
        public string? ResetToken { get; set; }
        public DateTime? ResetTokenExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}