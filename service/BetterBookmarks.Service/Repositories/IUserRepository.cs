using System.Threading.Tasks;
using BetterBookmarks.Service.Models;

namespace BetterBookmarks.Service.Repositories
{
    public interface IUserRepository
    {
        Task<User> GetUserAsync(string userId);
        Task SaveUserAsync(User user);
    }
}