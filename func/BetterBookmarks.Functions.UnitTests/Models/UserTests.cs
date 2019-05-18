using System.Collections.Generic;
using BetterBookmarks.Models;
using Xunit;

namespace BetterBookmarks.Functions.UnitTests.Models
{
    public class UserTests
    {
        private readonly User _user;
        
        public UserTests()
        {
            _user = new User();
        }

        [Fact]
        public void GetNonDeletedBookmarks_DoesNotReturnDeletedBookmarks()
        {
            _user.Bookmarks = new List<Bookmark>()
            {
                new Bookmark() {Key = "FakeKey", IsDeleted = false},
                new Bookmark() {Key = "DeletedKey", IsDeleted = true},
                new Bookmark() {Key = "AnotherFakeKey", IsDeleted = false}
            };

            var result = _user.GetNonDeletedBookmarks();
            Assert.NotNull(result);
            Assert.DoesNotContain(result, b => b.IsDeleted == true);
        }
        
        [Fact]
        public void GetNonDeletedBookmarks_ReturnsAllNonDeletedBookmarks()
        {
            _user.Bookmarks = new List<Bookmark>()
            {
                new Bookmark() {Key = "FakeKey", IsDeleted = false},
                new Bookmark() {Key = "DeletedKey", IsDeleted = true},
                new Bookmark() {Key = "AnotherFakeKey", IsDeleted = false}
            };
            
            var result = _user.GetNonDeletedBookmarks();
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
        }
        
        [Fact]
        public void GetNonDeletedBookmarks_ReturnsEmptyListForNoNonDeletedBookmarks()
        {
            _user.Bookmarks = new List<Bookmark>()
            {
                new Bookmark() {Key = "DeletedKey", IsDeleted = true}
            };
            
            var result = _user.GetNonDeletedBookmarks();
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}