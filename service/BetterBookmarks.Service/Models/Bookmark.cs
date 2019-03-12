using System;
using System.Collections.Generic;
using Newtonsoft.Json;

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
        public bool IsDeleted { get; set; }
        public List<string> Tags { get; set; }
        public string LastModified { get; set; }

        public void CopyValuesFrom(Bookmark incomingBookmark)
        {
            if (incomingBookmark == null)
            {
                throw new ArgumentNullException(nameof(incomingBookmark));
            }
            
            Key = incomingBookmark.Key.Trim();
            Url = incomingBookmark.Url;
            IsDeleted = incomingBookmark.IsDeleted;
            Tags = incomingBookmark.Tags;
            LastModified = incomingBookmark.LastModified;
        }

        [JsonIgnore()]
        public DateTimeOffset? LastModifiedDate 
        { 
            get
            {
                if (string.IsNullOrWhiteSpace(this.LastModified))
                    return null;
                
                if(DateTimeOffset.TryParse(this.LastModified, out var lastModifiedDate))
                {
                    return lastModifiedDate;
                }

                return null;
            }
        }
    }
}