using System;

namespace BetterBookmarks.Repositories
{
    public class ApplicationSettingRepository : IApplicationSettingRepository
    {
        public string DatabaseName => Environment.GetEnvironmentVariable("DatabaseName");

        public string CollectionName => Environment.GetEnvironmentVariable("CollectionName");
    }
}