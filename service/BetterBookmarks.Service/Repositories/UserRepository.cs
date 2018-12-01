using System;
using System.Threading.Tasks;
using BetterBookmarks.Service.Models;
using Microsoft.Azure.Documents.Client;

namespace BetterBookmarks.Service.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IConfigurationAdapter _config;
        private Lazy<DocumentClient> _client;

        public UserRepository(IConfigurationAdapter config)
        {
            _config = config;

            _client = new Lazy<DocumentClient>(() => {
                return new DocumentClient(new Uri(_config.DatabaseConfig.Endpoint), _config.DatabaseConfig.AuthKey);
                // TODO: Create DB and Collection if not exists?
            });
        }

        private DocumentClient Client
        {
            get
            {
                return _client.Value;
            }
        }

        public Task<User> GetUserAsync(string userId)
        {
            throw new System.NotImplementedException();
        }

        public Task SaveUserAsync(User user)
        {
            throw new System.NotImplementedException();
        }
    }
}