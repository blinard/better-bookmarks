using System;
using AzureFunctions.Security.Auth0;
using BetterBookmarks.Repositories;
using BetterBookmarks.Services;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;

[assembly: FunctionsStartup(typeof(BetterBookmarks.Startup))]

namespace BetterBookmarks
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddSingleton<IApplicationSettingRepository, ApplicationSettingRepository>();            
            builder.Services.AddSingleton(sp => 
            {
                var appSettings = sp.GetService<IApplicationSettingRepository>();
                return new Auth0ApiSettings()
                {
                    Issuer = appSettings.AuthIssuer,
                    Audience = appSettings.AuthAudience
                };
            });
            builder.Services.AddSingleton(sp => ConfigurationManagerFactory.GetConfigurationManager(sp.GetService<Auth0ApiSettings>()));
            builder.Services.AddSingleton<Lazy<IDocumentClient>>(sp => {
                var appSettings = sp.GetService<IApplicationSettingRepository>();
                return new Lazy<IDocumentClient>(() => {
                    return new DocumentClient(new Uri(appSettings.DbEndpoint), appSettings.DbAuthKey);
                    // TODO: Create DB and Collection if not exists?
                });
            });
            builder.Services.AddTransient<IAuthenticationService, AuthenticationService>();
            builder.Services.AddTransient<ISyncService, SyncService>();
            builder.Services.AddTransient<IUserService, UserService>();
            builder.Services.AddTransient<IUserRepository, UserRepository>();
        }
    }
}