
using System.Collections.Generic;
using System.Security.Claims;

namespace BetterBookmarks.Functions.UnitTests.Builders
{
    public class ClaimsPrincipalBuilder
    {
        private readonly List<Claim> _claims;

        public ClaimsPrincipalBuilder()
        {
            _claims = new List<Claim>();
        }

        public ClaimsPrincipalBuilder WithClaim(string claimType, string claimValue)
        {
            _claims.Add(new Claim(claimType, claimValue));
            return this;
        }

        public ClaimsPrincipal Build()
        {
            var claimIdentities = new List<ClaimsIdentity>();
            claimIdentities.Add(new ClaimsIdentity(_claims));

            return new ClaimsPrincipal(claimIdentities);
        }
    }
}