using System;
using System.Collections.Generic;
using BetterBookmarks.Models;

namespace BetterBookmarks.Services
{
    public interface ISyncService
    {
        IList<Bookmark> SyncBookmarks(IList<Bookmark> currentBookmarks, IList<Bookmark> updatedBookmarks, DateTimeOffset? lastSyncDateTime);
    }
}