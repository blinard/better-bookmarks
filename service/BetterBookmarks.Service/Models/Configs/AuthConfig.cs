namespace BetterBookmarks.Service.Models.Configs
{
    public class AuthConfig
    {
        public string Authority { get; set; }
        public string ValidAudience { get; set; }
        public string OpenIdConnectEndpoint { get; set; }
    }
}