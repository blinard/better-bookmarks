using System.Collections.Generic;
using BetterBookmarks.Extensions;
using BetterBookmarks.Models;
using Xunit;

namespace BetterBookmarks.Functions.UnitTests.Extensions
{
    public class BookmarkListExtensionTests
    {
        private const string FakeKey = "FakeKey";
        private readonly List<Bookmark> _bookmarksList;
        
        public BookmarkListExtensionTests()
        {
            _bookmarksList = new List<Bookmark>()
            {
                new Bookmark() { Key = FakeKey },
                new Bookmark() { Key = "AnotherFakeKey" }
            };
        }
        
        [Fact]
        public void GetByBookmarkKeyIsCaseInsensitive()
        {
            var bookmark = _bookmarksList.GetByBookmarkKey("fakekey");
            Assert.NotNull(bookmark);
            Assert.Equal(FakeKey, bookmark.Key);
        }
    }
}