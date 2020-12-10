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
        public string VerifierCode {get; set; }

        public AuthState() 
        {
            Type = "authState";
        }
    }
}