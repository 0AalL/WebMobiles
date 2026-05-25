using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Models;
using backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertyController : ControllerBase
    {
        private readonly PropertyService _service;

        public PropertyController(PropertyService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<List<Property>> Get() =>
            await _service.GetPublishedAsync();

        [Authorize(Roles = "owner")]
        [HttpGet("owner/mine")]
        public async Task<IActionResult> GetMine()
        {
            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(ownerId))
                return Unauthorized("Sesion invalida.");

            var properties = await _service.GetByOwnerAsync(ownerId);
            return Ok(properties);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Property property)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            property.Estado = "Pendiente"; // 🔥 importante

            await _service.CreateAsync(property);
            return Ok(property);
        }

        [Authorize(Roles = "owner")]
        [HttpPost("owner")]
        public async Task<IActionResult> CreateAsOwner([FromBody] OwnerCreatePropertyRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Titulo)
                || string.IsNullOrWhiteSpace(request.Descripcion)
                || string.IsNullOrWhiteSpace(request.Ubicacion)
                || request.PrecioPorNoche <= 0)
            {
                return BadRequest("Completa la informacion obligatoria de la propiedad.");
            }

            var ownerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(ownerId))
                return Unauthorized("Sesion invalida.");

            var property = new Property
            {
                Titulo = request.Titulo.Trim(),
                Descripcion = request.Descripcion.Trim(),
                Ubicacion = request.Ubicacion.Trim(),
                PrecioPorNoche = request.PrecioPorNoche,
                Moneda = string.IsNullOrWhiteSpace(request.Moneda) ? "USD" : request.Moneda.Trim().ToUpperInvariant(),
                Imagenes = request.Imagenes ?? new List<string>(),
                Caracteristicas = request.Caracteristicas ?? new List<string>(),
                Estado = "Publicado",
                OwnerId = ownerId
            };

            await _service.CreateAsync(property);
            return Ok(property);
        }
    }
}