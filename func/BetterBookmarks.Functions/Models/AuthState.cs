using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace BetterBookmarks.Models 
{
    public class AuthState
    {
        public string id 
        {
            get { return StateKey; }
            set { StateKey = value; }
        }
        public string StateKey { get; set; }
        public string Type { get; set; }
        public string AuthCodeVerifier { get; set; }
        public string ClientId { get; set; }
        public string RedirectUrl { get; set; }
        public string Scopes { get; set; }

        public AuthState() 
        {
            Type = "authState";
        }
    }
}