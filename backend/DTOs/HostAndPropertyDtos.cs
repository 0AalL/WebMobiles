namespace backend.DTOs;

public class HostProfileUpdateRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
}

public class OwnerCreatePropertyRequest
{
    public string Titulo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public string Ubicacion { get; set; } = string.Empty;
    public decimal PrecioPorNoche { get; set; }
    public string Moneda { get; set; } = "USD";
    public List<string> Imagenes { get; set; } = new();
    public List<string> Caracteristicas { get; set; } = new();
}
