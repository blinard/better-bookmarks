using Microsoft.Extensions.Configuration;

namespace BetterBookmarks.Service.Models.Configs
{
    public class DatabaseConfig : ConfigBase
    {
        public DatabaseConfig(IConfiguration config) : base(config)
        {
        }

        public string Endpoint
        { 
            get 
            {
                return GetConfigValue(nameof(DatabaseConfig), nameof(Endpoint));
            }
        }

        public string AuthKey
        { 
            get 
            {
                return GetConfigValue(nameof(DatabaseConfig), nameof(AuthKey));
            }
        }

        public string DatabaseName
        { 
            get 
            {
                return GetConfigValue(nameof(DatabaseConfig), nameof(DatabaseName));
            }
        }
        
        public string CollectionName
        { 
            get 
            {
                return GetConfigValue(nameof(DatabaseConfig), nameof(CollectionName));
            }
        }
    }
}