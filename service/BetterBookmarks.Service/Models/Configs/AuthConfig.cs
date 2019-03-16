using Microsoft.Extensions.Configuration;

namespace BetterBookmarks.Service.Models.Configs
{
    public class AuthConfig : ConfigBase
    {
        public AuthConfig(IConfiguration config) : base(config)
        {
        }

        public string Authority 
        { 
            get 
            {
                return GetConfigValue(nameof(AuthConfig), nameof(Authority));
            }
        }
        public string ValidAudience
        { 
            get 
            {
                return GetConfigValue(nameof(AuthConfig), nameof(ValidAudience));
            }
        }
        
        public string OpenIdConnectEndpoint
        { 
            get 
            {
                return GetConfigValue(nameof(AuthConfig), nameof(OpenIdConnectEndpoint));
            }
        }

        public string AllowedOrigins
        { 
            get 
            {
                return GetConfigValue(nameof(AuthConfig), nameof(AllowedOrigins));
            }
        }

    }
}