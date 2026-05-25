using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly BookingService _service;
        private readonly UserService _users;
        private readonly PropertyService _properties;
        private readonly EmailService _emails;
        private readonly IWebHostEnvironment _environment;

        public BookingController(
            BookingService service,
            UserService users,
            PropertyService properties,
            EmailService emails,
            IWebHostEnvironment environment)
        {
            _service = service;
            _users = users;
            _properties = properties;
            _emails = emails;
            _environment = environment;
        }

        [HttpGet]
        public async Task<List<Booking>> Get() =>
            await _service.GetAsync();

        [HttpPost]
        public async Task<IActionResult> Create(Booking booking)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _service.CreateAsync(booking);

            if (!result.Success)
                return BadRequest(result.Message);

            string? emailWarning = null;
            if (result.Booking != null)
            {
                try
                {
                    var user = await _users.GetByIdAsync(result.Booking.UserId);
                    var property = await _properties.GetByIdAsync(result.Booking.PropertyId);

                    if (!string.IsNullOrWhiteSpace(user?.Email))
                    {
                        await _emails.SendBookingConfirmationEmailAsync(
                            user.Email,
                            result.Booking.Id ?? "N/A",
                            property?.Titulo ?? "Tu propiedad reservada",
                            property?.Ubicacion ?? "Ubicacion no disponible",
                            result.Booking.FechaInicio,
                            result.Booking.FechaFin,
                            result.Booking.Noches,
                            result.Booking.PrecioTotal,
                            property?.Moneda ?? "USD");
                    }
                }
                catch (Exception ex)
                {
                    if (_environment.IsDevelopment())
                    {
                        emailWarning = ex.Message;
                    }
                }
            }

            return Ok(new
            {
                message = result.Message,
                booking = result.Booking,
                emailWarning
            });
        }
    }
}