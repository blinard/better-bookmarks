
using System;
using System.IdentityModel.Tokens.Jwt;
using BetterBookmarks.Repositories;
using BetterBookmarks.Services;
using BetterBookmarks.Wrappers;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
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

            container.Register<Lazy<IDocumentClient>>(new Lazy<IDocumentClient>(() => {
                return new DocumentClient(new Uri(appSettings.DbEndpoint), appSettings.DbAuthKey);
                // TODO: Create DB and Collection if not exists?
            }));
            Console.WriteLine("**** BB-FUNC Lazy DocumentClient Configured ****");

            var configManager =
                new ConfigurationManager<OpenIdConnectConfiguration>(
                    $"{appSettings.AuthAuthority}/.well-known/openid-configuration",
                    new OpenIdConnectConfigurationRetriever());
            container.Register<IConfigurationManager<OpenIdConnectConfiguration>>(configManager);
            Console.WriteLine("**** BB-FUNC OpenIdConnect ConfigurationManager Configured ****");

            container.Register<ISecurityTokenValidator, JwtSecurityTokenHandler>();
            container.Register<IAuthService, AuthService>();
            container.Register<ISyncService, SyncService>();
            container.Register<IUserRepository, UserRepository>();
            container.Register<IUserService, UserService>();
            container.Register<IAuthStatesRepository, AuthStatesRepository>();
            container.Register<IHttpClientWrapper, HttpClientWrapper>().AsSingleton();
            Console.WriteLine("**** BB-FUNC STARTUP CONFIGURATION END ****");
        }

        public TObject Resolve<TObject>() where TObject : class
        {
            return TinyIoCContainer.Current.Resolve<TObject>();
        }
    }
}