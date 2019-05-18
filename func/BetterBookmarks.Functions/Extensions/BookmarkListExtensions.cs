using System;
using System.Collections.Generic;
using System.Linq;
using BetterBookmarks.Models;

namespace BetterBookmarks.Extensions
{
    public static class BookmarkListExtensions
    {
        public static Bookmark GetByBookmarkKey(this List<Bookmark> bookmarks, string bookmarkKey)
        {
            return bookmarks.FirstOrDefault(b => b.Key.Equals(bookmarkKey, StringComparison.OrdinalIgnoreCase));
        }
    }
}