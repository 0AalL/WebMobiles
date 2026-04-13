using MongoDB.Driver;
using backend.Models;
using backend.Config;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    public class PropertyService
    {
        private readonly IMongoCollection<Property> _properties;

        public PropertyService(IOptions<DatabaseSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.ConnectionString);
            var database = mongoClient.GetDatabase(settings.Value.DatabaseName);

            _properties = database.GetCollection<Property>("Properties");
        }

        public async Task<List<Property>> GetAsync() =>
            await _properties.Find(_ => true).ToListAsync();

        public async Task<List<Property>> GetPublishedAsync() =>
            await _properties.Find(p => p.Estado == "Publicado" || p.Estado == null || p.Estado == string.Empty).ToListAsync();

        public async Task<List<Property>> GetByOwnerAsync(string ownerId) =>
            await _properties.Find(p => p.OwnerId == ownerId).ToListAsync();

        public async Task<Property?> GetByIdAsync(string id) =>
            await _properties.Find(p => p.Id == id).FirstOrDefaultAsync();

        public async Task CreateAsync(Property property) =>
            await _properties.InsertOneAsync(property);
    }
}