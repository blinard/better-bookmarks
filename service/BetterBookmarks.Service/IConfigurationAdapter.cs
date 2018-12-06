using BetterBookmarks.Service.Models.Configs;

namespace BetterBookmarks.Service
{
    public interface IConfigurationAdapter
    {
        DatabaseConfig DatabaseConfig { get; }
    }
}