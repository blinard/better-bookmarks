using Microsoft.Extensions.Configuration;

namespace BetterBookmarks.Service.Models.Configs
{
    public abstract class ConfigBase
    {
        private readonly IConfiguration _config;
        
        protected ConfigBase(IConfiguration config) {
            _config = config;
        }

        protected string GetConfigValue(string section, string key) 
        {
            return _config[$"{section}:{key}"];
        }
    }
}