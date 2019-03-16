using BetterBookmarks.Service.Models.Configs;
using Microsoft.Extensions.Configuration;

namespace BetterBookmarks.Service.Adapters
{
    public class ConfigurationAdapter : IConfigurationAdapter
    {
        public ConfigurationAdapter(DatabaseConfig databaseConfig, AuthConfig authConfig)
        {
            DatabaseConfig = databaseConfig;
            AuthConfig = authConfig;
        }

        public DatabaseConfig DatabaseConfig { get; private set; }
        public AuthConfig AuthConfig { get; private set; }
    }
}