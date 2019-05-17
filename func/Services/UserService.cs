using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AzureFunctions.Security.Auth0;
using BetterBookmarks.Extensions;
using BetterBookmarks.Models;
using BetterBookmarks.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace BetterBookmarks.Services
{
    public class UserService : IUserService
    {
        private readonly IAuthenticationService _authService;
        private readonly IUserRepository _userRepository;

        public UserService(IAuthenticationService authService, IUserRepository userRepository)
        {
            _authService = authService;
            _userRepository = userRepository;
        }

        public async Task<bool> IsUserAuthorizedAsync(HttpRequest req, ILogger log)
        {
            try 
            {
                var claimPrincipal = await _authService.ValidateTokenAsync(req.GetAuthToken());
                var userIdClaim = claimPrincipal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
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
            var claimPrincipal = await _authService.ValidateTokenAsync(req.GetAuthToken());
            var userIdClaim = claimPrincipal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                throw new ArgumentException("NameIdentifier claim not found.");

            var user = await _userRepository.GetUserAsync(userIdClaim.Value);
            if (user == null) 
            {
                log.LogInformation($"User ({userIdClaim.Value}) not found. Creating a new user.");
                user = new User()
                {
                    Id = userIdClaim.Value,
                    UserId = userIdClaim.Value    
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