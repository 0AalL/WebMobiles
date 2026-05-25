using MongoDB.Driver;
using backend.Models;
using backend.Config;
using Microsoft.Extensions.Options;

namespace backend.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _users;

        public UserService(IOptions<DatabaseSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.ConnectionString);
            var database = mongoClient.GetDatabase(settings.Value.DatabaseName);

            _users = database.GetCollection<User>("Users");
        }

        public async Task<List<User>> GetAsync() =>
            await _users.Find(_ => true).ToListAsync();

        public async Task CreateAsync(User user) =>
            await _users.InsertOneAsync(user);

        public async Task<User?> GetByEmailAsync(string email) =>
            await _users.Find(u => u.Email == email).FirstOrDefaultAsync();

        public async Task<User?> GetByIdAsync(string id) =>
            await _users.Find(u => u.Id == id).FirstOrDefaultAsync();

        public async Task<User?> GetPublicHostByIdAsync(string id) =>
            await _users.Find(u => u.Id == id && u.Role == "owner").FirstOrDefaultAsync();

        public async Task<User?> GetByVerificationTokenAsync(string token) =>
            await _users.Find(u => u.VerificationToken == token).FirstOrDefaultAsync();

        public async Task<User?> GetByResetTokenAsync(string token) =>
            await _users.Find(u => u.ResetToken == token).FirstOrDefaultAsync();

        public async Task UpdateAsync(User user) =>
            await _users.ReplaceOneAsync(u => u.Id == user.Id, user);
    }
}