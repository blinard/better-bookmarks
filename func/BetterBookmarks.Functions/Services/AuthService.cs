
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using BetterBookmarks.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace BetterBookmarks.Services
{
    public class AuthService : IAuthService
    {
        public const string TenantIdClaimsType = "http://schemas.microsoft.com/identity/claims/tenantid";
        public const string ObjectIdentifierClaimsType = "http://schemas.microsoft.com/identity/claims/objectidentifier";

        private readonly IApplicationSettingRepository _appSettings;
        private readonly IConfigurationManager<OpenIdConnectConfiguration> _configManager;
        private readonly ISecurityTokenValidator _tokenValidator;

        public AuthService(IApplicationSettingRepository appSettings, IConfigurationManager<OpenIdConnectConfiguration> configManager, ISecurityTokenValidator tokenValidator)
        {
            _appSettings = appSettings;
            _configManager = configManager;
            _tokenValidator = tokenValidator;
        }

        public string AcquireUniqueUserId(ClaimsPrincipal claimsPrincipal)
        {
            var claims = claimsPrincipal.Claims.ToList();
            var tid = claims.FirstOrDefault(c => c.Type == TenantIdClaimsType)?.Value; // TenantId - Consistent AAD internal id for the tenant
            var oid = claims.FirstOrDefault(c => c.Type == ObjectIdentifierClaimsType)?.Value; // Object Id - Consistent AAD internal id for the user within the tenant.
            
            if (string.IsNullOrWhiteSpace(tid) || string.IsNullOrWhiteSpace(oid))
            {
                throw new ArgumentException("tenantid and/or objectid claim is not found. Cannot generate UniqueUserId");
            }

            return $"aad|{tid}|{oid}";
        }

        public async Task<ClaimsPrincipal> AuthenticateRequestAsync(HttpRequest req, ILogger logger)
        {
            var accessToken = GetAccessToken(req);

            // Debugging purposes only, set this to false for production
            Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = false;

            var config = await _configManager.GetConfigurationAsync(CancellationToken.None);

            // Initialize the token validation parameters
            var clientId = _appSettings.AuthClientId;
            var audience = $"api://{clientId}";
            var validIssuers = _appSettings.AuthValidIssuers.Split(",");
            var validationParameters = new TokenValidationParameters
            {
                // App Id URI and AppId of this service application are both valid audiences.
                ValidAudiences = new[] { audience, clientId },

                // Support Azure AD V1 and V2 endpoints.
                ValidIssuers = validIssuers,
                IssuerSigningKeys = config.SigningKeys,
                ValidateLifetime = true
            };

            var claimsPrincipal = _tokenValidator.ValidateToken(accessToken, validationParameters, out var securityToken);
            return claimsPrincipal;
        }

        private static string GetAccessToken(HttpRequest req)
        {
            var authorizationHeader = req.Headers?["Authorization"];
            string[] parts = authorizationHeader?.ToString().Split(null) ?? new string[0];
            if (parts.Length == 2 && parts[0].Equals("Bearer"))
                return parts[1];
            return null;
        }
    }
}