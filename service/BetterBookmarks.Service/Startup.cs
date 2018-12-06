using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BetterBookmarks.Service.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BetterBookmarks.Service
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

            var configAdapter = new ConfigurationAdapter(Configuration);
            services.AddSingleton<IConfigurationAdapter>((sp) => configAdapter);

            services.AddAuthentication(opts => 
            {
                opts.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                opts.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(opts => 
            {
                opts.Authority = configAdapter.AuthConfig.Authority;
                opts.Audience = configAdapter.AuthConfig.ValidAudience;
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
                .WithOrigins("chrome-extension://dngcliokcmmkbjipofmblfebphgdlnan")
            );
            app.UseAuthentication();
            app.UseMvc();
        }
    }
}
