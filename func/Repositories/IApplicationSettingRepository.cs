namespace BetterBookmarks.Repositories
{
    public interface IApplicationSettingRepository
    {
        string DatabaseName { get; }
        string CollectionName { get; }
    }
}