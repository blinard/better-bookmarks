using System;
using System.Net;
using System.Threading.Tasks;
using BetterBookmarks.Service.Models;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using BetterBookmarks.Service.Adapters;
using User = BetterBookmarks.Service.Models.User;

namespace BetterBookmarks.Service.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IConfigurationAdapter _config;
        private readonly Lazy<IDocumentClient> _client;

        public UserRepository(IConfigurationAdapter config, Lazy<IDocumentClient> client)
        {
            _config = config;
            _client = client;
        }

        private IDocumentClient Client
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
                return await Client.ReadDocumentAsync<User>(userUri, new RequestOptions() { PartitionKey = new PartitionKey(userId) });
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
            var docCollectionUri = UriFactory.CreateDocumentCollectionUri(_config.DatabaseConfig.DatabaseName, _config.DatabaseConfig.CollectionName);
            await Client.UpsertDocumentAsync(docCollectionUri, user);
        }
    }
}