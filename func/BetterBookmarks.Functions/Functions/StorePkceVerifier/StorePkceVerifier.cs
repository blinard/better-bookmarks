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

namespace BetterBookmarks.Functions
{
    public static class StorePkceVerifier
    {
        [FunctionName("StorePkceVerifier")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, Route = null)] HttpRequest req,
            ILogger log)
        {
            if (!RequestRestrictionHelper.IsRequestMethodAllowed(req, new List<string>() { "post", "options" }))
            {
                return new Microsoft.AspNetCore.Mvc.StatusCodeResult(405);
            }

            if (CorsHelper.ShouldRespondOkAfterProcessingCors(req))
            {
                return new OkResult();
            }
            
            var impl = DiContainer.Instance.Resolve<StorePkceVerifierImpl>();
            return await impl.Run(req, log);
        }
    }
}
