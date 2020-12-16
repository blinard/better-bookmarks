using System.Net.Http;
using System.Threading.Tasks;
using BetterBookmarks.Functions.UnitTests.Builders;
using BetterBookmarks.Models;
using BetterBookmarks.Repositories;
using BetterBookmarks.Wrappers;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace BetterBookmarks.Functions.UnitTests.FunctionImpls
{
    public class CompleteInteractiveAuthImplTests
    {
        private readonly Mock<IAuthStatesRepository> _mockAuthStatesRepository;
        private readonly Mock<IHttpClientWrapper> _mockHttpClient;
        private readonly Mock<ILogger> _mockLogger;
        private readonly AuthState _fakeAuthState;

        private readonly CompleteInteractiveAuthImpl _completeInteractiveAuthImpl;

        public CompleteInteractiveAuthImplTests()
        {
            _fakeAuthState = new AuthState()
            {
                StateKey = "12345",
                ClientId = "111111",
                AuthCodeVerifier = "222222", 
                RedirectUrl = "333333",
                Scopes = "444444"
            };

            _mockAuthStatesRepository = new Mock<IAuthStatesRepository>();
            _mockHttpClient = new Mock<IHttpClientWrapper>();
            _mockLogger = new Mock<ILogger>();

            _completeInteractiveAuthImpl = new CompleteInteractiveAuthImpl(_mockAuthStatesRepository.Object, _mockHttpClient.Object);
        }

        [Fact]
        public async Task RequestsTokenWithExpectedParameters()
        {
            var fakeCode = "54321";
            var testRequest = new MockHttpRequestBuilder()
                .WithQueryParam("state", "12345")
                .WithQueryParam("code", fakeCode)
                .Build();

            _mockAuthStatesRepository
                .Setup(o => o.GetAuthStateAsync(It.IsAny<string>()))
                .ReturnsAsync(_fakeAuthState);

            var wasCalled = false;
            _mockHttpClient
                .Setup(o => o.SendAsync(It.IsAny<HttpRequestMessage>()))
                .Callback<HttpRequestMessage>(async (req) => {
                    wasCalled = true;
                    var reqBody = await req.Content.ReadAsStringAsync();
                    Assert.Contains($"client_id={_fakeAuthState.ClientId}", reqBody);
                    Assert.Contains($"redirect_uri={_fakeAuthState.RedirectUrl}", reqBody);
                    Assert.Contains($"grant_type=authorization_code", reqBody);
                    Assert.Contains($"code={fakeCode}", reqBody);
                    Assert.Contains($"scope={_fakeAuthState.Scopes}", reqBody);
                    Assert.Contains($"code_verifier={_fakeAuthState.AuthCodeVerifier}", reqBody);
                })
                .Returns(Task.FromResult(new HttpResponseMessage(System.Net.HttpStatusCode.OK) { Content = new StringContent("{}")}));

            var resp = await _completeInteractiveAuthImpl.Run(testRequest, _mockLogger.Object);

            Assert.True(wasCalled);
        }

        [Fact]
        public async Task ProvidesAuthResponseInResponseBodyWhenAuthSuccessful()
        {
            var fakeCode = "54321";
            var testRequest = new MockHttpRequestBuilder()
                .WithQueryParam("state", "12345")
                .WithQueryParam("code", fakeCode)
                .Build();

            _mockAuthStatesRepository
                .Setup(o => o.GetAuthStateAsync(It.IsAny<string>()))
                .ReturnsAsync(_fakeAuthState);

            var mockTokenResponse = "{\"someRespProperty\":\"someRespPropertyValue\"}";
            _mockHttpClient
                .Setup(o => o.SendAsync(It.IsAny<HttpRequestMessage>()))
                .Returns(Task.FromResult(new HttpResponseMessage(System.Net.HttpStatusCode.OK) { Content = new StringContent(mockTokenResponse)}));

            var resp = await _completeInteractiveAuthImpl.Run(testRequest, _mockLogger.Object);
            var respContent = await resp.Content.ReadAsStringAsync();
            Assert.Contains(mockTokenResponse, respContent);
            Assert.Contains("Authenticated Successfully", respContent);
        }

        [Fact]
        public async Task ProvidesErrorHtmlResponseWhenAuthFails()
        {
            var fakeCode = "54321";
            var testRequest = new MockHttpRequestBuilder()
                .WithQueryParam("state", "12345")
                .WithQueryParam("code", fakeCode)
                .Build();

            _mockAuthStatesRepository
                .Setup(o => o.GetAuthStateAsync(It.IsAny<string>()))
                .ReturnsAsync(_fakeAuthState);

            _mockHttpClient
                .Setup(o => o.SendAsync(It.IsAny<HttpRequestMessage>()))
                .Returns(Task.FromResult(new HttpResponseMessage(System.Net.HttpStatusCode.BadRequest)));

            var resp = await _completeInteractiveAuthImpl.Run(testRequest, _mockLogger.Object);
            var respContent = await resp.Content.ReadAsStringAsync();
            Assert.Contains("Authentication Failed", respContent);
        }
    }
}
