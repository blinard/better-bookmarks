using BetterBookmarks.Functions.UnitTests.Builders;
using BetterBookmarks.Models;
using BetterBookmarks.Repositories;
using Microsoft.Extensions.Logging;
using Moq;
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

            var resp = await _storeAuthStateImpl.Run(null, _mockLogger.Object);
        }

        [Fact]
        public async Task RespondsWith204StatusWhenSuccessful()
        {
            var resp = await _storeAuthStateImpl.Run(null, _mockLogger.Object);
        }
    }
}
