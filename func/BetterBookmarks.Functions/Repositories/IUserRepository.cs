using System.Threading.Tasks;
using BetterBookmarks.Models;

namespace BetterBookmarks.Repositories
{
    public interface IUserRepository
    {
        Task<User> GetUserAsync(string userId);
        Task SaveUserAsync(User user);
    }
}