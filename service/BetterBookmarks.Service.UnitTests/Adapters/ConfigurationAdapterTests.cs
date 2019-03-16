using System.Collections.Generic;
using BetterBookmarks.Service.Adapters;
using BetterBookmarks.Service.Models.Configs;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace BetterBookmarks.Service.UnitTests.Adapters
{
    public class ConfigurationAdapterTests
    {
        private const string FakeEndpoint = "FakeEndpoint";
        private const string FakeAuthKey = "FakeAuthKey";
        private const string FakeDatabaseName = "FakeDatabaseName";
        private const string FakeCollectionName = "FakeCollectionName";
        private const string FakeAuthority = "FakeAuthority";
        private const string FakeAudience = "FakeAudience";
        private const string FakeOpenIdConnectEndpoint = "FakeOpenIdConnectEndpoint";
        
        private Mock<IConfiguration> _mockConfig;

        public ConfigurationAdapterTests()
        {
            _mockConfig = new Mock<IConfiguration>();
        }

        [Fact]
        public void HydratesDatabaseConfigUponConstruction()
        {
            _mockConfig.SetupGet(o => o[It.Is<string>(s => s == "DatabaseConfig:Endpoint")]).Returns(FakeEndpoint);
            _mockConfig.SetupGet(o => o[It.Is<string>(s => s == "DatabaseConfig:AuthKey")]).Returns(FakeAuthKey);
            _mockConfig.SetupGet(o => o[It.Is<string>(s => s == "DatabaseConfig:DatabaseName")]).Returns(FakeDatabaseName);
            _mockConfig.SetupGet(o => o[It.Is<string>(s => s == "DatabaseConfig:CollectionName")]).Returns(FakeCollectionName);

            var dbConfig = new DatabaseConfig(_mockConfig.Object);
            var authConfig = new AuthConfig(_mockConfig.Object);
            var configAdapter = new ConfigurationAdapter(dbConfig, authConfig);
            Assert.Equal(FakeEndpoint, configAdapter.DatabaseConfig.Endpoint);
            Assert.Equal(FakeAuthKey, configAdapter.DatabaseConfig.AuthKey);
            Assert.Equal(FakeDatabaseName, configAdapter.DatabaseConfig.DatabaseName);
            Assert.Equal(FakeCollectionName, configAdapter.DatabaseConfig.CollectionName);
        }

        [Fact]
        public void HydratesAuthConfigUponConstruction()
        {
            _mockConfig.SetupGet(o => o[It.Is<string>(s => s == "AuthConfig:Authority")]).Returns(FakeAuthority);
            _mockConfig.SetupGet(o => o[It.Is<string>(s => s == "AuthConfig:ValidAudience")]).Returns(FakeAudience);
            _mockConfig.SetupGet(o => o[It.Is<string>(s => s == "AuthConfig:OpenIdConnectEndpoint")]).Returns(FakeOpenIdConnectEndpoint);

            var dbConfig = new DatabaseConfig(_mockConfig.Object);
            var authConfig = new AuthConfig(_mockConfig.Object);
            var configAdapter = new ConfigurationAdapter(dbConfig, authConfig);
            Assert.Equal(FakeAuthority, configAdapter.AuthConfig.Authority);
            Assert.Equal(FakeAudience, configAdapter.AuthConfig.ValidAudience);
            Assert.Equal(FakeOpenIdConnectEndpoint, configAdapter.AuthConfig.OpenIdConnectEndpoint);
        }
    }
}