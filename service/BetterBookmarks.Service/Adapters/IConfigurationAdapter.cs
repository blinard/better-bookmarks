using BetterBookmarks.Service.Models.Configs;

namespace BetterBookmarks.Service.Adapters
{
    public interface IConfigurationAdapter
    {
        DatabaseConfig DatabaseConfig { get; }
    }
}