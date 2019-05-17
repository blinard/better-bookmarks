using System;

namespace BetterBookmarks.Repositories
{
    public class ApplicationSettingRepository : IApplicationSettingRepository
    {
        public string DbEndpoint => Environment.GetEnvironmentVariable("DbEndpoint");

        public string DbAuthKey => Environment.GetEnvironmentVariable("DbAuthKey");

        public string DatabaseName => Environment.GetEnvironmentVariable("DatabaseName");

        public string CollectionName => Environment.GetEnvironmentVariable("CollectionName");

        public string AuthIssuer => Environment.GetEnvironmentVariable("AuthIssuer");

        public string AuthAudience => Environment.GetEnvironmentVariable("AuthAudience");
    }
}