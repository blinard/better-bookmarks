using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
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
        private readonly Mock<IAuthService> _authService;
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

            _authService = new Mock<IAuthService>();
            _authService
                .Setup(o => o.AuthenticateRequestAsync(It.IsAny<HttpRequest>(), It.IsAny<ILogger>()))
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
                .Setup(o => o.AuthenticateRequestAsync(It.IsAny<HttpRequest>(), It.IsAny<ILogger>()))
                .Throws<ApplicationException>();

            var result = await _userService.IsUserAuthorizedAsync(_validReq, _logger.Object);
            Assert.False(result);
        }

        [Fact]
        public async Task IsUserAuthorizedAsync_ReturnsFalseWhenUserIdClaimCannotBeFound()
        {
            _authService
                .Setup(o => o.AuthenticateRequestAsync(It.IsAny<HttpRequest>(), It.IsAny<ILogger>()))
                .ReturnsAsync(new ClaimsPrincipal());

            var result = await _userService.IsUserAuthorizedAsync(_validReq, _logger.Object);
            Assert.False(result);
        }

        [Fact]
        public async Task IsUserAuthorizedAsync_ReturnsTrueWhenTheUserIsAuthorized()
        {
            var claimsPrincipal = new ClaimsPrincipal();

            _authService
                .Setup(o => o.AuthenticateRequestAsync(It.IsAny<HttpRequest>(), It.IsAny<ILogger>()))
                .ReturnsAsync(claimsPrincipal);
            _authService
                .Setup(o => o.AcquireUniqueUserId(It.Is<ClaimsPrincipal>(cp => cp == claimsPrincipal)))
                .Returns("ValidUserId");


            var result = await _userService.IsUserAuthorizedAsync(_validReq, _logger.Object);
            Assert.True(result);
        }

        [Fact]
        public async Task GetOrCreateUserAsync_ThrowsExceptionIfUserIdClaimCannotBeFound()
        {
            _authService
                .Setup(o => o.AuthenticateRequestAsync(It.IsAny<HttpRequest>(), It.IsAny<ILogger>()))
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
                .Setup(o => o.AuthenticateRequestAsync(It.IsAny<HttpRequest>(), It.IsAny<ILogger>()))
                .Throws<ApplicationException>();

            await Assert.ThrowsAsync<ApplicationException>(async () => 
            {
                await _userService.GetOrCreateUserAsync(_validReq, _logger.Object);
            });
        }

        [Fact]
        public async Task GetOrCreateUserAsync_ReturnsDbUserIfFound()
        {
             var claimsPrincipal = new ClaimsPrincipal();

            _authService
                .Setup(o => o.AuthenticateRequestAsync(It.IsAny<HttpRequest>(), It.IsAny<ILogger>()))
                .ReturnsAsync(claimsPrincipal);
            _authService
                .Setup(o => o.AcquireUniqueUserId(It.Is<ClaimsPrincipal>(cp => cp == claimsPrincipal)))
                .Returns("ValidUserId");

           _userRepository
                .Setup(o => o.GetUserAsync(It.IsAny<string>()))
                .ReturnsAsync(_fakeUser);
            
            var result = await _userService.GetOrCreateUserAsync(_validReq, _logger.Object);
            Assert.Equal(_fakeUser, result);
        }

        [Fact]
        public async Task GetOrCreateUserAsync_CreatesNewUserIfDbUserNotFound()
        {
            var claimsPrincipal = new ClaimsPrincipal();

            _authService
                .Setup(o => o.AuthenticateRequestAsync(It.IsAny<HttpRequest>(), It.IsAny<ILogger>()))
                .ReturnsAsync(claimsPrincipal);
            _authService
                .Setup(o => o.AcquireUniqueUserId(It.Is<ClaimsPrincipal>(cp => cp == claimsPrincipal)))
                .Returns("ValidUserId");

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
    }
}