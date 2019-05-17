using System;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AzureFunctions.Security.Auth0;
using BetterBookmarks.Extensions;
using BetterBookmarks.Repositories;
using BetterBookmarks.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace BetterBookmarks.Functions
{
    public class BookmarkReader
    {
        private readonly IUserService _userService;

        public BookmarkReader(IUserService userService) 
        {
            _userService = userService;
        }

        [FunctionName("Read")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
            ILogger log)
        {
            if (! (await _userService.IsUserAuthorizedAsync(req, log)))
                return new UnauthorizedResult();

            try
            {
                log.LogInformation("User is authorized.");
                var user = await _userService.GetOrCreateUserAsync(req, log);
                return new OkObjectResult(user.GetNonDeletedBookmarks());
            }
            catch(Exception ex)
            {
                log.LogError(ex, $"Exception occurred: {ex}");
                return new StatusCodeResult(500);
            }
        }
    }
}