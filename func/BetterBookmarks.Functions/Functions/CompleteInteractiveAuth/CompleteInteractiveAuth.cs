using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;

namespace BetterBookmarks.Functions
{
    public static class CompleteInteractiveAuth
    {
        [FunctionName("CompleteInteractiveAuth")]
        public static async Task<HttpResponseMessage> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, Route = null)] HttpRequest req,
            ILogger log)
        {
            if (!RequestRestrictionHelper.IsRequestMethodAllowed(req, new List<string>() { "get" }))
            {
                return new HttpResponseMessage(HttpStatusCode.MethodNotAllowed);
            }

            var impl = DiContainer.Instance.Resolve<CompleteInteractiveAuthImpl>();
            return await impl.Run(req, log);
        }
    }
}
