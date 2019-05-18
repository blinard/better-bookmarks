using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using BetterBookmarks.Repositories;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using User = BetterBookmarks.Models.User;

namespace BetterBookmarks.Functions.UnitTests.Repositories
{
    public class UserRepositoryTests
    {
        private const string FakeEndpoint = "FakeEndpoint";
        private const string FakeAuthKey = "FakeAuthKey";
        private const string FakeDatabaseName = "FakeDatabaseName";
        private const string FakeCollectionName = "FakeCollectionName";
        private const string FakeIssuer = "FakeIssuer";
        private const string FakeAudience = "FakeAudience";
        private const string FakeUserId = "FakeUserId";
        private const string FakeId = "FakeId";

        private readonly Mock<IApplicationSettingRepository> _mockAppSettings;
        private readonly Mock<IDocumentClient> _mockDocumentClient;
        private readonly IUserRepository _userRepository;
        private readonly User _fakeUser;
        
        public UserRepositoryTests()
        {
            _fakeUser = new User() {Id = FakeId, UserId = FakeUserId };
            
            _mockAppSettings = new Mock<IApplicationSettingRepository>();
            _mockAppSettings.SetupGet(o => o.DbEndpoint).Returns(FakeEndpoint);
            _mockAppSettings.SetupGet(o => o.DbAuthKey).Returns(FakeAuthKey);
            _mockAppSettings.SetupGet(o => o.DatabaseName).Returns(FakeDatabaseName);
            _mockAppSettings.SetupGet(o => o.CollectionName).Returns(FakeCollectionName);
            _mockAppSettings.SetupGet(o => o.AuthIssuer).Returns(FakeIssuer);
            _mockAppSettings.SetupGet(o => o.AuthAudience).Returns(FakeAudience);
            
            _mockDocumentClient = new Mock<IDocumentClient>();
            _userRepository = new UserRepository(new Lazy<IDocumentClient>(() => _mockDocumentClient.Object), _mockAppSettings.Object);
        }

        [Fact]
        public async Task GetUserAsyncUsesValuesFromDatabaseConfig()
        {
            var isCalled = false;
            _mockDocumentClient
                .Setup(o => o.ReadDocumentAsync<User>(It.IsAny<Uri>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
                .Callback<Uri, RequestOptions, CancellationToken>((uri, ro, ct) =>
                {
                    Assert.Contains(FakeDatabaseName, uri.ToString());
                    Assert.Contains(FakeCollectionName, uri.ToString());
                    isCalled = true;
                })
                .ReturnsAsync(() => new DocumentResponse<User>(_fakeUser));

            await _userRepository.GetUserAsync(FakeUserId);
            Assert.True(isCalled);
        }

        [Fact]
        public async Task GetUserAsyncUsesInputUserIdToQueryDocumentClient()
        {
            var isCalled = false;
            _mockDocumentClient
                .Setup(o => o.ReadDocumentAsync<User>(It.IsAny<Uri>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
                .Callback<Uri, RequestOptions, CancellationToken>((uri, ro, ct) =>
                {
                    Assert.Contains(FakeUserId, uri.ToString());
                    Assert.Equal($"[\"user\"]", ro.PartitionKey.ToString());
                    isCalled = true;
                })
                .ReturnsAsync(() => new DocumentResponse<User>(_fakeUser));

            await _userRepository.GetUserAsync(FakeUserId);
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
                .Setup(o => o.ReadDocumentAsync<User>(It.IsAny<Uri>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(() => new DocumentResponse<User>(_fakeUser));

            var result = await _userRepository.GetUserAsync(FakeUserId);
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
                    Assert.Contains(FakeDatabaseName, uri.ToString());
                    Assert.Contains(FakeCollectionName, uri.ToString());
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