using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AzureFunctions.Security.Auth0;
using BetterBookmarks.Functions.UnitTests.Builders;
using BetterBookmarks.Models;
using BetterBookmarks.Repositories;
using BetterBookmarks.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace BetterBookmarks.Functions.UnitTests.Services
{
    public class UserServiceTests
    {
        private readonly UserService _userService;
        private readonly Mock<IAuthenticationService> _authService;
        private readonly Mock<IUserRepository> _userRepository;
        private readonly Mock<ILogger> _logger;
        private readonly MockHttpRequestBuilder _httpRequestBuilder;
        private readonly User _fakeUser;
        private readonly HttpRequest _validReq;

        public UserServiceTests() 
        {
            _fakeUser = new User()
            {
                UserId = "FakeUserId",
                Id = "FakeUserId"
            };

            _authService = new Mock<IAuthenticationService>();
            _authService
                .Setup(o => o.ValidateTokenAsync(It.IsAny<string>()))
                .ReturnsAsync(new ClaimsPrincipal());
            
            _userRepository = new Mock<IUserRepository>();
            _userRepository
                .Setup(o => o.GetUserAsync(It.IsAny<string>()))
                .ReturnsAsync(new User());
            _userRepository
                .Setup(o => o.SaveUserAsync(It.IsAny<User>()))
                .Returns(Task.CompletedTask);

            _logger = new Mock<ILogger>();
            _httpRequestBuilder = new MockHttpRequestBuilder();
            _validReq = _httpRequestBuilder
                .WithHeader("Authorization", "Bearer FakeToken")
                .Build();

            _userService = new UserService(_authService.Object, _userRepository.Object);
        }

        [Fact]
        public async Task IsUserAuthorizedAsync_ReturnsFalseWhenExceptionOccurs()
        {
            _authService
                .Setup(o => o.ValidateTokenAsync(It.IsAny<string>()))
                .Throws<ApplicationException>();

            var result = await _userService.IsUserAuthorizedAsync(_validReq, _logger.Object);
            Assert.False(result);
        }

        [Fact]
        public async Task IsUserAuthorizedAsync_ReturnsFalseWhenUserIdClaimCannotBeFound()
        {
            _authService
                .Setup(o => o.ValidateTokenAsync(It.IsAny<string>()))
                .ReturnsAsync(new ClaimsPrincipal() );

            var result = await _userService.IsUserAuthorizedAsync(_validReq, _logger.Object);
            Assert.False(result);
        }

        [Fact]
        public async Task IsUserAuthorizedAsync_ReturnsTrueWhenTheUserIsAuthorized()
        {
            var claimsPrincipal = GetValidClaimsPrincipal();

            _authService
                .Setup(o => o.ValidateTokenAsync(It.IsAny<string>()))
                .ReturnsAsync(claimsPrincipal);

            var result = await _userService.IsUserAuthorizedAsync(_validReq, _logger.Object);
            Assert.True(result);
        }

        [Fact]
        public async Task GetOrCreateUserAsync_ThrowsExceptionIfUserIdClaimCannotBeFound()
        {
            _authService
                .Setup(o => o.ValidateTokenAsync(It.IsAny<string>()))
                .ReturnsAsync(new ClaimsPrincipal());

            await Assert.ThrowsAsync<ArgumentException>(async () => 
            {
                await _userService.GetOrCreateUserAsync(_validReq, _logger.Object);
            });
        }

        [Fact]
        public async Task GetOrCreateUserAsync_BubblesUpExceptionIfAuthServiceFails()
        {
            _authService
                .Setup(o => o.ValidateTokenAsync(It.IsAny<string>()))
                .Throws<ApplicationException>();

            await Assert.ThrowsAsync<ApplicationException>(async () => 
            {
                await _userService.GetOrCreateUserAsync(_validReq, _logger.Object);
            });
        }

        [Fact]
        public async Task GetOrCreateUserAsync_ReturnsDbUserIfFound()
        {
             var claimsPrincipal = GetValidClaimsPrincipal();

            _authService
                .Setup(o => o.ValidateTokenAsync(It.IsAny<string>()))
                .ReturnsAsync(claimsPrincipal);

           _userRepository
                .Setup(o => o.GetUserAsync(It.IsAny<string>()))
                .ReturnsAsync(_fakeUser);
            
            var result = await _userService.GetOrCreateUserAsync(_validReq, _logger.Object);
            Assert.Equal(_fakeUser, result);
        }

        [Fact]
        public async Task GetOrCreateUserAsync_CreatesNewUserIfDbUserNotFound()
        {
            var claimsPrincipal = GetValidClaimsPrincipal();

            _authService
                .Setup(o => o.ValidateTokenAsync(It.IsAny<string>()))
                .ReturnsAsync(claimsPrincipal);

            _userRepository
                .Setup(o => o.GetUserAsync(It.IsAny<string>()))
                .ReturnsAsync((User) null);
            
            var result = await _userService.GetOrCreateUserAsync(_validReq, _logger.Object);
            Assert.NotNull(result);
        }

        [Fact]
        public async Task SaveUserAsync_DelegatesToUserRepository()
        {
            await _userService.SaveUserAsync(_fakeUser);
            _userRepository
                .Verify(o => o.SaveUserAsync(It.Is<User>(u => u == _fakeUser)), Times.Once);
        }

        private ClaimsPrincipal GetValidClaimsPrincipal()
        {
           var claims = new List<Claim>();
            claims.Add(new Claim(ClaimTypes.NameIdentifier, "FakeName"));

            var claimIdentities = new List<ClaimsIdentity>();
            claimIdentities.Add(new ClaimsIdentity(claims));

            return new ClaimsPrincipal(claimIdentities);
        }
    }
}