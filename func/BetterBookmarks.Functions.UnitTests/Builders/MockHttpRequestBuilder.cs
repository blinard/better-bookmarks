using System.Collections.Generic;
using System.IO;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;
using Moq;

namespace BetterBookmarks.Functions.UnitTests.Builders
{
    public class MockHttpRequestBuilder
    {
        private readonly Dictionary<string, StringValues> headers;
        private string body = string.Empty;

        public MockHttpRequestBuilder()
        {
            headers = new Dictionary<string, StringValues>();
        }

        public MockHttpRequestBuilder WithHeader(string key, string value)
        {
            headers.Add(key, new StringValues(value));
            return this;
        }

        public MockHttpRequestBuilder HavingBody(string body)
        {
            this.body = body;
            return this;
        }

        public HttpRequest Build()
        {                        
            var mockHeaders = new Mock<IHeaderDictionary>();
            mockHeaders
                .Setup(o => o.ContainsKey(It.IsAny<string>()))
                .Returns<string>(k => headers.ContainsKey(k));
            mockHeaders
                .Setup(o => o[It.Is<string>(s => headers.ContainsKey(s))])
                .Returns<string>(k => headers[k]);

            var mockReq = new Mock<HttpRequest>();
            mockReq
                .SetupGet(o => o.Headers)
                .Returns(mockHeaders.Object);

            if (string.IsNullOrWhiteSpace(body))
                return mockReq.Object;

            mockReq
                .SetupGet(o => o.Body)
                .Returns(new MemoryStream(Encoding.UTF8.GetBytes(body)));

            return mockReq.Object;
        }
    }
}