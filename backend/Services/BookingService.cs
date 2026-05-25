using MongoDB.Driver;
using backend.Models;
using backend.Config;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    public class BookingService
    {
        private readonly IMongoCollection<Booking> _bookings;
        private readonly IMongoCollection<Property> _properties;

        public BookingService(IOptions<DatabaseSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.ConnectionString);
            var database = mongoClient.GetDatabase(settings.Value.DatabaseName);

            _bookings = database.GetCollection<Booking>("Bookings");
            _properties = database.GetCollection<Property>("Properties");
        }

        public async Task<List<Booking>> GetAsync() =>
            await _bookings.Find(_ => true).ToListAsync();

        public async Task<(bool Success, string Message, Booking? Booking)> CreateAsync(Booking booking)
        {
            // 🔥 VALIDACIÓN FECHAS
            if (booking.FechaInicio < DateTime.UtcNow.Date)
                return (false, "No puedes reservar fechas pasadas", null);

            if (booking.FechaFin <= booking.FechaInicio)
                return (false, "La fecha final debe ser mayor", null);

            // 🔥 VALIDAR DISPONIBILIDAD
            var existe = await _bookings.Find(b =>
                b.PropertyId == booking.PropertyId &&
                b.Estado != "Cancelada" &&
                (
                    booking.FechaInicio < b.FechaFin &&
                    booking.FechaFin > b.FechaInicio
                )
            ).AnyAsync();

            if (existe)
                return (false, "La propiedad ya esta reservada en esas fechas", null);

            // 🔥 OBTENER PRECIO
            var property = await _properties
                .Find(p => p.Id == booking.PropertyId)
                .FirstOrDefaultAsync();

            if (property == null)
                return (false, "Propiedad no encontrada", null);

            // 🔥 CALCULAR NOCHES
            booking.Noches = (booking.FechaFin - booking.FechaInicio).Days;

            // 🔥 CALCULAR PRECIO
            booking.PrecioTotal = booking.Noches * property.PrecioPorNoche;

            booking.Estado = "Confirmada";

            await _bookings.InsertOneAsync(booking);

            return (true, "Reserva creada correctamente", booking);
        }
    }
}