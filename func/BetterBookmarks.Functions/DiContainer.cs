
using System;
using AzureFunctions.Security.Auth0;
using BetterBookmarks.Repositories;
using BetterBookmarks.Services;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using TinyIoC;

namespace BetterBookmarks
{
    public class DiContainer
    {
        private static Lazy<DiContainer> _instance = new Lazy<DiContainer>(() => new DiContainer());
        public static DiContainer Instance { get { return _instance.Value; }}

        private DiContainer()
        {
            Console.WriteLine("**** BB-FUNC STARTUP CONFIGURATION BEGIN ****");
            var container = TinyIoCContainer.Current;
            var appSettings = new ApplicationSettingRepository();
            container.Register<IApplicationSettingRepository>(appSettings);
            Console.WriteLine("**** BB-FUNC AppSettings Configured ****");

            var auth0Settings = new Auth0ApiSettings() {
                Issuer = appSettings.AuthIssuer,
                Audience = appSettings.AuthAudience
            };
            container.Register<Auth0ApiSettings>(auth0Settings);
            Console.WriteLine("**** BB-FUNC ApiSettings Configured ****");

            var authConfigMgr = ConfigurationManagerFactory.GetConfigurationManager(auth0Settings);
            container.Register<IConfigurationManager<OpenIdConnectConfiguration>>(authConfigMgr);
            Console.WriteLine("**** BB-FUNC ConfigManager Configured ****");

            container.Register<Lazy<IDocumentClient>>(new Lazy<IDocumentClient>(() => {
                return new DocumentClient(new Uri(appSettings.DbEndpoint), appSettings.DbAuthKey);
                // TODO: Create DB and Collection if not exists?
            }));
            Console.WriteLine("**** BB-FUNC Lazy DocumentClient Configured ****");

            container.Register<IAuthenticationService>((c, npo) => new AuthenticationService(auth0Settings, authConfigMgr));
            container.Register<ISyncService, SyncService>();
            container.Register<IUserRepository, UserRepository>();
            container.Register<IUserService, UserService>();
            Console.WriteLine("**** BB-FUNC STARTUP CONFIGURATION END ****");
        }

        public TObject Resolve<TObject>() where TObject : class
        {
            return TinyIoCContainer.Current.Resolve<TObject>();
        }
    }
}