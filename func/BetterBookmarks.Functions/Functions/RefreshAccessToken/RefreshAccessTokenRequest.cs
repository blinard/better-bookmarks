
namespace BetterBookmarks.Functions 
{
    public class RefreshAccessTokenRequest
    {
        public string RefreshToken { get; set; }
        public string ClientId { get; set; }
        public string RedirectUrl { get; set; }
        public string Scopes { get; set; }
    }
}