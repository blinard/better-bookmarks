using System;
using System.Net;
using System.Threading.Tasks;
using BetterBookmarks.Models;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using User = BetterBookmarks.Models.User;

namespace BetterBookmarks.Repositories
{
    public class AuthStatesRepository : IAuthStatesRepository
    {
        private readonly Lazy<IDocumentClient> _client;
        private readonly IApplicationSettingRepository _appSettings;

        public AuthStatesRepository(Lazy<IDocumentClient> client, IApplicationSettingRepository appSettings)
        {
            _client = client;
            _appSettings = appSettings;
        }

        private IDocumentClient Client
        {
            get
            {
                return _client.Value;
            }
        }

        public async Task<AuthState> GetAuthStateAsync(string stateKey)
        {
            var authStateUri = UriFactory.CreateDocumentUri(_appSettings.DatabaseName, _appSettings.AuthStatesCollectionName, stateKey);
            try
            {
                return await Client.ReadDocumentAsync<AuthState>(authStateUri, new RequestOptions() { PartitionKey = new PartitionKey("authState") });
            }
            catch(DocumentClientException dce)
            {
                if (dce.StatusCode == HttpStatusCode.NotFound)
                    return null;

                throw;                
            }
        }

        public async Task SaveAuthStateAsync(AuthState authState)
        {
            var docCollectionUri = UriFactory.CreateDocumentCollectionUri(_appSettings.DatabaseName, _appSettings.AuthStatesCollectionName);
            await Client.UpsertDocumentAsync(docCollectionUri, authState);
        }
    }
}