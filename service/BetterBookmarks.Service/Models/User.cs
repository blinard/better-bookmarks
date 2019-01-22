using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace BetterBookmarks.Service.Models 
{
    public class User
    {
        [JsonProperty("id")]
        public string Id { get; set; }
        public string UserId { get; set; }
        public User() 
        {
            Bookmarks = new List<Bookmark>();
        }

        public List<Bookmark> Bookmarks { get; set; }

        public List<Bookmark> GetNonDeletedBookmarks()
        {
            return Bookmarks.Where(b => !b.IsDeleted).ToList();
        }
    }
}