using System.Threading.Tasks;
using System.Net.Http;

namespace BetterBookmarks.Wrappers
{
    public interface IHttpClientWrapper
    {
        Task<HttpResponseMessage> SendAsync(HttpRequestMessage request);
    }
}