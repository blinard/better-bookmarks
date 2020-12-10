namespace BetterBookmarks.Repositories
{
    public interface IApplicationSettingRepository
    {
        string DbEndpoint { get; }
        string DbAuthKey { get; }
        string DatabaseName { get; }
        string CollectionName { get; }
        string AuthStatesCollectionName { get; }
        string AuthIssuer { get; }
        string AuthAudience { get; }
    }
}