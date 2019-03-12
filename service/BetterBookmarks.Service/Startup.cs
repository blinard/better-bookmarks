using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using BetterBookmarks.Service.Repositories;
using BetterBookmarks.Service.Services;
using BetterBookmarks.Service.Adapters;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace BetterBookmarks.Service
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }
        public ConfigurationAdapter ConfigAdapter { get; set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

            var configAdapter = new ConfigurationAdapter(Configuration);
            ConfigAdapter = configAdapter;
            services.AddSingleton<IConfigurationAdapter>(sp => configAdapter);
            services.AddSingleton<ISyncService, SyncService>();
            services.AddSingleton<Lazy<IDocumentClient>>(sp => 
                new Lazy<IDocumentClient>(() => {
                    return new DocumentClient(new Uri(configAdapter.DatabaseConfig.Endpoint), configAdapter.DatabaseConfig.AuthKey);
                    // TODO: Create DB and Collection if not exists?
                })
            );

            Console.WriteLine($"configAdapter.AuthConfig.OpenIdConnectEndpoint: {configAdapter.AuthConfig.OpenIdConnectEndpoint}");
            var openIdConfigMgr = new ConfigurationManager<OpenIdConnectConfiguration>(configAdapter.AuthConfig.OpenIdConnectEndpoint, new OpenIdConnectConfigurationRetriever());
            // Warning: Making this async call synchronous b/c we need the JsonWebKeySet keys before being able to
            //   configure the TokenValidationParams.
            var openIdConfig = openIdConfigMgr.GetConfigurationAsync(CancellationToken.None).GetAwaiter().GetResult();

            services.AddAuthentication(opts => 
            {
                opts.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                opts.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(opts => 
            {
                opts.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configAdapter.AuthConfig.Authority,
                    ValidAudience = configAdapter.AuthConfig.ValidAudience,
                    IssuerSigningKeys = openIdConfig.JsonWebKeySet.GetSigningKeys()
                };
            });

            services.AddSingleton<IUserRepository, UserRepository>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            // TODO: Add https back in
            // app.UseHttpsRedirection();
            app.UseCors(builder => builder
                .AllowAnyMethod()
                .WithHeaders("authorization", "content-type", "origin", "accept")
                .WithOrigins(ConfigAdapter.AuthConfig.AllowedOrigins.Split(','))
            );
            app.UseAuthentication();
            app.UseMvc();
        }
    }
}
