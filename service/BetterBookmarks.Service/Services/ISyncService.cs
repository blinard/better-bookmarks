using System;
using System.Collections.Generic;
using BetterBookmarks.Service.Models;

namespace BetterBookmarks.Service.Services
{
    public interface ISyncService
    {
        IList<Bookmark> SyncBookmarks(IList<Bookmark> currentBookmarks, IList<Bookmark> updatedBookmarks, DateTimeOffset? lastSyncDateTime);
    }
}