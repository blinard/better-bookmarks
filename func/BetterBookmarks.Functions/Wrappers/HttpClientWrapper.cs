using System.Threading.Tasks;
using System.Net.Http;

namespace BetterBookmarks.Wrappers
{
    public class HttpClientWrapper : IHttpClientWrapper
    {
        private HttpClient _httpClient;

        public HttpClientWrapper()
        {
            _httpClient = new HttpClient();
        }

        public async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request)
        {
            return await _httpClient.SendAsync(request);
        }
    }
}