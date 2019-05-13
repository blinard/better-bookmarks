using System;
using System.Collections.Generic;
using System.Linq;
using BetterBookmarks.Extensions;
using BetterBookmarks.Models;

namespace BetterBookmarks.Services
{
    public class SyncService : ISyncService
    {
        // Add conditions
        /*
            1. In updatedBookmarks, not marked as isDeleted and not in currentBookmarks
            2. In updatedBookmarks, not marked as isDeleted and in currentBookmarks (marked as isDeleted)
                Will need to reactivate (isDeleted = false) and update url/tags/lastmodified in this scenario
        */

        // Update conditions
        /*
            1. In both currentBookmarks and updatedBookmarks (based on key) with different value for url or tags.
            2. LastModifiedDate of updatedBookmarks must be > LastModifiedDate of currentBookmarks
            3.  
        */

        // Delete conditions
        /*
            1. In updatedBookmarks. Marked as isDeleted = true in updatedBookmarks
        */

        // TODO: Make sure bookmarks are gzipped/compressed in the post as well as the response.
        public IList<Bookmark> SyncBookmarks(IList<Bookmark> currentBookmarks, IList<Bookmark> updatedBookmarks, DateTimeOffset? lastSyncDateTime)
        {
            var resultBookmarks = new List<Bookmark>(currentBookmarks);
            
            foreach(var providedBookmark in updatedBookmarks)
            {
                var existingBookmark = resultBookmarks.GetByBookmarkKey(providedBookmark.Key);
                if (existingBookmark == null)
                {
                    // Since we're only ever doing soft deletes, this is automatically an add.
                    resultBookmarks.Add(providedBookmark);
                    continue;
                }

                // Edge case - existingBookmarks should never have a null LastModifiedDate.
                // If they do...assume the incoming changes are most recent
                if (existingBookmark.LastModifiedDate == null)
                {
                    existingBookmark.CopyValuesFrom(providedBookmark);
                    continue;
                }

                // If incoming bookmark has null lastModifiedDate we're going to ignore it (if it exists in the history already that is)
                if (providedBookmark.LastModifiedDate == null)
                    continue;

                // providedBookmark can only be an update (or delete) if its lastModifiedDate is > existingBookmark's lastModifiedDate
                if (providedBookmark.LastModifiedDate > existingBookmark.LastModifiedDate)
                {
                    existingBookmark.CopyValuesFrom(providedBookmark);
                }
            }

            return resultBookmarks;
        }
    }
}