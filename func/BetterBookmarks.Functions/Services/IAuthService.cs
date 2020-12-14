
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace BetterBookmarks.Services
{
    public interface IAuthService{

        Task<ClaimsPrincipal> AuthenticateRequestAsync(HttpRequest req, ILogger logger);
        string AcquireUniqueUserId(ClaimsPrincipal claimsPrincipal);
    }
}