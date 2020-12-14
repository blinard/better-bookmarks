using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;

namespace BetterBookmarks.Functions
{
    public static class BookmarkReader
    {
        [FunctionName("Read")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req, 
            ILogger log)
        {
            if (!RequestRestrictionHelper.IsRequestMethodAllowed(req, new List<string>() { "get", "options" }))
            {
                return new Microsoft.AspNetCore.Mvc.StatusCodeResult(405);
            }

            if (CorsHelper.ShouldRespondOkAfterProcessingCors(req))
            {
                return new OkResult();
            }
            
            var impl = DiContainer.Instance.Resolve<BookmarkReaderImpl>();
            return await impl.Run(req, log);
        }
    }
}