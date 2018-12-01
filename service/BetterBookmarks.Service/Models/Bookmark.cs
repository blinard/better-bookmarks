using System.Collections.Generic;

namespace BetterBookmarks.Service.Models 
{
    public class Bookmark
    {
        public Bookmark() 
        {
            Tags = new List<string>();
        }

        public string Key { get; set; }
        public string Url { get; set; }
        public List<string> Tags { get; set; }
        public string LastModified { get; set; }
    }
}