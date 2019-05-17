using System;
using Microsoft.AspNetCore.Http;

namespace BetterBookmarks.Extensions
{
    public static class HttpRequestExtensions
    {
        private const string AuthorizationHeaderKey = "Authorization";
        public static string GetAuthToken(this HttpRequest req)
        {
            if (!req.Headers.ContainsKey(AuthorizationHeaderKey))
                throw new ArgumentOutOfRangeException(AuthorizationHeaderKey);

            var authorizationValue = req.Headers[AuthorizationHeaderKey].ToString();
            if (!authorizationValue.StartsWith("Bearer "))
                throw new ArgumentOutOfRangeException("Authorization Header Schema");
            
            return authorizationValue.Substring(7).Trim();
        }
    }
}