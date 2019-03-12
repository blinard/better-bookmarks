using System.Collections.Generic;
using BetterBookmarks.Service.Models;
using Xunit;

namespace BetterBookmarks.Service.UnitTests.Services
{
    public class SyncServiceTests
    {
        private readonly IList<Bookmark> _currentBookmarks;
        private readonly IList<Bookmark> _updatedBookmarks;

        public SyncServiceTests() {
            _currentBookmarks = new List<Bookmark>();
            _updatedBookmarks = new List<Bookmark>();
        }

        [Fact]
        public void SyncBookmarksHandlesAdditions()
        {
        }

        [Fact]
        public void SyncBookmarksHandlesDeletions()
        {
        }

        [Fact]
        public void SyncBookmarksHandlesUpdates()
        {
        }

        [Fact]
        public void SyncBookmarksResolvesUpdateConflictsCorrectly()
        {
        }

        [Fact]
        public void SyncBookmarksResolvesDeleteConflictsCorrectly()
        {
        }
    }
}