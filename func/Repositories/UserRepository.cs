using System;
using System.Net;
using System.Threading.Tasks;
using BetterBookmarks.Service.Models;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using User = BetterBookmarks.Models.User;

namespace BetterBookmarks.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly Lazy<IDocumentClient> _client;

        public UserRepository(Lazy<IDocumentClient> client)
        {
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
                return await Client.ReadDocumentAsync<User>(userUri, new RequestOptions() { PartitionKey = new PartitionKey("user") });
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