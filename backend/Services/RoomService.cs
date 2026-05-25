using MongoDB.Driver;
using backend.Models;
using backend.Config;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    public class RoomService
    {
        private readonly IMongoCollection<Room> _rooms;

        public RoomService(IOptions<DatabaseSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.ConnectionString);
            var database = mongoClient.GetDatabase(settings.Value.DatabaseName);

            _rooms = database.GetCollection<Room>("Rooms");
        }

        public async Task<List<Room>> GetAsync() =>
            await _rooms.Find(_ => true).ToListAsync();

        public async Task CreateAsync(Room room) =>
            await _rooms.InsertOneAsync(room);
    }
}