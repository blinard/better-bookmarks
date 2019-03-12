using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using BetterBookmarks.Service.Adapters;
using BetterBookmarks.Service.Models.Configs;
using BetterBookmarks.Service.Repositories;
using BetterBookmarks.Service.UnitTests.Factories;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Moq;
using Xunit;
using User = BetterBookmarks.Service.Models.User;

namespace BetterBookmarks.Service.UnitTests.Repositories
{
    public class UserRepositoryTests
    {
        private readonly Mock<IConfigurationAdapter> _mockConfigurationAdapter;
        private readonly Mock<IDocumentClient> _mockDocumentClient;
        private readonly IUserRepository _userRepository;
        private readonly Service.Models.User _fakeUser;
        
        public UserRepositoryTests()
        {
            _fakeUser = new Service.Models.User() {Id = "FakeId", UserId = "FakeUserId"};
            
            _mockConfigurationAdapter = new Mock<IConfigurationAdapter>();
            _mockConfigurationAdapter.SetupGet(o => o.DatabaseConfig)
                .Returns(new DatabaseConfig() { AuthKey = "FakeAuthKey", CollectionName = "FakeCollectionName", DatabaseName = "FakeDatabaseName", Endpoint = "FakeEndpoint" });
            
            _mockDocumentClient = new Mock<IDocumentClient>();
            _userRepository = new UserRepository(_mockConfigurationAdapter.Object, new Lazy<IDocumentClient>(() => _mockDocumentClient.Object));
        }

        [Fact]
        public async Task GetUserAsyncUsesValuesFromDatabaseConfig()
        {
            var isCalled = false;
            _mockDocumentClient
                .Setup(o => o.ReadDocumentAsync<Service.Models.User>(It.IsAny<Uri>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
                .Callback<Uri, RequestOptions, CancellationToken>((uri, ro, ct) =>
                {
                    Assert.Contains("FakeDatabaseName", uri.ToString());
                    Assert.Contains("FakeCollectionName", uri.ToString());
                    isCalled = true;
                })
                .ReturnsAsync(() => new DocumentResponse<User>(_fakeUser));

            await _userRepository.GetUserAsync("FakeUserId");
            Assert.True(isCalled);
        }

        [Fact]
        public async Task GetUserAsyncUsesInputUserIdToQueryDocumentClient()
        {
            var isCalled = false;
            _mockDocumentClient
                .Setup(o => o.ReadDocumentAsync<Service.Models.User>(It.IsAny<Uri>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
                .Callback<Uri, RequestOptions, CancellationToken>((uri, ro, ct) =>
                {
                    Assert.Equal("[\"FakeUserId\"]", ro.PartitionKey.ToString());
                    isCalled = true;
                })
                .ReturnsAsync(() => new DocumentResponse<User>(_fakeUser));

            await _userRepository.GetUserAsync("FakeUserId");
            Assert.True(isCalled);
        }

        [Fact]
        public void GetUserAsyncReturnsNullIfUserNotFound()
        {
            //TODO: Fix
            // var dce = DocumentClientExceptionFactory.CreateDocumentClientException("Fake error", HttpStatusCode.NotFound);
            // _mockDocumentClient
            //     .Setup(o => o.ReadDocumentAsync<User>(It.IsAny<Uri>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
            //     .Throws(dce);
            
            // var result = await _userRepository.GetUserAsync("FakeUserId");
            // Assert.Null(result);
        }

        [Fact]
        public async Task GetUserAsyncReturnsUserIfFound()
        {
            _mockDocumentClient
                .Setup(o => o.ReadDocumentAsync<Service.Models.User>(It.IsAny<Uri>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(() => new DocumentResponse<User>(_fakeUser));

            var result = await _userRepository.GetUserAsync("FakeUserId");
            Assert.Same(_fakeUser, result);
        }

        [Fact]
        public void GetUserAsyncPropagatesExceptionsFromUnderlyingDocumentClient()
        {
            // TODO: Implement once I get the DocumentClientException creation working
        }

        [Fact]
        public async Task SaveUserAsyncUsesValuesFromDatabaseConfig()
        {
             var isCalled = false;
            _mockDocumentClient
                .Setup(o => o.UpsertDocumentAsync(It.IsAny<Uri>(), It.IsAny<object>(), It.IsAny<RequestOptions>(), It.IsAny<bool>(), It.IsAny<CancellationToken>()))
                .Callback<Uri, object, RequestOptions, bool, CancellationToken>((uri, user, ro, bln, ct) =>
                {
                    Assert.Contains("FakeDatabaseName", uri.ToString());
                    Assert.Contains("FakeCollectionName", uri.ToString());
                    isCalled = true;
                })
                .ReturnsAsync(new ResourceResponse<Document>());

            await _userRepository.SaveUserAsync(_fakeUser);
            Assert.True(isCalled);
       }

        [Fact]
        public async Task SaveUserAsyncUpsertsTheUser()
        {
             var isCalled = false;
            _mockDocumentClient
                .Setup(o => o.UpsertDocumentAsync(It.IsAny<Uri>(), It.IsAny<object>(), It.IsAny<RequestOptions>(), It.IsAny<bool>(), It.IsAny<CancellationToken>()))
                .Callback<Uri, object, RequestOptions, bool, CancellationToken>((uri, user, ro, bln, ct) =>
                {
                    Assert.Same(_fakeUser, user);
                    isCalled = true;
                })
                .ReturnsAsync(new ResourceResponse<Document>());

            await _userRepository.SaveUserAsync(_fakeUser);
            Assert.True(isCalled);
        }
    }
}