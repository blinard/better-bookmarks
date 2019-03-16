using System;
using System.Threading.Tasks;
using BetterBookmarks.Service.Adapters;
using BetterBookmarks.Service.Repositories;
using BetterBookmarks.Service.Services;
using Microsoft.AspNetCore.Mvc;

namespace BetterBookmarks.Service.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ISyncService _syncService;
        private readonly IConfigurationAdapter _configAdapter;

        public HealthController(IUserRepository userRepository, ISyncService syncService, IConfigurationAdapter configAdapter)
        {
            _userRepository = userRepository;
            _syncService = syncService;
            _configAdapter = configAdapter;
        }

        public ActionResult Ready()
        {
            if (_userRepository == null || _syncService == null || _configAdapter == null) {
                return new StatusCodeResult(500);
            }

            if (string.IsNullOrEmpty(_configAdapter.DatabaseConfig.Endpoint) || !Uri.TryCreate(_configAdapter.DatabaseConfig.Endpoint, UriKind.Absolute, out var uri))
            {
                return new StatusCodeResult(501);
            }

            if (string.IsNullOrEmpty(_configAdapter.DatabaseConfig.AuthKey)) {
                return new StatusCodeResult(503);
            }

            return new OkResult();
        }
    }
}