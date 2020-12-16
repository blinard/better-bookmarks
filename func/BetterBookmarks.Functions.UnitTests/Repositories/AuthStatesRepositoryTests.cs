using BetterBookmarks.Models;
using BetterBookmarks.Repositories;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Moq;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace BetterBookmarks.Functions.UnitTests.Repositories
{
    public class AuthStatesRepositoryTests
    {
        private const string FakeEndpoint = "FakeEndpoint";
        private const string FakeAuthKey = "FakeAuthKey";
        private const string FakeDatabaseName = "FakeDatabaseName";
        private const string FakeCollectionName = "FakeCollectionName";
        private const string FakeAuthStatesCollectionName = "FakeAuthStatesCollectionName";
        private const string FakeIssuer = "FakeIssuer";
        private const string FakeAudience = "FakeAudience";

        private const string FakeStateKey = "FakeStateKey";

        private readonly Mock<IApplicationSettingRepository> _mockAppSettings;
        private readonly Mock<IDocumentClient> _mockDocumentClient;
        private readonly IAuthStatesRepository _authStatesRepository;
        private readonly AuthState _fakeAuthState;


        public AuthStatesRepositoryTests()
        {
            _fakeAuthState = new AuthState()
            {
                StateKey = FakeStateKey,
                AuthCodeVerifier = "FakeAuthCodeVerifier",
                RedirectUrl = "FakeRedirectUrl",
                ClientId = "FakeClientId",
                Scopes = "FakeScopes"
            };

            _mockAppSettings = new Mock<IApplicationSettingRepository>();
            _mockAppSettings.SetupGet(o => o.DbEndpoint).Returns(FakeEndpoint);
            _mockAppSettings.SetupGet(o => o.DbAuthKey).Returns(FakeAuthKey);
            _mockAppSettings.SetupGet(o => o.DatabaseName).Returns(FakeDatabaseName);
            _mockAppSettings.SetupGet(o => o.AuthStatesCollectionName).Returns(FakeAuthStatesCollectionName);

            _mockAppSettings.SetupGet(o => o.AuthIssuer).Returns(FakeIssuer);
            _mockAppSettings.SetupGet(o => o.AuthAudience).Returns(FakeAudience);

            _mockDocumentClient = new Mock<IDocumentClient>();
            _authStatesRepository = new AuthStatesRepository(new Lazy<IDocumentClient>(() => _mockDocumentClient.Object), _mockAppSettings.Object);
        }

        [Fact]
        public async Task GetAuthStateAsyncUsesValuesFromDatabaseConfig()
        {
            var isCalled = false;
            _mockDocumentClient
                .Setup(o => o.ReadDocumentAsync<AuthState>(It.IsAny<Uri>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
                .Callback<Uri, RequestOptions, CancellationToken>((uri, ro, ct) =>
                {
                    Assert.Contains(FakeDatabaseName, uri.ToString());
                    Assert.Contains(FakeAuthStatesCollectionName, uri.ToString());
                    isCalled = true;
                })
                .ReturnsAsync(() => new DocumentResponse<AuthState>(_fakeAuthState));

            await _authStatesRepository.GetAuthStateAsync(FakeStateKey);
            Assert.True(isCalled);
        }

        [Fact]
        public async Task GetAuthStateAsyncUsesInputStateKeyToQueryDocumentClient()
        {
            var isCalled = false;
            _mockDocumentClient
                .Setup(o => o.ReadDocumentAsync<AuthState>(It.IsAny<Uri>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
                .Callback<Uri, RequestOptions, CancellationToken>((uri, ro, ct) =>
                {
                    Assert.Contains(FakeStateKey, uri.ToString());
                    isCalled = true;
                })
                .ReturnsAsync(() => new DocumentResponse<AuthState>(_fakeAuthState));

            await _authStatesRepository.GetAuthStateAsync(FakeStateKey);
            Assert.True(isCalled);
        }

        [Fact]
        public void GetAuthStateAsyncReturnsNullIfAuthStateNotFound()
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
        public async Task GetAuthStateAsyncReturnsAuthStateIfFound()
        {
            _mockDocumentClient
                .Setup(o => o.ReadDocumentAsync<AuthState>(It.IsAny<Uri>(), It.IsAny<RequestOptions>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(() => new DocumentResponse<AuthState>(_fakeAuthState));

            var result = await _authStatesRepository.GetAuthStateAsync(FakeStateKey);
            Assert.Same(_fakeAuthState, result);
        }

        [Fact]
        public void GetAuthStateAsyncPropagatesExceptionsFromUnderlyingDocumentClient()
        {
            // TODO: Implement once I get the DocumentClientException creation working
        }

        [Fact]
        public async Task SaveAuthStateAsyncUsesValuesFromDatabaseConfig()
        {
            var isCalled = false;
            _mockDocumentClient
                .Setup(o => o.UpsertDocumentAsync(It.IsAny<Uri>(), It.IsAny<object>(), It.IsAny<RequestOptions>(), It.IsAny<bool>(), It.IsAny<CancellationToken>()))
                .Callback<Uri, object, RequestOptions, bool, CancellationToken>((uri, authState, ro, bln, ct) =>
                {
                    Assert.Contains(FakeDatabaseName, uri.ToString());
                    Assert.Contains(FakeAuthStatesCollectionName, uri.ToString());
                    isCalled = true;
                })
                .ReturnsAsync(new ResourceResponse<Document>());

            await _authStatesRepository.SaveAuthStateAsync(_fakeAuthState);
            Assert.True(isCalled);
        }

        [Fact]
        public async Task SaveAuthStateAsyncUpsertsTheAuthState()
        {
            var isCalled = false;
            _mockDocumentClient
                .Setup(o => o.UpsertDocumentAsync(It.IsAny<Uri>(), It.IsAny<object>(), It.IsAny<RequestOptions>(), It.IsAny<bool>(), It.IsAny<CancellationToken>()))
                .Callback<Uri, object, RequestOptions, bool, CancellationToken>((uri, authState, ro, bln, ct) =>
                {
                    Assert.Same(_fakeAuthState, authState);
                    isCalled = true;
                })
                .ReturnsAsync(new ResourceResponse<Document>());

            await _authStatesRepository.SaveAuthStateAsync(_fakeAuthState);
            Assert.True(isCalled);
        }

    }
}
