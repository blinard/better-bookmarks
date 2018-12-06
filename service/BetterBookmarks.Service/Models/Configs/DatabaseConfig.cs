namespace BetterBookmarks.Service.Models.Configs
{
    public class DatabaseConfig
    {
        public string Endpoint { get; set; }
        public string AuthKey { get; set; } // TODO: Move this into Local Dev Secret Storage
        public string DatabaseName { get; set; }
        public string CollectionName { get; set; }
    }
}