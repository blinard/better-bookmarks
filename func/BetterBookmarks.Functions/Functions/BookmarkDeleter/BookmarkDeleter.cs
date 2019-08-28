using System;
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
using System.Linq;
using System.Collections.Generic;

namespace BetterBookmarks.Functions
{
    public static class BookmarkDeleter
    {
        [FunctionName("Delete")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = null)] HttpRequest req,
            ILogger log)
        {
            if (!RequestRestrictionHelper.IsRequestMethodAllowed(req, new List<string>() { "delete", "options" }))
            {
                return new Microsoft.AspNetCore.Mvc.StatusCodeResult(405);
            }

            if (CorsHelper.ShouldRespondOkAfterProcessingCors(req))
            {
                return new OkResult();
            }
            
            var impl = DiContainer.Instance.Resolve<BookmarkDeleterImpl>();
            return await impl.Run(req, log);
        }
    }
}
