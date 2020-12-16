using BetterBookmarks.Functions.UnitTests.Builders;
using BetterBookmarks.Wrappers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace BetterBookmarks.Functions.UnitTests.FunctionImpls
{
    public class RefreshAccessTokenImplTests
    {
        private readonly Mock<IHttpClientWrapper> _mockHttpClient;
        private readonly Mock<ILogger> _mockLogger;
        private readonly RefreshAccessTokenRequest _fakeRefreshAccessTokenRequest;

        private readonly RefreshAccessTokenImpl _refreshAccessTokenImpl;

        public RefreshAccessTokenImplTests()
        {
            _fakeRefreshAccessTokenRequest = new RefreshAccessTokenRequest()
            {
                ClientId = "FakeClientId",
                RedirectUrl = "FakeRedirectUrl",
                RefreshToken = "FakeRefreshToken",
                Scopes = "Fake Scopes"
            };

            _mockHttpClient = new Mock<IHttpClientWrapper>();
            _mockLogger = new Mock<ILogger>();

            _refreshAccessTokenImpl = new RefreshAccessTokenImpl(_mockHttpClient.Object);
        }

        [Fact]
        public async Task RequestsTokenWithExpectedParameters()
        {
            var testRequest = new MockHttpRequestBuilder()
                .HavingBody(JsonConvert.SerializeObject(_fakeRefreshAccessTokenRequest))
                .Build();

            var wasCalled = false;
            _mockHttpClient
                .Setup(o => o.SendAsync(It.IsAny<HttpRequestMessage>()))
                .Callback<HttpRequestMessage>(async (req) => {
                    wasCalled = true;
                    var reqBody = await req.Content.ReadAsStringAsync();
                    Assert.Contains($"client_id={_fakeRefreshAccessTokenRequest.ClientId}", reqBody);
                    Assert.Contains($"redirect_uri={_fakeRefreshAccessTokenRequest.RedirectUrl}", reqBody);
                    Assert.Contains($"grant_type=refresh_token", reqBody);
                    Assert.Contains($"refresh_token={_fakeRefreshAccessTokenRequest.RefreshToken}", reqBody);
                    Assert.Contains($"scope={_fakeRefreshAccessTokenRequest.Scopes}", reqBody);
                })
                .Returns(Task.FromResult(new HttpResponseMessage(System.Net.HttpStatusCode.OK) { Content = new StringContent("{}")}));

            var resp = await _refreshAccessTokenImpl.Run(testRequest, _mockLogger.Object);

            Assert.True(wasCalled);
        }

        [Fact]
        public async Task ForwardsTokenResponseAsItsResponse()
        {
            var testRequest = new MockHttpRequestBuilder()
                .HavingBody(JsonConvert.SerializeObject(_fakeRefreshAccessTokenRequest))
                .Build();

            var mockTokenResponse = "{\"someRespProperty\":\"someRespPropertyValue\"}";
            _mockHttpClient
                .Setup(o => o.SendAsync(It.IsAny<HttpRequestMessage>()))
                .Returns(Task.FromResult(new HttpResponseMessage(System.Net.HttpStatusCode.OK) { Content = new StringContent(mockTokenResponse)}));

            var resp = await _refreshAccessTokenImpl.Run(testRequest, _mockLogger.Object);
            
            Assert.Equal(mockTokenResponse, JsonConvert.SerializeObject(((JsonResult)resp).Value));
        }

        [Fact]
        public async Task LogsErrorForFailures()
        {
            var testRequest = new MockHttpRequestBuilder()
                .HavingBody(JsonConvert.SerializeObject(_fakeRefreshAccessTokenRequest))
                .Build();

            _mockHttpClient
                .Setup(o => o.SendAsync(It.IsAny<HttpRequestMessage>()))
                .Returns(Task.FromResult(new HttpResponseMessage(System.Net.HttpStatusCode.BadRequest)));

            _mockLogger
                .Setup(x => x.Log(
                    It.IsAny<LogLevel>(),
                    It.IsAny<EventId>(),
                    It.IsAny<It.IsAnyType>(),
                    It.IsAny<Exception>(),
                    (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()
                    )
                );

            try
            {
                var resp = await _refreshAccessTokenImpl.Run(testRequest, _mockLogger.Object);
            }
            catch(HttpRequestException)
            { 
                // Exception is expected. Validating logging in this test
            }

            _mockLogger
                .Verify(x => x.Log(
                    It.Is<LogLevel>(ll => ll == LogLevel.Error),
                    It.IsAny<EventId>(),
                    It.IsAny<It.IsAnyType>(),
                    It.Is<Exception>(ex => ex is HttpRequestException),
                    (Func<It.IsAnyType, Exception, string>)It.IsAny<object>()
                    ), Times.Once
                );
        }
    }
}
