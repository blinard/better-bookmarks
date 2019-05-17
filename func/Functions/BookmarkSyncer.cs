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
using System.Collections.Generic;
using BetterBookmarks.Models;
using System.Linq;

namespace BetterBookmarks.Functions
{
    public class BookmarkSyncer
    {
        private readonly IUserService _userService;
        private readonly ISyncService _syncService;

        public BookmarkSyncer(IUserService userService, ISyncService syncService)
        {
            _userService = userService;
            _syncService = syncService;
        }

        [FunctionName("Sync")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            if (! (await _userService.IsUserAuthorizedAsync(req, log)))
                return new UnauthorizedResult();

            // TODO: Need to handle scenario where multiple clients sync under the same account?
            var user = await _userService.GetOrCreateUserAsync(req, log);
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var bookmarks = JsonConvert.DeserializeObject<List<Bookmark>>(requestBody);

            user.Bookmarks = _syncService.SyncBookmarks(user.Bookmarks, bookmarks, null).ToList();

            await _userService.SaveUserAsync(user);
            return new OkObjectResult(user.GetNonDeletedBookmarks());
        }
    }
}
