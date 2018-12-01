using System.Collections.Generic;
using Newtonsoft.Json;

namespace BetterBookmarks.Service.Models 
{
    public class User
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public User() 
        {
            Bookmarks = new List<Bookmark>();
        }

        public List<Bookmark> Bookmarks { get; set; }
    }
}