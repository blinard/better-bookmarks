using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using BetterBookmarks.Extensions;
using BetterBookmarks.Models;
using BetterBookmarks.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace BetterBookmarks.Services
{
    public class UserService : IUserService
    {
        private readonly IAuthService _authService;
        private readonly IUserRepository _userRepository;

        public UserService(IAuthService authService, IUserRepository userRepository)
        {
            _authService = authService;
            _userRepository = userRepository;
        }

        public async Task<bool> IsUserAuthorizedAsync(HttpRequest req, ILogger log)
        {
            try 
            {
                var claimsPrincipal = await _authService.AuthenticateRequestAsync(req, log);
                if (claimsPrincipal == null)
                    return false;

                var userId = _authService.AcquireUniqueUserId(claimsPrincipal);
                if (string.IsNullOrWhiteSpace(userId))
                    return false;

                return true;
            }
            catch(Exception ex)
            {
                log.LogError(ex, "Exception occurred while checking user authorization. Responding not authorized.");
                return false;
            }
        }

        public async Task<User> GetOrCreateUserAsync(HttpRequest req, ILogger log)
        {
            var claimsPrincipal = await _authService.AuthenticateRequestAsync(req, log);
            if (claimsPrincipal == null)
                throw new ArgumentException("ClaimsPrincipal not found.");

            var userId = _authService.AcquireUniqueUserId(claimsPrincipal);
            if (string.IsNullOrWhiteSpace(userId))
                throw new ArgumentException("userId could not be found in ClaimsPrincipal");

            var user = await _userRepository.GetUserAsync(userId);
            if (user == null)
            {
                log.LogInformation($"User ({userId}) not found. Creating a new user.");
                user = new User()
                {
                    Id = userId,
                    UserId = userId
                };
            }

            return user;
        }

        public async Task SaveUserAsync(User user)
        {
            await _userRepository.SaveUserAsync(user);
        }
    }
}