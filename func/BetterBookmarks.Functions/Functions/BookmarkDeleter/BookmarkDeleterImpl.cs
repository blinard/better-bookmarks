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

namespace BetterBookmarks.Functions
{
    public class BookmarkDeleterImpl
    {
        private readonly IUserService _userService;

        public BookmarkDeleterImpl(IUserService userService)
        {
            _userService = userService;
        }

        public async Task<IActionResult> Run(HttpRequest req, ILogger log)
        {
            if (! (await _userService.IsUserAuthorizedAsync(req, log)))
                return new UnauthorizedResult();

            if (!req.Query.ContainsKey("bookmarkKey"))
                return new BadRequestResult();

            var bookmarkKey = req.Query["bookmarkKey"];
            var user = await _userService.GetOrCreateUserAsync(req, log);
            var bookmark = user.Bookmarks.FirstOrDefault(bk => string.Equals(bk.Key, bookmarkKey, StringComparison.OrdinalIgnoreCase));
            if (bookmark == null) 
                return new NotFoundResult();

            bookmark.IsDeleted = true;
            await _userService.SaveUserAsync(user);
            return new OkResult();
        }
    }
}
