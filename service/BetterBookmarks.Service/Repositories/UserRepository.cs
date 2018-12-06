using System;
using System.Net;
using System.Threading.Tasks;
using BetterBookmarks.Service.Models;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using User = BetterBookmarks.Service.Models.User;

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

        public async Task<User> GetUserAsync(string userId)
        {
            var userUri = UriFactory.CreateDocumentUri(_config.DatabaseConfig.DatabaseName, _config.DatabaseConfig.CollectionName, userId);
            try
            {
                return await Client.ReadDocumentAsync<User>(userUri);
            }
            catch(DocumentClientException dce)
            {
                if (dce.StatusCode == HttpStatusCode.NotFound)
                    return null;

                throw;                
            }
        }

        public async Task SaveUserAsync(User user)
        {
            var userUri = UriFactory.CreateDocumentUri(_config.DatabaseConfig.DatabaseName, _config.DatabaseConfig.CollectionName, user.Id);
            await Client.ReplaceDocumentAsync(userUri, user);
        }
    }
}