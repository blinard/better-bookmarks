using System;
using BetterBookmarks.Service.Models;
using Xunit;

namespace BetterBookmarks.Service.UnitTests.Models
{
    public class BookmarkTests
    {
        private readonly Bookmark _bookmarkUnderTest;
        private readonly Bookmark _sampleBookmark;

        public BookmarkTests()
        {
            _bookmarkUnderTest = new Bookmark();
            _sampleBookmark = new Bookmark()
            {
                Key = "FakeKey",
                IsDeleted = true,
                Url = "FakeUrl",
                LastModified = "2018-12-06T05:43:42.024Z"
            };
        }

        [Fact]
        public void CopyValuesFromCopiesValues()
        {
            _bookmarkUnderTest.CopyValuesFrom(_sampleBookmark);
            Assert.Equal(_sampleBookmark.Key, _bookmarkUnderTest.Key);
            Assert.Equal(_sampleBookmark.IsDeleted, _bookmarkUnderTest.IsDeleted);
            Assert.Equal(_sampleBookmark.Url, _bookmarkUnderTest.Url);
            Assert.Equal(_sampleBookmark.LastModified, _bookmarkUnderTest.LastModified);
        }

        [Fact]
        public void CopyValuesFromHandlesNulls()
        {
            Assert.Throws<ArgumentNullException>(() =>
            {
                _bookmarkUnderTest.CopyValuesFrom(null);
            });
        }

        [Fact]
        public void LastModifiedDateParsesLastModifiedProperty()
        {
            _bookmarkUnderTest.LastModified = "2018-12-06T05:43:42.024Z";
            Assert.NotNull(_bookmarkUnderTest.LastModifiedDate);
            Assert.Equal(2018, _bookmarkUnderTest.LastModifiedDate.Value.Year);
            Assert.Equal(12, _bookmarkUnderTest.LastModifiedDate.Value.Month);
            Assert.Equal(6, _bookmarkUnderTest.LastModifiedDate.Value.Day);
            Assert.Equal(5, _bookmarkUnderTest.LastModifiedDate.Value.Hour);
        }

        [Fact]
        public void LastModifiedDateReturnsNullForUnparsableProperty()
        {
            _bookmarkUnderTest.LastModified = string.Empty;
            Assert.Null(_bookmarkUnderTest.LastModifiedDate);
        }
    }
}