using BetterBookmarks.Functions.UnitTests.Builders;
using BetterBookmarks.Models;
using BetterBookmarks.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace BetterBookmarks.Functions.UnitTests.FunctionImpls
{
    public class StoreAuthStateImplTests
    {
        private readonly Mock<IAuthStatesRepository> _mockAuthStatesRepository;
        private readonly Mock<ILogger> _mockLogger;

        private readonly AuthState _fakeAuthState;
        private readonly StoreAuthStateImpl _storeAuthStateImpl;
        private readonly MockHttpRequestBuilder _httpRequestBuilder;

        public StoreAuthStateImplTests()
        {
            _fakeAuthState = new AuthState()
            {
                StateKey = "FakeStateKey",
                AuthCodeVerifier = "FakeAuthCodeVerifier",
                RedirectUrl = "FakeRedirectUrl",
                ClientId = "FakeClientId",
                Scopes = "FakeScopes"
            };

            _mockAuthStatesRepository = new Mock<IAuthStatesRepository>();
            _mockLogger = new Mock<ILogger>();

            _httpRequestBuilder = new MockHttpRequestBuilder();
            _storeAuthStateImpl = new StoreAuthStateImpl(_mockAuthStatesRepository.Object);
        }

        [Fact]
        public async Task SavesProvidedAuthState()
        {
            var isCalled = false;
            _mockAuthStatesRepository
                .Setup(o => o.SaveAuthStateAsync(It.IsAny<AuthState>()))
                .Callback<AuthState>((authState) =>
                {
                    Assert.Equal(authState.ClientId, _fakeAuthState.ClientId);
                    Assert.Equal(authState.RedirectUrl, _fakeAuthState.RedirectUrl);
                    Assert.Equal(authState.AuthCodeVerifier, _fakeAuthState.AuthCodeVerifier);
                    Assert.Equal(authState.Scopes, _fakeAuthState.Scopes);
                    Assert.Equal(authState.StateKey, _fakeAuthState.StateKey);
                    isCalled = true;
                })
                .Returns(Task.CompletedTask);
                
            var req = 
                _httpRequestBuilder
                    .HavingBody(JsonConvert.SerializeObject(_fakeAuthState))
                    .Build();

            var resp = await _storeAuthStateImpl.Run(req, _mockLogger.Object);

            Assert.True(isCalled);
        }

        [Fact]
        public async Task RespondsWith204StatusWhenSuccessful()
        {
            var isCalled = false;
            _mockAuthStatesRepository
                .Setup(o => o.SaveAuthStateAsync(It.IsAny<AuthState>()))
                .Returns(Task.CompletedTask);

            var req =
                _httpRequestBuilder
                    .HavingBody(JsonConvert.SerializeObject(_fakeAuthState))
                    .Build();

            var resp = await _storeAuthStateImpl.Run(req, _mockLogger.Object);

            Assert.Equal(204, ((StatusCodeResult)resp).StatusCode);
        }
    }
}
