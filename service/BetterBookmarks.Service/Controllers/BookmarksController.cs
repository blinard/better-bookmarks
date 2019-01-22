using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using BetterBookmarks.Service.Models;
using BetterBookmarks.Service.Repositories;
using BetterBookmarks.Service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BetterBookmarks.Service.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    [Authorize]
    public class BookmarksController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ISyncService _syncService;

        public BookmarksController(IUserRepository userRepository, ISyncService syncService) 
        {
            _userRepository = userRepository;
            _syncService = syncService;
        }

        [HttpPost]
        public async Task<List<Bookmark>> Sync([FromBody] List<Bookmark> bookmarks)
        {
            // TODO: Need to handle scenario where multiple clients sync under the same account?
            var user = await GetUserFromRequestAsync();

            user.Bookmarks = _syncService.SyncBookmarks(user.Bookmarks, bookmarks, null).ToList();

            await _userRepository.SaveUserAsync(user);
            return user.GetNonDeletedBookmarks();
        }

        [HttpPost]
        public async Task<List<Bookmark>> Create([FromBody] Bookmark bookmark)
        {
            var user = await GetUserFromRequestAsync();
            user.Bookmarks.Add(bookmark);

            await _userRepository.SaveUserAsync(user);
            return user.GetNonDeletedBookmarks();
        }

        [HttpGet] 
        [Route("api/bookmarks")]
        public async Task<List<Bookmark>> Read()
        {
            var user = await GetUserFromRequestAsync();
            return user.GetNonDeletedBookmarks();
        }

        // Some networks block http PUT and DELETE. So using POST for caution.
        [HttpPost]
        public async Task<ActionResult<List<Bookmark>>> Update([FromBody] Bookmark bookmark)
        {
            var user = await GetUserFromRequestAsync();
            var bookmarkToUpdate = user.Bookmarks.FirstOrDefault(b => b.Key.Equals(bookmark.Key, StringComparison.OrdinalIgnoreCase));
            if (bookmarkToUpdate == null)
                return NotFound();

            bookmarkToUpdate.Url = bookmark.Url;
            bookmarkToUpdate.Tags = bookmark.Tags;
            bookmarkToUpdate.LastModified = DateTimeOffset.UtcNow.ToString("O");

            await _userRepository.SaveUserAsync(user);
            return user.GetNonDeletedBookmarks();
        }

        // Some networks block http PUT and DELETE. So using POST for caution.
        [HttpPost]
        public async Task<ActionResult<List<Bookmark>>> Delete([FromBody] string bookmarkKey)
        {
            var user = await GetUserFromRequestAsync();
            var bookmarkToDelete = user.Bookmarks.FirstOrDefault(b => b.Key.Equals(bookmarkKey, StringComparison.OrdinalIgnoreCase));
            if (bookmarkToDelete == null)
                return NotFound();

            bookmarkToDelete.IsDeleted = true;
            bookmarkToDelete.LastModified = DateTimeOffset.UtcNow.ToString("O");
            await _userRepository.SaveUserAsync(user);
            return user.GetNonDeletedBookmarks();
        }

        private async Task<User> GetUserFromRequestAsync()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

            // Get Bookmarks for User from Cosmos DB
            var user = await _userRepository.GetUserAsync(userIdClaim.Value);
            if (user == null) 
            {
                user = new User()
                {
                    Id = userIdClaim.Value,
                    UserId = userIdClaim.Value    
                };
            }

            return user;
        }
    }
}