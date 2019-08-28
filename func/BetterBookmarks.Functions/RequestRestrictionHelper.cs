using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Http;

namespace BetterBookmarks
{
    public static class RequestRestrictionHelper
    {
        public static bool IsRequestMethodAllowed(HttpRequest req, IEnumerable<string> allowedMethods)
        {
            return allowedMethods.Any(am => am.Equals(req.Method, StringComparison.OrdinalIgnoreCase));
        }
    }
}