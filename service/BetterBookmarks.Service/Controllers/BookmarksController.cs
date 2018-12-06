using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using BetterBookmarks.Service.Models;
using BetterBookmarks.Service.Repositories;
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

        public BookmarksController(IUserRepository userRepository) 
        {
            _userRepository = userRepository;
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
            return await _userRepository.GetUserAsync(userIdClaim.Value);
        }
    }
}