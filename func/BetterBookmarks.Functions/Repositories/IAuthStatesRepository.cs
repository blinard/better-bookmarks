using System.Threading.Tasks;
using BetterBookmarks.Models;

namespace BetterBookmarks.Repositories
{
    public interface IAuthStatesRepository
    {
        Task<AuthState> GetAuthStateAsync(string stateKey);
        Task SaveAuthStateAsync(AuthState pkceVerifier);
    }
}