using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Primitives;

namespace BetterBookmarks
{
    public static class CorsHelper
    {
        public const string OriginKey = "Origin";
        public const string AccessControlAllowOriginKey = "Access-Control-Allow-Origin";
        public const string AccessControlAllowMethodsKey = "Access-Control-Allow-Methods";
        public const string AccessControlAllowCredentialsKey = "Access-Control-Allow-Credentials";
        public const string AccessControlAllowHeadersKey = "Access-Control-Allow-Headers";

        public static List<string> AllowedOrigins = new List<string>() 
        {
            "https://functions.azure.com",
            "https://functions-staging.azure.com",
            "https://functions-next.azure.com",
            "chrome-extension://pefeencopjdpgkdkdpomklgfjkodmdhm"
        };

        public static bool ShouldRespondOkAfterProcessingCors(HttpRequest req)
        {
            var origins = req.Headers.GetCommaSeparatedValues(OriginKey);

            // If Origin header isn't present, don't add any Cors headers and respond ok
            // Assumption: All valid requests will have an Origin header
            if (origins == StringValues.Empty)
                return true;

            var origin = origins.FirstOrDefault();

            // If the provided Origin is invalid, don't add any Cors headers and respond ok
            if (string.IsNullOrWhiteSpace(origin))
                return true;

            // If the provided Origin is not in our list of allowed origins, don't add any Cors headers and respond ok
            if (!AllowedOrigins.Contains(origin.ToLower()))
                return true;

            // The provided Origin is valid and in our list of allowed origins so add our Cors headers
            req.HttpContext.Response.Headers.Add(AccessControlAllowCredentialsKey, true.ToString().ToLower());
            req.HttpContext.Response.Headers.Add(AccessControlAllowMethodsKey, "GET, POST, DELETE, OPTIONS");
            req.HttpContext.Response.Headers.Add(AccessControlAllowOriginKey, origin);
            req.HttpContext.Response.Headers.Add(AccessControlAllowHeadersKey, "Authorization, *");

            // If this is an OPTIONS request, just respond ok now.
            if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
                return true;

            // Otherwise, continue normal execution.
            return false;
        }
    }
}