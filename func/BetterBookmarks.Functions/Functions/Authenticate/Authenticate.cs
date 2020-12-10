using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using BetterBookmarks.Repositories;
using BetterBookmarks.Services;
using System.Collections.Generic;
using BetterBookmarks.Models;
using System.Linq;
using System.Net;
using System.Net.Http;

namespace BetterBookmarks.Functions
{
    public static class Authenticate
    {
        [FunctionName("Authenticate")]
        public static async Task<HttpResponseMessage> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, Route = null)] HttpRequest req,
            ILogger log)
        {
            if (!RequestRestrictionHelper.IsRequestMethodAllowed(req, new List<string>() { "get" }))
            {
                return new HttpResponseMessage(HttpStatusCode.MethodNotAllowed);
            }

            var impl = DiContainer.Instance.Resolve<AuthenticateImpl>();
            return await impl.Run(req, log);
        }
    }
}
