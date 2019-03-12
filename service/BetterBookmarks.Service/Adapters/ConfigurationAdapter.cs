using BetterBookmarks.Service.Models.Configs;
using Microsoft.Extensions.Configuration;

namespace BetterBookmarks.Service.Adapters
{
    public class ConfigurationAdapter : IConfigurationAdapter
    {
        public ConfigurationAdapter(IConfiguration config)
        {
            DatabaseConfig = HydrateConfigModel<DatabaseConfig>("DatabaseConfig", config);
            AuthConfig = HydrateConfigModel<AuthConfig>("AuthConfig", config);
        }

        public DatabaseConfig DatabaseConfig { get; private set; }
        public AuthConfig AuthConfig { get; private set; }

        private T HydrateConfigModel<T>(string sectionName, IConfiguration config) where T : new()
        {
            var configModel = new T();

            foreach(var pi in typeof(T).GetProperties())
            {
                if (pi.GetSetMethod() == null)
                    continue;
                
                pi.SetValue(configModel, config[$"{sectionName}:{pi.Name}"]);
            }

            return configModel;
        }
    }
}