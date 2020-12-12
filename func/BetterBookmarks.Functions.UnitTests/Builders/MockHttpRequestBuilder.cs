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
        private readonly Dictionary<string, StringValues> _headers;
        private readonly Dictionary<string, StringValues> _queryParams;
        private string _body = string.Empty;

        public MockHttpRequestBuilder()
        {
            _headers = new Dictionary<string, StringValues>();
            _queryParams = new Dictionary<string, StringValues>();
        }

        public MockHttpRequestBuilder WithQueryParam(string key, string value)
        {
            _queryParams.Add(key, new StringValues(value));
            return this;
        }

        public MockHttpRequestBuilder WithHeader(string key, string value)
        {
            _headers.Add(key, new StringValues(value));
            return this;
        }

        public MockHttpRequestBuilder HavingBody(string body)
        {
            this._body = body;
            return this;
        }

        public HttpRequest Build()
        {                        
            // Headers
            var mockHeaders = new Mock<IHeaderDictionary>();
            mockHeaders
                .Setup(o => o.ContainsKey(It.IsAny<string>()))
                .Returns<string>(k => _headers.ContainsKey(k));
            mockHeaders
                .Setup(o => o[It.Is<string>(s => _headers.ContainsKey(s))])
                .Returns<string>(k => _headers[k]);

            var mockReq = new Mock<HttpRequest>();
            mockReq
                .SetupGet(o => o.Headers)
                .Returns(mockHeaders.Object);

            // Query Params
            var mockParams = new Mock<IQueryCollection>();
            mockParams
                .Setup(o => o[It.Is<string>(s => _queryParams.ContainsKey(s))])
                .Returns<string>(k => _queryParams[k]);

            mockReq
                .SetupGet(o => o.Query)
                .Returns(mockParams.Object);

            // Body
            if (!string.IsNullOrWhiteSpace(_body))
            {
                mockReq
                    .SetupGet(o => o.Body)
                    .Returns(new MemoryStream(Encoding.UTF8.GetBytes(_body)));
            }

            if (_queryParams.Count > 0)
            {

                
            }

            return mockReq.Object;
        }
    }
}