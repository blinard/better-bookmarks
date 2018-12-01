using BetterBookmarks.Service.Models.Configs;
using Microsoft.Extensions.Configuration;

namespace BetterBookmarks.Service
{
    public class ConfigurationAdapter : IConfigurationAdapter
    {
        private readonly IConfiguration _config;
        
        public ConfigurationAdapter(IConfiguration config)
        {
            _config = config;

            DatabaseConfig = HydrateConfigModel<DatabaseConfig>("DatabaseConfig");
        }

        public DatabaseConfig DatabaseConfig { get; private set; }

        private T HydrateConfigModel<T>(string sectionName) where T : new()
        {
            var configModel = new T();
            _config.GetSection(sectionName).Bind(configModel);
            return configModel;
        }
    }
}