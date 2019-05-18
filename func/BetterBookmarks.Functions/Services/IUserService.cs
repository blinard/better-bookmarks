using System.Threading.Tasks;
using BetterBookmarks.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace BetterBookmarks.Services
{
    public interface IUserService
    {
        Task<bool> IsUserAuthorizedAsync(HttpRequest req, ILogger log);
        Task<User> GetOrCreateUserAsync(HttpRequest req, ILogger log);
        Task SaveUserAsync(User user);        
    }
}