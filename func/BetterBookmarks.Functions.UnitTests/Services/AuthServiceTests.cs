

using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using BetterBookmarks.Functions.UnitTests.Builders;
using BetterBookmarks.Repositories;
using BetterBookmarks.Services;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Moq;
using Xunit;

namespace BetterBookmarks.Functions.UnitTests.Services
{
    public class AuthServiceTests
    {
        private readonly Mock<IApplicationSettingRepository> _mockAppSettings;
        private readonly Mock<IConfigurationManager<OpenIdConnectConfiguration>> _mockConfigManager;
        private readonly Mock<ISecurityTokenValidator> _mockTokenValidator;
        private readonly Mock<ILogger> _mockLogger;
        private readonly AuthService _authService;
        
        public AuthServiceTests()
        {
            _mockAppSettings = new Mock<IApplicationSettingRepository>();
            _mockConfigManager = new Mock<IConfigurationManager<OpenIdConnectConfiguration>>();
            _mockTokenValidator = new Mock<ISecurityTokenValidator>();
            _mockLogger = new Mock<ILogger>();

            _authService = new AuthService(_mockAppSettings.Object, _mockConfigManager.Object, _mockTokenValidator.Object);
        }

        [Fact]
        public void AcquireUniqueUserId_ReturnsUserIdInExpectedFormat()
        {
            var claimsPrincipal = new ClaimsPrincipalBuilder()
                .WithClaim(AuthService.TenantIdClaimsType, "FakeTenantId")
                .WithClaim(AuthService.ObjectIdentifierClaimsType, "FakeObjectId")
                .Build();

            var userId = _authService.AcquireUniqueUserId(claimsPrincipal);

            Assert.Equal("aad|FakeTenantId|FakeObjectId", userId);
        }

        [Fact]
        public void AcquireUniqueUserId_ThrowsExceptionIfTenantIdCannotBeFound()
        {
            var claimsPrincipal = new ClaimsPrincipalBuilder()
                .WithClaim(AuthService.ObjectIdentifierClaimsType, "FakeObjectId")
                .Build();

            Assert.Throws<ArgumentException>(() => {
                var userId = _authService.AcquireUniqueUserId(claimsPrincipal);
            });
        }

        [Fact]
        public void AcquireUniqueUserId_ThrowsExceptionIfObjectIdCannotBeFound()
        {
            var claimsPrincipal = new ClaimsPrincipalBuilder()
                .WithClaim(AuthService.TenantIdClaimsType, "FakeTenantId")
                .Build();

            Assert.Throws<ArgumentException>(() => {
                var userId = _authService.AcquireUniqueUserId(claimsPrincipal);
            });
        }

        [Fact]
        public async Task AuthenticateRequestAsync_ValidatesTheProvidedAccessToken()
        {
            var req = new MockHttpRequestBuilder()
                .WithHeader("Authorization", "Bearer FakeToken")
                .Build();

            _mockAppSettings
                .SetupGet(o => o.AuthValidIssuers).Returns("FakeIssuer");

            _mockConfigManager
                .Setup(o => o.GetConfigurationAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(new OpenIdConnectConfiguration());

            SecurityToken unused = new JwtSecurityToken();
            _mockTokenValidator
                .Setup(o => o.ValidateToken(It.Is<string>(s => s == "FakeToken"), It.IsAny<TokenValidationParameters>(), out unused))
                .Returns(new ClaimsPrincipal());

            var result = await _authService.AuthenticateRequestAsync(req, _mockLogger.Object);

            _mockTokenValidator
                .Verify(o => o.ValidateToken(It.Is<string>(s => s == "FakeToken"), It.IsAny<TokenValidationParameters>(), out unused), Times.Once);
        }

        [Fact]
        public async Task AuthenticateRequestAsync_ValidatesTheAccessTokenWithTheExpectedParameters()
        {
            var req = new MockHttpRequestBuilder()
                .WithHeader("Authorization", "Bearer FakeToken")
                .Build();

            _mockAppSettings
                .SetupGet(o => o.AuthValidIssuers).Returns("FakeIssuer1");
            _mockAppSettings
                .SetupGet(o => o.AuthClientId).Returns("FakeClientId");

            var oidcConfig = new OpenIdConnectConfiguration();
            _mockConfigManager
                .Setup(o => o.GetConfigurationAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(oidcConfig);

            SecurityToken unused = new JwtSecurityToken();
            _mockTokenValidator
                .Setup(o => o.ValidateToken(It.IsAny<string>(), It.IsAny<TokenValidationParameters>(), out unused))
                .Returns(new ClaimsPrincipal());

            var result = await _authService.AuthenticateRequestAsync(req, _mockLogger.Object);

            _mockTokenValidator
                .Verify(o => o.ValidateToken(It.IsAny<string>(), It.Is<TokenValidationParameters>(vp => 
                    vp.ValidAudiences.Contains("FakeClientId") && vp.ValidAudiences.Contains("api://FakeClientId") &&
                    vp.IssuerSigningKeys == oidcConfig.SigningKeys && vp.ValidIssuers.First() == "FakeIssuer1" && vp.ValidateLifetime == true
                    ), out unused), Times.Once);
        }
    }
}