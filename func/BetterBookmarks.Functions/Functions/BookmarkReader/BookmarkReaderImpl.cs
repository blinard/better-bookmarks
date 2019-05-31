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
    public class BookmarkReaderImpl
    {
        private readonly IUserService _userService;
        private readonly IApplicationSettingRepository _appSettings;

        public BookmarkReaderImpl(IUserService userService, IApplicationSettingRepository appSettings)
        {
            _userService = userService;
            _appSettings = appSettings;
        }

        public async Task<IActionResult> Run(HttpRequest req, ILogger logger)
        {
            logger.LogInformation("DbEndpoint={0}, DbAuthKey={1}", _appSettings.DbEndpoint, _appSettings.DbAuthKey);

            if (! (await _userService.IsUserAuthorizedAsync(req, logger)))
                return new UnauthorizedResult();

            try
            {
                logger.LogInformation("User is authorized.");
                var user = await _userService.GetOrCreateUserAsync(req, logger);
                return new OkObjectResult(user.GetNonDeletedBookmarks());
            }
            catch(Exception ex)
            {
                logger.LogError(ex, $"Exception occurred: {ex}");
                return new StatusCodeResult(500);
            }
        }
    }
}